// src/pages/patient/Triage.jsx

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  Stethoscope,
  Sparkles,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

// ─── STEP CONSTANTS ───────────────────────────────────────────────────────────
const STEP = { INPUT: 'input', LOADING: 'loading', RESULT: 'result' };

// ─── Error Banner ─────────────────────────────────────────────────────────────
const ErrorBanner = ({ message }) => (
  <div
    role="alert"
    className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700"
    dir="rtl"
  >
    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
    <span>{message}</span>
  </div>
);

// ─── Loading State ────────────────────────────────────────────────────────────
const AnalyzingState = () => (
  <div className="flex flex-col items-center justify-center gap-5 py-16 text-center" dir="rtl">
    {/* Pulsing brain icon */}
    <div className="relative flex h-20 w-20 items-center justify-center">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-20" />
      <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg">
        <Brain className="h-9 w-9 text-white" />
      </div>
    </div>

    <div>
      <h2 className="text-lg font-semibold text-gray-900">جاري تحليل الأعراض...</h2>
      <p className="mt-1 text-sm text-gray-500">
        يقوم الذكاء الاصطناعي الآن بمراجعة وصفك. قد يستغرق هذا بضع ثوانٍ.
      </p>
    </div>

    {/* Animated dots */}
    <div className="flex gap-1.5 flex-row-reverse">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-violet-400"
          style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </div>

    <style>{`
      @keyframes bounce {
        0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
        40%            { transform: translateY(-6px); opacity: 1; }
      }
    `}</style>
  </div>
);

// ─── Result Card ──────────────────────────────────────────────────────────────
const ResultCard = ({ result, onReset }) => {
  const navigate = useNavigate();
  const specialty = result?.recommended_specialty ?? 'General Practice / طب عام';
  const analysis  = result?.analysis ?? '';

  const handleFindDoctors = () => {
    navigate(`/patient/doctors?specialty=${encodeURIComponent(specialty)}`);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Success header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100">
          <ShieldCheck className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">اكتمل التحليل</h2>
          <p className="text-sm text-gray-500">إليك ما توصل إليه الذكاء الاصطناعي بناءً على وصفك.</p>
        </div>
      </div>

      {/* Specialty badge */}
      <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 p-6 ring-1 ring-violet-200">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-500">
          التخصص الطبي المقترح
        </p>
        <div className="flex items-center gap-3">
          <Stethoscope className="h-6 w-6 shrink-0 text-violet-600" />
          <span className="text-2xl font-bold text-violet-900">{specialty}</span>
        </div>
      </div>

      {/* Analysis text */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
          التحليل الطبي المبدئي
        </p>
        <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{analysis}</p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-700 ring-1 ring-amber-200">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          هذا التحليل هو مقترح من الذكاء الاصطناعي <strong>وليس تشخيصاً طبياً نهائياً</strong>. يرجى دائماً مراجعة طبيب مختص.
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={handleFindDoctors}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:from-violet-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-all"
        >
          <Stethoscope className="h-4 w-4" />
          ابحث عن أطباء {specialty}
          <ArrowRight className="h-4 w-4 rotate-180" />
        </button>

        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          فحص أعراض أخرى
        </button>
      </div>
    </div>
  );
};

// ─── Input Form ───────────────────────────────────────────────────────────────
const InputForm = ({ onResult, onError }) => {
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => { textareaRef.current?.focus(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setIsLoading(true);
    onError('');

    try {
      const { data } = await axiosInstance.post('/api/ai/analyze-symptoms/', { symptoms: symptoms.trim() });
      onResult(data);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        'حدث خطأ غير متوقع أثناء تحليل الأعراض. يرجى المحاولة مرة أخرى.';
      onError(msg);
      setIsLoading(false);
    }
  };

  if (isLoading) return <AnalyzingState />;

  return (
    <form onSubmit={handleSubmit} className="space-y-5" dir="rtl">
      <div>
        <label htmlFor="symptoms" className="mb-2 block text-sm font-medium text-gray-700">
          صف أعراض حالتك بالتفصيل
        </label>
        <textarea
          ref={textareaRef}
          id="symptoms"
          name="symptoms"
          rows={7}
          required
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder={
            "مثال: أعاني من صداع مستمر منذ 3 أيام، يتركز غالباً في الجهة اليمنى، ويزداد سوءاً مع الإضاءة القوية وأشعر بالغثيان..."
          }
          className="block w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-colors"
        />
        <p className="mt-1.5 text-left text-xs text-gray-400" dir="ltr">
          {symptoms.length} أحرف
        </p>
      </div>

      {/* Tips */}
      <div className="rounded-xl bg-blue-50 px-4 py-3 text-xs text-blue-700 ring-1 ring-blue-100">
        <span className="font-semibold">💡 نصيحة:</span> تقديم تفاصيل دقيقة (مثل مدة الألم، مكانه، شدته، وما يرافقها من أعراض) يساعد في تقديم تحليل أكثر دقة من الذكاء الاصطناعي.
      </div>

      <button
        type="submit"
        disabled={!symptoms.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:from-violet-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 transition-all"
      >
        <Sparkles className="h-4 w-4" />
        بدء تحليل الأعراض
      </button>
    </form>
  );
};

// ─── Page Root ────────────────────────────────────────────────────────────────
const TriagePage = () => {
  const [step, setStep]     = useState(STEP.INPUT);
  const [result, setResult] = useState(null);
  const [error, setError]   = useState('');

  const handleResult = (data) => {
    setResult(data);
    setStep(STEP.RESULT);
  };

  const handleReset = () => {
    setResult(null);
    setError('');
    setStep(STEP.INPUT);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 pt-4">
      {/* Page header */}
      <div className="flex items-start gap-4" dir="rtl">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-sm">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الفحص الذكي للأعراض (AI)</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            صف الأعراض التي تشعر بها وسيقوم الذكاء الاصطناعي بتوجيهك للتخصص الطبي المناسب بناءً على حالتك.
          </p>
        </div>
      </div>

      {/* Error banner (persists across steps) */}
      {error && <ErrorBanner message={error} />}

      {/* Main card */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        {step === STEP.INPUT  && <InputForm  onResult={handleResult} onError={setError} />}
        {step === STEP.RESULT && <ResultCard result={result}         onReset={handleReset} />}
      </div>
    </div>
  );
};

export default TriagePage;
