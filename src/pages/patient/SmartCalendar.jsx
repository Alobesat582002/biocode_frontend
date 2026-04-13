// src/pages/patient/SmartCalendar.jsx
import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Pill,
  Activity,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  Mail,
  Clock,
  Loader2,
  Bell,
  Info,
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

/* ─── helpers ────────────────────────────────────────────────────────────── */

/** حساب مواعيد الجرعات اليومية بالاعتماد على frequency والوقت الأساسي */
function buildDoseTimes(frequencyPerDay, firstDoseTimeStr = '08:00') {
  const freq = frequencyPerDay > 0 ? frequencyPerDay : 1;
  const gap  = 24 / freq; // hours between doses
  const times = [];
  
  // Parse hours and minutes from "HH:MM:SS" or "HH:MM"
  const parts = firstDoseTimeStr.split(':');
  const baseHour = parseInt(parts[0], 10) || 8;
  const baseMinute = parseInt(parts[1], 10) || 0;

  for (let i = 0; i < freq; i++) {
    const totalHours = baseHour + i * gap;
    let h = Math.floor(totalHours);
    let m = Math.round((totalHours % 1) * 60) + baseMinute;

    if (m >= 60) {
      h += Math.floor(m / 60);
      m = m % 60;
    }
    h = h % 24;

    const ampm = h < 12 ? 'AM' : 'PM';
    const display12 = h % 12 === 0 ? 12 : h % 12;
    times.push(`${String(display12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`);
  }
  return times;
}

function getEventStyle(event) {
  const title = (event.title || '').toLowerCase();
  if (title.includes('pill') || title.includes('medication') || title.includes('💊'))
    return { Icon: Pill,         ringColor: 'ring-indigo-300 dark:ring-indigo-700', dotBg: 'bg-indigo-500', iconBg: 'bg-indigo-100 dark:bg-indigo-900/40', iconColor: 'text-indigo-600 dark:text-indigo-400', badge: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' };
  if (title.includes('test') || title.includes('check') || title.includes('activity'))
    return { Icon: Activity,     ringColor: 'ring-emerald-300 dark:ring-emerald-700', dotBg: 'bg-emerald-500', iconBg: 'bg-emerald-100 dark:bg-emerald-900/40', iconColor: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' };
  return   { Icon: CalendarIcon, ringColor: 'ring-blue-300 dark:ring-blue-700',    dotBg: 'bg-blue-500',    iconBg: 'bg-blue-100 dark:bg-blue-900/40',      iconColor: 'text-blue-600 dark:text-blue-400',    badge: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' };
}

/* ─── component ──────────────────────────────────────────────────────────── */

const SmartCalendar = () => {
  const [events,      setEvents]      = useState([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [error,       setError]       = useState('');

  /* ── جلب التقويم ─────────────────────────────────────────────────────── */
  const fetchCalendar = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data } = await axiosInstance.get('/api/medical-logs/calendar/');
      const eventsData = Array.isArray(data)
        ? data
        : data.calendar_events || data.events || [];
      setEvents(eventsData);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        'تعذّر تحميل جدولك الزمني.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCalendar(); }, []);

  /* ── Skeleton ─────────────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        <div className="h-8 w-64 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="h-4 w-48 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-5 shadow-sm animate-pulse">
            <div className="h-14 w-14 rounded-xl bg-gray-200 dark:bg-slate-700 shrink-0" />
            <div className="flex-1 space-y-3 py-1">
              <div className="h-4 w-1/3 bg-gray-200 dark:bg-slate-700 rounded" />
              <div className="h-3 w-1/2 bg-gray-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* ── Error ────────────────────────────────────────────────────────────── */
  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center min-h-[30vh] border border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-900/20 p-8 rounded-3xl text-center">
          <AlertCircle className="h-10 w-10 text-red-400 mb-3" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">تعذّر تحميل الجدول</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{error}</p>
          <button
            onClick={fetchCalendar}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 shadow-sm ring-1 ring-red-200 dark:ring-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
          >
            <RefreshCw className="h-4 w-4" /> إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  /* ── Main UI ──────────────────────────────────────────────────────────── */
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Header ── */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40 p-3 mb-4 text-blue-600 dark:text-blue-400">
            <CalendarIcon className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            التقويم الذكي للأدوية 💊
          </h1>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400">
            جدولك العلاجي اليومي — سيتلقى إيميلك تذكيراً تلقائياً عند كل موعد جرعة تحدد من قبل طبيبك.
          </p>
        </div>
      </div>

      {/* ── Empty state ── */}
      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-3xl bg-gray-50/50 dark:bg-slate-800/50 p-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-slate-700 text-gray-400 shadow-sm ring-1 ring-gray-100 dark:ring-slate-600 mb-4">
            <CalendarIcon className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">جدولك فارغ حالياً</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400 max-w-sm">
            لا توجد أدوية أو مهام معيّنة. بمجرد أن يكتب لك الطبيب وصفة، ستظهر هنا تلقائياً.
          </p>
        </div>
      ) : (
        /* ── Timeline ── */
        <div className="relative">
          {/* خط رأسي */}
          <div className="absolute start-5 top-6 bottom-6 w-0.5 bg-gray-200 dark:bg-slate-700" />

          <div className="space-y-5">
            {events.map((event, idx) => {
              const { Icon, dotBg, iconBg, iconColor, badge } = getEventStyle(event);
              // Pass the exact time string from backend (e.g. '09:50:00' or '21:50')
              const doseTimes = buildDoseTimes(event.frequency_per_day || 1, event.first_dose_time || '08:00');

              return (
                <div key={event.medication_id || idx} className="relative flex gap-5 items-start">
                  {/* Dot */}
                  <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-4 ring-white dark:ring-slate-950 ${dotBg}`}>
                    <Bell className="h-4 w-4 text-white" />
                  </div>

                  {/* Card */}
                  <div className="flex-1 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 p-5 shadow-sm hover:shadow-md transition-all duration-200">

                    {/* Top row */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className={`flex shrink-0 h-12 w-12 rounded-xl items-center justify-center ${iconBg} ${iconColor}`}>
                        <Icon className="h-6 w-6" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-gray-900 dark:text-white">
                          {event.title || 'حدث طبي'}
                        </h4>
                        <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400">
                          بواسطة د. {event.prescribed_by || 'الطبيب المعالج'}
                        </p>
                      </div>

                      {/* Date range */}
                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white">
                          {event.start_date} → {event.end_date}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wide mt-0.5">
                          فترة العلاج
                        </p>
                      </div>
                    </div>

                    {/* Dose times */}
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                          مواعيد الجرعات اليومية ({event.frequency_per_day || 1} × يومياً)
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {doseTimes.map((t, i) => (
                          <span
                            key={i}
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${badge}`}
                          >
                            <Clock className="h-3 w-3" />
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartCalendar;
