import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import { GlassCard } from './CosmicUI';

const OraclePrivacySettings: React.FC = () => {
  const [settings, setSettings] = useState({ personalized_learning: true, contextual_signals: true });
  const [memories, setMemories] = useState<any[]>([]);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [settingsResponse, memoriesResponse] = await Promise.all([
        apiFetch('/api/oracle/settings'),
        apiFetch('/api/oracle/memories')
      ]);
      if (settingsResponse?.data) setSettings(settingsResponse.data);
      setMemories(memoriesResponse?.data || []);
    } catch (err: any) {
      setError(err.message || 'Could not load Hope privacy controls.');
    }
  };

  useEffect(() => { load(); }, []);

  const toggle = async (key: keyof typeof settings) => {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    try {
      await apiFetch('/api/oracle/settings', { method: 'PATCH', body: JSON.stringify({ [key]: next[key] }) });
    } catch (err: any) {
      setSettings(settings);
      setError(err.message || 'Could not update setting.');
    }
  };

  const removeMemory = async (id: string) => {
    await apiFetch(`/api/oracle/memories/${id}`, { method: 'DELETE' });
    setMemories(current => current.filter(item => item.memory_id !== id));
  };

  return (
    <GlassCard className="mb-6 p-6" glow="purple">
      <h2 className="text-xl font-semibold text-white">Hope privacy & memory</h2>
      <p className="mt-1 text-sm text-white/55">Control what Hope may retrieve for future answers. Turning a signal off removes it from new input snapshots.</p>
      {error && <p className="mt-3 text-sm text-red-300" role="alert">{error}</p>}
      <div className="mt-5 space-y-4">
        {([
          ['personalized_learning', 'Personalized learning', 'Use confirmed outcomes and explicitly saved memories.'],
          ['contextual_signals', 'Connected contextual signals', 'Use authorized current-location and calendar context when available.']
        ] as const).map(([key, label, detail]) => (
          <div key={key} className="flex items-center justify-between gap-4">
            <div><p className="font-medium text-white">{label}</p><p className="text-sm text-white/50">{detail}</p></div>
            <button role="switch" aria-checked={settings[key]} aria-label={label} onClick={() => toggle(key)} className={`h-8 w-14 shrink-0 rounded-full p-1 transition ${settings[key] ? 'bg-fuchsia-500' : 'bg-white/20'}`}>
              <span className={`block h-6 w-6 rounded-full bg-white transition ${settings[key] ? 'translate-x-6' : ''}`} />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-6 border-t border-white/10 pt-5">
        <h3 className="font-medium text-white">What Hope remembers</h3>
        {memories.length === 0 ? <p className="mt-2 text-sm text-white/45">No explicitly saved Hope memories.</p> : (
          <ul className="mt-3 space-y-2">
            {memories.map(memory => (
              <li key={memory.memory_id} className="flex items-center justify-between gap-3 rounded-lg bg-white/5 p-3 text-sm text-white/70">
                <span>{memory.text}</span>
                <button onClick={() => removeMemory(memory.memory_id)} className="text-red-300 hover:text-red-200">Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </GlassCard>
  );
};

export default OraclePrivacySettings;
