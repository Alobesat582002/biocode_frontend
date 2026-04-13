// src/context/AuthContext.jsx

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance, {
  setAccessToken,
  clearAccessToken,
} from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser]       = useState(null);  // { id, username, email, role }
  const [isLoading, setIsLoading] = useState(true);

  
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axiosInstance.post('/api/users/token/refresh/', {
           refresh: refreshToken
        });
        setAccessToken(data.access);

        const { data: profile } = await axiosInstance.get('/api/users/profile/');
        setUser(profile);

      } catch {
        clearAccessToken();
        localStorage.removeItem('refresh_token');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  
  useEffect(() => {
    const handleForceLogout = () => {
      clearAccessToken();
      localStorage.removeItem('refresh_token');
      setUser(null);
      navigate('/login', { replace: true });
    };

    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, [navigate]);

  // ─── Login ──────────────────────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    const { data } = await axiosInstance.post('/api/users/login/', credentials);

    setAccessToken(data.access);
    localStorage.setItem('refresh_token', data.refresh);

    const { data: profile } = await axiosInstance.get('/api/users/profile/');
    setUser(profile);

    return profile.role; // نرجع الـ role عشان نعمل redirect مناسب
  }, []);

  // ─── Logout ─────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await axiosInstance.post('/api/users/logout/'); // يحذف الـ cookie من السيرفر
    } finally {
      clearAccessToken();
      localStorage.removeItem('refresh_token');
      setUser(null);
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const value = {
    user,
    role: user?.role ?? null,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};