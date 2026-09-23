import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// Server-side cache and deduplication to avoid Prisma connection pool exhaustion
let serverCacheData: any = null;
let lastCacheTimestamp = 0;
let inFlightRequest: Promise<any> | null = null;

function getBillingFilePath(): string {
  const candidates: string[] = [
    path.join(process.cwd(), 'billing.json'),
    path.join(process.cwd(), 'apps', 'web', 'billing.json'),
  ];
  const found = candidates.find((p) => fs.existsSync(p));
  return found || candidates[0] || '';
}

async function fetchDashboardAggregates() {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  // Batch 1: Key core metrics (run in controlled parallel batch)
  const [
    todayAppointments,
    totalPets,
    pendingConsultations
  ] = await Promise.all([
    // Today's active appointments
    prisma.appointment.count({
      where: {
        appointmentDate: { gte: todayStart, lt: todayEnd },
        isArchived: false,
        status: { in: ['CONFIRMED', 'COMPLETED', 'PAID'] },
      },
    }).catch(() => 0),

    // Total non-archived pets
    prisma.pet.count({ where: { isArchived: false } }).catch(() => 0),

    // Pending telemedicine consultations
    prisma.appointment.count({
      where: {
        type: 'telemedicine',
        status: { in: ['PENDING', 'CONFIRMED', 'PAID'] },
        isArchived: false,
      },
    }).catch(() => 0),
  ]);

  // Batch 2: Action item indicators (run in second controlled batch)
  const [
    lowStockProducts,
    unverifiedPets,
    pendingAppointments,
    cancelRequests,
    recentFeedback
  ] = await Promise.all([
    // Low-stock products (threshold <= 10 items remaining)
    prisma.product.findMany({
      where: { isArchived: false, stockQuantity: { lte: 10 } },
      select: { id: true, productName: true, stockQuantity: true },
      orderBy: { stockQuantity: 'asc' },
      take: 4,
    }).catch(() => []),

    // Unverified pet medical records
    prisma.pet.count({
      where: { verificationStatus: 'PENDING', isArchived: false },
    }).catch(() => 0),

    // In-clinic appointments pending confirmation
    prisma.appointment.count({
      where: { status: 'PENDING', isArchived: false },
    }).catch(() => 0),

    // Cancelled appointments
    prisma.appointment.count({
      where: { status: 'CANCELLED', isArchived: false },
    }).catch(() => 0),

    // Real submitted feedback (latest 5)
    prisma.feedback.findMany({
      orderBy: { submittedAt: 'desc' },
      take: 5,
      include: { user: { select: { fullName: true } } },
    }).catch(() => []),
  ]);

  // Read billing data from billing.json
  const billingFilePath = getBillingFilePath();
  let weekRevenueData: number[] = [0, 0, 0, 0, 0, 0, 0];
  const dayLabels: string[] = [];
  let pendingInvoicesCount = 0;

  try {
    if (billingFilePath && fs.existsSync(billingFilePath)) {
      const raw = JSON.parse(fs.readFileSync(billingFilePath, 'utf-8'));
      const invoices = Array.isArray(raw) ? raw : [];

      pendingInvoicesCount = invoices.filter(
        (inv: any) => inv.status === 'pending' || inv.status === 'unpaid'
      ).length;

      const paidInvoices = invoices.filter((inv: any) => inv.status === 'paid');

      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dayStr = d.toISOString().split('T')[0];
        dayLabels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
        const dayTotal = paidInvoices
          .filter((inv: any) => inv.date === dayStr)
          .reduce((sum: number, inv: any) => sum + (Number(inv.totalAmount) || 0), 0);
        weekRevenueData[6 - i] = dayTotal;
      }
    } else {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        dayLabels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
      }
    }
  } catch {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dayLabels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
    }
  }

  const todayRevenue = weekRevenueData[6] ?? 0;

  // ─── Build Live Action Required Alerts ─────────────────────────────
  const alerts: Array<{ id: number; type: string; text: string; icon: string; link?: string }> = [];
  let alertId = 1;

  // 1. Low stock products (e.g. Pedigree)
  lowStockProducts.forEach((p) => {
    alerts.push({
      id: alertId++,
      type: 'warning',
      text: `${p.productName.trim()} low stock (${p.stockQuantity} left in clinic)`,
      icon: 'fas fa-exclamation-triangle',
      link: '/admin/inventory',
    });
  });

  // 2. Pending invoices from billing
  if (pendingInvoicesCount > 0) {
    alerts.push({
      id: alertId++,
      type: 'action',
      text: `${pendingInvoicesCount} billing invoice${pendingInvoicesCount !== 1 ? 's' : ''} awaiting payment / verification`,
      icon: 'fas fa-file-invoice-dollar',
      link: '/admin/billing',
    });
  }

  // 3. Unverified pet medical records
  if (unverifiedPets > 0) {
    alerts.push({
      id: alertId++,
      type: 'action',
      text: `${unverifiedPets} pet record${unverifiedPets !== 1 ? 's' : ''} awaiting clinic verification`,
      icon: 'fas fa-paw',
      link: '/admin/records',
    });
  }

  // 4. Pending appointment bookings
  if (pendingAppointments > 0) {
    alerts.push({
      id: alertId++,
      type: 'info',
      text: `${pendingAppointments} appointment${pendingAppointments !== 1 ? 's' : ''} awaiting confirmation`,
      icon: 'fas fa-calendar-check',
      link: '/admin/appointment',
    });
  }

  // 5. Cancellations
  if (cancelRequests > 0) {
    alerts.push({
      id: alertId++,
      type: 'info',
      text: `${cancelRequests} appointment${cancelRequests !== 1 ? 's' : ''} cancelled`,
      icon: 'fas fa-times-circle',
      link: '/admin/appointment',
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: 1,
      type: 'info',
      text: 'All clear — no immediate action items',
      icon: 'fas fa-check-circle',
    });
  }

  // ─── Format Live Feedback ──────────────────────────────────────────
  const formattedFeedback = recentFeedback.map((f) => {
    let category = 'General';
    let cleanComment = f.comments || '';
    const match = cleanComment.match(/^\[(.*?)\]\s*(.*)/);
    if (match) {
      category = match[1] || 'General';
      cleanComment = match[2] || '';
    }
    return {
      id: f.id,
      rating: f.rating,
      category,
      comment: cleanComment,
      author: f.user?.fullName || 'Client',
      date: f.submittedAt ? f.submittedAt.toISOString() : new Date().toISOString(),
    };
  });

  return {
    stats: {
      todayAppointments,
      totalPets,
      pendingConsultations,
      todayRevenue,
    },
    alerts,
    recentFeedback: formattedFeedback,
    revenueTrend: {
      labels: dayLabels,
      data: weekRevenueData,
    },
  };
}

export async function GET() {
  try {
    const now = Date.now();
    // Return cached response if within 8 seconds
    if (serverCacheData && now - lastCacheTimestamp < 8000) {
      return NextResponse.json(serverCacheData);
    }

    // Deduplicate in-flight fetch
    if (inFlightRequest) {
      const result = await inFlightRequest;
      return NextResponse.json(result);
    }

    inFlightRequest = fetchDashboardAggregates();
    const result = await inFlightRequest;
    inFlightRequest = null;

    serverCacheData = result;
    lastCacheTimestamp = Date.now();

    return NextResponse.json(result);
  } catch (error: any) {
    inFlightRequest = null;
    console.error('[Dashboard API] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
