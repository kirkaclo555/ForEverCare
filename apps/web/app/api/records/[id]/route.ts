import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json();
    const id = params.id;

    if (!id) {
      return NextResponse.json({ error: 'Pet ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (data.petName !== undefined) updateData.petName = data.petName;
    if (data.species !== undefined) updateData.species = data.species;
    if (data.breed !== undefined) updateData.breed = data.breed;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.age !== undefined) updateData.age = data.age ? parseInt(data.age.replace(/[^0-9]/g, ''), 10) : null;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.weight !== undefined) updateData.weight = data.weight ? parseFloat(data.weight.replace(/[^0-9.]/g, '')) : null;
    if (data.vaccine !== undefined) updateData.vaccinationRecord = data.vaccine;
    if (data.veterinarian !== undefined) updateData.veterinarian = data.veterinarian;
    if (data.pastIllness !== undefined) updateData.pastIllness = data.pastIllness;
    if (data.previousSurgeries !== undefined) updateData.previousSurgeries = data.previousSurgeries;

    const updatedPet = await prisma.pet.update({
      where: { id },
      data: updateData,
      include: {
        user: true
      }
    });

    const formattedRecord = {
        id: updatedPet.id,
        petName: updatedPet.petName,
        species: updatedPet.species || 'Unknown',
        breed: updatedPet.breed || 'Unknown',
        gender: updatedPet.gender || 'Unknown',
        age: updatedPet.age ? `${updatedPet.age} years` : 'Unknown',
        color: updatedPet.color || 'Unknown',
        weight: updatedPet.weight ? `${updatedPet.weight} kg` : 'Unknown',
        ownerName: updatedPet.user?.fullName || 'Unknown Owner',
        contact: updatedPet.user?.phoneNumber || 'No Contact',
        address: updatedPet.user?.address || 'No Address',
        userName: updatedPet.user?.email || 'No Email',
        pastIllness: updatedPet.pastIllness || 'None',
        previousSurgeries: updatedPet.previousSurgeries || 'None',
        vaccine: updatedPet.vaccinationRecord || 'Pending',
        veterinarian: updatedPet.veterinarian || 'Not Assigned'
    };

    return NextResponse.json({ success: true, record: formattedRecord });
  } catch (error) {
    console.error('Error updating pet record:', error);
    return NextResponse.json({ error: 'Failed to update pet record' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: 'Pet ID is required' }, { status: 400 });
    }

    await prisma.pet.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting pet record:', error);
    return NextResponse.json({ error: 'Failed to delete pet record' }, { status: 500 });
  }
}
