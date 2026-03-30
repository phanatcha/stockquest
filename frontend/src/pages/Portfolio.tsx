import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, ChevronDown, Shield, Trophy, Flame, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMode } from '../context/ModeContext';

const Portfolio = () => {
  const navigate = useNavigate();
  const { isLiveMarket } = useMode();
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'holdings' | 'activity'>('activity');

  // Fetch real portfolio to support Holdings tab, even if we hardcode Activity
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/');
        
        const res = await fetch(`http://localhost:3000/portfolios/mine?live=${isLiveMarket}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setPortfolio(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, [navigate, isLiveMarket]);

  const activities = [
    { symbol: 'UPS', name: 'United Parcel Service', type: 'Increased', percent: '5.50%', shares: '~ 650,000 Shares', isPos: true },
    { symbol: 'BAC', name: 'Bank of America', type: 'Decreased', percent: '2.15%', shares: '~ 1.20 Million Shares', isPos: false },
    { symbol: 'NVDA', name: 'Nvidia', type: 'Increased', percent: '8.50%', shares: '~ 1.15 Million Shares', isPos: true },
    { symbol: 'AAPL', name: 'Apple Inc.', type: 'Decreased', percent: '5.30%', shares: '~ 1.85 Million Shares', isPos: false },
  ];

  const renderIDCard = () => (
    <div className="w-full mx-auto flex justify-center mb-10 pt-8 mt-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]">
      {/* Container for the metallic card */}
      <div className="w-[800px] h-[450px] rounded-[40px] relative overflow-hidden bg-gradient-to-br from-[#e4e4e7] via-[#f4f4f5] to-[#a1a1aa] shadow-2xl border-4 border-white/20 p-10 flex text-black">
        
        {/* Top Left Icon */}
        <div className="absolute top-8 left-8 opacity-20">
           <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>

        {/* Top Right Header */}
        <div className="absolute top-8 right-10 text-right">
           <h2 className="text-2xl font-black font-sans tracking-tight text-gray-800">StockQuest ID Card</h2>
           <div className="flex flex-col items-end mt-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Reveal Strategy</span>
              <button className="flex items-center gap-2 bg-white px-3 py-1 rounded-full text-xs font-bold border border-gray-300 shadow-sm cursor-pointer">
                 private <ChevronDown className="w-3 h-3"/>
              </button>
           </div>
        </div>

        {/* Bottom Right Stamp */}
        <div className="absolute bottom-8 right-10 opacity-30">
           <Shield className="w-16 h-16 fill-gray-800 text-gray-800" />
        </div>

        {/* Center Content */}
        <div className="flex w-full h-full items-center mt-6">
           
           {/* Left Avatar & Toggle */}
           <div className="flex flex-col items-center ml-10">
              <div className="w-48 h-48 relative mb-8">
                 {/* Mocking the user's spikey avatar */}
                 <div className="absolute inset-0 bg-[#452718] rounded-[2rem] transform rotate-3 shadow-inner overflow-hidden border-8 border-transparent">
                    {/* Simulated spikes & glasses */}
                    <div className="absolute top-0 w-full h-10 bg-[#2d1a10] transform -translate-y-4 rotate-12" style={{ clipPath: 'polygon(0 100%, 10% 0, 20% 100%, 30% 0, 40% 100%, 50% 0, 60% 100%, 70% 0, 80% 100%, 90% 0, 100% 100%)'}}></div>
                    <div className="absolute top-1/3 left-1/4 w-1/2 h-4 bg-blue-600 rounded flex justify-between"></div>
                    <div className="absolute top-1/2 left-[40%] w-10 h-3 bg-white/80 rounded-full"></div>
                 </div>
              </div>
              
              <div className="flex bg-zinc-800 rounded-full p-1 text-xs font-bold text-gray-400 w-40 justify-between items-center px-1">
                 <div className="bg-zinc-600 text-white px-3 py-1 rounded-full w-1/2 text-center text-[10px] cursor-pointer">Sir</div>
                 <div className="w-1/2 text-center text-[10px] cursor-pointer">Madam</div>
              </div>
           </div>

           {/* Right Info Details */}
           <div className="ml-16 flex flex-col justify-center h-full">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-sm font-black text-gray-800">LVL 17</span>
                <span className="text-xl font-black text-blue-600 flex items-center tracking-tighter">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="mr-1 text-blue-600"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg> 
                   WHALE
                </span>
              </div>
              
              <h1 className="text-5xl font-black text-black tracking-tight mb-4 uppercase">{(portfolio?.user?.username || 'PATTER301')}</h1>
              
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full w-fit border border-gray-200 shadow-sm mb-6">
                 <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                 <span className="text-xs font-bold text-gray-800 tracking-wide">Online</span>
              </div>

              <div>
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Achievement Badges</h4>
                 <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-full border-4 border-blue-600 bg-blue-800 flex items-center justify-center shadow-lg transform -rotate-6">
                       <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                    </div>
                    <div className="w-12 h-12 rounded-full border-4 border-[#8B4513] bg-[#A0522D] flex items-center justify-center shadow-lg transform rotate-6">
                       <Trophy className="w-6 h-6 text-[#CD7F32] fill-[#CD7F32]" />
                    </div>
                    <div className="w-12 h-12 rounded-full border-4 border-[#3E2723] bg-[#4E342E] flex items-center justify-center shadow-lg transform -rotate-3">
                       <Flame className="w-6 h-6 text-red-500 fill-white" />
                    </div>
                 </div>
              </div>
           </div>
           
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full flex justify-center pb-20 mt-4 px-4 bg-[#111]">
      <div className="w-full max-w-5xl">
        
        {renderIDCard()}

        {/* Tab Selector */}
        <div className="flex w-full mb-0 gap-4 mt-6">
           <button 
             onClick={() => setActiveTab('holdings')}
             className={`flex-1 py-5 text-center font-bold text-lg rounded-t-xl transition-colors ${activeTab === 'holdings' ? 'bg-[#222] text-white' : 'bg-[#2a2a2a] text-zinc-300 hover:bg-[#333]'}`}
           >
             Holdings
           </button>
           <button 
             onClick={() => setActiveTab('activity')}
             className={`flex-1 py-5 text-center font-bold text-lg rounded-t-xl transition-colors ${activeTab === 'activity' ? 'bg-[#222] text-white' : 'bg-[#2a2a2a] text-zinc-300 hover:bg-[#333]'}`}
           >
             Activity
           </button>
        </div>

        <div className="bg-[#222] rounded-b-xl rounded-t-sm p-8 min-h-[500px]">
          {activeTab === 'activity' ? (
             <div>
                <h2 className="text-3xl font-bold text-white mb-2">Activity</h2>
                <p className="text-zinc-500 font-bold mb-8">Reported on Mar 2026</p>
                
                <div className="flex flex-col gap-5">
                   {activities.map((act) => (
                      <div key={act.symbol} className="bg-[#111] p-6 rounded-xl flex justify-between items-center shadow-sm">
                         <div className="flex flex-col">
                            <h3 className="text-xl font-bold text-white tracking-wide">{act.symbol}</h3>
                            <span className="text-xs font-medium text-zinc-500">{act.name}</span>
                         </div>
                         <div className="flex flex-col items-end gap-1">
                            <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-white mb-1 ${act.isPos ? 'bg-[#00e676]' : 'bg-[#ff3d00]'}`}>
                               {act.type}
                            </div>
                            <span className="text-2xl font-black text-white">{act.percent}</span>
                            <span className="text-xs text-zinc-600 font-medium">{act.shares}</span>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          ) : (
             <div>
                <h2 className="text-3xl font-bold text-white mb-2">Holdings</h2>
                <p className="text-zinc-500 font-bold mb-8">Live Portfolio Valuation</p>
                
                {loading || !portfolio ? (
                   <div className="text-center text-zinc-500 py-10 animate-pulse">Loading holdings...</div>
                ) : (
                   <div className="flex flex-col gap-5">
                      {portfolio.holdings.map((h: any) => {
                         const returnVal = (h.quantity * h.currentPrice) - (h.quantity * h.avgPrice);
                         const isPos = returnVal >= 0;
                         return (
                            <div key={h.symbol} className="bg-[#111] p-6 rounded-xl flex justify-between items-center shadow-sm">
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center font-black text-xl border border-zinc-700 text-white">
                                     {h.symbol.charAt(0)}
                                  </div>
                                  <div className="flex flex-col">
                                     <h3 className="text-xl font-bold text-white tracking-wide">{h.symbol}</h3>
                                     <span className="text-xs font-medium text-zinc-500">{h.quantity} Shares @ ${h.avgPrice.toFixed(2)}</span>
                                  </div>
                               </div>
                               <div className="flex flex-col items-end gap-1">
                                  <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-white mb-1 ${isPos ? 'bg-[#00e676]' : 'bg-[#ff3d00]'}`}>
                                     {isPos ? 'Gain' : 'Loss'}
                                  </div>
                                  <span className="text-2xl font-black text-white">${h.currentPrice.toFixed(2)}</span>
                                  <span className={`text-xs font-bold flex items-center gap-1 ${isPos ? 'text-[#00e676]' : 'text-[#ff3d00]'}`}>
                                     {isPos ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>}
                                     ${Math.abs(returnVal).toFixed(2)} Total Return
                                  </span>
                               </div>
                            </div>
                         )
                      })}
                      {portfolio.holdings.length === 0 && (
                         <div className="text-center bg-[#111] border border-zinc-800 p-8 rounded-xl text-zinc-500">
                            No holdings yet. Go buy some stocks!
                         </div>
                      )}
                   </div>
                )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
