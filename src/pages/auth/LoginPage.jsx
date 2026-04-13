// src/pages/auth/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Loader2, User, Lock, AlertCircle } from 'lucide-react';

const ROLE_REDIRECT = {
  DOCTOR:  '/doctor/dashboard',
  PATIENT: '/patient/dashboard',
};

const LoginPage = () => {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();

  const [form, setForm]       = useState({ username: '', password: '' });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) => {
    setError('');
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const role = await login({ username: form.username, password: form.password });
      const from = location.state?.from?.pathname ?? ROLE_REDIRECT[role] ?? '/';
      navigate(from, { replace: true });
    } catch (err) {
      const detail =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        'اسم المستخدم أو كلمة المرور غير صحيحة.';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl">
      {/* Heading */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
          أهلاً بعودتك 👋
        </h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm">
          سجّل دخولك للوصول إلى حسابك في BioCode
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
            اسم المستخدم
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
              <User className="w-4 h-4 text-gray-400" />
            </div>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              disabled={loading}
              value={form.username}
              onChange={handleChange}
              placeholder="your_username"
              className="block w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 ps-10 pe-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-slate-300">
              كلمة المرور
            </label>
            <Link to="/password-reset" className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
              نسيت كلمة المرور؟
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
              <Lock className="w-4 h-4 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              required
              disabled={loading}
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="block w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 ps-10 pe-10 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPw((p) => !p)}
              className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !form.username || !form.password}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          style={{background: 'linear-gradient(135deg, #2563eb 0%, #0891b2 100%)'}}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'جاري تسجيل الدخول…' : 'تسجيل الدخول'}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-7">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-100 dark:border-slate-800" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white dark:bg-slate-950 px-3 text-xs text-gray-400">أو</span>
        </div>
      </div>

      {/* Footer link */}
      <p className="text-center text-sm text-gray-500 dark:text-slate-400">
        لا تملك حساباً؟{' '}
        <Link to="/register" className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
          أنشئ حسابك مجاناً
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
