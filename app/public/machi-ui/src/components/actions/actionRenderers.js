import { renderIcon, resolveIcon } from "../common/Icon.js";

function renderActionButton({ action, label, icon, className = "" }) {
  const buttonClass = ["action-button", className].filter(Boolean).join(" ");
  return `
    <button type="button" class="${buttonClass}" data-action="${action}" aria-label="${label}">
      ${renderIcon(icon, { className: "action-button__icon" })}
    </button>
  `;
}

export function renderLikeButton() {
  return renderActionButton({
    action: "like",
    label: "\u3044\u3044\u306d",
    icon: "like",
    className: "action-button-like",
  });
}

export function renderPassButton() {
  return renderActionButton({
    action: "skip",
    label: "\u898b\u9001\u308a",
    icon: "pass",
    className: "action-button-skip",
  });
}

export function renderSuperLikeButton() {
  return renderActionButton({
    action: "super-like",
    label: "\u30b9\u30fc\u30d1\u30fc\u3044\u3044\u306d",
    icon: "superLike",
    className: "action-button-super-like",
  });
}

export function renderLikeAnimation(type) {
  return type === "bad" ? resolveIcon("pass") : resolveIcon("like");
}
