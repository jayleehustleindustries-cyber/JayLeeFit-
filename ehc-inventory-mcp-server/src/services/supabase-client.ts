import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_SUPABASE_PUBLISHABLE_KEY, DEFAULT_SUPABASE_URL } from "../constants.js";

const SUPABASE_URL = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || DEFAULT_SUPABASE_PUBLISHABLE_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let _publicClient: SupabaseClient | undefined;
let _adminClient: SupabaseClient | undefined;

/**
 * Anon/publishable-key client. Subject to Row Level Security: public reads
 * (public_inventory, published knowledge_articles, public marketplace
 * listings) and anon-permitted inserts (contacts, conversations,
 * intake_requests) work; everything staff-gated does not.
 */
export function getPublicClient(): SupabaseClient {
  if (!_publicClient) {
    _publicClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _publicClient;
}

/**
 * Service-role client that bypasses RLS entirely. Returns null when
 * SUPABASE_SERVICE_ROLE_KEY isn't configured — callers must handle that by
 * surfacing MISSING_SERVICE_ROLE_KEY_MESSAGE rather than crashing.
 */
export function getAdminClient(): SupabaseClient | null {
  if (!SUPABASE_SERVICE_ROLE_KEY) return null;
  if (!_adminClient) {
    _adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _adminClient;
}

export const MISSING_SERVICE_ROLE_KEY_MESSAGE =
  "Error: This operation requires staff access, and SUPABASE_SERVICE_ROLE_KEY is not configured for this " +
  "server. Get the service_role secret key from the Supabase dashboard for project " +
  "ygwgkoaoojkaabsieqpf (Project Settings -> API), set it as an environment variable, and restart the " +
  "server. Without it, only public read tools and ehc_submit_intake_request are available.";

export function formatSupabaseError(context: string, error: { message: string; code?: string }): string {
  return `Error: ${context} failed — ${error.message}${error.code ? ` (code ${error.code})` : ""}.`;
}
