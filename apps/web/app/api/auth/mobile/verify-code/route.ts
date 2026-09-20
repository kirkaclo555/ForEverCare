import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';


function getPhoneVariations(input: string): string[] {
  const cleaned = input.trim();
  const variations = [cleaned];
  const digits = cleaned.replace(/\D/g, '');
  if (digits) {
    variations.push(digits);
    if (digits.startsWith('09') && digits.length === 11) {
      variations.push(`${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`);
      variations.push(`+63${digits.slice(1)}`);
      variations.push(`63${digits.slice(1)}`);
    } else if (digits.startsWith('639') && digits.length === 12) {
      const local = '0' + digits.slice(2);
      variations.push(local);
      variations.push(`${local.slice(0, 4)}-${local.slice(4, 7)}-${local.slice(7)}`);
      variations.push(`+${digits}`);
    } else if (cleaned.startsWith('+639')) {
      const local = '0' + digits.slice(2);
      variations.push(local);
      variations.push(`${local.slice(0, 4)}-${local.slice(4, 7)}-${local.slice(7)}`);
    }
  }
  return Array.from(new Set(variations));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, code, identifier } = body;

    const trimmedCode = code ? String(code).trim() : '';

    if ((!userId && !identifier) || !trimmedCode) {
      return NextResponse.json({ error: 'Missing required verification fields' }, { status: 400 });
    }

    // Retrieve user by userId or identifier
    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId }
      });
    }

    if (!user && identifier) {
      const phoneVariations = getPhoneVariations(identifier);
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: identifier.trim().toLowerCase() },
            { phoneNumber: { in: phoneVariations } },
            { recoveryPhone: { in: phoneVariations } }
          ]
        }
      });
    }

    if (!user || !user.resetCode) {
      return NextResponse.json({ error: 'Verification code not found or expired. Please request a new one.' }, { status: 400 });
    }

    if (!user.resetCodeExpiry || new Date() > user.resetCodeExpiry) {
      // Clear expired code
      await prisma.user.update({
        where: { id: user.id },
        data: { resetCode: null, resetCodeExpiry: null }
      });
      return NextResponse.json({ error: 'Verification code has expired. Please request a new one.' }, { status: 400 });
    }

    if (user.resetCode.trim() !== trimmedCode) {
      return NextResponse.json({ error: 'Invalid verification code. Please check and try again.' }, { status: 400 });
    }

    // Code is valid!
    // NOTE: Do NOT clear the resetCode here — if the user proceeds to "Set New Password"
    // (step 3), the reset-password route still needs it. It will be cleared there.

    // Return authenticated user profile so client can immediately open account
    return NextResponse.json({ 
      success: true, 
      message: 'Code verified successfully',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        profileImage: user.profileImage || null,
        language: user.language || 'en',
      }
    });

  } catch (error) {
    console.error("Verify code error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
