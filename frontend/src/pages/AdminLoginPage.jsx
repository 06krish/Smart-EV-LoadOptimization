import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Zap, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Activity, 
  Cpu, 
  Sparkles,
  TrendingDown,
  BatteryCharging,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

export const AdminLoginPage = () => {
  const [emailOrUsername, setEmailOrUsername] = useState(() => localStorage.getItem('smartev_remembered_admin') || 'admin@smartev.io');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const validate = () => {
    const errors = {};
    if (!emailOrUsername.trim()) {
      errors.credential = 'Admin email or username is required.';
    }
    if (!password) {
      errors.password = 'Password is required.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!validate()) return;
    setLoading(true);

    try {
      const res = await login(emailOrUsername.trim(), password, 'ADMIN', rememberMe);
      if (res.success) {
        setSuccessMsg('Administrator authenticated! Opening Grid Operations Console...');
        setTimeout(() => navigate(from, { replace: true }), 700);
      } else {
        setError(res.error);
      }
    } catch (err) {
      setError('An unexpected network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmailOrUsername('admin@smartev.io');
    setPassword('admin123');
    setError(null);
    setFieldErrors({});
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] dark:bg-[#0B0F19] flex flex-col lg:flex-row selection:bg-[#00C2A8] selection:text-white transition-colors duration-200">
      
      {/* Floating Theme Toggle (Top Right) */}
      <div className="absolute top-5 right-5 z-50">
        <ThemeToggle />
      </div>

      {/* LEFT SECTION: Energy-Tech Visual Hero with Admin Schematics */}
      <div className="relative w-full lg:w-[48%] xl:w-[50%] bg-[#0B0F19] text-white flex flex-col justify-between p-8 sm:p-12 lg:p-14 overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,194,168,0.22)_0%,transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(46,58,140,0.35)_0%,transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="relative z-10">
          <Link to="/login" className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-6 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Portal</span>
          </Link>

          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#2E3A8C] to-[#00C2A8] flex items-center justify-center shadow-teal-glow">
              <ShieldCheck className="w-6 h-6 text-white" strokeWidth={2.4} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white font-sans">Smart-EV</span>
                <span className="font-extrabold text-xl tracking-tight text-[#00C2A8] font-sans">Admin Portal</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block">
                Grid Operator & System Administration Console
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 my-8 lg:my-auto space-y-6 max-w-lg">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-950/70 border border-[#00C2A8]/30 text-[#52DFCE] text-xs font-bold mb-3 shadow-teal-glow">
              <Sparkles className="w-3.5 h-3.5 text-[#00C2A8]" />
              <span>Full Administrative Control & Mathematical Optimization</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight font-sans">
              Intelligent Charging. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C2A8] via-[#52DFCE] to-[#A3E635]">
                Smarter Energy.
              </span> <br />
              Sustainable Future.
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-slate-400 font-body leading-relaxed">
              Supervise 100 kW grid ceilings, execute linear programming dispatch, manage fleet bays, and configure time-of-use tariffs.
            </p>
          </div>

          {/* Micro Schematic Card */}
          <div className="relative p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs">
              <span className="flex items-center space-x-2 text-slate-300 font-bold font-mono">
                <Activity className="w-4 h-4 text-[#00C2A8] animate-pulse" />
                <span>Admin Grid Invariants</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-950/60 text-[#52DFCE] border border-[#00C2A8]/30 font-mono">
                100 kW Transformer Max
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block">Active Ceiling</span>
                <span className="text-sm font-bold text-teal-400 font-mono">100.0 kW</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block">Station Load</span>
                <span className="text-sm font-bold text-lime-400 font-mono">90.0 kW</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block">LP Savings</span>
                <span className="text-sm font-bold text-[#A3E635] font-mono">31.4%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-4 border-t border-slate-800/70 flex items-center justify-between text-xs text-slate-500">
          <span>Role: Grid Administrator</span>
          <span>HiGHS Simplex LP Active</span>
        </div>
      </div>

      {/* RIGHT SECTION: Admin Login Form */}
      <div className="w-full lg:w-[52%] xl:w-[50%] flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          
          <div className="text-left">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-teal-50 dark:bg-teal-950/60 text-[#008472] dark:text-[#52DFCE] border border-[#00C2A8]/30 font-mono inline-block mb-2">
              Operator Access
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2E3A8C] dark:text-white tracking-tight font-sans">
              Admin Login
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-body">
              Sign in with your administrative credentials to manage charging operations.
            </p>
          </div>

          {/* Demo Auto-Fill Pill */}
          <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-slate-900/90 border border-teal-200/80 dark:border-teal-800/50 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Demo Admin Credentials</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">admin@smartev.io &bull; admin123</p>
            </div>
            <button
              type="button"
              onClick={handleDemoFill}
              className="px-3 py-1 text-xs font-bold text-white bg-[#00C2A8] hover:bg-[#00A38D] rounded-xl shadow-teal-glow transition-all active:scale-95"
            >
              Auto-Fill
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-coral-50 dark:bg-coral-950/40 border border-coral-200 dark:border-coral-800 text-coral-700 dark:text-coral-300 text-xs flex items-center space-x-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-coral-600 dark:text-coral-400" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-xs flex items-center space-x-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#00C2A8]" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          <div className="saas-card p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-soft">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Admin Email / Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={emailOrUsername}
                    onChange={(e) => {
                      setEmailOrUsername(e.target.value);
                      if (fieldErrors.credential) setFieldErrors({ ...fieldErrors, credential: null });
                    }}
                    placeholder="admin@smartev.io"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#00C2A8] focus:outline-none text-slate-900 dark:text-white font-medium transition-all"
                  />
                </div>
                {fieldErrors.credential && (
                  <p className="mt-1 text-[11px] text-coral-600 dark:text-coral-400 font-medium">{fieldErrors.credential}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <a
                    href="#forgot-password"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Password recovery notice sent to system administrator.');
                    }}
                    className="text-[11px] font-semibold text-[#008472] dark:text-[#52DFCE] hover:underline"
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: null });
                    }}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#00C2A8] focus:outline-none text-slate-900 dark:text-white font-medium transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="mt-1 text-[11px] text-coral-600 dark:text-coral-400 font-medium">{fieldErrors.password}</p>
                )}
              </div>

              <div className="flex items-center pt-1">
                <label className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#00C2A8] focus:ring-[#00C2A8] border-slate-300 dark:border-slate-600 dark:bg-slate-800 cursor-pointer"
                  />
                  <span>Remember this admin console</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#2E3A8C] to-[#00C2A8] hover:from-[#242E70] hover:to-[#00A38D] text-white text-xs font-extrabold shadow-teal-glow transition-all active:scale-[0.99] disabled:opacity-60 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Verifying Admin Permissions...</span>
                  </>
                ) : (
                  <>
                    <span>Secure Admin Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 font-mono">
                Direct Administrator Terminal &bull; Confidential
              </span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default AdminLoginPage;

