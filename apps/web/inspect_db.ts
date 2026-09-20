import prisma from './lib/prisma';

async function main() {
  try {
    const dbAppointments = await prisma.appointment.findMany({
      where: {
        isArchived: false
      },
      include: {
        user: true,
        pet: true,
        payments: true,
        assignedAdmin: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log("DB APPOINTMENTS FETCHED COUNT:", dbAppointments.length);

    const formattedAppointments = dbAppointments.map((app) => {
      const payment = app.payments?.[0]; // Assuming one payment per appointment for simplicity
      return {
        id: app.id,
        owner: app.user?.fullName || 'Unknown',
        contact: app.user?.phoneNumber || 'N/A',
        pet: app.pet?.petName || 'Unknown',
        doctor: app.assignedAdmin?.fullName || 'Dr. Smith',
        species: app.pet?.species || 'N/A',
        breed: app.pet?.breed || 'N/A',
        age: app.pet?.age || null,
        date: app.appointmentDate ? new Date(app.appointmentDate).toISOString().split('T')[0] : '',
        time: app.appointmentTime || '',
        type: app.type || 'inperson',
        purpose: app.purpose || '',
        status: app.status?.toLowerCase() || 'pending',
        sessionCode: app.sessionCode || undefined,
        referenceNumber: payment?.referenceNumber || undefined,
        amountPaid: payment?.paymentAmount || undefined,
        receiptImage: payment?.receiptImage || undefined,
        createdAt: app.createdAt.toISOString()
      };
    });

    console.log("SUCCESSFULLY FORMATTED:", formattedAppointments.length);
  } catch (error: any) {
    console.error("EXACT ERROR:", error);
  }
}

main();
