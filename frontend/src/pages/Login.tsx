import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white relative overflow-hidden font-sans text-black selection:bg-[#00a859]/30">
      
      {/* Header */}
      <header className="absolute top-0 left-0 w-full p-6 md:px-12 flex justify-between items-center z-50">
        <div className="w-12 h-12 flex items-center justify-center">
          {/* Conceptual Bull Logo */}
          <svg viewBox="0 0 100 100" className="w-full h-full text-black fill-current">
            <path d="M82,20 C85,30 85,45 78,55 C80,60 85,65 85,73 C85,82 78,90 65,90 C55,90 45,95 35,95 C25,95 15,85 15,70 C15,60 18,50 25,45 C20,40 18,30 20,20 C30,22 40,30 45,35 C55,30 65,30 70,25 C75,22 78,20 82,20 Z" />
            <path d="M20,10 C22,25 28,30 35,30 C30,20 25,10 20,10 Z" />
            <path d="M80,10 C78,25 72,30 65,30 C70,20 75,10 80,10 Z" />
            <text x="50" y="55" fontFamily="Arial" fontWeight="bold" fontSize="30" fill="white" textAnchor="middle">$</text>
          </svg>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/signin')}
            className="px-6 py-2 border-2 border-black font-bold hover:bg-black hover:text-white transition-all text-sm uppercase tracking-wide cursor-pointer"
          >
            Login
          </button>
          <button 
            onClick={() => navigate('/signup')}
            className="px-6 py-2 bg-[#00a859] text-white font-bold hover:bg-[#008f4c] shadow-[0_4px_14px_0_rgba(0,168,89,0.39)] transition-all text-sm uppercase tracking-wide cursor-pointer"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Main Content container */}
      <main className="relative z-40 w-full h-screen flex flex-col justify-start items-center pt-[15vh]">
        <button 
          onClick={() => navigate('/onboarding')}
          className="text-black font-bold uppercase text-xs md:text-sm tracking-widest border-b-[2px] border-black pb-0.5 flex items-center gap-1 mb-8 hover:text-gray-500 hover:border-gray-500 transition-colors"
        >
          Get Started <span className="text-[14px] leading-none font-bold">↗</span>
        </button>
        
        <h1 className="text-4xl md:text-6xl lg:text-[5rem] font-black text-center leading-[1.1] tracking-tight">
          Simulate the <span className="text-[#f03232]">Risk.</span> Keep the <span className="text-[#00a859]">Reward.</span>
        </h1>
      </main>

      {/* Overlaid Information Cards */}
      <div className="absolute bottom-10 left-10 md:left-20 bg-[#f03232] p-8 z-50 hidden lg:block shadow-2xl transform hover:-translate-y-2 transition-transform duration-300">
        <ul className="text-black font-black text-xl lg:text-2xl space-y-2 uppercase tracking-tight">
          <li>MODE: SIMULATION</li>
          <li>CAPITAL: VIRTUAL</li>
          <li>RISK: 0.00%</li>
          <li>GOAL: LEVEL UP</li>
        </ul>
      </div>

      <div className="absolute top-[35%] right-10 md:right-20 bg-[#00a859] p-8 z-50 hidden lg:block shadow-2xl transform hover:-translate-y-2 transition-transform duration-300">
        <ul className="text-black font-black text-xl lg:text-2xl space-y-2 uppercase tracking-tight">
          <li>MODE: LIVE MARKET</li>
          <li>ASSETS: REAL</li>
          <li>EXECUTION: INSTANT</li>
          <li>GOAL: PROFIT</li>
        </ul>
      </div>

      {/* Candlesticks Layer (Behind and intertwining with text) */}
      <div className="absolute bottom-0 left-0 w-full h-full pointer-events-none z-10 flex overflow-hidden">
         {/* Candle 1 (Red) */}
         <div className="absolute bottom-[20%] left-[8%] flex flex-col items-center justify-center">
            <div className="w-1 h-48 bg-[#f03232] absolute"></div>
            <div className="w-10 h-32 bg-[#f03232] relative"></div>
         </div>
         {/* Candle 2 (Green) */}
         <div className="absolute bottom-[35%] left-[22%] flex flex-col items-center justify-center">
            <div className="w-1 h-64 bg-[#00a859] absolute"></div>
            <div className="w-8 h-20 bg-[#00a859] relative"></div>
         </div>
         {/* Candle 3 (Red) */}
         <div className="absolute bottom-[10%] left-[32%] flex flex-col items-center justify-center">
            <div className="w-1 h-40 bg-[#f03232] absolute"></div>
            <div className="w-12 h-24 bg-[#f03232] relative"></div>
         </div>
         {/* Candle 4 (Green) */}
         <div className="absolute bottom-[40%] left-[45%] flex flex-col items-center justify-center h-full">
            <div className="w-1 h-32 bg-[#00a859] absolute"></div>
            <div className="w-10 h-40 bg-[#00a859] relative top-10"></div>
         </div>
         {/* Candle 5 (Red) */}
         <div className="absolute bottom-[25%] right-[40%] flex flex-col items-center justify-center z-30">
            <div className="w-1 h-56 bg-[#f03232] absolute"></div>
            <div className="w-14 h-32 bg-[#f03232] relative"></div>
         </div>
         {/* Candle 6 (Green) */}
         <div className="absolute bottom-[50%] right-[25%] flex flex-col items-center justify-center">
            <div className="w-1 h-32 bg-[#00a859] absolute"></div>
            <div className="w-8 h-24 bg-[#00a859] relative"></div>
         </div>
         {/* Candle 7 (Red) */}
         <div className="absolute bottom-[10%] right-[10%] flex flex-col items-center justify-center z-30">
            <div className="w-1 h-64 bg-[#f03232] absolute"></div>
            <div className="w-12 h-40 bg-[#f03232] relative"></div>
         </div>
      </div>

      {/* Massive Background Text */}
      <div className="absolute bottom-0 left-0 w-full flex justify-center items-end pointer-events-none z-20 overflow-hidden" 
           style={{ height: '70vh' }}>
        <h2 
          className="font-black text-black tracking-tighter whitespace-nowrap select-none"
          style={{ 
            fontSize: 'max(25vw, 300px)', 
            lineHeight: 0.75,
            transform: 'scaleY(1.8) translateY(10%)',
            transformOrigin: 'bottom center',
            letterSpacing: '-0.07em'
          }}
        >
          STOCKQUEST
        </h2>
      </div>

    </div>
  );
};

export default Login;
