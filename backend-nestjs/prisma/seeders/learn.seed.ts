import { PrismaClient, ArticleCategory, CourseLessonType } from '@prisma/client';

type ArticleSeed = {
  id: string;
  title: string;
  category: ArticleCategory;
  author: string;
  readTimeMinutes: number;
  thumbnailKey: string;
  tierRequirement: number;
  tags: string[];
  isFeatured: boolean;
  publishedAt: Date;
  body: string;
};

const ARTICLES: ArticleSeed[] = [
  {
    id: 'learn-article-intro',
    title: 'Introduction to Stock Markets',
    category: ArticleCategory.BASICS,
    author: 'StockQuest Academy',
    readTimeMinutes: 5,
    thumbnailKey: 'chart',
    tierRequirement: 1,
    tags: ['basics', 'stocks', 'markets'],
    isFeatured: true,
    publishedAt: new Date('2026-04-01'),
    body: `## Why companies issue stock

Companies sell shares to raise capital for hiring, R&D, and expansion. When you buy a share, you own a fraction of the business and participate in its success (or failure) through price changes and sometimes dividends.

## What drives price day to day

Orders from individuals, funds, and algorithms meet in an order book. News, earnings, interest rates, and sentiment all shift where buyers and sellers are willing to trade.

## Your edge in StockQuest

Paper trading lets you rehearse execution, sizing, and emotional control before committing real money. Treat each league as a lab notebook, not a slot machine.`,
  },
  {
    id: 'learn-article-orders',
    title: 'Market vs Limit Orders Explained',
    category: ArticleCategory.BASICS,
    author: 'Alex Rivera',
    readTimeMinutes: 4,
    thumbnailKey: 'notebook',
    tierRequirement: 1,
    tags: ['orders', 'execution', 'basics'],
    isFeatured: true,
    publishedAt: new Date('2026-03-28'),
    body: `## Market orders

A market order prioritizes speed: you accept the best available prices in the book right now. In fast markets or thin symbols, fills can slip versus what you saw on screen.

## Limit orders

A limit order sets a price ceiling (when buying) or floor (when selling). You may not fill immediately, but you control worst-case execution.

## When each shines

Many investors use limits for entries they have planned in advance, and markets when liquidity is deep and the plan is "get in now."`,
  },
  {
    id: 'learn-article-broker',
    title: 'Reading Your Brokerage Statement',
    category: ArticleCategory.BASICS,
    author: 'StockQuest Academy',
    readTimeMinutes: 3,
    thumbnailKey: 'layers',
    tierRequirement: 1,
    tags: ['broker', 'fees', 'cash'],
    isFeatured: false,
    publishedAt: new Date('2026-03-20'),
    body: `## Cash vs buying power

Cash is literal currency in the account. Buying power may include margin or unsettled proceeds from recent sales—rules differ by region and broker.

## Fees that add up

Commissions, regulatory fees, and spreads all drag on returns. In simulation we simplify, but in real life small leaks compound.

## Reconciliation habit

Once a month, compare your trades log to your statement. Catching one error early beats arguing six months later.`,
  },
  {
    id: 'learn-article-risk',
    title: 'Risk Management 101',
    category: ArticleCategory.RISK_MANAGEMENT,
    author: 'Risk Desk',
    readTimeMinutes: 6,
    thumbnailKey: 'shield',
    tierRequirement: 1,
    tags: ['risk', 'diversification', 'stops'],
    isFeatured: true,
    publishedAt: new Date('2026-03-15'),
    body: `## Position sizing

Cap how much of your portfolio rides on a single thesis. A common starting rule is risking under 1–2% of equity on any one trade's stop distance—but the exact number matters less than consistency.

## Stops as discipline

A stop is a pre-declared exit. Gaps and halts can skip through stops in real markets; in education we still practice the habit of defining invalidation.

## Correlation blind spots

Owning five tech names is not the same as diversification. Think in exposures: rates, consumer, energy, international, size factor.`,
  },
  {
    id: 'learn-article-drawdowns',
    title: 'Living Through Drawdowns',
    category: ArticleCategory.RISK_MANAGEMENT,
    author: 'Risk Desk',
    readTimeMinutes: 5,
    thumbnailKey: 'pulse',
    tierRequirement: 1,
    tags: ['drawdown', 'volatility', 'behavior'],
    isFeatured: false,
    publishedAt: new Date('2026-02-10'),
    body: `## Drawdowns are normal

Even great strategies spend long stretches underwater. What matters is whether the process still matches the environment it was designed for.

## Avoiding the death spiral

Revenge trading after losses often enlarges the hole. Pre-write rules: max daily loss, cool-off timer, when you reduce size automatically.

## Recovery math

A 50% loss needs a 100% gain to break even. Cutting losses early is how you stay in the game mathematically.`,
  },
  {
    id: 'learn-article-psych',
    title: 'Trading Psychology: Patience Pays',
    category: ArticleCategory.PSYCHOLOGY,
    author: 'Coach M.',
    readTimeMinutes: 4,
    thumbnailKey: 'mind',
    tierRequirement: 1,
    tags: ['psychology', 'discipline', 'journal'],
    isFeatured: true,
    publishedAt: new Date('2026-03-22'),
    body: `## Emotional cycles

Fear and greed are ancient software. Notice physical cues—tight shoulders, rushed clicks—before they become oversized positions.

## Journaling that works

For each trade: hypothesis, invalidation, actual exit, emotion tag (calm / FOMO / angry). Review weekly, not only on bad days.

## Identity trap

"I am a good trader because I won today" flips dangerously to "I am bad because I lost." Tie identity to process quality instead.`,
  },
  {
    id: 'learn-article-fomo',
    title: 'FOMO and the Fear of Missing a Rip',
    category: ArticleCategory.PSYCHOLOGY,
    author: 'Coach M.',
    readTimeMinutes: 4,
    thumbnailKey: 'target',
    tierRequirement: 1,
    tags: ['fomo', 'discipline'],
    isFeatured: false,
    publishedAt: new Date('2026-01-08'),
    body: `## Why FOMO spikes

Social feeds amplify rare winners. Your brain treats missing a parabolic move as loss—even if you never had an edge in that name.

## Pre-commitment

Before the open, list A-tier setups only. If a stock was not on the list, you need a written exception rule to chase it.

## Regret is cheaper than ruin

Skipping ten "maybe" trades that would have worked still beats one "definitely" trade that blows the account.`,
  },
  {
    id: 'learn-article-candles',
    title: 'Candlesticks Without the Hype',
    category: ArticleCategory.STRATEGY,
    author: 'Chart Lab',
    readTimeMinutes: 7,
    thumbnailKey: 'candle',
    tierRequirement: 1,
    tags: ['candlesticks', 'charts', 'price action'],
    isFeatured: false,
    publishedAt: new Date('2026-03-25'),
    body: `## What a candle encodes

Each candle shows open, high, low, close for an interval. Color only encodes direction relative to open—nothing magical.

## Common patterns as shorthand

Engulfing, doji, and hammers describe auction dynamics, not guarantees. Context (trend, volume, level) matters more than the label.

## Multi-timeframe habit

Use a higher timeframe for bias (up/down/sideways) and a lower one for execution. Fighting all timeframes at once invites whipsaw.`,
  },
  {
    id: 'learn-article-trend',
    title: 'Trend Following Basics',
    category: ArticleCategory.STRATEGY,
    author: 'Chart Lab',
    readTimeMinutes: 6,
    thumbnailKey: 'chart',
    tierRequirement: 1,
    tags: ['trend', 'moving averages', 'strategy'],
    isFeatured: false,
    publishedAt: new Date('2026-02-18'),
    body: `## Defining trend

Higher highs and higher lows suggest uptrend; the inverse for downtrend. Moving averages are one way to automate that visual scan.

## Whipsaw tax

Trend systems shine in persistent moves and bleed in chop. Expect drawdowns as the cost of insurance against missing the big one.

## Exit discipline

Decide in advance what invalidates the trend: break of a moving average, structure level, or time stop. Changing rules mid-trade erodes statistics.`,
  },
  {
    id: 'learn-article-moat',
    title: 'Economic Moats in Plain English',
    category: ArticleCategory.STRATEGY,
    author: 'Nina Patel',
    readTimeMinutes: 8,
    thumbnailKey: 'portfolio',
    tierRequirement: 1,
    tags: ['value', 'moat', 'fundamentals'],
    isFeatured: false,
    publishedAt: new Date('2026-03-10'),
    body: `## What is a moat?

A durable advantage—brand, network effects, cost scale, regulation—that lets a company earn above-average returns on capital for years.

## Moats erode

Technology and competition eat moats. Re-check thesis when gross margins compress or new entrants win share despite incumbent scale.

## Price still matters

A wonderful business at a silly price can be a bad stock for years. Moat analysis pairs with valuation, not instead of it.`,
  },
  {
    id: 'learn-article-growth',
    title: 'Growth vs Value: Labels, Not Religion',
    category: ArticleCategory.STRATEGY,
    author: 'Nina Patel',
    readTimeMinutes: 5,
    thumbnailKey: 'layers',
    tierRequirement: 1,
    tags: ['growth', 'value', 'styles'],
    isFeatured: false,
    publishedAt: new Date('2026-01-22'),
    body: `## Factor definitions drift

Indices label "growth" and "value" differently. Use fundamentals: reinvestment rate, ROIC trajectory, and cash conversion—not just the style box name.

## Cyclicality

Commodity producers can look "cheap" at peak cycle and "expensive" at trough. Normalize earnings through a cycle when possible.

## Blended approach

Many successful investors mix quality growth at fair prices with deep value specials. StockQuest leagues reward process, not purity tests.`,
  },
  {
    id: 'learn-article-macro',
    title: 'Rates, Inflation, and Stocks',
    category: ArticleCategory.MARKET_ANALYSIS,
    author: 'Macro Brief',
    readTimeMinutes: 7,
    thumbnailKey: 'macro',
    tierRequirement: 1,
    tags: ['rates', 'fed', 'macro'],
    isFeatured: false,
    publishedAt: new Date('2026-03-05'),
    body: `## Discount rates

Higher real rates tend to compress multiples, especially on long-duration cash flows (many growth equities). The linkage is noisy quarter to quarter.

## Inflation paths

Unexpected inflation helps some sectors (commodities, pricing power) and hurts others (fixed-rate lenders, input-cost takers).

## Data vs narrative

Watch revisions to payrolls, CPI, and PMIs—not only the headline print. Markets often trade the delta from expectations.`,
  },
  {
    id: 'learn-article-earnings',
    title: 'How to Skim an Earnings Release',
    category: ArticleCategory.MARKET_ANALYSIS,
    author: 'Macro Brief',
    readTimeMinutes: 6,
    thumbnailKey: 'notebook',
    tierRequirement: 1,
    tags: ['earnings', 'fundamentals', 'reports'],
    isFeatured: false,
    publishedAt: new Date('2026-02-02'),
    body: `## Start with guidance

Management's forward revenue and margin outlook often moves the stock more than last quarter's beat.

## Reconciliation items

One-time charges, stock comp, and tax rate swings distort GAAP EPS. Adjusted metrics can lie too—read the footnotes.

## Conference call tone

Analyst questions reveal where smart money is uncertain. Sudden topic clustering ("three questions on inventory") is a clue.`,
  },
  {
    id: 'learn-article-sentiment',
    title: 'Sentiment Indicators (Retail Edition)',
    category: ArticleCategory.MARKET_ANALYSIS,
    author: 'Data Desk',
    readTimeMinutes: 5,
    thumbnailKey: 'pulse',
    tierRequirement: 1,
    tags: ['sentiment', 'contrarian', 'survey'],
    isFeatured: false,
    publishedAt: new Date('2025-11-14'),
    body: `## Surveys and positioning

AAII, fund flows, and options skew paint a mosaic, not a dial. Extreme readings can persist in momentum regimes.

## Social volume ≠ edge

Trending tickers mean attention, not alpha. Combine attention spikes with fundamentals or catalysts before sizing.

## Mean reversion timing

Fading extremes early is how careers end. Wait for price confirmation that the crowded side is unwinding.`,
  },
  {
    id: 'learn-article-options-intro',
    title: 'Options Vocabulary You Actually Need',
    category: ArticleCategory.BASICS,
    author: 'Derivatives 101',
    readTimeMinutes: 6,
    thumbnailKey: 'layers',
    tierRequirement: 2,
    tags: ['options', 'definitions', 'tier2'],
    isFeatured: false,
    publishedAt: new Date('2026-03-18'),
    body: `## Calls and puts

A call profits when the underlying rises (before expiry, all else equal). A put profits when the underlying falls. Both have defined premium paid upfront for buyers.

## Strike and expiry

Strike is the exercise price. Expiry is when the contract ceases to exist. Shorter dated options decay faster (theta).

## Not advice

StockQuest may simulate simplified derivatives education. Real options involve complex tax, margin, and assignment rules.`,
  },
  {
    id: 'learn-article-volatility',
    title: 'Implied Volatility in One Sitting',
    category: ArticleCategory.STRATEGY,
    author: 'Derivatives 101',
    readTimeMinutes: 7,
    thumbnailKey: 'candle',
    tierRequirement: 2,
    tags: ['iv', 'volatility', 'tier2'],
    isFeatured: false,
    publishedAt: new Date('2026-02-26'),
    body: `## What IV represents

Implied volatility is the market's guess of future movement, backed out from option prices. High IV means expensive options; low IV, cheaper.

## Crush after events

Earnings often show IV spike before and "crush" after as uncertainty resolves. Directional traders still need the move to exceed what was priced.

## Skew snapshot

Put skew shows demand for downside protection. Sudden skew changes can flag event risk or fund flows.`,
  },
  {
    id: 'learn-article-factor',
    title: 'Factor Investing Snapshot',
    category: ArticleCategory.MARKET_ANALYSIS,
    author: 'Quant Corner',
    readTimeMinutes: 8,
    thumbnailKey: 'chart',
    tierRequirement: 2,
    tags: ['factors', 'beta', 'smart beta'],
    isFeatured: false,
    publishedAt: new Date('2026-01-30'),
    body: `## Size, value, momentum

Classic factors historically earned premia—not guaranteed forward. Implementation (rebalance rules, universe) drives outcomes.

## Crowding

When everyone owns the same factor ETF, drawdowns correlate. Diversify across orthogonal ideas, not just ticker count.

## Fit with leagues

In StockQuest, think about whether your league horizon rewards momentum bursts or slow mean reversion.`,
  },
  {
    id: 'learn-article-behavioral',
    title: 'Behavioral Biases in Portfolio Construction',
    category: ArticleCategory.PSYCHOLOGY,
    author: 'Coach M.',
    readTimeMinutes: 6,
    thumbnailKey: 'mind',
    tierRequirement: 2,
    tags: ['bias', 'anchoring', 'tier2'],
    isFeatured: false,
    publishedAt: new Date('2026-02-12'),
    body: `## Home bias

Investors overweight domestic stocks because they "feel safer." Consider intentional international sleeves even when home markets rally.

## Anchoring to purchase price

Cost basis is accounting, not thesis. If fundamentals deteriorate, the right action is often exit—regardless of whether you are green or red.

## Mental accounting

Separating "house money" from principal encourages reckless risk. One portfolio, one risk budget.`,
  },
  {
    id: 'learn-article-capm',
    title: 'CAPM and Cost of Equity (Advanced)',
    category: ArticleCategory.MARKET_ANALYSIS,
    author: 'Quant Corner',
    readTimeMinutes: 9,
    thumbnailKey: 'macro',
    tierRequirement: 3,
    tags: ['capm', 'wacc', 'tier3'],
    isFeatured: false,
    publishedAt: new Date('2026-03-12'),
    body: `## The intuition

CAPM links expected return to beta relative to the market portfolio. It is a classroom starting point, not a crystal ball—empirical premia wobble decade to decade.

## From CAPM to WACC

Weighted average cost of capital blends equity and debt costs. Analysts use WACC to discount free cash flows in DCF models.

## Model humility

Sensitivity tables beat false precision. Small changes in terminal growth or WACC swing "fair value" wildly—communicate ranges.`,
  },
  {
    id: 'learn-article-alts',
    title: 'Alternative Assets and Correlation',
    category: ArticleCategory.RISK_MANAGEMENT,
    author: 'Risk Desk',
    readTimeMinutes: 7,
    thumbnailKey: 'shield',
    tierRequirement: 3,
    tags: ['alts', 'correlation', 'tier3'],
    isFeatured: false,
    publishedAt: new Date('2026-01-05'),
    body: `## Promised decorrelation

Many alts marketed as diversifiers correlated to equities in stress (2008, 2020). Read liquidity terms and crisis behavior, not just marketing decks.

## Illiquidity premium

Lockups can pay extra return for bearing illiquidity. Match horizon: do not lock five-year capital if your goals are one year out.

## Size appropriately

Alts as satellite sleeves—not core replacements—unless you truly understand the cash flow mechanics.`,
  },
];

