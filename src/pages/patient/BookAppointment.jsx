// src/pages/patient/BookAppointment.jsx

import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, FileText, CheckCircle2, ArrowLeft, User, AlertCircle, Loader2 } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

const BookAppointment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const doctorId = searchParams.get('doctorId');

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Determine today's date for 'min' attribute
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!doctorId || !date || !time) return;

    setIsLoading(true);
    setError('');

    try {
      await axiosInstance.post('/api/appointments/request/', {
        doctor_id: parseInt(doctorId, 10),
        date: date,
        time: time,
        notes: notes.trim()
      });
      
      // On success (assuming 201 Created from Django)
      setIsSuccess(true);
    } catch (err) {
      setError(
        err?.response?.data?.error || 
        err?.response?.data?.detail || 
        'Failed to book the appointment. Please check your details and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Missing Doctor ID State
  if (!doctorId) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 mb-4">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Selection Required</h2>
        <p className="mt-2 max-w-md text-sm text-gray-500">
          We couldn't determine which doctor you want to book. Please navigate back to the doctor list and select a specific professional.
        </p>
        <Link 
          to="/patient/doctors"
          className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Doctors
        </Link>
      </div>
    );
  }

  // Success State
  if (isSuccess) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-6 shadow-sm ring-4 ring-emerald-50">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Request Sent!</h2>
        <p className="mt-2 max-w-md text-base text-gray-500">
          Your appointment request has been successfully submitted. The doctor will review it shortly.
        </p>
        
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/patient/dashboard"
            className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:w-auto"
          >
            Return to Dashboard
          </Link>
          <button
            onClick={() => {
              setIsSuccess(false);
              setDate('');
              setTime('');
              setNotes('');
            }}
            className="flex w-full items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-50 sm:w-auto"
          >
            Book Another
          </button>
        </div>
      </div>
    );
  }

  // Main Form Layout
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Request an Appointment</h1>
          <p className="mt-1 text-sm text-gray-500">
            Fill out the details below to request a time with your selected doctor.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        
        {/* Error Banner */}
        {error && (
          <div className="border-b border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            
            {/* Date Input */}
            <div>
              <label htmlFor="date" className="block text-sm font-semibold text-gray-700">
                <div className="flex items-center gap-1.5 mb-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  Preferred Date
                </div>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                required
                min={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Time Input */}
            <div>
              <label htmlFor="time" className="block text-sm font-semibold text-gray-700">
                <div className="flex items-center gap-1.5 mb-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  Preferred Time
                </div>
              </label>
              <input
                type="time"
                id="time"
                name="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Notes/Reason Input */}
            <div className="sm:col-span-2">
              <label htmlFor="notes" className="block text-sm font-semibold text-gray-700">
                <div className="flex items-center gap-1.5 mb-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  Reason for visit (Optional)
                </div>
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Briefly describe your symptoms or reason for booking..."
                className="block w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-gray-400"
              />
              <p className="mt-2 text-xs text-gray-500">
                This helps the doctor prepare for your arrival.
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <button
              type="submit"
              disabled={isLoading || !date || !time}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Requesting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Confirm Booking Request
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default BookAppointment;
