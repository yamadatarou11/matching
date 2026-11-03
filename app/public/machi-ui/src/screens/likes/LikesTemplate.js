export function renderLikesTemplate() {
  return `
    <section id="matches" class="view">
      <div class="likes-list-bar">
        <strong>\u53d7\u4fe1\u3044\u3044\u306d</strong>
        <span id="matchCount">0\u4ef6</span>
      </div>
      <div class="likes-block inbound-likes-block">
        <div class="match-grid likes-grid" id="receivedLikeGrid"></div>
      </div>
      <div id="matchGrid" hidden></div>
    </section>
  `;
}
