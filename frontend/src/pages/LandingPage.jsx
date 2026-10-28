import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  TrendingDown, 
  ShieldCheck, 
  Clock, 
  BarChart, 
  ArrowRight, 
  Cpu, 
  CheckCircle, 
  Layers, 
  AlertTriangle,
  Activity,
  BatteryCharging,
  Sparkles
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] energy-grid-bg flex flex-col selection:bg-[#00C2A8] selection:text-white transition-colors duration-200">
      {/* Top Navbar */}
      <nav className="h-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-[#E2E8F0] dark:border-slate-800 sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2E3A8C] to-[#00C2A8] flex items-center justify-center shadow-teal-glow">
              <Zap className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <span className="font-extrabold text-[#2E3A8C] dark:text-white text-lg tracking-tight">Smart-EV</span>
              <span className="text-[#00C2A8] font-extrabold text-lg tracking-tight"> LoadOptimization</span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] uppercase font-bold rounded-full bg-[#E6FAF7] dark:bg-teal-950/60 text-[#008472] dark:text-[#52DFCE] border border-[#00C2A8]/30 font-mono">
                Enterprise Energy OS
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#2E3A8C] hover:bg-[#242E70] dark:bg-[#00C2A8] dark:hover:bg-[#00A38D] text-white text-xs font-bold shadow-soft transition-all hover:scale-[1.02]"
            >
              <span>Launch Operations Dashboard</span>
              <ArrowRight className="w-4 h-4 text-[#00C2A8] dark:text-white" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#E6FAF7] dark:bg-teal-950/60 border border-[#00C2A8]/30 text-[#008472] dark:text-[#52DFCE] text-xs font-bold mb-6 shadow-teal-glow">
              <Sparkles className="w-3.5 h-3.5 text-[#00C2A8]" />
              <span>Real-Time Mathematical Optimization & Load Forecasting</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#2E3A8C] dark:text-white tracking-tight leading-[1.15]">
              Intelligent EV Charging That Never Trips The Grid.
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-body">
              Charging stations face fixed grid transformer limits. When multiple high-power EVs arrive simultaneously, 
              uncoordinated demand causes breaker overloads. Smart-EV continuously computes 
              <span className="font-bold text-[#2E3A8C] dark:text-indigo-200"> who gets how much power right now</span>, 
              shaving peak surcharge costs and guaranteeing physical transformer safety.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl bg-[#00C2A8] hover:bg-[#00A38D] text-white text-sm font-bold shadow-teal-glow transition-all hover:-translate-y-0.5 active:scale-95"
              >
                <span>Open Operations Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/optimization"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-[#2E3A8C] dark:text-white text-sm font-bold border border-[#E2E8F0] dark:border-slate-800 shadow-soft transition-all"
              >
                <Cpu className="w-4 h-4 text-[#00C2A8]" />
                <span>Explore Solver Engine</span>
              </Link>
            </div>
          </div>

          {/* Interactive Worked Example Highlight */}
          <div className="mt-16 max-w-4xl mx-auto saas-card p-6 sm:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-mono font-bold text-[#008472] dark:text-[#52DFCE]">The Real-World Problem</span>
                <h3 className="text-xl font-bold text-[#2E3A8C] dark:text-white mt-1">110 kW Uncoordinated Demand vs 100 kW Grid Limit</h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-coral-50 dark:bg-coral-950/60 text-coral-600 dark:text-coral-300 border border-coral-200 dark:border-coral-800">
                Grid Overload: +20 kW Over Available Headroom
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              <div className="p-5 rounded-2xl bg-coral-50/40 dark:bg-coral-950/20 border border-coral-100 dark:border-coral-900/60">
                <div className="flex items-center space-x-2 text-coral-700 dark:text-coral-400 font-bold text-sm mb-3">
                  <AlertTriangle className="w-4 h-4 text-coral-500" />
                  <span>Naive First-Come-First-Served Charging</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-start space-x-2">
                    <span className="text-coral-500 font-bold">•</span>
                    <span>All 4 EVs pull maximum rated power simultaneously (110 kW demand).</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-coral-500 font-bold">•</span>
                    <span>Facility base load (10 kW) pushes total station load to 120 kW &gt; 100 kW limit.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-coral-500 font-bold">•</span>
                    <span>Main breaker trips or utility imposes heavy demand charge penalties ($15/kW).</span>
                  </li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-[#E6FAF7]/60 dark:bg-teal-950/30 border border-[#00C2A8]/30 dark:border-teal-800/60">
                <div className="flex items-center space-x-2 text-[#008472] dark:text-[#52DFCE] font-bold text-sm mb-3">
                  <CheckCircle className="w-4 h-4 text-[#00C2A8]" />
                  <span>Smart-EV Mathematical Optimization</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-start space-x-2">
                    <span className="text-[#00C2A8] font-bold">•</span>
                    <span>Stage 1 priority scoring orders vehicles by urgency, remaining SOC, and departure deadlines.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#00C2A8] font-bold">•</span>
                    <span>SciPy HiGHS LP solver strictly caps combined draw to &le; 90 kW headroom.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#00C2A8] font-bold">•</span>
                    <span>Pre-shifts flexible charging to cheap off-peak hours ($0.12/kWh), saving 34.2%.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars Section */}
      <section className="py-20 bg-white dark:bg-slate-900 border-y border-[#E2E8F0] dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-wider font-mono font-bold text-[#008472] dark:text-[#52DFCE]">Core Capabilities</span>
            <h2 className="text-3xl font-extrabold text-[#2E3A8C] dark:text-white mt-2">Engineered For Grid Resilience</h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400 text-sm">
              Four integrated pillars that transform uncoordinated charging chaos into orchestrated power delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="saas-card p-6">
              <div className="w-12 h-12 rounded-xl bg-[#E6FAF7] dark:bg-teal-950/60 text-[#00C2A8] flex items-center justify-center mb-5">
                <BarChart className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#2E3A8C] dark:text-white mb-2">Demand Forecasting</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Autoregressive machine learning models predict diurnal base load and peak EV arrival patterns 24 to 48 hours in advance.
              </p>
            </div>

            <div className="saas-card p-6">
              <div className="w-12 h-12 rounded-xl bg-[#F0F2FA] dark:bg-slate-800 text-[#2E3A8C] dark:text-indigo-300 flex items-center justify-center mb-5">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#2E3A8C] dark:text-white mb-2">3-Stage LP Solver</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Stage 1 multi-factor priority scoring, Stage 2 greedy allocation, and Stage 3 mathematical Linear Programming with SciPy HiGHS.
              </p>
            </div>

            <div className="saas-card p-6">
              <div className="w-12 h-12 rounded-xl bg-[#F7FEE7] dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-5">
                <TrendingDown className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-[#2E3A8C] dark:text-white mb-2">Peak-Load Shaving</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Hard mathematical invariants guarantee transformer load never exceeds declared capacity, eliminating utility demand penalties.
              </p>
            </div>

            <div className="saas-card p-6">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-base font-bold text-[#2E3A8C] dark:text-white mb-2">Dynamic Tariff Savings</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Time-of-Use pricing integration schedules bulk charging during cheap off-peak hours while meeting departure deadlines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-[#141A3E] dark:bg-[#070A14] text-slate-400 py-12 border-t border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#00C2A8] flex items-center justify-center shadow-teal-glow">
              <Zap className="w-4 h-4 text-white" strokeWidth={2} />
            </div>
            <div>
              <span className="font-bold text-white text-sm">Smart-EV-LoadOptimization</span>
              <p className="text-xs text-slate-400">Based on EV Charging Optimization Master Plan</p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-xs text-slate-300 font-mono">
            <span>Light & Dark Mode</span>
            <span>•</span>
            <span>Django 6.1 + DRF</span>
            <span>•</span>
            <span>React + Vite</span>
            <span>•</span>
            <span>SciPy HiGHS LP</span>
          </div>

          <div>
            <Link
              to="/dashboard"
              className="text-xs font-bold text-[#00C2A8] hover:text-[#52DFCE] transition-colors flex items-center space-x-1"
            >
              <span>Enter Operator Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
