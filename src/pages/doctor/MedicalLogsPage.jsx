// src/pages/doctor/MedicalLogsPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calendar, User, Pill, Activity, AlertCircle, RefreshCw, Layers, Edit, Trash2 } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

const MedicalLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data } = await axiosInstance.get('/api/medical-logs/history/');
      setLogs(data.medical_history || []);
    } catch (err) {
      setError(
        err?.response?.data?.error || 
        err?.response?.data?.detail || 
        'Unable to load medical records.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleDelete = async (recordId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا السجل الطبي بالكامل؟ سيتم مسح الأدوية المرتبطة به ولن يتم إرسال تنبيهات لها بعد الآن.')) return;
    
    try {
      await axiosInstance.delete(`/api/medical-logs/${recordId}/`);
      setLogs(logs.filter(log => log.record_id !== recordId));
    } catch (err) {
      alert(err?.response?.data?.error || 'فشل حذف السجل.');
    }
  };

  // ─── Render Helpers ────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-8"></div>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-40 w-full rounded-2xl bg-gray-100 border border-gray-200 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8" dir="rtl">
        <div className="flex flex-col items-center justify-center min-h-[40vh] border border-red-100 bg-red-50 p-8 rounded-3xl text-center ring-1 ring-inset ring-red-100/50">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500 mb-4">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">فشل تحميل السجلات</h3>
          <p className="mt-1 text-sm text-gray-500 max-w-md">{error}</p>
          <button
            onClick={fetchLogs}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-200 hover:bg-red-50"
          >
            <RefreshCw className="h-4 w-4" />
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8" dir="rtl">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-100 text-gray-400 mb-6">
            <Layers className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">لا توجد سجلات بعد</h2>
          <p className="mt-2 max-w-sm text-sm text-gray-500">
            لم تقم بكتابة أي سجلات طبية لمرضاك بعد. بمجرد إضافة وصفات طبية ستظهر هنا.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8" dir="rtl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center justify-center rounded-xl bg-blue-100 p-3 mb-4 text-blue-600">
            <FileText className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">السجلات الطبية للمرضى</h1>
          <p className="mt-1.5 text-sm text-gray-500">
            تاريخ كامل لجميع السجلات الطبية والوصفات التي قمت بإصدارها كطبيب.
          </p>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-6">
        {logs.map((log) => (
          <div 
            key={log.record_id} 
            className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Log Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4 gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{log.patient_name || 'مريض غير معروف'}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mt-0.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {log.date}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end gap-1">
                  <div className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    رقم السجل: #{log.record_id}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Link 
                      to={`/doctor/logs/edit/${log.record_id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors"
                      title="تعديل السجل"
                    >
                      <Edit className="h-3 w-3" /> تعديل
                    </Link>
                    <button 
                      onClick={() => handleDelete(log.record_id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-md hover:bg-red-100 transition-colors"
                      title="حذف السجل"
                    >
                      <Trash2 className="h-3 w-3" /> حذف
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Log Body */}
            <div className="px-6 py-5 flex flex-col md:flex-row gap-8">
              
              {/* Diagnosis Column */}
              <div className="flex-1 space-y-3">
                <h4 className="flex items-center gap-2 text-sm font-bold text-indigo-900 uppercase tracking-wide">
                  <Activity className="h-4 w-4 text-indigo-500" />
                  التشخيص الطبي
                </h4>
                <p className="text-gray-700 bg-indigo-50/50 p-4 rounded-xl text-sm leading-relaxed border border-indigo-50">
                  {log.diagnosis || 'لم يتم تقديم تشخيص مفصل.'}
                </p>
              </div>

              {/* Medications Column */}
              <div className="flex-1 space-y-3">
                <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-900 uppercase tracking-wide">
                  <Pill className="h-4 w-4 text-emerald-500" />
                  الأدوية الموصوفة ({log.medications?.length || 0})
                </h4>
                
                {log.medications && log.medications.length > 0 ? (
                  <ul className="space-y-3 mt-2 text-sm">
                    {log.medications.map((med, idx) => (
                      <li key={idx} className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-50 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <div>
                          <span className="font-bold text-gray-900 block">{med.name}</span>
                          <span className="text-gray-500 text-xs">{med.dosage}</span>
                        </div>
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-xs whitespace-nowrap">
                          المدة: {med.duration} أيام
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-xl border border-gray-100">
                    لم يتم وصف أدوية في هذه الزيارة.
                  </p>
                )}
              </div>

            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default MedicalLogsPage;
