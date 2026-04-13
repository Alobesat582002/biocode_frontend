import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarClock, 
  CalendarCheck, 
  Users, 
  AlertCircle, 
  RefreshCw,
  UserCog,
  CalendarDays
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_patients: 0,
    pending_appointments: 0,
    today_appointments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Run both API calls in parallel to construct our dashboard model
      const [statsRes, appointmentsRes] = await Promise.all([
        axiosInstance.get('/api/users/dashboard/statistics/'),
        axiosInstance.get('/api/appointments/doctor-list/').catch(() => ({ data: [] })) 
      ]);

      const backendStats = statsRes.data.statistics || {};
      const appointments = appointmentsRes.data || [];

      // Calculate today's appointments
      let todayCount = 0;
      if (Array.isArray(appointments)) {
        const todayStr = new Date().toDateString();
        todayCount = appointments.filter(a => {
          return new Date(a.date).toDateString() === todayStr;
        }).length;
      }

      setStats({
        total_patients: backendStats.total_patients || 0,
        pending_appointments: backendStats.pending_appointments || 0,
        today_appointments: todayCount
      });

    } catch (err) {
      setError(
        err?.response?.data?.error || 
        'حدث خطأ أثناء تحميل بيانات لوحة التحكم. يرجى المحاولة مرة أخرى.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const todayDateStr = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8" dir="rtl">
      
      {/* ─── Welcome Banner ──────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-blue-600 to-indigo-700 px-8 py-10 shadow-lg sm:px-12">
        <div className="relative z-10 w-full">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            مرحباً بعودتك، د. {user?.username || 'زميلي'}
          </h1>
          <p className="mt-2 text-blue-100 font-medium">
            إليك نظرة عامة على نشاط عيادتك اليوم.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-md">
            <CalendarDays className="h-4 w-4" />
            {todayDateStr}
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/4 h-48 w-48 rounded-full bg-blue-300/20 blur-2xl pointer-events-none" />
      </div>

      {/* ─── Error Handling ──────────────────────────────────────────────── */}
      {error && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
          <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
          <h3 className="text-lg font-bold text-gray-900">عفواً، حدث خطأ ما</h3>
          <p className="mt-1 text-sm text-gray-600 max-w-md">{error}</p>
          <button
            onClick={fetchStats}
            className="mt-6 flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" /> إعادة المحاولة
          </button>
        </div>
      )}

      {/* ─── Statistics Grid ─────────────────────────────────────────────── */}
      {!error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Pending Requirements */}
          {isLoading ? (
            <div className="h-32 rounded-2xl bg-gray-100 animate-pulse border border-gray-200" />
          ) : (
            <Link 
              to="/doctor/appointments" 
              className="group relative overflow-hidden rounded-2xl border border-yellow-200 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 block"
            >
              <div className="absolute top-0 left-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <CalendarClock className="h-16 w-16 text-yellow-500" />
              </div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-500">طلبات الحجز المعلقة</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{stats.pending_appointments}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-50 text-yellow-500">
                  <CalendarClock className="h-6 w-6" />
                </div>
              </div>
            </Link>
          )}

          {/* Today's Appointments */}
          {isLoading ? (
            <div className="h-32 rounded-2xl bg-gray-100 animate-pulse border border-gray-200" />
          ) : (
            <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
              <div className="absolute top-0 left-0 p-4 opacity-10">
                <CalendarCheck className="h-16 w-16 text-emerald-500" />
              </div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-500">مواعيد اليوم</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{stats.today_appointments}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                  <CalendarCheck className="h-6 w-6" />
                </div>
              </div>
            </div>
          )}

          {/* Total Patients */}
          {isLoading ? (
            <div className="h-32 rounded-2xl bg-gray-100 animate-pulse border border-gray-200" />
          ) : (
            <div className="relative overflow-hidden rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
               <div className="absolute top-0 left-0 p-4 opacity-10">
                <Users className="h-16 w-16 text-blue-500" />
              </div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-500">إجمالي المرضى</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{stats.total_patients}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ─── Quick Actions ──────────────────────────────────────────────── */}
      {!isLoading && !error && (
        <div className="pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">إجراءات سريعة</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <Link 
              to="/doctor/appointments"
              className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:border-blue-300 hover:shadow transition-all group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">إدارة المواعيد</h3>
                <p className="text-sm text-gray-500 line-clamp-1">مراجعة طلبات الحجز وتنظيم الجدول</p>
              </div>
            </Link>

            <Link 
              to="/doctor/profile"
              className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:border-indigo-300 hover:shadow transition-all group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                <UserCog className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">تحديث الملف الشخصي</h3>
                <p className="text-sm text-gray-500 line-clamp-1">تعديل بياناتك وتفاصيل العيادة</p>
              </div>
            </Link>

          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
