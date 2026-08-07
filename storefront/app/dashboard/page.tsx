'use client';

import { useEffect, useState } from 'react';

interface SyncLog {
  timestamp: string;
  source: 'sheets' | 'drive' | 'ebay' | 'staleness';
  status: 'success' | 'error' | 'pending';
  recordsProcessed: number;
  recordsSkipped: number;
  errors: string[];
  duration: number;
  details?: Record<string, any>;
}

interface SyncState {
  lastSync: Record<string, string>;
  logs: SyncLog[];
  activeSync: boolean;
}

interface StaleEdit {
  sku: string;
  tier: string;
  tierLabel: string;
  days: number;
  from: number;
  to: number;
  floored: boolean;
  title?: string;
  bump: boolean;
}

interface StalePreview {
  success: boolean;
  dryRun: boolean;
  summary: {
    scanned: number;
    edits: number;
    skipped: number;
    humanReview: number;
    byTier: Record<string, number>;
  };
  edits: StaleEdit[];
  humanReview: Array<{ sku: string; days: number; price: number }>;
  error?: string;
}

const TIER_COLORS: Record<string, string> = {
  fresh: '#10b981',
  tier_30: '#d4af37',
  tier_60: '#f59e0b',
  tier_90: '#ef4444',
  tier_liquidate: '#a855f7',
};

const TIER_LABELS: Record<string, string> = {
  fresh: 'Fresh (0-29d)',
  tier_30: '30-Day Nudge',
  tier_60: '60-Day Drop',
  tier_90: '90-Day Clearance',
  tier_liquidate: 'Liquidate (120d+)',
};

