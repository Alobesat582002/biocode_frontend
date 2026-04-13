// src/components/common/Navbar.jsx
import { useState, useRef, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import {
  Stethoscope, LogOut, Moon, Sun, User, ChevronDown,
  LayoutDashboard, Globe, Menu, X
} from 'lucide-react';
import NotificationsMenu from './NotificationsMenu';

// ─── Language Toggle ──────────────────────────────────────────────────────────
const LangToggle = () => {
  const { i18n } = useTranslation();
  const isAR = i18n.language === 'ar';

  const toggle = () => {
    i18n.changeLanguage(isAR ? 'en' : 'ar');
  };

  return (
    <button
      onClick={toggle}
      title={isAR ? 'Switch to English' : 'التبديل للعربية'}
      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-bold border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
    >
      <Globe className="h-4 w-4" />
      <span>{isAR ? 'EN' : 'ع'}</span>
    </button>
  );
};

// ─── Theme Toggle ─────────────────────────────────────────────────────────────
const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();
  const { i18n } = useTranslation();
  const isAR = i18n.language === 'ar';

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className="relative flex h-9 w-16 items-center rounded-full border border-gray-200 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 transition-colors duration-300 focus:outline-none"
    >
      {/* Slider thumb */}
      <span
        className={`absolute flex h-7 w-7 items-center justify-center rounded-full shadow-sm transition-all duration-300 ${
          isDark ? 'bg-slate-800' : 'bg-white'
        }`}
        style={{
          transform: isDark ? `translateX(${isAR ? -34 : 34}px)` : `translateX(${isAR ? -2 : 2}px)`
        }}
      >
        {isDark
          ? <Moon className="h-3.5 w-3.5 text-blue-400" />
          : <Sun className="h-3.5 w-3.5 text-amber-500" />
        }
      </span>
      {/* Track icons */}
      <Sun className="absolute left-2 rtl:left-auto rtl:right-2 h-3 w-3 text-amber-500 opacity-60" />
      <Moon className="absolute right-2 rtl:right-auto rtl:left-2 h-3 w-3 text-slate-300 opacity-60" />
    </button>
  );
};

// ─── User Dropdown ────────────────────────────────────────────────────────────
const UserDropdown = ({ user, logout, dashboardPath, profilePath }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const username = user?.first_name || user?.username || 'User';
  const avatar = user?.profile_details?.profile_picture;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(p => !p)}
        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-slate-600 focus:outline-none"
      >
        {avatar ? (
          <img 
            src={avatar} 
            alt={username} 
            className="h-8 w-8 rounded-full object-cover shadow-sm ring-1 ring-gray-200 dark:ring-slate-600 bg-gray-100" 
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold shrink-0">
            {username[0]?.toUpperCase()}
          </div>
        )}
        <span className="hidden sm:inline max-w-[100px] truncate">{username}</span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute end-0 top-12 w-52 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-xl z-50 py-2 overflow-hidden">
          {/* User info */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
            <p className="text-xs text-gray-500 dark:text-slate-400">{t('nav.hello')},</p>
            <p className="font-bold text-gray-900 dark:text-white truncate">{username}</p>
            <p className="text-xs text-blue-500 font-medium mt-0.5">{user?.role}</p>
          </div>

          <Link to={profilePath} onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
            <User className="h-4 w-4 text-gray-400" />
            {t('nav.profile')}
          </Link>

          <button onClick={() => { logout(); setOpen(false); }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-gray-100 dark:border-slate-700 mt-1">
            <LogOut className="h-4 w-4" />
            {t('nav.logout')}
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Main Navbar ──────────────────────────────────────────────────────────────
const Navbar = () => {
  const { logout, user } = useAuth();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isDoctor  = user?.role === 'DOCTOR';
  const dashPath  = isDoctor ? '/doctor/dashboard'  : '/patient/dashboard';
  const profPath  = isDoctor ? '/doctor/profile'    : '/patient/profile';

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link to={dashPath} className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
              Bio<span className="text-blue-600">Code</span>
            </span>
          </Link>

          {/* Center — Dashboard link (desktop only) */}
          <div className="hidden md:flex flex-1 justify-center">
            <NavLink to={dashPath}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`
              }
            >
              <LayoutDashboard className="h-4 w-4" />
              {t('nav.dashboard')}
            </NavLink>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 shrink-0">
            <NotificationsMenu user={user} />
            <LangToggle />
            <ThemeToggle />
            <UserDropdown user={user} logout={logout} dashboardPath={dashPath} profilePath={profPath} />

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
              onClick={() => setMobileOpen(p => !p)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 space-y-1">
          <NavLink to={dashPath} onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`
            }
          >
            <LayoutDashboard className="h-4 w-4" />
            {t('nav.dashboard')}
          </NavLink>

          <Link to={profPath} onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800">
            <User className="h-4 w-4" />
            {t('nav.profile')}
          </Link>

          <button onClick={() => { logout(); setMobileOpen(false); }}
            className="flex w-full items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
            <LogOut className="h-4 w-4" />
            {t('nav.logout')}
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
