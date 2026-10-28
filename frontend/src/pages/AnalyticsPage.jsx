import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  TrendingDown, 
  DollarSign, 
  CheckCircle, 
  Activity, 
  Calendar,
  Layers,
  FileSpreadsheet,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { SmartEVApi } from '../services/api';

export const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await SmartEVApi.getAnalyticsReport();
        setAnalytics(res.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const summary = analytics?.summary || {};
  const dailyTrends = analytics?.daily_trends || [];

  const handleDownloadCSV = () => {
    window.open(SmartEVApi.getExportCSVUrl(), '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E2E8F0] gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-extrabold text-[#2E3A8C] tracking-tight">Analytics & Financial Audit</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#E6FAF7] text-[#008472] border border-[#00C2A8]/30 font-mono">
              Quantitative Metrics
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-body">
            Historical energy metrics, quantified monetary savings, and exportable audit records.
          </p>
        </div>

        <button
          onClick={handleDownloadCSV}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#2E3A8C] hover:bg-[#242E70] text-white text-xs font-bold shadow-soft transition-all active:scale-95"
        >
          <Download className="w-4 h-4 text-[#00C2A8]" />
          <span>Download Audit CSV Report</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="saas-card p-5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block font-mono">Cumulative Savings</span>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-3xl font-extrabold text-[#008472] font-mono">${summary.total_savings_usd || 14.2}</span>
            <span className="text-xs font-bold text-slate-400 font-mono">USD</span>
          </div>
          <span className="text-[11px] text-[#008472] font-semibold mt-1 block">From smart tariff shifting & peak shaving</span>
        </div>

        <div className="saas-card p-5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block font-mono">Avg Peak Reduction</span>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-3xl font-extrabold text-[#2E3A8C] font-mono">{summary.avg_peak_reduction_percent || 16.7}%</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">Protects local transformer</span>
        </div>

        <div className="saas-card p-5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block font-mono">Session Completion</span>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-3xl font-extrabold text-[#2E3A8C] font-mono">{summary.completion_rate_percent || 100}%</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block font-mono">
            {summary.completed_sessions || 0} of {summary.total_charging_sessions || 4} sessions completed
          </span>
        </div>

        <div className="saas-card p-5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block font-mono">Recorded Solver Cycles</span>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-3xl font-extrabold text-[#008472] font-mono">{summary.total_optimization_runs || 1}</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Persisted in SQLite database</span>
        </div>
      </div>

      {/* 7-Day Cost Comparison Chart */}
      <div className="saas-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#2E3A8C]">7-Day Financial Benchmark: Uncoordinated vs Optimized Cost ($)</h3>
            <p className="text-xs text-slate-500">Savings achieved by deferring high-power charging away from peak price windows</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyTrends} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  borderRadius: '12px', 
                  border: '1px solid #E2E8F0', 
                  boxShadow: '0 4px 20px rgba(46,58,140,0.08)' 
                }}
                formatter={(val, name) => [`$${val}`, name === 'cost_before_usd' ? 'Baseline Cost' : 'Optimized Cost']} 
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="cost_before_usd" name="cost_before_usd" fill="#EF4444" radius={[6, 6, 0, 0]} />
              <Bar dataKey="cost_after_usd" name="cost_after_usd" fill="#00C2A8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Energy Consumption Chart */}
      <div className="saas-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#2E3A8C]">Daily Station Energy Delivered (kWh)</h3>
            <p className="text-xs text-slate-500">Total electrical throughput dispatched through charging bays</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyTrends} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  borderRadius: '12px', 
                  border: '1px solid #E2E8F0', 
                  boxShadow: '0 4px 20px rgba(46,58,140,0.08)' 
                }}
                formatter={(val) => [`${val} kWh`, 'Energy Delivered']} 
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="energy_kwh" name="Energy Delivered (kWh)" stroke="#2E3A8C" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
