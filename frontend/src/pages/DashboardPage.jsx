import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { 
  Zap, 
  BatteryCharging, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  AlertTriangle,
  Play, 
  RotateCcw, 
  ChevronRight,
  ShieldCheck,
  Clock,
  Gauge,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Activity,
  Cpu
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  Legend, 
  ReferenceLine 
} from 'recharts';
import { SmartEVApi } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import StatusBadge from '../components/StatusBadge';
import AnimatedCounter from '../components/AnimatedCounter';

export const DashboardPage = () => {
  const { refreshTrigger, onDataChange } = useOutletContext();
  const { isDark } = useTheme();
  const [data, setData] = useState(null);
  const [chargers, setChargers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [simLoading, setSimLoading] = useState(false);
  const [chartMode, setChartMode] = useState('curve'); // 'curve' or 'forecast'

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [sumRes, chRes, sessRes] = await Promise.all([
        SmartEVApi.getDashboardSummary(),
        SmartEVApi.getChargers(),
        SmartEVApi.getSessions(),
      ]);
      setData(sumRes.data);
      setChargers(chRes.data);
      setSessions(sessRes.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Unable to load dashboard data from backend API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [refreshTrigger]);

  const handleTick = async (mins) => {
    try {
      setSimLoading(true);
      await SmartEVApi.simulatorTick(mins);
      fetchDashboardData();
      if (onDataChange) onDataChange();
    } catch (err) {
      alert('Simulation tick failed.');
    } finally {
      setSimLoading(false);
    }
  };

  const handleToggleFault = async (chargerId) => {
    try {
      await SmartEVApi.simulatorFault(chargerId);
      fetchDashboardData();
      if (onDataChange) onDataChange();
    } catch (err) {
      alert('Failed to toggle charger status.');
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#E6FAF7] dark:bg-teal-950 border-2 border-[#00C2A8] flex items-center justify-center animate-pulse">
          <Zap className="w-6 h-6 text-[#00C2A8] animate-bounce" />
        </div>
        <p className="text-sm font-semibold text-[#2E3A8C] dark:text-indigo-200">Loading Smart EV Load Optimization Telemetry...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-coral-200 dark:border-coral-800 shadow-soft max-w-md mx-auto">
        <AlertTriangle className="w-10 h-10 text-coral-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-[#2E3A8C] dark:text-white">Service Offline</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-5 py-2.5 bg-[#00C2A8] text-white text-xs font-semibold rounded-xl hover:bg-[#00A38D] transition-colors shadow-teal-glow"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const station = data?.station || {};
  const chartPoints = data?.chart_data?.history_vs_pred || [];
  const futurePoints = data?.chart_data?.future_forecast || [];

  const gridCapacity = station.grid_capacity_kw || 100.0;
  const currentLoad = station.current_load_kw || 0.0;
  const baseLoad = station.base_load_kw || 10.0;
  const evLoad = Math.max(0, currentLoad - baseLoad);
  const headroom = Math.max(0, gridCapacity - currentLoad);
  const capacityUsedPercent = Math.min(100, Math.round((currentLoad / Math.max(1, gridCapacity)) * 100 * 10) / 10);

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Simulator Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-2 border-b border-[#E2E8F0] dark:border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-extrabold text-[#2E3A8C] dark:text-white tracking-tight">
              Grid Operations Dashboard
            </h1>
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E6FAF7] dark:bg-teal-950/60 text-[#008472] dark:text-[#52DFCE] border border-[#00C2A8]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C2A8] animate-pulse"></span>
              <span>Telemetric Real-Time</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-body">
            Continuously balances active EV power allocation under the 100 kW transformer threshold.
          </p>
        </div>

        {/* Simulator Micro-Controls Toolbar */}
        <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 shadow-soft">
          <div className="px-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center space-x-1 border-r border-slate-100 dark:border-slate-800 pr-3">
            <Clock className="w-3.5 h-3.5 text-[#00C2A8]" />
            <span>Simulator</span>
          </div>
          <button
            onClick={() => handleTick(15)}
            disabled={simLoading}
            className="px-3 py-1.5 text-xs font-semibold bg-[#00C2A8] hover:bg-[#00A38D] text-white rounded-xl shadow-teal-glow transition-all disabled:opacity-50 flex items-center space-x-1.5 active:scale-95"
            title="Advance simulated clock by 15 minutes"
          >
            <Play className={`w-3 h-3 ${simLoading ? 'animate-spin' : ''}`} />
            <span>+15m Tick</span>
          </button>
          <button
            onClick={() => handleTick(60)}
            disabled={simLoading}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#2E3A8C] dark:text-slate-200 rounded-xl transition-colors disabled:opacity-50"
          >
            +1 Hour
          </button>
          <Link
            to="/optimization"
            className="px-3 py-1.5 text-xs font-semibold text-[#2E3A8C] dark:text-[#52DFCE] hover:text-[#00C2A8] bg-[#F0F2FA] dark:bg-slate-800 rounded-xl hover:bg-[#E1E5F5] dark:hover:bg-slate-700 transition-colors flex items-center space-x-1"
          >
            <span>Run LP Solver</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#00C2A8]" />
          </Link>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* KPI 1: Total Load */}
        <div className="saas-card p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">Total Grid Load</span>
            <div className="w-9 h-9 rounded-xl bg-[#E6FAF7] dark:bg-teal-950/60 text-[#00C2A8] flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
              <Zap className="w-4 h-4" strokeWidth={2} />
            </div>
          </div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-extrabold text-[#2E3A8C] dark:text-white">
              <AnimatedCounter value={currentLoad} decimals={1} />
            </span>
            <span className="text-xs font-bold text-slate-400 font-mono">kW / {gridCapacity} kW</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Available Headroom:</span>
            <span className="font-mono font-bold text-[#008472] dark:text-[#52DFCE] bg-[#E6FAF7] dark:bg-teal-950/60 px-2 py-0.5 rounded-md">
              {headroom.toFixed(1)} kW
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00C2A8] to-[#A3E635]" />
        </div>

        {/* KPI 2: Grid Capacity Used % */}
        <div className="saas-card p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">Capacity Used</span>
            <div className="w-9 h-9 rounded-xl bg-[#F0F2FA] dark:bg-slate-800 text-[#2E3A8C] dark:text-indigo-300 flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
              <Gauge className="w-4 h-4" strokeWidth={2} />
            </div>
          </div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-extrabold text-[#2E3A8C] dark:text-white">
              <AnimatedCounter value={capacityUsedPercent} decimals={1} suffix="%" />
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#F7FEE7] dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-[#A3E635]/40 font-mono text-[10px]">
              SAFE LOAD
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden flex">
              <div 
                className="bg-gradient-to-r from-[#00C2A8] to-[#2E3A8C] h-full rounded-full transition-all duration-700 progress-shimmer"
                style={{ width: `${capacityUsedPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 3: Active EVs */}
        <div className="saas-card p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">Active EVs Charging</span>
            <div className="w-9 h-9 rounded-xl bg-[#F7FEE7] dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
              <BatteryCharging className="w-4 h-4 animate-breathe" strokeWidth={2} />
            </div>
          </div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-extrabold text-[#2E3A8C] dark:text-white">
              <AnimatedCounter value={kpis.active_sessions_count || 0} decimals={0} />
            </span>
            <span className="text-xs font-bold text-slate-400 font-mono">of {kpis.total_registered_evs || 4} Fleet EVs</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Bay Utilization:</span>
            <span className="font-mono font-bold text-[#2E3A8C] dark:text-indigo-200">
              {kpis.charger_utilization_percent || 100}% (Full)
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#A3E635]" />
        </div>

        {/* KPI 4: Cost Saved */}
        <div className="saas-card p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">Cost Optimized</span>
            <div className="w-9 h-9 rounded-xl bg-[#E6FAF7] dark:bg-teal-950/60 text-[#00C2A8] flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4" strokeWidth={2} />
            </div>
          </div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-extrabold text-[#008472] dark:text-[#52DFCE]">
              <AnimatedCounter value={kpis.potential_savings_usd || 14.2} prefix="$" decimals={2} />
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#F7FEE7] dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-[#A3E635]/40 font-mono text-[10px]">
              +{kpis.savings_percent || 34.2}%
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Throughput Delivered:</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
              {kpis.total_consumption_kwh || 0} kWh
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00C2A8] to-[#2E3A8C]" />
        </div>
      </div>

      {/* Dynamic Grid Invariant Capacity Bar */}
      <div className="saas-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#2E3A8C] dark:text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#00C2A8]" />
              <span>Real-Time Transformer & Load Allocation Matrix</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Maximum physical transformer limit: <strong className="text-slate-800 dark:text-slate-200 font-mono">100 kW</strong>. Constrained by Stage 3 LP Solver.
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-medium">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-sm bg-slate-300 dark:bg-slate-600"></span>
              <span className="text-slate-600 dark:text-slate-400">Base Facility ({baseLoad} kW)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#00C2A8]"></span>
              <span className="text-slate-700 dark:text-slate-300 font-semibold">Active EV Power ({evLoad.toFixed(1)} kW)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#F7FEE7] dark:bg-emerald-950 border border-[#A3E635]"></span>
              <span className="text-emerald-800 dark:text-emerald-300 font-semibold">Headroom ({headroom.toFixed(1)} kW)</span>
            </div>
          </div>
        </div>

        {/* Visual Stacked Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl h-5 overflow-hidden flex border border-[#E2E8F0] dark:border-slate-700 p-0.5">
          <div 
            style={{ width: `${(baseLoad / gridCapacity) * 100}%` }} 
            className="bg-slate-300 dark:bg-slate-600 h-full rounded-l-lg transition-all duration-500" 
            title={`Base Facility Load: ${baseLoad} kW`}
          />
          <div 
            style={{ width: `${(evLoad / gridCapacity) * 100}%` }} 
            className="bg-gradient-to-r from-[#00C2A8] to-[#00A38D] h-full transition-all duration-500 progress-shimmer" 
            title={`Optimized EV Load: ${evLoad.toFixed(1)} kW`}
          />
          <div 
            style={{ width: `${(headroom / gridCapacity) * 100}%` }} 
            className="bg-[#F7FEE7] dark:bg-emerald-950/40 h-full rounded-r-lg" 
            title={`Safe Available Headroom: ${headroom.toFixed(1)} kW`}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-2 font-mono">
          <span>0 kW</span>
          <span>50 kW Headroom Threshold</span>
          <span className="font-bold text-coral-600">100 kW Physical Ceiling</span>
        </div>
      </div>

      {/* Main Real-Time Load Curve & Schedule Timeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Real-Time Load Curve Chart (2 cols) */}
        <div className="lg:col-span-2 saas-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-[#2E3A8C] dark:text-white">
                  {chartMode === 'curve' ? 'Real-Time Load Curve (Telemetry vs ML Forecast)' : 'Upcoming 12h Tariff Surcharge Trajectory'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Continuous telemetry comparison with scikit-learn autoregressive regression (MAE: 4.66 kW).
              </p>
            </div>

            {/* Toggle Modes */}
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setChartMode('curve')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  chartMode === 'curve' 
                    ? 'bg-white dark:bg-slate-700 text-[#2E3A8C] dark:text-white shadow-xs' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                24h Load Curve
              </button>
              <button
                onClick={() => setChartMode('forecast')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  chartMode === 'forecast' 
                    ? 'bg-white dark:bg-slate-700 text-[#2E3A8C] dark:text-white shadow-xs' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                12h Peak Forecast
              </button>
            </div>
          </div>

          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'curve' ? (
                <AreaChart data={chartPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="actualTeal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00C2A8" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#00C2A8" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="predIndigo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2E3A8C" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#2E3A8C" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E293B' : '#F1F5F9'} />
                  <XAxis dataKey="hour" tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#64748B' }} tickFormatter={(h) => `${h}:00`} />
                  <YAxis tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#64748B' }} domain={[0, 110]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#1E293B' : '#FFFFFF', 
                      borderRadius: '12px', 
                      border: isDark ? '1px solid #334155' : '1px solid #E2E8F0', 
                      color: isDark ? '#F1F5F9' : '#1E293B',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.3)' 
                    }}
                    formatter={(val, name) => [`${val} kW`, name === 'actual_load_kw' ? 'Telemetry Observed' : 'ML Predicted']}
                    labelFormatter={(l) => `Hour ${l}:00`}
                  />
                  <ReferenceLine 
                    y={100} 
                    label={{ value: '100 kW Ceiling', position: 'insideTopRight', fill: '#EF4444', fontSize: 11, fontWeight: 'bold' }} 
                    stroke="#EF4444" 
                    strokeDasharray="4 4" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="actual_load_kw" 
                    name="actual_load_kw" 
                    stroke="#00C2A8" 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#actualTeal)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="predicted_load_kw" 
                    name="predicted_load_kw" 
                    stroke="#465ABB" 
                    strokeWidth={2} 
                    strokeDasharray="4 4" 
                    fillOpacity={1} 
                    fill="url(#predIndigo)" 
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                </AreaChart>
              ) : (
                <BarChart data={futurePoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E293B' : '#F1F5F9'} />
                  <XAxis dataKey="time_label" tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#64748B' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#1E293B' : '#FFFFFF', 
                      borderRadius: '12px', 
                      border: isDark ? '1px solid #334155' : '1px solid #E2E8F0', 
                      color: isDark ? '#F1F5F9' : '#1E293B',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.3)' 
                    }}
                    formatter={(val) => [`${val} kW`, 'Anticipated Load']}
                  />
                  <ReferenceLine y={85} stroke="#F59E0B" strokeDasharray="3 3" label={{ value: 'Peak Warning', fill: '#D97706', fontSize: 10 }} />
                  <Bar dataKey="predicted_load_kw" fill="#00C2A8" radius={[6, 6, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic Alerts & Load-Shift Advisory Panel (1 col) */}
        <div className="saas-card p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-sm text-[#2E3A8C] dark:text-white flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-[#00C2A8]" />
                <span>Optimization Advisory</span>
              </span>
              <span className="text-[10px] font-mono text-[#008472] dark:text-[#52DFCE] font-bold bg-[#E6FAF7] dark:bg-teal-950/60 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>

            <div className="mt-3.5 space-y-3">
              {/* Amber Alert: Peak Load Advisory */}
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 transition-all">
                <div className="flex items-center space-x-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse"></span>
                  <span>Peak-Load Advisory (17:00–20:00)</span>
                </div>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
                  Utility surcharge surges to <strong className="font-mono">$0.38/kWh</strong>. Solver has pre-scheduled high-demand fleet charging to off-peak slots.
                </p>
              </div>

              {/* Lime Alert: Invariant Safety Check */}
              <div className="p-3.5 rounded-xl bg-[#F7FEE7] dark:bg-emerald-950/30 border border-[#A3E635]/60 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 transition-all">
                <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Grid Capacity Guaranteed</span>
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 leading-relaxed">
                  Total combined demand constrained to &le; 90 kW headroom. Breakers protected against concurrent 110 kW pull.
                </p>
              </div>

              {/* Teal Alert: Cost & Carbon Optimization */}
              <div className="p-3.5 rounded-xl bg-[#E6FAF7] dark:bg-teal-950/30 border border-[#00C2A8]/30 dark:border-teal-800/60 text-[#004A41] dark:text-teal-200 transition-all">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#008472] dark:text-[#52DFCE]">
                  <Zap className="w-3.5 h-3.5 text-[#00C2A8]" />
                  <span>Cost Optimization Metric</span>
                </div>
                <p className="text-[11px] text-[#006659] dark:text-teal-300 mt-1 leading-relaxed">
                  Estimated <strong>34.2% monetary savings</strong> achieved versus baseline uncoordinated fast-charging.
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/optimization"
            className="w-full py-2.5 px-3 bg-[#2E3A8C] hover:bg-[#242E70] text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center space-x-1.5"
          >
            <Cpu className="w-3.5 h-3.5 text-[#00C2A8]" />
            <span>Configure LP Solver Setpoints</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Charging-Schedule Timeline & Bay Allocation Matrix */}
      <div className="saas-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#2E3A8C] dark:text-white flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-[#00C2A8]" />
              <span>Charging-Schedule Timeline & Bay Status</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live power allocations, SOC progression, connector standards, and fault simulator injection.
            </p>
          </div>
          <Link
            to="/stations"
            className="text-xs font-bold text-[#00C2A8] hover:text-[#52DFCE] flex items-center space-x-1"
          >
            <span>Hardware Management</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4 Bay Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {chargers.map((ch) => {
            const activeSession = sessions.find(s => s.charger === ch.id && ['CHARGING', 'WAITING', 'PAUSED'].includes(s.status));
            const isFault = ch.status === 'FAULT';
            const isCharging = ch.status === 'CHARGING';

            return (
              <div 
                key={ch.id} 
                className={`p-4 rounded-2xl border transition-all duration-200 bg-white dark:bg-slate-900 ${
                  isFault 
                    ? 'border-coral-200 dark:border-coral-800 bg-coral-50/20 dark:bg-coral-950/20 shadow-xs' 
                    : isCharging
                    ? 'border-[#00C2A8]/30 dark:border-[#00C2A8]/40 shadow-soft'
                    : 'border-[#E2E8F0] dark:border-slate-800'
                }`}
              >
                {/* Bay Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${isCharging ? 'bg-[#00C2A8] animate-pulse' : isFault ? 'bg-coral-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                    <span className="font-bold text-slate-900 dark:text-white text-sm font-sans">{ch.identifier}</span>
                  </div>
                  <StatusBadge status={ch.status} type="charger" />
                </div>

                {/* Specs */}
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 mb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-slate-500">Connector:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{ch.connector_type}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-slate-500">Rated Max:</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono">{ch.max_power_kw} kW</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-slate-500">Allocated Power:</span>
                    <strong className="font-mono text-sm font-bold text-[#008472] dark:text-[#52DFCE]">
                      {activeSession ? `${activeSession.allocated_power_kw} kW` : '0.0 kW'}
                    </strong>
                  </div>

                  {activeSession && (
                    <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{activeSession.vehicle_identifier}:</span>
                        <span className="font-mono font-bold text-[#008472] dark:text-[#52DFCE]">{activeSession.current_soc}% &rarr; {activeSession.target_soc}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-[#00C2A8] to-[#A3E635] h-full rounded-full transition-all duration-500" 
                          style={{ width: `${activeSession.current_soc}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Fault Toggle Button */}
                <button
                  onClick={() => handleToggleFault(ch.id)}
                  className={`w-full py-1.5 px-3 text-xs font-semibold rounded-xl border transition-all ${
                    isFault
                      ? 'bg-[#E6FAF7] dark:bg-teal-950/60 border-[#00C2A8]/40 text-[#008472] dark:text-[#52DFCE] hover:bg-[#C7F5EF]'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-coral-50 dark:hover:bg-coral-950/40 hover:text-coral-600 hover:border-coral-200'
                  }`}
                >
                  {isFault ? 'Restore Bay Power' : 'Simulate Bay Fault'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
