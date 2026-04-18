import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import sirBullImg from '../assets/sirbull.png';
import sirMadamImg from '../assets/sirmadam.png';
import unionIcon from '../assets/Union.png';

const SignUp = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [honorific, setHonorific] = useState<'Sir' | 'Madam'>('Sir');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // using username as name to satisfy the backend dto
        body: JSON.stringify({ email, username, name: `${honorific} ${username}`, password, role: 'USER' }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Error occurred during registration');
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
      <div className="relative w-full max-w-[800px] px-4">
        {/* The Card */}
        <div className="w-full h-auto sm:h-[480px] bg-gradient-to-br from-[#ae8172] to-[#8d6153] rounded-3xl p-8 sm:p-12 shadow-[0_20px_60px_-15px_rgba(150,80,60,0.4)] relative overflow-hidden flex flex-col transition-all">
          
          {/* Faded Watermarks */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-[0.03] pointer-events-none flex flex-wrap gap-4 p-4 content-start overflow-hidden">
             {Array(15).fill(0).map((_, i) => (
                <svg key={i} viewBox="0 0 100 100" className="w-16 h-16 fill-black">
                   <path d="M82,20 C85,30 85,45 78,55 C80,60 85,65 85,73 C85,82 78,90 65,90 C55,90 45,95 35,95 C25,95 15,85 15,70 C15,60 18,50 25,45 C20,40 18,30 20,20 C30,22 40,30 45,35 C55,30 65,30 70,25 C75,22 78,20 82,20 Z" />
                </svg>
             ))}
          </div>

          {/* Header of Card */}
          <div className="flex justify-between items-start z-10 w-full mb-10">
            <div className="flex items-center gap-3">
              <img src={unionIcon} alt="Icon" className="w-10 h-10 object-contain opacity-80" />
              <h1 className="text-2xl sm:text-3xl font-black text-[#432319] tracking-wider uppercase">Sign Up</h1>
            </div>
            <div className="text-[#432319] font-bold text-lg tracking-wide hidden sm:block">
              StockQuest ID Card
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start flex-grow z-10 w-full mb-6">
            {/* Avatar & Switch Column */}
            <div className="flex flex-col items-center mr-0 sm:mr-12 mb-8 sm:mb-0 relative sm:top-4">
              <div className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 mb-6 relative">
                <img 
                  src={honorific === 'Sir' ? sirBullImg : sirMadamImg} 
                  alt={`${honorific} Avatar`} 
                  className="w-full h-full object-contain drop-shadow-xl"
                />
              </div>
              
              {/* Honorific Switch */}
              <div className="flex bg-[#6c4333] rounded-full p-1 shadow-inner relative w-full max-w-[140px]">
                <div 
                  className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#432319] rounded-full transition-transform duration-300 ease-in-out ${honorific === 'Madam' ? 'translate-x-[calc(100%+8px)]' : 'translate-x-0'}`}
                ></div>
                <button 
                   type="button"
                   onClick={() => setHonorific('Sir')}
                   className={`flex-1 relative z-10 text-[10px] font-bold uppercase tracking-wider py-1.5 transition-colors ${honorific === 'Sir' ? 'text-white' : 'text-[#a17a6a]'}`}
                >
                  Sir
                </button>
                <button 
                   type="button"
                   onClick={() => setHonorific('Madam')}
                   className={`flex-1 relative z-10 text-[10px] font-bold uppercase tracking-wider py-1.5 transition-colors ${honorific === 'Madam' ? 'text-white' : 'text-[#a17a6a]'}`}
                >
                  Madam
                </button>
              </div>
            </div>

            {/* Inputs Form */}
            <form id="registerForm" onSubmit={handleSubmit} className="flex-grow flex flex-col gap-6 w-full max-w-[400px]">
              
              <div className="flex flex-col sm:flex-row sm:items-end border-b-2 border-[#513025]/40 pb-1 w-full relative">
                 <label className="text-sm font-bold text-[#432319] mb-1 sm:mb-0 sm:mr-4 shrink-0 sm:w-32">Username</label>
                 <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required
                   className="bg-transparent outline-none text-[#31170d] font-bold border-none w-full placeholder:text-[#513025]/40" />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end border-b-2 border-[#513025]/40 pb-1 w-full relative">
                 <label className="text-sm font-bold text-[#432319] mb-1 sm:mb-0 sm:mr-4 shrink-0 sm:w-32">Email</label>
                 <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                   className="bg-transparent outline-none text-[#31170d] font-bold border-none w-full placeholder:text-[#513025]/40" />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end border-b-2 border-[#513025]/40 pb-1 w-full relative">
                 <label className="text-sm font-bold text-[#432319] mb-1 sm:mb-0 sm:mr-4 shrink-0 sm:w-32">Password</label>
                 <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                   className="bg-transparent outline-none text-[#31170d] font-bold border-none w-full placeholder:text-[#513025]/40" />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end border-b-2 border-[#513025]/40 pb-1 w-full relative">
                 <label className="text-sm font-bold text-[#432319] mb-1 sm:mb-0 sm:mr-4 shrink-0 sm:w-32">Confirm Password</label>
                 <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6}
                   className="bg-transparent outline-none text-[#31170d] font-bold border-none w-full placeholder:text-[#513025]/40" />
              </div>
              
              {error && <p className="text-red-900 bg-red-200/50 p-2 rounded font-bold text-xs">{error}</p>}
            </form>
          </div>

          <div className="absolute bottom-6 sm:bottom-8 right-6 sm:right-8 w-12 h-12 bg-[#6c4333] rounded-full flex items-center justify-center shadow-lg hover:bg-[#513025] transition-colors">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#ae8172]">
               <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
            </svg>
          </div>
        </div>

        {/* Action Buttons Below Card */}
        <div className="flex flex-col items-center mt-10 gap-4 z-20 relative">
          <button 
            type="submit" 
            form="registerForm"
            disabled={loading}
            className="bg-[#6c4333] font-bold text-white px-12 py-3 rounded text-sm tracking-wider shadow-lg hover:bg-[#513025] border border-[#ae8172]/30 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Create Account'}
          </button>
          
          <p className="text-xs text-gray-500 font-medium">We never share your data</p>

          <p className="text-sm text-gray-400 mt-2">
            Already have an account? <button onClick={() => navigate('/signin')} className="text-white hover:underline transition-all">Login now</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
