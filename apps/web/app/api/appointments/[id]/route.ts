import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const data = await request.json();
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id) {
      return NextResponse.json({ error: 'Appointment ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (data.status) {
      updateData.status = 
        data.status.toLowerCase() === 'confirmed' ? 'CONFIRMED' : 
        data.status.toLowerCase() === 'done' || data.status.toLowerCase() === 'completed' ? 'COMPLETED' : 
        data.status.toLowerCase() === 'cancelled' ? 'CANCELLED' : 
        data.status.toLowerCase() === 'paid' ? 'PAID' : 
        'PENDING';
    }
    if (data.sessionCode !== undefined) updateData.sessionCode = data.sessionCode;
    if (data.date) updateData.appointmentDate = new Date(data.date);
    if (data.time) updateData.appointmentTime = data.time;

    // Generate session code if becoming PAID and it's a telemedicine appt
    let generatedSessionCode = '';
    if (updateData.status === 'PAID' && !data.sessionCode) {
      // We need to check if it's telemedicine. We can fetch it first, or just assume from 'data' if passed, but it's safer to query first.
      const existing = await prisma.appointment.findUnique({ where: { id } });
      if (existing?.type === 'telemedicine' && !existing.sessionCode) {
         generatedSessionCode = Math.random().toString(36).substring(2, 8).toUpperCase();
         updateData.sessionCode = generatedSessionCode;
      }
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
        pet: true,
        payments: true
      }
    });

    if (data.status || data.sessionCode || data.date || data.time || generatedSessionCode) {
       let msg = `Your ${updatedAppointment.type} appointment for ${updatedAppointment.pet?.petName || 'your pet'} has been updated. Status: ${updatedAppointment.status}.`;
       if (generatedSessionCode) {
         msg += ` Your telemedicine session code is: ${generatedSessionCode}. Please enter this in the mobile app at your scheduled time.`;
       }
       await prisma.notification.create({
         data: {
           userId: updatedAppointment.userId,
           title: 'Appointment Updated',
           message: msg
         }
       });
    }

    const payment = updatedAppointment.payments?.[0];
    const formattedAppointment = {
        id: updatedAppointment.id,
        owner: updatedAppointment.user?.fullName || 'Unknown',
        contact: updatedAppointment.user?.phoneNumber || 'N/A',
        pet: updatedAppointment.pet?.petName || 'Unknown',
        species: updatedAppointment.pet?.species || 'N/A',
        breed: updatedAppointment.pet?.breed || 'N/A',
        date: updatedAppointment.appointmentDate ? new Date(updatedAppointment.appointmentDate).toISOString().split('T')[0] : '',
        time: updatedAppointment.appointmentTime || '',
        type: updatedAppointment.type || 'inperson',
        purpose: updatedAppointment.purpose || '',
        status: updatedAppointment.status?.toLowerCase() || 'pending',
        sessionCode: updatedAppointment.sessionCode || undefined,
        referenceNumber: payment?.referenceNumber || undefined,
        amountPaid: payment?.paymentAmount || undefined,
        receiptImage: payment?.receiptImage || undefined,
    };

    return NextResponse.json({ success: true, appointment: formattedAppointment });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    if (!id) {
      return NextResponse.json({ error: 'Appointment ID is required' }, { status: 400 });
    }

    await prisma.appointment.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 });
  }
}
