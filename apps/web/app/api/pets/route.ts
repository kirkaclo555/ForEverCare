import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    const pets = await prisma.pet.findMany({
      where: { userId }
    });

    // Map Prisma models back to PetProfile format expected by mobile
    const formattedPets = pets.map(pet => ({
      id: pet.id,
      name: pet.petName,
      species: pet.species || 'Dog',
      breed: pet.breed || 'Unknown',
      age: pet.age ? `${pet.age} yrs` : '',
      weight: pet.weight ? `${pet.weight} kg` : '',
      gender: pet.gender || 'Male',
      avatar: pet.avatar || 'paw'
    }));

    return NextResponse.json(formattedPets);
  } catch (error) {
    console.error('Error fetching pets:', error);
    return NextResponse.json({ error: 'Failed to fetch pets' }, { status: 500 });
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
    const ageNum = pet.age ? parseInt(pet.age.replace(/[^0-9]/g, ''), 10) : null;
    const weightNum = pet.weight ? parseFloat(pet.weight.replace(/[^0-9.]/g, '')) : null;

    // We can either update or create based on if pet.id is already in DB
    // However, mobile sends a random Math.random() id for new pets. 
    // It's better to use upsert or just check if it's a new random ID.
    // If the ID contains a decimal point (like Math.random()), it's new.
    const isNew = pet.id.includes('.');

    let savedPet;

    if (!isNew) {
      // Try to update existing
      savedPet = await prisma.pet.update({
        where: { id: pet.id },
        data: {
          petName: pet.name,
          species: pet.species,
          breed: pet.breed,
          age: ageNum === null || isNaN(ageNum) ? null : ageNum,
          weight: weightNum === null || isNaN(weightNum) ? null : weightNum,
          gender: pet.gender,
          avatar: pet.avatar
        }
      });
    } else {
      // Create new
      savedPet = await prisma.pet.create({
        data: {
          userId: userId,
          petName: pet.name,
          species: pet.species,
          breed: pet.breed,
          age: ageNum === null || isNaN(ageNum) ? null : ageNum,
          weight: weightNum === null || isNaN(weightNum) ? null : weightNum,
          gender: pet.gender,
          avatar: pet.avatar
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
      avatar: savedPet.avatar || 'paw'
    };

    return NextResponse.json({ success: true, pet: formattedPet });
  } catch (error) {
    console.error('Error saving pet:', error);
    return NextResponse.json({ error: 'Failed to save pet' }, { status: 500 });
  }
}
