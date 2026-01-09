import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Shield, Activity, Lock, LayoutDashboard, FileText } from 'lucide-react';
import clsx from 'clsx';
import LandingPage from './pages/LandingPage';
import EntityDashboard from './pages/EntityDashboard';
import IntelligenceHub from './pages/IntelligenceHub';
import AdminDashboard from './pages/AdminDashboard';
import CriticalAlertModal from './components/CriticalAlertModal';
import socket from './services/socket';
import { useState, useEffect } from 'react';

function NavLink({ to, icon: Icon, label }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={clsx(
        "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300",
        isActive
          ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 shadow-[0_0_15px_rgba(0,243,255,0.2)]"
          : "text-gray-400 hover:text-white hover:bg-white/5"
      )}
    >
      <Icon size={18} />
      <span className="font-medium">{label}</span>
    </Link>
  );
}

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      {/* Top Navigation */}
      <header className="fixed top-0 w-full z-50 glass-panel border-b-0 border-white/10 h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="FinIntel Logo" className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]" />
          <span className="text-xl font-bold tracking-wider font-mono">
            Fin<span className="text-neon-cyan">Intel</span>
          </span>
        </div>

        <nav className="flex items-center gap-2">
          <NavLink to="/" icon={LayoutDashboard} label="Overview" />
          <NavLink to="/bank-a" icon={Activity} label="Bank A Node" />
          <NavLink to="/bank-b" icon={Activity} label="Bank B Node" />
          <NavLink to="/intelligence" icon={Lock} label="Intel Hub" />
          <NavLink to="/admin" icon={FileText} label="Compliance" />
        </nav>

        <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            SYSTEM ONLINE
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-20 px-6 pb-6 container mx-auto max-w-[1600px]">
        {children}
      </main>
    </div>
  );
}

function App() {
  const [criticalAlert, setCriticalAlert] = useState(null);

  useEffect(() => {
    socket.on('critical-stop', (data) => {
      setCriticalAlert(data);
    });

    return () => {
      socket.off('critical-stop');
    };
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/bank-a" element={<EntityDashboard entityName="Bank A" entityId="BANK_A" color="cyan" />} />
          <Route path="/bank-b" element={<EntityDashboard entityName="Bank B" entityId="BANK_B" color="amber" />} />
          <Route path="/intelligence" element={<IntelligenceHub />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
        <CriticalAlertModal alert={criticalAlert} onClose={() => setCriticalAlert(null)} />
      </Layout>
    </Router>
  );
}

export default App;
