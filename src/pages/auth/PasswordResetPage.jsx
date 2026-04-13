// src/pages/auth/PasswordResetPage.jsx

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Mail, CheckCircle2, KeyRound, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

// ─── Helpers ────────────────────────────────────────────────────────────────

const extractError = (err) => {
  const data = err?.response?.data;
  if (!data) return 'Something went wrong. Please try again.';
  if (typeof data === 'string') return data;
  return (
    data.detail ||
    data.email?.[0] ||
    data.otp_code?.[0] ||
    data.new_password?.[0] ||
    data.non_field_errors?.[0] ||
    'Something went wrong. Please try again.'
  );
};

// ─── Shared UI atoms ─────────────────────────────────────────────────────────

const inputBase =
  'block w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 ' +
  'shadow-sm focus:outline-none focus:ring-2 transition-colors duration-150 ' +
  'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 ';

const inputClass = (hasError) =>
  inputBase +
  (hasError
    ? 'border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-300/40'
    : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500/30');

const ErrorBanner = ({ message }) =>
  message ? (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      <svg className="mt-0.5 h-4 w-4 shrink-0 fill-red-500" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.25a.75.75 0 011.5 0v4a.75.75 0 01-1.5 0v-4zm.75 7a.875.875 0 100-1.75.875.875 0 000 1.75z"
          clipRule="evenodd"
        />
      </svg>
      {message}
    </div>
  ) : null;

const SuccessBanner = ({ message }) =>
  message ? (
    <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
      {message}
    </div>
  ) : null;

// ─── Step indicator ───────────────────────────────────────────────────────────

const StepIndicator = ({ step }) => (
  <div className="mb-7 flex items-center justify-center gap-2">
    {[1, 2].map((n) => (
      <div key={n} className="flex items-center gap-2">
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors duration-200 ${
            step >= n
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-400'
          }`}
        >
          {step > n ? (
            <svg className="h-3.5 w-3.5 fill-white" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            n
          )}
        </div>
        {n < 2 && (
          <div className={`h-0.5 w-10 rounded-full transition-colors duration-200 ${step > n ? 'bg-blue-500' : 'bg-gray-200'}`} />
        )}
      </div>
    ))}
  </div>
);

// ─── Step 1: Request OTP ──────────────────────────────────────────────────────

const StepRequest = ({ onSuccess }) => {
  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required.'); return; }
    setError('');
    setLoading(true);
    try {
      await axiosInstance.post('/api/users/password-reset/request/', { email });
      onSuccess(email.trim());
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-7 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
          <Mail className="h-6 w-6 text-blue-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Forgot your password?</h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter your email and we'll send you a one-time code.
        </p>
      </div>

      <StepIndicator step={1} />

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {error && <ErrorBanner message={error} />}

        <div>
          <label htmlFor="reset-email" className="mb-1.5 block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            ref={inputRef}
            id="reset-email"
            type="email"
            autoComplete="email"
            required
            disabled={loading}
            value={email}
            onChange={(e) => { setError(''); setEmail(e.target.value); }}
            placeholder="you@example.com"
            className={inputClass(!!error)}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5
            text-sm font-semibold text-white shadow-sm hover:bg-blue-700
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-60 transition-colors duration-150"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Sending code…' : 'Send OTP'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        <Link to="/login" className="inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700 hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to login
        </Link>
      </p>
    </>
  );
};

// ─── Step 2: Confirm / New Password ──────────────────────────────────────────

const StepConfirm = ({ email, onBack }) => {
  const navigate = useNavigate();

  const [fields, setFields]     = useState({ otp_code: '', new_password: '' });
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [toast, setToast]       = useState('');
  const [done, setDone]         = useState(false);
  const otpRef = useRef(null);

  useEffect(() => { otpRef.current?.focus(); }, []);

  // Auto-redirect when done
  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(() => navigate('/login', { replace: true }), 2000);
    return () => clearTimeout(timer);
  }, [done, navigate]);

  const handleChange = (e) => {
    setError('');
    const { name, value } = e.target;
    // Only allow digits for OTP
    if (name === 'otp_code' && !/^\d*$/.test(value)) return;
    setFields((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (fields.otp_code.length !== 6) { setError('Enter the 6-digit code sent to your email.'); return; }
    if (fields.new_password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setError('');
    setLoading(true);
    try {
      await axiosInstance.post('/api/users/password-reset/confirm/', {
        email,
        otp_code:     fields.otp_code,
        new_password: fields.new_password,
      });
      setToast('Password reset successfully! Redirecting to login…');
      setDone(true);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="py-6 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-green-500" />
        <h2 className="text-xl font-bold text-gray-900">Password updated!</h2>
        <p className="mt-2 text-sm text-gray-500">Redirecting you to the login page…</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-7 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
          <KeyRound className="h-6 w-6 text-blue-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Check your inbox</h1>
        <p className="mt-1 text-sm text-gray-500">
          We sent a 6-digit code to{' '}
          <span className="font-medium text-gray-700">{email}</span>
        </p>
      </div>

      <StepIndicator step={2} />

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {error  && <ErrorBanner  message={error}  />}
        {toast  && <SuccessBanner message={toast} />}

        {/* Email (read-only context) */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className={`${inputBase} border-gray-200`}
          />
        </div>

        {/* OTP code */}
        <div>
          <label htmlFor="otp_code" className="mb-1.5 block text-sm font-medium text-gray-700">
            One-time code
          </label>
          <input
            ref={otpRef}
            id="otp_code"
            name="otp_code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            disabled={loading}
            value={fields.otp_code}
            onChange={handleChange}
            placeholder="123456"
            className={`${inputClass(!!error && fields.otp_code.length !== 6)} tracking-[0.35em] text-base font-mono`}
          />
        </div>

        {/* New password */}
        <div>
          <label htmlFor="new_password" className="mb-1.5 block text-sm font-medium text-gray-700">
            New password
          </label>
          <div className="relative">
            <input
              id="new_password"
              name="new_password"
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              required
              disabled={loading}
              value={fields.new_password}
              onChange={handleChange}
              placeholder="Min. 8 characters"
              className={`${inputClass(!!error && fields.new_password.length < 8)} pr-10`}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPw((p) => !p)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || fields.otp_code.length !== 6 || fields.new_password.length < 8}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5
            text-sm font-semibold text-white shadow-sm hover:bg-blue-700
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-60 transition-colors duration-150"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Resetting…' : 'Reset password'}
        </button>
      </form>

      {/* Back / resend */}
      <div className="mt-5 flex flex-col items-center gap-2 text-center text-sm text-gray-500">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Use a different email
        </button>
      </div>
    </>
  );
};

// ─── Wizard root ─────────────────────────────────────────────────────────────

const PasswordResetPage = () => {
  const [step, setStep]   = useState(1);
  const [email, setEmail] = useState('');

  const handleRequestSuccess = (confirmedEmail) => {
    setEmail(confirmedEmail);
    setStep(2);
  };

  return step === 1
    ? <StepRequest onSuccess={handleRequestSuccess} />
    : <StepConfirm email={email} onBack={() => setStep(1)} />;
};

export default PasswordResetPage;
