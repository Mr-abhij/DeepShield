import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ExternalLink, Loader2, Circle, PlayCircle, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeMedia, getScanHistory, checkBackendHealth, type HistoryRecord } from '../services/api';

// ── Demo samples ────────────────────────────────────────────────────────────
// These are hosted public test images well-suited for demo
const DEMO_SAMPLES = {
  real: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Gatto_europeo4.jpg/800px-Gatto_europeo4.jpg',
  fake: '/sample.jpg', // locally cached
};

// ── Terminal boot logs ────────────────────────────────────────────────────────
const BOOT_LOGS = [
  { time: '08:42:12', msg: 'Initializing Scan Module V.2.4.9...', highlight: true },
  { time: '08:42:13', msg: 'Loading neural weights: ResNet-152_Forensic', highlight: false },
  { time: '08:42:15', msg: 'Waiting for input stream...', highlight: false },
];

interface LogEntry { time: string; msg: string; highlight: boolean }

export default function Dashboard() {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>(BOOT_LOGS);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  // ── Backend health check on mount ──────────────────────────────────────────
  useEffect(() => {
    checkBackendHealth().then(setBackendOnline);
    getScanHistory(3).then(data => setHistory(data));
  }, []);

  const addLog = (msg: string, highlight = false) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    setLogs(prev => [...prev.slice(-20), { time, msg, highlight }]);
    setTimeout(() => logRef.current?.scrollTo({ top: 9999, behavior: 'smooth' }), 50);
  };

  const runAnalysis = async (file: File) => {
    setIsAnalyzing(true);
    setUploadPct(0);
    addLog(`Input detected: ${file.name}`, true);
    addLog(`File size: ${(file.size / 1024).toFixed(0)} KB`, false);
    addLog('Uploading to forensic engine...', false);

    try {
      const result = await analyzeMedia(file, pct => {
        setUploadPct(pct);
        if (pct === 100) addLog('Upload complete. Running AI pipeline...', true);
      });

      addLog(`Authenticity: ${result.authenticity_score.toFixed(1)}%`, true);
      addLog(`Fake probability: ${result.fake_probability.toFixed(1)}%`, false);
      addLog(`Risk level: ${result.risk_level}`, result.risk_level === 'High');
      addLog('Analysis complete. Redirecting...', true);

      navigate('/analysis', { state: { file, result } });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      addLog(`Error: ${msg}`, true);
      setIsAnalyzing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) runAnalysis(file);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) runAnalysis(file);
    e.target.value = ''; // reset so same file can be re-selected
  };

  // ── Demo helpers ───────────────────────────────────────────────────────────
  const loadUrlAsFile = async (url: string, name: string): Promise<File> => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch demo: ${url}`);
    const blob = await response.blob();
    return new File([blob], name, { type: blob.type || 'image/jpeg' });
  };

  const runDemoReal = async () => {
    try {
      addLog('Loading demo: authentic sample...', true);
      const file = await loadUrlAsFile(DEMO_SAMPLES.real, 'demo_real_sample.jpg');
      runAnalysis(file);
    } catch {
      addLog('Demo failed — check internet connection', true);
    }
  };

  const runDemoFake = async () => {
    try {
      addLog('Loading demo: synthetic sample...', true);
      const file = await loadUrlAsFile(DEMO_SAMPLES.fake, 'demo_synthetic_sample.jpg');
      runAnalysis(file);
    } catch {
      addLog('Demo sample not found at /sample.jpg', true);
    }
  };

  const getRiskStyle = (risk: string) => {
    if (risk === 'High') return 'text-brand-red border-brand-red/50 bg-brand-red/10';
    if (risk === 'Medium') return 'text-brand-yellow border-brand-yellow/50 bg-brand-yellow/10';
    return 'text-brand-green border-brand-green/50 bg-brand-green/10';
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Backend status bar */}
      {backendOnline !== null && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 text-[11px] font-mono px-3 py-2 rounded border w-fit ${
            backendOnline
              ? 'border-brand-green/30 bg-brand-green/5 text-brand-green'
              : 'border-brand-red/30 bg-brand-red/5 text-brand-red'
          }`}
        >
          {backendOnline
            ? <><CheckCircle className="w-3 h-3" /> AI Engine Online — Ready</>
            : <><XCircle className="w-3 h-3" /> Backend Offline — Start server on port 10000</>}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* ── Left column ── */}
        <div className="flex flex-col gap-6">
          {/* Drop Zone */}
          <div
            onDragEnter={handleDrag} onDragLeave={handleDrag}
            onDragOver={handleDrag} onDrop={handleDrop}
            className={`relative bg-brand-panel border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-16 transition-all ${
              dragActive ? 'border-brand-cyan bg-brand-cyan/5' : 'border-white/10 hover:border-white/20'
            }`}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/x-msvideo"
              onChange={handleFileInput}
              disabled={isAnalyzing}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <AnimatePresence mode="wait">
              {isAnalyzing ? (
                <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 text-brand-cyan animate-spin" />
                  <span style={{ fontFamily: 'Space Grotesk, sans-serif' }} className="text-brand-cyan text-sm uppercase tracking-widest">
                    {uploadPct < 100 ? `Uploading ${uploadPct}%...` : 'AI Processing...'}
                  </span>
                  {/* Upload progress bar */}
                  {uploadPct > 0 && uploadPct < 100 && (
                    <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-brand-cyan rounded-full"
                        animate={{ width: `${uploadPct}%` }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3 text-center pointer-events-none">
                  <Upload className="w-10 h-10 text-brand-cyan" />
                  <p style={{ fontFamily: 'Space Grotesk, sans-serif' }} className="text-brand-cyan text-xl font-bold">
                    Drop media to scan
                  </p>
                  <p className="text-white/40 text-sm">Upload JPG, PNG, or MP4 for deep forensic analysis.</p>
                </motion.div>
              )}
            </AnimatePresence>

            {!isAnalyzing && (
              <div className="flex gap-3 mt-8 pointer-events-auto relative z-10">
                <label className="cursor-pointer">
                  <input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime" onChange={handleFileInput} className="hidden" />
                  <span style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    className="px-6 py-2.5 border border-brand-cyan text-brand-cyan text-sm font-bold uppercase tracking-wider rounded hover:bg-brand-cyan hover:text-[#0B0A10] transition-all block">
                    Browse Files
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Demo Mode Panel */}
          {!isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-brand-panel border border-brand-purple/20 rounded-xl p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <PlayCircle className="w-4 h-4 text-brand-purple" />
                <span style={{ fontFamily: 'Space Grotesk, sans-serif' }} className="text-sm font-bold uppercase tracking-wider text-white">
                  Hackathon Demo Mode
                </span>
                <span className="ml-auto text-[10px] text-white/20 font-mono uppercase tracking-widest">Quick test samples</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={runDemoReal}
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  className="flex-1 py-2.5 border border-brand-green/40 text-brand-green text-sm font-bold uppercase tracking-wider rounded hover:bg-brand-green/10 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Try Real Example
                </button>
                <button
                  onClick={runDemoFake}
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  className="flex-1 py-2.5 border border-brand-red/40 text-brand-red text-sm font-bold uppercase tracking-wider rounded hover:bg-brand-red/10 transition-all flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" /> Try Fake Example
                </button>
              </div>
            </motion.div>
          )}

          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Authenticity Score', value: '—' },
              { label: 'Face Consistency',   value: 'AWAIT' },
              { label: 'Metadata Integrity', value: 'AWAIT' },
              { label: 'GAN Artifacts',      value: 'AWAIT' },
            ].map(card => (
              <div key={card.label} className="bg-brand-panel border border-white/5 rounded-xl p-4">
                <div className="text-[10px] uppercase tracking-widest text-white/30 mb-2">{card.label}</div>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif' }} className="text-white font-bold text-lg">{card.value}</div>
              </div>
            ))}
          </div>

          {/* Recent Case History */}
          {history.length > 0 && (
            <div className="bg-brand-panel border border-white/5 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <span style={{ fontFamily: 'Space Grotesk, sans-serif' }} className="text-sm font-bold uppercase tracking-wider text-white">
                  Recent Case History
                </span>
                <button onClick={() => navigate('/history')} className="flex items-center gap-1 text-brand-cyan text-xs uppercase tracking-wider hover:underline">
                  View All <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-white/20">
                    <th className="px-5 py-3">File</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(rec => (
                    <tr key={rec.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-5 py-3 text-sm text-white font-medium truncate max-w-[180px]">{rec.filename}</td>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace' }} className="px-5 py-3 text-xs text-white/40 uppercase">{rec.media_type}</td>
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-1.5 text-brand-green text-xs uppercase tracking-wider">
                          <Circle className="w-2 h-2 fill-brand-green" /> Complete
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${getRiskStyle(rec.risk_level)}`}>
                          {rec.risk_level}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Right — Neural Engine Logs ── */}
        <div className="flex flex-col gap-4">
          <div className="bg-brand-panel border border-white/5 rounded-xl overflow-hidden flex flex-col" style={{ minHeight: 340 }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-black/20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-sm bg-brand-cyan" />
                <span style={{ fontFamily: 'Space Grotesk, sans-serif' }} className="text-xs font-bold uppercase tracking-widest text-white">
                  Neural Engine Logs
                </span>
              </div>
              <div className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
            </div>
            <div ref={logRef} className="flex-1 overflow-y-auto p-4 space-y-2" style={{ maxHeight: 320 }}>
              {logs.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  className={`text-[11px] leading-relaxed ${log.highlight ? 'text-brand-cyan font-bold' : 'text-white/40'}`}
                >
                  [{log.time}] {log.msg}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Neural Reconstruction card */}
          <div className="bg-brand-panel border border-white/5 rounded-xl p-5">
            <div className="text-[10px] uppercase tracking-widest text-brand-cyan mb-2">Active Investigation</div>
            <h4 style={{ fontFamily: 'Space Grotesk, sans-serif' }} className="text-white font-bold text-lg mb-2">
              Neural Reconstruction Unit
            </h4>
            <p className="text-white/40 text-xs leading-relaxed mb-4">
              SynthGuard runs cross-domain semantic analysis on your media to identify non-pixel based artifacts.
            </p>
            <button
              onClick={() => navigate('/webcam')}
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              className="w-full py-2 bg-brand-purple text-white font-bold uppercase tracking-wider text-xs rounded hover:bg-brand-purple/80 transition-colors"
            >
              Launch Neural Viewer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
