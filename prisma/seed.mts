import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const environments = [
    { id: 'bbfd5e06-d229-4df2-8816-0702352ee62d', name: 'Development' },
    { id: 'e0244050-597a-4fe2-a201-af0ed54906bc', name: 'Staging' },
    { id: 'a777c2bf-1900-447f-bd8b-3403dc865cc4', name: 'Production' },
  ];

  for (const env of environments) {
    const result = await prisma.environment.upsert({
      where: { id: env.id },
      update: {},
      create: {
        id: env.id,
        name: env.name,
        description: '',
      },
    });

    console.log(`Created environment ${result.name} with id ${result.id}`);
  }
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
