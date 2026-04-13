// src/pages/misc/LandingPage.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Stethoscope, Brain, Calendar, Shield, Bell, Activity,
  ArrowRight, Star, Users, CheckCircle, ChevronDown,
  Heart, Zap, Globe, Lock, Sparkles, FlaskConical,
  MessageSquare, FileText, TrendingUp, Clock, Menu, X
} from 'lucide-react';

// ─── Animated Counter ─────────────────────────────────────────────────────────
const AnimatedCounter = ({ target, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [started, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

// ─── Feature Card ─────────────────────────────────────────────────────────────
const FeatureCard = ({ icon: Icon, title, description, gradient, delay }) => (
  <div
    className="group relative bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-gray-100 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl backdrop-blur-sm"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
      <Icon className="w-7 h-7 text-white" />
    </div>
    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
    <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">{description}</p>
    <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full rounded-b-2xl bg-gradient-to-r ${gradient} transition-all duration-500`} />
  </div>
);

// ─── Step Card ────────────────────────────────────────────────────────────────
const StepCard = ({ step, title, description, icon: Icon }) => (
  <div className="flex gap-5 items-start group">
    <div className="relative flex-shrink-0">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-500 flex items-center justify-center text-xs font-black text-blue-600">
        {step}
      </div>
    </div>
    <div className="pt-1">
      <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-lg">{title}</h3>
      <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  </div>
);

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const features = [
    {
      icon: Brain,
      title: 'ذكاء اصطناعي طبي',
      description: 'نظام Triage ذكي يحلل أعراضك ويقدم توصيات طبية دقيقة مدعومة بنموذج Gemini AI.',
      gradient: 'from-violet-500 to-purple-600',
      delay: 0,
    },
    {
      icon: Calendar,
      title: 'تقويم الدواء الذكي',
      description: 'تذكيرات دقيقة بمواعيد جرعاتك اليومية عبر الإيميل وإشعارات فورية داخل المنصة.',
      gradient: 'from-blue-500 to-cyan-500',
      delay: 100,
    },
    {
      icon: Stethoscope,
      title: 'سجل طبي شامل',
      description: 'احتفظ بتاريخك الطبي الكامل مع تشخيصات الأطباء وخططك العلاجية في مكان واحد.',
      gradient: 'from-emerald-500 to-teal-600',
      delay: 200,
    },
    {
      icon: Bell,
      title: 'إشعارات فورية',
      description: 'لا تفوتك أي تحديث على وصفتك أو حالة معاينتك — إشعارات لحظية داخل النظام.',
      gradient: 'from-orange-500 to-amber-600',
      delay: 300,
    },
    {
      icon: Users,
      title: 'مجتمع طبي',
      description: 'شارك تجربتك وتواصل مع مجتمع المرضى والأطباء في بيئة آمنة وموثوقة.',
      gradient: 'from-pink-500 to-rose-600',
      delay: 400,
    },
    {
      icon: Shield,
      title: 'أمان وخصوصية',
      description: 'بياناتك الطبية محمية بتشفير عالي المستوى وصلاحيات وصول مدروسة بدقة.',
      gradient: 'from-slate-500 to-gray-700',
      delay: 500,
    },
  ];

  const stats = [
    { value: 5000, suffix: '+', label: 'مريض يثق بنا', icon: Users },
    { value: 300,  suffix: '+', label: 'طبيب متخصص',   icon: Stethoscope },
    { value: 99,   suffix: '%', label: 'دقة التذكيرات', icon: CheckCircle },
    { value: 24,   suffix: '/7', label: 'دعم متواصل',   icon: Clock },
  ];

  const steps = [
    { step: 1, icon: FlaskConical, title: 'أنشئ حسابك', description: 'سجّل بياناتك الأساسية وحالتك الصحية في دقائق.' },
    { step: 2, icon: Stethoscope, title: 'تواصل مع طبيبك', description: 'ابحث عن طبيب متخصص واحجز معاينة بسهولة تامة.' },
    { step: 3, icon: FileText,    title: 'استلم وصفتك', description: 'يصرف لك الطبيب الخطة العلاجية مباشرة على المنصة.' },
    { step: 4, icon: Bell,        title: 'لا تنسى جرعتك', description: 'النظام يذكّرك تلقائياً في وقت كل جرعة عبر الإيميل والإشعارات.' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-white overflow-x-hidden font-sans">

      {/* ─── Navbar ──────────────────────────────────────────────────────────── */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 dark:bg-slate-950/90 backdrop-blur-md shadow-lg border-b border-gray-100 dark:border-slate-800' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight">
              Bio<span className="text-blue-600">Code</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <a href="#features" className="text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">المميزات</a>
            <a href="#how" className="text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">كيف يعمل؟</a>
            <a href="#stats" className="text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">إحصائيات</a>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-gray-600 dark:text-slate-300 hover:text-blue-600 transition-colors px-4 py-2">
              تسجيل الدخول
            </Link>
            <Link to="/register" className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300">
              ابدأ مجاناً <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(p => !p)} className="md:hidden p-2 rounded-lg text-gray-600 dark:text-slate-300">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800 px-5 py-4 space-y-3">
            <a href="#features" onClick={() => setMobileOpen(false)} className="block text-sm font-semibold text-gray-600 dark:text-slate-300 py-2">المميزات</a>
            <a href="#how" onClick={() => setMobileOpen(false)} className="block text-sm font-semibold text-gray-600 dark:text-slate-300 py-2">كيف يعمل؟</a>
            <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-sm font-semibold text-gray-600 dark:text-slate-300 py-2">تسجيل الدخول</Link>
            <Link to="/register" onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl">
              ابدأ مجاناً <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </header>

      {/* ─── Hero Section ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-5 pt-16 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-3xl" style={{background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, rgba(34,211,238,0.08) 50%, transparent 70%)'}} />
          <div className="absolute bottom-0 left-10 w-[400px] h-[400px] rounded-full blur-3xl" style={{background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)'}} />
          <div className="absolute bottom-0 right-10 w-[400px] h-[400px] rounded-full blur-3xl" style={{background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)'}} />
          {/* Animated dots grid */}
          <div className="absolute inset-0 opacity-30 dark:opacity-10" style={{backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
        </div>

        {/* Badge */}
        <div className="relative inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold px-4 py-2 rounded-full mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          مدعوم بأحدث تقنيات الذكاء الاصطناعي
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </div>

        {/* Headline */}
        <h1 className="relative max-w-4xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight mb-6">
          رعاية صحتك أصبحت
          <br />
          <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-400 bg-clip-text text-transparent">
            أذكى وأسهل
          </span>
        </h1>

        <p className="relative max-w-2xl text-gray-500 dark:text-slate-400 text-base sm:text-lg md:text-xl leading-relaxed mb-10">
          BioCode منصتك الطبية الذكية — تتابع أدويتك، تتواصل مع طبيبك، وتحتفظ بسجلك الصحي كله في مكان واحد آمن وذكي.
        </p>

        {/* CTA Buttons */}
        <div className="relative flex flex-col sm:flex-row items-center gap-4 mb-16">
          <Link
            to="/register"
            className="flex items-center gap-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 group"
          >
            ابدأ رحلتك الصحية مجاناً
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-2 border-2 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-bold text-base px-8 py-4 rounded-2xl hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
          >
            تسجيل الدخول
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="relative flex flex-wrap justify-center gap-6 text-sm text-gray-400 dark:text-slate-500">
          {[
            { icon: Shield, text: 'بيانات مشفرة بالكامل' },
            { icon: Zap,    text: 'خدمة 24/7' },
            { icon: Star,   text: 'تقييم 5 نجوم' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-blue-500" />
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <a href="#features" className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-gray-400 dark:text-slate-600 animate-bounce hover:text-blue-500 transition-colors">
          <span className="text-xs mb-1">استكشف</span>
          <ChevronDown className="w-5 h-5" />
        </a>
      </section>

      {/* ─── Stats Strip ──────────────────────────────────────────────────────── */}
      <section id="stats" className="py-16 bg-gradient-to-r from-blue-600 to-cyan-500">
        <div className="max-w-6xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ value, suffix, label, icon: Icon }) => (
            <div key={label} className="text-center text-white">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-black mb-1">
                <AnimatedCounter target={value} suffix={suffix} />
              </div>
              <p className="text-blue-100 text-sm font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-5 bg-gray-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold px-4 py-2 rounded-full mb-4">
              <Zap className="w-3.5 h-3.5" /> مميزات المنصة
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
              كل ما تحتاجه في{' '}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                مكان واحد
              </span>
            </h2>
            <p className="text-gray-500 dark:text-slate-400 max-w-xl mx-auto text-base sm:text-lg">
              منصة BioCode تجمع أفضل خدمات الرعاية الصحية الرقمية في واجهة سهلة وذكية.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─────────────────────────────────────────────────────── */}
      <section id="how" className="py-24 px-5">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          {/* Text side */}
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold px-4 py-2 rounded-full mb-6">
              <Activity className="w-3.5 h-3.5" /> كيف يعمل BioCode؟
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 leading-tight">
              أربع خطوات نحو{' '}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                صحة أفضل
              </span>
            </h2>
            <p className="text-gray-500 dark:text-slate-400 text-base leading-relaxed mb-10">
              من إنشاء الحساب حتى استلام تذكيرات دوائك — البيوكود يرافقك في كل خطوة بطريقة ذكية وبسيطة.
            </p>
            <Link to="/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-blue-500/30 hover:scale-105 transition-all duration-300">
              ابدأ الآن <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Steps side */}
          <div className="space-y-8">
            {steps.map((step) => (
              <StepCard key={step.step} {...step} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ───────────────────────────────────────────────────────── */}
      <section className="py-24 px-5">
        <div className="max-w-4xl mx-auto relative rounded-3xl overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600" />
          <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '25px 25px'}} />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-300/20 rounded-full translate-y-1/3 -translate-x-1/3 blur-2xl" />

          <div className="relative text-center p-12 sm:p-16 text-white">
            <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 text-white text-xs font-bold px-4 py-2 rounded-full mb-6">
              <Heart className="w-3.5 h-3.5" /> انضم إلى عائلة BioCode
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-5 leading-tight">
              صحتك تستحق<br />
              الأفضل دائماً
            </h2>
            <p className="text-blue-100 text-base sm:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              انضم اليوم إلى آلاف المرضى الذين يديرون حياتهم الصحية بذكاء مع BioCode — مجاناً وبدون تعقيد.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="flex items-center gap-2 bg-white text-blue-700 font-black text-base px-8 py-4 rounded-2xl hover:bg-blue-50 hover:scale-105 transition-all duration-300 shadow-2xl"
              >
                سجّل الآن مجاناً <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="flex items-center gap-2 border-2 border-white/50 text-white font-bold text-base px-8 py-4 rounded-2xl hover:bg-white/10 transition-all duration-300"
              >
                تسجيل الدخول
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="bg-gray-50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-5 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            {/* Brand column */}
            <div className="md:col-span-1">
              <Link to="/" className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/30">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-black">Bio<span className="text-blue-600">Code</span></span>
              </Link>
              <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed mb-5">
                منصة طبية ذكية تجمع بين الرعاية الصحية الرقمية وأحدث تقنيات الذكاء الاصطناعي للمريض والطبيب.
              </p>
              <div className="flex gap-3">
                {['facebook', 'twitter', 'instagram', 'linkedin'].map(n => (
                  <div key={n} className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white cursor-pointer transition-all duration-300">
                    <Globe className="w-4 h-4" />
                  </div>
                ))}
              </div>
            </div>

            {/* Links columns */}
            {[
              {
                title: 'المنصة',
                links: ['الرئيسية', 'المميزات', 'التسعير', 'كيف تعمل؟']
              },
              {
                title: 'للمرضى',
                links: ['حجز موعد', 'تقويم الدواء', 'السجل الطبي', 'الذكاء الاصطناعي']
              },
              {
                title: 'الدعم',
                links: ['مركز المساعدة', 'سياسة الخصوصية', 'الشروط والأحكام', 'تواصل معنا']
              }
            ].map(col => (
              <div key={col.title}>
                <h3 className="font-black text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wider">{col.title}</h3>
                <ul className="space-y-3">
                  {col.links.map(link => (
                    <li key={link}>
                      <a href="#" className="text-gray-500 dark:text-slate-400 text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Footer bottom */}
          <div className="pt-8 border-t border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 dark:text-slate-500 text-sm">
              © {new Date().getFullYear()} BioCode. جميع الحقوق محفوظة.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-slate-500">
              <Heart className="w-4 h-4 text-red-500" />
              <span>صُنع بشغف لأجل صحتك</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
