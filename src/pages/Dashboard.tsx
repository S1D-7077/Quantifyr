import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { 
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ShoppingCart,
  Percent,
  RefreshCcw,
  AlertCircle,
  Plus,
  ArrowRight,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency, cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

const chartData = [
  { name: 'Mon', profit: 4000, revenue: 12000 },
  { name: 'Tue', profit: 3000, revenue: 10000 },
  { name: 'Wed', profit: 5000, revenue: 15000 },
  { name: 'Thu', profit: 2780, revenue: 9000 },
  { name: 'Fri', profit: 1890, revenue: 8000 },
  { name: 'Sat', profit: 2390, revenue: 11000 },
  { name: 'Sun', profit: 3490, revenue: 13000 },
];

export default function Dashboard() {
  const { user, token } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [skus, setSkus] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, alertsRes, skusRes] = await Promise.all([
          fetch('/api/dashboard/summary', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/alerts', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/analysis/skus', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        const summaryData = await summaryRes.json();
        const alertsData = await alertsRes.json();
        const skusData = await skusRes.json();
        
        setSummary(summaryData);
        setAlerts(alertsData);
        setSkus(skusData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token]);

  const seedData = async () => {
    await fetch('/api/seed', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    window.location.reload();
  };

  if (loading) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">Loading...</div>;

  return (
    <DashboardLayout>
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.business_name}</h1>
          <p className="text-zinc-500 mt-1">Here's your business performance overview.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={seedData}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Seed Demo Data
          </button>
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold uppercase">
            {user?.business_name?.[0] || 'U'}
          </div>
        </div>
      </header>

      {/* AI Intelligence Teaser */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-1 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 rounded-[2rem]"
      >
        <Link 
          to="/intelligence"
          className="flex items-center justify-between p-6 bg-zinc-950/80 backdrop-blur-3xl rounded-[1.8rem] group border border-white/5"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Profit Intelligence is Ready</h3>
              <p className="text-zinc-500 text-sm">AI forecasted a <span className="text-emerald-400 font-bold">+18% profit lift</span> if you optimize North region ad-spend.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-zinc-400 group-hover:text-white transition-colors">
            <span className="text-xs font-bold uppercase tracking-widest">Get Insights</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Net Profit" 
          value={formatCurrency(summary?.net_profit || 0)} 
          change="+12.5%" 
          positive 
          icon={<DollarSign className="w-5 h-5" />}
        />
        <StatCard 
          title="Revenue" 
          value={formatCurrency(summary?.revenue || 0)} 
          change="+8.2%" 
          positive 
          icon={<ShoppingCart className="w-5 h-5" />}
        />
        <StatCard 
          title="Margin %" 
          value={`${summary?.margin || 0}%`} 
          change="-2.1%" 
          positive={false} 
          icon={<Percent className="w-5 h-5" />}
        />
        <StatCard 
          title="RTO Rate" 
          value={`${summary?.rto_rate || 0}%`} 
          change="+0.5%" 
          positive={false} 
          icon={<RefreshCcw className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-zinc-900/40 border border-white/5 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Profit & Revenue Trend</h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts Feed */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Critical Alerts</h2>
            <Link to="/alerts" className="text-xs text-emerald-400 font-bold hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {alerts.length > 0 ? alerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                <div className="flex items-start gap-3 mb-2">
                  <div className={cn(
                    "mt-1 w-2 h-2 rounded-full",
                    alert.severity === 'High' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-yellow-500'
                  )} />
                  <div>
                    <h3 className="text-sm font-bold">{alert.title}</h3>
                    <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed line-clamp-2">{alert.description}</p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 text-zinc-600">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>All systems operational</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SKU Performance Section */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Top Performing SKUs</h2>
          <Link to="/orders" className="text-xs text-emerald-400 font-bold hover:underline">Full Analytics</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-zinc-500 text-[10px] uppercase tracking-widest border-b border-white/5 font-bold">
                <th className="pb-4">SKU Name</th>
                <th className="pb-4 text-right">Orders</th>
                <th className="pb-4 text-right">Revenue</th>
                <th className="pb-4 text-right">Profit</th>
                <th className="pb-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {skus.slice(0, 5).map((sku) => (
                <tr key={sku.sku} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="py-4 font-bold">{sku.sku}</td>
                  <td className="py-4 text-right text-zinc-400">{sku.order_count}</td>
                  <td className="py-4 text-right">{formatCurrency(sku.revenue)}</td>
                  <td className="py-4 text-right text-emerald-400 font-bold">{formatCurrency(sku.net_profit)}</td>
                  <td className="py-4 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">Optimal</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, change, positive, icon }: { title: string, value: string, change: string, positive: boolean, icon: React.ReactNode }) {
  return (
    <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl hover:border-white/10 transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
          {icon}
        </div>
        <div className={cn(
          "flex items-center text-[10px] font-black tracking-tighter uppercase",
          positive ? "text-emerald-400" : "text-red-400"
        )}>
          {positive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
          {change}
        </div>
      </div>
      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-2xl font-black">{value}</h3>
    </div>
  );
}
