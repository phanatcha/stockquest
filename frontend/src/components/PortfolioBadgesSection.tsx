import { useCallback, useEffect, useMemo, useState } from 'react';
import { Lock, X } from 'lucide-react';
import { getApiBase } from '../config/api';
import { useMode } from '../context/ModeContext';

type CatalogItem = {
  id: string;
  code: string;
  name: string;
  description: string;
  iconKey: string;
  category: 'ACTION_STRATEGY' | 'COMMUNITY_LEARNING';
  triggerEvent: string;
  threshold: number | null;
  conditionText: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  earnedAt: string | null;
  seen: boolean | null;
};

type CatalogResponse = {
  items: CatalogItem[];
  summary: {
    totalEarned: number;
    totalPossible: number;
    unseenCount: number;
    byCategory: {
      ACTION_STRATEGY: { earned: number; total: number };
      COMMUNITY_LEARNING: { earned: number; total: number };
    };
    byRarity: Record<
      'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY',
      { earned: number; total: number }
    >;
  };
};

const rarityLabel: Record<CatalogItem['rarity'], string> = {
  COMMON: 'Common',
  RARE: 'Rare',
  EPIC: 'Epic',
  LEGENDARY: 'Legendary',
};

const rarityClass: Record<CatalogItem['rarity'], string> = {
  COMMON: 'text-zinc-400 border-zinc-600',
  RARE: 'text-sky-400 border-sky-600',
  EPIC: 'text-violet-400 border-violet-600',
  LEGENDARY: 'text-amber-300 border-amber-600',
};

const rarityGlow: Record<CatalogItem['rarity'], string> = {
  COMMON: 'shadow-[0_0_20px_rgba(113,113,122,0.25)]',
  RARE: 'shadow-[0_0_24px_rgba(56,189,248,0.35)]',
  EPIC: 'shadow-[0_0_28px_rgba(167,139,250,0.4)]',
  LEGENDARY: 'shadow-[0_0_32px_rgba(251,191,36,0.45)]',
};

