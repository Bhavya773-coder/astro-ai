import React, { useState } from 'react';
import { apiFetch } from '../api/client';

interface Props {
  metadata: any;
  onChanged?: (status: string) => void;
}

const OUTCOMES = [
  ['very_similar', 'Very similar'],
  ['partly', 'Partly'],
  ['no', 'No'],
  ['something_else', 'Something else'],
  ['not_sure', "I'm not sure"]
] as const;

const OraclePredictionCard: React.FC<Props> = ({ metadata, onChanged }) => {
  const original = metadata?.prediction_original;
  const predictionId = metadata?.prediction_id;
  const [status, setStatus] = useState(metadata?.status || 'open');
  const [explanation, setExplanation] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [calendarSaved, setCalendarSaved] = useState(false);
  const [synchronicitySaved, setSynchronicitySaved] = useState(false);
  if (!original || !predictionId) return null;

  const submitOutcome = async (choice: string) => {
    setBusy(true);
    try {
      const response = await apiFetch(`/api/oracle/predictions/${predictionId}/outcome`, {
        method: 'POST',
        body: JSON.stringify({ choice })
      });
      const next = response?.data?.status || status;
      setStatus(next);
      onChanged?.(next);
    } finally {
      setBusy(false);
    }
  };

  const explain = async () => {
    setBusy(true);
    try {
      const response = await apiFetch(`/api/oracle/predictions/${predictionId}/explain`, { method: 'POST', body: '{}' });
      setExplanation(response?.data?.factors || []);
    } finally {
      setBusy(false);
    }
  };

  const addToCalendar = async () => {
    const date = original.time_window?.end || original.time_window?.start;
    if (!date) return;
    await apiFetch('/api/calendar/custom-events', {
      method: 'POST',
      body: JSON.stringify({ title: `Hope outcome check: ${original.text}`, description: `Review Hope prediction ${predictionId} and record what happened.`, date, category: 'special_day' })
    });
    setCalendarSaved(true);
  };

  const saveSynchronicity = async () => {
    await apiFetch(`/api/oracle/predictions/${predictionId}/synchronicity`, {
      method: 'POST',
      body: JSON.stringify({ save: true, text: `Strong match: ${original.text}` })
    });
    setSynchronicitySaved(true);
  };

  const windowLabel = original.time_window?.label || [original.time_window?.start, original.time_window?.end].filter(Boolean).join(' – ');
  const outcomeDue = status === 'awaiting_outcome' || (original.valid_until && Date.parse(original.valid_until) <= Date.now());

  return (
    <section className="mt-4 rounded-2xl border border-fuchsia-400/25 bg-fuchsia-500/[0.06] p-4 text-left" aria-label="Hope prediction record">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-300">Hope's original call</span>
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs capitalize text-white/70">{status.replaceAll('_', ' ')}</span>
      </div>
      <p className="mt-3 text-base font-semibold text-white">{original.text}</p>
      <div className="mt-3 grid gap-2 text-sm text-white/65 sm:grid-cols-3">
        <p><span className="text-white/40">Direction</span><br/><span className="capitalize">{String(original.direction || '').replaceAll('_', ' ')}</span></p>
        <p><span className="text-white/40">Strength</span><br/><span className="capitalize">{original.strength}</span></p>
        <p><span className="text-white/40">Window</span><br/>{windowLabel || 'Open-ended'}</p>
      </div>
      {original.recommended_action && <p className="mt-3 text-sm text-white/70"><span className="font-medium text-white">Practical action:</span> {original.recommended_action}</p>}
      {metadata.reused && <p className="mt-3 text-xs text-cyan-300">Same underlying question and inputs — original call reused.</p>}
      {metadata.recalculated && <p className="mt-3 text-xs text-amber-300">Material context changed — this is a new calculation; the earlier record remains intact.</p>}
      {explanation.length > 0 && <p className="mt-3 text-sm text-white/60">Factors: {explanation.join(', ')}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        <button disabled={busy} onClick={explain} className="rounded-lg border border-white/15 px-3 py-2 text-xs text-white/75 hover:bg-white/10">Why this call?</button>
        {(original.time_window?.end || original.time_window?.start) && <button disabled={busy || calendarSaved} onClick={addToCalendar} className="rounded-lg border border-white/15 px-3 py-2 text-xs text-white/75 hover:bg-white/10">{calendarSaved ? 'Added to calendar' : 'Add outcome check'}</button>}
        {outcomeDue && status !== 'confirmed_strong' && status !== 'confirmed_partial' && status !== 'missed' && OUTCOMES.map(([value, label]) => (
          <button key={value} disabled={busy} onClick={() => submitOutcome(value)} className="rounded-lg border border-fuchsia-400/20 px-3 py-2 text-xs text-fuchsia-200 hover:bg-fuchsia-500/10">{label}</button>
        ))}
        {status === 'confirmed_strong' && <button disabled={synchronicitySaved} onClick={saveSynchronicity} className="rounded-lg border border-cyan-400/25 px-3 py-2 text-xs text-cyan-200 hover:bg-cyan-500/10">{synchronicitySaved ? 'Synchronicity saved' : 'Save as Synchronicity'}</button>}
      </div>
    </section>
  );
};

export default OraclePredictionCard;
