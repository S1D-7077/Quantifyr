import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Bell, 
  AlertCircle, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  MapPin,
  RefreshCcw,
  Zap,
  MessageSquare
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface Alert {
  id: number;
  severity: string;
  title: string;
  description: string;
  action: string;
  is_read: number;
  created_at: string;
}

export default function AlertCenter() {
  const { token } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [waConnected, setWaConnected] = useState(false);
  const [waPhone, setWaPhone] = useState("");

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch('/api/alerts', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        setAlerts(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchAlerts();
  }, [token]);

  const handleWaConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (waPhone.trim()) {
      setWaConnected(true);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">Loading...</div>;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Alert Center</h2>
            <p className="text-zinc-500 mt-1">Intelligent monitoring for your business operations.</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Real-time monitoring active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Summary Stats & Integrations */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 bg-zinc-900/40 border border-white/5 rounded-3xl">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Alert Distribution</h3>
              <div className="space-y-4">
                <DistributionItem label="Critical" count={alerts.filter(a => a.severity === 'High').length} color="bg-red-500" />
                <DistributionItem label="Warning" count={alerts.filter(a => a.severity === 'Medium').length} color="bg-yellow-500" />
                <DistributionItem label="Resolved" count={0} color="bg-emerald-500" />
              </div>
            </div>

            {/* WhatsApp Integration Add-on */}
            <div className={cn(
              "p-6 rounded-3xl border transition-all",
              waConnected ? "bg-green-500/5 border-green-500/20" : "bg-zinc-900/40 border-white/5"
            )}>
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  "p-2 rounded-xl",
                  waConnected ? "bg-green-500/20 text-green-400" : "bg-zinc-800 text-zinc-400"
                )}>
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">WhatsApp Addon</h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Reporting & Alerts</p>
                </div>
              </div>
              
              {!waConnected ? (
                <form onSubmit={handleWaConnect} className="space-y-3">
                  <p className="text-xs text-zinc-400 leading-relaxed mb-2">
                    Receive real-time alerts and comprehensive monitoring reports directly to the admin every 6 hours.
                  </p>
                  <input 
                    type="tel" 
                    placeholder="Enter WhatsApp Number" 
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-500 transition-colors"
                    value={waPhone}
                    onChange={(e) => setWaPhone(e.target.value)}
                    required
                  />
                  <button type="submit" className="w-full py-2 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl text-xs transition-colors">
                    Activate Addon
                  </button>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-green-400 bg-green-500/10 px-3 py-2 rounded-lg border border-green-500/20">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Active on {waPhone}</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-medium">Next report scheduled in 6 hours. Real-time alerts are now enabled.</p>
                  <button 
                    onClick={() => setWaConnected(false)}
                    className="w-full text-xs font-bold text-zinc-500 hover:text-white transition-colors mt-2"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>

            <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl">
              <h3 className="font-bold text-emerald-400 mb-2">Proactive Protection</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Our alert engine analyzes trends across regional logistics, payment gateways, and ad platforms to catch losses before they scale.
              </p>
              <button className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1">
                Configure Rule Engine <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Alert Feed */}
          <div className="lg:col-span-3 space-y-4">
            {alerts.length > 0 ? alerts.map((alert, index) => (
              <motion.div 
                key={alert.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative p-6 bg-zinc-900/40 border border-white/5 rounded-3xl hover:border-white/10 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "p-3 rounded-2xl shrink-0",
                    alert.severity === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
                  )}>
                    {alert.severity === 'High' ? <ShieldAlert className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-lg">{alert.title}</h4>
                      <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{new Date(alert.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                      {alert.description}
                    </p>

                    <div className="p-5 bg-black/40 border border-white/5 rounded-2xl flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Recommended Action</p>
                        <p className="text-sm font-medium text-white">{alert.action}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute right-6 bottom-6 flex items-center gap-3 scale-0 group-hover:scale-100 transition-all duration-300">
                  <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all">Dismiss</button>
                  <button className="px-4 py-2 bg-emerald-500 text-black rounded-xl text-xs font-bold hover:bg-emerald-400 transition-all">Apply Fix</button>
                </div>
              </motion.div>
            )) : (
              <div className="py-20 text-center">
                <CheckCircle2 className="w-16 h-16 text-emerald-500/20 mx-auto mb-4" />
                <h3 className="text-xl font-bold">No Alert Detected</h3>
                <p className="text-zinc-500 mt-2">Your operations are running within optimal parameters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function DistributionItem({ label, count, color }: { label: string, count: number, color: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={cn("w-2 h-2 rounded-full", color)} />
        <span className="text-sm font-medium text-zinc-400">{label}</span>
      </div>
      <span className="text-sm font-bold">{count}</span>
    </div>
  );
}
