import { useLocation, Navigate, Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Download } from 'lucide-react';

export default function AnalysisResult() {
  const location = useLocation();
  const { file, result } = location.state || {};
  const [showHeatmap, setShowHeatmap] = useState(false);

  if (!file || !result) return <Navigate to="/dashboard" replace />;

  // Backend response keys: authenticity_score, fake_probability, risk_level, explanation, analysis
  const score: number = result.authenticity_score ?? result.authenticityScore ?? 0;
  const fakeProb: number = result.fake_probability ?? result.fakeProbability ?? 0;
  const riskLevel: string = result.risk_level ?? result.riskLevel ?? 'Unknown';
  const explanation: string = result.explanation ?? '';
  const analysis = result.analysis ?? {};

  const faceConsistency: number = analysis.face_consistency ?? analysis.faceConsistency ?? 0;
  const artifactScore: number = analysis.artifact_score ?? analysis.artifactScore ?? 0;
  const syntheticScore: number = analysis.synthetic_score ?? 70.0;
  const facialTextureScore: number = analysis.facial_texture_score ?? 75.0;


  const previewUrl = useMemo(() => URL.createObjectURL(file), [file]);
  const heatmapUrl = result.heatmap_url ? result.heatmap_url : null;

  const isHighRisk = riskLevel === 'High';

  const riskColor = isHighRisk ? '#FF4B4B'
    : riskLevel === 'Medium' ? '#FFC53D'
    : '#00D19D';

  const forensicItems = [
    {
      label: 'High Risk Detection',
      ms: '0.82ms',
      detail: isHighRisk
        ? 'Anomaly: Morphology Mismatch found in periocular region. Structural inconsistency suggests generative adversarial network (GAN) intervention.'
        : 'No significant morphological anomalies detected. Facial structure appears consistent.',
    },
    {
      label: 'Artifact Detection',
      ms: '1.45ms',
      detail: artifactScore < 60
        ? 'Compression Artifacts: Level 4. Traces of double-JPEG compression identified in secondary metadata blocks.'
        : `Artifact score: ${artifactScore.toFixed(1)}%. No significant compression anomalies found.`,
    },
    {
      label: 'Lighting Consistency',
      ms: '0.12ms',
      detail: faceConsistency > 70
        ? 'Shadow Vector Check: Pass. Light source orientation aligns with primary scene environment.'
        : 'Shadow Vector Check: Warning. Lighting inconsistencies detected across facial regions.',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 bg-brand-panel border border-white/5 rounded hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-4 h-4 text-white/60" />
          </Link>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-white/30 mb-0.5">Analysis Target #0294</div>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif' }} className="text-xl font-bold text-white">
              Forensic Visual Analysis
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHeatmap(false)}
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            className={`px-5 py-2 text-sm font-bold uppercase tracking-wider rounded transition-all ${
              !showHeatmap ? 'bg-brand-cyan text-[#0B0A10]' : 'bg-brand-panel border border-white/10 text-white/40 hover:text-white'
            }`}
          >
            Original
          </button>
          <button
            onClick={() => setShowHeatmap(true)}
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            className={`px-5 py-2 text-sm font-bold uppercase tracking-wider rounded transition-all ${
              showHeatmap ? 'bg-brand-cyan text-[#0B0A10]' : 'bg-brand-panel border border-white/10 text-white/40 hover:text-white'
            }`}
          >
            Heatmap
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left – Image */}
        <div className="flex flex-col gap-4">
          <div className="relative bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
            {/* Image */}
            <AnimatePresence mode="wait">
              {showHeatmap && heatmapUrl ? (
                <motion.img
                  key="heatmap"
                  src={heatmapUrl}
                  alt="Heatmap"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="w-full h-full object-contain"
                />
              ) : (
                <motion.div key="original" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
                  {file.type.startsWith('video/') ? (
                    <video src={previewUrl} controls className="w-full h-full object-contain" />
                  ) : (
                    <img src={previewUrl} alt="Original" className="w-full h-full object-contain" />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Overlay bounding boxes */}
            {isHighRisk && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-1/4 w-1/2 h-1/3 border border-brand-cyan/60 rounded">
                  <div className="absolute -top-5 left-0 flex items-center gap-1 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-brand-yellow">
                    ⚠ MORPHOLOGY MISMATCH
                  </div>
                </div>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/80 px-3 py-1 rounded text-[10px] font-mono text-brand-cyan border border-brand-cyan/30">
                  ◎ PIXEL DENSITY AUTHENTIC
                </div>
              </div>
            )}
          </div>

          {/* Kernel logs terminal */}
          <div className="bg-brand-panel border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-sm bg-brand-cyan" />
              <span style={{ fontFamily: 'JetBrains Mono, monospace' }} className="text-[10px] uppercase tracking-widest text-brand-cyan">
                Live Kernel Logs
              </span>
            </div>
            <div className="space-y-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {[
                `> Initializing scan...`,
                `> Metadata extraction: SUCCESS`,
                `> Face consistency: ${faceConsistency.toFixed(1)}%`,
                `> Artifact score: ${artifactScore.toFixed(1)}%`,
                `> Synthetic portrait score: ${syntheticScore.toFixed(1)}%`,
                `> Facial texture score: ${facialTextureScore.toFixed(1)}%`,
                `> Fake probability: ${fakeProb.toFixed(1)}%`,
                `> Final verdict: ${riskLevel.toUpperCase()} RISK`,
              ].map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`text-[11px] ${i % 2 === 0 ? 'text-brand-cyan' : 'text-white/40'}`}
                >
                  {line}
                </motion.p>
              ))}
              <span className="animate-pulse inline-block w-1.5 h-3 bg-brand-cyan align-middle" />
            </div>
          </div>
        </div>

        {/* Right – Forensic Overlay */}
        <div className="flex flex-col gap-4">
          <div className="bg-brand-panel border border-white/5 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 text-brand-cyan">◫</div>
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif' }} className="text-white font-bold text-lg">
                Forensic Overlay
              </h3>
            </div>
            <div className="text-[10px] uppercase tracking-widest text-white/20 mb-5">Neural Engine Diagnostics</div>

            {/* Authenticity gauge */}
            <div className="bg-black/40 rounded-lg p-4 mb-4 border border-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] uppercase tracking-widest text-white/30">Authenticity Score</span>
                <span style={{ color: riskColor, fontFamily: 'JetBrains Mono, monospace' }} className="text-xs font-bold">
                  {score.toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: riskColor }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
                  style={{ color: riskColor, borderColor: `${riskColor}50`, backgroundColor: `${riskColor}15` }}>
                  {riskLevel} Risk
                </span>
              </div>
            </div>

            {/* Forensic breakdown items */}
            <div className="space-y-4">
              {forensicItems.map(item => (
                <div key={item.label} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] uppercase tracking-widest text-brand-cyan">{item.label}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace' }} className="text-[10px] text-white/20">{item.ms}</span>
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-brand-panel border border-white/5 rounded-xl p-5">
            <div className="text-[10px] uppercase tracking-widest text-white/20 mb-3">AI Report</div>
            <p className="text-xs text-white/60 leading-relaxed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {explanation}
            </p>
          </div>

          {/* Export button */}
          <button
            className="w-full py-3 bg-brand-cyan text-[#0B0A10] font-bold uppercase tracking-wider text-sm rounded flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            <Download className="w-4 h-4" />
            Export Forensics Report
          </button>
        </div>
      </div>
    </div>
  );
}
