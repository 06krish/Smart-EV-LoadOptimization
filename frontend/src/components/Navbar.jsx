import React, { useState } from 'react';
import { 
  Menu, 
  Play, 
  RotateCcw, 
  Bell, 
  ChevronDown, 
  MapPin, 
  Zap, 
  CheckCircle2, 
  AlertTriangle,
  User,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { SmartEVApi } from '../services/api';
import ThemeToggle from './ThemeToggle';

export const Navbar = ({ onMobileToggle, onDataChange, isSidebarCollapsed }) => {
  const [selectedSite, setSelectedSite] = useState('Metro Central EV Hub');
  const [loadingAction, setLoadingAction] = useState(null);
  const [toast, setToast] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleTick = async (minutes) => {
    try {
      setLoadingAction('tick');
      const res = await SmartEVApi.simulatorTick(minutes);
      setToast({
        type: 'success',
        text: `Simulated +${minutes}m: Dispatched ${res.data.total_delivered_kwh} kWh safely.`
      });
      if (onDataChange) onDataChange();
    } catch (err) {
      setToast({ type: 'error', text: 'Simulation tick failed.' });
    } finally {
      setLoadingAction(null);
      setTimeout(() => setToast(null), 3500);
    }
  };

  const handleResetDemo = async () => {
    if (!window.confirm('Reset station to Master Plan Demo? (4 EVs arriving with 110 kW demand on 100 kW grid ceiling)')) return;
    try {
      setLoadingAction('reset');
      const res = await SmartEVApi.simulatorReset();
      setToast({ type: 'success', text: res.data.message });
      if (onDataChange) onDataChange();
    } catch (err) {
      setToast({ type: 'error', text: 'Reset failed.' });
    } finally {
      setLoadingAction(null);
      setTimeout(() => setToast(null), 3500);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-[#E2E8F0] dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between shadow-soft transition-colors duration-200">
      {/* Left: Mobile hamburger & Site Selector */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button
          onClick={onMobileToggle}
          className="p-2 -ml-2 text-slate-500 hover:text-[#2E3A8C] dark:text-slate-400 dark:hover:text-[#00C2A8] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl lg:hidden transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Site Selector Dropdown */}
        <div className="relative group">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-750 hover:border-[#2E3A8C]/30 dark:hover:border-[#00C2A8]/40 cursor-pointer transition-all shadow-2xs">
            <div className="w-2 h-2 rounded-full bg-[#00C2A8] animate-pulse"></div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-[#2E3A8C] dark:text-indigo-200 flex items-center space-x-1 tracking-tight">
                <span>{selectedSite}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#2E3A8C] dark:group-hover:text-[#00C2A8] transition-colors" />
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono -mt-0.5">Capacity: 100 kW Max</span>
            </div>
          </div>
        </div>

        {/* Live Status Pill */}
        <div className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#E6FAF7] dark:bg-teal-950/50 border border-[#00C2A8]/30 text-[#008472] dark:text-[#52DFCE] text-xs font-semibold shadow-teal-glow">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C2A8] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C2A8]"></span>
          </span>
          <span className="tracking-tight">Grid: Optimal</span>
        </div>
      </div>

      {/* Center: Toast Message */}
      {toast && (
        <div className={`hidden md:flex items-center space-x-2 text-xs font-semibold px-3.5 py-1.5 rounded-full border shadow-xs animate-fade-up ${
          toast.type === 'success' 
            ? 'bg-[#F7FEE7] dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-[#A3E635] dark:border-emerald-700' 
            : 'bg-coral-50 dark:bg-coral-950/60 text-coral-600 dark:text-coral-300 border-coral-200 dark:border-coral-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-coral-500" />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Right: Simulator Buttons + ThemeToggle + Notifications + Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Simulator controls */}
        <div className="hidden md:flex items-center space-x-1 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl border border-[#E2E8F0] dark:border-slate-700">
          <button
            onClick={() => handleTick(15)}
            disabled={loadingAction !== null}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:text-[#00C2A8] dark:hover:text-[#52DFCE] hover:shadow-xs rounded-lg border border-slate-200/80 dark:border-slate-600 transition-all disabled:opacity-50"
            title="Advance simulated time by 15 minutes"
          >
            <Play className={`w-3.5 h-3.5 text-[#00C2A8] ${loadingAction === 'tick' ? 'animate-spin' : ''}`} />
            <span>+15m Tick</span>
          </button>
          <button
            onClick={handleResetDemo}
            disabled={loadingAction !== null}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-[#2E3A8C] dark:hover:text-white rounded-lg transition-colors disabled:opacity-50"
            title="Reset to 110 kW demand on 100 kW grid"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loadingAction === 'reset' ? 'animate-spin' : ''}`} />
            <span>Reset Demo</span>
          </button>
        </div>

        {/* Light / Dark Mode Toggle */}
        <ThemeToggle />

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-[#2E3A8C] dark:hover:text-[#00C2A8] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            title="Notifications"
          >
            <Bell className="w-4 h-4" strokeWidth={1.75} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00C2A8] ring-2 ring-white dark:ring-slate-900"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-soft-hover border border-[#E2E8F0] dark:border-slate-700 p-4 text-xs z-50 animate-fade-up">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-[#2E3A8C] dark:text-indigo-200">Grid Notifications</span>
                <span className="text-[10px] text-[#00C2A8] font-bold">2 Active</span>
              </div>
              <div className="mt-3 space-y-2.5">
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200">
                  <div className="font-bold flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span>Peak Tariff Approaching</span>
                  </div>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                    17:00–20:00 rate: $0.38/kWh. Load pre-shifting active.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-teal-900 dark:text-teal-200">
                  <div className="font-bold flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                    <span>Optimization Applied</span>
                  </div>
                  <p className="text-[11px] text-teal-700 dark:text-teal-300 mt-0.5">
                    LP Solver redistributed 4 bays safely under 100 kW ceiling.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-700">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2E3A8C] to-[#00C2A8] flex items-center justify-center text-white font-bold text-xs shadow-xs">
            OP
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-bold text-[#2E3A8C] dark:text-white leading-none">Alex Morgan</span>
            <span className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">Grid Operator</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
