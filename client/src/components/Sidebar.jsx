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
  { to: '/', icon: HiOutlineViewGrid, label: 'Dashboard' },
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
        className={`fixed top-0 left-0 z-30 h-screen w-[260px] sidebar-gradient flex flex-col
          transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)]
          lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-6 h-[68px] border-b border-white/[.08]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-[15px] text-white tracking-tight block leading-tight">CloudCost</span>
              <span className="text-[10px] text-blue-300/60 font-medium tracking-wider uppercase">Monitor</span>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <HiOutlineX className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-3">Navigation</p>
          {navItems.map(({ to, icon: Icon, label }, idx) => {
            const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={onClose}
                className={`slide-right stagger-${idx + 1} flex items-center gap-3 px-3 py-[10px] rounded-xl text-[13px] font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-white/[.1] text-white shadow-sm'
                    : 'text-slate-400 hover:bg-white/[.06] hover:text-slate-200'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  isActive ? 'bg-blue-500/20 text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
                }`}>
                  <Icon className="w-[18px] h-[18px]" />
                </div>
                {label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/[.06]">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[.04]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow">
              A
            </div>
            <div>
              <p className="text-xs font-medium text-slate-300 leading-tight">Admin User</p>
              <p className="text-[10px] text-slate-500">Free Plan</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
