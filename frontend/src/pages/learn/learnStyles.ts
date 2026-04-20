import type { ArticleCategory } from './types';

export const categoryLabel: Record<ArticleCategory, string> = {
  BASICS: 'Basics',
  STRATEGY: 'Strategy',
  RISK_MANAGEMENT: 'Risk',
  MARKET_ANALYSIS: 'Markets',
  PSYCHOLOGY: 'Psychology',
};

export const categoryColor: Record<ArticleCategory, string> = {
  BASICS: 'bg-sky-600/30 text-sky-200 border-sky-500/40',
  STRATEGY: 'bg-violet-600/30 text-violet-200 border-violet-500/40',
  RISK_MANAGEMENT: 'bg-amber-600/30 text-amber-200 border-amber-500/40',
  MARKET_ANALYSIS: 'bg-emerald-600/30 text-emerald-200 border-emerald-500/40',
  PSYCHOLOGY: 'bg-rose-600/30 text-rose-200 border-rose-500/40',
};
