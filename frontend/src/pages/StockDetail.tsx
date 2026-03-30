import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';

// Mock data generator for chart
const generateData = (startPrice: number, points: number) => {
  let price = startPrice;
  return Array.from({ length: points }).map((_, i) => {
    price = price + (Math.random() - 0.48) * 2; // slightly upward bias
    return { time: `10:${i < 10 ? '0'+i : i}`, price };
  });
};

const StockDetail = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [orderMode, setOrderMode] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState('market');
  const [shares, setShares] = useState('');
  const [currentPrice] = useState(173.50); // MOCKED
  const [chartData] = useState(() => generateData(currentPrice - 5, 60));
  
  const estimatedCost = (parseFloat(shares || '0') * currentPrice).toFixed(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Order submitted: ${orderMode.toUpperCase()} ${shares} shares of ${symbol} at Market Price.`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-400 hover:text-white font-bold w-fit transition-colors mb-2"
      >
        <ArrowLeft className="w-5 h-5" /> Back to Market
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart Area */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-[#1a1a1a] rounded-xl border border-zinc-800 p-6 flex flex-col relative shadow-2xl">
             <div className="flex justify-between items-start mb-6">
               <div className="flex items-center gap-4">
                 <div className="w-14 h-14 bg-zinc-800 rounded-xl border border-zinc-700 flex items-center justify-center font-black text-xl text-white">
                   {symbol?.charAt(0)}
                 </div>
                 <div>
                   <h1 className="text-3xl font-black text-white tracking-widest">{symbol}</h1>
                   <p className="text-zinc-500 font-bold -mt-1 tracking-wide">Apple Inc.</p>
                 </div>
               </div>
               
               <div className="text-right">
                 <h2 className="text-4xl font-black text-white">${currentPrice.toFixed(2)}</h2>
                 <p className="text-green-500 font-bold tracking-widest text-sm flex items-center justify-end gap-1">
                   +1.25 (0.73%) <Activity className="w-4 h-4" />
                 </p>
               </div>
             </div>

             {/* Chart Range Selectors */}
             <div className="flex gap-2 mb-4 border-b border-zinc-800 pb-4">
                {['1H', '1D', '1W', '1M', '3M', '1Y', 'ALL'].map((r) => (
                  <button key={r} className={`px-4 py-1.5 text-xs font-bold rounded-md ${r === '1D' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}>
                    {r}
                  </button>
                ))}
             </div>

             {/* Chart Render */}
             <div className="h-0 min-h-[400px] w-full mt-4 bg-transparent border-dashed border-zinc-800/50 pt-2 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
                      itemStyle={{ color: '#22c55e', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="price" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl border border-zinc-800 p-6 flex flex-col shadow-2xl">
             <h3 className="text-lg font-bold text-white mb-4">About {symbol}</h3>
             <p className="text-zinc-400 text-sm leading-relaxed">
               Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. It also sells various related services.
             </p>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-zinc-800">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Market Cap</span>
                  <span className="text-white font-medium">2.7T</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">P/E Ratio</span>
                  <span className="text-white font-medium">28.4</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Div Yield</span>
                  <span className="text-white font-medium">0.54%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Vol</span>
                  <span className="text-white font-medium">54.2M</span>
                </div>
             </div>
          </div>
        </div>

        {/* Action Panel (Buy/Sell) */}
        <div className="flex flex-col gap-6">
           <div className="bg-[#1a1a1a] rounded-xl border border-zinc-800 shadow-2xl overflow-hidden sticky top-24">
              {/* Tabs */}
              <div className="flex w-full">
                <button 
                  onClick={() => setOrderMode('buy')}
                  className={`flex-1 py-4 text-center font-black tracking-widest uppercase transition-colors ${orderMode === 'buy' ? 'bg-green-600/10 text-green-500 border-b-2 border-green-500' : 'text-zinc-500 hover:text-white border-b-2 border-zinc-800 hover:bg-zinc-800/50'}`}
                >
                  Buy {symbol}
                </button>
                <button 
                  onClick={() => setOrderMode('sell')}
                  className={`flex-1 py-4 text-center font-black tracking-widest uppercase transition-colors ${orderMode === 'sell' ? 'bg-red-600/10 text-red-500 border-b-2 border-red-500' : 'text-zinc-500 hover:text-white border-b-2 border-zinc-800 hover:bg-zinc-800/50'}`}
                >
                  Sell {symbol}
                </button>
              </div>

              <div className="p-6">
                 {/* Order Type */}
                 <div className="flex gap-2 mb-6 bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
                    {['market', 'limit', 'stop'].map(type => (
                      <button 
                        key={type}
                        onClick={() => setOrderType(type)}
                        className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${orderType === type ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-white'}`}
                      >
                        {type}
                      </button>
                    ))}
                 </div>

                 <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Share input */}
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                       <label className="text-sm font-bold text-zinc-400">Shares</label>
                       <input 
                         type="number" 
                         placeholder="0" 
                         value={shares}
                         onChange={(e) => setShares(e.target.value)}
                         className="bg-transparent text-right text-3xl font-black text-white w-24 outline-none placeholder:text-zinc-700" 
                         min="1"
                       />
                    </div>
                    
                    {/* Price read-only */}
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                       <label className="text-sm font-bold text-zinc-400">Market Price</label>
                       <span className="text-xl font-bold text-zinc-200">${currentPrice.toFixed(2)}</span>
                    </div>
                    
                    {/* Estimated Cost calculation */}
                    <div className="flex justify-between items-center mt-2 pt-4 border-t border-zinc-800 border-dashed">
                       <label className="text-sm font-bold text-white uppercase tracking-widest">Est. {orderMode === 'buy' ? 'Cost' : 'Credit'}</label>
                       <span className="text-2xl font-black text-white">${estimatedCost}</span>
                    </div>

                    <p className="text-xs text-zinc-500 text-center font-medium mt-2 mb-2">
                      Available Buying Power: <strong className="text-zinc-300">$100,000.00</strong>
                    </p>

                    <button 
                      type="submit" 
                      disabled={!shares || Number(shares) <= 0}
                      className={`w-full py-4 rounded-lg font-black text-lg tracking-widest uppercase shadow-xl transition-all disabled:opacity-50
                        ${orderMode === 'buy' ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'}
                      `}
                    >
                      Review Order
                    </button>
                 </form>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default StockDetail;
