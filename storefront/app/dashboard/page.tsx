'use client';

import { useEffect, useState } from 'react';

interface SyncLog {
  timestamp: string;
  source: 'sheets' | 'drive' | 'ebay';
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

export default function Dashboard() {
  const [state, setState] = useState<SyncState | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [driveSyncing, setDriveSyncing] = useState(false);

  useEffect(() => {
    fetchState();
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
