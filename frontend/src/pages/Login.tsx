import { useNavigate } from 'react-router-dom';
import unionIcon from '../assets/Union.svg';

const Login = () => {
  const navigate = useNavigate();

  // Candlestick data: left%, bottom%, bodyHeight, wickHeight, isGreen, bodyWidth
  const candles = [
    { left: '3%',  bottom: '10%', bodyH: 80,  wickH: 120, green: false, w: 28 },
    { left: '9%',  bottom: '20%', bodyH: 110, wickH: 160, green: true,  w: 32 },
    { left: '15%', bottom: '8%',  bodyH: 70,  wickH: 110, green: false, w: 24 },
    { left: '20%', bottom: '25%', bodyH: 130, wickH: 180, green: true,  w: 36 },
    { left: '26%', bottom: '5%',  bodyH: 90,  wickH: 140, green: false, w: 28 },
    { left: '31%', bottom: '18%', bodyH: 100, wickH: 150, green: true,  w: 32 },
    { left: '37%', bottom: '12%', bodyH: 60,  wickH: 100, green: false, w: 24 },
    { left: '42%', bottom: '30%', bodyH: 140, wickH: 200, green: true,  w: 36 },
    { left: '47%', bottom: '8%',  bodyH: 85,  wickH: 130, green: false, w: 28 },
    { left: '52%', bottom: '22%', bodyH: 120, wickH: 170, green: true,  w: 32 },
    { left: '57%', bottom: '10%', bodyH: 75,  wickH: 115, green: false, w: 28 },
    { left: '62%', bottom: '28%', bodyH: 150, wickH: 210, green: true,  w: 40 },
    { left: '68%', bottom: '6%',  bodyH: 95,  wickH: 145, green: false, w: 30 },
    { left: '73%', bottom: '20%', bodyH: 110, wickH: 160, green: true,  w: 32 },
    { left: '78%', bottom: '12%', bodyH: 65,  wickH: 105, green: false, w: 24 },
    { left: '83%', bottom: '25%', bodyH: 125, wickH: 175, green: true,  w: 36 },
    { left: '88%', bottom: '8%',  bodyH: 80,  wickH: 125, green: false, w: 28 },
    { left: '93%', bottom: '18%', bodyH: 105, wickH: 155, green: true,  w: 32 },
  ];

  return (
    <div className="min-h-screen bg-white relative overflow-hidden font-sans text-black selection:bg-[#00a859]/30">
      
      {/* Header */}
      <header className="absolute top-0 left-0 w-full p-6 md:px-12 flex justify-between items-center z-50">
        <div className="w-12 h-12 flex items-center justify-center">
            <div className="w-12 h-12 flex items-center justify-center">
              <img src={unionIcon} alt="StockQuest Logo" className="w-full h-full" />
            </div>
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

      {/* Main Content */}
      <main className="relative z-40 w-full flex flex-col justify-start items-center pt-[12vh]">
        <button 
          onClick={() => navigate('/onboarding')}
          className="text-black font-bold uppercase text-xs md:text-sm tracking-widest border-b-[2px] border-black pb-0.5 flex items-center gap-1 mb-6 hover:text-gray-500 hover:border-gray-500 transition-colors"
        >
          Get Started <span className="text-[14px] leading-none font-bold">↗</span>
        </button>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-center leading-[1.1] tracking-tight px-4">
          Simulate the <span className="text-[#f03232]">Risk.</span> Keep the <span className="text-[#00a859]">Reward.</span>
        </h1>
      </main>

      {/* STOCKQUEST — SVG for true full-width stretch, anchored to bottom */}
      <div className="absolute bottom-0 left-0 w-full pointer-events-none select-none z-30">
        <svg
          viewBox="0 0 1000 180"
          preserveAspectRatio="none"
          className="w-full"
          style={{ display: 'block', height: '75vh' }}
        >
          <text
            x="0"
            y="160"
            fontFamily="'Arial Black', 'Arial', sans-serif"
            fontWeight="900"
            fontSize="185"
            letterSpacing="-5"
            fill="black"
            textLength="1000"
            lengthAdjust="spacingAndGlyphs"
          >
            STOCKQUEST
          </text>
        </svg>
      </div>

      {/* Candlesticks — rendered over STOCKQUEST */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {candles.map((c, i) => (
          <div
            key={i}
            className="absolute flex flex-col items-center"
            style={{ left: c.left, bottom: c.bottom }}
          >
            {/* Wick */}
            <div
              style={{
                width: '2px',
                height: `${c.wickH}px`,
                backgroundColor: c.green ? '#00a859' : '#f03232',
                position: 'absolute',
                bottom: 0,
              }}
            />
            {/* Body */}
            <div
              style={{
                width: `${c.w}px`,
                height: `${c.bodyH}px`,
                backgroundColor: c.green ? '#00a859' : '#f03232',
                position: 'relative',
                zIndex: 1,
              }}
            />
          </div>
        ))}
      </div>

      {/* Info Cards */}
      <div className="absolute bottom-8 left-8 md:left-16 bg-[#f03232] p-6 z-50 hidden lg:block shadow-2xl transform hover:-translate-y-2 transition-transform duration-300">
        <ul className="text-black font-black text-lg lg:text-xl space-y-1 uppercase tracking-tight">
          <li>MODE: SIMULATION</li>
          <li>CAPITAL: VIRTUAL</li>
          <li>RISK: 0.00%</li>
          <li>GOAL: LEVEL UP</li>
        </ul>
      </div>

      <div className="absolute top-[28%] right-8 md:right-16 bg-[#00a859] p-6 z-50 hidden lg:block shadow-2xl transform hover:-translate-y-2 transition-transform duration-300">
        <ul className="text-black font-black text-lg lg:text-xl space-y-1 uppercase tracking-tight">
          <li>MODE: LIVE MARKET</li>
          <li>ASSETS: REAL</li>
          <li>EXECUTION: INSTANT</li>
          <li>GOAL: PROFIT</li>
        </ul>
      </div>

    </div>
  );
};

export default Login;