export default function Dashboard() {
  const [state, setState] = useState<SyncState | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [driveSyncing, setDriveSyncing] = useState(false);
  const [stale, setStale] = useState<StalePreview | null>(null);
  const [staleLoading, setStaleLoading] = useState(true);

  useEffect(() => {
    fetchState();
    fetchStale();
    const interval = setInterval(fetchState, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  async function fetchState() {
    try {
      const res = await fetch('/api/data/sync');
      const data = await res.json();
      setState(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch sync state:', error);
    }
  }

  // Always the dry-run view: opening the dashboard must never move a price.
  async function fetchStale() {
    setStaleLoading(true);
    try {
      const res = await fetch('/api/staleness/run?dry=true');
      setStale(await res.json());
    } catch (error) {
      console.error('Failed to fetch staleness preview:', error);
    } finally {
      setStaleLoading(false);
    }
  }

  async function triggerSync() {
    setSyncing(true);
    try {
      const res = await fetch('/api/data/sync', { method: 'POST' });
      const data = await res.json();
      await fetchState();
      alert(`Sync completed: ${data.recordsProcessed} records processed`);
    } catch (error) {
      alert(`Sync failed: ${error}`);
    } finally {
      setSyncing(false);
    }
  }

  async function triggerDriveSync() {
    setDriveSyncing(true);
    try {
      const res = await fetch('/api/data/drive-sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchState();
        alert(
          `Image sync completed: ${data.stats.mappedItems} items with ${data.stats.totalImages} images`
        );
      } else {
        alert(`Image sync failed: ${data.error}`);
      }
    } catch (error) {
      alert(`Image sync failed: ${error}`);
    } finally {
      setDriveSyncing(false);
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem', minHeight: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>EHC Data API Dashboard</h1>
      <p style={{ color: '#999', marginBottom: '2rem' }}>
        Centralized sync service for inventory, images, and eBay listings
      </p>

      {/* Status Overview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ backgroundColor: '#1a1a1a', padding: '1.5rem', borderRadius: '0.5rem' }}>
          <p style={{ color: '#999', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Sync Status
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: state?.activeSync ? '#f59e0b' : '#10b981',
              }}
            />
            <span style={{ fontSize: '1.125rem', fontWeight: '600' }}>
              {state?.activeSync ? 'Syncing...' : 'Idle'}
            </span>
          </div>
        </div>

        <div style={{ backgroundColor: '#1a1a1a', padding: '1.5rem', borderRadius: '0.5rem' }}>
          <p style={{ color: '#999', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Last Sheets Sync
          </p>
          <p style={{ fontSize: '1.125rem', fontWeight: '600' }}>
            {state?.lastSync?.sheets
              ? new Date(state.lastSync.sheets).toLocaleString()
              : 'Never'}
          </p>
        </div>

        <div style={{ backgroundColor: '#1a1a1a', padding: '1.5rem', borderRadius: '0.5rem' }}>
          <p style={{ color: '#999', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Last Drive Sync (Images)
          </p>
          <p style={{ fontSize: '1.125rem', fontWeight: '600' }}>
            {state?.lastSync?.drive
              ? new Date(state.lastSync.drive).toLocaleString()
              : 'Never'}
          </p>
        </div>

        <div style={{ backgroundColor: '#1a1a1a', padding: '1.5rem', borderRadius: '0.5rem' }}>
          <p style={{ color: '#999', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Total Syncs
          </p>
          <p style={{ fontSize: '1.125rem', fontWeight: '600' }}>
            {state?.logs?.length || 0}
          </p>
        </div>
      </div>

      {/* Sync Buttons */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <button
          onClick={triggerSync}
          disabled={syncing || state?.activeSync}
          style={{
            backgroundColor: '#d4af37',
            color: '#0f0f0f',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: '600',
            cursor: syncing || state?.activeSync ? 'not-allowed' : 'pointer',
            opacity: syncing || state?.activeSync ? 0.6 : 1,
          }}
        >
          {syncing ? 'Syncing Inventory...' : 'Sync Inventory (Sheets)'}
        </button>
        <button
          onClick={triggerDriveSync}
          disabled={driveSyncing || state?.activeSync}
          style={{
            backgroundColor: '#10b981',
            color: '#ffffff',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: '600',
            cursor: driveSyncing || state?.activeSync ? 'not-allowed' : 'pointer',
            opacity: driveSyncing || state?.activeSync ? 0.6 : 1,
          }}
        >
          {driveSyncing ? 'Syncing Images...' : 'Sync Images (Drive)'}
        </button>
      </div>

      {/* Stale Inventory Ladder */}
      <div style={{ marginBottom: '2rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            marginBottom: '0.25rem',
          }}
        >
          <h2 style={{ fontSize: '1.25rem' }}>Stale Inventory Ladder</h2>
          <button
            onClick={fetchStale}
            disabled={staleLoading}
            style={{
              background: 'none',
              border: '1px solid #333',
              color: '#999',
              padding: '0.35rem 0.75rem',
              borderRadius: '0.375rem',
              fontSize: '0.8125rem',
              cursor: staleLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {staleLoading ? 'Loading…' : 'Refresh preview'}
          </button>
        </div>
        <p style={{ color: '#999', fontSize: '0.875rem', marginBottom: '1rem' }}>
          Preview only — the daily cron applies these. Nothing here changes a listing.
        </p>

        {stale?.error && (
          <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>Preview failed: {stale.error}</p>
        )}

        {stale?.success && (
          <>
            {/* Tier distribution */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '0.75rem',
                marginBottom: '1.25rem',
              }}
            >
              {Object.entries(TIER_LABELS).map(([tier, label]) => (
                <div
                  key={tier}
                  style={{
                    backgroundColor: '#1a1a1a',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    borderLeft: `3px solid ${TIER_COLORS[tier]}`,
                  }}
                >
                  <p style={{ color: '#999', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                    {label}
                  </p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                    {stale.summary.byTier?.[tier] ?? 0}
                  </p>
                </div>
              ))}
            </div>

            {/* Pending edits */}
            {stale.edits.length === 0 ? (
              <p style={{ color: '#999', fontSize: '0.875rem' }}>
                Nothing on the ladder right now — every active listing is either fresh or
                already sitting at its tier price.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <p style={{ color: '#999', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  {stale.edits.length} listing{stale.edits.length === 1 ? '' : 's'} the next run
                  will reprice:
                </p>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.875rem',
                    minWidth: '640px',
                  }}
                >
                  <thead>
                    <tr style={{ color: '#999', textAlign: 'left' }}>
                      <th style={{ padding: '0.5rem 0.75rem 0.5rem 0' }}>SKU</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>Tier</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>Days</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>Price</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>New title</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stale.edits.map(edit => (
                      <tr key={edit.sku} style={{ borderTop: '1px solid #262626' }}>
                        <td
                          style={{
                            padding: '0.6rem 0.75rem 0.6rem 0',
                            fontFamily: 'monospace',
                          }}
                        >
                          {edit.sku}
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem' }}>
                          <span style={{ color: TIER_COLORS[edit.tier] ?? '#999' }}>
                            {edit.tierLabel}
                          </span>
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', color: '#999' }}>{edit.days}d</td>
                        <td style={{ padding: '0.6rem 0.75rem' }}>
                          <span style={{ color: '#999', textDecoration: 'line-through' }}>
                            ${edit.from}
                          </span>{' '}
                          <span style={{ fontWeight: 600 }}>${edit.to}</span>
                          {edit.floored && (
                            <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}> (floor)</span>
                          )}
                        </td>
                        <td
                          style={{
                            padding: '0.6rem 0.75rem',
                            color: '#999',
                            maxWidth: '260px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {edit.title || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Human review */}
            {stale.humanReview.length > 0 && (
              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '1rem',
                  backgroundColor: '#1a1a1a',
                  borderLeft: `3px solid ${TIER_COLORS.tier_liquidate}`,
                  borderRadius: '0.5rem',
                }}
              >
                <p style={{ fontWeight: 600, marginBottom: '0.35rem' }}>
                  {stale.humanReview.length} item
                  {stale.humanReview.length === 1 ? '' : 's'} past 120 days — your call
                </p>
                <p style={{ color: '#999', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                  The ladder stops here rather than discounting further. Lot-sale, donate, or keep.
                </p>
                <p style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: '#ccc' }}>
                  {stale.humanReview
                    .map(item => `${item.sku} (${item.days}d, $${item.price})`)
                    .join(' · ')}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Recent Logs */}
      <div>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Recent Syncs</h2>
        {state?.logs?.length === 0 ? (
          <p style={{ color: '#999' }}>No syncs yet</p>
        ) : (
          <div className="sync-log">
            {state?.logs
              ?.slice()
              .reverse()
              .slice(0, 50)
              .map((log, idx) => (
                <div key={idx} style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid #333' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span className={log.status}>
                      [{log.status.toUpperCase()}]
                    </span>
                    <span style={{ color: '#999' }}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#bbb' }}>
                    {log.recordsProcessed} records • {log.duration}ms
                  </div>
                  {log.errors.length > 0 && (
                    <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      {log.errors.join('; ')}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
