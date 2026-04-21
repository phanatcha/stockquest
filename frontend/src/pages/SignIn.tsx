import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiBase } from '../config/api';
import sirBullImg from '../assets/sirbull.svg';
import unionIcon from '../assets/Union.svg';

const SignIn = () => {
  const navigate = useNavigate();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'LOGIN' | '2FA'>('LOGIN');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${getApiBase()}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail, password }),
      });

      if (!res.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await res.json();
      // Store token temporarily and move to 2FA step
      setTempToken(data.access_token);
      setStep('2FA');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulate 2FA verification with the backend
      await new Promise(resolve => setTimeout(resolve, 800));

      if (twoFactorCode.length < 6) {
        throw new Error('Invalid 2FA code. Please enter 6 digits.');
      }

      // Success completely authenticates the user
      localStorage.setItem('token', tempToken);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111] flex flex-col items-center justify-center font-sans text-white">
      {/* Background Graphic elements if any are needed, but it's mostly plain black */}

      <div className="relative">
        {/* The Card */}
        <div className="w-full max-w-[700px] h-auto sm:h-[420px] bg-gradient-to-br from-[#dfbd8e] to-[#c79155] rounded-3xl p-8 sm:p-12 shadow-[0_20px_60px_-15px_rgba(200,120,40,0.3)] relative overflow-hidden flex flex-col">
          
          {/* Faded Watermarks (mocking the repeated faded logos on the right) */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-[0.03] pointer-events-none flex flex-wrap gap-4 p-4 content-start overflow-hidden">
             {Array(15).fill(0).map((_, i) => (
                <svg key={i} viewBox="0 0 100 100" className="w-16 h-16 fill-black">
                  <path d="M82,20 C85,30 85,45 78,55 C80,60 85,65 85,73 C85,82 78,90 65,90 C55,90 45,95 35,95 C25,95 15,85 15,70 C15,60 18,50 25,45 C20,40 18,30 20,20 C30,22 40,30 45,35 C55,30 65,30 70,25 C75,22 78,20 82,20 Z" />
                </svg>
             ))}
          </div>

          {/* Header of Card */}
          <div className="flex justify-between items-start z-10 w-full mb-12 sm:mb-20">
            <div className="flex items-center gap-3">
              <img src={unionIcon} alt="Icon" className="w-10 h-10 object-contain opacity-80" />
              <h1 className="text-2xl sm:text-3xl font-black text-[#a3692a] tracking-wider uppercase">
                 {step === 'LOGIN' ? 'Sign In' : '2FA Verify'}
              </h1>
            </div>
            <div className="text-[#a3692a] font-bold text-lg tracking-wide hidden sm:block">
              StockQuest ID Card
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-end flex-grow z-10 w-full mb-8 sm:mb-0">
            {/* Avatar / Portrait */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 mb-8 sm:mb-8 sm:mr-10 relative left-0 sm:left-4">
              <img 
                src={sirBullImg} 
                alt="Sir Bull Avatar" 
                className="w-full h-full object-contain drop-shadow-xl"
              />
            </div>

            {/* Inputs */}
            {step === 'LOGIN' ? (
              <form id="loginForm" onSubmit={handleSubmit} className="flex-grow flex flex-col gap-6 w-full max-w-[360px]">
                
                <div className="flex flex-col sm:flex-row sm:items-end border-b-2 border-[#a3692a]/50 pb-1 w-full relative">
                   <label className="text-sm font-bold text-[#8a5520] mb-1 sm:mb-0 sm:mr-4 shrink-0">Email/Username</label>
                   <input 
                     type="text" 
                     value={usernameOrEmail}
                     onChange={(e) => setUsernameOrEmail(e.target.value)}
                     className="bg-transparent outline-none text-[#5c3713] font-bold border-none w-full placeholder:text-[#a3692a]/50" 
                     required
                   />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-end border-b-2 border-[#a3692a]/50 pb-1 w-full relative">
                   <label className="text-sm font-bold text-[#8a5520] mb-1 sm:mb-0 sm:mr-4 shrink-0">Password</label>
                   <input 
                     type="password" 
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="bg-transparent outline-none text-[#5c3713] font-bold border-none w-full placeholder:text-[#a3692a]/50" 
                     required
                   />
                </div>
                
                {error && <p className="text-red-700 font-bold text-xs">{error}</p>}
              </form>
            ) : (
              <form id="2faForm" onSubmit={handle2FASubmit} className="flex-grow flex flex-col gap-6 w-full max-w-[360px]">
                
                <div className="text-[#8a5520] font-medium text-sm mb-2">
                  Enter the 6-digit authentication code from your authenticator app to continue.
                </div>

                <div className="flex flex-col sm:flex-row sm:items-end border-b-2 border-[#a3692a]/50 pb-1 w-full relative">
                   <label className="text-sm font-bold text-[#8a5520] mb-1 sm:mb-0 sm:mr-4 shrink-0">Code</label>
                   <input 
                     type="text" 
                     maxLength={6}
                     value={twoFactorCode}
                     onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                     className="bg-transparent outline-none text-[#5c3713] font-black tracking-[0.5em] text-xl border-none w-full placeholder:text-[#a3692a]/30" 
                     placeholder="000000"
                     required
                   />
                </div>
                
                {error && <p className="text-red-700 font-bold text-xs">{error}</p>}
              </form>
            )}
          </div>

          <button className="absolute bottom-6 sm:bottom-8 right-6 sm:right-8 w-14 h-14 bg-[#d68a2d] rounded-full flex items-center justify-center shadow-lg font-black text-2xl text-[#f3caa1] hover:bg-[#b57323] transition-colors">
            ?
          </button>
        </div>

        {/* Action Buttons Below Card */}
        <div className="flex flex-col items-center mt-12 gap-5 z-20 relative">
          <button 
            type="submit" 
            form={step === 'LOGIN' ? "loginForm" : "2faForm"}
            disabled={loading}
            className="bg-[#d68a2d] font-black text-white px-10 py-3 rounded text-sm uppercase tracking-widest shadow-lg hover:bg-[#b57323] transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : (step === 'LOGIN' ? 'Log In' : 'Verify & Enter')}
          </button>
          
          <button className="text-sm text-gray-400 border-b border-gray-600 pb-0.5 hover:text-white transition-colors">
            Forget Password?
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
