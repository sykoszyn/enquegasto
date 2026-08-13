import { getSupabaseClient } from "./supabase/client";
import { LeaderboardEntry, SaveGame } from "./types";

// ============================================================
// Persistencia: guardado de partidas y leaderboard global
// Si Supabase no está configurado, cae a localStorage como fallback.
// ============================================================

const LOCAL_SAVE_KEY = "roadtomajor_save";
const LOCAL_LEADERBOARD_KEY = "roadtomajor_leaderboard";

export async function saveGame(save: SaveGame, userId?: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    localStorage.setItem(LOCAL_SAVE_KEY, JSON.stringify(save));
    return { ok: true };
  }

  const { error } = await supabase.from("players_carrer").upsert({
    user_id: userId ?? "anon",
    character: save.character,
    phase: save.phase,
    month: save.month,
    log: save.log,
    updated_at: new Date().toISOString()
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function loadGame(userId?: string): Promise<SaveGame | null> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    const raw = localStorage.getItem(LOCAL_SAVE_KEY);
    return raw ? (JSON.parse(raw) as SaveGame) : null;
  }

  const { data, error } = await supabase
    .from("players_carrer")
    .select("*")
    .eq("user_id", userId ?? "anon")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as SaveGame;
}

export async function submitToLeaderboard(entry: LeaderboardEntry): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    const raw = localStorage.getItem(LOCAL_LEADERBOARD_KEY);
    const list: LeaderboardEntry[] = raw ? JSON.parse(raw) : [];
    list.push({ ...entry, created_at: new Date().toISOString() });
    localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(list));
    return { ok: true };
  }

  const { error } = await supabase.from("leaderboard").insert({
    nickname: entry.nickname,
    titles: entry.titles,
    hltv_rating: entry.hltv_rating,
    prize_money_usd: entry.prize_money_usd,
    final_team: entry.final_team,
    region: entry.region ?? null
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function fetchLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    const raw = localStorage.getItem(LOCAL_LEADERBOARD_KEY);
    const list: LeaderboardEntry[] = raw ? JSON.parse(raw) : [];
    return list.sort((a, b) => b.hltv_rating - a.hltv_rating).slice(0, limit);
  }

  const { data, error } = await supabase
    .from("leaderboard")
    .select("*")
    .order("hltv_rating", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as LeaderboardEntry[];
}
