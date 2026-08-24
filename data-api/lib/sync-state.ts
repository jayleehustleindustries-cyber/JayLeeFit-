import fs from 'fs/promises';
import path from 'path';

export interface SyncLog {
  timestamp: string;
  source: 'sheets' | 'drive' | 'ebay';
  status: 'success' | 'error' | 'pending';
  recordsProcessed: number;
  recordsSkipped: number;
  errors: string[];
  duration: number; // ms
  details?: Record<string, any>;
}

export interface SyncState {
  lastSync: Record<string, string>; // source -> ISO timestamp
  logs: SyncLog[];
  activeSync: boolean;
}

const STATE_FILE = path.join(process.cwd(), 'public/logs/sync-state.json');

async function ensureStateFile() {
  try {
    await fs.access(STATE_FILE);
  } catch {
    const dir = path.dirname(STATE_FILE);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(
      STATE_FILE,
      JSON.stringify({
        lastSync: {},
        logs: [],
        activeSync: false,
      } as SyncState)
    );
  }
}

export async function getSyncState(): Promise<SyncState> {
  await ensureStateFile();
  const content = await fs.readFile(STATE_FILE, 'utf-8');
  return JSON.parse(content);
}

export async function updateSyncState(state: SyncState) {
  await ensureStateFile();
  await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2));
}

export async function logSync(log: SyncLog) {
  const state = await getSyncState();
  state.logs.push(log);
  state.lastSync[log.source] = log.timestamp;

  // Keep only last 100 logs
  if (state.logs.length > 100) {
    state.logs = state.logs.slice(-100);
  }

  await updateSyncState(state);
}

export async function setActiveSync(active: boolean) {
  const state = await getSyncState();
  state.activeSync = active;
  await updateSyncState(state);
}
