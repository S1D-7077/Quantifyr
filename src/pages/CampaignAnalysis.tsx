import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Percent, 
  RefreshCcw, 
  ArrowUpRight, 
  ArrowDownRight,
  Target,
  Users
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CampaignAnalysisData {
  id: number;
  name: string;
  platform: string;
  status: string;
  ad_spend: number;
  revenue: number;
  calculated_revenue: number;
  order_count: number;
  net_profit: string;
  roas: string;
  cac: string;
  rto_rate: string;
  margin: string;
}

interface TrendData {
  date: string;
  revenue: number;
  ad_spend: number;
}

export default function CampaignAnalysis() {
  const { token } = useAuth();
  const [campaigns, setCampaigns] = useState<CampaignAnalysisData[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const [res, trendsRes] = await Promise.all([
          fetch('/api/campaigns/analysis', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/campaigns/trends', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const data = await res.json();
        const trendsData = await trendsRes.json();
        setCampaigns(data);
        setTrends(trendsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchCampaigns();
  }, [token]);

  if (loading) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">Loading...</div>;

  const totalAdSpend = campaigns.reduce((acc, c) => acc + c.ad_spend, 0);
  const totalRevenue = campaigns.reduce((acc, c) => acc + (c.calculated_revenue || 0), 0);
  const avgRoas = totalAdSpend ? (totalRevenue / totalAdSpend).toFixed(2) : '0.00';
  const totalOrders = campaigns.reduce((acc, c) => acc + c.order_count, 0);
  const avgCac = totalOrders ? (totalAdSpend / totalOrders).toFixed(2) : '0.00';

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Campaign Intelligence</h2>
          <p className="text-zinc-500 mt-2">Deep dive into your advertising performance and true profitability.</p>
        </div>

        {/* Aggregate Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Ad Spend" 
            value={formatCurrency(totalAdSpend)} 
            icon={<DollarSign className="w-5 h-5" />}
          />
          <StatCard 
            title="Total Revenue" 
            value={formatCurrency(totalRevenue)} 
            icon={<ShoppingCart className="w-5 h-5" />}
          />
          <StatCard 
            title="Avg. ROAS" 
            value={`${avgRoas}x`} 
            icon={<Target className="w-5 h-5" />}
          />
          <StatCard 
            title="Avg. CAC" 
            value={formatCurrency(parseFloat(avgCac))} 
            icon={<Users className="w-5 h-5" />}
          />
        </div>

        {/* Trends Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 overflow-hidden"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">Ad Spend vs. Revenue Over Time</h3>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#ffffff20" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(str) => {
                    const d = new Date(str);
                    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
                />
                <YAxis 
                  yAxisId="left" 
                  orientation="left" 
                  stroke="#ffffff20" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#ffffff20" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: '#a1a1aa', marginBottom: '8px' }}
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => {
                    const d = new Date(label as string);
                    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  }}
                />
                <Legend iconType="circle" />
                <Bar 
                  yAxisId="left" 
                  name="Ad Spend" 
                  dataKey="ad_spend" 
                  fill="#8b5cf6" 
                  radius={[4, 4, 0, 0]} 
                  fillOpacity={0.8}
                />
                <Line 
                  yAxisId="right" 
                  name="Revenue" 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={false}
                  activeDot={{ r: 6, fill: "#10b981", strokeWidth: 0 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Detailed Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 overflow-hidden"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">Performance Breakdown</h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-bold rounded-lg border border-emerald-500/20">All Platforms</span>
              <span className="px-3 py-1 bg-white/5 text-zinc-400 text-xs font-bold rounded-lg border border-white/5 cursor-pointer hover:bg-white/10">Active Only</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-zinc-500 text-[10px] uppercase tracking-widest border-b border-white/5">
                  <th className="pb-4 font-bold">Campaign</th>
                  <th className="pb-4 font-bold">Platform</th>
                  <th className="pb-4 font-bold text-right">Spend</th>
                  <th className="pb-4 font-bold text-right">ROAS</th>
                  <th className="pb-4 font-bold text-right">CAC</th>
                  <th className="pb-4 font-bold text-right">RTO Rate</th>
                  <th className="pb-4 font-bold text-right">Net Profit</th>
                  <th className="pb-4 font-bold text-right">Margin</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="py-5">
                      <Link to={`/campaigns/${campaign.id}`} className="flex flex-col group/link">
                        <span className="font-semibold text-zinc-200 group-hover/link:text-emerald-400 transition-colors">{campaign.name}</span>
                        <span className="text-[10px] text-zinc-500 uppercase mt-0.5">{campaign.status}</span>
                      </Link>
                    </td>
                    <td className="py-5">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        campaign.platform === 'Meta' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'
                      )}>
                        {campaign.platform}
                      </span>
                    </td>
                    <td className="py-5 text-right font-medium">{formatCurrency(campaign.ad_spend)}</td>
                    <td className="py-5 text-right">
                      <span className={cn(
                        "font-bold",
                        parseFloat(campaign.roas) >= 3 ? "text-emerald-400" : "text-yellow-400"
                      )}>
                        {campaign.roas}x
                      </span>
                    </td>
                    <td className="py-5 text-right text-zinc-400 font-medium">{formatCurrency(parseFloat(campaign.cac))}</td>
                    <td className="py-5 text-right">
                      <span className={cn(
                        "font-medium",
                        parseFloat(campaign.rto_rate) > 15 ? "text-red-400" : "text-zinc-400"
                      )}>
                        {campaign.rto_rate}%
                      </span>
                    </td>
                    <td className="py-5 text-right">
                      <span className={cn(
                        "font-bold px-2 py-1 rounded-lg bg-zinc-950",
                        parseFloat(campaign.net_profit) > 0 ? "text-emerald-400" : "text-red-400"
                      )}>
                        {parseFloat(campaign.net_profit) > 0 ? '+' : ''}{formatCurrency(parseFloat(campaign.net_profit))}
                      </span>
                    </td>
                    <td className="py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-1000",
                              parseFloat(campaign.margin) > 20 ? "bg-emerald-500" : 
                              parseFloat(campaign.margin) > 0 ? "bg-yellow-500" : "bg-red-500"
                            )}
                            style={{ width: `${Math.max(0, Math.min(100, parseFloat(campaign.margin)))}%` }}
                          />
                        </div>
                        <span className="w-10 font-bold">{campaign.margin}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
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
