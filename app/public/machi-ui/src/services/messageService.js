import { getClient, getMyUserId } from "./supabaseClient.js";

const LAST_READ_PREFIX = "townLastRead:";

function toDisplayMessage(row, myUserId) {
  return {
    id: row.id,
    matchId: row.match_id,
    senderId: row.sender_id,
    from: row.sender_id === myUserId ? "me" : "them",
    text: row.body,
    sentAt: row.sent_at
  };
}

function validateText(text) {
  const body = String(text || "").trim();
  if (!body) {
    throw new Error("メッセージを入力してください");
  }
  if (body.length > 1000) {
    throw new Error("メッセージは1000文字以内で入力してください");
  }
  return body;
}

export function chatMessages(match) {
  return Array.isArray(match?.messages) ? match.messages : [];
}

export async function loadMessages(matchId) {
  const supabase = getClient();
  const myUserId = await getMyUserId();
  if (!supabase || !myUserId || !matchId) return [];

  const { data, error } = await supabase
    .from("messages")
    .select("id, match_id, sender_id, body, sent_at")
    .eq("match_id", matchId)
    .order("sent_at", { ascending: true });

  if (error) throw error;
  return (data || []).map((row) => toDisplayMessage(row, myUserId));
}

export async function loadLatestMessages(matchIds) {
  const uniqueIds = [...new Set((matchIds || []).filter(Boolean))];
  if (!uniqueIds.length) return new Map();

  const entries = await Promise.all(
    uniqueIds.map(async (matchId) => {
      const supabase = getClient();
      const myUserId = await getMyUserId();
      if (!supabase || !myUserId) return [matchId, null];

      const { data, error } = await supabase
        .from("messages")
        .select("id, match_id, sender_id, body, sent_at")
        .eq("match_id", matchId)
        .order("sent_at", { ascending: false })
        .limit(1);

      if (error) throw error;
      return [matchId, data?.[0] ? toDisplayMessage(data[0], myUserId) : null];
    })
  );

  return new Map(entries);
}

export async function loadSentMessageMatchIds(matchIds) {
  const uniqueIds = [...new Set((matchIds || []).filter(Boolean))];
  const sentMatchIds = new Set();
  if (!uniqueIds.length) return sentMatchIds;

  const supabase = getClient();
  const myUserId = await getMyUserId();
  if (!supabase || !myUserId) return sentMatchIds;

  const { data, error } = await supabase
    .from("messages")
    .select("match_id")
    .in("match_id", uniqueIds)
    .eq("sender_id", myUserId);

  if (error) throw error;
  (data || []).forEach((message) => {
    if (message.match_id) sentMatchIds.add(message.match_id);
  });
  return sentMatchIds;
}

export async function sendMessage(matchId, text) {
  const body = validateText(text);
  const supabase = getClient();
  const myUserId = await getMyUserId();
  if (!supabase || !myUserId || !matchId) {
    throw new Error("チャットを開始できませんでした");
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      match_id: matchId,
      sender_id: myUserId,
      body
    })
    .select("id, match_id, sender_id, body, sent_at")
    .single();

  if (error) throw error;
  return toDisplayMessage(data, myUserId);
}

export function lastReadKey(matchId) {
  return `${LAST_READ_PREFIX}${matchId}`;
}

export function markMessagesRead(match) {
  if (!match?.matchId) return false;
  localStorage.setItem(lastReadKey(match.matchId), new Date().toISOString());
  match.unreadCount = 0;
  return true;
}

export function unreadMessageCount(match) {
  if (!match?.matchId) return 0;
  const lastRead = localStorage.getItem(lastReadKey(match.matchId));
  const lastReadTime = lastRead ? Date.parse(lastRead) : 0;

  return chatMessages(match).filter((message) => {
    if (message.from === "me") return false;
    const sentAt = Date.parse(message.sentAt || "");
    return Number.isFinite(sentAt) && sentAt > lastReadTime;
  }).length;
}

export async function subscribeToMatchMessages(matchId, onMessage) {
  const supabase = getClient();
  const myUserId = await getMyUserId();
  if (!supabase || !myUserId || !matchId) return null;

  const channel = supabase
    .channel(`town-messages-${matchId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `match_id=eq.${matchId}` },
      (payload) => {
        if (payload.new?.sender_id === myUserId) return;
        onMessage?.(toDisplayMessage(payload.new, myUserId));
      }
    )
    .subscribe();

  return {
    unsubscribe() {
      supabase.removeChannel(channel);
    }
  };
}

export async function subscribeToAllMessages(onMessage) {
  const supabase = getClient();
  const myUserId = await getMyUserId();
  if (!supabase || !myUserId) return null;

  const channel = supabase
    .channel(`town-messages-all-${myUserId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      (payload) => {
        if (payload.new?.sender_id === myUserId) return;
        onMessage?.(toDisplayMessage(payload.new, myUserId));
      }
    )
    .subscribe();

  return {
    unsubscribe() {
      supabase.removeChannel(channel);
    }
  };
}
