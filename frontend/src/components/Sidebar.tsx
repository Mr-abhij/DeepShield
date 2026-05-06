import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Camera, Globe, History, Terminal, Wifi } from 'lucide-react';

const navItems = [
  { name: 'Dashboard',     path: '/dashboard', icon: LayoutDashboard },
  { name: 'Live Scan',     path: '/webcam',    icon: Camera },
  { name: 'URL Scanner',   path: '/social',    icon: Globe },
  { name: 'Vault History', path: '/history',   icon: History },
  { name: 'System Logs',   path: '#',          icon: Terminal },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-56 shrink-0 flex flex-col bg-[#0B0A10] border-r border-white/5 min-h-screen py-6">
      {/* Logo */}
      <div className="px-5 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded border border-brand-cyan/50 flex items-center justify-center">
            <span className="text-brand-cyan font-bold text-xs">DS</span>
          </div>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif' }} className="text-white font-bold tracking-wide text-sm">
            DEEPSHIELD
          </span>
        </div>
      </div>

      {/* Nav label */}
      <div className="px-5 mb-3">
        <span className="text-[10px] font-bold tracking-[0.2em] text-white/20 uppercase">Navigation</span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-0.5 px-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={() =>
                `flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-all
                 ${isActive
                   ? 'bg-brand-purple/30 text-white border-l-2 border-brand-purple'
                   : 'text-white/40 hover:text-white/80 hover:bg-white/5 border-l-2 border-transparent'
                 }`
              }
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-brand-cyan' : ''}`} />
              <span className="uppercase text-[11px] tracking-wider">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom – Network indicator */}
      <div className="mt-auto px-5">
        <div className="bg-[#0f0e16] border border-white/5 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Wifi className="w-3 h-3 text-brand-cyan" />
            <span className="text-[10px] tracking-widest text-white/30 uppercase font-bold">Network Speed</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mb-1.5">
            <div className="h-full w-3/4 bg-brand-cyan rounded-full" />
          </div>
          <span style={{ fontFamily: 'JetBrains Mono, monospace' }} className="text-[11px] text-brand-cyan">
            1.2 GBPS / SECURE
          </span>
        </div>
      </div>
    </aside>
  );
}
