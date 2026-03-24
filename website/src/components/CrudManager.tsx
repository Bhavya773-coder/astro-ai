import React, { useMemo, useState } from 'react';
import { apiFetch } from '../api/client';
import { GlassCard, CosmicButton } from './CosmicUI';

type CollectionKey = 'profiles' | 'conversations' | 'growth-metrics' | 'compatibility-reports';

const collectionOptions: { key: CollectionKey; label: string }[] = [
  { key: 'profiles', label: 'Profiles' },
  { key: 'conversations', label: 'Conversations' },
  { key: 'growth-metrics', label: 'Growth Metrics' },
  { key: 'compatibility-reports', label: 'Compatibility Reports' }
];

const CrudManager: React.FC = () => {
  const [collection, setCollection] = useState<CollectionKey>('profiles');
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createJson, setCreateJson] = useState<string>('{}');

  const basePath = useMemo(() => `/api/${collection}`, [collection]);

  const refresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiFetch(basePath, { method: 'GET' });
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  };

  const create = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const body = JSON.parse(createJson);
      await apiFetch(basePath, { method: 'POST', body: JSON.stringify(body) });
      await refresh();
    } catch (e: any) {
      setError(e?.message || 'Create failed');
      setIsLoading(false);
    }
  };

  const remove = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiFetch(`${basePath}/${id}`, { method: 'DELETE' });
      await refresh();
    } catch (e: any) {
      setError(e?.message || 'Delete failed');
      setIsLoading(false);
    }
  };

  return (
    <GlassCard className="p-6" glow="cyan">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white font-display">Data Manager</h2>
        <div className="flex items-center gap-3">
          <select
            className="bg-white/5 border border-white/20 rounded-cosmic px-3 py-2 text-sm text-white"
            value={collection}
            onChange={(e) => setCollection(e.target.value as CollectionKey)}
          >
            {collectionOptions.map((o) => (
              <option key={o.key} value={o.key} className="bg-cosmic-deep-space">
                {o.label}
              </option>
            ))}
          </select>
          <CosmicButton onClick={refresh} variant="glass" size="sm">
            Refresh
          </CosmicButton>
        </div>
      </div>

      {error ? <div className="text-red-300 text-sm mb-3">{error}</div> : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-white mb-2">Create (JSON)</h3>
          <textarea
            className="w-full bg-white/5 border border-white/20 rounded-cosmic p-3 font-mono text-xs h-48 text-white"
            value={createJson}
            onChange={(e) => setCreateJson(e.target.value)}
          />
          <CosmicButton onClick={create} disabled={isLoading} variant="primary" className="mt-3">
            Create
          </CosmicButton>
          <p className="text-xs text-white/50 mt-2">
            For non-admin users, `user_id` is auto-set from your token.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-white mb-2">Items</h3>
          <div className="border border-white/10 rounded-cosmic p-3 h-64 overflow-auto bg-black/20">
            {isLoading ? (
              <div className="text-sm text-white/60">Loading...</div>
            ) : items.length === 0 ? (
              <div className="text-sm text-white/60">No records</div>
            ) : (
              <div className="space-y-3">
                {items.map((it) => (
                  <div key={it._id} className="glass-card p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-white/60">{it._id}</div>
                      <button
                        onClick={() => remove(it._id)}
                        disabled={isLoading}
                        className="text-sm text-cosmic-pink hover:text-cosmic-pink/80 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                    <pre className="text-xs mt-2 overflow-auto text-white/80">{JSON.stringify(it, null, 2)}</pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default CrudManager;
