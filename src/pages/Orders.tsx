import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Search, 
  Filter, 
  ArrowDownWideNarrow, 
  Download,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Info
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface DetailedOrder {
  id: number;
  external_id: string;
  revenue: number;
  profit: number;
  status: string;
  region: string;
  sku: string;
  campaign_name: string;
  created_at: string;
  cogs: number;
  shipping_cost: number;
  rto_cost: number;
  gateway_fee: number;
  packaging_cost: number;
  discount: number;
}

export default function OrderAnalytics() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<DetailedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<DetailedOrder | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders/detailed', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        setOrders(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchOrders();
  }, [token]);

  const filteredOrders = orders.filter(o => 
    o.external_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">Loading...</div>;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Order Analytics</h2>
            <p className="text-zinc-500 mt-1">Track unit-level metrics and profitability for every transaction.</p>
          </div>
          <button className="px-4 py-2 bg-emerald-500 text-black rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-400 transition-colors">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input 
              type="text"
              placeholder="Search by Order ID or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900/40 border border-white/5 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
            />
          </div>
          <button className="px-6 py-3 bg-zinc-900/40 border border-white/5 rounded-2xl flex items-center gap-2 text-zinc-400 hover:text-white transition-all">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-bold">Filters</span>
          </button>
        </div>

        {/* Order Table */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-zinc-500 text-[10px] uppercase tracking-widest border-b border-white/5 font-bold">
                  <th className="px-6 py-5">Order Info</th>
                  <th className="px-6 py-5">Product (SKU)</th>
                  <th className="px-6 py-5">Region</th>
                  <th className="px-6 py-5">Revenue</th>
                  <th className="px-6 py-5">Net Profit</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-white group-hover:text-emerald-400 transition-colors">#{order.external_id}</span>
                        <span className="text-[10px] text-zinc-500 mt-0.5">{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-medium">{order.sku}</td>
                    <td className="px-6 py-5 text-zinc-400 font-medium">{order.region}</td>
                    <td className="px-6 py-5 font-bold">{formatCurrency(order.revenue)}</td>
                    <td className="px-6 py-5">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 font-bold",
                        order.profit > 0 ? "text-emerald-400" : "text-red-400"
                      )}>
                        {order.profit > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {formatCurrency(order.profit)}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold tracking-tighter uppercase",
                        order.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-400'
                      )}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all">
                      <ChevronRight className="w-5 h-5 ml-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Slide-over Detail Sidebar */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-zinc-900 border-l border-white/10 z-50 p-8 shadow-2xl overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold">Order Details</h3>
                <button onClick={() => setSelectedOrder(null)} className="text-zinc-500 hover:text-white transition-colors">Close</button>
              </div>

              <div className="space-y-8">
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 text-center">
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Total Order Profit</p>
                  <h4 className={cn(
                    "text-4xl font-black",
                    selectedOrder.profit > 0 ? "text-emerald-400" : "text-red-400"
                  )}>{formatCurrency(selectedOrder.profit)}</h4>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Unit Economics</h5>
                  <div className="space-y-3">
                    <EconomicsRow label="Revenue" value={formatCurrency(selectedOrder.revenue)} color="text-white" />
                    <EconomicsRow label="Product Cost (COGS)" value={`-${formatCurrency(selectedOrder.cogs)}`} color="text-red-400" />
                    <EconomicsRow label="Shipping" value={`-${formatCurrency(selectedOrder.shipping_cost)}`} color="text-red-400" />
                    {selectedOrder.rto_cost > 0 && <EconomicsRow label="RTO Charges" value={`-${formatCurrency(selectedOrder.rto_cost)}`} color="text-red-400" />}
                    <EconomicsRow label="Gateway Fee" value={`-${formatCurrency(selectedOrder.gateway_fee)}`} color="text-red-400" />
                    <EconomicsRow label="Packaging" value={`-${formatCurrency(selectedOrder.packaging_cost)}`} color="text-red-400" />
                    <EconomicsRow label="Discounts" value={`-${formatCurrency(selectedOrder.discount)}`} color="text-red-400" />
                    <div className="pt-3 mt-3 border-t border-white/10">
                      <EconomicsRow label="Net Margin (%)" value={`${((selectedOrder.profit / selectedOrder.revenue) * 100).toFixed(1)}%`} color="text-emerald-400" bold />
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Metadata</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-zinc-500 mb-1 font-bold uppercase">Campaign</p>
                      <p className="text-sm font-bold truncate">{selectedOrder.campaign_name}</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-zinc-500 mb-1 font-bold uppercase">Region</p>
                      <p className="text-sm font-bold">{selectedOrder.region}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-blue-500/5 rounded-3xl border border-blue-500/20 flex gap-4">
                  <Info className="w-5 h-5 text-blue-400 shrink-0" />
                  <p className="text-xs text-blue-200/60 leading-relaxed">
                    This order was generated through the <span className="text-blue-300 font-bold">{selectedOrder.campaign_name}</span> campaign. The profitability is calculated after deducting all dynamic logistics and marketing costs.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

function EconomicsRow({ label, value, color, bold = false }: { label: string, value: string, color: string, bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-400 text-sm">{label}</span>
      <span className={cn("text-sm transition-all", bold ? "font-black" : "font-semibold", color)}>{value}</span>
    </div>
  );
}
