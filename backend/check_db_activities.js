require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const activities = await prisma.actividades.findMany({
    include: {
      unidades_didacticas: true
    }
  });
  console.log('--- TODAS LAS ACTIVIDADES EN LA BD ---');
  console.log(JSON.stringify(activities, null, 2));
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
