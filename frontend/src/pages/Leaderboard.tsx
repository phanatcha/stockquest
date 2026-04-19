import { useState } from 'react';
import { Trophy, TrendingUp, Medal, Plus, Users, ArrowRight } from 'lucide-react';

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState<'Global' | 'Friends' | 'Leagues'>('Global');
  
  // Mock data for Global Leaderboard
  const [leaders] = useState([
    { rank: 1, name: 'GordonGekko', value: 154320.50, returnPct: 54.32 },
    { rank: 2, name: 'WolfOfWallSt', value: 142100.00, returnPct: 42.10 },
    { rank: 3, name: 'DiamondHands', value: 135800.75, returnPct: 35.80 },
    { rank: 4, name: 'ToTheMoon', value: 128450.20, returnPct: 28.45 },
    { rank: 5, name: 'RetailTrader99', value: 115200.00, returnPct: 15.20 },
    { rank: 6, name: 'ValueInvestor', value: 108500.00, returnPct: 8.50 },
    { rank: 7, name: 'DayTraderPro', value: 104200.00, returnPct: 4.20 },
    { rank: 42, name: 'You (Sir User)', value: 98000.00, returnPct: -2.00, isCurrentUser: true }
  ]);

  // Mock data for Leagues
  const [leagues] = useState([
    { id: '1', name: 'Tech Titans', members: 142, prizePool: '$500K Virtual', endsIn: '12 Days' },
    { id: '2', name: 'Dividend Kings', members: 89, prizePool: '$250K Virtual', endsIn: '5 Days' },
    { id: '3', name: 'YOLO Traders', members: 450, prizePool: '$1M Virtual', endsIn: '24 Hours' }
  ]);

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
              onClick={() => setActiveTab('Global')}
              className={`px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest border transition-colors ${activeTab === 'Global' ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-transparent text-zinc-500 border-zinc-800 hover:text-white'}`}
            >
              Global
            </button>
            <button 
              onClick={() => setActiveTab('Friends')}
              className={`px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest border transition-colors ${activeTab === 'Friends' ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-transparent text-zinc-500 border-zinc-800 hover:text-white'}`}
            >
              Friends
            </button>
            <button 
              onClick={() => setActiveTab('Leagues')}
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
            {leaders.map((leader) => (
              <div 
                key={leader.rank} 
                className={`grid grid-cols-12 gap-4 px-8 py-4 items-center border-b border-zinc-800/30 transition-colors
                  ${leader.isCurrentUser ? 'bg-indigo-900/20 border-indigo-500/30' : 'hover:bg-zinc-800/30'}
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
                      leader.isCurrentUser ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                       {leader.name.charAt(0)}
                    </div>
                    <span className={`font-bold tracking-wide ${leader.isCurrentUser ? 'text-indigo-300' : 'text-zinc-200'}`}>
                      {leader.name}
                    </span>
                 </div>

                 <div className="col-span-5 flex flex-col items-end justify-center">
                    <span className={`text-lg font-black ${leader.isCurrentUser ? 'text-white' : 'text-zinc-300'}`}>
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
                 <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-xs tracking-widest py-3 px-6 rounded-full shadow-lg transition-all flex items-center gap-2">
                    <Plus className="w-4 h-4"/> New League
                 </button>
              </div>

              <div>
                 <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Discover Active Leagues</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {leagues.map((league) => (
                       <div key={league.id} className="bg-[#222] border border-zinc-800 hover:border-zinc-600 transition-colors p-5 rounded-xl flex flex-col gap-4">
                          <div className="flex justify-between items-start">
                             <h4 className="text-xl font-bold text-white tracking-wide">{league.name}</h4>
                             <span className="text-xs font-bold bg-zinc-800 text-zinc-400 px-2 py-1 rounded">Ends: {league.endsIn}</span>
                          </div>
                          
                          <div className="flex justify-between items-end mt-2">
                             <div className="flex flex-col gap-1">
                                <span className="text-[10px] uppercase font-bold text-zinc-500">Prize / Status</span>
                                <span className="text-sm font-black text-indigo-400">{league.prizePool}</span>
                             </div>
                             
                             <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1 text-xs text-zinc-400 font-bold">
                                   <Users className="w-4 h-4"/> {league.members}
                                </span>
                                <button className="bg-white hover:bg-zinc-200 text-black font-black text-[10px] uppercase tracking-widest py-2 px-4 rounded-full flex items-center gap-1 transition-colors">
                                  Join <ArrowRight className="w-3 h-3"/>
                                </button>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
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
