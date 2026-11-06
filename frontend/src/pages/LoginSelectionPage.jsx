import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  ShieldCheck, 
  User, 
  Settings, 
  ArrowRight, 
  Activity, 
  BatteryCharging, 
  Sliders, 
  Lock,
  Sparkles
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export const LoginSelectionPage = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] energy-grid-bg flex flex-col justify-between selection:bg-[#00C2A8] selection:text-white transition-colors duration-200">
      
      {/* Floating Theme Toggle (Top Right) */}
      <div className="absolute top-5 right-5 z-50">
        <ThemeToggle />
      </div>

      {/* Top Brand Bar */}
      <header className="px-6 py-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2E3A8C] to-[#00C2A8] flex items-center justify-center shadow-teal-glow">
            <Zap className="w-5 h-5 text-white" strokeWidth={2.4} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight text-[#2E3A8C] dark:text-white font-sans">Smart-EV</span>
              <span className="font-extrabold text-lg tracking-tight text-[#00C2A8] font-sans">LoadOptimization</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block">
              Autonomous Energy Management OS
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area: Centered Selection Cards */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12 w-full text-center space-y-10">
        
        {/* Welcome Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-[#00C2A8]/30 text-[#008472] dark:text-[#52DFCE] text-xs font-bold shadow-teal-glow">
            <Sparkles className="w-3.5 h-3.5 text-[#00C2A8]" />
            <span>Multi-Portal Role-Based Authentication</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2E3A8C] dark:text-white tracking-tight font-sans">
            Welcome to Smart EV Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Choose your login type to continue.
          </p>
        </div>

        {/* Two Interactive Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-left max-w-3xl mx-auto">
          
          {/* Card 1: Admin Login */}
          <div className="saas-card p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#00C2A8] dark:hover:border-[#00C2A8] shadow-soft hover:shadow-soft-hover transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-[#00C2A8] flex items-center justify-center border border-teal-200/60 dark:border-teal-800/60 shadow-teal-glow group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-7 h-7" strokeWidth={2.2} />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-[#2E3A8C] dark:text-white font-sans flex items-center space-x-2">
                  <span>Admin Login</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#E6FAF7] dark:bg-teal-950/60 text-[#008472] dark:text-[#52DFCE] border border-[#00C2A8]/30">
                    Operator
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Manage charging stations, EVs, grid capacity, users, and system operations.
                </p>
              </div>

              {/* Feature Checklist */}
              <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00C2A8]" />
                  <span>Execute LP solver & transformer setpoints</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00C2A8]" />
                  <span>Configure 100 kW grid & tariff tiers</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00C2A8]" />
                  <span>Hardware bay fault injection & audit CSV</span>
                </li>
              </ul>
            </div>

            <Link
              to="/login/admin"
              className="mt-6 w-full py-3 px-4 rounded-xl bg-[#2E3A8C] hover:bg-[#242E70] dark:bg-[#00C2A8] dark:hover:bg-[#00A38D] text-white text-xs font-bold shadow-soft transition-all active:scale-[0.98] flex items-center justify-center space-x-2 group-hover:shadow-teal-glow"
            >
              <span>Login as Admin</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2: User Login */}
          <div className="saas-card p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#00C2A8] dark:hover:border-[#00C2A8] shadow-soft hover:shadow-soft-hover transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-[#2E3A8C] dark:text-indigo-300 flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/60 group-hover:scale-105 transition-transform">
                <User className="w-7 h-7" strokeWidth={2.2} />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-[#2E3A8C] dark:text-white font-sans flex items-center space-x-2">
                  <span>User Login</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    Fleet Driver
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Monitor EV charging, view charging schedules, and track energy consumption.
                </p>
              </div>

              {/* Feature Checklist */}
              <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00C2A8]" />
                  <span>Track battery SOC progression live</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00C2A8]" />
                  <span>View assigned charger bays & power rates</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00C2A8]" />
                  <span>Check departure readiness & energy delivered</span>
                </li>
              </ul>
            </div>

            <Link
              to="/login/user"
              className="mt-6 w-full py-3 px-4 rounded-xl bg-[#00C2A8] hover:bg-[#00A38D] text-white text-xs font-bold shadow-teal-glow transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              <span>Login as User</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="px-6 py-6 text-center text-xs text-slate-400">
        <p>Smart-EV LoadOptimization &bull; Enterprise Energy Management System</p>
      </footer>

    </div>
  );
};

export default LoginSelectionPage;

