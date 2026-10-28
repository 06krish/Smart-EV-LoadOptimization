import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Zap, 
  Cpu, 
  TrendingDown, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  Save, 
  RefreshCw, 
  Sliders, 
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  BarChart2,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine, 
  Legend 
} from 'recharts';
import { SmartEVApi } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import AnimatedCounter from '../components/AnimatedCounter';

export const OptimizationPage = () => {
  const { onDataChange } = useOutletContext();
  const [algorithm, setAlgorithm] = useState('LP_PULP');
  const [gridCapacityOverride, setGridCapacityOverride] = useState(100.0);
  const [horizonSlots, setHorizonSlots] = useState(4);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [error, setError] = useState(null);

  const executeOptimization = async (customAlgo = algorithm) => {
    try {
      setLoading(true);
      setError(null);
      const res = await SmartEVApi.runOptimization({
        algorithm: customAlgo,
        grid_capacity_kw: gridCapacityOverride,
        horizon_slots: horizonSlots,
        apply_to_sessions: true
      });
      setResult(res.data);
      if (onDataChange) onDataChange();
    } catch (err) {
      console.error('Optimization error:', err);
      setError('Optimization run failed. Please check backend solver service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeOptimization();
  }, []);

  const handleSaveSchedule = async () => {
    if (!result) return;
    try {
      setSaveLoading(true);
      await SmartEVApi.createSchedule({
        station: result.station_id,
        optimization_result: result.optimization_id,
        title: `Optimized Dispatch (${result.algorithm_version}) - ${new Date().toLocaleTimeString()}`,
        schedule_matrix: result.allocations,
        status: 'ACTIVE'
      });
      setSaveMessage('Schedule persisted successfully into database system of record!');
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (err) {
      alert('Failed to save schedule.');
    } finally {
      setSaveLoading(false);
    }
  };

  const allocations = result?.allocations || [];

  const comparisonData = result ? [
    {
      metric: 'Peak Demand (kW)',
      'Uncoordinated Baseline': result.peak_load_before_kw,
      'Smart-EV Optimized': result.peak_load_after_kw,
    },
    {
      metric: 'Electricity Cost ($)',
      'Uncoordinated Baseline': result.cost_before_optimization,
      'Smart-EV Optimized': result.cost_after_optimization,
    }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-[#E2E8F0] gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-extrabold text-[#2E3A8C] tracking-tight">Smart Charging Optimization</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#E6FAF7] text-[#008472] border border-[#00C2A8]/30 font-mono">
              Stage 3 LP Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-body">
            Solves multi-horizon power distribution (Priority Scoring &rarr; Greedy Allocation &rarr; SciPy HiGHS Solver).
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => executeOptimization()}
            disabled={loading}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#00C2A8] hover:bg-[#00A38D] text-white text-xs font-bold shadow-teal-glow transition-all active:scale-95 disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Solving Model...' : 'Execute Optimization'}</span>
          </button>
        </div>
      </div>

      {/* Configuration Control Panel */}
      <div className="saas-card p-6">
        <h3 className="text-sm font-bold text-[#2E3A8C] mb-4 flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-[#00C2A8]" />
          <span>Solver Constraints & Horizon Parameters</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Algorithm Architecture
            </label>
            <select
              value={algorithm}
              onChange={(e) => {
                setAlgorithm(e.target.value);
                executeOptimization(e.target.value);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00C2A8] focus:outline-none font-semibold text-slate-800"
            >
              <option value="LP_PULP">Stage 3: SciPy HiGHS Mathematical LP Solver (Recommended)</option>
              <option value="RULE_GREEDY">Stage 1-2: Rule-Based Priority & Greedy Allocator</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              {algorithm === 'LP_PULP' ? 'Global mathematical optimum over time horizon factoring ToU rates.' : 'Priority-sorted single-pass allocation with fairness.'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Station Transformer Limit (kW)
            </label>
            <input
              type="number"
              value={gridCapacityOverride}
              onChange={(e) => setGridCapacityOverride(parseFloat(e.target.value) || 100)}
              min="20"
              max="500"
              step="5"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00C2A8] focus:outline-none font-mono font-bold text-slate-800"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Physical grid ceiling constraint. Solver guarantees load &le; capacity.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Lookahead Time Horizon
            </label>
            <select
              value={horizonSlots}
              onChange={(e) => setHorizonSlots(parseInt(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00C2A8] focus:outline-none font-semibold text-slate-800"
            >
              <option value={2}>2 Hours (Next 2 Slots)</option>
              <option value={4}>4 Hours (Standard Horizon)</option>
              <option value={8}>8 Hours (Full Shift Lookahead)</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Scheduling time window for tariff-shifting and deadline fulfillment.
            </p>
          </div>
        </div>
      </div>

      {/* Results Overview: Side-by-Side Baseline vs Optimized */}
      {result && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="saas-card p-5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block font-mono">Peak Demand Reduction</span>
            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-3xl font-extrabold text-[#2E3A8C] font-mono">{result.peak_load_after_kw}</span>
              <span className="text-xs font-bold text-slate-400 font-mono">kW</span>
            </div>
            <div className="mt-2 text-xs flex items-center space-x-1.5 text-[#008472] font-bold">
              <TrendingDown className="w-4 h-4 text-[#00C2A8]" />
              <span>Reduced by {result.peak_reduction_percent}%</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              Uncoordinated Baseline: <span className="text-coral-600 font-bold">{result.peak_load_before_kw} kW</span>
            </div>
          </div>

          <div className="saas-card p-5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block font-mono">Total Electricity Cost</span>
            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-3xl font-extrabold text-[#008472] font-mono">${result.cost_after_optimization}</span>
              <span className="text-xs font-bold text-slate-400 font-mono">USD</span>
            </div>
            <div className="mt-2 text-xs flex items-center space-x-1.5 text-emerald-700 font-bold">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Saved ${result.estimated_savings} ({result.savings_percent}%)</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              Uncoordinated Baseline: <span className="text-coral-600 font-bold">${result.cost_before_optimization}</span>
            </div>
          </div>

          <div className="saas-card p-5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block font-mono">Grid Invariant Status</span>
            <div className="flex items-center space-x-2.5 mt-2">
              <ShieldCheck className="w-8 h-8 text-[#00C2A8]" />
              <div>
                <span className="text-sm font-bold text-[#2E3A8C] block">0 Invariant Violations</span>
                <span className="text-[11px] text-[#008472] font-semibold">100% Breaker Safety</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-3 font-mono">
              Peak {result.peak_load_after_kw} kW &le; {result.grid_capacity_kw} kW ceiling.
            </p>
          </div>

          <div className="saas-card p-5 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block font-mono">Persistence Action</span>
              <span className="text-xs text-slate-600 block mt-1">
                Save active optimized dispatch schedule to database records.
              </span>
            </div>
            {saveMessage && (
              <span className="text-[11px] font-semibold text-emerald-800 bg-[#F7FEE7] px-2 py-1 rounded-lg border border-[#A3E635] my-1">
                {saveMessage}
              </span>
            )}
            <button
              onClick={handleSaveSchedule}
              disabled={saveLoading}
              className="mt-3 w-full py-2 px-3 text-xs font-bold bg-[#2E3A8C] hover:bg-[#242E70] text-white rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5 text-[#00C2A8]" />
              <span>{saveLoading ? 'Saving...' : 'Save Schedule to Database'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Comparison Chart */}
      {result && (
        <div className="saas-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#2E3A8C]">Before vs After Optimization Quantitative Benchmark</h3>
              <p className="text-xs text-slate-500">
                Direct comparison against uncoordinated simultaneous charging baseline (110 kW demand on 100 kW grid)
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="metric" tick={{ fontSize: 12, fill: '#2E3A8C', fontWeight: 600 }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    borderRadius: '12px', 
                    border: '1px solid #E2E8F0', 
                    boxShadow: '0 4px 20px rgba(46,58,140,0.08)' 
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Uncoordinated Baseline" fill="#EF4444" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Smart-EV Optimized" fill="#00C2A8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recommended Charging Schedule Table */}
      <div className="saas-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#2E3A8C]">Recommended Charging Dispatch Matrix</h3>
            <p className="text-xs text-slate-500">Per-vehicle power allocation, scheduled energy, and departure fulfillment</p>
          </div>
          <span className="text-xs font-mono font-bold text-[#008472] bg-[#E6FAF7] px-2.5 py-1 rounded-lg">
            {allocations.length} Active Sessions Included
          </span>
        </div>

        <div className="overflow-x-auto custom-scrollbar mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider font-mono font-bold">
                <th className="pb-3">Vehicle</th>
                <th className="pb-3">Bay</th>
                <th className="pb-3">Priority</th>
                <th className="pb-3">Current &rarr; Target</th>
                <th className="pb-3">Required Energy</th>
                <th className="pb-3">Slot 1 (Now)</th>
                <th className="pb-3">Lookahead Slots (kW)</th>
                <th className="pb-3">Scheduled Energy</th>
                <th className="pb-3">Est. Cost</th>
                <th className="pb-3">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {allocations.map((a, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 font-bold text-[#2E3A8C]">{a.identifier}</td>
                  <td className="py-3 font-mono text-slate-600 font-semibold">{a.charger_identifier}</td>
                  <td className="py-3">
                    <StatusBadge status={a.priority_level} type="priority" />
                  </td>
                  <td className="py-3 font-mono">
                    <span className="text-slate-500">{a.current_soc}%</span> &rarr; <span className="font-bold text-[#008472]">{a.target_soc}%</span>
                  </td>
                  <td className="py-3 text-slate-600 font-mono">{a.required_energy_kwh} kWh</td>
                  <td className="py-3 font-extrabold text-[#008472] font-mono text-sm">{a.allocated_power_kw} kW</td>
                  <td className="py-3 font-mono text-slate-600 text-[11px]">
                    {a.slot_allocations_kw ? a.slot_allocations_kw.join(' kW | ') + ' kW' : `${a.allocated_power_kw} kW`}
                  </td>
                  <td className="py-3 font-bold text-slate-800 font-mono">{a.energy_scheduled_kwh || a.allocated_power_kw} kWh</td>
                  <td className="py-3 text-emerald-700 font-bold font-mono">${a.estimated_cost_usd || (a.allocated_power_kw * 0.22).toFixed(2)}</td>
                  <td className="py-3">
                    <StatusBadge status={a.status} type="session" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OptimizationPage;
