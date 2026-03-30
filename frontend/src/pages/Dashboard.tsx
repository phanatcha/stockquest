import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Clock, MoveUpRight, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketOverview = async () => {
      try {
         const symbols = 'AAPL,MSFT,NVDA,TSLA,AMZN,META,GOOGL,NFLX';
         const res = await fetch(`http://localhost:3000/market/batch?symbols=${symbols}`);
         if (res.ok) {
            const data = await res.json();
            const mapped = data.map((d: any) => ({
               symbol: d.symbol,
               name: d.name,
               price: d.price,
               change: d.change,
               percent: d.changePercent,
               isUp: d.changePercent >= 0
            }));
            setStocks(mapped);
         }
      } catch (err) {
         console.error('Failed to fetch market overview', err);
      } finally {
         setLoading(false);
      }
    };
    fetchMarketOverview();
  }, []);

  const topMovers = [...stocks].sort((a, b) => b.percent - a.percent).slice(0, 3);

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
            {loading ? (
              <div className="p-8 text-center text-zinc-500 animate-pulse">Loading live market data...</div>
            ) : stocks.map((stock) => (
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
                  <div className={`text-right font-bold text-sm ${stock.isUp ? 'text-[#00a859]' : 'text-red-500'} flex items-center justify-end gap-1`}>
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
               {loading ? (
                  <div className="text-center text-xs text-zinc-500 py-4">Scanning market...</div>
               ) : topMovers.map((t, idx) => (
                 <div key={idx} className="flex justify-between items-center cursor-pointer hover:bg-zinc-800/30 p-2 -mx-2 rounded-lg" onClick={() => navigate(`/stock/${t.symbol}`)}>
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 border border-zinc-700">
                         {t.symbol.slice(0, 2)}
                       </div>
                       <div className="flex flex-col leading-tight">
                          <span className="font-bold text-sm">{t.symbol}</span>
                          <span className="text-xs text-zinc-500 truncate max-w-[100px]">{t.name}</span>
                       </div>
                    </div>
                    <span className="text-[#00a859] font-bold text-sm">+{t.percent.toFixed(2)}%</span>
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
