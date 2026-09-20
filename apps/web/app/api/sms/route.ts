import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { sendSMS } from '../../../lib/twilio';

export async function GET(req: Request) {
  try {
    // 1. Get recent SMS notifications sent
    const dbMessages = await prisma.smsNotification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { user: true }
    });

    // Format DB messages to match recentMessages shape
    const formattedMessages = dbMessages.map(msg => ({
      id: msg.id,
      to: msg.user?.phoneNumber || 'Unknown',
      status: msg.status === 'SENT' ? 'Sent' : msg.status === 'PENDING' ? 'Pending' : 'Failed',
      time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      preview: msg.message
    }));

    // 2. Get users as recent contacts
    const dbUsers = await prisma.user.findMany({
      where: {
        phoneNumber: { not: null }
      },
      orderBy: { fullName: 'asc' },
      take: 50,
      include: { pets: true }
    });

    const formattedContacts = dbUsers.map(user => ({
      id: user.id,
      name: user.fullName,
      phone: user.phoneNumber || '',
      pet: user.pets.map(p => p.petName).join(', ') || 'None'
    }));

    return NextResponse.json({
      success: true,
      messages: formattedMessages,
      contacts: formattedContacts
    });
  } catch (error: any) {
    console.error('[SMS GET API Error] Failed to fetch SMS and contacts:', error);
    return NextResponse.json({ error: 'Failed to fetch data', details: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, message } = body;

    if (!to || !message) {
      return NextResponse.json({ error: 'Recipient(s) and message are required' }, { status: 400 });
    }

    const recipients = Array.isArray(to) ? to : [to];
    const results = [];

    for (let recipient of recipients) {
      const cleanPhone = recipient.trim();
      
      // Attempt to find a matching user by phone
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { phoneNumber: cleanPhone },
            { recoveryPhone: cleanPhone }
          ]
        }
      });

      // Dispatch SMS
      const sendResult = await sendSMS(cleanPhone, message);

      // Record to DB if user is found
      if (user) {
        await prisma.smsNotification.create({
          data: {
            userId: user.id,
            message: message,
            notificationType: 'BROADCAST',
            status: sendResult.success ? 'SENT' : 'FAILED',
            sentAt: sendResult.success ? new Date() : null
          }
        });
      } else {
        console.warn(`[SMS API] Sent SMS to ${cleanPhone} but no registered user matched this phone number.`);
      }

      results.push({
        to: cleanPhone,
        success: sendResult.success,
        error: sendResult.error,
        mock: sendResult.mock
      });
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error('[SMS API Error] Failed to process SMS request:', error);
    return NextResponse.json({ error: 'Failed to send SMS', details: error.message }, { status: 500 });
  }
}
