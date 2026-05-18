import { PrismaClient, Role } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      {
        fullName: 'Super Admin User',
        email: 'superadmin@furevercare.com',
        password: '123123',
        role: Role.SUPER_ADMIN,
      },
      {
        fullName: 'Admin Staff User',
        email: 'admin@furevercare.com',
        password: '123123',
        role: Role.ADMIN,
      },
      {
        fullName: 'Regular Pet Owner',
        email: 'user@furevercare.com',
        password: '123123',
        role: Role.USER,
      },
    ],
    skipDuplicates: true,
  });
  console.log('Seed completed successfully. Inserted 3 accounts.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
