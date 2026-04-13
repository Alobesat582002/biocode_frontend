import React, { useState } from 'react';
import { Star, X, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { useTranslation } from 'react-i18next';

const RateDoctorModal = ({ isOpen, onClose, doctor, onRateSuccess }) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !doctor) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError(t('rate_doctor.error_no_rating', 'Please select a star rating.'));
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await axiosInstance.post('/api/community/add-review/', {
        doctor_id: doctor.id,
        rating: rating,
        comment: comment
      });
      
      setSuccess(true);
      if (onRateSuccess) onRateSuccess();
      setTimeout(() => {
        setSuccess(false);
        setRating(0);
        setComment('');
        onClose();
      }, 2000);
    } catch (err) {
      setError(err?.response?.data?.error || t('common.error', 'Something went wrong'));
    } finally {
      setIsLoading(false);
    }
  };

  const fullName = doctor.first_name || doctor.last_name 
    ? `Dr. ${doctor.first_name} ${doctor.last_name}`.trim() 
    : doctor.username;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={!isLoading ? onClose : undefined}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md scale-100 rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-2xl transition-all">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-700"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          {t('rate_doctor.title', 'Rate Doctor')}
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
          {t('rate_doctor.subtitle', 'Share your experience with')} <span className="font-semibold text-blue-600">{fullName}</span>
        </p>

        {success ? (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-500">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {t('rate_doctor.success', 'Thank you for your rating!')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Stars */}
            <div className="flex flex-col items-center justify-center py-4">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star 
                      className={`h-10 w-10 ${
                        (hoveredRating || rating) >= star 
                          ? 'fill-amber-400 text-amber-400' 
                          : 'fill-transparent text-gray-300 dark:text-slate-600'
                      } transition-colors`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                {t('rate_doctor.comment_label', 'Your Review (Optional)')}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder={t('rate_doctor.comment_placeholder', 'How was your consultation?')}
                className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('rate_doctor.submit', 'Submit Rating')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RateDoctorModal;
