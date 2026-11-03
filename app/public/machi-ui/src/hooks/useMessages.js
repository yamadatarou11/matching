import {
  chatMessages,
  loadLatestMessages,
  loadMessages,
  loadSentMessageMatchIds,
  markMessagesRead,
  sendMessage as insertMessage,
  subscribeToMatchMessages,
  unreadMessageCount
} from "../services/messageService.js";

function appendUniqueMessage(match, message) {
  if (!match || !message) return false;
  if (!Array.isArray(match.messages)) match.messages = [];
  if (message.id && match.messages.some((item) => item.id === message.id)) return false;
  match.messages.push(message);
  match.latestMessage = message;
  return true;
}

export function useMessages(state) {
  let activeSubscription = null;

  function findMatchById(matchId) {
    return state.matches.find((match) => match.matchId === matchId) || null;
  }

  return {
    listMessages(match) {
      return chatMessages(match);
    },
    unreadCount(match) {
      return unreadMessageCount(match);
    },
    markRead(index) {
      const match = state.matches[index];
      return markMessagesRead(match);
    },
    async loadMessages(index) {
      const match = state.matches[index];
      if (!match?.matchId) return [];
      const matchId = match.matchId;
      const messages = await loadMessages(matchId);
      const currentMatch = findMatchById(matchId);
      if (!currentMatch) return messages;
      currentMatch.messages = messages;
      currentMatch.latestMessage = messages.at(-1) || null;
      currentMatch.hasSentMessage = messages.some((message) => message.from === "me");
      currentMatch.sentMessageStatusLoaded = true;
      return messages;
    },
    async loadLatestForMatches(matches = state.matches) {
      const latestByMatchId = await loadLatestMessages(matches.map((match) => match.matchId));
      matches.forEach((match) => {
        const latest = latestByMatchId.get(match.matchId) || null;
        match.latestMessage = latest;
        match.latestLoaded = true;
        if (latest && !chatMessages(match).length) {
          match.messages = [latest];
        }
      });
      return matches;
    },
    async loadSentMessageStatus(matches = state.matches) {
      const sentMatchIds = await loadSentMessageMatchIds(matches.map((match) => match.matchId));
      matches.forEach((match) => {
        match.hasSentMessage = sentMatchIds.has(match.matchId);
        match.sentMessageStatusLoaded = true;
      });
      return matches;
    },
    async sendMessage(index, text) {
      const match = state.matches[index];
      if (!match?.matchId) throw new Error("チャットを開始できませんでした");
      const matchId = match.matchId;
      const message = await insertMessage(matchId, text);
      const currentMatch = findMatchById(matchId);
      appendUniqueMessage(currentMatch, message);
      currentMatch.hasSentMessage = true;
      currentMatch.sentMessageStatusLoaded = true;
      markMessagesRead(currentMatch);
      return message;
    },
    async subscribe(index, onMessage) {
      const match = state.matches[index];
      if (!match?.matchId) return null;
      const matchId = match.matchId;
      activeSubscription?.unsubscribe?.();
      activeSubscription = await subscribeToMatchMessages(matchId, (message) => {
        const currentMatch = findMatchById(matchId);
        if (!currentMatch) return;
        if (appendUniqueMessage(currentMatch, message)) {
          onMessage?.(message, currentMatch);
        }
      });
      return activeSubscription;
    },
    unsubscribe() {
      activeSubscription?.unsubscribe?.();
      activeSubscription = null;
    }
  };
}
