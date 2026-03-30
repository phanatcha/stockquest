import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ModeProvider } from './context/ModeContext';
import Login from './pages/Login';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Onboarding from './pages/Onboarding';
import AppLayout from './components/AppLayout';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Leaderboard from './pages/Leaderboard';
import Learn from './pages/Learn';
import StockDetail from './pages/StockDetail';

function App() {
  return (
    <Router>
      <ModeProvider>
        <div className="min-h-screen bg-[#111] text-white selection:bg-red-500/30 font-sans">
          <Routes>
            <Route path="/" element={<Login />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/onboarding" element={<Onboarding />} />
          
          {/* Core App Shell */}
          <Route element={<AppLayout />}>
             <Route path="/dashboard" element={<Dashboard />} />
             <Route path="/portfolio" element={<Portfolio />} />
             <Route path="/leaderboard" element={<Leaderboard />} />
             <Route path="/learn" element={<Learn />} />
             <Route path="/stock/:symbol" element={<StockDetail />} />
          </Route>

          <Route path="*" element={
            <div className="flex flex-col items-center justify-center h-screen w-full bg-[#111]">
              <h2 className="text-4xl font-black text-red-600 mb-2">404</h2>
              <p className="text-zinc-500 font-bold uppercase tracking-widest">Page Not Found</p>
            </div>
          } />
        </Routes>
      </div>
      </ModeProvider>
    </Router>
  );
}

export default App;