import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, fullName, provider, providerId } = body;

    if (!email || !fullName || !provider) {
      return NextResponse.json({ error: 'Missing required social profile fields' }, { status: 400 });
    }

    // Check if user already exists by email
    let user = await prisma.user.findFirst({
      where: { email: email }
    });

    if (!user) {
      // User doesn't exist, create a new one using the social profile data.
      // Generate a long random password since they won't use it to log in (they use the social provider)
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await prisma.user.create({
        data: {
          fullName: fullName.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          role: 'USER',
          status: 'ACTIVE',
          // Note: phoneNumber is optional in Prisma schema, so we can leave it null.
          // provider and providerId aren't currently in schema, but we rely on email matching anyway.
        }
      });
    } else {
      // If user exists, but their status is inactive, prevent login
      if (user.status === 'INACTIVE') {
        return NextResponse.json({ error: 'Account disabled. Contact the system administrator.' }, { status: 403 });
      }
    }

    // Return successful login response without exposing the password
    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        profileImage: user.profileImage,
        twoFactorEnabled: user.twoFactorEnabled
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Social login error:", error);
    return NextResponse.json({ error: 'Internal server error during social login' }, { status: 500 });
  }
}
