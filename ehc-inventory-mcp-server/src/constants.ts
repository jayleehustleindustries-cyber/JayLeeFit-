// Public project endpoint + publishable key for the QuickFind Inventory
// Supabase project. These are not secrets — the publishable key is already
// shipped in that app's client-side bundle — but can still be overridden via
// env vars if this server ever points at a different project.
export const DEFAULT_SUPABASE_URL = "https://ygwgkoaoojkaabsieqpf.supabase.co";
export const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_yz4U8vfZYRk8HGdPPBPugQ_BMF-BkHr";

export const CHARACTER_LIMIT = 25000;
export const DEFAULT_LIST_LIMIT = 25;
export const MAX_LIST_LIMIT = 100;
