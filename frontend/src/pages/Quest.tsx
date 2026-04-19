import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ScrollText,
  Sparkles,
  Coins,
  Trophy,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useMode } from '../context/ModeContext';
import { getApiBase } from '../config/api';

type MePayload = {
  user: {
    level: number;
    tier: number;
    totalXp: number;
    barleyBalance: number;
    username: string;
  };
  tierStatus: {
    tier: number;
    nextTier: number | null;
    nextTierName?: string;
    minLevelForNextTier?: number;
    levelOk?: boolean;
    quizOk?: boolean;
    pending: 'xp' | 'quiz' | null;
  };
  nextLevelXpCost: number;
  xpIntoCurrentLevel: number;
};

type UserQuest = {
  id: string;
  progress: number;
  status: string;
  quest: {
    id: string;
    title: string;
    description: string;
    targetValue: number;
    xpReward: number;
    barleyReward: number;
    actionType: string;
  };
};

const Quest = () => {
  const navigate = useNavigate();
  const { isLiveMarket } = useMode();
  const accent = isLiveMarket ? 'text-[#00a859]' : 'text-red-500';
  const accentBg = isLiveMarket ? 'bg-[#00a859]/15' : 'bg-red-600/10';

  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<MePayload | null>(null);
  const [quests, setQuests] = useState<UserQuest[]>([]);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const authHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  };

  const load = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    setError(null);
    const base = getApiBase();
    try {
      const syncRes = await fetch(`${base}/gamification/sync`, {
        method: 'POST',
        headers: authHeaders(),
      });
      const [meRes, qRes] = await Promise.all([
        fetch(`${base}/gamification/me`, { headers: authHeaders() }),
        fetch(`${base}/gamification/quests`, { headers: authHeaders() }),
      ]);
      if (meRes.status === 401 || qRes.status === 401 || syncRes.status === 401) {
        navigate('/');
        return;
      }

      const httpErr: string[] = [];
      if (!syncRes.ok) {
        const t = await syncRes.text().catch(() => '');
        httpErr.push(`sync ${syncRes.status}${t ? `: ${t.slice(0, 120)}` : ''}`);
      }
      if (meRes.ok) {
        setMe(await meRes.json());
      } else if (meRes.status !== 401) {
        const t = await meRes.text().catch(() => '');
        httpErr.push(`profile ${meRes.status}${t ? `: ${t.slice(0, 120)}` : ''}`);
      }
      if (qRes.ok) {
        setQuests(await qRes.json());
      } else if (qRes.status !== 401) {
        const t = await qRes.text().catch(() => '');
        httpErr.push(`quests ${qRes.status}${t ? `: ${t.slice(0, 120)}` : ''}`);
      }
      if (httpErr.length) {
        setError(`API error — ${httpErr.join(' · ')}`);
      }
    } catch (e) {
      console.error(e);
      setError(
        `Cannot reach the API at ${base}. Start the backend (port 3000) and use Vite dev server so /api is proxied.`,
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const claim = async (userQuestId: string) => {
    setClaiming(userQuestId);
    setError(null);
    try {
      const res = await fetch(`${getApiBase()}/gamification/quests/${userQuestId}/claim`, {
        method: 'POST',
        headers: authHeaders(),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || 'Claim failed');
      }
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Claim failed');
    } finally {
      setClaiming(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-zinc-500">
        <Loader2 className="w-10 h-10 animate-spin" />
        <span className="text-sm font-bold uppercase tracking-widest">Loading quests</span>
      </div>
    );
  }

  const xpPct =
    me && me.nextLevelXpCost > 0
      ? Math.min(100, (me.xpIntoCurrentLevel / me.nextLevelXpCost) * 100)
      : 0;

  const tierHint = (() => {
    if (!me?.tierStatus?.nextTier) return null;
    const p = me.tierStatus.pending;
    if (!p) return null;
    if (p === 'xp')
      return `Reach level ${me.tierStatus.minLevelForNextTier ?? '?'} to unlock ${me.tierStatus.nextTierName ?? 'the next tier'}.`;
    return `Pass the tier quiz to unlock ${me.tierStatus.nextTierName ?? 'the next tier'}.`;
  })();

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 pb-24 sm:pb-8">
      <div className="flex flex-col border-b border-zinc-800 pb-6">
        <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
          <ScrollText className={`w-9 h-9 ${accent}`} />
          Quests & Progression
        </h1>
        <p className="text-zinc-400 text-lg mt-2">
          Complete objectives, earn XP and Barley, and climb tiers to unlock the full platform.
        </p>
      </div>

      {me && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`rounded-xl border border-zinc-800 p-5 ${accentBg}`}>
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> Level {me.user.level}
            </div>
            <p className="text-2xl font-black text-white mt-1">{me.user.totalXp.toLocaleString()} XP</p>
            <div className="mt-3 h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isLiveMarket ? 'bg-[#00a859]' : 'bg-red-600'}`}
                style={{ width: `${xpPct}%` }}
              />
            </div>
            <p className="text-[11px] text-zinc-500 mt-2">
              {me.xpIntoCurrentLevel} / {me.nextLevelXpCost} XP toward next level
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 p-5 bg-[#1a1a1a]">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-4 h-4" /> Tier {me.user.tier}
            </div>
            <p className="text-lg font-bold text-white mt-1">
              {me.tierStatus.nextTier
                ? `Next: ${me.tierStatus.nextTierName ?? `Tier ${me.tierStatus.nextTier}`}`
                : 'Max tier reached'}
            </p>
            {tierHint && (
              <p className="text-sm text-amber-200/90 mt-2 leading-snug">{tierHint}</p>
            )}
          </div>

          <div className="rounded-xl border border-zinc-800 p-5 bg-[#1a1a1a]">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
              <Coins className="w-4 h-4" /> Barley
            </div>
            <p className="text-2xl font-black text-amber-200 mt-1">{me.user.barleyBalance}</p>
            <p className="text-xs text-zinc-500 mt-2">Virtual currency from quests.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div>
        <h2 className="text-lg font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          Active quests <ChevronRight className="w-4 h-4 text-zinc-600" />
        </h2>
        <div className="flex flex-col gap-4">
          {quests.length === 0 && (
            <p className="text-zinc-500 text-sm">No quests assigned yet. Sync will run on load.</p>
          )}
          {quests.map((uq) => {
            const pct = Math.min(
              100,
              (uq.progress / Math.max(1, uq.quest.targetValue)) * 100,
            );
            const canClaim = uq.status === 'COMPLETED';
            return (
              <div
                key={uq.id}
                className="bg-[#1a1a1a] rounded-xl border border-zinc-800 p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-lg">{uq.quest.title}</h3>
                  <p className="text-sm text-zinc-400 mt-1">{uq.quest.description}</p>
                  <div className="mt-3 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isLiveMarket ? 'bg-[#00a859]' : 'bg-red-600'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-2">
                    {uq.progress} / {uq.quest.targetValue} · {uq.status.replace('_', ' ')}
                  </p>
                </div>
                <div className="flex flex-col items-stretch sm:items-end gap-2 shrink-0">
                  <div className="text-xs text-zinc-500">
                    +{uq.quest.xpReward} XP · +{uq.quest.barleyReward} Barley
                  </div>
                  {canClaim && (
                    <button
                      type="button"
                      onClick={() => claim(uq.id)}
                      disabled={claiming === uq.id}
                      className={`px-5 py-2.5 rounded-lg font-black text-sm uppercase tracking-wide text-white transition-colors disabled:opacity-50 ${
                        isLiveMarket
                          ? 'bg-[#00a859] hover:bg-[#00994d]'
                          : 'bg-red-600 hover:bg-red-500'
                      }`}
                    >
                      {claiming === uq.id ? 'Claiming…' : 'Claim reward'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Quest;
