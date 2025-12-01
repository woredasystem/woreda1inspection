import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { publicEnv, requiredEnv } from "./env";

/**
 * Get a Supabase client for server-side operations that respects the user's session
 */
export async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  
  const supabase = createClient(
    requiredEnv.SUPABASE_URL(),
    requiredEnv.SUPABASE_SERVICE_ROLE_KEY(),
    {
      auth: {
        persistSession: false,
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  return supabase;
}

/**
 * Get the current authenticated user's woreda_id from their user metadata.
 * Falls back to environment variable if not set in user metadata.
 */
export async function getCurrentUserWoredaId(): Promise<string> {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.user_metadata?.woreda_id) {
      return user.user_metadata.woreda_id;
    }

    // Fallback to environment variable
    return publicEnv.NEXT_PUBLIC_WOREDA_ID;
  } catch (error) {
    // Fallback to environment variable on error
    return publicEnv.NEXT_PUBLIC_WOREDA_ID;
  }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user;
  } catch {
    return null;
  }
}

