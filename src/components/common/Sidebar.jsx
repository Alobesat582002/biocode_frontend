// src/components/common/Sidebar.jsx
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard,
  CalendarClock,
  Users,
  Stethoscope,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  Moon,
  Sun,
  Globe
} from 'lucide-react';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isRTL = i18n.dir() === 'rtl';

  const NAV_LINKS = [
    { to: '/doctor/dashboard',    label: t('doctor.sidebar.dashboard', 'لوحة القيادة'),    icon: LayoutDashboard },
    { to: '/doctor/appointments', label: t('doctor.sidebar.appointments', 'المواعيد'),       icon: CalendarClock },
    { to: '/doctor/logs',         label: t('doctor.sidebar.logs', 'السجلات الطبية'),         icon: Users },
    { to: '/doctor/community',    label: t('doctor.sidebar.community', 'المجتمع'),          icon: Users },
    { to: '/doctor/profile',      label: t('doctor.sidebar.profile', 'ملفي الشخصي'),        icon: UserCircle },
  ];

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(nextLang);
    document.documentElement.dir = nextLang === 'ar' ? 'rtl' : 'ltr';
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
      isActive
        ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md shadow-blue-500/20'
        : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
    } ${collapsed ? 'justify-center' : ''}`;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 transition-colors duration-200">
      
      {/* ── Logo ── */}
      <div className={`flex items-center gap-3 px-4 h-16 border-b border-gray-100 dark:border-slate-800 shrink-0 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
          <Stethoscope className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
            Bio<span className="text-blue-600 dark:text-blue-400">Code</span>
          </span>
        )}
      </div>

      {/* ── Nav links ── */}
      <div className="flex-1 overflow-y-auto w-full scrollbar-hide py-4 px-3">
        <nav className="space-y-1.5 flex flex-col w-full">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={linkClass}
              onClick={() => setMobileOpen(false)}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* ── Bottom Controls ── */}
      <div className="border-t border-gray-100 dark:border-slate-800 p-3 space-y-2 shrink-0 bg-gray-50/50 dark:bg-slate-900/50">
        
        {/* User Info */}
        {!collapsed && user && (
          <div className="px-3 py-2.5 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/50 flex flex-col w-full overflow-hidden shadow-sm">
            <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-widest font-bold">
              {t('doctor.sidebar.signedInAs', 'مسجل دخول كـ')}
            </p>
            <p className="text-sm font-black text-gray-800 dark:text-slate-200 truncate mt-0.5 w-full block overflow-hidden text-ellipsis">
              د. {user.first_name || user.username}
            </p>
          </div>
        )}

        {/* Quick Toggles */}
        <div className={`flex items-center gap-1.5 ${collapsed ? 'flex-col' : 'flex-row'}`}>
          <button
            onClick={toggleTheme}
            title={theme === 'light' ? t('common.nav.darkMode', 'الوضع الليلي') : t('common.nav.lightMode', 'الوضع المستنير')}
            className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            {!collapsed && <span className="text-xs font-bold truncate">{theme === 'light' ? t('common.nav.darkMode', 'ليلي') : t('common.nav.lightMode', 'نهاري')}</span>}
          </button>
          
          <button
            onClick={toggleLanguage}
            title={t('common.nav.changeLang', 'تغيير اللغة')}
            className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors`}
          >
            <Globe className="w-4 h-4 text-blue-500" />
            {!collapsed && <span className="text-xs font-bold uppercase truncate">{i18n.language === 'en' ? 'عربي' : 'EN'}</span>}
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-150 ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="truncate">{t('doctor.sidebar.logout', 'تسجيل خروج')}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile: top bar toggle ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center h-16 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-4 gap-3 shadow-sm transition-colors duration-200">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-lg font-black text-gray-900 dark:text-white">
          Bio<span className="text-blue-600 dark:text-blue-400">Code</span>
        </span>
      </div>

      {/* ── Mobile: overlay drawer ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex" dir={isRTL ? 'rtl' : 'ltr'}>
          {/* backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          {/* drawer */}
          <div className={`relative z-50 w-72 bg-white dark:bg-slate-900 shadow-2xl flex flex-col h-full transform transition-transform ${isRTL ? 'translate-x-0' : 'translate-x-0'}`}>
            <button
              onClick={() => setMobileOpen(false)}
              className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white`}
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* ── Desktop: persistent sidebar ── */}
      <aside
        dir={isRTL ? 'rtl' : 'ltr'}
        className={`hidden md:flex flex-col shrink-0 bg-white dark:bg-slate-900 border-x border-gray-100 dark:border-slate-800 transition-all duration-300 relative ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((p) => !p)}
          className={`absolute top-6 ${isRTL ? '-left-3.5' : '-right-3.5'} z-10 flex w-7 h-7 bg-white dark:bg-slate-800 border fill-white border-gray-200 dark:border-slate-600 rounded-full shadow-md items-center justify-center text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-transform`}
          aria-label="Toggle sidebar"
        >
          {isRTL ? (
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
          ) : (
            <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
          )}
        </button>
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;
