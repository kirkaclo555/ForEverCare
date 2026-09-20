import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET() {
  try {
    const pets = await prisma.pet.findMany({
      include: {
        user: true,
        appointments: true,
        monitoring: true,
      }
    });
    const appointments = await prisma.appointment.findMany({
      include: {
        user: true,
        pet: true,
      }
    });
    const monitoring = await prisma.petMonitoring.findMany({
      include: {
        pet: true,
      }
    });
    return NextResponse.json({
      petsCount: pets.length,
      appointmentsCount: appointments.length,
      monitoringCount: monitoring.length,
      pets: pets.slice(0, 5).map(p => ({ id: p.id, name: p.petName, breed: p.breed, age: p.age, species: p.species })),
      appointments: appointments.slice(0, 10).map(a => ({ id: a.id, pet: a.pet?.petName, purpose: a.purpose, date: a.appointmentDate, status: a.status })),
      monitoring: monitoring.slice(0, 5).map(m => ({ id: m.id, petName: m.pet?.petName, symptoms: m.symptoms }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
