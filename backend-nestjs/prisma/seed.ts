import { PrismaClient, QuestCategory, BadgeTrigger } from '@prisma/client';
import { seedDummyQuests } from './seeders/dummy-quests';

const prisma = new PrismaClient();

async function main() {
  await prisma.progressionConfig.upsert({
    where: { id: 'default' },
    create: { id: 'default', baseXp: 100, exponent: 1.2 },
    update: {},
  });

  const quizTier2 = await prisma.quiz.upsert({
    where: { id: 'quiz-tier-2-gate' },
    create: {
      id: 'quiz-tier-2-gate',
      title: 'Intermediate track',
      description: 'Unlock Tier 2 (Intermediate)',
      tierUnlocked: 2,
      passScore: 0.8,
      cooldownMinutes: 30,
      questions: {
        create: [
          {
            text: 'Diversification primarily reduces which risk?',
            options: [
              'Systematic (market) risk',
              'Unsystematic (idiosyncratic) risk',
              'Currency risk only',
              'Inflation risk only',
            ],
            correctIndex: 1,
            points: 1,
          },
          {
            text: 'A limit order executes at:',
            options: [
              'The opening price only',
              'A specified price or better',
              'Always the last traded price',
              'Random price within the spread',
            ],
            correctIndex: 1,
            points: 1,
          },
        ],
      },
    },
    update: {},
  });

  const quizTier3 = await prisma.quiz.upsert({
    where: { id: 'quiz-tier-3-gate' },
    create: {
      id: 'quiz-tier-3-gate',
      title: 'Advanced track',
      description: 'Unlock Tier 3 (Advanced)',
      tierUnlocked: 3,
      passScore: 0.85,
      cooldownMinutes: 60,
      questions: {
        create: [
          {
            text: 'CAPM beta measures:',
            options: [
              'Total portfolio volatility',
              'Sensitivity to market movements',
              'Dividend yield',
              'Credit spread',
            ],
            correctIndex: 1,
            points: 1,
          },
        ],
      },
    },
    update: {},
  });

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

  const badges = [
    {
      name: 'First Trade',
      description: 'Execute your first trade',
      iconId: 'first-trade',
      category: QuestCategory.ACTION_STRATEGY,
      trigger: BadgeTrigger.FIRST_TRADE,
    },
    {
      name: 'Diversified',
      description: 'Hold 5+ different stocks at once',
      iconId: 'diversified',
      category: QuestCategory.ACTION_STRATEGY,
      trigger: BadgeTrigger.DIVERSIFIED,
    },
    {
      name: 'League Champion',
      description: 'Finish 1st in any league',
      iconId: 'champion',
      category: QuestCategory.COMMUNITY_LEARNING,
      trigger: BadgeTrigger.LEAGUE_CHAMPION,
    },
    {
      name: 'Top 3 Finisher',
      description: 'Finish top 3 in any league',
      iconId: 'top3',
      category: QuestCategory.COMMUNITY_LEARNING,
      trigger: BadgeTrigger.TOP_3_FINISHER,
    },
    {
      name: 'League Participant',
      description: 'Complete any league (outside top 3)',
      iconId: 'participant',
      category: QuestCategory.COMMUNITY_LEARNING,
      trigger: BadgeTrigger.LEAGUE_PARTICIPANT,
    },
    {
      name: 'Quiz Master',
      description: 'Pass 5 quizzes',
      iconId: 'quiz-master',
      category: QuestCategory.COMMUNITY_LEARNING,
      trigger: BadgeTrigger.QUIZ_MASTER,
    },
    {
      name: 'Scholar',
      description: 'Read 10 educational articles',
      iconId: 'scholar',
      category: QuestCategory.COMMUNITY_LEARNING,
      trigger: BadgeTrigger.SCHOLAR,
    },
    {
      name: 'League Creator',
      description: 'Create a league',
      iconId: 'creator',
      category: QuestCategory.COMMUNITY_LEARNING,
      trigger: BadgeTrigger.LEAGUE_CREATOR,
    },
  ];

  for (const b of badges) {
    await prisma.badge.upsert({
      where: { trigger: b.trigger },
      create: b,
      update: {
        name: b.name,
        description: b.description,
        iconId: b.iconId,
        category: b.category,
      },
    });
  }

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
