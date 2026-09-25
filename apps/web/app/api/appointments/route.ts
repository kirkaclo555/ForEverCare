import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';
import nodemailer from 'nodemailer';

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

    // 5. Send booking confirmation email to user (non-blocking)
    const userEmail = newAppointment.user?.email;
    if (userEmail && !userEmail.endsWith('@fureverpawcare.local')) {
      (async () => {
        try {
          const mailer = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
              user: process.env.SMTP_USER || 'adminfureverpawcare@gmail.com',
              pass: process.env.SMTP_PASS || 'ivsd ulrw dwmc alop',
            },
          });
          const apptDateStr = newAppointment.appointmentDate
            ? new Date(newAppointment.appointmentDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
            : 'N/A';
          const apptTime = newAppointment.appointmentTime || 'N/A';
          const petName = newAppointment.pet?.petName || 'your pet';
          const ownerNameStr = newAppointment.user?.fullName || 'Valued Customer';
          const apptPurpose = newAppointment.purpose || 'General Check-up';
          const apptTypeFriendly = (newAppointment.type || 'inperson') === 'telemedicine' ? 'Telemedicine (Online)' : 'In-Person';

          const confirmHtml = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <title>Appointment Booking Confirmed</title>
                <style>
                  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap');
                  body { font-family: 'Outfit', Arial, sans-serif; background-color: #f7fafc; margin: 0; padding: 0; }
                  .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.07); overflow: hidden; border: 1px solid #e2e8f0; }
                  .header { background: linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%); padding: 36px 32px; text-align: center; }
                  .header h1 { color: #ffffff; margin: 0; font-size: 1.6rem; font-weight: 700; letter-spacing: 0.5px; }
                  .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 0.95rem; }
                  .body { padding: 32px; color: #2d3748; }
                  .body p { font-size: 0.97rem; line-height: 1.7; margin: 0 0 16px; }
                  .info-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px 24px; margin: 20px 0; }
                  .info-box .row { display: flex; gap: 8px; margin-bottom: 8px; font-size: 0.93rem; }
                  .info-box .label { color: #4a5568; min-width: 130px; font-weight: 600; }
                  .info-box .value { color: #1a202c; font-weight: 500; }
                  .status-badge { display: inline-block; background: #fef3c7; color: #92400e; border-radius: 20px; padding: 4px 14px; font-size: 0.82rem; font-weight: 700; margin-top: 4px; letter-spacing: 0.5px; }
                  .note { background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 0 8px 8px 0; padding: 12px 16px; font-size: 0.88rem; color: #1e40af; margin: 16px 0 0; }
                  .footer { background: #f7fafc; padding: 20px 32px; text-align: center; font-size: 0.8rem; color: #a0aec0; border-top: 1px solid #e2e8f0; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>🐾 Appointment Booked!</h1>
                    <p>Your appointment has been successfully submitted</p>
                  </div>
                  <div class="body">
                    <p>Dear <strong>${ownerNameStr}</strong>,</p>
                    <p>Thank you for booking an appointment at <strong>FurEverPawCare Clinic</strong>. We have received your request and it is now pending review by our team.</p>
                    <div class="info-box">
                      <div class="row"><span class="label">Pet:</span><span class="value">${petName}</span></div>
                      <div class="row"><span class="label">Reason:</span><span class="value">${apptPurpose}</span></div>
                      <div class="row"><span class="label">Appointment Type:</span><span class="value">${apptTypeFriendly}</span></div>
                      <div class="row"><span class="label">Date:</span><span class="value">${apptDateStr}</span></div>
                      <div class="row"><span class="label">Time:</span><span class="value">${apptTime}</span></div>
                      <div class="row"><span class="label">Status:</span><span class="value"><span class="status-badge">PENDING REVIEW</span></span></div>
                    </div>
                    <div class="note">
                      ℹ️ You will receive another email once our clinic admin confirms or updates your appointment. Please check your inbox regularly.
                    </div>
                    <p style="margin-top: 24px;">If you have any questions, feel free to contact us directly. We look forward to caring for your beloved pet!</p>
                  </div>
                  <div class="footer">
                    <p>© ${new Date().getFullYear()} FurEverPawCare Clinic. All rights reserved.</p>
                    <p>This is an automated message. Please do not reply to this email.</p>
                  </div>
                </div>
              </body>
            </html>
          `;

          await mailer.sendMail({
            from: `"FurEverPawCare Clinic" <${process.env.SMTP_USER || 'adminfureverpawcare@gmail.com'}>`,
            to: userEmail,
            subject: '🐾 Appointment Booking Received – FurEverPawCare',
            html: confirmHtml,
          });
        } catch (emailErr) {
          console.warn('[Email] Booking confirmation email failed (non-blocking):', emailErr);
        }
      })().catch(() => {});
    }

    return NextResponse.json({ success: true, appointment: formattedAppointment });
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    const detailMsg = error?.message || 'Failed to create appointment in database';
    return NextResponse.json({ error: detailMsg }, { status: 500 });
  }
}
