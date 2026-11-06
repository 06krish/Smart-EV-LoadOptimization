import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Zap, Lock, User, Mail, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

export const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('operator');
  const [password, setPassword] = useState('admin123');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const res = await register({
          username,
          password,
          email,
          first_name: firstName,
          last_name: lastName
        });
        if (res.success) {
          navigate(from, { replace: true });
        } else {
          setError(res.error);
        }
      } else {
        const res = await login(username, password);
        if (res.success) {
          navigate(from, { replace: true });
        } else {
          setError(res.error);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setIsRegister(false);
    setUsername('operator');
    setPassword('admin123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] energy-grid-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-[#00C2A8] selection:text-white transition-colors duration-200">
      {/* Top right theme toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2E3A8C] to-[#00C2A8] flex items-center justify-center shadow-teal-glow group-hover:scale-105 transition-transform">
              <Zap className="w-6 h-6 text-white" strokeWidth={2.2} />
            </div>
          </Link>
        </div>
        <h2 className="mt-4 text-center text-2xl font-extrabold text-[#2E3A8C] dark:text-white tracking-tight">
          {isRegister ? 'Create an Operator Account' : 'Sign in to Smart-EV'}
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500 dark:text-slate-400">
          Autonomous Load Optimization & Energy Dispatch OS
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="saas-card p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-coral-50 dark:bg-coral-950/40 border border-coral-200 dark:border-coral-800/60 text-coral-700 dark:text-coral-300 text-xs flex items-center space-x-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Alex"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#00C2A8] focus:outline-none dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Morgan"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#00C2A8] focus:outline-none dark:text-white"
                  />
                </div>
              </div>
            )}

            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operator@smartev.io"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#00C2A8] focus:outline-none dark:text-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="operator"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#00C2A8] focus:outline-none dark:text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#00C2A8] focus:outline-none dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-[#00C2A8] hover:bg-[#00A38D] text-white text-xs font-bold shadow-teal-glow transition-all active:scale-[0.98] disabled:opacity-60"
            >
              <span>{loading ? 'Authenticating...' : isRegister ? 'Register & Enter Dashboard' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Fill Pill */}
          {!isRegister && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Demo Operator Access</p>
                <p className="text-[10px] text-slate-500 font-mono">User: operator | Pass: admin123</p>
              </div>
              <button
                type="button"
                onClick={handleDemoFill}
                className="px-2.5 py-1 text-[11px] font-semibold text-[#008472] dark:text-[#52DFCE] bg-[#E6FAF7] dark:bg-teal-950/60 rounded-lg hover:bg-teal-100 transition-colors"
              >
                Auto-Fill
              </button>
            </div>
          )}

          <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-xs font-semibold text-[#2E3A8C] dark:text-indigo-300 hover:underline"
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
