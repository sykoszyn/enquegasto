import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ============================================================
// Cliente de Supabase (browser)
// Requiere NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY
// configuradas en el entorno (ver .env.example)
// ============================================================

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // Permite que el juego funcione en modo local (sin persistencia)
    // si todavía no se configuró Supabase.
    return null;
  }

  if (!client) {
    client = createClient(url, anonKey);
  }
  return client;
}
