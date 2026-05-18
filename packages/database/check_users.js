const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Check users
  const users = await prisma.user.findMany({
    where: {
      role: { in: ['ADMIN', 'SUPER_ADMIN'] }
    }
  });
  console.log("Existing admins/superadmins:", users.map(u => ({ email: u.email, role: u.role })));

  // Upsert Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'fureverpawcare@gmail.com' },
    update: {},
    create: {
      email: 'fureverpawcare@gmail.com',
      password: 'superadmin123', // In a real app this should be hashed, but I will just set it for testing
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      phoneNumber: '00000000000'
    }
  });

  // Upsert Admin
  const admin = await prisma.user.upsert({
    where: { email: 'fureverpawcareadmin@gmail.com' },
    update: {},
    create: {
      email: 'fureverpawcareadmin@gmail.com',
      password: 'admin123',
      firstName: 'System',
      lastName: 'Admin',
      role: 'ADMIN',
      phoneNumber: '11111111111'
    }
  });

  console.log("Created/Verified user:", superAdmin.email);
  console.log("Created/Verified user:", admin.email);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
