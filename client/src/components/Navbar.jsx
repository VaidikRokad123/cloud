import { HiOutlineMenu, HiOutlineBell, HiOutlineLogout, HiOutlineUser } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';
import ThemeToggle from './ThemeToggle';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/services': 'Services',
  '/budget': 'Budget & Alerts',
  '/reports': 'Reports',
  '/recommendations': 'Recommendations',
  '/settings': 'Settings',
};

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const title = PAGE_TITLES[location.pathname] || 'Dashboard';

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const notifications = [
    { id: 1, title: 'Budget Alert', message: 'You have used 85% of your monthly budget', time: '5 min ago', unread: true },
    { id: 2, title: 'Cost Spike Detected', message: 'EC2 costs increased by 40% today', time: '1 hour ago', unread: true },
    { id: 3, title: 'Recommendation Available', message: 'New cost optimization suggestions', time: '3 hours ago', unread: false },
  ];

  return (
    <header className="sticky top-0 z-10 h-[64px] bg-white/70 dark:bg-[#0c1222]/70 backdrop-blur-xl border-b border-gray-200/60 dark:border-white/[.06] flex items-center justify-between px-5 lg:px-7 transition-all duration-300">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[.06] transition-all duration-300">
          <HiOutlineMenu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-[15px] font-semibold text-gray-800 dark:text-white leading-tight transition-colors duration-300">{title}</h1>
          <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5 transition-colors duration-300">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/[.06] dark:hover:text-slate-300 transition-all duration-300 relative"
          >
            <HiOutlineBell className="w-[18px] h-[18px]" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#0c1222] transition-all duration-300" />
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 py-2 z-20 transition-all duration-300">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-slate-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer ${
                        notif.unread ? 'bg-blue-50 dark:bg-slate-700/50' : ''
                      }`}
                      onClick={() => setShowNotifications(false)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 ${notif.unread ? 'bg-[#f59e0b]' : 'bg-gray-300 dark:bg-slate-600'}`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{notif.title}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{notif.message}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{notif.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-gray-200 dark:border-slate-700">
                  <button 
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/budget');
                    }}
                    className="text-xs text-[#f59e0b] hover:text-[#d97706] font-medium transition-colors"
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[.06] transition-all duration-300"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center text-white text-xs font-semibold transition-all duration-300">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 py-2 z-20 transition-all duration-300">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-slate-700 transition-colors duration-300">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white transition-colors duration-300">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate transition-colors duration-300">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-300"
                >
                  <HiOutlineUser className="w-4 h-4" />
                  Profile Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-300"
                >
                  <HiOutlineLogout className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
