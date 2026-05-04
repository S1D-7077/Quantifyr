import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { 
  ArrowLeft, 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Package, 
  MapPin, 
  RefreshCcw,
  Target
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface CampaignDetailsData {
  campaign: {
    id: number;
    name: string;
    platform: string;
    status: string;
    ad_spend: number;
  };
  skus: Array<{
    sku: string;
    order_count: number;
    revenue: number;
    net_profit: number;
  }>;
  regions: Array<{
    region: string;
    order_count: number;
    rto_count: number;
  }>;
  performanceOverTime: Array<{
    date: string;
    revenue: number;
    net_profit: number;
    roas: number;
  }>;
}

export default function CampaignDetails() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [data, setData] = useState<CampaignDetailsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/campaigns/${id}/details`, {
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

    if (token && id) fetchData();
  }, [token, id]);

  if (loading) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">Loading...</div>;
  if (!data) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">Campaign not found</div>;

  const { campaign, skus, regions, performanceOverTime } = data;
  
  const totalRevenue = skus.reduce((acc, s) => acc + s.revenue, 0);
  const totalProfit = skus.reduce((acc, s) => acc + s.net_profit, 0);
  const roas = campaign.ad_spend ? (totalRevenue / campaign.ad_spend).toFixed(2) : '0';
  
  const totalOrders = regions.reduce((acc, r) => acc + r.order_count, 0);
  const totalRto = regions.reduce((acc, r) => acc + r.rto_count, 0);
  const totalRtoLoss = regions.reduce((acc, r) => acc + (r as any).rto_loss, 0);
  const campaignRtoRate = totalOrders ? ((totalRto / totalOrders) * 100).toFixed(2) : '0.00';

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <Link to="/campaigns" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Campaigns
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={cn(
                "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                campaign.platform === 'Meta' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'
              )}>
                {campaign.platform}
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase">
                {campaign.status}
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">{campaign.name}</h2>
          </div>
          
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-zinc-500 mb-1 tracking-widest">Campaign RTO Rate</p>
            <div className="flex items-center gap-2 justify-end">
              <span className={cn(
                "text-3xl font-bold",
                parseFloat(campaignRtoRate) > 15 ? "text-red-400" : "text-emerald-400"
              )}>{campaignRtoRate}%</span>
              <RefreshCcw className={cn(
                "w-6 h-6",
                parseFloat(campaignRtoRate) > 15 ? "text-red-400" : "text-emerald-400"
              )} />
            </div>
            <p className="text-xs text-zinc-400 mt-1">Loss: {formatCurrency(totalRtoLoss)} across {totalRto} returns</p>
          </div>
        </div>

        {/* Aggregate Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Ad Spend" value={formatCurrency(campaign.ad_spend)} icon={<DollarSign className="w-5 h-5" />} />
          <StatCard title="Revenue" value={formatCurrency(totalRevenue)} icon={<ShoppingCart className="w-5 h-5" />} />
          <StatCard title="ROAS" value={`${roas}x`} icon={<Target className="w-5 h-5" />} />
          <StatCard title="Net Profit" value={formatCurrency(totalProfit)} icon={<TrendingUp className="w-5 h-5" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Chart */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-6">Revenue & Profit Timeline</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceOverTime}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="date" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
                  <Area type="monotone" dataKey="net_profit" name="Net Profit" stroke="#3b82f6" fill="transparent" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ROAS Chart */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-6">ROAS Trend</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="date" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}x`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="roas" 
                    name="ROAS"
                    stroke="#f59e0b" 
                    strokeWidth={4} 
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* RTO by Region */}
          <div className="lg:col-span-1 bg-zinc-900/40 border border-white/5 rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-6">RTO by Region</h3>
            <div className="space-y-4">
              {regions.map((region) => {
                const rtoRate = region.order_count ? ((region.rto_count / region.order_count) * 100).toFixed(1) : 0;
                return (
                  <div key={region.region} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-zinc-500" />
                        <span className="font-semibold">{region.region}</span>
                      </div>
                      <span className={cn(
                        "text-xs font-bold",
                        parseFloat(rtoRate as string) > 15 ? "text-red-400" : "text-emerald-400"
                      )}>{rtoRate}% RTO</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          parseFloat(rtoRate as string) > 15 ? "bg-red-500" : "bg-emerald-500"
                        )}
                        style={{ width: `${rtoRate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SKU Performance Table */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6">
          <h3 className="text-lg font-bold mb-6">SKU Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-zinc-500 text-[10px] uppercase tracking-widest border-b border-white/5">
                  <th className="pb-4 font-bold">SKU</th>
                  <th className="pb-4 font-bold text-right">Orders</th>
                  <th className="pb-4 font-bold text-right">Revenue</th>
                  <th className="pb-4 font-bold text-right">Net Profit</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {skus.map((sku) => (
                  <tr key={sku.sku} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 font-medium">{sku.sku}</td>
                    <td className="py-4 text-right">{sku.order_count}</td>
                    <td className="py-4 text-right">{formatCurrency(sku.revenue)}</td>
                    <td className="py-4 text-right">
                      <span className={cn(
                        "font-bold",
                        sku.net_profit > 0 ? "text-emerald-400" : "text-red-400"
                      )}>
                        {formatCurrency(sku.net_profit)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl hover:border-white/10 transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
          {icon}
        </div>
      </div>
      <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-2xl font-bold">{value}</h3>
    </div>
  );
}
