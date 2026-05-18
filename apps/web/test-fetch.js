async function test() {
  try {
    // We need a pet ID. Let's hit another API first, or directly use Prisma to find one.
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const pet = await prisma.pet.findFirst();
    if (!pet) {
      console.log('No pets found in DB');
      return;
    }

    const response = await fetch('http://localhost:3000/api/monitoring', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        petId: pet.id,
        symptoms: 'Test symptom',
        recommendations: 'Test recommendation'
      })
    });
    
    const text = await response.text();
    console.log('POST Response:', response.status, text);

    const getResp = await fetch('http://localhost:3000/api/monitoring?role=ADMIN');
    const getText = await getResp.text();
    console.log('GET Response:', getText);
  } catch (e) {
    console.error(e);
  }
}
test();
