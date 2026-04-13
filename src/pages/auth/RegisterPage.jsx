// src/pages/auth/RegisterPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, CheckCircle2, User, Mail, Lock, Stethoscope, Heart, AlertCircle } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

const ROLES = [
  {
    value: 'PATIENT',
    label: 'مريض',
    labelEn: 'Patient',
    description: 'حجز مواعيد وإدارة صحتك',
    icon: Heart,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    value: 'DOCTOR',
    label: 'طبيب',
    labelEn: 'Doctor',
    description: 'إدارة المواعيد والسجلات الطبية',
    icon: Stethoscope,
    color: 'from-violet-500 to-purple-600',
  },
];

const INITIAL_FORM = {
  username:  '',
  email:     '',
  password:  '',
  password2: '',
  role:      'PATIENT',
};

const RegisterPage = () => {
  const navigate = useNavigate();

  const [form, setForm]         = useState(INITIAL_FORM);
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [errors, setErrors]     = useState({});
  const [topError, setTopError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setTopError('');
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.username.trim())  errs.username  = 'اسم المستخدم مطلوب.';
    if (!form.email.trim())     errs.email     = 'البريد الإلكتروني مطلوب.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'أدخل بريداً إلكترونياً صحيحاً.';
    if (form.password.length < 8) errs.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.';
    if (form.password !== form.password2) errs.password2 = 'كلمتا المرور غير متطابقتين.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTopError('');
    const clientErrors = validate();
    if (Object.keys(clientErrors).length) { setErrors(clientErrors); return; }

    setLoading(true);
    try {
      await axiosInstance.post('/api/users/register/', {
        username:  form.username,
        email:     form.email,
        password:  form.password,
        password2: form.password2,
        role:      form.role,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err) {
      const data = err?.response?.data;
      if (data && typeof data === 'object') {
        const fieldErrors = {};
        let hasFieldError = false;
        ['username', 'email', 'password', 'password2', 'role'].forEach((f) => {
          if (data[f]) { fieldErrors[f] = Array.isArray(data[f]) ? data[f][0] : data[f]; hasFieldError = true; }
        });
        if (hasFieldError) setErrors(fieldErrors);
        else setTopError(data.non_field_errors?.[0] || data.detail || 'فشل إنشاء الحساب. حاول مجدداً.');
      } else {
        setTopError('حدث خطأ غير متوقع. حاول مجدداً.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `block w-full rounded-xl border ${
      errors[field]
        ? 'border-red-400 bg-red-50 dark:bg-red-950/20 dark:border-red-700 focus:ring-red-400/20'
        : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:border-blue-500 focus:ring-blue-500/20'
    } py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 transition-all`;

  const FieldError = ({ field }) =>
    errors[field] ? (
      <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" /> {errors[field]}
      </p>
    ) : null;

  // ─── Success state ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="py-10 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">تم إنشاء الحساب! 🎉</h2>
        <p className="text-gray-500 dark:text-slate-400 text-sm">
          يتم الآن تحويلك لصفحة تسجيل الدخول…
        </p>
      </div>
    );
  }

  return (
    <div dir="rtl">
      {/* Heading */}
      <div className="mb-7 text-center">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
          أنشئ حسابك ✨
        </h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm">
          انضم إلى BioCode وتحكم بصحتك بذكاء
        </p>
      </div>

      {/* Top-level error */}
      {topError && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {topError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">

        {/* Role selector */}
        <div>
          <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">أنا…</p>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map(({ value, label, description, icon: Icon, color }) => {
              const active = form.role === value;
              return (
                <label
                  key={value}
                  className={`relative flex cursor-pointer flex-col gap-2 rounded-2xl border-2 p-4 transition-all duration-200 ${
                    active
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-lg shadow-blue-500/10'
                      : 'border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 hover:border-gray-200 dark:hover:border-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={value}
                    checked={active}
                    onChange={handleChange}
                    disabled={loading}
                    className="sr-only"
                  />
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm`}>
                    <Icon className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <span className={`text-sm font-bold block ${active ? 'text-blue-700 dark:text-blue-400' : 'text-gray-800 dark:text-slate-200'}`}>
                      {label}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-slate-500 leading-snug">{description}</span>
                  </div>
                  {active && (
                    <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 shadow-md">
                      <svg className="h-3 w-3 fill-white" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">اسم المستخدم</label>
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
              <User className="w-4 h-4 text-gray-400" />
            </div>
            <input
              id="username" name="username" type="text" autoComplete="username" required
              disabled={loading} value={form.username} onChange={handleChange}
              placeholder="your_username"
              className={`${inputClass('username')} ps-10 pe-4`}
            />
          </div>
          <FieldError field="username" />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">البريد الإلكتروني</label>
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
              <Mail className="w-4 h-4 text-gray-400" />
            </div>
            <input
              id="email" name="email" type="email" autoComplete="email" required
              disabled={loading} value={form.email} onChange={handleChange}
              placeholder="you@example.com"
              className={`${inputClass('email')} ps-10 pe-4`}
            />
          </div>
          <FieldError field="email" />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">كلمة المرور</label>
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
              <Lock className="w-4 h-4 text-gray-400" />
            </div>
            <input
              id="password" name="password" type={showPw ? 'text' : 'password'} autoComplete="new-password" required
              disabled={loading} value={form.password} onChange={handleChange}
              placeholder="8 أحرف على الأقل"
              className={`${inputClass('password')} ps-10 pe-10`}
            />
            <button type="button" tabIndex={-1} onClick={() => setShowPw((p) => !p)}
              className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <FieldError field="password" />
        </div>

        {/* Confirm password */}
        <div>
          <label htmlFor="password2" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">تأكيد كلمة المرور</label>
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
              <Lock className="w-4 h-4 text-gray-400" />
            </div>
            <input
              id="password2" name="password2" type={showPw ? 'text' : 'password'} autoComplete="new-password" required
              disabled={loading} value={form.password2} onChange={handleChange}
              placeholder="أعد كتابة كلمة المرور"
              className={`${inputClass('password2')} ps-10 pe-4`}
            />
          </div>
          <FieldError field="password2" />
        </div>

        {/* Submit */}
        <button
          type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          style={{background: 'linear-gradient(135deg, #2563eb 0%, #0891b2 100%)'}}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'جاري إنشاء الحساب…' : 'إنشاء الحساب'}
        </button>
      </form>

      {/* Footer link */}
      <p className="mt-6 text-center text-sm text-gray-500 dark:text-slate-400">
        لديك حساب بالفعل؟{' '}
        <Link to="/login" className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
          سجّل الدخول
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
