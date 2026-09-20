import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Supabase database...');

  const accounts = [
    {
      fullName: 'Super Admin',
      email: 'fureverpawcare@gmail.com',
      password: 'superadmin123',
      role: 'SUPER_ADMIN',
    },
    {
      fullName: 'System Admin',
      email: 'adminfureverpawcare@gmail.com',
      password: 'admin123',
      role: 'ADMIN',
    },
  ];

  for (const account of accounts) {
    const hashedPassword = await bcrypt.hash(account.password, 10);

    await prisma.user.upsert({
      where: { email: account.email },
      update: { role: account.role },
      create: {
        fullName: account.fullName,
        email: account.email,
        password: hashedPassword,
        role: account.role,
        status: 'ACTIVE',
      },
    });

    console.log(`✅ Created: ${account.email} (${account.role}) — password: ${account.password}`);
  }

  console.log('\n🎉 Seeding complete! You can now log in with:');
  console.log('   Super Admin → fureverpawcare@gmail.com / superadmin123');
  console.log('   Admin       → adminfureverpawcare@gmail.com / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
