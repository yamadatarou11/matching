import { renderChatBubble } from "../../components/chat/ChatBubble.js";
import { renderAvatarOnly } from "../../components/messages/renderers.js";
import { firstProfilePhoto } from "../../services/userService.js";

export function createChatScreen({ refs, state, messageHook, renderConversations, syncViewportSize, openPublicProfile }) {
  function renderChatMessages(match) {
    refs.chatLog.innerHTML = messageHook.listMessages(match)
      .map((message) =>
        renderChatBubble({
          isMine: message.from === "me",
          avatarHtml: renderAvatarOnly(match, "message-avatar", firstProfilePhoto(match)),
          text: message.text
        })
      )
      .join("");
    refs.chatLog.scrollTop = refs.chatLog.scrollHeight;
  }

  async function renderChat(index) {
    state.activeChat = index;
    const match = state.matches[index];
    if (!match) return;
    state.activeChatMatchId = match.matchId;
    refs.chatHeader.innerHTML = renderAvatarOnly(match, "chat-header-avatar", firstProfilePhoto(match));
    refs.chatHeader.setAttribute("aria-label", `${match.name || "相手"}のプロフィールを開く`);
    refs.chatLog.innerHTML = "";

    try {
      await messageHook.loadMessages(index);
      const currentIndex = state.matches.findIndex((item) => item.matchId === match.matchId);
      const activeIndex = currentIndex >= 0 ? currentIndex : index;
      state.activeChat = activeIndex;
      const activeMatch = state.matches[activeIndex] || match;
      messageHook.markRead(activeIndex);
      renderChatMessages(activeMatch);
      await messageHook.subscribe(activeIndex, () => {
        const nextIndex = state.matches.findIndex((item) => item.matchId === match.matchId);
        if (nextIndex >= 0) state.activeChat = nextIndex;
        messageHook.markRead(state.activeChat);
        renderChatMessages(state.matches[state.activeChat] || match);
        renderConversations();
      });
    } catch (error) {
      console.error("chat load error", error);
      refs.chatLog.innerHTML = `<p class="message-empty-note">メッセージを読み込めませんでした。</p>`;
    }
    renderConversations();
  }

  function openChat(index) {
    syncViewportSize();
    renderChat(index);
    refs.messagesView.classList.add("chat-detail-open");
    refs.appShell.classList.add("chat-detail-mode");
  }

  function closeChatDetail() {
    messageHook.unsubscribe();
    state.activeChatMatchId = null;
    refs.messagesView.classList.remove("chat-detail-open");
    refs.appShell.classList.remove("chat-detail-mode");
    document.documentElement.style.removeProperty("--chat-viewport-top");
  }

  refs.chatHeader?.addEventListener("click", () => {
    const match = state.matches[state.activeChat];
    if (!match) return;
    openPublicProfile?.(match);
  });

  return { renderChat, openChat, closeChatDetail };
}
