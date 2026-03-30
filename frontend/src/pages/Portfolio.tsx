import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const stockCatalog: Record<string, { currentPrice: number, color: string }> = {
  'AAPL': { currentPrice: 173.50, color: '#f87171' },
  'MSFT': { currentPrice: 415.20, color: '#60a5fa' },
  'NVDA': { currentPrice: 890.05, color: '#4ade80' },
  'TSLA': { currentPrice: 175.22, color: '#c084fc' },
  'AMZN': { currentPrice: 180.30, color: '#facc15' },
};

const Portfolio = () => {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/');
          return;
        }
        
        const res = await fetch('http://localhost:3000/portfolios/mine', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setPortfolio(data);
        }
      } catch (err) {
        console.error('Failed to fetch portfolio:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, [navigate]);

  if (loading || !portfolio) {
    return <div className="p-8 text-center text-zinc-400">Loading Portfolio...</div>;
  }

  const holdings = portfolio.holdings.map((h: any) => {
     const catalog = stockCatalog[h.symbol] || { currentPrice: h.avgPrice, color: '#cbd5e1' };
     return {
       ...h,
       currentPrice: catalog.currentPrice,
       color: catalog.color
     };
  });

  const cash = portfolio.cashBalance;
  
  const totalValue = holdings.reduce((sum: number, h: any) => sum + (h.quantity * h.currentPrice), cash);
  const totalReturn = holdings.reduce((sum: number, h: any) => sum + (h.quantity * (h.currentPrice - h.avgPrice)), 0);

  const pieData = [
    { name: 'Cash', value: cash, color: '#52525b' },
    ...holdings.map((h: any) => ({ name: h.symbol, value: h.quantity * h.currentPrice, color: h.color }))
  ];

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-zinc-800 pb-4 mb-2">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
             <Briefcase className="w-8 h-8 text-red-600" /> My Portfolio
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Track your performance and holdings.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
           <button className="px-4 py-1.5 text-xs font-bold rounded-md bg-zinc-800 text-white shadow">Overview</button>
           <button className="px-4 py-1.5 text-xs font-bold rounded-md text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors">History</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Portfolio Performance Summary */}
         <div className="bg-[#1a1a1a] rounded-xl border border-zinc-800 p-6 flex flex-col shadow-2xl lg:col-span-2">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">Total Value</h3>
            <div className="flex items-end gap-4 mb-6">
               <span className="text-5xl font-black text-white">${totalValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
               <div className={`flex items-center gap-1 font-bold text-lg mb-1 ${totalReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                 {totalReturn >= 0 ? <ArrowUpRight className="w-5 h-5"/> : <ArrowDownRight className="w-5 h-5"/>}
                 ${Math.abs(totalReturn).toFixed(2)}
               </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-6 border-t border-zinc-800">
               <div>
                  <h4 className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Total Return</h4>
                  <span className={`text-xl font-bold ${totalReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {totalReturn >= 0 ? '+' : ''}{((totalReturn / (totalValue - totalReturn)) * 100).toFixed(2)}%
                  </span>
               </div>
               <div>
                  <h4 className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Buying Power</h4>
                  <span className="text-xl font-bold text-white">${cash.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
               </div>
               <div>
                  <h4 className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Holdings Value</h4>
                  <span className="text-xl font-bold text-zinc-300">${(totalValue - cash).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
               </div>
               <div>
                  <h4 className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Rank</h4>
                  <span className="text-xl font-bold text-purple-400">#42</span>
               </div>
            </div>
         </div>

         {/* Allocation Pie Chart */}
         <div className="bg-[#1a1a1a] rounded-xl border border-zinc-800 p-6 flex flex-col items-center justify-center shadow-2xl relative">
            <h3 className="absolute top-6 left-6 text-sm font-bold text-zinc-500 uppercase tracking-widest">Allocation</h3>
            <div className="w-full h-[240px] mt-8">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                       data={pieData}
                       cx="50%"
                       cy="50%"
                       innerRadius={60}
                       outerRadius={90}
                       paddingAngle={5}
                       dataKey="value"
                       stroke="none"
                     >
                       {pieData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                     </Pie>
                     <Tooltip 
                        formatter={(value: number | undefined) => value !== undefined ? `$${value.toLocaleString(undefined, {minimumFractionDigits: 2})}` : ''}
                        contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
                     />
                  </PieChart>
               </ResponsiveContainer>
            </div>
            {/* Legend inside pie */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mt-4">
               <span className="block text-xl font-black text-white">{holdings.length}</span>
               <span className="block text-xs font-bold text-zinc-500 uppercase tracking-widest">Assets</span>
            </div>
         </div>
      </div>

      {/* Holdings Table */}
      <h2 className="text-xl font-black text-white tracking-widest uppercase mt-4">Your Positions</h2>
      <div className="bg-[#1a1a1a] rounded-xl border border-zinc-800 overflow-hidden shadow-2xl">
         <div className="grid grid-cols-4 md:grid-cols-6 gap-4 p-4 border-b border-zinc-800 text-xs font-bold text-zinc-500 uppercase tracking-wider">
            <div className="col-span-2">Asset</div>
            <div className="text-right">Shares</div>
            <div className="hidden md:block text-right">Avg Price</div>
            <div className="text-right">Current Price</div>
            <div className="hidden md:block text-right">Return</div>
         </div>

         {holdings.map((h: any) => {
           const val = h.quantity * h.currentPrice;
           const ret = val - (h.quantity * h.avgPrice);
           const pct = (ret / (h.quantity * h.avgPrice)) * 100 || 0;

           return (
             <div key={h.symbol} className="grid grid-cols-4 md:grid-cols-6 gap-4 p-4 items-center border-b last:border-0 border-zinc-800/50 hover:bg-zinc-800/50 transition-colors">
                <div className="col-span-2 flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full font-black text-xs flex items-center justify-center text-white" style={{backgroundColor: h.color}}>
                      {h.symbol.charAt(0)}
                   </div>
                   <span className="font-bold text-white tracking-wide">{h.symbol}</span>
                </div>
                
                <div className="text-right font-medium text-zinc-300">{h.quantity}</div>
                <div className="hidden md:block text-right font-medium text-zinc-500">${h.avgPrice.toFixed(2)}</div>
                <div className="text-right font-medium text-white">${h.currentPrice.toFixed(2)}</div>
                
                <div className={`hidden md:flex justify-end font-bold items-center gap-1 ${ret >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {ret >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  ${Math.abs(ret).toFixed(2)} ({pct.toFixed(2)}%)
                </div>
             </div>
           )
         })}
      </div>
      
    </div>
  );
};

export default Portfolio;
