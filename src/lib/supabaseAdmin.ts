import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { requiredEnv } from "./env";

let supabaseAdminClient: SupabaseClient | null = null;
let initializationError: Error | null = null;

function initializeSupabaseAdmin(): SupabaseClient {
  if (supabaseAdminClient) {
    return supabaseAdminClient;
  }
  if (initializationError) {
    throw initializationError;
  }

  try {
    const client = createClient(
      requiredEnv.SUPABASE_URL(),
      requiredEnv.SUPABASE_SERVICE_ROLE_KEY(),
      {
        auth: { persistSession: false },
      }
    );
    supabaseAdminClient = client;
    return client;
  } catch (error) {
    initializationError = error instanceof Error ? error : new Error("Failed to initialize Supabase admin client.");
    throw initializationError;
  }
}

export function getSupabaseAdminClient(): SupabaseClient {
  return initializeSupabaseAdmin();
}

export function tryGetSupabaseAdminClient(): SupabaseClient | null {
  try {
    return initializeSupabaseAdmin();
  } catch {
    return null;
  }
}

