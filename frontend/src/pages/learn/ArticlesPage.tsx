import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Circle, Lock, Loader2 } from 'lucide-react';
import { learnHeaders, learnUrl } from './learnApi';
import { categoryColor, categoryLabel } from './learnStyles';
import { MediaThumb } from './MediaThumb';
import type { ArticleCategory, UserArticleStatus } from './types';

type Row = {
  id: string;
  title: string;
  category: ArticleCategory;
  author: string;
  readTimeMinutes: number;
  publishedAt: string;
  thumbnailKey: string;
  tierRequirement: number;
  locked: boolean;
  userStatus: UserArticleStatus;
};

export function ArticlesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('ALL');
  const [tier, setTier] = useState<string>('ALL');
  const [status, setStatus] = useState<string>('ALL');
  const [sort, setSort] = useState('newest');
  const [rows, setRows] = useState<Row[] | null>(null);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (search.trim()) p.set('search', search.trim());
    if (category !== 'ALL') p.set('category', category);
    if (tier !== 'ALL') p.set('tier', tier.replace('T', ''));
    if (status !== 'ALL') p.set('status', status);
    if (sort) p.set('sort', sort);
    const s = p.toString();
    return s ? `?${s}` : '';
  }, [search, category, tier, status, sort]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(learnUrl(`/articles${qs}`), { headers: learnHeaders() });
      if (!res.ok || cancelled) return;
      setRows(await res.json());
    })();
    return () => {
      cancelled = true;
    };
  }, [qs]);

  return (
    <div className="flex flex-col gap-6">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search title or tag…"
        className="w-full bg-[#1a1a1a] border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600"
      />
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
          value={tier}
          onChange={(e) => setTier(e.target.value)}
          className="bg-[#1a1a1a] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="ALL">All tiers</option>
          <option value="T1">Tier 1</option>
          <option value="T2">Tier 2</option>
          <option value="T3">Tier 3</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-[#1a1a1a] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="ALL">All statuses</option>
          <option value="UNREAD">Unread</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-[#1a1a1a] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="shortest">Shortest read</option>
          <option value="longest">Longest read</option>
        </select>
      </div>

      {!rows ? (
        <Loader2 className="w-8 h-8 text-zinc-500 animate-spin mx-auto" />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {rows.map((a) => (
            <Link
              key={a.id}
              to={a.locked ? '#' : `/learn/articles/${a.id}`}
              onClick={(e) => {
                if (a.locked) e.preventDefault();
              }}
              className={`rounded-xl border border-zinc-800 bg-[#151515] overflow-hidden flex flex-col ${
                a.locked ? 'opacity-70 cursor-not-allowed' : 'hover:border-zinc-600'
              }`}
            >
              <MediaThumb thumbnailKey={a.thumbnailKey} className="h-20" />
              <div className="p-4 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${categoryColor[a.category]}`}
                >
                  {categoryLabel[a.category]}
                </span>
                <StatusIcon status={a.userStatus} locked={a.locked} />
              </div>
              <h3 className="font-bold text-white text-lg leading-snug">{a.title}</h3>
              <p className="text-xs text-zinc-500">
                {a.author} · {new Date(a.publishedAt).toLocaleDateString()} · {a.readTimeMinutes}{' '}
                min
              </p>
              {a.locked && (
                <p className="text-xs text-amber-300 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Requires tier {a.tierRequirement}
                </p>
              )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusIcon({ status, locked }: { status: UserArticleStatus; locked: boolean }) {
  if (locked) return <Lock className="w-5 h-5 text-zinc-500" />;
  if (status === 'COMPLETED') return <Check className="w-5 h-5 text-emerald-400" />;
  if (status === 'IN_PROGRESS')
    return <div className="w-5 h-1.5 rounded-full bg-amber-500/80 w-8" title="In progress" />;
  return <Circle className="w-5 h-5 text-zinc-600" title="Unread" />;
}
