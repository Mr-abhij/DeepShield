import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// Material Symbol icon component
function MSIcon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
}

export default function Landing() {
  return (
    <div className="bg-surface text-on-surface font-sans selection:bg-primary-container selection:text-on-primary min-h-screen flex flex-col">

      {/* ── Top App Bar ── */}
      <header className="bg-surface-container-lowest/40 backdrop-blur-2xl fixed top-0 z-50 border-b border-outline-variant/20 shadow-2xl w-full">
        <div className="flex justify-between items-center px-10 py-4 w-full max-w-[1440px] mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <MSIcon name="security" className="text-primary-container" />
            <h1 className="text-[24px] font-bold leading-tight tracking-wide text-primary-container drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              DeepShield AI
            </h1>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/dashboard"
              className="text-primary-container font-bold border-b-2 border-primary-container text-[12px] font-mono uppercase tracking-widest"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Dashboard
            </Link>
            <Link to="/social"
              className="text-on-surface-variant hover:text-primary-container transition-all text-[12px] font-mono uppercase tracking-widest"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              URL Scanner
            </Link>
            <Link to="/history"
              className="text-on-surface-variant hover:text-primary-container transition-all text-[12px] font-mono uppercase tracking-widest"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Vault History
            </Link>
          </nav>

          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full border border-primary-container/30 overflow-hidden bg-surface-container-high flex items-center justify-center">
              <MSIcon name="person" className="text-on-surface-variant text-[20px]" />
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-grow pt-24 bg-mesh">

        {/* Hero Section */}
        <section className="relative px-10 py-8 max-w-[1440px] mx-auto flex flex-col items-center text-center">
          {/* Glow blob */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-container/10 blur-[120px] -z-10 rounded-full" />

          {/* Status pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1 glass-card border border-primary-container/20 rounded-full mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
            <span style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              className="text-[12px] font-mono font-bold uppercase tracking-widest text-primary-container">
              SYSTEM STATUS: OPERATIONAL
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            className="text-[64px] md:text-[84px] font-bold leading-tight text-on-surface max-w-4xl mb-4 tracking-tighter"
          >
            Detect{' '}
            <span className="text-primary-container drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]">Deepfakes</span>{' '}
            Before They Spread
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-[24px] font-semibold leading-snug tracking-wide text-on-surface-variant max-w-2xl mb-8 opacity-80"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            AI-powered authenticity analysis for images, videos, and media. Protect digital integrity with forensic-grade neural network evaluation.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="flex gap-4"
          >
            <Link to="/dashboard"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              className="bg-primary-container text-surface px-10 py-4 text-[12px] font-mono font-bold uppercase rounded-sm shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_35px_rgba(0,240,255,0.6)] transition-all active:scale-95"
            >
              Launch Scanner
            </Link>
            <button
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              className="border border-primary-container/50 text-primary-container px-10 py-4 text-[12px] font-mono font-bold uppercase rounded-sm hover:bg-primary-container/10 transition-all"
            >
              View Protocols
            </button>
          </motion.div>
        </section>

        {/* ── Feature Bento Grid ── */}
        <section className="px-10 py-8 max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

            {/* Main Feature — Video Analysis (col-span-8) */}
            <motion.div
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="md:col-span-8 glass-card glass-card-hover p-5 rounded-xl relative overflow-hidden group transition-all duration-300"
            >
              {/* Scan line overlay */}
              <div className="scan-line absolute top-0 left-0 w-full z-10 opacity-30" />
              <div className="flex flex-col h-full justify-between relative z-20">
                <div>
                  <MSIcon name="videocam" className="text-primary-container mb-4 text-[40px]" />
                  <h3 style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    className="text-[24px] font-semibold leading-tight tracking-wide text-primary mb-2">
                    Video Analysis Forensics
                  </h3>
                  <p className="text-on-surface-variant max-w-md">
                    Frame-by-frame scrutiny using spatial-temporal neural networks to identify synthetic biological markers.
                  </p>
                </div>
                <div className="mt-8 rounded-lg overflow-hidden border border-outline-variant/30 h-64 bg-surface-container-high flex items-center justify-center">
                  {/* Placeholder forensics image with overlay effect */}
                  <div className="relative w-full h-full bg-surface-container flex items-center justify-center">
                    <div className="absolute inset-0 bg-primary-container/5" />
                    <div className="flex flex-col items-center gap-3 opacity-40 group-hover:opacity-60 transition-opacity">
                      <MSIcon name="face_retouching_natural" className="text-primary-container text-[64px]" />
                      <div className="flex gap-6">
                        {['EYE VECTOR', 'SKIN MESH', 'DEPTH MAP'].map(l => (
                          <div key={l} className="flex flex-col items-center gap-1">
                            <div className="w-16 h-1 bg-primary-container/60 rounded-full" />
                            <span style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                              className="text-[10px] text-primary-container/60 font-mono uppercase tracking-widest">{l}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Heatmap Detection (col-span-4) */}
            <motion.div
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}
              className="md:col-span-4 glass-card glass-card-hover p-5 rounded-xl flex flex-col justify-between transition-all duration-300"
            >
              <div>
                <MSIcon name="grid_view" className="text-secondary mb-4 text-[40px]" />
                <h3 style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  className="text-[24px] font-semibold leading-tight tracking-wide text-secondary mb-2">
                  Heatmap Detection
                </h3>
                <p className="text-on-surface-variant">
                  Visualizing manipulation probability zones through deep learning attention maps.
                </p>
              </div>
              <div className="mt-6 p-4 bg-surface-container-high rounded-lg border border-outline-variant/20">
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    className="text-[12px] font-mono uppercase tracking-widest text-secondary">PROBABILITY SCORE</span>
                  <span style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    className="text-[12px] font-mono text-secondary">98.4%</span>
                </div>
                <div className="w-full bg-surface-variant h-2 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full shadow-[0_0_10px_#d1bcff]" style={{ width: '98.4%' }} />
                </div>
              </div>
            </motion.div>

            {/* Deepfake Detection (col-span-4) */}
            <motion.div
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.12 }}
              className="md:col-span-4 glass-card glass-card-hover p-5 rounded-xl transition-all duration-300"
            >
              <MSIcon name="fingerprint" className="text-tertiary mb-4 text-[40px]" />
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                className="text-[24px] font-semibold leading-tight tracking-wide text-tertiary mb-2">
                Deepfake Detection
              </h3>
              <p className="text-on-surface-variant">
                Advanced algorithmic checks for GAN-generated artifacts and blending inconsistencies.
              </p>
            </motion.div>

            {/* Real-Time Scan (col-span-8) */}
            <motion.div
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.16 }}
              className="md:col-span-8 glass-card glass-card-hover p-5 rounded-xl flex flex-col md:flex-row gap-6 items-center transition-all duration-300"
            >
              <div className="flex-1">
                <MSIcon name="bolt" className="text-primary-container mb-4 text-[40px]" />
                <h3 style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  className="text-[24px] font-semibold leading-tight tracking-wide text-primary mb-2">
                  Real-Time Scan
                </h3>
                <p className="text-on-surface-variant">
                  Low-latency processing for live stream authentication and immediate media verification API.
                </p>
              </div>
              <div className="flex-1 w-full flex flex-col gap-2">
                {[
                  'LATENCY: 42MS',
                  'THROUGHPUT: 4K/60FPS',
                ].map(stat => (
                  <div key={stat} className="flex gap-2 items-center text-primary-container/60"
                    style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, letterSpacing: '0.05em' }}>
                    <span className="w-1 h-1 bg-primary-container rounded-full" />
                    <span className="font-mono">{stat}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── System Protocol Workflow ── */}
        <section className="px-10 py-8 max-w-[1440px] mx-auto mt-24">
          <div className="text-center mb-16">
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              className="text-[24px] font-semibold tracking-widest text-on-surface mb-2 uppercase">
              SYSTEM PROTOCOL
            </h2>
            <div className="w-24 h-1 bg-primary-container mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-8 left-0 w-full h-px bg-outline-variant/30 -z-10" />

            {[
              { num: '01', title: 'Ingestion',     desc: 'Raw media data is securely uploaded to our forensic environment via encrypted tunnel.' },
              { num: '02', title: 'Decomposition', desc: 'Media is fragmented into semantic and structural components for multi-layer analysis.' },
              { num: '03', title: 'AI Forensics',  desc: 'Proprietary neural networks scan for synthetic noise and biological inconsistencies.' },
              { num: '04', title: 'Certification', desc: 'DeepShield generates a cryptographically signed report of authenticity.' },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center border-2 border-outline-variant group-hover:border-primary-container transition-all duration-300 relative">
                  <span style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    className="text-on-surface text-[12px] font-mono font-bold tracking-widest">{step.num}</span>
                  <div className="absolute -inset-2 rounded-full border border-primary-container/0 group-hover:border-primary-container/20 transition-all duration-500" />
                </div>
                <h4 style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  className="mt-6 text-[16px] font-bold text-primary uppercase tracking-widest">{step.title}</h4>
                <p className="mt-2 text-[13px] leading-relaxed text-on-surface-variant px-4">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── CTA Section ── */}
        <section className="px-10 py-32 max-w-[1440px] mx-auto text-center relative overflow-hidden mt-20">
          <div className="absolute inset-0 bg-primary-container/5 rounded-3xl -z-10" />
          <div className="relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              className="text-[48px] font-bold leading-tight tracking-tight mb-4"
            >
              Ready to Secure the Truth?
            </motion.h2>
            <p className="text-on-surface-variant text-[16px] leading-relaxed max-w-xl mx-auto mb-8">
              Join global security agencies and media outlets in the fight against digital misinformation.
            </p>
            <div className="glass-card max-w-lg mx-auto flex p-2 rounded-lg border border-primary-container/30">
              <input
                className="bg-transparent border-none outline-none text-on-surface flex-grow px-4 placeholder-on-surface-variant/40"
                style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, letterSpacing: '0.1em' }}
                placeholder="ENTER ANALYST EMAIL"
                type="email"
              />
              <button
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                className="bg-primary-container text-surface px-6 py-3 text-[12px] font-mono font-bold uppercase hover:bg-primary-container/80 transition-all"
              >
                Request Access
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-surface-container-lowest w-full py-8 border-t border-outline-variant/10">
        <div className="flex flex-col md:flex-row justify-between items-center px-10 max-w-screen-2xl mx-auto">
          <div className="mb-4 md:mb-0">
            <span style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              className="text-[12px] font-mono font-bold tracking-widest uppercase text-primary-container">
              DEEPSHIELD AI FORENSICS
            </span>
            <p className="text-[13px] opacity-60 text-primary mt-2">
              © 2025 DEEPSHIELD AI FORENSICS. ALL DATA ENCRYPTED.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {['Terms of Service', 'Privacy Protocol', 'API Docs', 'Report False Positive'].map(link => (
              <a key={link} href="#"
                className="text-[13px] text-on-surface-variant hover:text-tertiary-fixed-dim hover:underline transition-all">
                {link}
              </a>
            ))}
          </div>
          <div className="mt-4 md:mt-0 flex gap-4">
            <MSIcon name="terminal" className="text-on-surface-variant hover:text-primary-container cursor-pointer transition-colors" />
            <MSIcon name="language" className="text-on-surface-variant hover:text-primary-container cursor-pointer transition-colors" />
            <MSIcon name="database" className="text-on-surface-variant hover:text-primary-container cursor-pointer transition-colors" />
          </div>
        </div>
      </footer>
    </div>
  );
}
