
import {
  useEffect,
  useState,
  useRef,
  useCallback,
  type FormEvent,
} from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  User,
  Trophy,
  BookOpen,
  Briefcase,
  TrendingUp,
  ScrollText,
  LogOut,
  X,
} from 'lucide-react';
import { useMode } from '../context/ModeContext';
import { getApiBase } from '../config/api';

type GamificationMe = {
  user: { username: string; level?: number; tier?: number };
};

type AppNotification = {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: string;
};

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLiveMarket, toggleMode } = useMode();
  const [badgeDot, setBadgeDot] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [buyingPower, setBuyingPower] = useState<number | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [me, setMe] = useState<GamificationMe | null>(null);
  const [notifUnreadCount, setNotifUnreadCount] = useState(0);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    queueMicrotask(() => {
      const t = localStorage.getItem('token');
      if (!t) {
        setMe(null);
        return;
      }
      void fetch(`${getApiBase()}/gamification/me`, {
        headers: { Authorization: `Bearer ${t}` },
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((d: GamificationMe | null) => setMe(d))
        .catch(() => setMe(null));
    });
  }, [location.pathname, token]);

  useEffect(() => {
    if (!token) return;
    const h: Record<string, string> = { Authorization: `Bearer ${token}` };
    const fetchUnseen = () => {
      fetch(`${getApiBase()}/gamification/badges/unseen-count`, { headers: h })
        .then((r) => r.json())
        .then((d: { count?: number }) => setBadgeDot((d.count ?? 0) > 0))
        .catch(() => setBadgeDot(false));
    };
    fetchUnseen();
    const onAck = () => fetchUnseen();
    window.addEventListener('stockquest-badges-ack', onAck);
    return () => window.removeEventListener('stockquest-badges-ack', onAck);
  }, [location.pathname, token]);

  useEffect(() => {
    if (!token) return;

    fetch(`${getApiBase()}/portfolios/mine?live=${isLiveMarket}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setBuyingPower(typeof d?.cashBalance === 'number' ? d.cashBalance : null))
      .catch(() => setBuyingPower(null));
  }, [isLiveMarket, location.pathname, token]);

  useEffect(() => {
    if (!notifOpen && !profileOpen) return;
    const onDocMouseDown = (e: MouseEvent) => {
      const el = e.target;
      if (!(el instanceof Node)) return;
      if (notifRef.current?.contains(el)) return;
      if (profileRef.current?.contains(el)) return;
      setNotifOpen(false);
      setProfileOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [notifOpen, profileOpen]);

  const loadNotifications = () => {
    const t = localStorage.getItem('token');
    if (!t) return;
    setNotifLoading(true);
    fetch(`${getApiBase()}/gamification/notifications`, {
      headers: { Authorization: `Bearer ${t}` },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((raw: unknown) => {
        if (!Array.isArray(raw)) {
          setNotifications([]);
          return;
        }
        const list: AppNotification[] = raw
          .filter((n): n is Record<string, unknown> => !!n && typeof n === 'object')
          .map((n) => ({
            id: String(n.id ?? ''),
            message: String(n.message ?? ''),
            read: Boolean(n.read),
            createdAt:
              typeof n.createdAt === 'string'
                ? n.createdAt
                : n.createdAt instanceof Date
                  ? n.createdAt.toISOString()
                  : '',
            type: String(n.type ?? ''),
          }))
          .filter((n) => n.id);
        setNotifications(list);
        setNotifUnreadCount(list.filter((n) => !n.read).length);
      })
      .catch(() => setNotifications([]))
      .finally(() => setNotifLoading(false));
  };

  useEffect(() => {
    if (!notifOpen) return;
    queueMicrotask(() => {
      loadNotifications();
    });
  }, [notifOpen]);

  const refreshUnreadNotifCount = useCallback(() => {
    const t = localStorage.getItem('token');
    if (!t) {
      queueMicrotask(() => setNotifUnreadCount(0));
      return;
    }
    void fetch(`${getApiBase()}/gamification/notifications`, {
      headers: { Authorization: `Bearer ${t}` },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((raw: unknown) => {
        if (!Array.isArray(raw)) {
          setNotifUnreadCount(0);
          return;
        }
        const unread = raw.filter(
          (n) => n && typeof n === 'object' && (n as { read?: boolean }).read === false,
        ).length;
        setNotifUnreadCount(unread);
      })
      .catch(() => setNotifUnreadCount(0));
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      refreshUnreadNotifCount();
    });
  }, [location.pathname, token, refreshUnreadNotifCount]);

  const markNotificationRead = async (id: string) => {
    const t = localStorage.getItem('token');
    if (!t) return;
    await fetch(`${getApiBase()}/gamification/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${t}` },
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setNotifUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleSearchSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const query = searchText.trim();
    if (!query) return;

    try {
      const quoteRes = await fetch(
        `${getApiBase()}/market/quote/${encodeURIComponent(query.toUpperCase())}`,
      );
      if (quoteRes.ok) {
        navigate(`/stock/${query.toUpperCase()}`);
        return;
      }
    } catch {
      // Fall through
    }

    navigate(`/leaderboard?tab=Leagues&search=${encodeURIComponent(query)}`);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setProfileOpen(false);
    setMe(null);
    navigate('/');
  };

  const navItems = [
    { name: 'Market', path: '/dashboard', icon: TrendingUp },
    { name: 'Portfolio', path: '/portfolio', icon: Briefcase },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Quest', path: '/quests', icon: ScrollText },
    { name: 'Learn', path: '/learn', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-[#111111] text-white font-sans flex flex-col transition-colors duration-300">
      <header
        className={`h-16 flex items-center justify-between px-6 sticky top-0 z-50 transition-colors duration-300 ${isLiveMarket ? 'bg-[#00a859] shadow-md' : 'bg-[#1a1a1a] border-b-2 border-red-600'}`}
      >
        <div className="flex items-center gap-4">
          {isLiveMarket ? (
            <div className="w-10 h-10 bg-red-600 rounded flex items-center justify-center font-black text-white text-xl shadow-lg border-2 border-red-700">
              M
            </div>
          ) : (
            <svg viewBox="0 0 100 100" className="w-8 h-8 fill-red-600">
              <path d="M82,20 C85,30 85,45 78,55 C80,60 85,65 85,73 C85,82 78,90 65,90 C55,90 45,95 35,95 C25,95 15,85 15,70 C15,60 18,50 25,45 C20,40 18,30 20,20 C30,22 40,30 45,35 C55,30 65,30 70,25 C75,22 78,20 82,20 Z" />
            </svg>
          )}

          <div className="flex items-center gap-3">
            <span className="font-black tracking-widest text-lg text-white">
              {isLiveMarket ? 'LIVE MARKET' : 'STOCKQUEST'}
            </span>
            <div
              role="button"
              tabIndex={0}
              onClick={toggleMode}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') toggleMode();
              }}
              className={`w-12 h-6 rounded-full p-1 cursor-pointer flex items-center shadow-inner transition-all ${isLiveMarket ? 'bg-green-800 border-green-700 justify-end' : 'bg-red-900 border-red-800 justify-start'}`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md" />
            </div>
          </div>
        </div>

        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <form className="relative w-full" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search symbols, users, leagues..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className={`w-full text-white rounded-full py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 border border-transparent transition-all ${
                isLiveMarket
                  ? 'bg-green-700/50 placeholder-green-200 focus:ring-white'
                  : 'bg-[#2a2a2a] focus:border-red-600 focus:ring-1 focus:ring-red-600'
              }`}
            />
            <Search
              className={`absolute left-3 top-2.5 w-4 h-4 ${isLiveMarket ? 'text-green-200' : 'text-gray-400'}`}
            />
          </form>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex-col items-end hidden sm:flex">
            <span
              className={`text-xs font-black tracking-widest ${isLiveMarket ? 'text-white' : 'text-green-500'}`}
            >
              MARKET OPEN
            </span>
            <span
              className={`text-[10px] font-bold ${isLiveMarket ? 'text-green-200' : 'text-gray-400'}`}
            >
              Closes in 3h 42m
            </span>
          </div>

          <div className="relative" ref={notifRef}>
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => {
                if (!token) {
                  navigate('/');
                  return;
                }
                setNotifOpen((v) => !v);
                setProfileOpen(false);
              }}
              className={`relative transition-colors p-1 rounded-lg ${isLiveMarket ? 'text-green-100 hover:text-white' : 'text-gray-300 hover:text-white'}`}
            >
              <Bell className="w-5 h-5" />
              {notifUnreadCount > 0 && (
                <span
                  className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full border text-[10px] font-black leading-none ${isLiveMarket ? 'border-[#00a859] bg-red-600 text-white' : 'border-black bg-red-600 text-white'}`}
                >
                  {notifUnreadCount > 9 ? '9+' : notifUnreadCount}
                </span>
              )}
            </button>

            {notifOpen && token && (
              <div className="absolute right-0 mt-2 w-[min(100vw-2rem,22rem)] max-h-[70vh] overflow-hidden rounded-xl border border-zinc-700 bg-[#1a1a1a] shadow-2xl z-[60] flex flex-col">
                <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
                    Notifications
                  </span>
                  <button
                    type="button"
                    aria-label="Close"
                    className="p-1 rounded hover:bg-zinc-800 text-zinc-400"
                    onClick={() => setNotifOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="overflow-y-auto flex-1">
                  {notifLoading ? (
                    <p className="p-4 text-sm text-zinc-500">Loading…</p>
                  ) : notifications.length === 0 ? (
                    <p className="p-4 text-sm text-zinc-500">No notifications yet.</p>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => void markNotificationRead(n.id)}
                        className={`w-full text-left px-3 py-3 border-b border-zinc-800/80 hover:bg-zinc-800/50 transition-colors ${n.read ? 'opacity-70' : 'bg-zinc-800/30'}`}
                      >
                        <p className="text-sm text-zinc-100 leading-snug">{n.message}</p>
                        <p className="text-[10px] text-zinc-500 mt-1 font-medium">
                          {n.createdAt
                            ? new Date(n.createdAt).toLocaleString()
                            : ''}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <button
              type="button"
              aria-label="Account menu"
              onClick={() => {
                if (!token) {
                  navigate('/');
                  return;
                }
                setProfileOpen((v) => !v);
                setNotifOpen(false);
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors border ${
                isLiveMarket
                  ? 'bg-green-700 hover:bg-green-600 border-green-500'
                  : 'bg-zinc-800 hover:border-gray-400 border-zinc-600'
              }`}
            >
              <User className={`w-4 h-4 ${isLiveMarket ? 'text-white' : 'text-gray-300'}`} />
            </button>

            {profileOpen && token && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-700 bg-[#1a1a1a] shadow-2xl z-[60] py-1 overflow-hidden">
                <div className="px-3 py-2 border-b border-zinc-800">
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
                    Signed in
                  </p>
                  <p className="text-sm font-bold text-white truncate">
                    {me?.user?.username ?? '…'}
                  </p>
                  {me?.user?.level != null && (
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      Level {me.user.level} · Tier {me.user.tier ?? 1}
                    </p>
                  )}
                </div>
                <Link
                  to="/portfolio"
                  className="block px-3 py-2.5 text-sm text-zinc-200 hover:bg-zinc-800"
                  onClick={() => setProfileOpen(false)}
                >
                  Portfolio
                </Link>
                <Link
                  to="/leaderboard?tab=Leagues"
                  className="block px-3 py-2.5 text-sm text-zinc-200 hover:bg-zinc-800"
                  onClick={() => setProfileOpen(false)}
                >
                  My leagues
                </Link>
                <Link
                  to="/quests"
                  className="block px-3 py-2.5 text-sm text-zinc-200 hover:bg-zinc-800"
                  onClick={() => setProfileOpen(false)}
                >
                  Quests
                </Link>
                <button
                  type="button"
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-zinc-800 text-left"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-20 md:w-64 bg-[#1a1a1a] border-r border-[#2a2a2a] flex flex-col py-6 overflow-y-auto hidden sm:flex">
          <nav className="flex flex-col gap-2 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const showDot = item.path === '/portfolio' && badgeDot;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative flex items-center gap-4 px-3 md:px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? isLiveMarket
                        ? 'bg-[#00a859]/10 text-[#00a859] font-bold'
                        : 'bg-red-600/10 text-red-500 font-bold'
                      : 'text-gray-400 hover:bg-[#2a2a2a] hover:text-white font-medium'
                  }`}
                >
                  <span className="relative">
                    <Icon
                      className={`w-5 h-5 ${isActive ? (isLiveMarket ? 'text-[#00a859]' : 'text-red-500') : ''}`}
                    />
                    {showDot && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-600 rounded-full border border-[#1a1a1a]" />
                    )}
                  </span>
                  <span className="hidden md:block tracking-wide text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto px-4 md:px-6 mb-4 hidden md:block">
            <div className="bg-[#2a2a2a] rounded-xl p-4 border border-[#3a3a3a]">
              <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">
                Buying Power
              </h4>
              <p className="text-xl font-black text-white">
                {buyingPower === null
                  ? 'Loading...'
                  : `${isLiveMarket ? 'USD' : 'BARLEY'} ${buyingPower.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`}
              </p>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto bg-[#111111] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      <div className="sm:hidden fixed bottom-0 left-0 w-full bg-[#1a1a1a] border-t border-[#2a2a2a] flex justify-around p-3 z-50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          const showDot = item.path === '/portfolio' && badgeDot;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`relative flex flex-col items-center gap-1 ${isActive ? (isLiveMarket ? 'text-[#00a859]' : 'text-red-500') : 'text-gray-400'}`}
            >
              <span className="relative">
                <Icon className="w-5 h-5" />
                {showDot && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 bg-red-600 rounded-full border border-[#1a1a1a]" />
                )}
              </span>
              <span className="text-[10px]">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default AppLayout;
