import { NavLink, useLocation } from 'react-router-dom';
import {
  HiOutlineViewGrid,
  HiOutlineServer,
  HiOutlineCreditCard,
  HiOutlineDocumentReport,
  HiOutlineLightningBolt,
  HiOutlineCog,
  HiOutlineX,
} from 'react-icons/hi';

const navItems = [
  { to: '/dashboard', icon: HiOutlineViewGrid, label: 'Dashboard' },
  { to: '/services', icon: HiOutlineServer, label: 'Services' },
  { to: '/budget', icon: HiOutlineCreditCard, label: 'Budget & Alerts' },
  { to: '/reports', icon: HiOutlineDocumentReport, label: 'Reports' },
  { to: '/recommendations', icon: HiOutlineLightningBolt, label: 'Recommendations' },
  { to: '/settings', icon: HiOutlineCog, label: 'Settings' },
];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 z-30 h-screen w-[260px] 
          bg-gradient-to-b from-white to-gray-50 dark:from-[#0B0F19] dark:to-[#111827] 
          border-r border-gray-200 dark:border-[#1F2937] 
          flex flex-col transition-all duration-300 ease-out
          lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-6 h-[68px] border-b border-gray-200 dark:border-white/[.08] transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center shadow-glow transition-all duration-300">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-[15px] text-gray-900 dark:text-white tracking-tight block leading-tight transition-colors duration-300">CloudCost</span>
              <span className="text-[10px] text-[#f59e0b]/60 font-medium tracking-wider uppercase transition-colors duration-300">Monitor</span>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors duration-200">
            <HiOutlineX className="w-5 h-5 text-gray-600 dark:text-slate-400 transition-colors duration-300" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
          <p className="text-[10px] font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-widest px-3 mb-3 transition-colors duration-300">Navigation</p>
          {navItems.map(({ to, icon: Icon, label }, idx) => {
            const isActive = location.pathname === to || (to === '/dashboard' && location.pathname === '/');
            return (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={`slide-right stagger-${idx + 1} flex items-center gap-3 px-3 py-[10px] rounded-xl text-[13px] font-medium transition-all duration-300 group ${
                  isActive
                    ? 'bg-gradient-to-r from-[#f59e0b]/20 to-[#d97706]/20 text-gray-900 dark:text-white shadow-sm border border-[#f59e0b]/30'
                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/[.06] hover:text-gray-900 dark:hover:text-slate-200'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  isActive ? 'bg-[#f59e0b]/20 text-[#f59e0b]' : 'text-gray-500 dark:text-slate-500 group-hover:text-gray-700 dark:group-hover:text-slate-300'
                }`}>
                  <Icon className="w-[18px] h-[18px]" />
                </div>
                {label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse" />
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
