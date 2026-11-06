import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login-select" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] flex items-center justify-center p-6 text-center">
        <div className="saas-card p-8 max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-coral-100 dark:bg-coral-950/60 text-coral-600 dark:text-coral-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Admin Access Restricted</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            This module requires System Administrator or Grid Operator privileges. Your current role is EV Fleet User.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-5 py-2.5 rounded-xl bg-[#00C2A8] text-white text-xs font-bold shadow-teal-glow transition-all"
          >
            Back to User Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
