import { useEffect, useMemo, useState } from 'react';
import {
  Trophy,
  TrendingUp,
  Medal,
  Plus,
  Users,
  ArrowRight,
  LogOut,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { getApiBase } from '../config/api';

type LeaderRow = {
  rank: number;
  name: string;
  value: number;
  returnPct: number;
};

type League = {
  id: string;
  name: string;
  status: 'LOBBY' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  endDate: string;
  startingCapital: number;
  portfolios?: Array<{ id: string }>;
};

function normalizeLeague(raw: unknown): League | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const id = typeof o.id === 'string' ? o.id : null;
  const name = typeof o.name === 'string' ? o.name : null;
  if (!id || !name) return null;
  const endDate =
    typeof o.endDate === 'string'
      ? o.endDate
      : o.endDate instanceof Date
        ? o.endDate.toISOString()
        : '';
  const status =
    o.status === 'LOBBY' ||
    o.status === 'ACTIVE' ||
    o.status === 'COMPLETED' ||
    o.status === 'CANCELLED'
      ? o.status
      : 'LOBBY';
  const startingCapital =
    typeof o.startingCapital === 'number' && !Number.isNaN(o.startingCapital)
      ? o.startingCapital
      : 0;
  const portfolios = Array.isArray(o.portfolios)
    ? (o.portfolios as Array<{ id: string }>)
    : [];
  return { id, name, status, endDate, startingCapital, portfolios };
}

function normalizeLeaguesPayload(data: unknown): League[] {
  if (!Array.isArray(data)) return [];
  return data.map(normalizeLeague).filter((l): l is League => l !== null);
}

const GLOBAL_MARKET_LEAGUE_NAMES = new Set([
  'Live Market Global',
  'The Bull Run Global',
]);

function isGlobalMarketLeague(name: string): boolean {
  return GLOBAL_MARKET_LEAGUE_NAMES.has(name);
}

type LeagueParticipant = {
  portfolioId: string;
  username: string;
  name: string;
  portfolioTotalValue: number;
  pctGainLoss: number;
  liveRank: number;
};

type LeagueDetails = {
  id: string;
  name: string;
  participants: LeagueParticipant[];
};

const Leaderboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: 'Global' | 'Friends' | 'Leagues' =
    tabParam === 'Friends' || tabParam === 'Leagues' ? tabParam : 'Global';
  const [leaders, setLeaders] = useState<LeaderRow[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [myLeagues, setMyLeagues] = useState<League[]>([]);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedLeagueId, setSelectedLeagueId] = useState('');
  const [leagueDetails, setLeagueDetails] = useState<LeagueDetails | null>(null);
  const [creating, setCreating] = useState(false);
  const [newLeagueName, setNewLeagueName] = useState('');
  const [newLeagueDescription, setNewLeagueDescription] = useState('');
  const [newLeagueEndDate, setNewLeagueEndDate] = useState('');
  const [newLeagueParticipants, setNewLeagueParticipants] = useState(10);
  const [actionMessage, setActionMessage] = useState('');
  const [leavingId, setLeavingId] = useState<string | null>(null);

  const token = localStorage.getItem('token');

  const leagueFromUrl = searchParams.get('league');
  useEffect(() => {
    if (!leagueFromUrl) return;
    setSelectedLeagueId(leagueFromUrl);
    if (tabParam !== 'Leagues') {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('tab', 'Leagues');
          return next;
        },
        { replace: true },
      );
    }
  }, [leagueFromUrl, tabParam, setSearchParams]);

  const fetchLeagues = async () => {
    const res = await fetch(`${getApiBase()}/leagues`);
    if (!res.ok) return;
    const data = normalizeLeaguesPayload(await res.json());
    setLeagues(data);
  };

  const fetchMyLeagues = async () => {
    if (!token) {
      setMyLeagues([]);
      return;
    }
    const res = await fetch(`${getApiBase()}/leagues/mine`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      setMyLeagues([]);
      return;
    }
    const data = normalizeLeaguesPayload(await res.json());
    setMyLeagues(data);
  };

  useEffect(() => {
    void fetch(`${getApiBase()}/leagues`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: unknown) => setLeagues(normalizeLeaguesPayload(data)))
      .catch(() => setLeagues([]));

    void fetch(`${getApiBase()}/leagues`)
      .then((res) => (res.ok ? res.json() : []))
      .then(async (raw: unknown) => {
        const allLeagues = normalizeLeaguesPayload(raw);
        const detailResponses: Array<LeagueDetails | null> = await Promise.all(
          allLeagues.slice(0, 8).map((league) =>
            fetch(`${getApiBase()}/leagues/${league.id}`).then((r) =>
              r.ok ? (r.json() as Promise<LeagueDetails>) : null,
            ),
          ),
        );

        const rows = detailResponses
          .flatMap((detail) => detail?.participants ?? [])
          .map((p) => ({
            name: p.username || p.name || 'Unknown',
            value: p.portfolioTotalValue ?? 0,
            returnPct: p.pctGainLoss ?? 0,
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 20)
          .map((row, index) => ({ ...row, rank: index + 1 }));
        setLeaders(rows);
      })
      .catch(() => setLeaders([]));
    if (token) {
      void fetch(`${getApiBase()}/leagues/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((data: unknown) => setMyLeagues(normalizeLeaguesPayload(data)))
        .catch(() => setMyLeagues([]));
    }
  }, [token]);

  useEffect(() => {
    if (!selectedLeagueId) return;
    fetch(`${getApiBase()}/leagues/${selectedLeagueId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: unknown) => {
        if (!d || typeof d !== 'object') {
          setLeagueDetails(null);
          return;
        }
        const obj = d as Record<string, unknown>;
        const id = typeof obj.id === 'string' ? obj.id : '';
        const name = typeof obj.name === 'string' ? obj.name : 'League';
        const rawParts = obj.participants;
        const participants: LeagueParticipant[] = Array.isArray(rawParts)
          ? rawParts
              .map((p): LeagueParticipant | null => {
                if (!p || typeof p !== 'object') return null;
                const row = p as Record<string, unknown>;
                return {
                  portfolioId: String(row.portfolioId ?? ''),
                  username: String(row.username ?? row.name ?? '?'),
                  name: String(row.name ?? ''),
                  portfolioTotalValue: Number(row.portfolioTotalValue) || 0,
                  pctGainLoss: Number(row.pctGainLoss) || 0,
                  liveRank: Number(row.liveRank) || 0,
                };
              })
              .filter((p): p is LeagueParticipant => p !== null && p.portfolioId !== '')
          : [];
        setLeagueDetails({ id, name, participants });
      })
      .catch(() => setLeagueDetails(null));
  }, [selectedLeagueId]);

  const filteredLeaders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return leaders;
    return leaders.filter((leader) => leader.name.toLowerCase().includes(q));
  }, [leaders, search]);

  const filteredLeagues = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return leagues;
    return leagues.filter((league) => league.name.toLowerCase().includes(q));
  }, [leagues, search]);

  const myLeagueIdSet = useMemo(
    () => new Set(myLeagues.map((l) => l.id)),
    [myLeagues],
  );

  const onChangeTab = (tab: 'Global' | 'Friends' | 'Leagues') => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      if (search.trim()) next.set('search', search.trim());
      return next;
    });
  };

  const onLeaveLeague = async (leagueId: string, leagueName: string) => {
    if (!token) {
      setActionMessage('Please sign in first.');
      return;
    }
    if (isGlobalMarketLeague(leagueName)) {
      setActionMessage('You cannot leave the global market league.');
      return;
    }
    const ok = window.confirm(
      `Leave "${leagueName}"? Your portfolio and trade history in this league will be removed.`,
    );
    if (!ok) return;
    setLeavingId(leagueId);
    setActionMessage('');
    try {
      const res = await fetch(`${getApiBase()}/leagues/${leagueId}/leave`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setActionMessage(data.message || 'Unable to leave league.');
        return;
      }
      setActionMessage('You left the league.');
      if (selectedLeagueId === leagueId) {
        setSelectedLeagueId('');
        setLeagueDetails(null);
      }
      await fetchLeagues();
      await fetchMyLeagues();
    } finally {
      setLeavingId(null);
    }
  };

  const onJoinLeague = async (leagueId: string) => {
    if (!token) {
      setActionMessage('Please sign in first.');
      return;
    }
    const res = await fetch(`${getApiBase()}/leagues/${leagueId}/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setActionMessage(data.message || 'Unable to join league.');
      return;
    }
    setActionMessage('Joined league successfully.');
    await fetchLeagues();
    await fetchMyLeagues();
    setSelectedLeagueId(leagueId);
  };

  const onCreateLeague = async () => {
    if (!token) {
      setActionMessage('Please sign in first.');
      return;
    }
    if (!newLeagueName.trim() || !newLeagueEndDate) {
      setActionMessage('League name and end date are required.');
      return;
    }
    setCreating(true);
    const res = await fetch(`${getApiBase()}/leagues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: newLeagueName.trim(),
        description: newLeagueDescription.trim() || undefined,
        startingCapital: 10000,
        minParticipants: 2,
        maxParticipants: Math.max(2, newLeagueParticipants),
        endDate: new Date(newLeagueEndDate).toISOString(),
        isPublic: true,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setActionMessage(data.message || 'Failed to create league.');
      setCreating(false);
      return;
    }
    setActionMessage('League created.');
    setNewLeagueName('');
    setNewLeagueDescription('');
    setNewLeagueEndDate('');
    setNewLeagueParticipants(10);
    setCreating(false);
    await fetchLeagues();
    await fetchMyLeagues();
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 items-center">
      
      {/* Header Banner */}
      <div className="w-full bg-[#7a1313] rounded-t-3xl border-b-8 border-[#520d0d] p-8 mt-4 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col items-center justify-center">
          <Trophy className="w-16 h-16 text-yellow-500 mb-4 drop-shadow-xl" />
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-widest uppercase italic drop-shadow-md">
            The Bull Run
          </h1>
          <p className="text-red-200 mt-2 font-bold tracking-widest text-sm">Global Rankings</p>
        </div>
      </div>

      <div className="w-full bg-[#1a1a1a] rounded-b-3xl border border-zinc-800 -mt-6 pt-6 overflow-hidden shadow-2xl relative z-20">
         {/* Navigation Pills */}
         <div className="flex justify-center gap-2 mb-8 mt-4">
            <button 
              onClick={() => onChangeTab('Global')}
              className={`px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest border transition-colors ${activeTab === 'Global' ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-transparent text-zinc-500 border-zinc-800 hover:text-white'}`}
            >
              Global
            </button>
            <button 
              onClick={() => onChangeTab('Friends')}
              className={`px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest border transition-colors ${activeTab === 'Friends' ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-transparent text-zinc-500 border-zinc-800 hover:text-white'}`}
            >
              Friends
            </button>
            <button 
              onClick={() => onChangeTab('Leagues')}
              className={`px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest border transition-colors ${activeTab === 'Leagues' ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-transparent text-zinc-500 border-zinc-800 hover:text-white'}`}
            >
              Leagues
            </button>
         </div>

         {activeTab === 'Global' && (
           <>
             <div className="grid grid-cols-12 gap-4 px-8 py-4 border-b border-zinc-800 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                <div className="col-span-2 text-center">Rank</div>
                <div className="col-span-5">Trader</div>
                <div className="col-span-5 text-right">Portfolio Value</div>
             </div>

         <div className="flex flex-col pb-4">
            {filteredLeaders.map((leader) => (
              <div 
                key={leader.rank} 
                className={`grid grid-cols-12 gap-4 px-8 py-4 items-center border-b border-zinc-800/30 transition-colors
                  hover:bg-zinc-800/30
                `}
              >
                 <div className="col-span-2 flex justify-center items-center">
                    {leader.rank === 1 && <Medal className="w-6 h-6 text-yellow-500" />}
                    {leader.rank === 2 && <Medal className="w-6 h-6 text-zinc-300" />}
                    {leader.rank === 3 && <Medal className="w-6 h-6 text-amber-700" />}
                    {leader.rank > 3 && <span className="text-xl font-black text-zinc-600">#{leader.rank}</span>}
                 </div>
                 
                 <div className="col-span-5 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${
                      'bg-zinc-800 text-zinc-400'
                    }`}>
                       {leader.name.charAt(0)}
                    </div>
                    <span className="font-bold tracking-wide text-zinc-200">
                      {leader.name}
                    </span>
                 </div>

                 <div className="col-span-5 flex flex-col items-end justify-center">
                    <span className="text-lg font-black text-zinc-300">
                      ${leader.value.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </span>
                    <span className={`text-xs font-bold flex items-center gap-1 ${leader.returnPct >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                       {leader.returnPct >= 0 ? <TrendingUp className="w-3 h-3" /> : null}
                       {leader.returnPct >= 0 ? '+' : ''}{leader.returnPct.toFixed(2)}%
                    </span>
                 </div>
              </div>
            ))}
          </div>
         </>
       )}

         {activeTab === 'Leagues' && (
           <div className="px-8 pb-10 flex flex-col gap-8">
              <div className="flex justify-between items-center bg-indigo-900/20 border border-indigo-500/30 p-6 rounded-2xl">
                 <div>
                    <h2 className="text-2xl font-black text-white tracking-widest uppercase italic">Create a League</h2>
                    <p className="text-indigo-300 text-sm mt-1">Challenge your friends in a custom trading arena.</p>
                 </div>
                 <div className="flex flex-col gap-2 w-full max-w-md">
                    <input
                      value={newLeagueName}
                      onChange={(e) => setNewLeagueName(e.target.value)}
                      className="bg-[#111] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
                      placeholder="League name"
                    />
                    <input
                      value={newLeagueDescription}
                      onChange={(e) => setNewLeagueDescription(e.target.value)}
                      className="bg-[#111] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
                      placeholder="Description (optional)"
                    />
                    <div className="flex gap-2">
                      <input
                        type="datetime-local"
                        value={newLeagueEndDate}
                        onChange={(e) => setNewLeagueEndDate(e.target.value)}
                        className="bg-[#111] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white flex-1"
                      />
                      <input
                        type="number"
                        min={2}
                        value={newLeagueParticipants}
                        onChange={(e) => setNewLeagueParticipants(Number(e.target.value))}
                        className="bg-[#111] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white w-28"
                        placeholder="Max"
                      />
                    </div>
                    <button
                      disabled={creating}
                      onClick={onCreateLeague}
                      className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-black uppercase text-xs tracking-widest py-3 px-6 rounded-full shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4"/> {creating ? 'Creating...' : 'New League'}
                    </button>
                 </div>
              </div>

              <div>
                 <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">My Joined Leagues</h3>
                 {myLeagues.length === 0 ? (
                   <div className="mb-6 bg-[#111] border border-zinc-800 rounded-xl p-4 text-sm text-zinc-500">
                     You have not joined any leagues yet.
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                     {myLeagues.map((league) => (
                       <div
                         key={`my-${league.id}`}
                         className="bg-[#1b1b1b] border border-indigo-700/40 p-4 rounded-xl flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                       >
                         <div>
                           <p className="text-white font-bold">{league.name}</p>
                           <p className="text-xs text-zinc-400">
                             {league.status} • Ends{' '}
                             {league.endDate
                               ? new Date(league.endDate).toLocaleDateString()
                               : '—'}
                           </p>
                           {isGlobalMarketLeague(league.name) && (
                             <p className="text-[10px] text-zinc-500 mt-1">
                               Default market portfolio — cannot leave
                             </p>
                           )}
                         </div>
                         <div className="flex flex-wrap gap-2 justify-end">
                           <button
                             type="button"
                             onClick={() => setSelectedLeagueId(league.id)}
                             className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest py-2 px-4 rounded-full"
                           >
                             View
                           </button>
                           {!isGlobalMarketLeague(league.name) && (
                             <button
                               type="button"
                               disabled={leavingId === league.id}
                               onClick={() => void onLeaveLeague(league.id, league.name)}
                               className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 font-black text-[10px] uppercase tracking-widest py-2 px-4 rounded-full inline-flex items-center gap-1"
                             >
                               <LogOut className="w-3 h-3" />
                               {leavingId === league.id ? '…' : 'Leave'}
                             </button>
                           )}
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
              </div>

              <div>
                 <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Discover Active Leagues</h3>
                 <input
                   value={search}
                   onChange={(e) => {
                     const next = e.target.value;
                     setSearch(next);
                     setSearchParams((prev) => {
                       const params = new URLSearchParams(prev);
                       params.set('tab', 'Leagues');
                       if (next.trim()) params.set('search', next.trim());
                       else params.delete('search');
                       return params;
                     });
                   }}
                   className="w-full mb-4 bg-[#111] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
                   placeholder="Search leagues..."
                 />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredLeagues.map((league) => (
                       <div key={league.id} className="bg-[#222] border border-zinc-800 hover:border-zinc-600 transition-colors p-5 rounded-xl flex flex-col gap-4">
                          <div className="flex justify-between items-start">
                             <h4 className="text-xl font-bold text-white tracking-wide">{league.name}</h4>
                             <span className="text-xs font-bold bg-zinc-800 text-zinc-400 px-2 py-1 rounded">
                               {league.status} • Ends{' '}
                               {league.endDate
                                 ? new Date(league.endDate).toLocaleDateString()
                                 : '—'}
                             </span>
                          </div>
                          
                          <div className="flex justify-between items-end mt-2">
                             <div className="flex flex-col gap-1">
                                <span className="text-[10px] uppercase font-bold text-zinc-500">Prize / Status</span>
                                <span className="text-sm font-black text-indigo-400">
                                  Start: {(league.startingCapital ?? 0).toLocaleString()} BARLEY
                                </span>
                             </div>
                             
                             <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1 text-xs text-zinc-400 font-bold">
                                   <Users className="w-4 h-4"/>{' '}
                                   {(league.portfolios ?? []).length}
                                </span>
                                {myLeagueIdSet.has(league.id) ? (
                                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 px-2 py-2">
                                    Joined
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => void onJoinLeague(league.id)}
                                    className="bg-white hover:bg-zinc-200 text-black font-black text-[10px] uppercase tracking-widest py-2 px-4 rounded-full flex items-center gap-1 transition-colors"
                                  >
                                    Join <ArrowRight className="w-3 h-3" />
                                  </button>
                                )}
                                <button
                                  onClick={() => setSelectedLeagueId(league.id)}
                                  className="bg-zinc-800 hover:bg-zinc-700 text-white font-black text-[10px] uppercase tracking-widest py-2 px-4 rounded-full"
                                >
                                  View
                                </button>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
                 {leagueDetails && (
                   <div className="mt-6 bg-[#111] border border-zinc-800 rounded-xl p-4">
                     <h4 className="text-sm font-bold text-zinc-300 mb-3 uppercase tracking-widest">
                       {leagueDetails.name} Live Ranking
                     </h4>
                     <div className="space-y-2">
                       {(leagueDetails.participants || []).slice(0, 10).map((participant) => (
                         <div
                           key={participant.portfolioId}
                           className="flex items-center justify-between bg-[#1d1d1d] rounded-lg px-3 py-2"
                         >
                           <span className="text-zinc-300 text-sm font-medium">
                             #{participant.liveRank} {participant.username}
                           </span>
                           <span className="text-white text-sm font-bold">
                             {(participant.portfolioTotalValue ?? 0).toLocaleString(undefined, {
                               minimumFractionDigits: 2,
                             })}
                           </span>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
                 {actionMessage && <p className="text-xs text-zinc-400 mt-4">{actionMessage}</p>}
              </div>
           </div>
         )}
         
         {activeTab === 'Friends' && (
            <div className="p-10 text-center text-zinc-500 font-bold">
               No friends added yet. Share your StockQuest ID Card!
            </div>
         )}
      </div>
    </div>
  );
};

export default Leaderboard;
