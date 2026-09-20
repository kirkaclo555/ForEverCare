import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import bcrypt from 'bcryptjs';

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
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const variations = getPhoneVariations(identifier);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.trim() },
          { phoneNumber: { in: variations } },
          { recoveryPhone: { in: variations } }
        ]
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (user.status === 'INACTIVE') {
      return NextResponse.json({ error: 'Account disabled. Contact the system administrator.' }, { status: 403 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        profileImage: user.profileImage,
        twoFactorEnabled: user.twoFactorEnabled,
        language: user.language
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
