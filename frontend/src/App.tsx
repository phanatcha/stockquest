import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Onboarding from './pages/Onboarding';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-zinc-900 text-white selection:bg-cyan-500/30">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="*" element={
            <div className="flex items-center justify-center h-screen w-full">
              <h2 className="text-2xl font-bold">404 | Page Not Found</h2>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;