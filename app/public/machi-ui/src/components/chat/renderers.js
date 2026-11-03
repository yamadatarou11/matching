import { escapeHtml } from "../../utils/escapeHtml.js";

export function renderMessageTimestamp(timestamp = "") {
  return timestamp ? `<time>${escapeHtml(timestamp)}</time>` : "";
}

export function renderSentMessageBubble(text) {
  return `<div class="bubble mine">${escapeHtml(text)}</div>`;
}

export function renderReceivedMessageBubble(text) {
  return `<div class="bubble">${escapeHtml(text)}</div>`;
}

export function renderChatBubble({ isMine, avatarHtml, text }) {
  return `
    <div class="message-row ${isMine ? "mine" : "theirs"}">
      ${isMine ? "" : avatarHtml}
      ${isMine ? renderSentMessageBubble(text) : renderReceivedMessageBubble(text)}
    </div>
  `;
}

export function renderChatHeader(name) {
  return escapeHtml(name);
}

export function renderMessageInput({
  id = "messageInput",
  placeholder = "\u30e1\u30c3\u30bb\u30fc\u30b8\u3092\u5165\u529b",
  autoComplete = "off",
} = {}) {
  return `<input id="${id}" type="text" placeholder="${placeholder}" autocomplete="${autoComplete}" />`;
}

export function renderSendButton({ label = "\u9001\u4fe1", type = "submit", className = "" } = {}) {
  const buttonClass = className ? ` class="${className}"` : "";
  return `<button type="${type}"${buttonClass}>${label}</button>`;
}

export function renderKeyboardArea() {
  return true;
}
