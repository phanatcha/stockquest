
import { PlayCircle, BookOpen, Shield } from 'lucide-react';

const Learn = () => {
  const contents = [
    { title: 'Understanding Candlesticks', type: 'Video', icon: PlayCircle, color: 'text-red-500' },
    { title: 'The Basics of Value Investing', type: 'Article', icon: BookOpen, color: 'text-blue-500' },
    { title: 'How to Trade the Trend', type: 'Video', icon: PlayCircle, color: 'text-green-500' },
    { title: 'Risk Management 101', type: 'Article', icon: BookOpen, color: 'text-yellow-500' },
    { title: 'Reading Earnings Reports', type: 'Video', icon: PlayCircle, color: 'text-purple-500' },
    { title: 'Building a Balanced Portfolio', type: 'Article', icon: BookOpen, color: 'text-indigo-500' },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
      <div className="flex flex-col border-b border-zinc-800 pb-6">
        <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
           <BookOpen className="w-8 h-8 text-blue-500" /> StockQuest Academy
        </h1>
        <p className="text-zinc-400 text-lg mt-2">Master the markets before risking real capital.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {contents.map((item, i) => (
           <div key={i} className="group bg-[#1a1a1a] rounded-xl border border-zinc-800 overflow-hidden shadow-2xl hover:-translate-y-1 transition-transform cursor-pointer">
              <div className="aspect-video bg-zinc-900 border-b border-zinc-800 flex items-center justify-center relative overflow-hidden text-zinc-800">
                 {/* Mock thumbnail */}
                 <svg viewBox="0 0 100 100" className="w-32 h-32 absolute transform group-hover:scale-110 transition-transform duration-500 opacity-50">
                    <path d="M10,90 L30,60 L50,70 L90,10" fill="none" stroke="currentColor" strokeWidth="4" />
                    <circle cx="10" cy="90" r="4" fill="currentColor"/>
                    <circle cx="30" cy="60" r="4" fill="currentColor"/>
                    <circle cx="50" cy="70" r="4" fill="currentColor"/>
                    <circle cx="90" cy="10" r="4" fill="currentColor"/>
                 </svg>
                 <item.icon className="w-12 h-12 text-zinc-600 group-hover:text-white transition-colors z-10 drop-shadow-lg" />
              </div>
              
              <div className="p-5 flex flex-col gap-2">
                 <div className="flex items-center gap-2">
                    <Shield className={`w-4 h-4 ${item.color}`} />
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{item.type}</span>
                 </div>
                 <h3 className="font-bold text-white text-lg leading-tight group-hover:text-blue-400 transition-colors">
                    {item.title}
                 </h3>
                 <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                   Learn the fundamentals of {item.title.toLowerCase()} and how to apply these concepts effectively in StockQuest.
                 </p>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};

export default Learn;
