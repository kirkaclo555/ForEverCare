import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    const pets = await (prisma.pet as any).findMany({
      where: { userId },
      include: {
        monitoring: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        appointments: {
          orderBy: {
            appointmentDate: 'desc'
          }
        },
        telemedicine: {
          orderBy: {
            consultationDate: 'desc'
          }
        }
      }
    });

    // Map Prisma models back to PetProfile format expected by mobile
    const formattedPets = pets.map((pet: any) => ({
      id: pet.id,
      name: pet.petName,
      petName: pet.petName,
      species: pet.species || 'Dog',
      breed: pet.breed || 'Unknown',
      age: pet.age ? `${pet.age} yrs` : '',
      weight: pet.weight ? `${pet.weight} kg` : '',
      gender: pet.gender || 'Male',
      environment: pet.environment || 'Indoor',
      activity: pet.activity || 'Moderate',
      avatar: pet.avatar || 'paw',
      pastIllness: pet.pastIllness || 'None',
      previousSurgeries: pet.previousSurgeries || 'None',
      vaccine: pet.vaccinationRecord || 'Pending',
      veterinarian: pet.veterinarian || 'Not Assigned',
      verificationStatus: pet.verificationStatus || 'PENDING',
      verifiedAt: pet.verifiedAt,
      verifiedBy: pet.verifiedBy,
      monitoring: pet.monitoring || [],
      appointments: pet.appointments || [],
      telemedicine: pet.telemedicine || []
    }));

    return NextResponse.json(formattedPets);
  } catch (error: any) {
    console.error('Error fetching pets:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch pets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { userId, pet } = data;

    if (!userId || !pet) {
      return NextResponse.json({ error: 'Missing userId or pet data' }, { status: 400 });
    }

    // Parse age and weight from string ("3 yrs", "28.5 kg") to number
    const ageNum = pet.age ? parseInt(String(pet.age).replace(/[^0-9]/g, ''), 10) : null;
    const weightNum = pet.weight ? parseFloat(String(pet.weight).replace(/[^0-9.]/g, '')) : null;

    // Check if pet already exists in database
    let existingPet: any = null;
    if (pet.id && typeof pet.id === 'string' && !pet.id.startsWith('temp-') && !pet.id.includes('.')) {
      try {
        existingPet = await (prisma.pet as any).findUnique({ where: { id: pet.id } });
      } catch (checkErr) {
        console.warn('Could not query existing pet by id:', checkErr);
      }
    }

    let savedPet: any;

    if (existingPet) {
      // Update existing pet
      savedPet = await (prisma.pet as any).update({
        where: { id: pet.id },
        data: {
          petName: pet.name || pet.petName,
          species: pet.species,
          breed: pet.breed,
          age: ageNum === null || isNaN(ageNum) ? null : ageNum,
          weight: weightNum === null || isNaN(weightNum) ? null : weightNum,
          gender: pet.gender,
          environment: pet.environment || 'Indoor',
          activity: pet.activity || 'Moderate',
          avatar: pet.avatar,
          ...(pet.vaccine !== undefined ? { vaccinationRecord: pet.vaccine } : {}),
          ...(pet.verificationStatus ? { verificationStatus: pet.verificationStatus } : {})
        }
      });
    } else {
      // Create new pet record in database
      savedPet = await (prisma.pet as any).create({
        data: {
          userId: userId,
          petName: pet.name || pet.petName || 'My Pet',
          species: pet.species || 'Dog',
          breed: pet.breed || 'Unknown',
          age: ageNum === null || isNaN(ageNum) ? null : ageNum,
          weight: weightNum === null || isNaN(weightNum) ? null : weightNum,
          gender: pet.gender || 'Male',
          environment: pet.environment || 'Indoor',
          activity: pet.activity || 'Moderate',
          avatar: pet.avatar,
          vaccinationRecord: pet.vaccine || null,
          verificationStatus: pet.verificationStatus || 'PENDING'
        }
      });
    }

    const formattedPet = {
      id: savedPet.id,
      name: savedPet.petName,
      species: savedPet.species || 'Dog',
      breed: savedPet.breed || 'Unknown',
      age: savedPet.age ? `${savedPet.age} yrs` : '',
      weight: savedPet.weight ? `${savedPet.weight} kg` : '',
      gender: savedPet.gender || 'Male',
      environment: savedPet.environment || 'Indoor',
      activity: savedPet.activity || 'Moderate',
      avatar: savedPet.avatar || 'paw',
      verificationStatus: savedPet.verificationStatus || 'PENDING',
      verifiedAt: savedPet.verifiedAt,
      verifiedBy: savedPet.verifiedBy
    };

    return NextResponse.json({ success: true, pet: formattedPet });
  } catch (error: any) {
    console.error('Error saving pet:', error);
    return NextResponse.json({ error: error?.message || 'Failed to save pet' }, { status: 500 });
  }
}
