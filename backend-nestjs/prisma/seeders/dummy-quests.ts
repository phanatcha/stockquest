import { PrismaClient, QuestCategory, QuestActionType } from '@prisma/client';

export type DummyQuestSeed = {
  title: string;
  description: string;
  category: QuestCategory;
  actionType: QuestActionType;
  targetValue: number;
  xpReward: number;
  barleyReward: number;
  repeatable: boolean;
  tierRequirement: number;
  expiry?: Date | null;
  autoClaim?: boolean;
};

/**
 * Demo / dev quests for StockQuest. Titles are stable keys for idempotent seeding.
 */
export const DUMMY_QUESTS: DummyQuestSeed[] = [
  {
    title: 'Market mover',
    description: 'Execute 3 trades',
    category: QuestCategory.ACTION_STRATEGY,
    actionType: QuestActionType.TRADE_EXECUTED,
    targetValue: 3,
    xpReward: 50,
    barleyReward: 10,
    repeatable: false,
    tierRequirement: 1,
  },
  {
    title: 'High-frequency rookie',
    description: 'Execute 10 trades',
    category: QuestCategory.ACTION_STRATEGY,
    actionType: QuestActionType.TRADE_EXECUTED,
    targetValue: 10,
    xpReward: 120,
    barleyReward: 25,
    repeatable: true,
    tierRequirement: 1,
  },
  {
    title: 'Join the Bullring',
    description: 'Join a fantasy league',
    category: QuestCategory.COMMUNITY_LEARNING,
    actionType: QuestActionType.LEAGUE_JOINED,
    targetValue: 1,
    xpReward: 40,
    barleyReward: 5,
    repeatable: true,
    tierRequirement: 1,
  },
  {
    title: 'Quiz starter',
    description: 'Pass any quiz',
    category: QuestCategory.COMMUNITY_LEARNING,
    actionType: QuestActionType.QUIZ_PASSED,
    targetValue: 1,
    xpReward: 60,
    barleyReward: 15,
    repeatable: true,
    tierRequirement: 1,
  },
  {
    title: 'Scholar path',
    description: 'Pass 3 quizzes',
    category: QuestCategory.COMMUNITY_LEARNING,
    actionType: QuestActionType.QUIZ_PASSED,
    targetValue: 3,
    xpReward: 150,
    barleyReward: 35,
    repeatable: false,
    tierRequirement: 1,
  },
  {
    title: 'Well rounded',
    description: 'Hold 5 different stocks in a league portfolio',
    category: QuestCategory.ACTION_STRATEGY,
    actionType: QuestActionType.PORTFOLIO_DIVERSIFIED,
    targetValue: 5,
    xpReward: 80,
    barleyReward: 20,
    repeatable: false,
    tierRequirement: 1,
  },
  {
    title: 'Deep diversification',
    description: 'Hold 8 different stocks in a league portfolio',
    category: QuestCategory.ACTION_STRATEGY,
    actionType: QuestActionType.PORTFOLIO_DIVERSIFIED,
    targetValue: 8,
    xpReward: 140,
    barleyReward: 30,
    repeatable: false,
    tierRequirement: 2,
  },
  {
    title: 'Ring leader',
    description: 'Create a fantasy league',
    category: QuestCategory.COMMUNITY_LEARNING,
    actionType: QuestActionType.LEAGUE_CREATED,
    targetValue: 1,
    xpReward: 100,
    barleyReward: 25,
    repeatable: true,
    tierRequirement: 1,
  },
  {
    title: 'Podium chase',
    description: 'Finish in the top 3 of any league',
    category: QuestCategory.COMMUNITY_LEARNING,
    actionType: QuestActionType.LEAGUE_FINISHED_TOP3,
    targetValue: 1,
    xpReward: 200,
    barleyReward: 50,
    repeatable: true,
    tierRequirement: 1,
  },
  {
    title: 'Academy reader',
    description: 'Read 3 educational articles',
    category: QuestCategory.COMMUNITY_LEARNING,
    actionType: QuestActionType.ARTICLE_READ,
    targetValue: 3,
    xpReward: 45,
    barleyReward: 10,
    repeatable: false,
    tierRequirement: 1,
  },
  {
    title: 'News junkie',
    description: 'Read 10 educational articles',
    category: QuestCategory.COMMUNITY_LEARNING,
    actionType: QuestActionType.ARTICLE_READ,
    targetValue: 10,
    xpReward: 130,
    barleyReward: 28,
    repeatable: false,
    tierRequirement: 1,
  },
  {
    title: 'Course graduate',
    description: 'Complete any Academy course',
    category: QuestCategory.COMMUNITY_LEARNING,
    actionType: QuestActionType.COURSE_COMPLETED,
    targetValue: 1,
    xpReward: 90,
    barleyReward: 20,
    repeatable: true,
    tierRequirement: 1,
  },
  {
    title: 'Badge collector (starter)',
    description: 'Earn any achievement badge',
    category: QuestCategory.COMMUNITY_LEARNING,
    actionType: QuestActionType.BADGE_EARNED,
    targetValue: 1,
    xpReward: 35,
    barleyReward: 8,
    repeatable: false,
    tierRequirement: 1,
  },
  {
    title: 'Badge collector (pro)',
    description: 'Earn 3 different badges',
    category: QuestCategory.COMMUNITY_LEARNING,
    actionType: QuestActionType.BADGE_EARNED,
    targetValue: 3,
    xpReward: 110,
    barleyReward: 22,
    repeatable: false,
    tierRequirement: 2,
  },
];

export async function seedDummyQuests(prisma: PrismaClient): Promise<number> {
  let count = 0;
  for (const q of DUMMY_QUESTS) {
    const payload = {
      title: q.title,
      description: q.description,
      category: q.category,
      actionType: q.actionType,
      targetValue: q.targetValue,
      xpReward: q.xpReward,
      barleyReward: q.barleyReward,
      repeatable: q.repeatable,
      tierRequirement: q.tierRequirement,
      expiry: q.expiry ?? null,
      autoClaim: q.autoClaim ?? false,
    };

    const existing = await prisma.quest.findFirst({
      where: { title: q.title },
    });

    if (existing) {
      await prisma.quest.update({
        where: { id: existing.id },
        data: {
          description: payload.description,
          category: payload.category,
          actionType: payload.actionType,
          targetValue: payload.targetValue,
          xpReward: payload.xpReward,
          barleyReward: payload.barleyReward,
          repeatable: payload.repeatable,
          tierRequirement: payload.tierRequirement,
          expiry: payload.expiry,
          autoClaim: payload.autoClaim,
        },
      });
    } else {
      await prisma.quest.create({ data: payload });
    }
    count++;
  }
  return count;
}
