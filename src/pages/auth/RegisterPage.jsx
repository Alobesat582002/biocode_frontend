// src/pages/auth/RegisterPage.jsx
import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, CheckCircle2, User, Mail, Lock, Stethoscope, Heart, AlertCircle, ArrowRight, ShieldCheck, RotateCcw } from 'lucide-react';
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

const OTP_LENGTH = 6;
const OTP_EXPIRY_SECONDS = 10 * 60; // 10 دقائق
const RESEND_COOLDOWN = 60; // 60 ثانية قبل ما يقدر يعيد الإرسال

const RegisterPage = () => {
  const navigate = useNavigate();

  // ─── State ──────────────────────────────────────────────────────────────────
  const [form, setForm]         = useState(INITIAL_FORM);
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [errors, setErrors]     = useState({});
  const [topError, setTopError] = useState('');

  // ─── OTP Step State ─────────────────────────────────────────────────────────
  const [step, setStep]               = useState(1); // 1 = form, 2 = OTP
  const [otpValues, setOtpValues]     = useState(Array(OTP_LENGTH).fill(''));
  const [otpLoading, setOtpLoading]   = useState(false);
  const [otpError, setOtpError]       = useState('');
  const [countdown, setCountdown]     = useState(OTP_EXPIRY_SECONDS);
  const [resendCountdown, setResendCountdown] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend]     = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const otpRefs = useRef([]);

  // ─── OTP Expiry Countdown ───────────────────────────────────────────────────
  useEffect(() => {
    if (step !== 2 || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, countdown]);

  // ─── Resend Cooldown (60 ثانية) ─────────────────────────────────────────────
  useEffect(() => {
    if (step !== 2 || resendCountdown <= 0) { setCanResend(true); return; }

    const timer = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) { setCanResend(true); clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, resendCountdown]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // ─── Form Handlers ─────────────────────────────────────────────────────────
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

  // ─── Step 1: Send OTP ───────────────────────────────────────────────────────
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setTopError('');
    const clientErrors = validate();
    if (Object.keys(clientErrors).length) { setErrors(clientErrors); return; }

    setLoading(true);
    try {
      await axiosInstance.post('/api/users/register/request-otp/', {
        username:  form.username,
        email:     form.email,
        password:  form.password,
        role:      form.role,
      });
      // الانتقال لخطوة إدخال الكود
      setStep(2);
      setCountdown(OTP_EXPIRY_SECONDS);
      setResendCountdown(RESEND_COOLDOWN);
      setCanResend(false);
      setOtpValues(Array(OTP_LENGTH).fill(''));
      setOtpError('');
      // Focus first OTP input
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      const data = err?.response?.data;
      if (data && typeof data === 'object') {
        const fieldErrors = {};
        let hasFieldError = false;
        ['username', 'email', 'password', 'password2', 'role'].forEach((f) => {
          if (data[f]) { fieldErrors[f] = Array.isArray(data[f]) ? data[f][0] : data[f]; hasFieldError = true; }
        });
        if (hasFieldError) setErrors(fieldErrors);
        else setTopError(data.error || data.non_field_errors?.[0] || data.detail || 'فشل إرسال رمز التحقق. حاول مجدداً.');
      } else {
        setTopError('حدث خطأ غير متوقع. حاول مجدداً.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── OTP Input Handlers ─────────────────────────────────────────────────────
  const handleOtpChange = useCallback((index, value) => {
    // السماح بأرقام فقط
    if (value && !/^\d$/.test(value)) return;

    setOtpError('');
    const newValues = [...otpValues];
    newValues[index] = value;
    setOtpValues(newValues);

    // الانتقال للخانة التالية تلقائياً
    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  }, [otpValues]);

  const handleOtpKeyDown = useCallback((index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }, [otpValues]);

  const handleOtpPaste = useCallback((e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const newValues = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((ch, i) => { newValues[i] = ch; });
    setOtpValues(newValues);
    // Focus last filled or last input
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    otpRefs.current[focusIdx]?.focus();
  }, []);

  // ─── Step 2: Verify OTP ─────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    const code = otpValues.join('');
    if (code.length < OTP_LENGTH) {
      setOtpError('يرجى إدخال رمز التحقق كاملاً.');
      return;
    }

    setOtpLoading(true);
    setOtpError('');
    try {
      await axiosInstance.post('/api/users/register/verify-otp/', {
        email: form.email,
        otp_code: code,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err) {
      const msg = err?.response?.data?.error || 'رمز التحقق غير صحيح. حاول مجدداً.';
      setOtpError(msg);
    } finally {
      setOtpLoading(false);
    }
  };

  // Auto-submit when all digits are entered
  useEffect(() => {
    if (step === 2 && otpValues.every((v) => v !== '') && !otpLoading) {
      handleVerifyOtp();
    }
  }, [otpValues, step]);

  // ─── Resend OTP ─────────────────────────────────────────────────────────────
  const handleResend = async () => {
    setResendLoading(true);
    setOtpError('');
    try {
      await axiosInstance.post('/api/users/register/request-otp/', {
        username: form.username,
        email:    form.email,
        password: form.password,
        role:     form.role,
      });
      setCountdown(OTP_EXPIRY_SECONDS);
      setResendCountdown(RESEND_COOLDOWN);
      setCanResend(false);
      setOtpValues(Array(OTP_LENGTH).fill(''));
      otpRefs.current[0]?.focus();
    } catch (err) {
      setOtpError(err?.response?.data?.error || 'فشل إعادة إرسال الرمز.');
    } finally {
      setResendLoading(false);
    }
  };

  // ─── Shared Classes ─────────────────────────────────────────────────────────
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

  // ═══════════════════════════════════════════════════════════════════════════
  // ─── Success State ────────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  if (success) {
    return (
      <div className="py-10 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6 animate-bounce">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">تم إنشاء الحساب! 🎉</h2>
        <p className="text-gray-500 dark:text-slate-400 text-sm">
          يتم الآن تحويلك لصفحة تسجيل الدخول…
        </p>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ─── Step 2: OTP Verification ─────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  if (step === 2) {
    return (
      <div dir="rtl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
            تأكيد البريد الإلكتروني 🔐
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">
            أرسلنا رمز تحقق مكون من 6 أرقام إلى
          </p>
          <p className="text-blue-600 dark:text-blue-400 font-bold text-sm mt-1 direction-ltr">
            {form.email}
          </p>
        </div>

        {/* OTP Error */}
        {otpError && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {otpError}
          </div>
        )}

        {/* OTP Inputs */}
        <div className="flex justify-center gap-2.5 mb-6" dir="ltr">
          {otpValues.map((val, i) => (
            <input
              key={i}
              ref={(el) => (otpRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={val}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(i, e)}
              onPaste={i === 0 ? handleOtpPaste : undefined}
              disabled={otpLoading}
              className={`w-12 h-14 text-center text-xl font-black rounded-xl border-2 transition-all duration-200 outline-none
                ${val
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-400 text-blue-700 dark:text-blue-300 shadow-md shadow-blue-500/10'
                  : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white'
                }
                focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:scale-105
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            />
          ))}
        </div>

        {/* Timer */}
        <div className="text-center mb-6">
          {countdown > 0 ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-slate-800 text-sm">
              <span className="text-gray-500 dark:text-slate-400">صلاحية الرمز:</span>
              <span className={`font-bold tabular-nums ${countdown <= 60 ? 'text-red-500' : 'text-blue-600 dark:text-blue-400'}`}>
                {formatTime(countdown)}
              </span>
            </div>
          ) : (
            <p className="text-sm text-red-500 font-semibold">انتهت صلاحية الرمز</p>
          )}
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerifyOtp}
          disabled={otpLoading || otpValues.some((v) => !v)}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 mb-4"
          style={{background: 'linear-gradient(135deg, #2563eb 0%, #0891b2 100%)'}}
        >
          {otpLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {otpLoading ? 'جاري التحقق…' : 'تأكيد وإنشاء الحساب'}
        </button>

        {/* Resend & Back */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => { setStep(1); setOtpError(''); }}
            className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors flex items-center gap-1"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            تعديل البيانات
          </button>

          <button
            onClick={handleResend}
            disabled={!canResend || resendLoading}
            className={`text-sm font-semibold flex items-center gap-1.5 transition-colors ${
              canResend
                ? 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer'
                : 'text-gray-400 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            {resendLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
            {canResend ? 'إعادة الإرسال' : `إعادة الإرسال (${resendCountdown}ث)`}
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ─── Step 1: Registration Form ────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════
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

      <form onSubmit={handleSubmitForm} noValidate className="space-y-5">

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
              className={`${inputClass('password2')} ps-10 pe-10`}
            />
            <button type="button" tabIndex={-1} onClick={() => setShowPw((p) => !p)}
              className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
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
          {loading ? 'جاري إرسال رمز التحقق…' : 'متابعة — إرسال رمز التحقق ✉️'}
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
