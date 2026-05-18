import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dbAppointments = await prisma.appointment.findMany({
      include: {
        user: true,
        pet: true,
        payments: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedAppointments = dbAppointments.map((app) => {
      const payment = app.payments?.[0]; // Assuming one payment per appointment for simplicity
      return {
        id: app.id,
        owner: app.user?.fullName || 'Unknown',
        contact: app.user?.phoneNumber || 'N/A',
        pet: app.pet?.petName || 'Unknown',
        species: app.pet?.species || 'N/A',
        breed: app.pet?.breed || 'N/A',
        date: app.appointmentDate ? new Date(app.appointmentDate).toISOString().split('T')[0] : '',
        time: app.appointmentTime || '',
        type: app.type || 'inperson',
        purpose: app.purpose || '',
        status: app.status?.toLowerCase() || 'pending',
        sessionCode: app.sessionCode || undefined,
        referenceNumber: payment?.referenceNumber || undefined,
        amountPaid: payment?.paymentAmount || undefined,
        receiptImage: payment?.receiptImage || undefined,
      };
    });

    return NextResponse.json(formattedAppointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Failed to read appointments from database' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // We expect a single appointment object to be created.
    // Ensure we extract proper fields:
    const {
      ownerId, // Passed from UI instead of string
      petId,   // Passed from UI instead of string
      date,
      time,
      type,
      purpose,
      status,
      sessionCode,
      amountPaid,
      referenceNumber,
      receiptImage
    } = data;

    if (!ownerId || !petId) {
      return NextResponse.json({ error: 'ownerId and petId are required for database appointments' }, { status: 400 });
    }

    const newAppointment = await prisma.appointment.create({
      data: {
        userId: ownerId,
        petId: petId,
        appointmentDate: new Date(date),
        appointmentTime: time,
        type: type || 'inperson',
        purpose: purpose || 'Check-up',
        status: status === 'confirmed' ? 'CONFIRMED' : status === 'Done' ? 'COMPLETED' : 'PENDING',
        sessionCode: sessionCode || null,
        payments: (amountPaid !== undefined || referenceNumber || receiptImage) ? {
          create: {
            paymentAmount: amountPaid ? Number(amountPaid) : 0,
            referenceNumber: referenceNumber || null,
            receiptImage: receiptImage || null,
            paymentStatus: 'COMPLETED'
          }
        } : undefined
      },
      include: {
        user: true,
        pet: true,
        payments: true
      }
    });

    const payment = newAppointment.payments?.[0];
    const formattedAppointment = {
        id: newAppointment.id,
        owner: newAppointment.user?.fullName || 'Unknown',
        contact: newAppointment.user?.phoneNumber || 'N/A',
        pet: newAppointment.pet?.petName || 'Unknown',
        species: newAppointment.pet?.species || 'N/A',
        breed: newAppointment.pet?.breed || 'N/A',
        date: newAppointment.appointmentDate ? new Date(newAppointment.appointmentDate).toISOString().split('T')[0] : '',
        time: newAppointment.appointmentTime || '',
        type: newAppointment.type || 'inperson',
        purpose: newAppointment.purpose || '',
        status: newAppointment.status?.toLowerCase() || 'pending',
        sessionCode: newAppointment.sessionCode || undefined,
        referenceNumber: payment?.referenceNumber || undefined,
        amountPaid: payment?.paymentAmount || undefined,
        receiptImage: payment?.receiptImage || undefined,
    };

    return NextResponse.json({ success: true, appointment: formattedAppointment });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: 'Failed to create appointment in database' }, { status: 500 });
  }
}
