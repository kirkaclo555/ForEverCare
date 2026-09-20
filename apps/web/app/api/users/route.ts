import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import bcrypt from 'bcryptjs';


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    const whereClause: any = {};
    if (role) {
      whereClause.role = role;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        role: true,
        status: true,
        profileImage: true,
        pets: {
          where: { isArchived: false },
          select: {
            id: true,
            petName: true,
            species: true,
            breed: true,
          }
        }
      },
      orderBy: {
        fullName: 'asc'
      }
    });

    const mappedUsers = users.map(u => ({
      ...u,
      name: u.fullName,
      pets: (u.pets || []).map(p => ({
        id: p.id,
        name: p.petName,
        petName: p.petName,
        species: p.species || 'Dog',
        breed: p.breed || 'Unknown'
      }))
    }));

    return NextResponse.json(mappedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phoneNumber, password, role } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: 'First name, last name, email, and password are required' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    // Map role to Prisma enum
    let userRole = 'USER';
    if (role === 'admin') userRole = 'ADMIN';

    const newUser = await prisma.user.create({
      data: {
        fullName,
        email,
        phoneNumber,
        role: userRole as any,
        password: hashedPassword,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        role: true,
        status: true,
      }
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
