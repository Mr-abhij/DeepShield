// Navbar is only used for the landing page (MainLayout).
// Internal app pages use AppLayout + Sidebar instead.
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-4 border-b border-white/5 bg-[#0B0A10]">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded border border-brand-cyan/50 flex items-center justify-center">
          <span className="text-brand-cyan font-bold text-[10px]">DS</span>
        </div>
        <span style={{ fontFamily: 'Space Grotesk, sans-serif' }} className="font-bold text-sm tracking-widest uppercase text-white">
          DeepShield AI
        </span>
      </div>
      <div className="flex items-center gap-6">
        <Link to="/dashboard" className="text-sm text-white/50 hover:text-brand-cyan uppercase tracking-wider transition-colors">Dashboard</Link>
        <Link to="/social"    className="text-sm text-white/50 hover:text-brand-cyan uppercase tracking-wider transition-colors">URL Scanner</Link>
        <Link to="/history"   className="text-sm text-white/50 hover:text-brand-cyan uppercase tracking-wider transition-colors">Vault History</Link>
      </div>
      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10" />
    </nav>
  );
}
