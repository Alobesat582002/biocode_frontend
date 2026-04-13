// src/components/patient/DoctorCard.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Stethoscope, MapPin, Star, CalendarPlus, ShieldCheck, FileText, Info, Award } from 'lucide-react';
import RateDoctorModal from './RateDoctorModal';

const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isRateModalOpen, setIsRateModalOpen] = React.useState(false);

  // Extract fields with fallbacks
  const id          = doctor?.id || '';
  const first_name  = doctor?.first_name || '';
  const last_name   = doctor?.last_name || '';
  const fullName    = first_name || last_name ? `Dr. ${first_name} ${last_name}`.trim() : doctor?.username || 'Doctor';
  
  // Profile or direct fields
  const specialty       = doctor?.specialty || doctor?.profile_details?.specialty || 'General Practice';
  const clinicName      = doctor?.clinic_name || doctor?.profile_details?.clinic_name || null;
  const clinicAddress   = doctor?.clinic_address || doctor?.profile_details?.clinic_address || 'Clinic location not provided';
  const avatarUrl       = doctor?.profile_picture || doctor?.profile_details?.profile_picture || null;
  const matchScore      = doctor?.match_score || 95; // Demo fallback score if not provided
  const rating          = doctor?.rating ?? 5.0;
  const reviewsCount    = doctor?.reviews_count ?? 0;
  const consultationFee = doctor?.consultation_fee || doctor?.profile_details?.consultation_fee || null;
  const clinicDescription = doctor?.clinic_description || doctor?.profile_details?.clinic_description || null;
  const clinicServices  = doctor?.clinic_services || doctor?.profile_details?.clinic_services || null;

  const handleBook = () => {
    navigate(`/patient/appointments/request?doctorId=${id}`);
  };

  return (
    <div className="group relative flex flex-col rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm transition-all hover:shadow-md hover:ring-1 hover:ring-blue-500/20">
      
      {/* Top Section: Avatar & Badges */}
      <div className="flex items-start justify-between gap-4">
        {/* Avatar */}
        <div className="relative shrink-0">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={fullName} 
              className="h-16 w-16 rounded-full object-cover shadow-sm ring-2 ring-white"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-500 shadow-sm ring-2 ring-white">
              <Stethoscope className="h-7 w-7" />
            </div>
          )}
          {/* Verified Badge */}
          <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white">
            <ShieldCheck className="h-5 w-5 text-blue-500" />
          </div>
        </div>

        {/* Match Score */}
        {matchScore && (
          <div className="flex flex-col items-end">
            <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/20">
              <span>{typeof matchScore === 'number' && matchScore <= 1 ? (matchScore * 100).toFixed(0) : matchScore}% {t('doctor_card.match', 'Match')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Middle Section: Info */}
      <div className="mt-4 flex-1">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{fullName}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400">
          <Stethoscope className="h-4 w-4" />
          {specialty}
        </p>

        {clinicName && (
          <p className="mt-2.5 font-semibold text-sm text-gray-800 dark:text-gray-200 line-clamp-1">
            {clinicName}
          </p>
        )}

        <p className="mt-1 flex items-start gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
          <span className="line-clamp-2 leading-tight">{clinicAddress}</span>
        </p>

        {clinicDescription && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2 italic border-l-2 border-gray-200 dark:border-gray-700 pl-2">
            {clinicDescription}
          </p>
        )}

        {clinicServices && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {clinicServices.split(',').slice(0, 3).map((service, i) => (
              <span key={i} className="inline-flex items-center rounded-full bg-gray-100 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:text-gray-300">
                {service.trim()}
              </span>
            ))}
            {clinicServices.split(',').length > 3 && (
              <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:text-gray-300">
                +{clinicServices.split(',').length - 3}
              </span>
            )}
          </div>
        )}

        {consultationFee && (
          <p className="mt-3 flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            <span>{t('doctor_card.fees', 'Fees')}:</span>
            <span>{consultationFee} {t('doctor_card.currency', 'JOD')}</span>
          </p>
        )}
      </div>

      {/* Rating Line */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 dark:border-slate-700 pt-4">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{rating}</span>
          <span className="text-xs text-gray-400">({reviewsCount} {t('doctor_card.reviews', 'reviews')})</span>
        </div>
        <button 
          onClick={() => setIsRateModalOpen(true)}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          <Award className="h-3 w-3" />
          {t('doctor_card.rate_btn', 'Rate Doctor')}
        </button>
      </div>

      {/* Action Button */}
      <button
        onClick={handleBook}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 px-4 py-2.5 text-sm font-semibold text-blue-600 dark:text-blue-400 transition-colors hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <CalendarPlus className="h-4 w-4" />
        {t('doctor_card.book_btn', 'Book Appointment')}
      </button>

      {/* Modals */}
      <RateDoctorModal 
        isOpen={isRateModalOpen} 
        onClose={() => setIsRateModalOpen(false)} 
        doctor={doctor} 
      />
    </div>
  );
};

export default DoctorCard;
