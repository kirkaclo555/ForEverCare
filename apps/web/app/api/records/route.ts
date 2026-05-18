import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dbPets = await prisma.pet.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedRecords = dbPets.map((pet) => {
      return {
        id: pet.id,
        petName: pet.petName,
        species: pet.species || 'Unknown',
        breed: pet.breed || 'Unknown',
        gender: pet.gender || 'Unknown',
        age: pet.age ? `${pet.age} years` : 'Unknown',
        color: pet.color || 'Unknown',
        weight: pet.weight ? `${pet.weight} kg` : 'Unknown',
        ownerName: pet.user?.fullName || 'Unknown Owner',
        contact: pet.user?.phoneNumber || 'No Contact',
        address: pet.user?.address || 'No Address',
        userName: pet.user?.email || 'No Email',
        pastIllness: pet.pastIllness || 'None',
        previousSurgeries: pet.previousSurgeries || 'None',
        vaccine: pet.vaccinationRecord || 'Pending',
        veterinarian: pet.veterinarian || 'Not Assigned'
      };
    });

    return NextResponse.json(formattedRecords);
  } catch (error) {
    console.error('Error fetching pet records:', error);
    return NextResponse.json({ error: 'Failed to fetch pet records' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // data contains { ownerId, petName, species, breed, gender, age, color, weight, vaccine, veterinarian, pastIllness, previousSurgeries }
    const {
      ownerId,
      petName,
      species,
      breed,
      gender,
      age,
      color,
      weight,
      vaccine,
      veterinarian,
      pastIllness,
      previousSurgeries
    } = data;

    if (!ownerId || !petName || !species) {
      return NextResponse.json({ error: 'ownerId, petName, and species are required' }, { status: 400 });
    }

    const ageNum = age ? parseInt(age.replace(/[^0-9]/g, ''), 10) : null;
    const weightNum = weight ? parseFloat(weight.replace(/[^0-9.]/g, '')) : null;

    const newPet = await prisma.pet.create({
      data: {
        userId: ownerId,
        petName,
        species,
        breed: breed || null,
        gender: gender || null,
        age: ageNum === null || isNaN(ageNum) ? null : ageNum,
        color: color || null,
        weight: weightNum === null || isNaN(weightNum) ? null : weightNum,
        vaccinationRecord: vaccine || 'Pending',
        veterinarian: veterinarian || null,
        pastIllness: pastIllness || 'None',
        previousSurgeries: previousSurgeries || 'None',
      },
      include: {
        user: true
      }
    });

    const formattedRecord = {
        id: newPet.id,
        petName: newPet.petName,
        species: newPet.species || 'Unknown',
        breed: newPet.breed || 'Unknown',
        gender: newPet.gender || 'Unknown',
        age: newPet.age ? `${newPet.age} years` : 'Unknown',
        color: newPet.color || 'Unknown',
        weight: newPet.weight ? `${newPet.weight} kg` : 'Unknown',
        ownerName: newPet.user?.fullName || 'Unknown Owner',
        contact: newPet.user?.phoneNumber || 'No Contact',
        address: newPet.user?.address || 'No Address',
        userName: newPet.user?.email || 'No Email',
        pastIllness: newPet.pastIllness || 'None',
        previousSurgeries: newPet.previousSurgeries || 'None',
        vaccine: newPet.vaccinationRecord || 'Pending',
        veterinarian: newPet.veterinarian || 'Not Assigned'
    };

    return NextResponse.json({ success: true, record: formattedRecord });
  } catch (error) {
    console.error('Error creating pet record:', error);
    return NextResponse.json({ error: 'Failed to create pet record' }, { status: 500 });
  }
}
