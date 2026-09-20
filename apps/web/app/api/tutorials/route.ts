import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let tutorials = await prisma.petTutorial.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        admin: {
          select: {
            id: true,
            fullName: true,
            email: true,
          }
        }
      }
    });

    if (tutorials.length === 0) {
      // Find the first available admin or superadmin to assign as the creator
      let admin = await prisma.user.findFirst({
        where: {
          OR: [
            { role: 'SUPER_ADMIN' },
            { role: 'ADMIN' }
          ]
        }
      });

      if (!admin) {
        admin = await prisma.user.create({
          data: {
            fullName: 'System Admin',
            email: 'systemadmin@furevercare.com',
            password: 'password123',
            role: 'SUPER_ADMIN'
          }
        });
      }

      // Seed standard default tutorials
      const defaults = [
        {
          title: 'Basic Obedience Training for Puppies',
          description: 'Learn the core techniques to get your new puppy to listen and follow basic commands.',
          videoLink: 'https://www.w3schools.com/html/mov_bbb.mp4',
          category: 'Dog Training',
          adminId: admin.id
        },
        {
          title: 'How to Properly Trim Cat Claws',
          description: 'Step-by-step tutorial on trimming your cat claws safely without causing pain or bleeding.',
          videoLink: 'https://www.w3schools.com/html/movie.mp4',
          category: 'Grooming',
          adminId: admin.id
        },
        {
          title: 'Understanding Feline Body Language',
          description: 'Decipher what your cat is telling you with their tail, ears, and body postures.',
          videoLink: 'https://www.w3schools.com/html/mov_bbb.mp4',
          category: 'Cat Care',
          adminId: admin.id
        }
      ];

      await prisma.petTutorial.createMany({
        data: defaults
      });

      tutorials = await prisma.petTutorial.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: {
              id: true,
              fullName: true,
              email: true,
            }
          }
        }
      });
    }

    return NextResponse.json({ success: true, tutorials });
  } catch (error: any) {
    console.error('Failed to fetch tutorials:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, videoLink, category } = body;

    if (!title || !videoLink) {
      return NextResponse.json({ success: false, error: 'Missing title or videoLink' }, { status: 400 });
    }

    // Find the first available admin or superadmin to assign as the creator
    let admin = await prisma.user.findFirst({
      where: {
        OR: [
          { role: 'SUPER_ADMIN' },
          { role: 'ADMIN' }
        ]
      }
    });

    if (!admin) {
      // Fallback if no admin exists
      admin = await prisma.user.create({
        data: {
          fullName: 'System Admin',
          email: 'dummyadmin' + Math.random() + '@furevercare.com',
          password: 'password123',
          role: 'SUPER_ADMIN'
        }
      });
    }

    const newTutorial = await prisma.petTutorial.create({
      data: {
        title,
        description: description || '',
        videoLink,
        category: category || 'Other',
        adminId: admin.id
      },
      include: {
        admin: {
          select: {
            id: true,
            fullName: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json({ success: true, tutorial: newTutorial });
  } catch (error: any) {
    console.error('Failed to create tutorial:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
