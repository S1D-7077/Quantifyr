import React from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Package, 
  Megaphone, 
  AlertCircle, 
  Settings, 
  LogOut,
  RefreshCcw,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-zinc-900/20 backdrop-blur-xl flex flex-col fixed h-full z-30">
        <div className="p-6">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-black" />
            </div>
            <span className="font-bold text-xl tracking-tight">Quantifyr</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <NavItem to="/dashboard" icon={<TrendingUp className="w-5 h-5" />} label="Dashboard" />
          <NavItem to="/intelligence" icon={<Sparkles className="w-5 h-5" />} label="Intelligence" />
          <NavItem to="/campaigns" icon={<Megaphone className="w-5 h-5" />} label="Campaigns" />
          <NavItem to="/orders" icon={<Package className="w-5 h-5" />} label="Orders" />
          <NavItem to="/rto" icon={<RefreshCcw className="w-5 h-5" />} label="RTO Analysis" />
          <NavItem to="/alerts" icon={<AlertCircle className="w-5 h-5" />} label="Alerts" />
        </nav>

        <div className="p-4 border-t border-white/5 space-y-1">
          <NavItem to="/settings" icon={<Settings className="w-5 h-5" />} label="Settings" />
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}

function NavItem({ icon, label, to }: { icon: React.ReactNode, label: string, to: string }) {
  return (
    <NavLink 
      to={to}
      className={({ isActive }) => cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all group",
        isActive ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-400 hover:text-white hover:bg-white/5"
      )}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </NavLink>
  );
}
