import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MapPin, 
  Zap, 
  Car, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  Layers,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

export const Sidebar = ({ isCollapsed, onToggleCollapse, isMobileOpen, onMobileClose }) => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/forecasting', label: 'Load Map', icon: TrendingUp },
    { to: '/optimization', label: 'Charging Sessions', icon: Zap, badge: 'Smart' },
    { to: '/vehicles', label: 'Fleet', icon: Car },
    { to: '/stations', label: 'Stations', icon: Layers },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 bg-white dark:bg-slate-900 border-r border-[#E2E8F0] dark:border-slate-800 shadow-soft
        flex flex-col transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2E3A8C] to-[#00C2A8] flex items-center justify-center shadow-teal-glow shrink-0 transition-transform hover:scale-105">
              <Zap className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="flex items-center space-x-1">
                  <span className="font-extrabold text-[#2E3A8C] dark:text-white text-base tracking-tight font-sans">SmartEV</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00C2A8] animate-pulse"></span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wider uppercase block -mt-0.5 font-mono">
                  Load Optimization
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-[#2E3A8C] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto custom-scrollbar">
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase font-mono">
              Energy Platform
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onMobileClose}
                className={({ isActive }) => `
                  group relative flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${isActive 
                    ? 'bg-[#E6FAF7] dark:bg-teal-950/40 text-[#008472] dark:text-[#52DFCE] font-semibold shadow-xs' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-[#2E3A8C] dark:hover:text-white'}
                  ${isCollapsed ? 'justify-center' : 'justify-between'}
                `}
                title={isCollapsed ? item.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center space-x-3">
                      <Icon 
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-[#00C2A8]' : 'text-slate-400 group-hover:text-[#2E3A8C] dark:group-hover:text-white'
                        }`} 
                        strokeWidth={1.75}
                      />
                      {!isCollapsed && <span>{item.label}</span>}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#A3E635]/20 text-emerald-800 dark:text-emerald-300 border border-[#A3E635]/40 font-mono">
                        {item.badge}
                      </span>
                    )}

                    {/* Active Left Indicator Bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#00C2A8]" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Quick Portal Switcher */}
        <div className="p-3 border-t border-[#E2E8F0] dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/80 transition-colors">
          <NavLink
            to="/"
            onClick={onMobileClose}
            className={`flex items-center rounded-xl px-3 py-2 text-xs font-semibold text-[#2E3A8C] dark:text-indigo-200 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xs transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 ${
              isCollapsed ? 'justify-center' : 'justify-between'
            }`}
            title="Open Landing Page"
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-[#00C2A8]" />
              {!isCollapsed && <span>Public Portal</span>}
            </div>
            {!isCollapsed && <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />}
          </NavLink>

          {/* Transformer Health Pill */}
          {!isCollapsed && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 shadow-2xs">
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Grid Ceiling</span>
                <span className="font-mono text-[#008472] dark:text-[#52DFCE] font-bold">100 kW</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[#00C2A8] to-[#A3E635] h-full rounded-full transition-all duration-500"
                  style={{ width: '65%' }}
                />
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
