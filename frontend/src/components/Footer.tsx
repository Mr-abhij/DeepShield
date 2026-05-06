export default function Footer() {
  return (
    <footer className="border-t border-white/5 px-8 py-5 flex justify-between items-center bg-[#0B0A10]">
      <span style={{ fontFamily: 'JetBrains Mono, monospace' }} className="text-brand-cyan text-xs uppercase tracking-wider">
        DeepShield AI Forensics
      </span>
      <span style={{ fontFamily: 'JetBrains Mono, monospace' }} className="text-white/20 text-xs">
        © 2025 All Data Encrypted.
      </span>
      <div className="flex gap-6">
        {['Terms of Service', 'Privacy Protocol', 'API Docs', 'Report False Positive'].map(link => (
          <a key={link} href="#" className="text-white/30 text-xs uppercase tracking-wider hover:text-white/60 transition-colors">
            {link}
          </a>
        ))}
      </div>
    </footer>
  );
}
