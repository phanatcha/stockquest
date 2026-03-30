import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
  const navigate = useNavigate();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail, password }),
      });

      if (!res.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      navigate('/onboarding');
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
              <svg viewBox="0 0 100 100" className="w-10 h-10 fill-[#a3692a] opacity-80">
                <path d="M82,20 C85,30 85,45 78,55 C80,60 85,65 85,73 C85,82 78,90 65,90 C55,90 45,95 35,95 C25,95 15,85 15,70 C15,60 18,50 25,45 C20,40 18,30 20,20 C30,22 40,30 45,35 C55,30 65,30 70,25 C75,22 78,20 82,20 Z" />
                <text x="50" y="55" fontFamily="Arial" fontWeight="bold" fontSize="30" fill="#dfbd8e" textAnchor="middle">$</text>
              </svg>
              <h1 className="text-2xl sm:text-3xl font-black text-[#a3692a] tracking-wider uppercase">Sign In</h1>
            </div>
            <div className="text-[#a3692a] font-bold text-lg tracking-wide hidden sm:block">
              StockQuest ID Card
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-end flex-grow z-10 w-full mb-8 sm:mb-0">
            {/* Avatar / Portrait */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 mb-8 sm:mb-8 sm:mr-10 relative left-0 sm:left-4">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M30 40 Q25 50 30 70 Q45 80 65 75 Q75 60 70 40 Q50 35 30 40 Z" fill="#4a2a18"/>
                <path d="M25 35 L30 15 M35 30 L45 10 M50 25 L65 10 M65 25 L80 15 M70 35 L85 25" stroke="#4a2a18" strokeWidth="4" strokeLinecap="round"/>
                <path d="M35 55 L45 58 L55 55" fill="none" stroke="#2a1810" strokeWidth="2" strokeLinecap="round"/>
                <path d="M30 45 L50 48 L45 55 Z M55 46 L75 42 L65 52 Z" fill="#3b4dff"/> {/* Blue glasses */}
                <rect x="58" y="65" width="12" height="6" rx="2" fill="#d9bba0" transform="rotate(-15 58 65)"/> {/* Bandage */}
              </svg>
            </div>

            {/* Inputs */}
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
          </div>

          <button className="absolute bottom-6 sm:bottom-8 right-6 sm:right-8 w-14 h-14 bg-[#d68a2d] rounded-full flex items-center justify-center shadow-lg font-black text-2xl text-[#f3caa1] hover:bg-[#b57323] transition-colors">
            ?
          </button>
        </div>

        {/* Action Buttons Below Card */}
        <div className="flex flex-col items-center mt-12 gap-5 z-20 relative">
          <button 
            type="submit" 
            form="loginForm"
            disabled={loading}
            className="bg-[#d68a2d] font-black text-white px-10 py-3 rounded text-sm uppercase tracking-widest shadow-lg hover:bg-[#b57323] transition-all disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log In'}
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
