import { useState } from 'react';
import { Globe, Loader2, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { scanUrl } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

interface ScanResult {
  authenticity_score?: number;
  authenticityScore?: number;
  fake_probability?: number;
  risk_level?: string;
  riskLevel?: string;
  explanation?: string;
  metadata_flags?: string[];
}

export default function SocialScan() {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState('');

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setIsScanning(true);
    setResult(null);
    setError('');

    // Validate URL format
    try {
      new URL(url);
    } catch {
      setError('Invalid URL format. Please enter a valid http/https URL pointing to an image.');
      setIsScanning(false);
      return;
    }

    try {
      const res = await scanUrl(url);
      setResult(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Scan failed. Ensure the URL points directly to an image file and the backend is running.');
    } finally {
      setIsScanning(false);
    }
  };

  const score = result?.authenticity_score ?? result?.authenticityScore ?? 0;
  const risk = result?.risk_level ?? result?.riskLevel ?? '';
  const isHighRisk = risk === 'High';

  const riskColor = isHighRisk ? '#FF4B4B' : risk === 'Medium' ? '#FFC53D' : '#00D19D';
  const riskLabel = isHighRisk ? 'High Risk' : risk === 'Medium' ? 'Suspicious' : 'Low Risk';

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Header */}
      <div>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif' }} className="text-white font-bold text-2xl mb-1">
          Deep Social & URL Forensic Scanner
        </div>
        <p className="text-white/40 text-sm">
          Paste a link to a public image to run a full forensic deepfake analysis.
        </p>
      </div>

      {/* Input */}
      <form onSubmit={handleScan} className="bg-brand-panel border border-white/5 rounded-xl p-6 flex flex-col gap-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              required
              placeholder="Paste social media URL or media link for forensic analysis..."
              className="w-full bg-[#0B0A10] border border-white/10 rounded pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-cyan transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={!url || isScanning}
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            className="flex items-center gap-2 px-6 py-3 bg-brand-cyan text-[#0B0A10] font-bold uppercase tracking-wider text-sm rounded hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {isScanning ? 'Scanning...' : 'Scan Entity'}
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-brand-red/10 border border-brand-red/30 rounded-lg p-3">
            <AlertTriangle className="w-4 h-4 text-brand-red shrink-0 mt-0.5" />
            <p className="text-brand-red text-sm">{error}</p>
          </div>
        )}
      </form>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-brand-panel border border-white/5 rounded-xl overflow-hidden"
          >
            {/* Result header */}
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <span style={{ fontFamily: 'Space Grotesk, sans-serif' }} className="font-bold text-white">
                Forensic Analysis Complete
              </span>
              <div className="flex items-center gap-2">
                {isHighRisk
                  ? <AlertTriangle className="w-4 h-4 text-brand-red" />
                  : <CheckCircle className="w-4 h-4 text-brand-green" />}
                <span className="text-sm font-bold" style={{ color: riskColor }}>{riskLabel}</span>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Score gauge */}
              <div className="flex flex-col items-center justify-center gap-2 bg-black/40 rounded-xl p-6 border border-white/5">
                <div className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Authenticity Score</div>
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="rgba(255,255,255,0.05)" strokeWidth="10" fill="none" />
                    <circle
                      cx="64" cy="64" r="56"
                      stroke={riskColor}
                      strokeWidth="10" fill="none"
                      strokeDasharray={352}
                      strokeDashoffset={352 - (352 * score) / 100}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span style={{ fontFamily: 'Space Grotesk, sans-serif', color: riskColor }} className="text-3xl font-bold">
                      {score.toFixed(1)}
                    </span>
                    <span className="text-white/30 text-xs">/ 100</span>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="flex flex-col gap-3">
                <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                  <div className="text-[10px] uppercase tracking-widest text-white/20 mb-1">Fake Probability</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace' }} className="text-2xl font-bold text-brand-red">
                    {(result.fake_probability ?? 0).toFixed(1)}%
                  </div>
                </div>
                {result.metadata_flags && result.metadata_flags.length > 0 && (
                  <div className="bg-brand-yellow/5 border border-brand-yellow/20 rounded-xl p-4">
                    <div className="text-[10px] uppercase tracking-widest text-brand-yellow mb-2">Metadata Flags</div>
                    {result.metadata_flags.map((flag, i) => (
                      <div key={i} style={{ fontFamily: 'JetBrains Mono, monospace' }} className="text-xs text-white/60 mb-1">
                        • {flag}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Explanation */}
              <div className="md:col-span-2 bg-black/40 border border-white/5 rounded-xl p-4">
                <div className="text-[10px] uppercase tracking-widest text-brand-cyan mb-3">AI Forensic Report</div>
                <p style={{ fontFamily: 'JetBrains Mono, monospace' }} className="text-sm text-white/60 leading-relaxed">
                  {result.explanation}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
