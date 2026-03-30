import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Clock, MoveUpRight, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  // Mock Market Data
  const [stocks] = useState([
    { symbol: 'AAPL', name: 'Apple Inc.', price: 173.50, change: 1.25, percent: 0.73, isUp: true },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 415.20, change: 3.10, percent: 0.75, isUp: true },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 890.05, change: -12.40, percent: -1.37, isUp: false },
    { symbol: 'TSLA', name: 'Tesla, Inc.', price: 175.22, change: -4.50, percent: -2.50, isUp: false },
    { symbol: 'AMZN', name: 'Amazon.com', price: 180.30, change: 2.15, percent: 1.21, isUp: true },
    { symbol: 'META', name: 'Meta Platforms', price: 505.40, change: 8.90, percent: 1.79, isUp: true },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 154.20, change: 0.45, percent: 0.29, isUp: true },
    { symbol: 'NFLX', name: 'Netflix', price: 620.10, change: -5.30, percent: -0.85, isUp: false },
  ]);

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
      
      {/* Left Column: Market List */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex justify-between items-end border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Market Overview</h1>
            <p className="text-zinc-400 text-sm mt-1">Discover stocks and build your portfolio.</p>
          </div>
          <div className="hidden sm:flex bg-zinc-800/50 rounded-lg p-1">
             <button className="px-4 py-1.5 text-xs font-bold rounded-md bg-zinc-700 text-white shadow">All</button>
             <button className="px-4 py-1.5 text-xs font-bold rounded-md text-zinc-400 hover:text-white">Tech</button>
             <button className="px-4 py-1.5 text-xs font-bold rounded-md text-zinc-400 hover:text-white">Crypto</button>
          </div>
        </div>

        {/* Stock List Container */}
        <div className="bg-[#1a1a1a] rounded-xl border border-zinc-800 overflow-hidden shadow-2xl">
          {/* Table Header */}
          <div className="grid grid-cols-4 md:grid-cols-5 gap-4 p-4 border-b border-zinc-800 text-xs font-bold text-zinc-500 uppercase tracking-wider">
            <div className="col-span-2 md:col-span-2">Symbol</div>
            <div className="text-right">Price</div>
            <div className="text-right">Change</div>
            <div className="hidden md:block text-right">Action</div>
          </div>

          <div className="flex flex-col">
            {stocks.map((stock) => (
              <div 
                key={stock.symbol}
                onClick={() => navigate(`/stock/${stock.symbol}`)}
                className="grid grid-cols-4 md:grid-cols-5 gap-4 p-4 items-center border-b border-zinc-800/50 hover:bg-zinc-800/50 transition-colors cursor-pointer group"
              >
                {/* Symbol & Name */}
                <div className="col-span-2 md:col-span-2 flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 font-black text-xs flex items-center justify-center text-zinc-300">
                      {stock.symbol.charAt(0)}
                   </div>
                   <div className="flex flex-col">
                      <span className="font-bold text-white tracking-wide">{stock.symbol}</span>
                      <span className="text-xs text-zinc-500 truncate max-w-[120px]">{stock.name}</span>
                   </div>
                </div>
                
                {/* Price */}
                <div className="text-right font-medium text-zinc-200">
                  ${stock.price.toFixed(2)}
                </div>

                {/* Change */}
                <div className={`text-right font-bold text-sm ${stock.isUp ? 'text-green-500' : 'text-red-500'} flex items-center justify-end gap-1`}>
                  {stock.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {stock.isUp ? '+' : ''}{stock.percent.toFixed(2)}%
                </div>

                {/* Detail Button */}
                <div className="hidden md:flex justify-end">
                   <button className="text-zinc-500 group-hover:text-white transition-colors p-2 bg-zinc-800/0 group-hover:bg-zinc-700 rounded-full">
                     <ArrowRight className="w-4 h-4" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Mini Widgets */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
         {/* Trending Now */}
         <div className="bg-[#1a1a1a] rounded-xl border border-zinc-800 p-5 shadow-2xl">
            <h3 className="font-bold text-zinc-300 text-sm tracking-widest uppercase mb-4 flex items-center gap-2">
              <MoveUpRight className="w-4 h-4 text-green-500"/> Top Movers
            </h3>
            <div className="flex flex-col gap-4">
               {[stocks[5], stocks[1], stocks[0]].map((t, idx) => (
                 <div key={idx} className="flex justify-between items-center cursor-pointer hover:bg-zinc-800/30 p-2 -mx-2 rounded-lg" onClick={() => navigate(`/stock/${t.symbol}`)}>
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 border border-zinc-700">
                         {t.symbol.slice(0, 2)}
                       </div>
                       <div className="flex flex-col leading-tight">
                          <span className="font-bold text-sm">{t.symbol}</span>
                          <span className="text-xs text-zinc-500">{t.name}</span>
                       </div>
                    </div>
                    <span className="text-green-500 font-bold text-sm">+{t.percent.toFixed(2)}%</span>
                 </div>
               ))}
            </div>
         </div>

         {/* Upcoming events / market status */}
         <div className="bg-[#1a1a1a] rounded-xl border border-zinc-800 p-5 shadow-2xl">
            <h3 className="font-bold text-zinc-300 text-sm tracking-widest uppercase mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500"/> Market Status
            </h3>
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex flex-col gap-2">
               <span className="text-amber-500 font-bold tracking-widest text-xs uppercase">Open</span>
               <p className="text-sm text-zinc-300">The US Stock Market is currently open for trading. Executions are instant.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
