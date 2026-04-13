// src/pages/patient/DoctorsList.jsx

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Stethoscope, AlertCircle, RefreshCw, Filter, Search } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import DoctorCard from '../../components/patient/DoctorCard';

// ─── Skeletons ───────────────────────────────────────────────────────────────

const CardSkeleton = () => (
  <div className="flex animate-pulse flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between">
      <div className="h-16 w-16 rounded-full bg-gray-200" />
      <div className="h-6 w-16 rounded-full bg-gray-200" />
    </div>
    <div className="mt-4 space-y-3">
      <div className="h-5 w-3/4 rounded bg-gray-200" />
      <div className="h-4 w-1/2 rounded bg-gray-200" />
      <div className="h-4 w-full rounded bg-gray-200" />
    </div>
    <div className="mt-8 h-10 w-full rounded-xl bg-gray-200" />
  </div>
);

// ─── Page Component ──────────────────────────────────────────────────────────

const DoctorsList = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const specialtyParam = searchParams.get('specialty');

  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch Logic
  const fetchDoctors = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Setup params if specialty exists
      const params = specialtyParam ? { specialty: specialtyParam } : {};
      
      // Make GET request based on user contract
      const { data } = await axiosInstance.get('/api/ai/recommend-doctors/', { params });
      
      // Assume API might return array directly or wrapped in an object
      const docs = Array.isArray(data) ? data : data.recommended_doctors || data.doctors || [];
      setDoctors(docs);
      
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
    fetchDoctors();
  }, [specialtyParam]);

  // ─── Render Helpers ────────────────────────────────────────────────────────

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <CardSkeleton key={i} />)}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex min-h-[40vh] border border-red-100 flex-col items-center justify-center gap-4 rounded-3xl bg-red-50 p-8 text-center ring-1 ring-inset ring-red-100/50">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100/50 text-red-500 ring-4 ring-white">
            <AlertCircle className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{t('common.error')}</h3>
            <p className="mt-1 max-w-md text-sm text-gray-500">{error}</p>
          </div>
          <button
            onClick={fetchDoctors}
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-200 hover:bg-red-50"
          >
            <RefreshCw className="h-4 w-4" />
            {t('common.retry')}
          </button>
        </div>
      );
    }

    if (doctors.length === 0) {
      return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-gray-300 bg-gray-50/50 p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm ring-1 ring-gray-100">
            <Search className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{t('doctors_list.no_doctors')}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {specialtyParam 
                ? t('doctors_list.no_specialty', { specialty: specialtyParam })
                : t('doctors_list.no_any')}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doc, idx) => (
          <DoctorCard key={doc.id || idx} doctor={doc} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-8">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center justify-center rounded-xl bg-blue-100 p-3 mb-4 text-blue-600">
            <Stethoscope className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {specialtyParam 
              ? t('doctors_list.title_recommended', { specialty: specialtyParam }) 
              : t('doctors_list.title_all')}
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            {specialtyParam 
              ? t('doctors_list.desc_recommended', { specialty: specialtyParam })
              : t('doctors_list.desc_all')}
          </p>
        </div>

        {/* Optional Filter Button */}
        <button className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          <Filter className="h-4 w-4" />
          {t('doctors_list.filters')}
        </button>
      </div>

      {/* Main Content Area */}
      {renderContent()}

    </div>
  );
};

export default DoctorsList;
