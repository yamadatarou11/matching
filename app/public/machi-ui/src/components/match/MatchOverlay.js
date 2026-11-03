export function renderMatchOverlay() {
  return `
    <div class="match-overlay" id="matchOverlay" hidden>
      <div class="match-overlay-card" role="dialog" aria-modal="true" aria-labelledby="matchOverlayTitle">
        <div class="match-hearts" aria-hidden="true">♥ ♥ ♥</div>
        <h2 id="matchOverlayTitle">マッチング成立！</h2>
        <div class="match-avatars">
          <div class="match-avatar" id="matchCandidateAvatar"></div>
          <span>♥</span>
          <div class="match-avatar match-avatar-you">You</div>
        </div>
        <p id="matchOverlayText"></p>
        <div class="match-overlay-actions">
          <button type="button" id="matchSkipButton">あとで</button>
          <button type="button" id="matchMessageButton">メッセージする</button>
        </div>
      </div>
    </div>
  `;
}
