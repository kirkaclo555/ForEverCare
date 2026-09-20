import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

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
    const { firstName, lastName, email, phoneNumber, password, address, verificationToken, code } = body;

    if (!firstName || !lastName || !email || !phoneNumber || !password || !verificationToken || !code) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Cryptographic Stateless Verification
    const secret = process.env.JWT_SECRET || 'furever_paw_care_signup_secret_key';
    const parts = verificationToken.split(':');
    if (parts.length !== 4) {
      return NextResponse.json({ error: 'Invalid verification token format' }, { status: 400 });
    }

    const [tEmail, tCode, tExpires, signature] = parts;

    if (Date.now() > Number(tExpires)) {
      return NextResponse.json({ error: 'Verification code has expired. Please request a new one.' }, { status: 400 });
    }

    if (tEmail.toLowerCase() !== email.trim().toLowerCase() || tCode !== code.trim()) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    const payload = `${tEmail}:${tCode}:${tExpires}`;
    const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Verification signature mismatch' }, { status: 400 });
    }

    const phoneVariations = getPhoneVariations(phoneNumber);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.trim().toLowerCase() },
          { phoneNumber: { in: phoneVariations } }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email or Phone Number already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    const newUser = await prisma.user.create({
      data: {
        fullName,
        email,
        phoneNumber,
        address: address || null,
        password: hashedPassword,
        role: 'USER',
      }
    });

    return NextResponse.json({ 
      success: true, 
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        address: newUser.address,
        profileImage: newUser.profileImage
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
