// src/pages/common/Profile.jsx

import React, { useState, useEffect, useRef } from 'react';
import {
  User, Phone, MapPin, Stethoscope, FileText, Camera,
  CheckCircle2, AlertCircle, Loader2, Save, Navigation, Building
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../api/axiosInstance';

const Profile = () => {
  const { t } = useTranslation();
  const { user, role } = useAuth();
  const fileInputRef = useRef(null);

  // ─── Profile State ─────────────────────────────────────────────────────────
  // Common
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Patient-specific
  const [chronicDisease, setChronicDisease] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  // Doctor-specific
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [clinicLatitude, setClinicLatitude] = useState('');
  const [clinicLongitude, setClinicLongitude] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [clinicDescription, setClinicDescription] = useState('');
  const [clinicServices, setClinicServices] = useState('');
  const [consultationFee, setConsultationFee] = useState('');

  // Avatar
  const [avatarPreview, setAvatarPreview] = useState(null); // URL for display
  const [avatarFile, setAvatarFile] = useState(null);       // File for upload

  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationCaptured, setLocationCaptured] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // ─── Fetch Profile on Mount ────────────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const { data } = await axiosInstance.get('/api/users/profile/');
        
        // Populate common fields
        setUsername(data.username || '');
        setEmail(data.email || '');
        setPhoneNumber(data.phone_number || '');

        // Populate profile_details based on role
        const details = data.profile_details || {};
        if (data.role === 'PATIENT') {
          setChronicDisease(details.chronic_disease || '');
          setLatitude(details.latitude || '');
          setLongitude(details.longitude || '');
          setAvatarPreview(details.profile_picture || null);
        } else if (data.role === 'DOCTOR') {
          setSpecialization(details.specialization || '');
          setLicenseNumber(details.license_number || '');
          setClinicLatitude(details.clinic_latitude || '');
          setClinicLongitude(details.clinic_longitude || '');
          setClinicName(details.clinic_name || '');
          setClinicAddress(details.clinic_address || '');
          setClinicDescription(details.clinic_description || '');
          setClinicServices(details.clinic_services || '');
          setConsultationFee(details.consultation_fee || '');
          setAvatarPreview(details.profile_picture || null);
        }
      } catch (err) {
        setError('Failed to load profile data. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ─── Geolocation ──────────────────────────────────────────────────────────
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Your browser does not support geolocation.');
      return;
    }
    setIsLocating(true);
    setLocationCaptured(false);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        if (role === 'PATIENT') {
          setLatitude(lat);
          setLongitude(lng);
        } else {
          setClinicLatitude(lat);
          setClinicLongitude(lng);
        }
        setIsLocating(false);
        setLocationCaptured(true);
      },
      (err) => {
        setError('Could not retrieve your location. Please allow location access in your browser settings.');
        setIsLocating(false);
      }
    );
  };

  // ─── Avatar Change ─────────────────────────────────────────────────────────
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // ─── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      // Build FormData to support image upload
      const formData = new FormData();
      formData.append('phone_number', phoneNumber);

      if (avatarFile) {
        formData.append('profile_picture', avatarFile);
      }

      if (role === 'PATIENT') {
        formData.append('chronic_disease', chronicDisease);
        if (latitude)  formData.append('latitude', latitude);
        if (longitude) formData.append('longitude', longitude);
      } else if (role === 'DOCTOR') {
        formData.append('specialization', specialization);
        formData.append('license_number', licenseNumber);
        if (clinicLatitude)  formData.append('clinic_latitude', clinicLatitude);
        if (clinicLongitude) formData.append('clinic_longitude', clinicLongitude);
        formData.append('clinic_name', clinicName);
        formData.append('clinic_address', clinicAddress);
        formData.append('clinic_description', clinicDescription);
        formData.append('clinic_services', clinicServices);
        if (consultationFee !== undefined && consultationFee !== null && consultationFee !== '') {
          formData.append('consultation_fee', consultationFee);
        }
      }

      await axiosInstance.put('/api/users/profile/update/', formData);

      setSuccessMessage('Profile updated successfully!');
      setAvatarFile(null); // Clear file reference, preview stays
    } catch (err) {
      const errData = err?.response?.data;
      let msg;
      // Django debug mode returns HTML on 500 - detect and show friendly message
      if (typeof errData === 'string' && errData.trim().startsWith('<')) {
        msg = 'A server error occurred while uploading. Check if Cloudinary credentials are configured correctly.';
      } else {
        msg = errData?.error || errData?.detail || JSON.stringify(errData) || 'Failed to save profile.';
      }
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Loading Skeleton ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="h-8 w-56 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
        <div className="h-32 w-32 rounded-full bg-gray-200 dark:bg-slate-700 animate-pulse mx-auto"></div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-12 w-full rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">{t('profile.title')}</h1>
        <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400">
          {role === 'DOCTOR' ? t('profile.account_info') : 'Manage your personal info and configure your location for better doctor recommendations.'}
        </p>
      </div>

      {/* Alert Banners */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}
      {successMessage && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <p className="text-sm font-medium text-emerald-800">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* ─── Avatar Section ─────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-sm">
          <div className="relative group">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar Preview"
                className="h-28 w-28 rounded-full object-cover ring-4 ring-gray-100 shadow"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white ring-4 ring-gray-100 dark:ring-slate-800 shadow">
                <User className="h-14 w-14" />
              </div>
            )}
            {/* Camera overlay button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera className="h-7 w-7" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">{username || 'Unknown'}</h2>
            <div className="mt-2 inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/40 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-400">
              {role}
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                {t('profile.change_photo')}
              </button>
            </div>
          </div>
        </div>

        {/* ─── Account Info ────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-slate-700 pb-4">
            <User className="h-5 w-5 text-gray-500" />
            {t('profile.account_info')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Username (read-only) */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-2">Username</label>
              <input
                type="text"
                value={username}
                disabled
                className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 cursor-not-allowed"
              />
            </div>
            {/* Email (read-only) */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-2">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Phone Number</span>
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              placeholder="+962 7XX XXX XXXX"
              className="block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* ─── Patient-Specific Fields ──────────────────────────────────── */}
        {role === 'PATIENT' && (
          <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-slate-700 pb-4">
              <FileText className="h-5 w-5 text-gray-500" />
              {t('profile.medical_info')}
            </h2>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-2">Chronic Disease / Condition</label>
              <input
                type="text"
                value={chronicDisease}
                onChange={e => setChronicDisease(e.target.value)}
                placeholder="e.g. Diabetes Type 2, Hypertension..."
                className="block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Location Section */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-3">
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> My Location (for Doctor Recommendations)</span>
              </label>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Latitude</label>
                  <input type="text" value={latitude} readOnly
                    placeholder="Auto-detected" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Longitude</label>
                  <input type="text" value={longitude} readOnly
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-600"
                    placeholder="Auto-detected" />
                </div>
              </div>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-5 py-2.5 text-sm font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-200 hover:bg-indigo-100 transition-colors disabled:opacity-60"
              >
                {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                {isLocating ? 'Detecting...' : 'Get My Current Location'}
              </button>
              {locationCaptured && (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Location captured successfully!
                </p>
              )}
            </div>
          </div>
        )}

        {/* ─── Doctor-Specific Fields ───────────────────────────────────── */}
        {role === 'DOCTOR' && (
          <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-slate-700 pb-4">
              <Stethoscope className="h-5 w-5 text-gray-500" />
              {t('profile.prof_info')}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-2">Medical Specialization</label>
                <input
                  type="text"
                  value={specialization}
                  onChange={e => setSpecialization(e.target.value)}
                  placeholder="e.g. Cardiology, Neurology..."
                  className="block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-2">License Number</label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={e => setLicenseNumber(e.target.value)}
                  placeholder="e.g. JO-2024-XXXXX"
                  className="block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Clinic Details Section */}
            <div className="border-t border-gray-100 pt-5 mt-5">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <Building className="h-4 w-4 text-blue-500" />
                {t('profile.clinic_details')}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-2">Clinic Name</label>
                  <input
                    type="text"
                    value={clinicName}
                    onChange={e => setClinicName(e.target.value)}
                    placeholder="e.g. Al-Amal Specialized Clinic"
                    className="block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-2">Consultation Fee (JOD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={consultationFee}
                    onChange={e => setConsultationFee(e.target.value)}
                    placeholder="e.g. 25.00"
                    className="block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-2">Clinic Address (Text)</label>
                <input
                  type="text"
                  value={clinicAddress}
                  onChange={e => setClinicAddress(e.target.value)}
                  placeholder="e.g. Amman, Mecca St, Building 45"
                  className="block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-2">Clinic Services</label>
                <input
                  type="text"
                  value={clinicServices}
                  onChange={e => setClinicServices(e.target.value)}
                  placeholder="e.g. ECG, Ultrasound, Blood Tests"
                  className="block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-2">About Clinic / Doctor Experience</label>
                <textarea
                  rows="3"
                  value={clinicDescription}
                  onChange={e => setClinicDescription(e.target.value)}
                  placeholder="Write a brief description about the clinic or your experience..."
                  className="block w-full rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>
            </div>

            {/* Clinic Location Section (GPS) */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Clinic Location (Used by KNN Algorithm)</span>
              </label>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Clinic Latitude</label>
                  <input type="text" value={clinicLatitude} readOnly
                    className="block w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 px-4 py-2.5 text-sm text-gray-600 dark:text-slate-300"
                    placeholder="Auto-detected" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Clinic Longitude</label>
                  <input type="text" value={clinicLongitude} readOnly
                    className="block w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 px-4 py-2.5 text-sm text-gray-600 dark:text-slate-300"
                    placeholder="Auto-detected" />
                </div>
              </div>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-700 ring-1 ring-inset ring-blue-200 hover:bg-blue-100 transition-colors disabled:opacity-60"
              >
                {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                {isLocating ? 'Detecting...' : 'Get Clinic Location'}
              </button>
              {locationCaptured && (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Location captured successfully!
                </p>
              )}
            </div>
          </div>
        )}

        {/* ─── Save Button ──────────────────────────────────────────────── */}
        <div className="flex justify-end pb-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex min-w-[200px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-sm transition-all hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save Changes
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default Profile;
