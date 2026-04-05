import { HiOutlineMenu, HiOutlineMoon, HiOutlineSun, HiOutlineBell, HiOutlineLogout, HiOutlineUser } from 'react-icons/hi';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/services': 'Services',
  '/budget': 'Budget & Alerts',
  '/reports': 'Reports',
  '/recommendations': 'Recommendations',
  '/settings': 'Settings',
};

export default function Navbar({ onMenuClick }) {
  const { dark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const title = PAGE_TITLES[location.pathname] || 'Dashboard';

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-10 h-[64px] bg-white/70 dark:bg-[#0c1222]/70 backdrop-blur-xl border-b border-gray-200/60 dark:border-white/[.06] flex items-center justify-between px-5 lg:px-7">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[.06] transition-colors">
          <HiOutlineMenu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-[15px] font-semibold text-gray-800 dark:text-white leading-tight">{title}</h1>
          <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button className="p-2.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/[.06] dark:hover:text-slate-300 transition-colors relative">
          <HiOutlineBell className="w-[18px] h-[18px]" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#0c1222]" />
        </button>
        <button onClick={toggleTheme}
          className="p-2.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/[.06] dark:hover:text-slate-300 transition-colors"
          title={dark ? 'Light mode' : 'Dark mode'}>
          {dark ? <HiOutlineSun className="w-[18px] h-[18px]" /> : <HiOutlineMoon className="w-[18px] h-[18px]" />}
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[.06] transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-semibold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 py-2 z-20">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-slate-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <HiOutlineUser className="w-4 h-4" />
                  Profile Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
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
