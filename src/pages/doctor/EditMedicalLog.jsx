import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FileText, Pill, Plus, Trash2, CheckCircle2, ArrowLeft, Loader2, AlertCircle, Save } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

const EditMedicalLog = () => {
  const { id: recordId } = useParams();
  const navigate = useNavigate();

  const [diagnosis, setDiagnosis] = useState('');
  const [medications, setMedications] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Fetch record on mount
  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const { data } = await axiosInstance.get(`/api/medical-logs/${recordId}/`);
        setDiagnosis(data.diagnosis || '');
        if (data.medications && data.medications.length > 0) {
          setMedications(data.medications);
        } else {
          setMedications([{ name: '', dosage: '', frequency: '', duration_days: '', start_time: '' }]);
        }
        setIsLoading(false);
      } catch (err) {
        setError(
          err?.response?.data?.error || 
          'تعذّر جلب بيانات السجل. تأكد من أن السجل موجود ومن صلاحياتك للوصول إليه.'
        );
        setIsLoading(false);
      }
    };
    fetchRecord();
  }, [recordId]);

  const handleAddMedication = () => {
    setMedications([
      ...medications, 
      { name: '', dosage: '', frequency: '', duration_days: '', start_time: '' }
    ]);
  };

  const handleRemoveMedication = (index) => {
    const newMeds = medications.filter((_, i) => i !== index);
    setMedications(newMeds);
  };

  const handleMedChange = (index, field, value) => {
    const newMeds = [...medications];
    newMeds[index][field] = value;
    setMedications(newMeds);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      setError('يرجى إدخال التشخيص.');
      return;
    }

    // Filter out completely empty medication rows
    const validMedications = medications.filter(med => med.name.trim() !== '');

    setIsSaving(true);
    setError('');

    const payload = {
      diagnosis: diagnosis.trim(),
      medications: validMedications.map(med => ({
        ...med,
        duration_days: parseInt(med.duration_days, 10) || 1
      }))
    };

    try {
      await axiosInstance.put(`/api/medical-logs/${recordId}/`, payload);
      setIsSuccess(true);
    } catch (err) {
      setError(
        err?.response?.data?.error || 
        err?.response?.data?.detail || 
        'فشل تحديث السجل الطبي. يرجى التحقق من البيانات المدخلة.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Missing ID State
  if (!recordId) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center px-4" dir="rtl">
        <h2 className="text-xl font-bold text-gray-900">مطلوب تحديد السجل</h2>
        <Link to="/doctor/logs" className="mt-4 text-blue-600 underline">العودة للسجلات</Link>
      </div>
    );
  }

  // Initial Loading
  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  // Success State
  if (isSuccess) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-6 shadow-sm ring-4 ring-blue-50">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">تم تحديث السجل بنجاح</h2>
        <p className="mt-2 max-w-md text-base text-gray-500">
          تم حفظ التعديلات على التشخيص والأدوية الموصوفة بنجاح.
        </p>
        
        <div className="mt-8 flex gap-4 w-full sm:w-auto">
          <Link
            to="/doctor/logs"
            className="flex flex-1 items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            العودة للسجلات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-8" dir="rtl">
      
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
        <button 
          onClick={() => navigate('/doctor/logs')}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 rotate-180" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">تعديل السجل الطبي</h1>
          <p className="mt-1 text-sm text-gray-500">
            تحديث وتقييم بيانات السجل والأدوية. الأدوية الجديدة ستستبدل الجرعات القديمة بالكامل.
          </p>
        </div>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Diagnosis */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <label htmlFor="diagnosis" className="block text-base font-bold text-gray-900 mb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              التشخيص والملاحظات الطبية
            </div>
          </label>
          <textarea
            id="diagnosis"
            required
            rows={5}
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="اكتب تقييمك الطبي وتشخيصك للحالة..."
            className="block w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Section 2: Medications */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-gray-100 gap-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Pill className="h-5 w-5 text-indigo-600" />
              الأدوية الموصوفة
            </h2>
          </div>

          <div className="space-y-6">
            {medications.map((med, index) => (
              <div key={index} className="relative p-6 bg-gray-50/50 rounded-2xl border border-gray-200 group">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-sm font-bold text-gray-700">دواء #{index + 1}</h3>
                  {medications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMedication(index)}
                      className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                      title="حذف الدواء"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">الاسم</label>
                    <input
                      type="text"
                      placeholder="مثال: Paracetamol"
                      value={med.name}
                      onChange={(e) => handleMedChange(index, 'name', e.target.value)}
                      className="block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  
                  {/* Dosage */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">الجرعة</label>
                    <input
                      type="text"
                      placeholder="مثال: حبة 500mg"
                      value={med.dosage}
                      onChange={(e) => handleMedChange(index, 'dosage', e.target.value)}
                      className="block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  
                  {/* Frequency */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">التكرار (رقم)</label>
                    <input
                      type="text"
                      placeholder="مرات في اليوم (مثال: 2)"
                      value={med.frequency}
                      onChange={(e) => handleMedChange(index, 'frequency', e.target.value)}
                      className="block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">المدة (بالأيام)</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="مثال: 7"
                      value={med.duration_days}
                      onChange={(e) => handleMedChange(index, 'duration_days', e.target.value)}
                      className="block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  {/* First Dose Time */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">توقيت أول جرعة</label>
                    <input
                      type="time"
                      value={med.start_time}
                      onChange={(e) => handleMedChange(index, 'start_time', e.target.value)}
                      className="block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddMedication}
              className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 shrink-0">
                <Plus className="h-4 w-4" />
              </div>
              إضافة دواء آخر
            </button>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving || !diagnosis.trim()}
            className="flex w-full sm:w-auto min-w-[200px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-sm transition-all hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                جاري تحديث السجل...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                حفظ التعديلات
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default EditMedicalLog;
