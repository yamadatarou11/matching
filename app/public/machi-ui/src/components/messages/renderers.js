import { renderAvatar } from "../common/ui.js";
import { escapeHtml } from "../../utils/escapeHtml.js";

export function renderUnreadBadge(count = 0) {
  const safeCount = Math.max(0, Number(count) || 0);
  return safeCount > 0 ? `<div class="unread-badge" aria-label="未返信メッセージ${safeCount}件">${safeCount}</div>` : "";
}

export function renderLastMessagePreview(text = "まだメッセージはありません") {
  return escapeHtml(text);
}

export function renderMessageListItem(match, { active, avatarHtml, subtitle, preview, unreadCount = 0 }) {
  return `
    <button class="conversation-item ${active ? "active" : ""}" data-chat="${match.originalIndex}">
      ${avatarHtml}
      <div class="conversation-item-text">
        <strong>${escapeHtml(match.name)}</strong>
        <small>${escapeHtml(subtitle)}</small>
        <span>${preview}</span>
      </div>
      ${renderUnreadBadge(unreadCount)}
    </button>
  `;
}

export function renderMessageList(matches, emptyHtml) {
  return matches.length ? matches.join("") : emptyHtml;
}

export function renderPendingMatch(match, { active, avatarHtml }) {
  return `
    <button class="pending-match-card ${active ? "active" : ""}" data-chat="${match.originalIndex}">
      ${avatarHtml}
      <span class="pending-match-name">${escapeHtml(match.name)}</span>
    </button>
  `;
}

export function renderAvatarOnly(person, className, photo) {
  return renderAvatar({ name: person.name, photo, className });
}
