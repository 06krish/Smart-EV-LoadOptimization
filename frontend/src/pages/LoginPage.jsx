import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Zap, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Activity, 
  BatteryCharging, 
  Cpu,
  Sparkles,
  TrendingDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

export const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState(() => localStorage.getItem('smartev_remembered_email') || 'operator@smartev.io');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register fields
  const [username, setUsername] = useState('operator_alex');
  const [firstName, setFirstName] = useState('Alex');
  const [lastName, setLastName] = useState('Morgan');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  // Client-side validation
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(email.trim()) && !email.includes('operator')) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (isRegister) {
      if (!username.trim()) {
        errors.username = 'Username is required.';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isRegister) {
        const res = await register({
          username: username.trim(),
          email: email.trim(),
          password,
          first_name: firstName.trim(),
          last_name: lastName.trim()
        });
        if (res.success) {
          setSuccessMsg('Account created successfully! Redirecting to dashboard...');
          setTimeout(() => navigate(from, { replace: true }), 900);
        } else {
          setError(res.error);
        }
      } else {
        const res = await login(email.trim(), password, rememberMe);
        if (res.success) {
          setSuccessMsg('Authentication successful! Initializing dispatch console...');
          setTimeout(() => navigate(from, { replace: true }), 700);
        } else {
          setError(res.error);
        }
      }
    } catch (err) {
      setError('An unexpected network error occurred. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setIsRegister(false);
    setEmail('operator@smartev.io');
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

      {/* ========================================================================= */}
      {/* LEFT SECTION: Energy-Tech Visual Hero, EV Charging Grid Illustration     */}
      {/* ========================================================================= */}
      <div className="relative w-full lg:w-[48%] xl:w-[50%] bg-[#0B0F19] text-white flex flex-col justify-between p-8 sm:p-12 lg:p-14 overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
        
        {/* Subtle Background Radial Mesh & Grid lines */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,194,168,0.22)_0%,transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(46,58,140,0.35)_0%,transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center space-x-3.5">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#2E3A8C] to-[#00C2A8] flex items-center justify-center shadow-teal-glow group-hover:scale-105 transition-all">
              <Zap className="w-6 h-6 text-white" strokeWidth={2.4} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white font-sans">Smart-EV</span>
                <span className="font-extrabold text-xl tracking-tight text-[#00C2A8] font-sans">LoadOptimization</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block">
                Autonomous Energy Management OS
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Mission Tagline & Bespoke EV Grid Illustration */}
        <div className="relative z-10 my-8 lg:my-auto space-y-6 max-w-lg">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-950/70 border border-[#00C2A8]/30 text-[#52DFCE] text-xs font-bold mb-3 shadow-teal-glow">
              <Sparkles className="w-3.5 h-3.5 text-[#00C2A8]" />
              <span>Real-Time LP Solver & Dynamic Power Dispatch</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight font-sans">
              Intelligent Charging. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C2A8] via-[#52DFCE] to-[#A3E635]">
                Smarter Energy.
              </span> <br />
              Sustainable Future.
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-slate-400 font-body leading-relaxed">
              Dynamically coordinate fleet demand, shave transformer peak surges, and reduce electricity costs while ensuring every vehicle meets its departure deadline.
            </p>
          </div>

          {/* Bespoke Scalable EV Charging Hub & Grid Schematic SVG */}
          <div className="relative p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs">
              <span className="flex items-center space-x-2 text-slate-300 font-bold font-mono">
                <Activity className="w-4 h-4 text-[#00C2A8] animate-pulse" />
                <span>Metro Central Hub Telemetry</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-950/60 text-[#52DFCE] border border-[#00C2A8]/30 font-mono">
                Grid: 100 kW Ceiling
              </span>
            </div>

            {/* Micro schematic representing EV charging bays and transformer load */}
            <div className="grid grid-cols-4 gap-2.5 text-center">
              {[
                { bay: 'BAY-01', rate: '22 kW', soc: '78%', status: 'Charging', color: 'text-teal-400', border: 'border-teal-500/40' },
                { bay: 'BAY-02', rate: '18 kW', soc: '45%', status: 'Optimal', color: 'text-lime-400', border: 'border-lime-500/40' },
                { bay: 'BAY-03', rate: '25 kW', soc: '60%', status: 'Charging', color: 'text-teal-400', border: 'border-teal-500/40' },
                { bay: 'BAY-04', rate: '25 kW', soc: '92%', status: 'Tapering', color: 'text-amber-400', border: 'border-amber-500/40' },
              ].map((b, idx) => (
                <div key={idx} className={`p-2.5 rounded-xl bg-slate-950/70 border ${b.border} flex flex-col justify-between`}>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{b.bay}</span>
                    <BatteryCharging className="w-3 h-3 text-[#00C2A8]" />
                  </div>
                  <div className={`text-xs font-bold font-mono my-1 ${b.color}`}>{b.rate}</div>
                  <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#00C2A8] to-[#A3E635] h-1 rounded-full" style={{ width: b.soc }} />
                  </div>
                  <span className="text-[9px] text-slate-500 font-medium mt-1">{b.soc} SOC</span>
                </div>
              ))}
            </div>

            {/* Bottom Key Invariant Pill */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#A3E635]" />
                <span>Total Station Draw: <strong>90.0 kW</strong></span>
              </span>
              <span className="text-[#A3E635] font-bold flex items-center space-x-1">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>31.4% Saved</span>
              </span>
            </div>
          </div>
        </div>

        {/* Footer info on left */}
        <div className="relative z-10 pt-4 border-t border-slate-800/70 flex items-center justify-between text-xs text-slate-500">
          <span>Enterprise Energy OS v2.0</span>
          <span>HighS Simplex LP Solver Active</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT SECTION: Centered SaaS Login Card, Inputs, JWT Auth Handling       */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-[52%] xl:w-[50%] flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          
          {/* Form Header */}
          <div className="text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2E3A8C] dark:text-white tracking-tight font-sans">
              {isRegister ? 'Create Operator Account' : 'Welcome Back'}
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-body">
              {isRegister 
                ? 'Register credentials to access the EV energy dispatch console.' 
                : 'Sign in to manage your EV charging operations.'}
            </p>
          </div>

          {/* Quick Demo Pill Fill */}
          {!isRegister && (
            <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-slate-900/90 border border-teal-200/80 dark:border-teal-800/50 flex items-center justify-between shadow-2xs">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#00C2A8]/15 flex items-center justify-center text-[#008472] dark:text-[#52DFCE]">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Demo Operator Access</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">operator@smartev.io &bull; admin123</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDemoFill}
                className="px-3 py-1 text-xs font-bold text-white bg-[#00C2A8] hover:bg-[#00A38D] rounded-xl shadow-teal-glow transition-all active:scale-95"
              >
                Auto-Fill
              </button>
            </div>
          )}

          {/* Alert: Error Message */}
          {error && (
            <div className="p-3.5 rounded-xl bg-coral-50 dark:bg-coral-950/40 border border-coral-200 dark:border-coral-800 text-coral-700 dark:text-coral-300 text-xs flex items-center space-x-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-coral-600 dark:text-coral-400" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Alert: Success Message */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-xs flex items-center space-x-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#00C2A8]" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {/* Login Card */}
          <div className="saas-card p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-soft">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Registration Extra Fields */}
              {isRegister && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Alex"
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#00C2A8] focus:outline-none dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Morgan"
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#00C2A8] focus:outline-none dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="operator_id"
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#00C2A8] focus:outline-none dark:text-white font-mono"
                    />
                    {fieldErrors.username && (
                      <p className="mt-1 text-[11px] text-coral-600 dark:text-coral-400">{fieldErrors.username}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Email Address Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: null });
                    }}
                    placeholder="operator@smartev.io"
                    className={`w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border ${
                      fieldErrors.email 
                        ? 'border-coral-400 focus:ring-coral-400' 
                        : 'border-slate-200 dark:border-slate-700 focus:ring-[#00C2A8]'
                    } rounded-xl focus:ring-2 focus:outline-none text-slate-900 dark:text-white font-medium transition-all`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-1 text-[11px] text-coral-600 dark:text-coral-400 font-medium">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password Input with Show/Hide Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  {!isRegister && (
                    <a
                      href="#forgot-password"
                      onClick={(e) => {
                        e.preventDefault();
                        alert('Password reset link has been dispatched to your registered email address.');
                      }}
                      className="text-[11px] font-semibold text-[#008472] dark:text-[#52DFCE] hover:underline"
                    >
                      Forgot Password?
                    </a>
                  )}
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
                    className={`w-full pl-10 pr-11 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border ${
                      fieldErrors.password 
                        ? 'border-coral-400 focus:ring-coral-400' 
                        : 'border-slate-200 dark:border-slate-700 focus:ring-[#00C2A8]'
                    } rounded-xl focus:ring-2 focus:outline-none text-slate-900 dark:text-white font-medium transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="mt-1 text-[11px] text-coral-600 dark:text-coral-400 font-medium">{fieldErrors.password}</p>
                )}
              </div>

              {/* Remember Me Checkbox */}
              {!isRegister && (
                <div className="flex items-center pt-1">
                  <label className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-[#00C2A8] focus:ring-[#00C2A8] border-slate-300 dark:border-slate-600 dark:bg-slate-800 cursor-pointer"
                    />
                    <span>Remember this device</span>
                  </label>
                </div>
              )}

              {/* Prominent Green / Teal Submit Button with Loading Spinner */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#00C2A8] to-[#00A38D] hover:from-[#00A38D] hover:to-[#008472] text-white text-xs font-extrabold shadow-teal-glow transition-all active:scale-[0.99] disabled:opacity-60 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Authenticating with JWT...</span>
                  </>
                ) : (
                  <>
                    <span>{isRegister ? 'Complete Registration' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle Between Login & Create Account */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isRegister ? 'Already have an operator account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError(null);
                    setSuccessMsg(null);
                    setFieldErrors({});
                  }}
                  className="font-bold text-[#008472] dark:text-[#52DFCE] hover:underline transition-colors"
                >
                  {isRegister ? 'Sign In' : 'Create Account'}
                </button>
              </p>
            </div>
          </div>

          {/* Security & Invariant Note */}
          <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00C2A8]" />
            <span>Encrypted with SHA-256 Django Password Hasher & JWT Bearer</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
