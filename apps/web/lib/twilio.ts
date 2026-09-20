import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

let twilioClient: any = null;

if (accountSid && authToken) {
  try {
    twilioClient = twilio(accountSid, authToken);
  } catch (err) {
    console.error('Failed to initialize Twilio client:', err);
  }
}

export async function sendSMS(to: string, message: string) {
  console.log(`[SMS Queue] Dispatching SMS to ${to}: "${message}"`);

  if (!to) {
    console.warn('[SMS Queue] Target phone number is empty.');
    return { success: false, error: 'Recipient phone number is empty' };
  }

  // Resiliently format phone number to E.164 format
  let formattedTo = to.trim().replace(/[-\s()]/g, '');

  if (formattedTo.startsWith('09') && formattedTo.length === 11) {
    formattedTo = '+63' + formattedTo.slice(1);
  } else if (formattedTo.startsWith('9') && formattedTo.length === 10) {
    formattedTo = '+63' + formattedTo;
  } else if (formattedTo.startsWith('639') && formattedTo.length === 12) {
    formattedTo = '+' + formattedTo;
  } else if (!formattedTo.startsWith('+')) {
    // Default fallback to prefixing '+' if it seems like a valid international string
    formattedTo = '+' + formattedTo;
  }

  console.log(`[SMS Queue] Formatted target number: ${formattedTo}`);

  if (twilioClient && fromPhone) {
    try {
      const response = await twilioClient.messages.create({
        body: message,
        from: fromPhone,
        to: formattedTo
      });
      console.log(`[SMS Success] Sent via Twilio. SID: ${response.sid}`);
      return { success: true, sid: response.sid };
    } catch (error: any) {
      console.error('[SMS Error] Twilio sending failed:', error);
      return { success: false, error: error.message };
    }
  } else {
    console.log(`[SMS Mock] Twilio is not fully configured (MOCK MODE).
========================================
TO: ${formattedTo}
MESSAGE: ${message}
========================================`);
    return { success: true, mock: true };
  }
}
