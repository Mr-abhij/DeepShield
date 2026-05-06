import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Shield, Circle } from 'lucide-react';

const navLinks = [
  { name: 'Dashboard',   path: '/dashboard' },
  { name: 'Live Scan',   path: '/webcam'    },
  { name: 'URL Scanner', path: '/social'    },
  { name: 'Vault History', path: '/history' },
];

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-[#0B0A10]">
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between px-8 py-4 border-b border-white/5 bg-[#0B0A10]/80 backdrop-blur sticky top-0 z-40">
          {/* Nav links */}
          <nav className="flex items-center gap-8">
            {navLinks.map(link => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium uppercase tracking-wider transition-colors pb-0.5 ${
                    isActive
                      ? 'text-brand-cyan border-b border-brand-cyan'
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right side status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-brand-panel border border-white/5 rounded px-3 py-1.5">
              <Circle className="w-2 h-2 fill-brand-green text-brand-green" />
              <span style={{ fontFamily: 'JetBrains Mono, monospace' }} className="text-[11px] uppercase tracking-wider text-brand-green">
                System Active
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-brand-purple/30 border border-brand-purple/50 flex items-center justify-center">
              <Shield className="w-4 h-4 text-brand-purple" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 px-8 py-4 flex justify-between items-center">
          <span style={{ fontFamily: 'JetBrains Mono, monospace' }} className="text-[11px] text-brand-cyan uppercase tracking-wider">
            © 2025 DeepShield AI Forensics. All Data Encrypted.
          </span>
          <div className="flex gap-6">
            {['Terms of Service', 'Privacy Protocol', 'API Docs', 'Report False Positive'].map(link => (
              <a key={link} href="#" className="text-[11px] text-white/30 hover:text-white/60 transition-colors uppercase tracking-wider">
                {link}
              </a>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}
