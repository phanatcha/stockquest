
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Search, Bell, User, Trophy, BookOpen, Briefcase, TrendingUp } from 'lucide-react';
import { useMode } from '../context/ModeContext';

const AppLayout = () => {
  const location = useLocation();
  const { isLiveMarket, toggleMode } = useMode();
  
  const navItems = [
    { name: 'Market', path: '/dashboard', icon: TrendingUp },
    { name: 'Portfolio', path: '/portfolio', icon: Briefcase },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Learn', path: '/learn', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-[#111111] text-white font-sans flex flex-col transition-colors duration-300">
      {/* Top Navbar */}
      <header className={`h-16 flex items-center justify-between px-6 sticky top-0 z-50 transition-colors duration-300 ${isLiveMarket ? 'bg-[#00a859] shadow-md' : 'bg-[#1a1a1a] border-b-2 border-red-600'}`}>
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
             {/* Toggle Switch */}
             <div 
                onClick={toggleMode}
                className={`w-12 h-6 rounded-full p-1 cursor-pointer flex items-center shadow-inner transition-all ${isLiveMarket ? 'bg-green-800 border-green-700 justify-end' : 'bg-red-900 border-red-800 justify-start'}`}
             >
                <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform ${isLiveMarket ? '' : ''}`}></div>
             </div>
           </div>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <input 
               type="text" 
               placeholder="Search symbols, users, leagues..." 
               className={`w-full text-white rounded-full py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 border border-transparent transition-all ${
                 isLiveMarket ? 'bg-green-700/50 placeholder-green-200 focus:ring-white' : 'bg-[#2a2a2a] focus:border-red-600 focus:ring-1 focus:ring-red-600'
               }`}
            />
            <Search className={`absolute left-3 top-2.5 w-4 h-4 ${isLiveMarket ? 'text-green-200' : 'text-gray-400'}`} />
          </div>
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-6">
           <div className="flex flex-col items-end hidden sm:flex">
             <span className={`text-xs font-black tracking-widest ${isLiveMarket ? 'text-white' : 'text-green-500'}`}>MARKET OPEN</span>
             <span className={`text-[10px] font-bold ${isLiveMarket ? 'text-green-200' : 'text-gray-400'}`}>Closes in 3h 42m</span>
           </div>
           
           <button className={`relative transition-colors ${isLiveMarket ? 'text-green-100 hover:text-white' : 'text-gray-300 hover:text-white'}`}>
              <Bell className="w-5 h-5" />
              <span className={`absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full border ${isLiveMarket ? 'border-[#00a859]' : 'border-black'}`}></span>
           </button>
           
           <button className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors border ${
             isLiveMarket ? 'bg-green-700 hover:bg-green-600 border-green-500' : 'bg-zinc-800 hover:border-gray-400 border-zinc-600'
           }`}>
              <User className={`w-4 h-4 ${isLiveMarket ? 'text-white' : 'text-gray-300'}`} />
           </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-20 md:w-64 bg-[#1a1a1a] border-r border-[#2a2a2a] flex flex-col py-6 overflow-y-auto hidden sm:flex">
          <nav className="flex flex-col gap-2 px-3">
             {navItems.map((item) => {
               const Icon = item.icon;
               const isActive = location.pathname === item.path;
               return (
                 <Link 
                   key={item.name} 
                   to={item.path}
                   className={`flex items-center gap-4 px-3 md:px-4 py-3 rounded-xl transition-all ${
                     isActive 
                       ? (isLiveMarket ? 'bg-[#00a859]/10 text-[#00a859] font-bold' : 'bg-red-600/10 text-red-500 font-bold') 
                       : 'text-gray-400 hover:bg-[#2a2a2a] hover:text-white font-medium'
                   }`}
                 >
                   <Icon className={`w-5 h-5 ${isActive ? (isLiveMarket ? 'text-[#00a859]' : 'text-red-500') : ''}`} />
                   <span className="hidden md:block tracking-wide text-sm">{item.name}</span>
                 </Link>
               )
             })}
          </nav>
          
          <div className="mt-auto px-4 md:px-6 mb-4 hidden md:block">
             <div className="bg-[#2a2a2a] rounded-xl p-4 border border-[#3a3a3a]">
                <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Buying Power</h4>
                <p className="text-xl font-black text-white">$100,000.00</p>
             </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#111111] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      
      {/* Mobile Bottom Nav */}
      <div className="sm:hidden fixed bottom-0 left-0 w-full bg-[#1a1a1a] border-t border-[#2a2a2a] flex justify-around p-3 z-50">
         {navItems.map((item) => {
           const Icon = item.icon;
           const isActive = location.pathname === item.path;
           return (
             <Link key={item.name} to={item.path} className={`flex flex-col items-center gap-1 ${isActive ? (isLiveMarket ? 'text-[#00a859]' : 'text-red-500') : 'text-gray-400'}`}>
                <Icon className="w-5 h-5" />
                <span className="text-[10px]">{item.name}</span>
             </Link>
           )
         })}
      </div>
    </div>
  );
};

export default AppLayout;