export const PortfolioBadgesSection = () => {
  const { isLiveMarket } = useMode();
  const accent = isLiveMarket ? 'text-[#00a859]' : 'text-red-500';

  const [data, setData] = useState<CatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState<'ALL' | 'ACTION_STRATEGY' | 'COMMUNITY_LEARNING'>('ALL');
  const [rarityFilter, setRarityFilter] = useState<'ALL' | CatalogItem['rarity']>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'EARNED' | 'LOCKED'>('ALL');
  const [modal, setModal] = useState<CatalogItem | null>(null);
  const [highlightNew, setHighlightNew] = useState(true);

  const authHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/gamification/badges/catalog`, {
        headers: authHeaders(),
      });
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await load();
      await fetch(`${getApiBase()}/gamification/badges/acknowledge`, {
        method: 'POST',
        headers: authHeaders(),
      });
      await load();
      setHighlightNew(true);
      setTimeout(() => setHighlightNew(false), 1200);
      window.dispatchEvent(new Event('stockquest-badges-ack'));
    })();
  }, [load]);

  const filtered = useMemo(() => {
    if (!data?.items) return [];
    return data.items.filter((b) => {
      const earned = !!b.earnedAt;
      if (catFilter !== 'ALL' && b.category !== catFilter) return false;
      if (rarityFilter !== 'ALL' && b.rarity !== rarityFilter) return false;
      if (statusFilter === 'EARNED' && !earned) return false;
      if (statusFilter === 'LOCKED' && earned) return false;
      return true;
    });
  }, [data, catFilter, rarityFilter, statusFilter]);

  if (loading || !data) {
    return (
      <div className="text-center text-zinc-500 py-16 animate-pulse">Loading badges…</div>
    );
  }

  const s = data.summary;

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-xl border border-zinc-800 bg-[#1a1a1a] p-6">
        <h3 className={`text-sm font-black uppercase tracking-widest ${accent} mb-4`}>
          Badge summary
        </h3>
        <p className="text-2xl font-black text-white mb-4">
          {s.totalEarned} / {s.totalPossible} Badges
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-zinc-500 font-bold uppercase text-xs mb-2">By category</p>
            <p className="text-zinc-300">
              Action &amp; Strategy:{' '}
              <span className="text-white font-bold">
                {s.byCategory.ACTION_STRATEGY.earned}/{s.byCategory.ACTION_STRATEGY.total}
              </span>
            </p>
            <p className="text-zinc-300">
              Community &amp; Learning:{' '}
              <span className="text-white font-bold">
                {s.byCategory.COMMUNITY_LEARNING.earned}/{s.byCategory.COMMUNITY_LEARNING.total}
              </span>
            </p>
          </div>
          <div>
            <p className="text-zinc-500 font-bold uppercase text-xs mb-2">By rarity</p>
            {(['COMMON', 'RARE', 'EPIC', 'LEGENDARY'] as const).map((r) => (
              <p key={r} className="text-zinc-300">
                {rarityLabel[r]}:{' '}
                <span className="text-white font-bold">
                  {s.byRarity[r].earned}/{s.byRarity[r].total}
                </span>
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <span className="text-xs font-bold text-zinc-500 uppercase">Filters</span>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value as typeof catFilter)}
          className="bg-[#222] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="ALL">All categories</option>
          <option value="ACTION_STRATEGY">Action &amp; Strategy</option>
          <option value="COMMUNITY_LEARNING">Community &amp; Learning</option>
        </select>
        <select
          value={rarityFilter}
          onChange={(e) => setRarityFilter(e.target.value as typeof rarityFilter)}
          className="bg-[#222] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="ALL">All rarities</option>
          <option value="COMMON">Common</option>
          <option value="RARE">Rare</option>
          <option value="EPIC">Epic</option>
          <option value="LEGENDARY">Legendary</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="bg-[#222] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="ALL">All statuses</option>
          <option value="EARNED">Earned</option>
          <option value="LOCKED">Locked</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((b) => {
          const earned = !!b.earnedAt;
          const isNew = earned && b.seen === false && highlightNew;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => setModal(b)}
              className={`text-left rounded-xl border p-4 transition-all hover:scale-[1.02] ${
                earned
                  ? `border-zinc-600 bg-[#1f1f1f] ${rarityGlow[b.rarity]}`
                  : 'border-zinc-800 bg-[#151515] opacity-90'
              } ${isNew ? 'ring-2 ring-amber-500/60 animate-pulse' : ''}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span
                  className={`text-4xl leading-none ${earned ? '' : 'grayscale opacity-40'}`}
                  aria-hidden
                >
                  {b.iconKey}
                </span>
                {!earned && <Lock className="w-4 h-4 text-zinc-600 shrink-0" />}
              </div>
              <p className="font-bold text-white text-sm leading-tight line-clamp-2">{b.name}</p>
              <p
                className={`text-[10px] font-black uppercase mt-2 inline-block px-2 py-0.5 rounded border ${rarityClass[b.rarity]}`}
              >
                {rarityLabel[b.rarity]}
              </p>
              <p className="text-[11px] text-zinc-500 mt-2 line-clamp-2">{b.description}</p>
              {earned && b.earnedAt && (
                <p className="text-[10px] text-zinc-600 mt-2">
                  Earned{' '}
                  {new Date(b.earnedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              )}
              {!earned && (
                <p className="text-[10px] text-zinc-600 mt-2 line-clamp-3">{b.conditionText}</p>
              )}
            </button>
          );
        })}
      </div>

      {modal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75"
          role="dialog"
          aria-modal
        >
          <div className="bg-[#1a1a1a] border border-zinc-700 rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
            <button
              type="button"
              onClick={() => setModal(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-6xl mb-4">{modal.iconKey}</div>
            <h4 className="text-xl font-black text-white">{modal.name}</h4>
            <p
              className={`text-xs font-black uppercase mt-2 inline-block px-2 py-1 rounded border ${rarityClass[modal.rarity]}`}
            >
              {rarityLabel[modal.rarity]}
            </p>
            <p className="text-zinc-400 text-sm mt-4">{modal.description}</p>
            <p className="text-zinc-500 text-xs mt-4">
              <span className="font-bold text-zinc-400">Condition: </span>
              {modal.conditionText}
            </p>
            {modal.earnedAt ? (
              <>
                <p className="text-emerald-400/90 text-sm font-bold mt-4">
                  Congratulations — you unlocked this badge on{' '}
                  {new Date(modal.earnedAt).toLocaleDateString(undefined, {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  .
                </p>
              </>
            ) : (
              <p className="text-amber-200/80 text-sm mt-4">
                Keep playing: {modal.conditionText}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
