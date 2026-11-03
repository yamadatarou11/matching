import { renderIcon } from "../common/Icon.js";

export function activateTab(viewId) {
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.view === viewId);
  });
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("active-view", view.id === viewId);
  });
}

export function renderHeader(title, subtitle = "") {
  return { title, subtitle };
}

export function renderBackButton({
  id = "",
  className = "",
  label = "\u623b\u308b",
  icon = "back",
  ariaLabel = "\u623b\u308b"
} = {}) {
  const attrs = [id ? `id="${id}"` : "", `class="${className}"`, `aria-label="${ariaLabel}"`].filter(Boolean).join(" ");
  return `
    <button ${attrs} type="button">
      ${renderIcon(icon, { className: "back-button-icon", label })}
    </button>
  `;
}

export function renderNavTab({ view, label, isActive = false }) {
  return `<button class="nav-tab${isActive ? " active" : ""}" data-view="${view}" type="button">${label}</button>`;
}

export function renderTabBar(items) {
  return items.map((item) => renderNavTab(item)).join("");
}

export function bindBackButton(button, onClick) {
  button.addEventListener("click", onClick);
}
