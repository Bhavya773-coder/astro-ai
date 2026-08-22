import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import Sidebar from './Sidebar';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard } from './CosmicUI';
import OraclePredictionCard from './OraclePredictionCard';

const STATUS_OPTIONS = ['', 'open', 'awaiting_outcome', 'confirmed_strong', 'confirmed_partial', 'missed', 'expired_unrated', 'cancelled_due_to_changed_context'];

const OracleHistoryPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [calibration, setCalibration] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ page: String(page), limit: '20' });
      if (status) query.set('status', status);
      const [response, calibrationResponse] = await Promise.all([
        apiFetch(`/api/oracle/predictions?${query}`),
        apiFetch('/api/oracle/calibration')
      ]);
      setItems(response?.data?.items || []);
      setPages(Math.max(1, response?.data?.pages || 1));
      setCalibration(calibrationResponse?.data || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, status]);

  const remove = async (id: string) => {
    if (!window.confirm('Delete this prediction and its private snapshot?')) return;
    await apiFetch(`/api/oracle/predictions/${id}`, { method: 'DELETE' });
    setItems(current => current.filter(item => item.prediction_id !== id));
  };

  return (
    <CosmicBackground>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="min-h-screen flex-1 p-4 pt-20 lg:ml-64 lg:p-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-fuchsia-300">Hope's audit trail</p>
                <h1 className="mt-1 text-3xl font-bold text-white">Prediction history</h1>
                <p className="mt-2 text-white/55">Original calls remain separate from later outcomes and analysis.</p>
              </div>
              <label className="text-sm text-white/60">Status
                <select value={status} onChange={event => { setStatus(event.target.value); setPage(1); }} className="ml-2 rounded-lg border border-white/15 bg-[#171225] px-3 py-2 text-white">
                  {STATUS_OPTIONS.map(option => <option key={option} value={option}>{option ? option.replaceAll('_', ' ') : 'All'}</option>)}
                </select>
              </label>
            </div>

            {calibration && <GlassCard className="mb-6 p-5"><p className="text-xs font-semibold uppercase tracking-wider text-fuchsia-300">Personal calibration</p><div className="mt-3 grid grid-cols-2 gap-3 text-sm text-white/65 sm:grid-cols-4"><p><span className="text-2xl font-bold text-white">{calibration.totals.rated}</span><br/>rated calls</p><p><span className="text-2xl font-bold text-cyan-200">{calibration.totals.strong}</span><br/>strong matches</p><p><span className="text-2xl font-bold text-amber-200">{calibration.totals.partial}</span><br/>partial matches</p><p><span className="text-2xl font-bold text-rose-200">{calibration.totals.missed}</span><br/>misses</p></div><p className="mt-3 text-xs text-white/45">{calibration.needs_more_data ? 'Needs more confirmed outcomes before showing patterns.' : `Strongest observed category: ${calibration.strongest_category || 'none yet'}.`} Raw counts only—no misleading accuracy percentage.</p></GlassCard>}

            {loading ? <p className="text-white/60">Loading predictions…</p> : items.length === 0 ? (
              <GlassCard className="p-8 text-center"><p className="text-white/70">No Hope v2 predictions match this filter yet.</p></GlassCard>
            ) : (
              <div className="space-y-4">
                {items.map(item => (
                  <GlassCard key={item.prediction_id} className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-white/35">{item.category} · {item.horizon} · {new Date(item.created_at).toLocaleString()}</p>
                        <h2 className="mt-1 text-lg font-semibold text-white">{item.canonical_question}</h2>
                      </div>
                      <button onClick={() => remove(item.prediction_id)} className="rounded-lg border border-red-400/20 px-3 py-2 text-xs text-red-300 hover:bg-red-500/10">Delete</button>
                    </div>
                    <OraclePredictionCard metadata={{
                      prediction_id: item.prediction_id,
                      status: item.status,
                      methods: item.methods,
                      prediction_original: item.prediction_original,
                      reused: item.analytics_flags?.reused,
                      recalculated: Boolean(item.analytics_flags?.recalculation_reason)
                    }} onChanged={load} />
                  </GlassCard>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-center gap-3">
              <button disabled={page <= 1} onClick={() => setPage(value => value - 1)} className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white disabled:opacity-30">Previous</button>
              <span className="px-2 py-2 text-sm text-white/50">{page} / {pages}</span>
              <button disabled={page >= pages} onClick={() => setPage(value => value + 1)} className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white disabled:opacity-30">Next</button>
            </div>
          </div>
        </main>
      </div>
    </CosmicBackground>
  );
};

export default OracleHistoryPage;
