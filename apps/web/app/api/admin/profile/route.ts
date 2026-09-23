import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/profile
 * Returns the ADMIN user with their AdminProfile, live counts, and live activity feed.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const emailParam = searchParams.get('email');
    const roleParam = searchParams.get('role');

    // Query specific user by email if requested, otherwise fallback to role param, then ADMIN or SUPER_ADMIN
    let adminUser = null;
    if (emailParam) {
      adminUser = await prisma.user.findFirst({
        where: { email: emailParam },
        include: { adminProfile: true }
      });
    }

    if (!adminUser && roleParam) {
      const targetRole = (roleParam.toUpperCase() === 'SUPERADMIN' || roleParam.toUpperCase() === 'SUPER_ADMIN') ? 'SUPER_ADMIN' : 'ADMIN';
      adminUser = await prisma.user.findFirst({
        where: { role: targetRole },
        include: { adminProfile: true }
      });
    }

    if (!adminUser) {
      adminUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
        include: { adminProfile: true }
      });
    }

    if (!adminUser) {
      adminUser = await prisma.user.findFirst({
        where: { role: 'SUPER_ADMIN' },
        include: { adminProfile: true }
      });
    }

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin user not found in database.' }, { status: 404 });
    }

    // Auto-create AdminProfile if not yet generated
    if (!adminUser.adminProfile) {
      try {
        const code = `EMP-ADM-${adminUser.id.replace(/-/g, '').slice(0, 4).toUpperCase()}`;
        const newProfile = await prisma.adminProfile.create({
          data: {
            userId: adminUser.id,
            employeeCode: code,
            position: 'Clinic Administrator & Practice Manager'
          }
        });
        adminUser.adminProfile = newProfile;
      } catch (e) {
        console.warn('Could not auto-create AdminProfile record:', e);
      }
    }

    // Fetch live metrics in parallel
    const [
      appointmentCount,
      petCount,
      telemedicineCount,
      inventoryCount
    ] = await Promise.all([
      prisma.appointment.count({ where: { isArchived: false } }).catch(() => 0),
      prisma.pet.count({ where: { isArchived: false } }).catch(() => 0),
      prisma.telemedicine.count().catch(() => 0),
      prisma.product.count({ where: { isArchived: false } }).catch(() => 0),
    ]);

    // Fetch live recent clinic events to power the Activity Feed dynamically
    const [recentAppointments, recentPets, recentProducts, recentPayments] = await Promise.all([
      prisma.appointment.findMany({
        where: { isArchived: false },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: {
          pet: { select: { petName: true, breed: true } },
          user: { select: { fullName: true } }
        }
      }).catch(() => []),
      prisma.pet.findMany({
        where: { isArchived: false },
        orderBy: { createdAt: 'desc' },
        take: 2,
        select: { id: true, petName: true, breed: true, species: true, verificationStatus: true, createdAt: true }
      }).catch(() => []),
      prisma.product.findMany({
        where: { isArchived: false },
        orderBy: { updatedAt: 'desc' },
        take: 2,
        select: { id: true, productName: true, stockQuantity: true, updatedAt: true }
      }).catch(() => []),
      prisma.payment.findMany({
        orderBy: { createdAt: 'desc' },
        take: 2,
        select: { id: true, paymentAmount: true, paymentStatus: true, referenceNumber: true, createdAt: true }
      }).catch(() => [])
    ]);

    const recentActivity: Array<{
      id: string;
      type: string;
      title: string;
      description: string;
      timestamp: string;
      category: string;
      icon: string;
      badgeColor: string;
      iconColor: string;
    }> = [];

    recentAppointments.forEach((apt) => {
      recentActivity.push({
        id: `apt-${apt.id}`,
        type: 'APPOINTMENT',
        title: `Appointment ${apt.status.toLowerCase()}`,
        description: `${apt.purpose || 'Checkup'} for ${apt.pet?.petName || 'Patient'} (${apt.user?.fullName || 'Client'})`,
        timestamp: apt.createdAt.toISOString(),
        category: 'Appointment Roster',
        icon: 'fa-calendar-check',
        badgeColor: '#EBF8FF',
        iconColor: '#3182CE'
      });
    });

    recentPets.forEach((pet) => {
      recentActivity.push({
        id: `pet-${pet.id}`,
        type: 'PET_RECORD',
        title: pet.verificationStatus === 'VERIFIED' ? 'Verified Pet Medical Record' : 'New Patient Registered',
        description: `Patient record updated for ${pet.petName} (${pet.breed || pet.species || 'Companion'})`,
        timestamp: pet.createdAt.toISOString(),
        category: 'In-Clinic Records',
        icon: 'fa-paw',
        badgeColor: '#F0FFF4',
        iconColor: '#2E5E3E'
      });
    });

    recentProducts.forEach((prod) => {
      recentActivity.push({
        id: `prod-${prod.id}`,
        type: 'INVENTORY',
        title: 'Inventory Stock Audited',
        description: `Logged batch item ${prod.productName} in clinic pharmacy (${prod.stockQuantity} in stock)`,
        timestamp: prod.updatedAt.toISOString(),
        category: 'Inventory Audit',
        icon: 'fa-boxes',
        badgeColor: '#FEF3C7',
        iconColor: '#D97706'
      });
    });

    recentPayments.forEach((pay) => {
      recentActivity.push({
        id: `pay-${pay.id}`,
        type: 'BILLING',
        title: 'Generated Consultation Invoice',
        description: `Processed payment of ₱${pay.paymentAmount.toLocaleString()} • Ref: ${pay.referenceNumber || pay.id.slice(0, 8)}`,
        timestamp: pay.createdAt.toISOString(),
        category: 'Billing Suite',
        icon: 'fa-receipt',
        badgeColor: '#F3E8FF',
        iconColor: '#805AD5'
      });
    });

    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      id: adminUser.id,
      fullName: adminUser.fullName,
      email: adminUser.email,
      phoneNumber: adminUser.phoneNumber || '',
      address: adminUser.address || '',
      recoveryPhone: adminUser.recoveryPhone || '',
      profileImage: adminUser.profileImage || null,
      createdAt: adminUser.createdAt.toISOString(),
      twoFactorEnabled: adminUser.twoFactorEnabled,
      language: adminUser.language,
      role: adminUser.role,
      staffId: adminUser.adminProfile?.employeeCode || `EMP-ADM-${adminUser.id.replace(/-/g, '').slice(0, 4).toUpperCase()}`,
      position: adminUser.adminProfile?.position || 'Clinic Administrator & Practice Manager',
      metrics: {
        appointments: appointmentCount,
        patients: petCount,
        telemedicine: telemedicineCount,
        inventory: inventoryCount,
      },
      recentActivity: recentActivity.slice(0, 6)
    });
  } catch (error: any) {
    console.error('[GET /api/admin/profile] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch admin profile', 
      details: error?.message || String(error) 
    }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/profile
 * Updates admin contact details, position, profile image, 2FA, and password.
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    // Identify which admin user to update
    const targetEmail = body.targetEmail || body.email;
    let adminUser = null;

    if (targetEmail) {
      adminUser = await prisma.user.findFirst({
        where: { email: targetEmail },
        select: { id: true, password: true, adminProfile: true }
      });
    }

    if (!adminUser && body.role) {
      const targetRole = (body.role.toUpperCase() === 'SUPERADMIN' || body.role.toUpperCase() === 'SUPER_ADMIN') ? 'SUPER_ADMIN' : 'ADMIN';
      adminUser = await prisma.user.findFirst({
        where: { role: targetRole },
        select: { id: true, password: true, adminProfile: true }
      });
    }

    if (!adminUser) {
      adminUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
        select: { id: true, password: true, adminProfile: true }
      });
    }

    if (!adminUser) {
      adminUser = await prisma.user.findFirst({
        where: { role: 'SUPER_ADMIN' },
        select: { id: true, password: true, adminProfile: true }
      });
    }

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin user not found in database.' }, { status: 404 });
    }

    // Build user update payload
    const userUpdate: Record<string, unknown> = {};
    if (body.fullName !== undefined) userUpdate.fullName = body.fullName;
    if (body.email !== undefined && body.email !== '') userUpdate.email = body.email;
    if (body.phoneNumber !== undefined) userUpdate.phoneNumber = body.phoneNumber;
    if (body.address !== undefined) userUpdate.address = body.address;
    if (body.recoveryPhone !== undefined) userUpdate.recoveryPhone = body.recoveryPhone;
    if (body.twoFactorEnabled !== undefined) userUpdate.twoFactorEnabled = body.twoFactorEnabled;
    if (body.profileImage !== undefined) userUpdate.profileImage = body.profileImage;

    // Password change validation
    if (body.newPassword) {
      if (!body.currentPassword) {
        return NextResponse.json({ error: 'Current password is required to change password.' }, { status: 400 });
      }
      const isMatch = await bcrypt.compare(body.currentPassword, adminUser.password);
      if (!isMatch) {
        return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 });
      }
      userUpdate.password = await bcrypt.hash(body.newPassword, 10);
    }

    // Execute database updates in transaction
    await prisma.$transaction(async (tx) => {
      if (Object.keys(userUpdate).length > 0) {
        await tx.user.update({
          where: { id: adminUser.id },
          data: userUpdate
        });
      }

      if (body.position !== undefined) {
        if (adminUser.adminProfile) {
          await tx.adminProfile.update({
            where: { userId: adminUser.id },
            data: { position: body.position }
          });
        } else {
          const code = `EMP-ADM-${adminUser.id.replace(/-/g, '').slice(0, 4).toUpperCase()}`;
          await tx.adminProfile.create({
            data: {
              userId: adminUser.id,
              employeeCode: code,
              position: body.position
            }
          });
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Admin profile updated successfully.' 
    });
  } catch (error: any) {
    console.error('[PATCH /api/admin/profile] Error:', error);
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Email is already in use by another account.' }, { status: 409 });
    }
    return NextResponse.json({ 
      error: 'Failed to update admin profile.', 
      details: error?.message || String(error) 
    }, { status: 500 });
  }
}
