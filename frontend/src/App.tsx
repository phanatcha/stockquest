// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-zinc-900 text-white selection:bg-cyan-500/30">
        <Routes>
          <Route path="/" element={<Home />} />
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