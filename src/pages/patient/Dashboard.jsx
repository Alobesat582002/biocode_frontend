import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CalendarDays, Brain, AlertCircle, RefreshCw, User,
  ArrowRight, Sparkles, FileText, Bot, Users,
  HeartPulse, Activity, Stethoscope, BookOpen,
  Clock, CheckCircle2
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

// ─── Skeleton ──────────────────────────────────────────────────────────────────

const Skeleton = ({ className }) => (
  <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />
);

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 h-36 animate-pulse" />
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map(n => (
        <div key={n} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-4">
          <Skeleton className="h-11 w-11 rounded-xl" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  </div>
);

// ─── Welcome Banner ────────────────────────────────────────────────────────────

const WelcomeBanner = ({ profile }) => {
  const { t } = useTranslation();
  const username = profile?.username || 'there';
  // Profile picture lives inside profile_details
  const avatarUrl = profile?.profile_details?.profile_picture || null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('dashboard.greeting_morning') : hour < 17 ? t('dashboard.greeting_afternoon') : t('dashboard.greeting_evening');

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 sm:p-8 text-white shadow-xl">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-44 w-44 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-8 right-28 h-32 w-32 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-indigo-500/20 blur-2xl" />

      <div className="relative flex items-center gap-5">
        {/* Avatar */}
        {avatarUrl ? (
          <img src={avatarUrl} alt={username}
            className="h-20 w-20 rounded-full object-cover ring-4 ring-white/40 shadow-lg shrink-0" />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/30 shadow-lg">
            <User className="h-10 w-10 text-white" />
          </div>
        )}

        {/* Text */}
        <div>
          <p className="text-sm font-semibold text-blue-200">{greeting}</p>
          <h1 className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight">
            Welcome back, <span className="text-white">{username}</span>
          </h1>
          <p className="mt-1.5 text-sm text-blue-200 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Quick stats strip */}
      <div className="relative mt-6 grid grid-cols-3 gap-3">
        {[
          { label: 'AI Chat', value: 'Active', icon: Bot },
          { label: 'Community', value: 'Online', icon: Users },
          { label: 'Health AI', value: 'Ready', icon: HeartPulse },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 backdrop-blur-sm">
            <Icon className="h-4 w-4 text-blue-200 shrink-0" />
            <div>
              <p className="text-xs font-medium text-blue-200 leading-none">{label}</p>
              <p className="text-base font-bold text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Feature Card ──────────────────────────────────────────────────────────────

const FeatureCard = ({ icon: Icon, gradient, title, description, action }) => (
  <div className="group flex flex-col rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm ring-1 ring-gray-100 dark:ring-slate-700 hover:shadow-lg hover:ring-gray-200 dark:hover:ring-slate-600 transition-all duration-200 relative overflow-hidden">
    <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradient}`} />

    <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${gradient}`}>
      <Icon className="h-5 w-5 text-white" />
    </div>

    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
    <p className="mt-2 flex-1 text-base leading-relaxed text-gray-500 dark:text-slate-400">{description}</p>

    {action && <div className="mt-5">{action}</div>}
  </div>
);

// ─── CTA Button ────────────────────────────────────────────────────────────────

const CTAButton = ({ label, icon: Icon, gradient, onClick }) => (
  <button onClick={onClick}
    className={`group flex w-full items-center justify-between rounded-xl bg-gradient-to-r ${gradient} px-4 py-3 text-base font-bold text-white shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150`}>
    <span className="flex items-center gap-2">
      <Icon className="h-4 w-4" />
      {label}
    </span>
    <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
  </button>
);

// ─── Link Button ──────────────────────────────────────────────────────────────

const LinkBtn = ({ label, onClick }) => (
  <button onClick={onClick}
    className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline group">
    {label}
    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
  </button>
);

// ─── Dashboard ────────────────────────────────────────────────────────────────

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState('');

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data } = await axiosInstance.get('/api/users/profile/');
      setProfileData(data);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Unable to load your profile.');
    } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  if (isLoading) return <DashboardSkeleton />;

  if (error) return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
        <AlertCircle className="h-7 w-7 text-red-500" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-gray-900">Could not load your dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
      </div>
      <button onClick={fetchProfile}
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors">
        <RefreshCw className="h-4 w-4" /> Retry
      </button>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Welcome Banner */}
      <WelcomeBanner profile={profileData} />

      {/* Section heading */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('dashboard.overview_title')}</h2>
        <p className="mt-1 text-base text-gray-500 dark:text-slate-400">{t('dashboard.overview_subtitle')}</p>
      </div>

      {/* Feature cards grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

        {/* 1 — Find Doctors */}
        <FeatureCard
          icon={Stethoscope}
          gradient="from-blue-500 to-blue-600"
          tag={undefined}
          title={t('dashboard.card_doctors_title')}
          description={t('dashboard.card_doctors_desc')}
          action={<CTAButton label={t('dashboard.card_doctors_btn')} icon={Stethoscope} gradient="from-blue-500 to-blue-600" onClick={() => navigate('/patient/doctors')} />}
        />

        {/* 2 — Medical History */}
        <FeatureCard
          icon={FileText}
          gradient="from-emerald-500 to-teal-600"
          tag={undefined}
          title={t('dashboard.card_history_title')}
          description={t('dashboard.card_history_desc')}
          action={<CTAButton label={t('dashboard.card_history_btn')} icon={FileText} gradient="from-emerald-500 to-teal-600" onClick={() => navigate('/patient/history')} />}
        />

        {/* 3 — AI Triage */}
        <FeatureCard
          icon={Brain}
          gradient="from-violet-500 to-indigo-600"
          tag={undefined}
          title={t('dashboard.card_triage_title')}
          description={t('dashboard.card_triage_desc')}
          action={<CTAButton label={t('dashboard.card_triage_btn')} icon={Sparkles} gradient="from-violet-500 to-indigo-600" onClick={() => navigate('/patient/triage')} />}
        />

        {/* 4 — AI Chatbot */}
        <FeatureCard
          icon={Bot}
          gradient="from-sky-500 to-blue-600"
          tag={undefined}
          title={t('dashboard.card_chatbot_title')}
          description={t('dashboard.card_chatbot_desc')}
          action={<CTAButton label={t('dashboard.card_chatbot_btn')} icon={Bot} gradient="from-sky-500 to-blue-600" onClick={() => navigate('/patient/chatbot')} />}
        />

        {/* 5 — Community */}
        <FeatureCard
          icon={Users}
          gradient="from-pink-500 to-rose-600"
          tag={undefined}
          title={t('dashboard.card_community_title')}
          description={t('dashboard.card_community_desc')}
          action={<CTAButton label={t('dashboard.card_community_btn')} icon={Users} gradient="from-pink-500 to-rose-600" onClick={() => navigate('/patient/community')} />}
        />

        {/* 6 — Smart Calendar */}
        <FeatureCard
          icon={CalendarDays}
          gradient="from-orange-500 to-amber-600"
          tag={undefined}
          title={t('dashboard.card_calendar_title')}
          description={t('dashboard.card_calendar_desc')}
          action={<CTAButton label={t('dashboard.card_calendar_btn')} icon={CalendarDays} gradient="from-orange-500 to-amber-600" onClick={() => navigate('/patient/calendar')} />}
        />

      </div>
    </div>
  );
};

export default Dashboard;
