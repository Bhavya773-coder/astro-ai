import React, { useState } from 'react';
import { apiFetch } from '../api/client';

interface Props {
  open: boolean;
  version?: string;
  text?: string;
  onAccepted: () => void;
}

const OracleDisclosureModal: React.FC<Props> = ({ open, version, text, onAccepted }) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  if (!open) return null;

  const accept = async () => {
    setSaving(true);
    setError('');
    try {
      await apiFetch('/api/oracle/disclosure/accept', { method: 'POST', body: '{}' });
      onAccepted();
    } catch (err: any) {
      setError(err.message || 'Could not save your choice.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-labelledby="hope-disclosure-title">
      <div className="w-full max-w-lg rounded-2xl border border-fuchsia-400/30 bg-[#11101d] p-6 shadow-2xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-fuchsia-500/15 text-2xl" aria-hidden="true">✦</div>
        <h2 id="hope-disclosure-title" className="text-2xl font-semibold text-white">Meet Hope</h2>
        <p className="mt-3 leading-7 text-white/75">{text || 'Hope is an adaptive Oracle for predictive entertainment, curiosity, and self-exploration—not factual certainty or professional advice. Hope predicts. Reality happens. You validate. Hope learns.'}</p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-white/60">
          <li>Hope keeps each original prediction visible instead of rewriting it later.</li>
          <li>You decide whether an outcome matched, partly matched, missed, or remains unclear.</li>
          <li>Medical, legal, financial, and emergency decisions require qualified real-world help.</li>
        </ul>
        {error && <p className="mt-4 text-sm text-red-300" role="alert">{error}</p>}
        <button autoFocus disabled={saving} onClick={accept} className="mt-6 w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 font-semibold text-white disabled:opacity-60">
          {saving ? 'Saving…' : 'I understand — continue to Hope'}
        </button>
        {version && <p className="mt-3 text-center text-xs text-white/30">Disclosure {version}</p>}
      </div>
    </div>
  );
};

export default OracleDisclosureModal;
