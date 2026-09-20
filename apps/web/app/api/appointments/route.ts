import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const showArchived = searchParams.get('archived') === 'true';

    const dbAppointments = await prisma.appointment.findMany({
      where: {
        isArchived: showArchived
      },
      select: {
        id: true,
        appointmentDate: true,
        appointmentTime: true,
        type: true,
        purpose: true,
        status: true,
        sessionCode: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            email: true,
            address: true
          }
        },
        pet: {
          select: {
            id: true,
            petName: true,
            species: true,
            breed: true,
            age: true,
            gender: true,
            weight: true,
            avatar: true
          }
        },
        payments: {
          select: {
            referenceNumber: true,
            paymentAmount: true,
            receiptImage: true
          }
        },
        assignedAdmin: {
          select: {
            id: true,
            fullName: true
          }
        }
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
        email: app.user?.email || '',
        contact: app.user?.phoneNumber || 'N/A',
        address: app.user?.address || '',
        pet: app.pet?.petName || 'Unknown',
        doctor: app.assignedAdmin?.fullName || 'Dr. Smith',
        species: app.pet?.species || 'N/A',
        breed: app.pet?.breed || 'N/A',
        age: app.pet?.age || null,
        petGender: app.pet?.gender || '',
        petWeight: app.pet?.weight !== undefined && app.pet?.weight !== null ? app.pet.weight : null,
        petAvatar: app.pet?.avatar || '',
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
      ownerId,
      ownerName,
      contactNumber,
      petId,
      pet,
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

    let finalOwnerId = ownerId;
    let validUser: any = null;

    if (finalOwnerId && typeof finalOwnerId === 'string' && !finalOwnerId.startsWith('temp-')) {
      try {
        validUser = await prisma.user.findUnique({
          where: { id: finalOwnerId },
          select: { id: true, fullName: true, phoneNumber: true }
        });
      } catch (err) {
        console.warn('User lookup by id failed:', err);
      }
    }

    // If not found by ID or no ownerId passed, try to match by name or create a guest user
    if (!validUser && (ownerName || data.owner)) {
      const searchName = (ownerName || data.owner || '').trim();
      if (searchName) {
        try {
          validUser = await prisma.user.findFirst({
            where: { fullName: { equals: searchName, mode: 'insensitive' } },
            select: { id: true, fullName: true, phoneNumber: true }
          });
        } catch (err) {
          console.warn('User lookup by name failed:', err);
        }

        if (!validUser) {
          const tempEmail = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}@fureverpawcare.local`;
          const tempPass = await bcrypt.hash('Guest123!', 10);
          validUser = await prisma.user.create({
            data: {
              fullName: searchName,
              email: tempEmail,
              password: tempPass,
              phoneNumber: contactNumber || null,
              role: 'USER'
            }
          });
        }
      }
    }

    if (!validUser) {
      return NextResponse.json({ error: 'Owner name or registered account is required for appointments' }, { status: 400 });
    }
    finalOwnerId = validUser.id;

    // 2. Resolve or auto-heal pet ID
    let finalPetId = petId;
    let validPet: any = null;

    if (finalPetId && typeof finalPetId === 'string' && !finalPetId.startsWith('temp-') && finalPetId !== 'new' && !finalPetId.includes('.')) {
      try {
        validPet = await (prisma.pet as any).findUnique({ where: { id: finalPetId } });
      } catch (findErr) {
        console.warn('Could not find pet by id:', findErr);
      }
    }

    if (!validPet) {
      // If pet payload was sent or we can find another pet for this user
      if (pet) {
        const ageNum = pet.age ? parseInt(String(pet.age).replace(/[^0-9]/g, ''), 10) : null;
        const weightNum = pet.weight ? parseFloat(String(pet.weight).replace(/[^0-9.]/g, '')) : null;
        validPet = await (prisma.pet as any).create({
          data: {
            userId: finalOwnerId,
            petName: pet.name || pet.petName || 'My Pet',
            species: pet.species || 'Dog',
            breed: pet.breed || 'Unknown',
            age: ageNum === null || isNaN(ageNum) ? null : ageNum,
            weight: weightNum === null || isNaN(weightNum) ? null : weightNum,
            gender: pet.gender || 'Male',
            environment: pet.environment || 'Indoor',
            activity: pet.activity || 'Moderate',
            avatar: pet.avatar || 'paw',
            vaccinationRecord: pet.vaccine || null,
            verificationStatus: pet.verificationStatus || 'PENDING'
          }
        });
        finalPetId = validPet.id;
      } else {
        // Fallback: check if the user has any pet registered in DB
        const existingUserPet = await (prisma.pet as any).findFirst({
          where: { userId: finalOwnerId }
        });
        if (existingUserPet) {
          finalPetId = existingUserPet.id;
          validPet = existingUserPet;
        } else {
          // If no pet registered, create default pet record
          validPet = await (prisma.pet as any).create({
            data: {
              userId: finalOwnerId,
              petName: 'Pet',
              species: 'Dog',
              breed: 'Unknown'
            }
          });
          finalPetId = validPet.id;
        }
      }
    }

    const parsedDate = new Date(date);
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        petId: finalPetId,
        appointmentDate: parsedDate,
        appointmentTime: time,
        status: {
          not: 'CANCELLED'
        }
      }
    });

    if (existingAppointment) {
      return NextResponse.json({ error: 'An appointment for this pet at this date and time already exists.' }, { status: 400 });
    }

    const finalSessionCode = sessionCode || (type === 'telemedicine' && status?.toUpperCase() === 'PAID' ? `FC-${Math.random().toString(36).substring(2, 8).toUpperCase()}` : null);

    // 3. Handle base64 receipt image safely
    let finalReceiptImage = receiptImage || null;
    if (finalReceiptImage && typeof finalReceiptImage === 'string' && finalReceiptImage.startsWith('data:')) {
      try {
        const uploadResult = await cloudinary.uploader.upload(finalReceiptImage, {
          folder: 'fureverpawcare/receipts',
          resource_type: 'auto',
        });
        if (uploadResult?.secure_url) {
          finalReceiptImage = uploadResult.secure_url;
        }
      } catch (uploadErr) {
        console.warn('Cloudinary receipt upload failed in appointments route:', uploadErr);
        // Fallback to a placeholder string so it doesn't overflow DB VARCHAR(255) column
        finalReceiptImage = 'receipt_uploaded';
      }
    }

    const newAppointment = await prisma.appointment.create({
      data: {
        userId: finalOwnerId,
        petId: finalPetId,
        appointmentDate: parsedDate,
        appointmentTime: time,
        type: type || 'inperson',
        purpose: purpose || 'Check-up',
        status: (status ? status.toUpperCase() : 'PENDING') as any,
        sessionCode: finalSessionCode,
        payments: (amountPaid !== undefined || referenceNumber || finalReceiptImage) ? {
          create: {
            paymentAmount: amountPaid ? Number(amountPaid) : 0,
            referenceNumber: referenceNumber || null,
            receiptImage: finalReceiptImage,
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

    // 4. Notify Admins about the new appointment (safely wrapped)
    try {
      const admins = await prisma.user.findMany({
        where: { role: { in: ['SUPER_ADMIN', 'ADMIN'] } }
      });

      const appointmentDateStr = newAppointment.appointmentDate ? new Date(newAppointment.appointmentDate).toISOString().split('T')[0] : 'N/A';
      const ownerName = newAppointment.user?.fullName || validUser?.fullName || 'Unknown';
      const petName = newAppointment.pet?.petName || validPet?.petName || 'Unknown';
      const apptType = (newAppointment.type || 'inperson') === 'telemedicine' ? 'Telemedicine' : 'In-Person';

      const notifications = admins.map(admin => ({
        userId: admin.id,
        title: 'New Appointment Received',
        message: `${ownerName} booked a ${apptType} appointment for ${petName} on ${appointmentDateStr} at ${newAppointment.appointmentTime || 'N/A'}. Status: Pending.`,
        isRead: false
      }));

      if (notifications.length > 0) {
        await prisma.notification.createMany({ data: notifications });
      }
    } catch (notifErr) {
      console.warn('Admin notification creation failed (non-blocking):', notifErr);
    }

    const payment = newAppointment.payments?.[0];
    const formattedAppointment = {
        id: newAppointment.id,
        owner: newAppointment.user?.fullName || validUser?.fullName || 'Unknown',
        contact: newAppointment.user?.phoneNumber || validUser?.phoneNumber || 'N/A',
        pet: newAppointment.pet?.petName || validPet?.petName || 'Unknown',
        species: newAppointment.pet?.species || validPet?.species || 'N/A',
        breed: newAppointment.pet?.breed || validPet?.breed || 'N/A',
        age: newAppointment.pet?.age || validPet?.age || null,
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
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    const detailMsg = error?.message || 'Failed to create appointment in database';
    return NextResponse.json({ error: detailMsg }, { status: 500 });
  }
}
