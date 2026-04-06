import { HiOutlineMenu, HiOutlineLogout, HiOutlineUser } from 'react-icons/hi';
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
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const title = PAGE_TITLES[location.pathname] || 'Dashboard';

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-10 h-[64px] bg-white/70 dark:bg-[#050505]/70 backdrop-blur-xl border-b border-gray-200/60 dark:border-white/[.06] flex items-center justify-between px-5 lg:px-7 transition-all duration-300">
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
        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[.06] transition-all duration-300"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#22c55e] to-[#16a34a] flex items-center justify-center text-white text-xs font-semibold transition-all duration-300">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0a0a0a] rounded-xl shadow-lg border border-gray-200 dark:border-[#1a1a1a] py-2 z-20 transition-all duration-300">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-[#1a1a1a] transition-colors duration-300">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white transition-colors duration-300">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate transition-colors duration-300">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[.06] transition-all duration-300"
                >
                  <HiOutlineUser className="w-4 h-4" />
                  Profile Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-white/[.06] transition-all duration-300"
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
