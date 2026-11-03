import { renderAuthTemplate } from "../screens/auth/AuthTemplate.js";
import { renderSidebarTemplate } from "../components/navigation/SidebarTemplate.js";
import { renderDiscoverTemplate } from "../screens/discover/DiscoverTemplate.js";
import { renderLikesTemplate } from "../screens/likes/LikesTemplate.js";
import { renderMessagesTemplate } from "../screens/messages/MessagesTemplate.js";
import { renderProfileTemplate } from "../screens/profile/ProfileTemplate.js";
import { renderSettingsTemplate } from "../screens/settings/SettingsTemplate.js";
import { renderAppOverlaysTemplate } from "../components/common/AppOverlaysTemplate.js";

export function renderAppLayout() {
  document.body.innerHTML = `
    ${renderAuthTemplate()}
    <div class="app-shell app-locked" id="appShell">
      ${renderSidebarTemplate()}
      <main class="main">
        ${renderDiscoverTemplate()}
        ${renderLikesTemplate()}
        ${renderMessagesTemplate()}
        ${renderProfileTemplate()}
        ${renderSettingsTemplate()}
      </main>
    </div>
    ${renderAppOverlaysTemplate()}
  `;
}
