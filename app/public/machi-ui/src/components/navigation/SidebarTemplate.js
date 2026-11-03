import { renderTabBar } from "./TabBar.js";

const sidebarTabs = [
  { view: "discover", label: "探す", isActive: true },
  { view: "matches", label: "いいね" },
  { view: "messages", label: "メッセージ" },
  { view: "settings", label: "設定" },
  { view: "profile", label: "プロフィール" },
];

export function renderSidebarTemplate() {
  return `
    <aside class="sidebar" aria-label="メインナビゲーション">
      <div class="brand">
        <span class="brand-mark">CM</span>
        <div>
          <strong>Campus Match</strong>
          <span>富山県の大学生限定マッチングアプリ</span>
        </div>
      </div>
      <nav class="nav-tabs" aria-label="画面切り替え">${renderTabBar(sidebarTabs)}</nav>
      <div class="status-box">
        <span class="status-dot"></span>
        <span id="currentUserLabel">ログイン待ち</span>
      </div>
      <button class="logout-button" id="logoutButton" type="button">ログアウト</button>
    </aside>
  `;
}
