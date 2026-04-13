// src/pages/doctor/Appointments.jsx

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Check, 
  X, 
  User, 
  AlertCircle, 
  RefreshCw, 
  Loader2,
  CalendarCheck,
  FilePlus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../api/axiosInstance';

// ─── Status Badges ───────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: 'bg-yellow-100 text-yellow-800 ring-yellow-600/20',
    ACCEPTED: 'bg-emerald-100 text-emerald-800 ring-emerald-600/20',
    REJECTED: 'bg-red-100 text-red-800 ring-red-600/10',
    COMPLETED: 'bg-blue-100 text-blue-800 ring-blue-600/20'
  };

  const labels = {
    PENDING: 'Pending',
    ACCEPTED: 'Accepted',
    REJECTED: 'Rejected',
    COMPLETED: 'Completed'
  };

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${styles[status] || styles.PENDING}`}>
      {labels[status] || status}
    </span>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const Appointments = () => {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Track which appointment is currently being updated to show proper loading state on the button
  const [actionLoading, setActionLoading] = useState(null);

  const fetchAppointments = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data } = await axiosInstance.get('/api/appointments/doctor-list/');
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err?.response?.data?.error || 
        err?.response?.data?.detail || 
        t('common.error')
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    setActionLoading(id);
    try {
      await axiosInstance.patch(`/api/appointments/update-status/${id}/`, {
        status: newStatus
      });
      
      // Update locally without a full refetch
      setAppointments(prev => 
        prev.map(app => 
          app.id === id ? { ...app, status: newStatus } : app
        )
      );
    } catch (err) {
      alert('Failed to update status. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // ─── Render Helpers ────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 w-full rounded-2xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex min-h-[40vh] border border-red-100 flex-col items-center justify-center gap-4 rounded-3xl bg-red-50 p-8 text-center ring-1 ring-inset ring-red-100/50">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100/50 text-red-500 ring-4 ring-white">
            <AlertCircle className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Oops, something went wrong</h3>
            <p className="mt-1 max-w-md text-sm text-gray-500">{error}</p>
          </div>
          <button
            onClick={fetchAppointments}
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-200 hover:bg-red-50"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-3xl bg-gray-50/50 dark:bg-slate-800/50">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white dark:bg-slate-700 shadow-sm ring-1 ring-gray-100 dark:ring-slate-600 text-gray-400 mb-6">
            <CalendarCheck className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('appointments.no_appointments')}</h2>
          <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-slate-400">
            {t('appointments.no_appointments_desc')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">{t('appointments.title')}</h1>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400">
            {t('appointments.subtitle')}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {appointments.map((appointment) => {
          let dateString = "Invalid Date";
          let timeString = "Invalid Time";

          try {
            const dateObj = new Date(appointment.date);
            dateString = dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
            timeString = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
          } catch (e) {
            console.error("Error parsing date:", appointment.date);
          }

          const isActionLoading = actionLoading === appointment.id;

          return (
            <div 
              key={appointment.id} 
              className="flex flex-col rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 px-5 py-4 bg-gray-50/50 dark:bg-slate-800/80 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                      {appointment.patient_name || 'Unknown Patient'}
                    </h3>
                    <p className="text-xs font-medium text-gray-500 dark:text-slate-400">ID: #{appointment.id}</p>
                  </div>
                </div>
                <StatusBadge status={appointment.status} />
              </div>

              {/* Card Body */}
              <div className="px-5 py-4 space-y-4 flex-1 text-sm">
                
                <div className="flex flex-wrap gap-4 text-gray-600 dark:text-slate-300">
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-slate-600">
                    <Calendar className="h-4 w-4 text-gray-400 dark:text-slate-400" />
                    <span className="font-medium text-gray-900 dark:text-white">{dateString}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-slate-600">
                    <Clock className="h-4 w-4 text-gray-400 dark:text-slate-400" />
                    <span className="font-medium text-gray-900 dark:text-white">{timeString}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">{t('appointments.reason_for_visit')}</h4>
                  <p className="text-gray-700 dark:text-slate-200 bg-gray-50/50 dark:bg-slate-700/50 p-3 rounded-xl border border-gray-100 dark:border-slate-600 text-sm italic">
                    {appointment.reason || 'No details provided.'}
                  </p>
                </div>
              </div>

              {/* Card Footer Actions */}
              {appointment.status === 'PENDING' && (
                <div className="border-t border-gray-100 dark:border-slate-700 px-5 py-4 flex items-center gap-3 bg-gray-50/30 dark:bg-slate-800/80 rounded-b-2xl">
                  <button
                    disabled={actionLoading !== null}
                    onClick={() => handleUpdateStatus(appointment.id, 'ACCEPTED')}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500 hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isActionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        {t('appointments.accept')}
                      </>
                    )}
                  </button>
                  <button
                    disabled={actionLoading !== null}
                    onClick={() => handleUpdateStatus(appointment.id, 'REJECTED')}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-slate-700 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-slate-600 transition-colors hover:bg-gray-50 dark:hover:bg-slate-600 hover:text-red-600 dark:hover:text-red-400 hover:ring-red-200 dark:hover:ring-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="h-4 w-4" />
                    {t('appointments.reject')}
                  </button>
                </div>
              )}

              {/* Action footer for non-pending appointments */}
              {appointment.status !== 'PENDING' && (
                <div className="border-t border-gray-100 dark:border-slate-700 px-5 py-4 bg-gray-50/30 dark:bg-slate-800/80 rounded-b-2xl flex items-center justify-between">
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                    {t('appointments.status')}: <span className="font-bold text-gray-700 dark:text-slate-200 lowercase">{t(`appointments.${appointment.status.toLowerCase()}`, appointment.status.toLowerCase())}</span>.
                  </p>
                  
                  {appointment.status === 'ACCEPTED' && (
                    <Link
                      to={`/doctor/logs/create?patientId=${appointment.patient || appointment.id}&appointmentId=${appointment.id}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500 shadow-sm"
                    >
                      <FilePlus className="h-4 w-4" />
                      {t('appointments.write_log')}
                    </Link>
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};

export default Appointments;