type QSeed = {
  text: string;
  options: string[];
  correctIndex: number;
  points: number;
  explanation: string;
};

async function upsertQuiz(
  prisma: PrismaClient,
  id: string,
  meta: {
    title: string;
    description: string | null;
    tierUnlocked: number;
    tierRequirement: number;
    isTierPrerequisite: boolean;
    passScore: number;
    cooldownMinutes: number;
  },
  questions: QSeed[],
) {
  await prisma.quiz.upsert({
    where: { id },
    create: {
      id,
      title: meta.title,
      description: meta.description,
      tierUnlocked: meta.tierUnlocked,
      tierRequirement: meta.tierRequirement,
      isTierPrerequisite: meta.isTierPrerequisite,
      passScore: meta.passScore,
      cooldownMinutes: meta.cooldownMinutes,
    },
    update: {
      title: meta.title,
      description: meta.description,
      tierUnlocked: meta.tierUnlocked,
      tierRequirement: meta.tierRequirement,
      isTierPrerequisite: meta.isTierPrerequisite,
      passScore: meta.passScore,
      cooldownMinutes: meta.cooldownMinutes,
    },
  });
  await prisma.quizQuestion.deleteMany({ where: { quizId: id } });
  await prisma.quizQuestion.createMany({
    data: questions.map((q) => ({
      quizId: id,
      text: q.text,
      options: q.options,
      correctIndex: q.correctIndex,
      points: q.points,
      explanation: q.explanation,
    })),
  });
}

