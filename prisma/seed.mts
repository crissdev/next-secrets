import { createPrismaClient } from '../src/lib/db/prisma';
import { DEFAULT_ENVIRONMENTS } from '../src/lib/definitions';

const prisma = createPrismaClient();

async function main() {
  for (const env of DEFAULT_ENVIRONMENTS) {
    const result = await prisma.environment.upsert({
      where: { name: env.name },
      update: {
        id: env.id,
        description: '',
      },
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
