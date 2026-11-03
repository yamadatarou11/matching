import { getClient, getMyUserId } from "./supabaseClient.js";
import { fetchProfilesByUserIds } from "./userService.js";

let matchChannel = null;

function normalizedPair(a, b) {
  return String(a) < String(b) ? [a, b] : [b, a];
}

function otherUserId(match, myUserId) {
  return match.user1_id === myUserId ? match.user2_id : match.user1_id;
}

async function matchRows() {
  const supabase = getClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("matches")
    .select("id, user1_id, user2_id, matched_at")
    .order("matched_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchMatches() {
  const myUserId = await getMyUserId();
  if (!myUserId) return [];

  const rows = await matchRows();
  const extras = Object.fromEntries(rows.map((row) => [
    otherUserId(row, myUserId),
    { matchId: row.id, matchedAt: row.matched_at, messages: [] }
  ]));

  return fetchProfilesByUserIds(rows.map((row) => otherUserId(row, myUserId)), extras);
}

export async function findMatchWith(userId) {
  const supabase = getClient();
  const myUserId = await getMyUserId();
  if (!supabase || !myUserId || !userId) return null;

  const [user1Id, user2Id] = normalizedPair(myUserId, userId);
  const { data, error } = await supabase
    .from("matches")
    .select("id, user1_id, user2_id, matched_at")
    .eq("user1_id", user1Id)
    .eq("user2_id", user2Id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const users = await fetchProfilesByUserIds([userId], {
    [userId]: { matchId: data.id, matchedAt: data.matched_at, messages: [] }
  });
  return users[0] || null;
}

export async function subscribeToMatches(onMatch) {
  const supabase = getClient();
  const myUserId = await getMyUserId();
  if (!supabase || !myUserId || matchChannel) return matchChannel;

  async function handleInsert(payload) {
    const row = payload.new;
    const userId = otherUserId(row, myUserId);
    const users = await fetchProfilesByUserIds([userId], {
      [userId]: { matchId: row.id, matchedAt: row.matched_at, messages: [] }
    });
    if (users[0]) onMatch?.(users[0], row);
  }

  matchChannel = supabase
    .channel(`town-matches-${myUserId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "matches", filter: `user1_id=eq.${myUserId}` },
      handleInsert
    )
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "matches", filter: `user2_id=eq.${myUserId}` },
      handleInsert
    )
    .subscribe();

  return matchChannel;
}

export function unsubscribeFromMatches() {
  const supabase = getClient();
  if (supabase && matchChannel) {
    supabase.removeChannel(matchChannel);
  }
  matchChannel = null;
}

export function persistMatches() {
  return false;
}
