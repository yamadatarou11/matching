import { renderIcon } from "./Icon.js";
import { escapeHtml } from "../../utils/escapeHtml.js";

export function renderAppButton({ label, className = "", type = "button", attrs = "" }) {
  return `<button type="${type}" class="${className}" ${attrs}>${label}</button>`;
}

export function renderIconButton({ label, icon, className = "", attrs = "" }) {
  return `<button type="button" class="${className}" ${attrs}>${renderIcon(icon, { className: "icon-button-icon" })}<span>${label}</span></button>`;
}

export function renderAppInput({ value = "", placeholder = "", type = "text", attrs = "" }) {
  return `<input type="${type}" value="${value}" placeholder="${placeholder}" ${attrs} />`;
}

export function renderAppTextArea({ value = "", placeholder = "", rows = 4, attrs = "" }) {
  return `<textarea rows="${rows}" placeholder="${placeholder}" ${attrs}>${value}</textarea>`;
}

export function renderLoading(message = "\u8aad\u307f\u8fbc\u307f\u4e2d...") {
  return `<div class="loading">${message}</div>`;
}

export function renderModal(content) {
  return `<div class="modal-shell">${content}</div>`;
}

export function renderToastMessage(message) {
  return message;
}

export function renderEmptyState({ title, body }) {
  return `<div class="empty-state"><h3>${title}</h3><p>${body}</p></div>`;
}

export function renderAvatar({ name, photo, className = "" }) {
  const safeName = escapeHtml(name);
  const safePhoto = escapeHtml(photo);
  const safeClassName = escapeHtml(className);
  const initial = escapeHtml(String(name || "").slice(0, 1));
  return photo
    ? `<span class="${safeClassName}"><img src="${safePhoto}" alt="${safeName}\u306e\u30d7\u30ed\u30d5\u30a3\u30fc\u30eb\u753b\u50cf" /></span>`
    : `<span class="${safeClassName}">${initial}</span>`;
}

export function renderDivider() {
  return `<hr class="divider" />`;
}
