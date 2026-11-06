import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Zap, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  BatteryCharging, 
  Sparkles,
  ArrowLeft,
  Calendar,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

export const UserLoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState(() => localStorage.getItem('smartev_remembered_user') || 'user@smartev.io');
  const [password, setPassword] = useState('user123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Registration fields (Creates ONLY User role securely on backend)
  const [username, setUsername] = useState('jordan_fleet');
  const [firstName, setFirstName] = useState('Jordan');
  const [lastName, setLastName] = useState('Taylor');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const validate = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(email.trim()) && !email.includes('user')) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (isRegister && !username.trim()) {
      errors.username = 'Username is required.';
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
      if (isRegister) {
        const res = await register({
          username: username.trim(),
          email: email.trim(),
          password,
          first_name: firstName.trim(),
          last_name: lastName.trim()
        });
        if (res.success) {
          setSuccessMsg('Account created successfully! Redirecting to charging portal...');
          setTimeout(() => navigate(from, { replace: true }), 800);
        } else {
          setError(res.error);
        }
      } else {
        const res = await login(email.trim(), password, 'USER', rememberMe);
        if (res.success) {
          setSuccessMsg('Signed in! Opening driver charging telemetry...');
          setTimeout(() => navigate(from, { replace: true }), 700);
        } else {
          setError(res.error);
        }
      }
    } catch (err) {
      setError('An unexpected network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setIsRegister(false);
    setEmail('user@smartev.io');
    setPassword('user123');
    setError(null);
    setFieldErrors({});
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] dark:bg-[#0B0F19] flex flex-col lg:flex-row selection:bg-[#00C2A8] selection:text-white transition-colors duration-200">
      
      {/* Floating Theme Toggle (Top Right) */}
      <div className="absolute top-5 right-5 z-50">
        <ThemeToggle />
      </div>

      {/* LEFT SECTION: User / Driver Focused Hero */}
      <div className="relative w-full lg:w-[48%] xl:w-[50%] bg-[#0B0F19] text-white flex flex-col justify-between p-8 sm:p-12 lg:p-14 overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,194,168,0.20)_0%,transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(46,58,140,0.30)_0%,transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center space-x-3.5 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#00C2A8] to-[#A3E635] flex items-center justify-center shadow-teal-glow">
              <User className="w-6 h-6 text-white" strokeWidth={2.4} />
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
          </div>
        </div>

        <div className="relative z-10 my-8 lg:my-auto space-y-6 max-w-lg">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-950/70 border border-[#00C2A8]/30 text-[#52DFCE] text-xs font-bold mb-3 shadow-teal-glow">
              <Sparkles className="w-3.5 h-3.5 text-[#00C2A8]" />
              <span>Real-Time Battery Telemetry & Departure Schedules</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight font-sans">
              Charge Smarter. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C2A8] via-[#52DFCE] to-[#A3E635]">
                Drive Further.
              </span> <br />
              Zero Peak Anxiety.
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-slate-400 font-body leading-relaxed">
              Track your vehicle's charging state, monitor power delivery in real time, and ensure departure targets are reached on time.
            </p>
          </div>

          {/* User Session Preview Card */}
          <div className="relative p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs">
              <span className="flex items-center space-x-2 text-slate-300 font-bold font-mono">
                <BatteryCharging className="w-4 h-4 text-[#00C2A8]" />
                <span>My Active Vehicle: EV-TESLA-01</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-950/60 text-[#52DFCE] border border-[#00C2A8]/30 font-mono">
                Assigned: BAY-01 (CCS2)
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Current Charge:</span>
                <span className="font-mono font-bold text-[#A3E635]">25% &rarr; 85% Target</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-[#00C2A8] to-[#A3E635] h-2 rounded-full" style={{ width: '68%' }} />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-1">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Departure: 18:30 (In 2.5h)</span>
                </span>
                <span className="text-teal-400 font-bold">Charging at 22.0 kW</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-4 border-t border-slate-800/70 flex items-center justify-between text-xs text-slate-500">
          <span>Role: EV Fleet Driver</span>
          <span>User Portal v2.0</span>
        </div>
      </div>

      {/* RIGHT SECTION: User Login & Registration Form */}
      <div className="w-full lg:w-[52%] xl:w-[50%] flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          
          <div className="text-left">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-teal-50 dark:bg-teal-950/60 text-[#008472] dark:text-[#52DFCE] border border-[#00C2A8]/30 font-mono inline-block mb-2">
              Secure Sign In
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2E3A8C] dark:text-white tracking-tight font-sans">
              {isRegister ? 'Create User Account' : 'Welcome'}
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-body">
              {isRegister 
                ? 'Register to monitor vehicle charging and review your energy history.' 
                : 'Sign in to access your personal EV charging dashboard.'}
            </p>
          </div>

          {/* Demo User Pill */}
          {!isRegister && (
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-slate-900/90 border border-indigo-200/80 dark:border-indigo-800/50 flex items-center justify-between shadow-2xs">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Demo User Credentials</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">user@smartev.io &bull; user123</p>
              </div>
              <button
                type="button"
                onClick={handleDemoFill}
                className="px-3 py-1 text-xs font-bold text-white bg-[#2E3A8C] dark:bg-[#00C2A8] hover:bg-[#242E70] rounded-xl shadow-soft transition-all active:scale-95"
              >
                Auto-Fill
              </button>
            </div>
          )}

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
              
              {isRegister && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Jordan"
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#00C2A8] focus:outline-none dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Taylor"
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
                      placeholder="driver_jordan"
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#00C2A8] focus:outline-none dark:text-white font-mono"
                    />
                    {fieldErrors.username && (
                      <p className="mt-1 text-[11px] text-coral-600 dark:text-coral-400">{fieldErrors.username}</p>
                    )}
                  </div>
                </div>
              )}

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
                    placeholder="user@smartev.io"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#00C2A8] focus:outline-none text-slate-900 dark:text-white font-medium transition-all"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-1 text-[11px] text-coral-600 dark:text-coral-400 font-medium">{fieldErrors.email}</p>
                )}
              </div>

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
                        alert('Password reset instructions have been dispatched to your email.');
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

              {!isRegister && (
                <div className="flex items-center pt-1">
                  <label className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-[#00C2A8] focus:ring-[#00C2A8] border-slate-300 dark:border-slate-600 dark:bg-slate-800 cursor-pointer"
                    />
                    <span>Remember my driver profile</span>
                  </label>
                </div>
              )}

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
                    <span>Authenticating User...</span>
                  </>
                ) : (
                  <>
                    <span>{isRegister ? 'Create User Account' : 'Sign In as User'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isRegister ? 'Already registered?' : "Don't have an account?"}{' '}
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

          <div className="text-center">
            <span className="text-[11px] text-slate-400 font-mono">
              Smart-EV Energy Management &bull; Fleet Operations
            </span>
          </div>

        </div>
      </div>

    </div>
  );
};

export default UserLoginPage;

