import { renderMessageList } from "../../components/messages/MessageList.js";
import { renderMessageListItem, renderPendingMatch, renderAvatarOnly, renderLastMessagePreview } from "../../components/messages/renderers.js";
import { firstProfilePhoto } from "../../services/userService.js";

const EMPTY_CHAT_NOTE = "まだメッセージはありません";
const EMPTY_MESSAGE_TEXT = "まだメッセージはありません";

export function createMessagesScreen({ refs, state, helpers, messageHook, chatScreen, showToast }) {
  const pendingChatArea = document.querySelector("#pendingChatArea");
  let latestLoading = false;
  let sentMessageStatusLoading = false;

  function previewText(message) {
    if (!message?.text) return EMPTY_MESSAGE_TEXT;
    if (!message.sentAt) return message.text;
    const date = new Date(message.sentAt);
    if (Number.isNaN(date.getTime())) return message.text;
    return `${message.text} ・ ${date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}`;
  }

  function isUnrepliedMatch(match) {
    return match.sentMessageStatusLoaded && !match.hasSentMessage;
  }

  function renderConversations() {
    refs.chatCount.textContent = `${state.matches.length}\u4ef6`;

    const pendingMatches = state.matches
      .map((match, index) => ({ ...match, originalIndex: index }))
      .filter(isUnrepliedMatch);
    const matchListCount = document.querySelector("#matchListCount");
    if (matchListCount) {
      matchListCount.textContent = `${pendingMatches.length}\u4ef6`;
    }

    const messagedMatches = state.matches
      .map((match, index) => ({ ...match, originalIndex: index }))
      .filter((match) => messageHook.listMessages(match).length > 0);
    const unreadMatches = messagedMatches.filter((match) => messageHook.unreadCount(match) > 0);
    const totalUnreadReplies = unreadMatches.reduce((sum, match) => sum + messageHook.unreadCount(match), 0);

    const emptyHtml = `<p class="message-empty-note">${EMPTY_CHAT_NOTE}</p>`;
    const emptyPendingHtml = `<p class="message-empty-note">\u672a\u8fd4\u4fe1\u306e\u30de\u30c3\u30c1\u306f\u3042\u308a\u307e\u305b\u3093</p>`;

    if (refs.unreadRepliesButton && refs.unreadRepliesCount) {
      refs.unreadRepliesButton.hidden = totalUnreadReplies === 0;
      refs.unreadRepliesCount.textContent = `${totalUnreadReplies}\u4ef6`;
    }

    refs.pendingChatList.innerHTML = renderMessageList(
      pendingMatches.map((match) =>
        renderPendingMatch(match, {
          active: state.activeChat === match.originalIndex,
          avatarHtml: renderAvatarOnly(match, "pending-match-photo", firstProfilePhoto(match))
        })
      ),
      emptyPendingHtml
    );

    refs.conversationList.innerHTML = renderMessageList(
      messagedMatches.map((match) =>
        renderMessageListItem(match, {
          active: state.activeChat === match.originalIndex,
          avatarHtml: renderAvatarOnly(match, "conversation-avatar", firstProfilePhoto(match)),
          subtitle: `${match.school}\u30fb${helpers.gradeLabel(match.grade)}`,
          preview: renderLastMessagePreview(previewText(match.latestMessage || messageHook.listMessages(match).at(-1))),
          unreadCount: messageHook.unreadCount(match)
        })
      ),
      emptyHtml
    );

    if (!latestLoading && state.matches.some((match) => match.matchId && !match.latestLoaded)) {
      latestLoading = true;
      messageHook.loadLatestForMatches()
        .then(() => renderConversations())
        .catch((error) => {
          console.error("latest messages fetch error", error);
        })
        .finally(() => {
          latestLoading = false;
        });
    }

    if (!sentMessageStatusLoading && state.matches.some((match) => match.matchId && !match.sentMessageStatusLoaded)) {
      sentMessageStatusLoading = true;
      messageHook.loadSentMessageStatus()
        .then(() => renderConversations())
        .catch((error) => {
          console.error("sent message status fetch error", error);
        })
        .finally(() => {
          sentMessageStatusLoading = false;
        });
    }
  }

  refs.conversationList?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-chat]");
    if (button) chatScreen.openChat(Number(button.dataset.chat));
  });

  refs.pendingChatList?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-chat]");
    if (!button) return;
    event.preventDefault();
    chatScreen.openChat(Number(button.dataset.chat));
  });

  const wheelTarget = pendingChatArea || refs.pendingChatList;
  wheelTarget?.addEventListener("wheel", (event) => {
    if (!refs.pendingChatList) return;
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (!delta) return;
    refs.pendingChatList.scrollLeft += delta;
    event.preventDefault();
  }, { passive: false });

  const mouseDragState = {
    active: false,
    startX: 0,
    startScrollLeft: 0,
    moved: false
  };

  function startPendingMouseDrag(event) {
    if (!refs.pendingChatList || event.button !== 2) return;
    mouseDragState.active = true;
    mouseDragState.startX = event.clientX;
    mouseDragState.startScrollLeft = refs.pendingChatList.scrollLeft;
    mouseDragState.moved = false;
    refs.pendingChatList.classList.add("drag-scrolling");
    pendingChatArea?.classList.add("drag-scrolling");
    event.preventDefault();
  }

  function movePendingMouseDrag(event) {
    if (!mouseDragState.active || !refs.pendingChatList) return;
    const diff = event.clientX - mouseDragState.startX;
    if (Math.abs(diff) > 4) {
      mouseDragState.moved = true;
    }
    refs.pendingChatList.scrollLeft = mouseDragState.startScrollLeft - diff;
    event.preventDefault();
  }

  function stopPendingMouseDrag() {
    if (!mouseDragState.active) return;
    mouseDragState.active = false;
    refs.pendingChatList?.classList.remove("drag-scrolling");
    pendingChatArea?.classList.remove("drag-scrolling");
    window.setTimeout(() => {
      mouseDragState.moved = false;
    }, 0);
  }

  refs.pendingChatList?.addEventListener("mousedown", startPendingMouseDrag);
  pendingChatArea?.addEventListener("mousedown", (event) => {
    if (event.target.closest("#pendingChatList")) return;
    startPendingMouseDrag(event);
  });
  window.addEventListener("mousemove", movePendingMouseDrag);
  window.addEventListener("mouseup", stopPendingMouseDrag);
  refs.pendingChatList?.addEventListener("contextmenu", (event) => {
    if (mouseDragState.moved) {
      event.preventDefault();
    }
  });
  pendingChatArea?.addEventListener("contextmenu", (event) => {
    if (mouseDragState.moved) {
      event.preventDefault();
    }
  });
  refs.chatBackButton?.addEventListener("click", chatScreen.closeChatDetail);
  refs.unreadRepliesButton?.addEventListener("click", () => {
    const firstUnreadIndex = state.matches.findIndex((match) => messageHook.unreadCount(match) > 0);
    if (firstUnreadIndex >= 0) {
      chatScreen.openChat(firstUnreadIndex);
      return;
    }
    showToast("\u672a\u8fd4\u4fe1\u306e\u30e1\u30c3\u30bb\u30fc\u30b8\u306f\u3042\u308a\u307e\u305b\u3093");
  });

  refs.messageForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (state.activeChat === null || !state.matches[state.activeChat]) {
      showToast("\u5148\u306b\u30c1\u30e3\u30c3\u30c8\u76f8\u624b\u3092\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044");
      return;
    }

    const text = refs.messageInput.value.trim();
    if (!text) return;

    try {
      await messageHook.sendMessage(state.activeChat, text);
      refs.messageInput.value = "";
      chatScreen.renderChat(state.activeChat);
      renderConversations();
    } catch (error) {
      console.error("message send error", error);
      showToast(error?.message || "メッセージの送信に失敗しました");
    }
  });

  return {
    renderConversations
  };
}
