const { PrismaClient } = require('@prisma/client');

// Try multiple URL formats to find what works
const urls = [
  // Direct connection (no pooler)
  'postgresql://postgres:qevqdgt282004@db.skgcqpoxdatddehvgskf.supabase.co:5432/postgres',
  // IPv4 pooler session mode
  'postgresql://postgres.skgcqpoxdatddehvgskf:qevqdgt282004@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres',
  // Transaction pooler (original but without pgbouncer param)
  'postgresql://postgres.skgcqpoxdatddehvgskf:qevqdgt282004@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres',
];

async function testUrl(url) {
  const label = url.slice(0, 70) + '...';
  const prisma = new PrismaClient({ 
    datasources: { db: { url } },
    log: [] 
  });
  try {
    await prisma.$queryRawUnsafe('SELECT 1 as ok');
    console.log('✅ SUCCESS:', label);
    return true;
  } catch(err) {
    console.log('❌ FAILED:', label);
    console.log('   Reason:', err.message?.slice(0, 100));
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

(async () => {
  for (const url of urls) {
    const ok = await testUrl(url);
    if (ok) { console.log('\n✅ Use this URL!'); break; }
  }
  console.log('Done.');
})();
