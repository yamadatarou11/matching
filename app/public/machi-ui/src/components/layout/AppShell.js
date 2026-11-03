export function renderAppShell({ sidebar, mainContent, className = "app-shell app-locked", id = "appShell" }) {
  return `
    <div class="${className}" id="${id}">
      ${sidebar}
      <main class="main">${mainContent}</main>
    </div>
  `;
}
