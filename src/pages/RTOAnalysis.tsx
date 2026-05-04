import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { 
  RefreshCcw, 
  MapPin, 
  Package, 
  TrendingDown, 
  AlertTriangle,
  Info,
  Lock,
  Unlock
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell 
} from 'recharts';

interface RTOData {
  regions: Array<{
    region: string;
    total_orders: number;
    rto_count: number;
    rto_loss: number;
    revenue: number;
  }>;
  pincodes: Array<{
    pincode: string;
    region: string;
    total_orders: number;
    rto_count: number;
    rto_loss: number;
  }>;
  skus: Array<{
    sku: string;
    total_orders: number;
    rto_count: number;
    rto_loss: number;
  }>;
  blockedPincodes: Array<{
    id: number;
    pincode: string;
    reason: string;
  }>;
  blockedSkus: Array<{
    id: number;
    sku: string;
    reason: string;
  }>;
}

export default function RTOAnalysis() {
  const { token } = useAuth();
  const [data, setData] = useState<RTOData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/analysis/rto', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const toggleBlockPincode = async (pincode: string, isBlocked: boolean) => {
    try {
      const endpoint = isBlocked ? '/api/pincodes/unblock' : '/api/pincodes/block';
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ pincode })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleBlockSku = async (sku: string, isBlocked: boolean) => {
    try {
      const endpoint = isBlocked ? '/api/skus/unblock' : '/api/skus/block';
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ sku })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">Loading...</div>;

  const isEmpty = !data?.regions || data.regions.length === 0;

  const seedData = async () => {
    try {
      setLoading(true);
      await fetch('/api/seed', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      window.location.reload();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (isEmpty) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
          <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10">
            <RefreshCcw className="w-10 h-10 text-zinc-500" />
          </div>
          <div className="max-w-md">
            <h2 className="text-2xl font-bold mb-2">No RTO Data Found</h2>
            <p className="text-zinc-500 mb-6">Generate synthetic intelligence data to visualize return trends, regional analysis, and AI-driven insights.</p>
            <button 
              onClick={seedData}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-colors inline-flex items-center gap-2"
            >
              <RefreshCcw className="w-5 h-5" />
              Generate Demo Data
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const totalRtoCount = (data?.regions || []).reduce((acc, r) => acc + r.rto_count, 0) || 0;
  const totalOrders = (data?.regions || []).reduce((acc, r) => acc + r.total_orders, 0) || 1;
  const totalRtoLoss = (data?.regions || []).reduce((acc, r) => acc + r.rto_loss, 0) || 0;
  const overallRtoRate = ((totalRtoCount / totalOrders) * 100).toFixed(1);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">RTO Analysis</h2>
          <p className="text-zinc-500 mt-1">Deep dive into operational losses and return trends.</p>
        </div>

        {/* High Level Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Overall RTO Rate" 
            value={`${overallRtoRate}%`} 
            icon={<RefreshCcw className="w-5 h-5 text-emerald-400" />}
            description="Total percentage of returned orders"
          />
          <StatCard 
            title="Total RTO Loss" 
            value={formatCurrency(totalRtoLoss)} 
            icon={<TrendingDown className="w-5 h-5 text-red-400" />}
            description="Cumulative cost of returns (Shipping + RTO charges)"
          />
          <StatCard 
            title="RTO Orders" 
            value={totalRtoCount.toString()} 
            icon={<Package className="w-5 h-5 text-blue-400" />}
            description="Number of orders marked as RTO"
          />
        </div>

        {/* Suggestion Box */}
        {parseFloat(overallRtoRate) > 10 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl flex gap-4 items-start"
          >
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <Info className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-emerald-400">Profitability Insight</h3>
              <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
                Your RTO rate is above 10%. We recommend disabling Cash on Delivery (COD) for the top 2 highest RTO regions identified below to save an estimated <span className="text-white font-bold">{formatCurrency(totalRtoLoss * 0.3)}</span> per month.
              </p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Regional Trends */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-6">RTO Rate by Region</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.regions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="region" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${((v/totalOrders)*100).toFixed(0)}%`} hide />
                  <Tooltip 
                    cursor={{fill: '#ffffff05'}}
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="rto_count" radius={[6, 6, 0, 0]}>
                    {(data?.regions || []).map((entry, index) => {
                      const rate = (entry.rto_count / entry.total_orders) * 100;
                      return <Cell key={`cell-${index}`} fill={rate > 15 ? '#ef4444' : '#10b981'} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* New Pincode Watchlist */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">High Risk Pincodes</h3>
              <div className="px-2 py-1 bg-red-500/10 text-red-400 text-[10px] font-bold uppercase rounded border border-red-500/20">
                Action Required
              </div>
            </div>
            <div className="space-y-4">
              {(data?.pincodes || []).slice(0, 5).map((pin) => {
                const rate = (pin.rto_count / pin.total_orders) * 100;
                const isBlocked = data?.blockedPincodes?.some(b => b.pincode === pin.pincode) || false;
                
                return (
                  <div key={pin.pincode} className={cn("flex items-center justify-between p-4 rounded-2xl border transition-colors", isBlocked ? "bg-red-500/5 border-red-500/20" : "bg-white/5 border-white/5")}>
                    <div className="flex items-center gap-3">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", isBlocked ? "bg-red-500/10 text-red-400" : "bg-zinc-800 text-zinc-400")}>
                        {isBlocked ? <Lock className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold flex items-center gap-2">
                          {pin.pincode}
                          {isBlocked && <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">COD BLOCKED</span>}
                        </span>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{pin.region}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm font-bold text-red-400">{rate.toFixed(1)}% RTO</div>
                        <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{pin.rto_count} Returns</div>
                      </div>
                      <button 
                        onClick={() => toggleBlockPincode(pin.pincode, isBlocked)}
                        className={cn("px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all", isBlocked ? "bg-white/5 hover:bg-white/10 text-white" : "bg-red-500/10 hover:bg-red-500/20 text-red-400")}
                      >
                        {isBlocked ? 'Unlock' : 'Block COD'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SKU Impact */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 overflow-hidden">
            <h3 className="text-lg font-bold mb-6">SKU RTO Impact</h3>
            <div className="space-y-4">
              {(data?.skus || []).slice(0, 5).map((sku) => {
                const rate = (sku.rto_count / sku.total_orders) * 100;
                const isBlocked = data?.blockedSkus?.some(b => b.sku === sku.sku) || false;

                return (
                  <div key={sku.sku} className={cn("flex items-center justify-between p-4 rounded-2xl border transition-colors", isBlocked ? "bg-red-500/5 border-red-500/20" : "bg-white/5 border-white/5")}>
                    <div className="flex flex-col">
                        <span className="font-bold flex items-center gap-2">
                          {sku.sku}
                          {isBlocked && <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">COD BLOCKED</span>}
                        </span>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{sku.total_orders} Total Orders</span>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className={cn(
                          "text-sm font-bold",
                          rate > 15 ? "text-red-400" : "text-emerald-400"
                        )}>{rate.toFixed(1)}% RTO</div>
                        <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Loss: {formatCurrency(sku.rto_loss)}</div>
                      </div>
                      <button 
                        onClick={() => toggleBlockSku(sku.sku, isBlocked)}
                        className={cn("px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all", isBlocked ? "bg-white/5 hover:bg-white/10 text-white" : "bg-red-500/10 hover:bg-red-500/20 text-red-400")}
                      >
                        {isBlocked ? 'Unlock' : 'Block COD'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detailed Regional Table */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6">
          <h3 className="text-lg font-bold mb-6">Regional Performance Table</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-zinc-500 text-[10px] uppercase tracking-widest border-b border-white/5 font-bold">
                  <th className="pb-4">Region</th>
                  <th className="pb-4 text-right">Orders</th>
                  <th className="pb-4 text-right">RTO Count</th>
                  <th className="pb-4 text-right">RTO Risk</th>
                  <th className="pb-4 text-right">Revenue Loss</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {(data?.regions || []).map((region) => {
                  const rate = (region.rto_count / region.total_orders) * 100;
                  return (
                    <tr key={region.region} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 font-medium">{region.region}</td>
                      <td className="py-4 text-right">{region.total_orders}</td>
                      <td className="py-4 text-right text-zinc-400">{region.rto_count}</td>
                      <td className="py-4 text-right">
                        <span className={cn(
                          "font-bold",
                          rate > 15 ? "text-red-400" : "text-emerald-400"
                        )}>{rate.toFixed(1)}%</span>
                      </td>
                      <td className="py-4 text-right text-red-400 font-bold">{formatCurrency(region.rto_loss)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon, description }: { title: string, value: string, icon: React.ReactNode, description: string }) {
  return (
    <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl transition-all">
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-2xl font-bold mb-1">{value}</h3>
      <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-tight">{description}</p>
    </div>
  );
}
