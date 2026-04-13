// src/pages/patient/MedicalHistory.jsx

import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText, Search, Activity, Pill, User, ChevronDown, ChevronUp,
  AlertCircle, RefreshCw, FolderOpen
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../api/axiosInstance';

const MedicalHistory = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLogs, setExpandedLogs] = useState(new Set());

  const fetchHistory = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data } = await axiosInstance.get('/api/medical-logs/history/');
      setLogs(data.medical_history || []);
    } catch (err) {
      setError(err?.response?.data?.error || err?.response?.data?.detail || 'Unable to load medical records.');
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchHistory(); }, []);

  const toggleExpand = (id) => {
    setExpandedLogs(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    const q = searchQuery.toLowerCase();
    return logs.filter(l =>
      (l.diagnosis || '').toLowerCase().includes(q) ||
      (l.doctor_name || '').toLowerCase().includes(q) ||
      (l.symptoms || '').toLowerCase().includes(q)
    );
  }, [logs, searchQuery]);

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (isLoading) return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-4">
      <div className="h-8 w-64 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
      <div className="h-12 w-full max-w-sm bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse" />
      {[1,2,3].map(i => (
        <div key={i} className="h-24 w-full rounded-2xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 animate-pulse" />
      ))}
    </div>
  );

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error) return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col items-center justify-center min-h-[40vh] border border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-900/20 p-8 rounded-3xl text-center">
        <AlertCircle className="h-10 w-10 text-red-400 mb-3" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('history.failed_load')}</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{error}</p>
        <button onClick={fetchHistory}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 shadow-sm ring-1 ring-red-200 dark:ring-red-800 hover:bg-red-50">
          <RefreshCw className="h-4 w-4" /> {t('common.retry')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Header */}
      <div>
        <div className="inline-flex items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40 p-3 mb-4 text-blue-600">
          <FileText className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">{t('history.title')}</h1>
        <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400">
          {t('history.subtitle')}
        </p>
      </div>

      {/* Search */}
      {logs.length > 0 && (
        <div className="relative max-w-md">
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input type="text"
            className="block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-3 ps-11 pe-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm transition"
            placeholder={t('history.search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* Empty / Results */}
      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-3xl bg-gray-50/50 dark:bg-slate-800/50 p-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white dark:bg-slate-700 shadow-sm ring-1 ring-gray-100 dark:ring-slate-600 text-gray-400 mb-6">
            <FolderOpen className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('history.no_records')}</h2>
          <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-slate-400">
            {t('history.no_records_sub')}
          </p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-slate-400">{t('history.no_match')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => {
            const isExpanded = expandedLogs.has(log.record_id);
            return (
              <div key={log.record_id}
                className="overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm transition-all duration-200 hover:shadow">

                {/* Header row */}
                <div onClick={() => toggleExpand(log.record_id)}
                  className="flex cursor-pointer select-none items-center justify-between p-5 hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors">

                  <div className="flex items-center gap-4">
                    {/* Date badge */}
                    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300">
                      <span className="text-xs font-bold uppercase">{new Date(log.date).toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-lg font-black leading-none text-gray-900 dark:text-white">{new Date(log.date).getDate()}</span>
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-500 shrink-0" />
                        {t('history.doctor')} {log.doctor_name || 'Unknown'}
                      </h3>
                      <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400 line-clamp-1 max-w-md">
                        {log.diagnosis || t('history.no_diagnosis')}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 ms-4 text-gray-400 dark:text-slate-500">
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-slate-700 bg-gray-50/30 dark:bg-slate-900/30 p-5">
                    <div className="flex flex-col md:flex-row gap-6">

                      {/* Diagnosis */}
                      <div className="flex-1 space-y-4">
                        <div>
                          <h4 className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                            <Activity className="h-4 w-4" /> {t('history.diagnosis')}
                          </h4>
                          <div className="rounded-xl border border-blue-100 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/20 p-4 text-sm text-gray-800 dark:text-slate-200 leading-relaxed">
                            {log.diagnosis || t('history.no_detail_diagnosis')}
                          </div>
                        </div>
                        {log.symptoms?.trim() && (
                          <div>
                            <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-2">{t('history.noted_symptoms')}</h4>
                            <p className="text-sm text-gray-700 dark:text-slate-300 italic border-s-2 border-gray-300 dark:border-slate-600 ps-3">"{log.symptoms}"</p>
                          </div>
                        )}
                      </div>

                      {/* Medications */}
                      <div className="flex-1">
                        <h4 className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                          <Pill className="h-4 w-4" /> {t('history.medications')}
                        </h4>
                        {log.medications?.length > 0 ? (
                          <div className="space-y-2">
                            {log.medications.map((med, idx) => (
                              <div key={idx} className="flex justify-between items-center rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm">
                                <div>
                                  <p className="font-bold text-gray-900 dark:text-white text-sm">{med.name}</p>
                                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{med.dosage}</p>
                                </div>
                                <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                                  {med.duration} {t('history.days')}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-sm text-gray-500 dark:text-slate-400 italic text-center shadow-sm">
                            {t('history.no_medications')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MedicalHistory;
