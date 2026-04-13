// src/layouts/AuthLayout.jsx
import { Outlet, Link } from 'react-router-dom';
import { Stethoscope, Heart, Shield, Zap, Activity } from 'lucide-react';

const FEATURES = [
  { icon: Activity, text: 'تقويم دواء ذكي مع تذكيرات فورية' },
  { icon: Shield,   text: 'بياناتك الطبية آمنة ومشفرة بالكامل' },
  { icon: Zap,      text: 'ذكاء اصطناعي يحلل أعراضك بدقة' },
  { icon: Heart,    text: 'تواصل سهل مع طبيبك في أي وقت' },
];

const AuthLayout = () => (
  <div className="min-h-screen flex">

    {/* ─── Left Panel (decorative, hidden on small screens) ─────────────────── */}
    <div
      className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
      style={{background: 'linear-gradient(135deg, #1d4ed8 0%, #0891b2 60%, #0e7490 100%)'}}
    >
      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-20"
             style={{background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)'}} />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-10"
             style={{background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 60%)'}} />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-10"
             style={{backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '30px 30px'}} />
      </div>

      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 relative z-10">
        <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
          <Stethoscope className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-black text-white tracking-tight">
          Bio<span className="text-cyan-300">Code</span>
        </span>
      </Link>

      {/* Middle content */}
      <div className="relative z-10">
        <h2 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-4">
          صحتك أولويتنا
          <br />
          <span className="text-cyan-300">دائماً ومعك</span>
        </h2>
        <p className="text-blue-100 text-base leading-relaxed mb-10 max-w-sm">
          منصة BioCode الطبية الذكية — إدارة صحتك بأحدث تقنيات الذكاء الاصطناعي كانت بهذه السهولة.
        </p>

        <ul className="space-y-4">
          {FEATURES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0">
                <Icon className="w-4.5 h-4.5 text-cyan-300" />
              </div>
              <span className="text-blue-100 text-sm font-medium">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom quote */}
      <div className="relative z-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
        <p className="text-white text-sm leading-relaxed mb-3">
          "استخدمت BioCode ولأول مرة أشعر أنني فعلاً في تحكم بصحتي. التذكيرات لا تفوّتني أي جرعة!"
        </p>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">م</div>
          <div>
            <p className="text-white text-xs font-bold">محمد أحمد</p>
            <p className="text-blue-200 text-xs">مريض مزمن — بيوكود</p>
          </div>
        </div>
      </div>
    </div>

    {/* ─── Right Panel (actual form area) ───────────────────────────────────── */}
    <div className="flex-1 flex flex-col min-h-screen bg-white dark:bg-slate-950 overflow-y-auto">
      {/* Mobile logo */}
      <div className="lg:hidden flex items-center justify-center gap-2.5 pt-8 pb-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black text-gray-900 dark:text-white">
            Bio<span className="text-blue-600">Code</span>
          </span>
        </Link>
      </div>

      {/* Form container */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-gray-400 dark:text-slate-600 pb-6">
        © {new Date().getFullYear()} BioCode · جميع الحقوق محفوظة
      </p>
    </div>
  </div>
);

export default AuthLayout;