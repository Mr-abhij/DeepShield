import { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Circle } from 'lucide-react';
import { scanWebcamFrame } from '../services/api';

interface LogEntry { time: string; msg: string; highlight: boolean; }

const INIT_LOGS: LogEntry[] = [
  { time: '14:22:01', msg: 'SYSTEM INITIALIZED...', highlight: false },
  { time: '14:22:03', msg: 'HANDSHAKE_SUCCESS::SEC', highlight: true },
  { time: '14:22:15', msg: 'FACE_DETECT::ENTITY_A-774', highlight: false },
  { time: '14:22:16', msg: 'SCAN_STARTED::VECTOR_HA...', highlight: true },
  { time: '14:22:18', msg: 'DEPTH_MAPPING_COMPLETE', highlight: false },
];

export default function WebcamScan() {
  const webcamRef = useRef<Webcam>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>(INIT_LOGS);
  const [scanLabel, setScanLabel] = useState('');
  const logRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string, highlight = false) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    setLogs(prev => [...prev.slice(-30), { time, msg, highlight }]);
    setTimeout(() => logRef.current?.scrollTo({ top: 9999, behavior: 'smooth' }), 50);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isScanning) {
      interval = setInterval(async () => {
        const screenshot = webcamRef.current?.getScreenshot();
        if (!screenshot) return;

        addLog('RE-SCANNING_FRAME_SEGMENT...', false);
        try {
          const result = await scanWebcamFrame(screenshot);
          const auth = result.authenticity_score ?? 0;
          const fake = result.fake_probability ?? 0;
          setConfidence(auth);
          setScanLabel(result.risk_level ?? '');
          addLog(`NEURAL_CONFIDENCE::${auth.toFixed(1)}%`, true);
          addLog(`WARNING::PIXEL_AI_SCORE_${fake.toFixed(1)}%`, fake > 50);
        } catch {
          addLog('AI_MODEL_WEIGHTS_SYNC_ERROR', true);
        }
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  const toggleScan = () => {
    if (!isScanning) {
      addLog('HEARTBEAT_PULSE::OK', true);
      addLog('→ MONITORING LIVE...', false);
    } else {
      addLog('SCAN_STOPPED', false);
      setConfidence(null);
      setScanLabel('');
    }
    setIsScanning(!isScanning);
  };

  const confColor = confidence === null
    ? 'text-white/40'
    : confidence > 75 ? 'text-brand-green'
    : confidence > 50 ? 'text-brand-yellow'
    : 'text-brand-red';

  return (
    <div className="flex flex-col gap-6">
      {/* Sidebar system status (shown inline above on mobile) */}
      <div className="flex items-center gap-2">
        <Circle className="w-2 h-2 fill-brand-green text-brand-green" />
        <span style={{ fontFamily: 'JetBrains Mono, monospace' }} className="text-[11px] uppercase tracking-widest text-white/40">
          Forensic Core Active
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Left – Camera Feed */}
        <div className="flex flex-col gap-4">
          {/* Feed Label */}
          <div className="flex items-center justify-between">
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace' }} className="text-[10px] text-white/20 uppercase tracking-widest mb-0.5">
                CAMERA_FEED_01 // LIVE
              </div>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif' }} className="text-white font-bold uppercase tracking-widest text-lg">
                DEEPSHIELD_TERMINAL
              </div>
            </div>
            {confidence !== null && (
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-widest text-white/30">Detection Confidence</div>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif' }} className={`text-3xl font-bold ${confColor}`}>
                  {confidence.toFixed(1)}%
                </div>
              </div>
            )}
          </div>

          {/* Webcam view */}
          <div className="relative bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: 'user' }}
              className="w-full h-full object-cover opacity-90"
            />

            {isScanning && (
              <>
                {/* Scanning box overlay */}
                <div className="absolute top-1/4 left-1/3 w-1/3 h-2/5 border border-brand-cyan/70 rounded pointer-events-none">
                  <div className="absolute -top-5 left-0 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-brand-cyan">
                    SUBJECT_01_VERIFIED
                  </div>
                  {/* Corner ticks */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-brand-cyan" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-brand-cyan" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-brand-cyan" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-brand-cyan" />
                </div>

                {/* Horizontal scan line */}
                <motion.div
                  animate={{ top: ['25%', '65%', '25%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="absolute left-0 right-0 h-px bg-brand-cyan/40 pointer-events-none"
                />

                {/* REC indicator */}
                <div className="absolute top-4 left-4 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
                  <span style={{ fontFamily: 'JetBrains Mono, monospace' }} className="text-xs text-brand-red uppercase tracking-widest">REC</span>
                </div>
              </>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button className="w-10 h-10 bg-brand-panel border border-white/10 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors">
              <Square className="w-4 h-4 text-white/40" />
            </button>
            <button className="w-10 h-10 bg-brand-panel border border-white/10 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors">
              <Mic className="w-4 h-4 text-white/40" />
            </button>
            <button
              onClick={toggleScan}
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              className={`px-8 py-2.5 font-bold uppercase tracking-wider text-sm rounded-full transition-all ${
                isScanning
                  ? 'bg-brand-panel border border-brand-red text-brand-red hover:bg-brand-red/10'
                  : 'bg-brand-cyan text-[#0B0A10] hover:shadow-[0_0_15px_rgba(0,229,255,0.4)]'
              }`}
            >
              {isScanning ? 'Stop Scan' : 'Capture Forensics'}
            </button>
            {isScanning && (
              <button className="w-10 h-10 bg-brand-red/20 border border-brand-red/40 rounded-full flex items-center justify-center">
                <Square className="w-4 h-4 text-brand-red" />
              </button>
            )}
          </div>

          {/* Bottom metrics */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Injection Attack Risk', value: 'LOW', color: 'text-brand-green' },
              { label: 'Compression Artifacts', value: 'NOMINAL', color: 'text-brand-green' },
              { label: 'System Status', value: scanLabel || 'CRYPTO_VERIFIED', color: 'text-brand-cyan' },
            ].map(m => (
              <div key={m.label} className="bg-brand-panel border border-white/5 rounded-lg p-3">
                <div className="text-[9px] uppercase tracking-widest text-white/20 mb-1">{m.label}</div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mb-1.5">
                  <div className="h-full w-1/4 bg-brand-green rounded-full" />
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace' }} className={`text-[11px] font-bold ${m.color}`}>{m.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right – Forensic Logs */}
        <div className="bg-brand-panel border border-white/5 rounded-xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <span style={{ fontFamily: 'Space Grotesk, sans-serif' }} className="text-xs font-bold uppercase tracking-widest text-white">
              Forensic Logs
            </span>
            <span className="text-white/20 text-xs">{`</>`}</span>
          </div>
          <div
            ref={logRef}
            className="flex-1 overflow-y-auto p-4 space-y-1.5"
            style={{ maxHeight: 480 }}
          >
            <AnimatePresence>
              {logs.map((log, i) => (
                <motion.div
                  key={`${log.time}-${i}`}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  className={`text-[11px] leading-relaxed ${log.highlight ? 'text-brand-cyan' : 'text-white/30'}`}
                >
                  <span className="text-white/20">[{log.time}]</span> {log.msg}
                </motion.div>
              ))}
            </AnimatePresence>
            <div style={{ fontFamily: 'JetBrains Mono, monospace' }} className="text-[11px] text-white/20">
              → EXECUTE_COMMAND...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
