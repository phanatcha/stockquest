import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Search, Crown, Copy, Trash2, Edit } from 'lucide-react';
import { getApiBase } from '../config/api';

const AdminDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await fetch(`${getApiBase()}/admin/dashboard`);
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading || !data) {
    return <div className="min-h-screen bg-[#111] text-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#111] text-white font-sans selection:bg-green-500/30">
      
      {/* Admin Header */}
      <header className="bg-[#00e676] text-black px-6 py-4 flex flex-col relative z-10 shadow-lg">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                  <Crown className="w-4 h-4 text-white" />
               </div>
               <div className="bg-red-800 text-white px-3 py-1 rounded-full text-xs font-bold border border-red-900 shadow-inner flex items-center gap-2">
                 <div className="w-4 h-4 rounded-full bg-white overflow-hidden flex items-center justify-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                 </div>
                 Mac Wilson
               </div>
            </div>
            
            <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center">
               <h1 className="text-xl font-black uppercase tracking-widest flex items-center gap-2">
                 <Crown className="w-5 h-5" /> Administrator <Crown className="w-5 h-5" />
               </h1>
               <span className="text-[10px] font-bold uppercase tracking-widest border-b border-black cursor-pointer hover:opacity-70 mt-1">Home</span>
            </div>
         </div>
      </header>

      <main className="max-w-5xl mx-auto p-8 flex flex-col gap-10">
         
         {/* Daily User Activity */}
         <section>
            <div className="flex justify-between items-end mb-4">
               <h2 className="text-xl font-bold tracking-wide">Daily user activity</h2>
               <div className="flex gap-4 text-[10px] font-bold text-zinc-400">
                  <span className="hover:text-white cursor-pointer transition-colors">Download PDF</span>
                  <span className="hover:text-white cursor-pointer transition-colors">Edit</span>
               </div>
            </div>
            <div className="bg-white rounded-[30px] p-6 h-[400px]">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={data.dailyActivity} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                   <XAxis 
                     dataKey="time" 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{ fontSize: 10, fill: '#666', dy: 8 }} 
                   />
                   <YAxis 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{ fontSize: 10, fill: '#666' }} 
                   />
                   <Tooltip 
                     contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
                   />
                   <Line 
                     type="monotone" 
                     dataKey="users" 
                     stroke="#3b82f6" 
                     strokeWidth={2} 
                     dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} 
                     activeDot={{ r: 6 }} 
                   />
                 </LineChart>
               </ResponsiveContainer>
            </div>
         </section>

         {/* Suspicious Users */}
         <section>
            <h2 className="text-xl font-bold tracking-wide mb-4">Suspicious Users</h2>
            <div className="flex items-center bg-[#1a1a1a] rounded-lg border border-zinc-800 px-3 py-2 w-64 mb-6">
              <Search className="w-4 h-4 text-zinc-500 mr-2" />
              <input type="text" placeholder="Search by name or UID" className="bg-transparent text-xs w-full outline-none text-white placeholder:text-zinc-600" />
            </div>

            <div className="flex gap-6 overflow-x-auto pb-4 snap-x hide-scrollbar">
               {data.suspiciousUsers.map((user: any) => (
                  <div key={user.id} className={`min-w-[400px] h-48 rounded-[2rem] p-6 snap-center relative overflow-hidden shadow-2xl border ${user.color || 'bg-red-900 border-red-700'}`}>
                     {/* Overlay noise / texture simulated by slight inner shadow */}
                     <div className="absolute inset-0 bg-black/10 shadow-inner mix-blend-overlay pointer-events-none"></div>
                     
                     <div className="flex h-full w-full justify-between z-10 relative">
                        {/* Avatar Mock */}
                        <div className="w-24 h-full flex items-center justify-center">
                           <div className="w-20 h-24 bg-[#452718] rounded-2xl transform rotate-3 border-2 border-[#2d1a10] relative">
                               <div className="absolute top-1/3 left-1/4 w-1/2 h-3 bg-blue-600 rounded"></div>
                           </div>
                        </div>

                        {/* Details */}
                        <div className="flex flex-col items-end text-right justify-center">
                           <h4 className="text-[10px] font-black tracking-widest uppercase flex items-center gap-1 mb-1">
                             <Crown className="w-3 h-3"/> {user.reason}
                           </h4>
                           <h3 className="text-3xl font-black uppercase tracking-widest leading-none mb-2">{user.username}</h3>
                           
                           <div className="text-[8px] font-bold text-white/70 mb-2">
                             Date: {user.date} <br/> Time: {user.time} <br/> UID: {user.uid}
                           </div>

                           <button className="bg-black/80 hover:bg-black text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full transition-colors backdrop-blur-md border border-white/10 mt-auto">
                              View more info
                           </button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </section>

         {/* AI Sentiment */}
         <section>
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-bold tracking-wide">AI Sentiment</h2>
               <div className="flex items-center bg-[#1a1a1a] rounded-lg border border-zinc-800 px-3 py-2 w-64">
                 <Search className="w-4 h-4 text-zinc-500 mr-2" />
                 <input type="text" placeholder="Find by keywords" className="bg-transparent text-xs w-full outline-none text-white placeholder:text-zinc-600" />
               </div>
            </div>

            <div className="flex flex-col gap-4">
               {data.aiSentiment.map((item: any) => (
                  <div key={item.id} className="bg-transparent border border-zinc-500 rounded-[20px] p-6 relative group hover:border-[#00e676] transition-colors">
                     
                     <div className="flex justify-between items-start mb-4 pr-10">
                        <h3 className="text-2xl font-bold leading-tight w-2/3">{item.title}</h3>
                        <div className="text-right text-xs text-zinc-400 font-mono">
                           Date: {item.date}<br/>Time: {item.time}
                        </div>
                     </div>

                     <p className="text-zinc-300 text-sm font-mono w-4/5 leading-relaxed tracking-wide">
                        {item.text}
                     </p>

                     <div className="absolute bottom-4 right-4 flex gap-3 text-zinc-400">
                        <button className="hover:text-white transition-colors"><Copy className="w-4 h-4" /></button>
                        <button className="hover:text-white transition-colors"><Trash2 className="w-4 h-4" /></button>
                        <button className="hover:text-white transition-colors"><Edit className="w-4 h-4" /></button>
                     </div>
                  </div>
               ))}
            </div>
         </section>

      </main>
    </div>
  );
};

export default AdminDashboard;
