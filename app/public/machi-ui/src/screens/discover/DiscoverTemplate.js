import { renderLikeButton } from "../../components/actions/LikeButton.js";
import { renderPassButton } from "../../components/actions/PassButton.js";

export function renderDiscoverTemplate() {
  return `
    <section id="discover" class="view active-view">
      <div class="discover-grid">
        <div class="deck-stage">
          <div class="deck-shadow deck-shadow-one"></div>
          <div class="deck-shadow deck-shadow-two"></div>
          <article class="profile-card" id="candidateCard" aria-live="polite"></article>
          <div class="candidate-actions" id="candidateActions" aria-label="プロフィール操作">
            ${renderPassButton()}
            ${renderLikeButton()}
          </div>
        </div>
      </div>
    </section>
  `;
}
