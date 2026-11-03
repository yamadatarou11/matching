import { getClient, getMyUserId } from "./supabaseClient.js";
import { fetchProfilesByUserIds } from "./userService.js";

const REPORT_REASON_MAP = {
  fake_profile: "fake_profile",
  harassment: "harassment",
  inappropriate: "inappropriate",
  solicitation: "solicitation",
  underage: "underage",
  other: "other",
  "なりすまし": "fake_profile",
  "迷惑なメッセージ": "harassment",
  "不適切なプロフィール": "inappropriate",
  "危険行為": "other"
};

function ignoreDuplicate(error) {
  return error?.code === "23505";
}

async function insertLikeAction(candidate, action) {
  const supabase = getClient();
  const myUserId = await getMyUserId();
  if (!supabase || !myUserId || !candidate?.userId) return false;

  const { error } = await supabase
    .from("likes")
    .insert({
      from_user_id: myUserId,
      to_user_id: candidate.userId,
      action
    });

  if (error && !ignoreDuplicate(error)) throw error;
  return true;
}

export function addLike(candidate) {
  return insertLikeAction(candidate, "like");
}

export function addPass(candidate) {
  return insertLikeAction(candidate, "pass");
}

export async function fetchReceivedLikes() {
  const supabase = getClient();
  const myUserId = await getMyUserId();
  if (!supabase || !myUserId) return [];

  const [
    { data: receivedRows, error: receivedError },
    { data: ownRows, error: ownError },
    { data: matchRows, error: matchError }
  ] = await Promise.all([
    supabase
      .from("likes")
      .select("id, from_user_id, created_at")
      .eq("to_user_id", myUserId)
      .eq("action", "like")
      .order("created_at", { ascending: false }),
    supabase
      .from("likes")
      .select("to_user_id")
      .eq("from_user_id", myUserId),
    supabase
      .from("matches")
      .select("user1_id, user2_id")
  ]);

  if (receivedError) throw receivedError;
  if (ownError) throw ownError;
  if (matchError) throw matchError;

  const actedUserIds = new Set((ownRows || []).map((row) => row.to_user_id));
  const matchedUserIds = new Set(
    (matchRows || []).map((row) => (row.user1_id === myUserId ? row.user2_id : row.user1_id))
  );
  const rows = (receivedRows || []).filter((row) => (
    !actedUserIds.has(row.from_user_id) && !matchedUserIds.has(row.from_user_id)
  ));
  const extras = Object.fromEntries(rows.map((row) => [
    row.from_user_id,
    { likeId: row.id, receivedAt: row.created_at, receivedMessage: "" }
  ]));

  return fetchProfilesByUserIds(rows.map((row) => row.from_user_id), extras);
}

export async function createReport(candidate, payload = {}) {
  const supabase = getClient();
  const myUserId = await getMyUserId();
  if (!supabase || !myUserId || !candidate?.userId) return false;

  const rawReason = payload.reason || "other";
  const reason = REPORT_REASON_MAP[rawReason] || "other";
  const detailParts = [];
  if (rawReason && rawReason !== reason) detailParts.push(`選択理由: ${rawReason}`);
  if (payload.note) detailParts.push(payload.note);

  const { error } = await supabase
    .from("reports")
    .insert({
      reporter_id: myUserId,
      target_id: candidate.userId,
      reason,
      detail: detailParts.join("\n").slice(0, 1000) || null
    });

  if (error) throw error;
  return true;
}

export async function blockUser(candidate) {
  const supabase = getClient();
  const myUserId = await getMyUserId();
  if (!supabase || !myUserId || !candidate?.userId) return false;

  const { error } = await supabase
    .from("blocks")
    .insert({
      blocker_id: myUserId,
      blocked_id: candidate.userId
    });

  if (error && !ignoreDuplicate(error)) throw error;
  return true;
}

export function removeUserFromLocalLists(state, userId) {
  state.candidates = (state.candidates || []).filter((item) => item.userId !== userId);
  state.receivedLikes = (state.receivedLikes || []).filter((item) => item.userId !== userId);
  state.matches = (state.matches || []).filter((item) => item.userId !== userId);
}
