import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Eye, Download, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { getScanHistory } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface HistoryRecord {
  id: number;
  filename: string;
  media_type: string;
  authenticity_score: number;
  fake_probability: number;
  risk_level: string;
  created_at: string;
}

const PAGE_SIZE = 10;

export default function History() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'High' | 'Medium' | 'Low'>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    getScanHistory().then(data => {
      if (Array.isArray(data)) setHistory(data);
    });
  }, []);

  const filtered = useMemo(() => {
    return history.filter(r => {
      const matchRisk = filter === 'ALL' || r.risk_level === filter;
      const matchSearch = r.filename.toLowerCase().includes(search.toLowerCase());
      return matchRisk && matchSearch;
    });
  }, [history, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const chartData = useMemo(() => {
    const counts = { High: 0, Medium: 0, Low: 0 };
    history.forEach(r => { if (r.risk_level in counts) counts[r.risk_level as keyof typeof counts]++; });
    return [
      { name: 'High Risk', value: counts.High, color: '#FF4B4B' },
      { name: 'Suspicious', value: counts.Medium, color: '#FFC53D' },
      { name: 'Verified', value: counts.Low, color: '#00D19D' },
    ].filter(d => d.value > 0);
  }, [history]);

  const getRiskStyle = (risk: string) => {
    if (risk === 'High') return 'text-brand-red border-brand-red/50 bg-brand-red/10';
    if (risk === 'Medium') return 'text-brand-yellow border-brand-yellow/50 bg-brand-yellow/10';
    return 'text-brand-green border-brand-green/50 bg-brand-green/10';
  };

  return (
    <div className="flex flex-col gap-6">
      {/* URL Scanner Section */}
      <div className="bg-brand-panel border border-white/5 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-4 h-4 text-brand-cyan" />
          <span style={{ fontFamily: 'Space Grotesk, sans-serif' }} className="text-white font-bold">
            Deep Social & URL Forensic Scanner
          </span>
        </div>
        <div className="flex gap-3">
          <input
            className="flex-1 bg-[#0B0A10] border border-white/10 rounded px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-brand-cyan transition-colors"
            placeholder="Paste social media URL or media link for forensic analysis..."
          />
          <a
            href="/social"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            className="flex items-center gap-2 px-6 py-3 bg-brand-cyan text-[#0B0A10] font-bold uppercase tracking-wider text-sm rounded hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all"
          >
            Scan Entity
          </a>
        </div>
      </div>

      {/* Analytics row */}
      {history.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-brand-panel border border-white/5 rounded-xl p-5">
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={55} paddingAngle={4} dataKey="value">
                    {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f0e16', border: '1px solid rgba(255,255,255,0.05)', fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-brand-panel border border-white/5 rounded-xl p-5 flex flex-col justify-center">
            <div className="text-[10px] uppercase tracking-widest text-white/20 mb-1">Total Scans</div>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif' }} className="text-brand-cyan text-4xl font-bold">{history.length.toLocaleString()}</div>
          </div>
          <div className="bg-brand-panel border border-white/5 rounded-xl p-5 flex flex-col justify-center">
            <div className="text-[10px] uppercase tracking-widest text-white/20 mb-1">High Risk Detections</div>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif' }} className="text-brand-red text-4xl font-bold">
              {history.filter(h => h.risk_level === 'High').length}
            </div>
          </div>
        </div>
      )}

      {/* Vault table */}
      <div className="bg-brand-panel border border-white/5 rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <span style={{ fontFamily: 'Space Grotesk, sans-serif' }} className="text-white font-bold">
            Vault Forensic History
          </span>
          <div className="flex items-center gap-3">
            {/* Filter tabs */}
            <div className="flex gap-1">
              {(['ALL', 'High', 'Medium', 'Low'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => { setFilter(f); setPage(1); }}
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  className={`px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all ${
                    filter === f
                      ? 'bg-brand-cyan text-[#0B0A10]'
                      : 'text-white/30 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {f === 'ALL' ? 'All' : f === 'High' ? 'High Risk' : f === 'Medium' ? 'Suspicious' : 'Verified'}
                </button>
              ))}
            </div>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search archive..."
                className="bg-[#0B0A10] border border-white/10 rounded pl-8 pr-3 py-1.5 text-[12px] text-white placeholder-white/20 focus:outline-none focus:border-brand-cyan transition-colors w-40"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5">
              {['Filename / Entity', 'Capture Date', 'Authenticity Score', 'Risk Level', 'Actions'].map(h => (
                <th key={h} className="px-6 py-3 text-[10px] uppercase tracking-widest text-white/20 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-white/20 text-sm">
                  {history.length === 0 ? 'No scans yet — upload media to begin forensic analysis.' : 'No matching records.'}
                </td>
              </tr>
            ) : paginated.map((rec, i) => (
              <motion.tr
                key={rec.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="border-b border-white/5 hover:bg-white/3 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded border flex items-center justify-center text-[10px] ${
                      rec.media_type === 'video' ? 'border-brand-purple/40 text-brand-purple' : 'border-brand-cyan/40 text-brand-cyan'
                    }`}>
                      {rec.media_type === 'video' ? '▶' : '◼'}
                    </div>
                    <div>
                      <div className="text-sm text-white font-medium truncate max-w-[180px]">{rec.filename}</div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace' }} className="text-[10px] text-white/20">
                        Forensic ID: {rec.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-white/60">{new Date(rec.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace' }} className="text-[10px] text-white/20">
                    {new Date(rec.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span style={{ fontFamily: 'JetBrains Mono, monospace' }}
                    className={`font-bold text-base ${rec.authenticity_score < 50 ? 'text-brand-red' : 'text-brand-green'}`}>
                    {rec.authenticity_score.toFixed(1)}%
                  </span>
                  {/* Sparkline-style bar */}
                  <div className="h-0.5 w-20 bg-white/5 rounded-full overflow-hidden mt-1">
                    <div className="h-full rounded-full" style={{
                      width: `${rec.authenticity_score}%`,
                      backgroundColor: rec.authenticity_score < 50 ? '#FF4B4B' : '#00D19D'
                    }} />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`flex items-center gap-1.5 w-fit text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${getRiskStyle(rec.risk_level)}`}>
                    {rec.risk_level === 'High' && <AlertTriangle className="w-3 h-3" />}
                    {rec.risk_level === 'High' ? 'High Risk' : rec.risk_level === 'Medium' ? 'Suspicious' : 'Low Risk'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 hover:text-brand-cyan text-white/30 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 hover:text-brand-cyan text-white/30 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
            <div className="text-[11px] text-white/30">
              Showing {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length} analyzed entities
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p-1))}
                disabled={page === 1}
                className="p-1.5 text-white/30 hover:text-white disabled:opacity-20"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-7 h-7 text-[12px] rounded transition-all ${
                    n === page ? 'bg-brand-cyan text-[#0B0A10] font-bold' : 'text-white/30 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p+1))}
                disabled={page === totalPages}
                className="p-1.5 text-white/30 hover:text-white disabled:opacity-20"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
