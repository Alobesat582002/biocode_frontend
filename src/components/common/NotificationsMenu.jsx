import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, Pill, Stethoscope, FileText, Settings, X } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { Link } from 'react-router-dom';

const NotificationsMenu = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // دالة جلب الإشعارات
  const fetchNotifications = async () => {
    try {
      const response = await axiosInstance.get('/api/users/notifications/');
      const data = response.data;
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  // جلب الإشعارات عند التحميل وكل 30 ثانية
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // تفريغ الإشعارات وقراءتها
  const markAsRead = async (id = null) => {
    try {
      const url = id ? `/api/users/notifications/${id}/read/` : '/api/users/notifications/read/';
      await axiosInstance.patch(url);
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  const markAllAsRead = (e) => {
    e.stopPropagation();
    markAsRead();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'MEDICATION': return <Pill className="text-pink-500 w-5 h-5" />;
      case 'APPOINTMENT': return <Stethoscope className="text-blue-500 w-5 h-5" />;
      case 'PRESCRIPTION': return <FileText className="text-green-500 w-5 h-5" />;
      default: return <Settings className="text-gray-500 w-5 h-5" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* أيقونة الجرس */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800 transition shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-slate-700"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* نافذة الإشعارات */}
      {isOpen && (
        <div className="absolute end-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden rtl:text-right">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-slate-800/80 border-b border-gray-100 dark:border-slate-700">
            <h3 className="font-bold text-gray-800 dark:text-slate-200">الإشعارات</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead} 
                className="text-xs text-blue-600 font-semibold hover:text-blue-800 transition flex items-center gap-1"
              >
                تحديد الكل كمقروء <Check className="w-3 h-3" />
              </button>
            )}
          </div>
          
          <div className="max-h-[350px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                <Bell className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                لا توجد إشعارات حالياً
              </div>
            ) : (
              <ul className="divide-y divide-gray-50 dark:divide-slate-800">
                {notifications.map((notif) => (
                  <li 
                    key={notif.id} 
                    onClick={() => {
                        if(!notif.is_read) markAsRead(notif.id);
                    }}
                    className={`flex items-start gap-3 px-4 py-3 transition cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 border-r-4 ${
                      notif.is_read ? 'border-transparent opacity-75' : 'bg-blue-50/30 border-blue-500'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-center">
                        {getNotificationIcon(notif.notification_type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${notif.is_read ? 'text-gray-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(notif.created_at).toLocaleString('ar-EG', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'
                        })}
                      </p>
                    </div>
                    {!notif.is_read && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsMenu;
