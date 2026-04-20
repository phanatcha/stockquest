import { PrismaClient } from '@prisma/client';
import { seedDummyQuests } from './seeders/dummy-quests';
import { seedBadges } from './seeders/badges.seed';
import { seedLearnContent } from './seeders/learn.seed';

const prisma = new PrismaClient();

async function main() {
  await prisma.progressionConfig.upsert({
    where: { id: 'default' },
    create: { id: 'default', baseXp: 100, exponent: 1.2 },
    update: {},
  });

  const { quizTier2, quizTier3 } = await seedLearnContent(prisma);

  await prisma.tierConfig.upsert({
    where: { tier: 1 },
    create: {
      tier: 1,
      name: 'Beginner',
      minLevel: 1,
      prerequisiteQuizId: null,
    },
    update: {},
  });

  await prisma.tierConfig.upsert({
    where: { tier: 2 },
    create: {
      tier: 2,
      name: 'Intermediate',
      minLevel: 5,
      prerequisiteQuizId: quizTier2.id,
    },
    update: { prerequisiteQuizId: quizTier2.id },
  });

  await prisma.tierConfig.upsert({
    where: { tier: 3 },
    create: {
      tier: 3,
      name: 'Advanced',
      minLevel: 12,
      prerequisiteQuizId: quizTier3.id,
    },
    update: { prerequisiteQuizId: quizTier3.id },
  });

  const badgeCount = await seedBadges(prisma);
  console.log(`Seeded ${badgeCount} badges.`);

  const questCount = await seedDummyQuests(prisma);
  console.log(`Seeded ${questCount} dummy quests.`);
  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
