import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Zap, ShieldCheck } from 'lucide-react';

export const DashboardLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDataRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] dark:bg-[#0B0F19] energy-grid-bg transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className={`
        flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out
        ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}
      `}>
        <Navbar 
          onMobileToggle={() => setIsMobileOpen(!isMobileOpen)} 
          onDataChange={handleDataRefresh}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* Live Grid Invariant Mini-Ticker */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs border-b border-[#E2E8F0] dark:border-slate-800 px-4 sm:px-6 py-2 text-xs flex items-center justify-between shadow-2xs transition-colors">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A3E635] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#A3E635]"></span>
            </span>
            <span className="font-semibold text-[#2E3A8C] dark:text-indigo-200">Autonomous Power Dispatch</span>
            <span className="hidden md:inline text-slate-400 dark:text-slate-500">— Real-time LP Solver keeping total station load &le; 100 kW ceiling</span>
          </div>

          <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span>Transformer Headroom: <strong className="text-[#008472] dark:text-[#52DFCE] font-bold">90.0 kW</strong></span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span>Non-EV Base: <strong className="text-slate-700 dark:text-slate-300 font-bold">10.0 kW</strong></span>
          </div>
        </div>

        {/* Page Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-up">
          <Outlet context={{ refreshTrigger, onDataChange: handleDataRefresh }} />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
