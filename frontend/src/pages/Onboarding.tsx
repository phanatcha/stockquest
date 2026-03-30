import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:3000'; // Assuming standard NestJS port

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [age, setAge] = useState<string>('');
  const [goal, setGoal] = useState<string>('');
  const [reactionDrop, setReactionDrop] = useState<string>('');
  const [horizon, setHorizon] = useState<string>('');
  const [riskTolerance, setRiskTolerance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Assuming user is already authenticated in a real app, we mock it or 
  // assume localStorage has a token. For UI demo we just proceed.
  const handleNext = () => {
    if (step === 0 && !age) return;
    if (step === 1 && !goal) return;
    if (step === 2 && !reactionDrop) return;
    if (step === 3 && !horizon) return;
    
    if (step === 3) {
      submitOnboarding();
    } else {
      setStep(step + 1);
    }
  };

  const submitOnboarding = async () => {
    setLoading(true);
    try {
      // In a real app we'd attach a Bearer token. Here we might just mock if backend is not reachable.
      const res = await fetch(`${API_BASE_URL}/users/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          age: parseInt(age, 10),
          goal,
          reactionDrop,
          horizon
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setRiskTolerance(data.riskTolerance);
        setStep(4); // Result step
      } else {
        // Fallback for UI demonstration (e.g. backend not fully set up locally)
        mockCalculateRisk();
      }
    } catch (e) {
      console.warn("Backend unavailable, using mock analysis:", e);
      mockCalculateRisk();
    } finally {
      setLoading(false);
    }
  };

  const mockCalculateRisk = () => {
    let score = 0;
    if (goal.includes('Aggressive')) score += 3;
    else if (goal.includes('Balanced')) score += 2;
    else score += 1;

    if (reactionDrop.includes('See it as a buying')) score += 3;
    else if (reactionDrop.includes('Wait and see')) score += 2;
    else score += 1;

    if (horizon.includes('More than 7')) score += 3;
    else if (horizon.includes('3 - 7')) score += 2;
    else score += 1;

    if (score >= 7) setRiskTolerance('Aggressive');
    else if (score >= 5) setRiskTolerance('Moderate');
    else setRiskTolerance('Conservative');
    
    setStep(4);
  };

  const questions = [
    {
      title: "When making an investment, what is your primary goal?",
      options: [
        "Protect my original investment (Capital Preservation)",
        "Grow my investment steadily over time (Balanced)",
        "Maximize returns, even if it means taking significant risks (Aggressive Growth)"
      ],
      state: goal,
      setter: setGoal
    },
    {
      title: "How would you react if your investment portfolio lost 15% of its value in a short period?",
      options: [
        "Sell everything immediately to prevent further losses",
        "Wait and see, maybe sell some if it gets worse",
        "See it as a buying opportunity and invest more"
      ],
      state: reactionDrop,
      setter: setReactionDrop
    },
    {
      title: "How long do you plan to keep your money invested before needing it?",
      options: [
        "Less than 3 years (Short-term)",
        "3 - 7 years (Medium-term)",
        "More than 7 years (Long-term)"
      ],
      state: horizon,
      setter: setHorizon
    }
  ];

  const getResultDetails = () => {
    if (riskTolerance === 'Conservative') {
      return {
        bg: 'from-[#2e1d18] to-[#1a1110]', // dark brownish
        titleColor: 'text-orange-400',
        text: "Your portfolio allocation focus on stability and capital preservation. It consists of lower-risk investments such as bonds and money market funds.",
        candlesticks: ['bg-red-500', 'bg-red-500', 'bg-red-500']
      };
    } else if (riskTolerance === 'Moderate') {
      return {
        bg: 'from-[#2c331f] to-[#151a0e]', // olive green/dark
        titleColor: 'text-green-400',
        text: "Your portfolio allocation balances growth and stability. It includes a mix of equities and fixed-income assets to achieve moderate growth while managing risk.",
        candlesticks: ['bg-red-500', 'bg-green-500', 'bg-red-500']
      };
    } else {
      return {
        bg: 'from-[#293616] to-[#121a08]', // dark green
        titleColor: 'text-green-500',
        text: "Your portfolio allocation prioritizes long-term growth. It consists predominantly of equities, capturing higher returns while accepting higher volatility.",
        candlesticks: ['bg-green-500', 'bg-green-500', 'bg-green-500']
      };
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-sans">
      {step === 0 && (
        <div className="bg-gradient-to-br from-[#c9a77c] via-[#dfbb8c] to-[#b18d60] rounded-2xl w-full max-w-lg p-10 shadow-2xl relative overflow-hidden text-zinc-900 flex flex-col items-center">
          <div className="absolute top-4 left-4 text-zinc-900 border border-zinc-900 rounded-full w-8 h-8 flex items-center justify-center font-bold">
            S
          </div>
          <div className="absolute top-4 right-4 text-sm font-semibold tracking-wider uppercase">
            Start your journey
          </div>
          
          <div className="mt-12 flex flex-col items-center justify-center w-full">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-6 shadow-lg">
              {/* Profile placeholder */}
              <svg className="w-8 h-8 text-[#dfbb8c]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-8 text-center">Welcome! How old are you?</h2>
            
            <input 
              type="number" 
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="bg-transparent border-b-2 border-zinc-900 w-full max-w-[200px] text-center text-4xl p-2 outline-none font-bold placeholder:text-zinc-600 focus:border-white transition-colors"
              placeholder="e.g. 25"
            />
            
            <button 
              onClick={handleNext}
              className="mt-12 bg-zinc-900 text-white px-8 py-3 rounded-md font-bold text-sm tracking-wider uppercase hover:bg-zinc-800 transition-colors shadow-lg"
            >
              Next Step
            </button>
          </div>
          <div className="absolute bottom-4 right-4 text-xs opacity-50 flex space-x-1">
            <div className="w-2 h-2 rounded-full bg-zinc-900"></div>
            <div className="w-2 h-2 rounded-full border border-zinc-900"></div>
            <div className="w-2 h-2 rounded-full border border-zinc-900"></div>
            <div className="w-2 h-2 rounded-full border border-zinc-900"></div>
          </div>
        </div>
      )}

      {step > 0 && step <= 3 && (
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl w-full max-w-2xl p-8 md:p-12 shadow-2xl relative">
          <div className="absolute top-4 left-4 text-zinc-400 font-bold border border-zinc-600 rounded-full w-8 h-8 flex items-center justify-center">
            S
          </div>
          <div className="flex flex-col items-center justify-center mt-6">
            <div className="flex space-x-2 mb-6">
              {[1, 2, 3].map((num) => (
                <div key={num} className={`w-3 h-12 rounded-sm ${step === num ? 'bg-red-500' : 'bg-red-900/40'}`}></div>
              ))}
            </div>
            
            <h3 className="text-zinc-500 font-bold uppercase tracking-widest text-sm mb-4">Question {step}</h3>
            <h2 className="text-2xl md:text-3xl text-white font-bold text-center mb-10 max-w-xl">
              {questions[step - 1].title}
            </h2>
            
            <div className="w-full space-y-4">
              {questions[step - 1].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => questions[step - 1].setter(option)}
                  className={`w-full p-4 rounded-xl text-left border transition-all duration-200 flex items-center space-x-4
                    ${questions[step - 1].state === option 
                      ? 'border-zinc-300 bg-zinc-800 text-white' 
                      : 'border-zinc-800 bg-[#161616] text-zinc-400 hover:border-zinc-600'}`
                  }
                >
                   <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center
                     ${questions[step - 1].state === option ? 'border-zinc-300' : 'border-zinc-600'}`}>
                     {questions[step - 1].state === option && <div className="w-2.5 h-2.5 bg-zinc-300 rounded-full"></div>}
                   </div>
                   <span className="font-medium text-sm md:text-base">{option}</span>
                </button>
              ))}
            </div>
            
            <button 
              onClick={handleNext}
              disabled={loading || !questions[step - 1].state}
              className="mt-10 bg-zinc-200 text-zinc-900 disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 px-8 py-3 rounded-md font-bold text-sm tracking-wider uppercase hover:bg-white transition-colors"
            >
              {loading ? 'Processing...' : step === 3 ? 'See Results' : 'Next Question'}
            </button>
          </div>
        </div>
      )}

      {step === 4 && riskTolerance && (
        <div className={`bg-gradient-to-br ${getResultDetails().bg} rounded-2xl w-full max-w-2xl p-10 md:p-14 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 relative flex flex-col items-center text-center`}>
          <div className="absolute top-4 left-4 text-white/50 border border-white/20 rounded-full w-8 h-8 flex items-center justify-center font-bold">
            S
          </div>
          
          <h3 className="text-white/60 font-bold uppercase tracking-widest text-sm mb-12 mt-4">Analysis Result</h3>
          
          <div className="flex space-x-4 h-24 mb-10 items-end">
            {getResultDetails().candlesticks.map((bg, i) => (
              <div key={i} className="flex flex-col items-center justify-center h-full">
                <div className={`w-0.5 h-full ${bg.replace('bg-', 'bg-')}/50`}></div>
                <div className={`w-3 h-12 ${bg} absolute rounded-sm shadow-[0_0_10px_${bg.replace('bg-', '')}]`}></div>
              </div>
            ))}
          </div>

          <h2 className="text-3xl md:text-4xl text-white font-bold mb-6">
            Based on your answers, your risk tolerance is: <br/>
            <span className={getResultDetails().titleColor}>{riskTolerance}</span>
          </h2>
          
          <p className="text-white/70 text-lg md:text-xl leading-relaxed max-w-lg mb-12">
            {getResultDetails().text}
          </p>
          
          <button 
            onClick={() => navigate('/dashboard')}
            className={`px-8 py-3 rounded-md font-bold text-sm tracking-wider uppercase transition-all shadow-lg text-black bg-white hover:bg-zinc-200`}
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
