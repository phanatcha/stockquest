import { useState } from 'react';
import { Trophy, TrendingUp, Medal } from 'lucide-react';

const Leaderboard = () => {
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
            <button className="px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest bg-zinc-800 text-white border border-zinc-700 hover:bg-zinc-700 transition-colors">Global</button>
            <button className="px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest bg-transparent text-zinc-500 border border-zinc-800 hover:text-white transition-colors">Friends</button>
            <button className="px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest bg-transparent text-zinc-500 border border-zinc-800 hover:text-white transition-colors">Leagues</button>
         </div>

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
      </div>
    </div>
  );
};

export default Leaderboard;
