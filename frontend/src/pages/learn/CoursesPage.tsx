import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Lock } from 'lucide-react';
import { learnHeaders, learnUrl } from './learnApi';
import { categoryColor, categoryLabel } from './learnStyles';
import { MediaThumb } from './MediaThumb';
import type { ArticleCategory } from './types';

type Row = {
  id: string;
  title: string;
  description: string;
  category: ArticleCategory;
  thumbnailKey: string;
  lessonCount: number;
  estimatedMinutes: number;
  locked: boolean;
  tierRequirement: number;
  status: string;
  progressPct: number;
  completed: boolean;
};

export function CoursesPage() {
  const [category, setCategory] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [tier, setTier] = useState('ALL');
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    const p = new URLSearchParams();
    if (category !== 'ALL') p.set('category', category);
    if (status !== 'ALL') p.set('status', status);
    if (tier !== 'ALL') p.set('tier', tier.replace('T', ''));
    const s = p.toString();
    const qs = s ? `?${s}` : '';
    void (async () => {
      const res = await fetch(learnUrl(`/courses${qs}`), { headers: learnHeaders() });
      if (res.ok) setRows(await res.json());
    })();
  }, [category, status, tier]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-[#1a1a1a] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="ALL">All categories</option>
          <option value="BASICS">Basics</option>
          <option value="STRATEGY">Strategy</option>
          <option value="RISK_MANAGEMENT">Risk management</option>
          <option value="MARKET_ANALYSIS">Market analysis</option>
          <option value="PSYCHOLOGY">Psychology</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-[#1a1a1a] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="ALL">All statuses</option>
          <option value="NOT_STARTED">Not started</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value)}
          className="bg-[#1a1a1a] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="ALL">All tiers</option>
          <option value="T1">Tier 1</option>
          <option value="T2">Tier 2</option>
          <option value="T3">Tier 3</option>
        </select>
      </div>

      {!rows ? (
        <Loader2 className="w-8 h-8 text-zinc-500 animate-spin mx-auto" />
      ) : (
        <div className="grid gap-4">
          {rows.map((c) => (
            <Link
              key={c.id}
              to={c.locked ? '#' : `/learn/courses/${c.id}`}
              onClick={(e) => c.locked && e.preventDefault()}
              className={`rounded-xl border border-zinc-800 bg-[#151515] overflow-hidden flex flex-col ${
                c.locked ? 'opacity-70 cursor-not-allowed' : 'hover:border-zinc-600'
              }`}
            >
              <MediaThumb thumbnailKey={c.thumbnailKey} className="h-24" />
              <div className="p-5 flex flex-col gap-2">
              <div className="flex justify-between gap-2">
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${categoryColor[c.category]}`}
                >
                  {categoryLabel[c.category]}
                </span>
                {c.locked ? (
                  <Lock className="w-5 h-5 text-zinc-500" />
                ) : c.completed ? (
                  <span className="text-xs font-black text-emerald-400">DONE</span>
                ) : null}
              </div>
              <h3 className="text-xl font-black text-white">{c.title}</h3>
              <p className="text-sm text-zinc-400 line-clamp-2">{c.description}</p>
              <p className="text-xs text-zinc-500">
                {c.lessonCount} lessons · ~{c.estimatedMinutes} min
              </p>
              {!c.locked && c.progressPct > 0 && !c.completed && (
                <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-violet-500"
                    style={{ width: `${c.progressPct}%` }}
                  />
                </div>
              )}
              {c.locked && (
                <p className="text-xs text-amber-300">Requires tier {c.tierRequirement}</p>
              )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
