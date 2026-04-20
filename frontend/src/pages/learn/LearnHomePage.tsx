import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame } from 'lucide-react';
import { learnHeaders, learnUrl } from './learnApi';
import { categoryColor, categoryLabel } from './learnStyles';
import { MediaThumb } from './MediaThumb';
import type { ArticleCategory } from './types';

type HomeData = {
  user: { tier: number; level: number };
  tierStatus: {
    tier: number;
    nextTier: number | null;
    nextTierName?: string;
    minLevelForNextTier?: number;
    prerequisiteQuizId?: string | null;
    levelOk: boolean;
    quizOk: boolean;
    pending: 'xp' | 'quiz' | null;
  };
  streak: { currentStreak: number; longestStreak: number };
  stats: { articlesRead: number; coursesCompleted: number; quizzesPassed: number };
  continueItem: {
    type: 'article' | 'course';
    id: string;
    title: string;
    progressPct: number;
  } | null;
  featured: Array<{
    id: string;
    title: string;
    category: ArticleCategory;
    readTimeMinutes: number;
    thumbnailKey: string;
  }>;
  recommended: Array<{ kind: 'article' | 'course'; id: string; title: string; subtitle: string }>;
  recent: Array<{
    kind: 'article' | 'course';
    id: string;
    title: string;
    publishedAt: string;
    thumbnailKey: string;
  }>;
};

export function LearnHomePage() {
  const [data, setData] = useState<HomeData | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(learnUrl('/home'), { headers: learnHeaders() });
        if (!res.ok) throw new Error('Failed to load');
        setData(await res.json());
      } catch {
        setErr('Could not load Learn home.');
      }
    })();
  }, []);

  if (err) return <p className="text-red-400 font-bold">{err}</p>;
  if (!data) return <p className="text-zinc-500 animate-pulse">Loading…</p>;

  const ts = data.tierStatus;
  const nextTier = ts.nextTier;
  const prereqQuizId = ts.prerequisiteQuizId ?? null;

  return (
    <div className="flex flex-col gap-10">
      {data.continueItem && (
        <section className="rounded-2xl border border-sky-500/30 bg-gradient-to-br from-sky-950/50 to-[#151515] p-6">
          <p className="text-xs font-black uppercase tracking-widest text-sky-400 mb-2">
            Continue learning
          </p>
          <h2 className="text-xl font-black text-white mb-2">{data.continueItem.title}</h2>
          <div className="h-2 rounded-full bg-zinc-800 mb-4 overflow-hidden">
            <div
              className="h-full bg-sky-500 transition-all"
              style={{ width: `${data.continueItem.progressPct}%` }}
            />
          </div>
          <Link
            to={
              data.continueItem.type === 'article'
                ? `/learn/articles/${data.continueItem.id}`
                : `/learn/courses/${data.continueItem.id}`
            }
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold px-4 py-2 rounded-lg text-sm"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      )}

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-[#1a1a1a] p-4">
          <p className="text-zinc-500 text-xs font-bold uppercase">Articles read</p>
          <p className="text-3xl font-black text-white">{data.stats.articlesRead}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-[#1a1a1a] p-4">
          <p className="text-zinc-500 text-xs font-bold uppercase">Courses done</p>
          <p className="text-3xl font-black text-white">{data.stats.coursesCompleted}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-[#1a1a1a] p-4">
          <p className="text-zinc-500 text-xs font-bold uppercase">Quizzes passed</p>
          <p className="text-3xl font-black text-white">{data.stats.quizzesPassed}</p>
        </div>
        <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-4 flex flex-col gap-1">
          <p className="text-amber-200/80 text-xs font-bold uppercase flex items-center gap-1">
            <Flame className="w-4 h-4 text-orange-400" />
            Learning streak
          </p>
          <p className="text-3xl font-black text-white">{data.streak.currentStreak} days</p>
          <p className="text-xs text-zinc-500">Best: {data.streak.longestStreak} days</p>
        </div>
      </section>

      {nextTier && (
        <section className="rounded-2xl border border-zinc-800 bg-[#1a1a1a] p-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4">
            Tier unlock path
          </h3>
          <div className="flex flex-wrap items-center gap-4 text-white">
            <span className="font-black text-lg">Tier {data.user.tier}</span>
            <ArrowRight className="w-4 h-4 text-zinc-600" />
            <span className="font-black text-lg text-sky-400">
              Tier {nextTier}: {ts.nextTierName}
            </span>
          </div>
          <div className="mt-4 space-y-2 text-sm text-zinc-300">
            <p>
              Level requirement:{' '}
              <span className={ts.levelOk ? 'text-emerald-400' : 'text-amber-300'}>
                {ts.levelOk ? 'Met' : `Need level ${ts.minLevelForNextTier} (you are ${data.user.level})`}
              </span>
            </p>
            <p className="flex flex-wrap items-center gap-2">
              Prerequisite quiz:{' '}
              <span className={ts.quizOk ? 'text-emerald-400' : 'text-amber-300'}>
                {ts.quizOk ? 'Passed' : 'Not passed'}
              </span>
              {!ts.quizOk && prereqQuizId && (
                <Link
                  to={`/learn/quizzes/${prereqQuizId}`}
                  className="ml-2 text-xs font-bold bg-sky-600 px-3 py-1 rounded-lg text-white hover:bg-sky-500"
                >
                  Take quiz
                </Link>
              )}
            </p>
          </div>
        </section>
      )}

      <section>
        <h3 className="text-lg font-black text-white mb-3">Featured articles</h3>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {data.featured.map((a) => (
            <Link
              key={a.id}
              to={`/learn/articles/${a.id}`}
              className="min-w-[240px] max-w-[260px] rounded-xl border border-zinc-800 bg-[#151515] overflow-hidden hover:border-zinc-600 transition-colors"
            >
              <MediaThumb thumbnailKey={a.thumbnailKey} className="h-28" />
              <div className="p-4">
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${categoryColor[a.category]}`}
                >
                  {categoryLabel[a.category]}
                </span>
                <p className="font-bold text-white mt-2 line-clamp-2">{a.title}</p>
                <p className="text-xs text-zinc-500 mt-1">{a.readTimeMinutes} min read</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-black text-white mb-3">Recommended for you</h3>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {data.recommended.map((r) => (
            <Link
              key={`${r.kind}-${r.id}`}
              to={r.kind === 'article' ? `/learn/articles/${r.id}` : `/learn/courses/${r.id}`}
              className="min-w-[200px] rounded-xl border border-zinc-800 bg-[#151515] p-4 hover:border-zinc-600"
            >
              <p className="text-[10px] font-black uppercase text-zinc-500">{r.kind}</p>
              <p className="font-bold text-white mt-1 line-clamp-2">{r.title}</p>
              <p className="text-xs text-zinc-500 mt-2">{r.subtitle}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-black text-white mb-3">Recently added</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {data.recent.map((r) => (
            <Link
              key={`${r.kind}-${r.id}`}
              to={r.kind === 'article' ? `/learn/articles/${r.id}` : `/learn/courses/${r.id}`}
              className="rounded-xl border border-zinc-800 bg-[#151515] overflow-hidden hover:border-zinc-600 flex gap-3"
            >
              <MediaThumb thumbnailKey={r.thumbnailKey} className="w-24 min-h-[5rem]" />
              <div className="p-3 pr-4 flex flex-col justify-center min-w-0">
                <p className="text-[10px] font-black uppercase text-zinc-500">{r.kind}</p>
                <p className="font-bold text-white line-clamp-2">{r.title}</p>
                <p className="text-xs text-zinc-500 mt-1">
                  {new Date(r.publishedAt).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

