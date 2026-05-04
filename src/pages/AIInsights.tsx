import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Sparkles, 
  BrainCircuit, 
  TrendingUp, 
  Zap, 
  AlertCircle,
  Loader2,
  ChevronRight,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency, cn } from '../lib/utils';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface RawData {
  dailyMetrics: Array<{
    date: string;
    revenue: number;
    profit: number;
    total_orders: number;
    rto_count: number;
  }>;
  regionPerformance: Array<{
    region: string;
    orders: number;
    rto_count: number;
  }>;
}

interface AIAnalysis {
  summary: string;
  forecast: Array<{ date: string; predicted_profit: number }>;
  recommendations: Array<{
    title: string;
    impact: 'High' | 'Medium' | 'Low';
    description: string;
    action: string;
  }>;
  risk_alerts: Array<{
    category: string;
    observation: string;
    urgency: 'Immediate' | 'Scheduled';
  }>;
}

export default function AIInsights() {
  const { token } = useAuth();
  const [rawData, setRawData] = useState<RawData | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/ai/raw-data', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setRawData(data);
        runAIAnalysis(data);
      } catch (err) {
        console.error(err);
      }
    };
    if (token) fetchData();
  }, [token]);

  const runAIAnalysis = async (data: RawData) => {
    setAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      const prompt = `
        Analyze the following e-commerce financial data and provide strategic insights.
        
        Data Context:
        - Daily Metrics (Reverse Chronological): ${JSON.stringify(data.dailyMetrics)}
        - Regional RTO Performance: ${JSON.stringify(data.regionPerformance)}
        
        Task:
        1. Summarize current health.
        2. Forecast profit for the next 7 days based on current trends.
        3. Provide 3 specific, high-impact recommendations (e.g., focus on specific regions, SKU bundles, or ad spend changes).
        4. Identify risk alerts (e.g., high RTO zones, falling margins).
        
        Response must be strict JSON.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              forecast: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    date: { type: Type.STRING },
                    predicted_profit: { type: Type.NUMBER }
                  }
                }
              },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    impact: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                    description: { type: Type.STRING },
                    action: { type: Type.STRING }
                  }
                }
              },
              risk_alerts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    observation: { type: Type.STRING },
                    urgency: { type: Type.STRING, enum: ["Immediate", "Scheduled"] }
                  }
                }
              }
            }
          }
        }
      });

      if (response.text) {
        setAnalysis(JSON.parse(response.text));
      }
    } catch (err) {
      console.error("AI Analysis Error:", err);
    } finally {
      setAnalyzing(false);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
          <p className="text-zinc-500 animate-pulse font-medium tracking-wide">Gathering Intelligence...</p>
        </div>
      </DashboardLayout>
    );
  }

  const isEmpty = !rawData?.dailyMetrics || rawData.dailyMetrics.length === 0;

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
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
            <Sparkles className="w-10 h-10 text-emerald-500" />
          </div>
          <div className="max-w-md">
            <h2 className="text-2xl font-bold mb-2">No Data to Analyze</h2>
            <p className="text-zinc-500 mb-6">Generate synthetic intelligence data to let AI forecast your profit and provide growth recommendations.</p>
            <button 
              onClick={seedData}
              className="px-6 py-3 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl transition-colors inline-flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Generate Demo Data
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                <BrainCircuit className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Profit Intelligence</h2>
            </div>
            <p className="text-zinc-500">AI-powered forecasting and campaign optimization.</p>
          </div>
          <button 
            onClick={() => rawData && runAIAnalysis(rawData)}
            disabled={analyzing}
            className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-2xl hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Refresh Intelligence
          </button>
        </div>

        <AnimatePresence mode='wait'>
          {analysis && (
            <motion.div 
              key="analysis-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Executive Summary */}
              <div className="lg:col-span-12">
                <div className="p-8 bg-zinc-900/40 border border-white/5 rounded-[2.5rem] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transition-transform group-hover:scale-110">
                    <BrainCircuit className="w-64 h-64 text-emerald-500" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-400" />
                      AI Executive Summary
                    </h3>
                    <p className="text-zinc-400 leading-relaxed text-lg max-w-4xl">
                      {analysis.summary}
                    </p>
                  </div>
                </div>
              </div>

              {/* Profit Forecast */}
              <div className="lg:col-span-8">
                <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                        7-Day Profit Forecast
                      </h3>
                      <p className="text-zinc-500 text-sm mt-1">Predictive analysis based on velocity and return rates.</p>
                    </div>
                  </div>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[...(rawData?.dailyMetrics.slice(-3).map(m => ({ date: m.date, value: m.profit })) || []), ...(analysis.forecast.map(f => ({ date: f.date, value: f.predicted_profit, isFuture: true })))]}>
                        <defs>
                          <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorFuture" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
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
                        <YAxis hide />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-zinc-900 border border-white/10 p-3 rounded-xl shadow-2xl">
                                  <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">{payload[0].payload.date}</p>
                                  <p className="text-sm font-bold text-white">
                                    Predicted Profit: <span className="text-emerald-400">{formatCurrency(payload[0].value as number)}</span>
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#10b981" 
                          strokeWidth={4}
                          fillOpacity={1} 
                          fill="url(#colorProfit)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Smart Recommendations */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 h-full">
                  <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                    <Target className="w-5 h-5 text-blue-400" />
                    Growth Actions
                  </h3>
                  <div className="space-y-4">
                    {analysis.recommendations.map((rec, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={idx} 
                        className="p-5 bg-white/5 rounded-3xl border border-white/5 border-l-2 border-l-emerald-500"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border",
                            rec.impact === 'High' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                            rec.impact === 'Medium' ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                            "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          )}>
                            {rec.impact} Impact
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-white mb-2">{rec.title}</h4>
                        <p className="text-xs text-zinc-500 mb-4">{rec.description}</p>
                        <button className="w-full flex items-center justify-between px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{rec.action}</span>
                          <ChevronRight className="w-3 h-3 text-zinc-500 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Risk Management */}
              <div className="lg:col-span-12">
                <div className="bg-red-500/5 border border-red-500/10 rounded-[2.5rem] p-8">
                  <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    Risk Matrix Intelligence
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {analysis.risk_alerts.map((alert, idx) => (
                      <div key={idx} className="p-4 bg-zinc-950/40 rounded-2xl border border-white/5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{alert.category}</span>
                          <span className={cn(
                            "w-2 h-2 rounded-full",
                            alert.urgency === 'Immediate' ? "bg-red-500 animate-pulse" : "bg-yellow-500"
                          )} />
                        </div>
                        <p className="text-sm font-medium text-zinc-300 mb-2">{alert.observation}</p>
                        <div className="text-[10px] font-bold text-red-400/80 uppercase tracking-widest">Priority: {alert.urgency}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