async function upsertCourseWithLessons(
  prisma: PrismaClient,
  course: {
    id: string;
    title: string;
    description: string;
    category: ArticleCategory;
    thumbnailKey: string;
    tierRequirement: number;
    xpReward: number;
    barleyReward: number;
    estimatedMinutes: number;
    publishedAt: Date;
  },
  lessons: Array<{
    orderIndex: number;
    lessonType: CourseLessonType;
    referenceId: string;
    title: string;
  }>,
) {
  await prisma.course.upsert({
    where: { id: course.id },
    create: {
      ...course,
    },
    update: {
      title: course.title,
      description: course.description,
      category: course.category,
      thumbnailKey: course.thumbnailKey,
      tierRequirement: course.tierRequirement,
      xpReward: course.xpReward,
      barleyReward: course.barleyReward,
      estimatedMinutes: course.estimatedMinutes,
      publishedAt: course.publishedAt,
    },
  });
  await prisma.courseLesson.deleteMany({ where: { courseId: course.id } });
  await prisma.courseLesson.createMany({
    data: lessons.map((l) => ({
      courseId: course.id,
      orderIndex: l.orderIndex,
      lessonType: l.lessonType,
      referenceId: l.referenceId,
      title: l.title,
    })),
  });
}

export async function seedLearnContent(prisma: PrismaClient) {
  await prisma.learnConfig.upsert({
    where: { id: 'default' },
    create: { id: 'default', articleMinReadFraction: 0.6 },
    update: {},
  });

  for (const a of ARTICLES) {
    await prisma.article.upsert({
      where: { id: a.id },
      create: {
        id: a.id,
        title: a.title,
        category: a.category,
        author: a.author,
        readTimeMinutes: a.readTimeMinutes,
        thumbnailKey: a.thumbnailKey,
        body: a.body,
        tierRequirement: a.tierRequirement,
        tags: a.tags,
        isFeatured: a.isFeatured,
        publishedAt: a.publishedAt,
      },
      update: {
        title: a.title,
        category: a.category,
        author: a.author,
        readTimeMinutes: a.readTimeMinutes,
        thumbnailKey: a.thumbnailKey,
        body: a.body,
        tierRequirement: a.tierRequirement,
        tags: a.tags,
        isFeatured: a.isFeatured,
        publishedAt: a.publishedAt,
      },
    });
  }

  await upsertQuiz(prisma, 'quiz-practice-basics', {
    title: 'Practice: Market Basics',
    description:
      'General knowledge — does not unlock a tier. Retakes allowed; XP only on first pass.',
    tierUnlocked: 1,
    tierRequirement: 1,
    isTierPrerequisite: false,
    passScore: 0.7,
    cooldownMinutes: 15,
  }, [
    {
      text: 'A share of stock represents:',
      options: [
        'A loan you made to the company',
        'Partial ownership in the company',
        'A fixed interest payment',
        'A commodity futures contract',
      ],
      correctIndex: 1,
      points: 1,
      explanation: 'Equity shares are ownership stakes, not debt.',
    },
    {
      text: 'Diversification mainly reduces:',
      options: [
        'All forms of risk to zero',
        'Company-specific (idiosyncratic) risk',
        'Taxes owed on gains',
        'Market hours',
      ],
      correctIndex: 1,
      points: 1,
      explanation: 'You still keep broad market (systematic) risk.',
    },
    {
      text: 'A stock exchange primarily provides:',
      options: [
        'Guaranteed returns to investors',
        'Liquidity and price discovery',
        'Insurance against losses',
        'Fixed interest on deposits',
      ],
      correctIndex: 1,
      points: 1,
      explanation: 'Exchanges match orders and publish transparent prices.',
    },
  ]);

  await upsertQuiz(prisma, 'quiz-practice-technical', {
    title: 'Practice: Charts & Price Action',
    description: 'Sharpen reading of trends, candles, and context.',
    tierUnlocked: 1,
    tierRequirement: 1,
    isTierPrerequisite: false,
    passScore: 0.75,
    cooldownMinutes: 20,
  }, [
    {
      text: 'A candlestick shows, at minimum:',
      options: ['Only closing price', 'Open, high, low, close', 'Volume only', 'Dividend yield'],
      correctIndex: 1,
      points: 1,
      explanation: 'OHLC is the core of each candle for that interval.',
    },
    {
      text: 'Higher highs and higher lows most suggest:',
      options: ['Downtrend', 'Uptrend', 'No trend', 'Halting auctions'],
      correctIndex: 1,
      points: 1,
      explanation: 'Structure of peaks and troughs defines trend.',
    },
    {
      text: 'Moving averages are often used to:',
      options: [
        'Predict exact prices',
        'Smooth noise and visualize trend',
        'Eliminate all losses',
        'Replace fundamental analysis',
      ],
      correctIndex: 1,
      points: 1,
      explanation: 'MAs lag price; they summarize past behavior.',
    },
    {
      text: 'Support is best thought of as:',
      options: [
        'A magical line',
        'A zone where demand has historically appeared',
        'The highest price ever',
        'A tax bracket',
      ],
      correctIndex: 1,
      points: 1,
      explanation: 'Levels are zones of interest, not guarantees.',
    },
  ]);

  await upsertQuiz(prisma, 'quiz-practice-risk', {
    title: 'Practice: Risk & Drawdowns',
    description: 'Sizing, stops, and survival math.',
    tierUnlocked: 1,
    tierRequirement: 1,
    isTierPrerequisite: false,
    passScore: 0.75,
    cooldownMinutes: 20,
  }, [
    {
      text: 'Position sizing should generally:',
      options: [
        'Put 100% in one ticker for max return',
        'Align with max loss you can tolerate per trade',
        'Ignore volatility',
        'Double after every loss',
      ],
      correctIndex: 1,
      points: 1,
      explanation: 'Risk per trade is a function of size and stop distance.',
    },
    {
      text: 'A 20% portfolio drawdown requires roughly what gain to recover?',
      options: ['20%', '25%', '40%', '10%'],
      correctIndex: 1,
      points: 1,
      explanation: '100/80 − 1 = 25% gain needed on remaining capital.',
    },
    {
      text: 'Correlation between two stocks measures:',
      options: [
        'Which CEO is taller',
        'How returns move together over time',
        'Guaranteed future beta',
        'Dividend safety only',
      ],
      correctIndex: 1,
      points: 1,
      explanation: 'Correlation is a statistical co-movement measure.',
    },
  ]);

  await upsertQuiz(prisma, 'quiz-practice-strategy', {
    title: 'Practice: Strategy & Moats',
    description: 'Business quality, styles, and fundamentals.',
    tierUnlocked: 1,
    tierRequirement: 1,
    isTierPrerequisite: false,
    passScore: 0.75,
    cooldownMinutes: 25,
  }, [
    {
      text: 'An economic moat refers to:',
      options: [
        'A literal fence',
        'A durable competitive advantage',
        'Short-term hype',
        'CEO tenure only',
      ],
      correctIndex: 1,
      points: 1,
      explanation: 'Moats protect returns on invested capital.',
    },
    {
      text: 'Growth investing typically emphasizes:',
      options: [
        'Only low P/E ratios',
        'Reinvestment and expanding earnings power',
        'Ignoring financial statements',
        'Tax evasion',
      ],
      correctIndex: 1,
      points: 1,
      explanation: 'Growth focuses on trajectory of fundamentals.',
    },
    {
      text: 'Value investing often starts with:',
      options: [
        'Chasing parabolic charts',
        'Price vs intrinsic worth of the business',
        'Random stock picks',
        'Maximum margin usage',
      ],
      correctIndex: 1,
      points: 1,
      explanation: 'Margin of safety is a core concept.',
    },
    {
      text: 'Diversification across sectors mainly reduces:',
      options: [
        'All market risk',
        'Concentration in single-industry shocks',
        'Tax filing requirements',
        'Need for any research',
      ],
      correctIndex: 1,
      points: 1,
      explanation: 'Sector spread reduces idiosyncratic industry risk.',
    },
  ]);

  await upsertQuiz(prisma, 'quiz-practice-macro', {
    title: 'Practice: Macro & Markets',
    description: 'Rates, inflation, and how markets discount news.',
    tierUnlocked: 1,
    tierRequirement: 1,
    isTierPrerequisite: false,
    passScore: 0.7,
    cooldownMinutes: 20,
  }, [
    {
      text: 'Higher real interest rates often pressure:',
      options: [
        'Only bond prices',
        'Long-duration equity valuations among other assets',
        'Nothing',
        'Only commodity demand',
      ],
      correctIndex: 1,
      points: 1,
      explanation: 'Discount rates affect present value of future cash flows.',
    },
    {
      text: 'CPI measures:',
      options: [
        'CEO popularity',
        'Consumer price inflation',
        'Corporate tax rates',
        'Stock buyback pace',
      ],
      correctIndex: 1,
      points: 1,
      explanation: 'CPI tracks a basket of consumer prices.',
    },
    {
      text: 'Earnings guidance refers to:',
      options: [
        'Past dividends only',
        "Management's forward-looking outlook",
        'Analyst gossip',
        'Sports scores',
      ],
      correctIndex: 1,
      points: 1,
      explanation: 'Guidance frames expectations for future results.',
    },
  ]);

  await upsertQuiz(prisma, 'quiz-practice-psych', {
    title: 'Practice: Psychology & Discipline',
    description: 'FOMO, journaling, and process.',
    tierUnlocked: 1,
    tierRequirement: 1,
    isTierPrerequisite: false,
    passScore: 0.7,
    cooldownMinutes: 15,
  }, [
    {
      text: 'Journaling trades primarily helps:',
      options: [
        'Guarantee profits',
        'Spot patterns in decisions and emotions',
        'Replace risk limits',
        'Avoid taxes',
      ],
      correctIndex: 1,
      points: 1,
      explanation: 'Review improves self-awareness over time.',
    },
    {
      text: 'FOMO-driven entries often:',
      options: [
        'Improve average entry quality',
        'Chase price after attention spikes',
        'Eliminate volatility',
        'Guarantee liquidity',
      ],
      correctIndex: 1,
      points: 1,
      explanation: 'Attention spikes can mean late, crowded trades.',
    },
    {
      text: 'A written trading plan should include:',
      options: [
        'Only ticker symbols',
        'Setups, invalidation, and risk rules',
        'Borrowed opinions only',
        'Nothing about exits',
      ],
      correctIndex: 1,
      points: 1,
      explanation: 'Plans reduce improvisation under stress.',
    },
  ]);

  await upsertQuiz(prisma, 'quiz-practice-intermediate', {
    title: 'Practice: Intermediate Mix',
    description: 'Mixed topics for players who completed basics. Tier 2 required to attempt.',
    tierUnlocked: 2,
    tierRequirement: 2,
    isTierPrerequisite: false,
    passScore: 0.8,
    cooldownMinutes: 30,
  }, [
    {
      text: 'Beta in the CAPM framework most closely reflects:',
      options: [
        'Dividend payout ratio',
        'Sensitivity of asset returns to the market',
        'Company age',
        'CEO compensation',
      ],
      correctIndex: 1,
      points: 1,
      explanation: 'Beta scales covariance with the market.',
    },
    {
      text: 'Implied volatility is derived from:',
      options: ['Only past returns', 'Option prices in the market', 'GDP alone', 'Random draws'],
      correctIndex: 1,
      points: 1,
      explanation: 'IV is the market-implied uncertainty priced into options.',
    },
    {
      text: 'WACC is used to:',
      options: [
        'Measure past volume',
        'Discount expected future cash flows in models',
        'Set broker commissions',
        'Compute short interest',
      ],
      correctIndex: 1,
      points: 1,
      explanation: 'WACC blends costs of equity and debt financing.',
    },
    {
      text: 'Factor crowding can lead to:',
      options: [
        'Guaranteed alpha',
        'Higher correlation during selloffs',
        'Removal of all risk',
        'Fixed returns',
      ],
      correctIndex: 1,
      points: 1,
      explanation: 'Popular trades unwind together when sentiment shifts.',
    },
  ]);

  await upsertQuiz(prisma, 'quiz-tier-2-gate', {
    title: 'Intermediate track',
    description: 'Unlock Tier 2 (Intermediate)',
    tierUnlocked: 2,
    tierRequirement: 1,
    isTierPrerequisite: true,
    passScore: 0.8,
    cooldownMinutes: 30,
  }, [
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
      explanation: 'Diversification spreads firm-specific exposure across many names.',
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
      explanation: 'Limit orders cap the price you pay or accept when selling.',
    },
    {
      text: 'Market capitalization is calculated as:',
      options: [
        'Debt minus cash',
        'Share price times shares outstanding',
        'Revenue divided by employees',
        'EPS times P/E of peers',
      ],
      correctIndex: 1,
      points: 1,
      explanation: 'Market cap weights price by float.',
    },
    {
      text: 'Liquidity in a stock generally means:',
      options: [
        'High dividend yield only',
        'Ability to trade size without large price impact',
        'Low volatility forever',
        'Government backing',
      ],
      correctIndex: 1,
      points: 1,
      explanation: 'Tight spreads and depth imply better liquidity.',
    },
  ]);

  await upsertQuiz(prisma, 'quiz-practice-advanced-capstone', {
    title: 'Practice: Advanced Capstone',
    description:
      'Capstone for Tier 3 learners — not a tier gate. Synthesizes valuation and risk themes.',
    tierUnlocked: 3,
    tierRequirement: 3,
    isTierPrerequisite: false,
    passScore: 0.82,
    cooldownMinutes: 45,
  }, [
    {
      text: 'In a DCF, increasing terminal growth by 1% while holding WACC fixed typically:',
      options: [
        'Lowers fair value',
        'Raises fair value',
        'Has no effect',
        'Removes terminal value',
      ],
      correctIndex: 1,
      points: 1,
      explanation: 'Higher perpetual growth increases the tail of cash flows.',
    },
    {
      text: 'Equity risk premium represents:',
      options: [
        'Dividend yield minus inflation',
        'Extra return investors demand over a risk-free rate',
        'Broker commission',
        'Short interest ratio',
      ],
      correctIndex: 1,
      points: 1,
      explanation: 'ERP compensates for bearing equity volatility.',
    },
    {
      text: 'During liquidity stress, correlations between risky assets often:',
      options: [
        'Approach zero',
        'Move toward one',
        'Invert randomly',
        'Ignore fundamentals',
      ],
      correctIndex: 1,
      points: 1,
      explanation: 'Flight-to-quality and deleveraging sync selling.',
    },
    {
      text: 'A limitation of historical VaR is that it:',
      options: [
        'Uses only future data',
        'May underestimate tail risk from unseen regimes',
        'Ignores all prices',
        'Requires options data',
      ],
      correctIndex: 1,
      points: 1,
      explanation: 'Past distribution may not include crisis dynamics.',
    },
  ]);

  await upsertQuiz(prisma, 'quiz-tier-3-gate', {
    title: 'Advanced track',
    description: 'Unlock Tier 3 (Advanced)',
    tierUnlocked: 3,
    tierRequirement: 2,
    isTierPrerequisite: true,
    passScore: 0.85,
    cooldownMinutes: 60,
  }, [
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
      explanation: 'Beta is covariance with the market scaled by market variance.',
    },
    {
      text: 'In a DCF, terminal value sensitivity is high because:',
      options: [
        'It ignores cash flows',
        'Small growth assumptions compound far into the future',
        'It only uses book value',
        'It excludes taxes',
      ],
      correctIndex: 1,
      points: 1,
      explanation: 'Perpetuity math magnifies tiny growth changes.',
    },
    {
      text: 'A covered call strategy involves:',
      options: [
        'Buying two calls',
        'Owning stock and selling a call against it',
        'Shorting stock naked',
        'Only buying puts',
      ],
      correctIndex: 1,
      points: 1,
      explanation: 'Covered calls monetize upside optionality you sell to others.',
    },
  ]);

  const quizTier2 = await prisma.quiz.findUniqueOrThrow({ where: { id: 'quiz-tier-2-gate' } });
  const quizTier3 = await prisma.quiz.findUniqueOrThrow({ where: { id: 'quiz-tier-3-gate' } });

  await upsertCourseWithLessons(
    prisma,
    {
      id: 'learn-course-starter',
      title: 'Starter Investing Path',
      description: 'Markets, orders, your first practice quiz — the on-ramp every player should finish.',
      category: ArticleCategory.BASICS,
      thumbnailKey: 'academy',
      tierRequirement: 1,
      xpReward: 150,
      barleyReward: 75,
      estimatedMinutes: 35,
      publishedAt: new Date('2026-03-30'),
    },
    [
      {
        orderIndex: 0,
        lessonType: CourseLessonType.ARTICLE,
        referenceId: 'learn-article-intro',
        title: 'Introduction to Stock Markets',
      },
      {
        orderIndex: 1,
        lessonType: CourseLessonType.ARTICLE,
        referenceId: 'learn-article-orders',
        title: 'Market vs Limit Orders Explained',
      },
      {
        orderIndex: 2,
        lessonType: CourseLessonType.ARTICLE,
        referenceId: 'learn-article-broker',
        title: 'Reading Your Brokerage Statement',
      },
      {
        orderIndex: 3,
        lessonType: CourseLessonType.QUIZ,
        referenceId: 'quiz-practice-basics',
        title: 'Practice: Market Basics',
      },
    ],
  );

  await upsertCourseWithLessons(
    prisma,
    {
      id: 'learn-course-technical-lab',
      title: 'Technical Analysis Lab',
      description: 'Candles, trends, and chart literacy — then a skills check.',
      category: ArticleCategory.STRATEGY,
      thumbnailKey: 'candle',
      tierRequirement: 1,
      xpReward: 180,
      barleyReward: 90,
      estimatedMinutes: 45,
      publishedAt: new Date('2026-03-27'),
    },
    [
      {
        orderIndex: 0,
        lessonType: CourseLessonType.ARTICLE,
        referenceId: 'learn-article-candles',
        title: 'Candlesticks Without the Hype',
      },
      {
        orderIndex: 1,
        lessonType: CourseLessonType.ARTICLE,
        referenceId: 'learn-article-trend',
        title: 'Trend Following Basics',
      },
      {
        orderIndex: 2,
        lessonType: CourseLessonType.QUIZ,
        referenceId: 'quiz-practice-technical',
        title: 'Practice: Charts & Price Action',
      },
    ],
  );

  await upsertCourseWithLessons(
    prisma,
    {
      id: 'learn-course-risk-studio',
      title: 'Risk & Survival Studio',
      description: 'Sizing, drawdowns, and the math of staying in the game.',
      category: ArticleCategory.RISK_MANAGEMENT,
      thumbnailKey: 'shield',
      tierRequirement: 1,
      xpReward: 160,
      barleyReward: 80,
      estimatedMinutes: 40,
      publishedAt: new Date('2026-03-21'),
    },
    [
      {
        orderIndex: 0,
        lessonType: CourseLessonType.ARTICLE,
        referenceId: 'learn-article-risk',
        title: 'Risk Management 101',
      },
      {
        orderIndex: 1,
        lessonType: CourseLessonType.ARTICLE,
        referenceId: 'learn-article-drawdowns',
        title: 'Living Through Drawdowns',
      },
      {
        orderIndex: 2,
        lessonType: CourseLessonType.QUIZ,
        referenceId: 'quiz-practice-risk',
        title: 'Practice: Risk & Drawdowns',
      },
    ],
  );

  await upsertCourseWithLessons(
    prisma,
    {
      id: 'learn-course-fundamentals-track',
      title: 'Fundamentals & Moats Track',
      description: 'From moats to growth vs value labels — then a strategy quiz.',
      category: ArticleCategory.STRATEGY,
      thumbnailKey: 'portfolio',
      tierRequirement: 1,
      xpReward: 170,
      barleyReward: 85,
      estimatedMinutes: 42,
      publishedAt: new Date('2026-03-14'),
    },
    [
      {
        orderIndex: 0,
        lessonType: CourseLessonType.ARTICLE,
        referenceId: 'learn-article-moat',
        title: 'Economic Moats in Plain English',
      },
      {
        orderIndex: 1,
        lessonType: CourseLessonType.ARTICLE,
        referenceId: 'learn-article-growth',
        title: 'Growth vs Value: Labels, Not Religion',
      },
      {
        orderIndex: 2,
        lessonType: CourseLessonType.QUIZ,
        referenceId: 'quiz-practice-strategy',
        title: 'Practice: Strategy & Moats',
      },
    ],
  );

  await upsertCourseWithLessons(
    prisma,
    {
      id: 'learn-course-macro-desk',
      title: 'Macro & News Desk',
      description: 'Rates, inflation, earnings skim — tie headlines to portfolio thinking.',
      category: ArticleCategory.MARKET_ANALYSIS,
      thumbnailKey: 'macro',
      tierRequirement: 1,
      xpReward: 165,
      barleyReward: 82,
      estimatedMinutes: 44,
      publishedAt: new Date('2026-03-08'),
    },
    [
      {
        orderIndex: 0,
        lessonType: CourseLessonType.ARTICLE,
        referenceId: 'learn-article-macro',
        title: 'Rates, Inflation, and Stocks',
      },
      {
        orderIndex: 1,
        lessonType: CourseLessonType.ARTICLE,
        referenceId: 'learn-article-earnings',
        title: 'How to Skim an Earnings Release',
      },
      {
        orderIndex: 2,
        lessonType: CourseLessonType.ARTICLE,
        referenceId: 'learn-article-sentiment',
        title: 'Sentiment Indicators (Retail Edition)',
      },
      {
        orderIndex: 3,
        lessonType: CourseLessonType.QUIZ,
        referenceId: 'quiz-practice-macro',
        title: 'Practice: Macro & Markets',
      },
    ],
  );

  await upsertCourseWithLessons(
    prisma,
    {
      id: 'learn-course-mindset-lab',
      title: 'Mindset & Discipline Lab',
      description: 'Psychology modules and a habits quiz.',
      category: ArticleCategory.PSYCHOLOGY,
      thumbnailKey: 'mind',
      tierRequirement: 1,
      xpReward: 140,
      barleyReward: 70,
      estimatedMinutes: 28,
      publishedAt: new Date('2026-03-19'),
    },
    [
      {
        orderIndex: 0,
        lessonType: CourseLessonType.ARTICLE,
        referenceId: 'learn-article-psych',
        title: 'Trading Psychology: Patience Pays',
      },
      {
        orderIndex: 1,
        lessonType: CourseLessonType.ARTICLE,
        referenceId: 'learn-article-fomo',
        title: 'FOMO and the Fear of Missing a Rip',
      },
      {
        orderIndex: 2,
        lessonType: CourseLessonType.QUIZ,
        referenceId: 'quiz-practice-psych',
        title: 'Practice: Psychology & Discipline',
      },
    ],
  );

  await upsertCourseWithLessons(
    prisma,
    {
      id: 'learn-course-intermediate-bridge',
      title: 'Intermediate Bridge (Tier 2)',
      description: 'Options vocabulary, volatility, factors — for players who unlocked Tier 2.',
      category: ArticleCategory.STRATEGY,
      thumbnailKey: 'layers',
      tierRequirement: 2,
      xpReward: 220,
      barleyReward: 110,
      estimatedMinutes: 55,
      publishedAt: new Date('2026-03-03'),
    },
    [
      {
        orderIndex: 0,
        lessonType: CourseLessonType.ARTICLE,
        referenceId: 'learn-article-options-intro',
        title: 'Options Vocabulary You Actually Need',
      },
      {
        orderIndex: 1,
        lessonType: CourseLessonType.ARTICLE,
        referenceId: 'learn-article-volatility',
        title: 'Implied Volatility in One Sitting',
      },
      {
        orderIndex: 2,
        lessonType: CourseLessonType.ARTICLE,
        referenceId: 'learn-article-factor',
        title: 'Factor Investing Snapshot',
      },
      {
        orderIndex: 3,
        lessonType: CourseLessonType.ARTICLE,
        referenceId: 'learn-article-behavioral',
        title: 'Behavioral Biases in Portfolio Construction',
      },
      {
        orderIndex: 4,
        lessonType: CourseLessonType.QUIZ,
        referenceId: 'quiz-practice-intermediate',
        title: 'Practice: Intermediate Mix',
      },
    ],
  );

  await upsertCourseWithLessons(
    prisma,
    {
      id: 'learn-course-advanced-spotlight',
      title: 'Advanced Spotlight (Tier 3)',
      description: 'Deeper risk and valuation concepts for Tier 3 players.',
      category: ArticleCategory.MARKET_ANALYSIS,
      thumbnailKey: 'pulse',
      tierRequirement: 3,
      xpReward: 260,
      barleyReward: 130,
      estimatedMinutes: 40,
      publishedAt: new Date('2026-02-28'),
    },
    [
      {
        orderIndex: 0,
        lessonType: CourseLessonType.ARTICLE,
        referenceId: 'learn-article-capm',
        title: 'CAPM and Cost of Equity (Advanced)',
      },
      {
        orderIndex: 1,
        lessonType: CourseLessonType.ARTICLE,
        referenceId: 'learn-article-alts',
        title: 'Alternative Assets and Correlation',
      },
      {
        orderIndex: 2,
        lessonType: CourseLessonType.QUIZ,
        referenceId: 'quiz-practice-advanced-capstone',
        title: 'Practice: Advanced Capstone',
      },
    ],
  );

  console.log(
    `Learn content: ${ARTICLES.length} articles, 10 quizzes (8 practice + 2 tier gates), 8 courses.`,
  );

  return { quizTier2, quizTier3 };
}
