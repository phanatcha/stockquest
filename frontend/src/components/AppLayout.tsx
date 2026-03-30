
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Search, Bell, User, Trophy, BookOpen, Briefcase, TrendingUp } from 'lucide-react';

const AppLayout = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Market', path: '/dashboard', icon: TrendingUp },
    { name: 'Portfolio', path: '/portfolio', icon: Briefcase },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Learn', path: '/learn', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-[#111111] text-white font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 bg-[#00a859] flex items-center justify-between px-6 sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-4">
           {/* Logo Box */}
           <div className="w-10 h-10 bg-red-600 rounded flex items-center justify-center font-black text-white text-xl shadow-lg border-2 border-red-700">
              M
           </div>
           
           <div className="flex items-center gap-3">
             <span className="font-black tracking-widest text-lg text-white">LIVE MARKET</span>
             {/* Toggle Switch */}
             <div className="w-12 h-6 bg-green-800 rounded-full p-1 cursor-pointer flex items-center justify-end shadow-inner border border-green-700">
                <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
             </div>
           </div>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <input 
               type="text" 
               placeholder="Search symbols, users, leagues..." 
               className="w-full bg-green-700/50 text-white placeholder-green-200 rounded-full py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-white border border-transparent transition-all"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-green-200" />
          </div>
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-6">
           <div className="flex flex-col items-end hidden sm:flex">
             <span className="text-xs text-white font-black tracking-widest">MARKET OPEN</span>
             <span className="text-[10px] text-green-200 font-bold">Closes in 3h 42m</span>
           </div>
           
           <button className="relative text-green-100 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full border border-[#00a859]"></span>
           </button>
           
           <button className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors border border-green-500">
              <User className="w-4 h-4 text-white" />
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
                       ? 'bg-[#00a859]/10 text-[#00a859] font-bold' 
                       : 'text-gray-400 hover:bg-[#2a2a2a] hover:text-white font-medium'
                   }`}
                 >
                   <Icon className={`w-5 h-5 ${isActive ? 'text-[#00a859]' : ''}`} />
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
             <Link key={item.name} to={item.path} className={`flex flex-col items-center gap-1 ${isActive ? 'text-[#00a859]' : 'text-gray-400'}`}>
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
