import { renderEmptyState } from "../../components/common/EmptyState.js";
import { renderReceivedLikesScreen } from "./ReceivedLikesScreen.js";
import { renderProfileCard } from "../../components/profile/ProfileCard.js";
import { renderMatchModalText } from "../../components/match/MatchModal.js";
import { findMatchWith } from "../../services/matchService.js";
import { addLike, addPass, fetchReceivedLikes } from "../../services/likeService.js";
import { personPhotos } from "../../services/userService.js";
import { useSwipeAction } from "../../hooks/useSwipeAction.js";
import { renderLikeAnimation } from "../../components/actions/LikeAnimation.js";
import { escapeHtml } from "../../utils/escapeHtml.js";

export function createLikesScreen({ refs, state, helpers, showToast, onMatchFound }) {
  state.receivedLikes = Array.isArray(state.receivedLikes) ? state.receivedLikes : [];
  state.receivedLikesLoaded = Boolean(state.receivedLikesLoaded);

  const reviewState = {
    activeIndex: null,
    photoIndexes: {},
    suppressClick: false,
    responding: false,
    swipeCleanup: null
  };
  const REVIEW_EXIT_DURATION_MS = 180;

  function activeProfile() {
    if (reviewState.activeIndex == null) return null;
    return state.receivedLikes[reviewState.activeIndex] || null;
  }

  function showMatchOverlay(profile) {
    if (!refs.matchOverlay || !refs.matchCandidateAvatar || !refs.matchOverlayText) return;

    state.matchedCandidateForOverlay = profile;
    const photos = personPhotos(profile);
    const name = escapeHtml(profile.name);
    const initial = escapeHtml(String(profile.name || "").slice(0, 1));
    refs.matchCandidateAvatar.innerHTML = photos.length
      ? `<img src="${escapeHtml(photos[0])}" alt="${name} profile" />`
      : `<span>${initial}</span>`;
    refs.matchOverlayText.textContent = renderMatchModalText(profile.name);
    refs.matchOverlay.hidden = false;
    requestAnimationFrame(() => refs.matchOverlay.classList.add("visible"));
  }

  function showDecisionEffect(type, container = document.body) {
    const node = document.createElement("div");
    node.className = `decision-effect ${type === "bad" ? "bad-effect" : "like-effect"}`;
    node.innerHTML = `
      <div class="${type === "bad" ? "bad-effect-mark" : "like-effect-heart"}">${renderLikeAnimation(type)}</div>
      <div class="${type === "bad" ? "bad-effect-ring" : "like-effect-ring"}"></div>
      <span class="${type === "bad" ? "bad-effect-spark" : "like-effect-spark"} spark-one">${renderLikeAnimation(type)}</span>
      <span class="${type === "bad" ? "bad-effect-spark" : "like-effect-spark"} spark-two">${renderLikeAnimation(type)}</span>
      <span class="${type === "bad" ? "bad-effect-spark" : "like-effect-spark"} spark-three">${renderLikeAnimation(type)}</span>
      <strong>${type === "bad" ? "\u898b\u9001\u308a" : "\u3044\u3044\u306d"}</strong>
    `;
    container.appendChild(node);
    window.setTimeout(() => node.remove(), 900);
  }

  function renderReviewDialog() {
    const profile = activeProfile();
    if (!profile || !refs.likesDetailContent) return;

    const photos = personPhotos(profile);
    const profileKey = profile.userId || profile.name;
    const photoIndex = photos.length ? (reviewState.photoIndexes[profileKey] || 0) % photos.length : 0;

    refs.likesDetailContent.innerHTML = `
      <div class="likes-review-screen">
        <div class="likes-review-topbar">
          <button class="likes-review-back" type="button" data-like-review-action="close" aria-label="\u623b\u308b">
            &lt; \u623b\u308b
          </button>
        </div>
        <div class="discover-grid likes-review-discover">
          <div class="deck-stage">
            <div class="deck-shadow deck-shadow-one"></div>
            <div class="deck-shadow deck-shadow-two"></div>
            <div class="swipe-preview swipe-preview-like likes-review-swipe-preview likes-review-swipe-preview-like" aria-hidden="true">&#9825;</div>
            <div class="swipe-preview swipe-preview-bad likes-review-swipe-preview likes-review-swipe-preview-bad" aria-hidden="true">&times;</div>
            <article class="profile-card likes-review-profile-card">${renderProfileCard(profile, helpers.gradeLabel, photoIndex)}</article>
            <div class="candidate-actions likes-review-actions" aria-label="\u3044\u3044\u306d\u306e\u8fd4\u4e8b">
              <button type="button" data-like-review-action="skip" data-action="skip">&times;</button>
              <button type="button" data-like-review-action="like" data-action="like">&#9825;</button>
            </div>
          </div>
        </div>
      </div>
    `;

    attachReviewSwipe();
  }

  function openReceivedReview(index) {
    if (!state.receivedLikes[index] || !refs.likesDetailDialog) return;
    reviewState.activeIndex = index;
    reviewState.responding = false;
    renderReviewDialog();
    refs.likesDetailDialog.showModal();
  }

  function closeReview() {
    refs.likesDetailDialog?.close();
    reviewState.activeIndex = null;
    reviewState.responding = false;
    reviewState.swipeCleanup?.();
    reviewState.swipeCleanup = null;
    document.body.classList.remove("preview-like", "preview-bad");
  }

  async function respondToReceivedLike(action) {
    const profile = activeProfile();
    if (!profile) return;
    const answeredIndex = reviewState.activeIndex;

    // Update the list as soon as the exit animation completes. Restore the
    // card if saving fails so the user can retry.
    state.receivedLikes = state.receivedLikes.filter((item) => item.userId !== profile.userId);
    closeReview();
    renderReceivedGrid();

    try {
      if (action === "like") {
        await addLike(profile);
      } else {
        await addPass(profile);
      }
    } catch (error) {
      console.error("received like response error", error);
      if (!state.receivedLikes.some((item) => item.userId === profile.userId)) {
        state.receivedLikes.splice(Math.min(answeredIndex, state.receivedLikes.length), 0, profile);
        renderReceivedGrid();
      }
      showToast?.("いいね確認の保存に失敗しました");
      return;
    }

    if (action === "like") {
      try {
        const match = await findMatchWith(profile.userId);
        if (match) {
          onMatchFound?.(match);
          showMatchOverlay(match);
        }
      } catch (error) {
        console.error("received like match lookup error", error);
        showToast?.("いいねは保存されましたが、マッチ状態を確認できませんでした");
      }
    }
  }

  function handleReviewPhotoTap(clientX) {
    const profile = activeProfile();
    if (!profile || reviewState.responding) return;

    const photos = personPhotos(profile);
    if (photos.length <= 1) return;

    const profileKey = profile.userId || profile.name;
    const currentPhotoIndex = reviewState.photoIndexes[profileKey] || 0;
    const card = refs.likesDetailContent?.querySelector(".likes-review-profile-card");
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const direction = clientX - rect.left < rect.width / 2 ? -1 : 1;
    const nextPhotoIndex = currentPhotoIndex + direction;
    if (nextPhotoIndex < 0 || nextPhotoIndex >= photos.length) return;

    reviewState.photoIndexes[profileKey] = nextPhotoIndex;
    renderReviewDialog();
  }

  function previewReviewSwipe(diff) {
    const card = refs.likesDetailContent?.querySelector(".likes-review-profile-card");
    const likePreview = refs.likesDetailContent?.querySelector(".likes-review-swipe-preview-like");
    const badPreview = refs.likesDetailContent?.querySelector(".likes-review-swipe-preview-bad");
    if (!card) return;

    const rotate = diff / 18;
    const showPreview = Math.abs(diff) > 48;
    card.classList.toggle("swipe-right", showPreview && diff > 0);
    card.classList.toggle("swipe-left", showPreview && diff < 0);
    document.body.classList.toggle("preview-like", showPreview && diff > 0);
    document.body.classList.toggle("preview-bad", showPreview && diff < 0);
    likePreview?.classList.toggle("active", showPreview && diff > 0);
    badPreview?.classList.toggle("active", showPreview && diff < 0);
    card.style.transform = `translateX(${diff}px) rotate(${rotate}deg)`;
  }

  function resetReviewSwipe() {
    const card = refs.likesDetailContent?.querySelector(".likes-review-profile-card");
    const likePreview = refs.likesDetailContent?.querySelector(".likes-review-swipe-preview-like");
    const badPreview = refs.likesDetailContent?.querySelector(".likes-review-swipe-preview-bad");
    reviewState.suppressClick = false;
    if (!card) return;

    card.classList.remove("dragging", "swipe-right", "swipe-left");
    card.style.transform = "";
    document.body.classList.remove("preview-like", "preview-bad");
    likePreview?.classList.remove("active");
    badPreview?.classList.remove("active");
  }

  function completeReviewSwipe(direction) {
    if (reviewState.responding) return;
    const card = refs.likesDetailContent?.querySelector(".likes-review-profile-card");
    if (!card) return;

    reviewState.responding = true;
    card.classList.remove("dragging");
    document.body.classList.remove("preview-like", "preview-bad");
    showDecisionEffect(direction === "right" ? "like" : "bad", refs.likesDetailDialog);
    card.style.transform =
      direction === "right"
        ? "translateX(120vw) rotate(18deg)"
        : "translateX(-120vw) rotate(-18deg)";

    window.setTimeout(() => {
      reviewState.suppressClick = false;
      respondToReceivedLike(direction === "right" ? "like" : "skip");
    }, REVIEW_EXIT_DURATION_MS);
  }

  function completeReviewAction(action) {
    if (reviewState.responding) return;
    const card = refs.likesDetailContent?.querySelector(".likes-review-profile-card");
    if (!card) return;

    reviewState.responding = true;
    document.body.classList.remove("preview-like", "preview-bad");
    card.classList.add(action === "like" ? "profile-card-action-like" : "profile-card-action-skip");
    showDecisionEffect(action === "like" ? "like" : "bad", refs.likesDetailDialog);

    window.setTimeout(() => {
      respondToReceivedLike(action);
    }, REVIEW_EXIT_DURATION_MS);
  }

  function attachReviewSwipe() {
    reviewState.swipeCleanup?.();

    const card = refs.likesDetailContent?.querySelector(".likes-review-profile-card");
    if (!card) return;

    card.addEventListener("click", (event) => {
      if (!reviewState.suppressClick) return;
      reviewState.suppressClick = false;
      event.preventDefault();
      event.stopPropagation();
    });

    reviewState.swipeCleanup = useSwipeAction({
      card,
      onTapPhoto: handleReviewPhotoTap,
      onSwipe: completeReviewSwipe,
      onPreview: previewReviewSwipe,
      onReset: resetReviewSwipe,
      getOverlayVisible: () => false,
      setSuppressClick: (value) => {
        reviewState.suppressClick = value;
      }
    });
  }

  refs.receivedLikeGrid?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-like-index]");
    if (!button) return;
    openReceivedReview(Number(button.dataset.likeIndex));
  });

  refs.likesDetailContent?.addEventListener("click", (event) => {
    const action = event.target.closest("[data-like-review-action]")?.dataset.likeReviewAction;
    if (action === "close") {
      if (reviewState.responding) return;
      closeReview();
      return;
    }
    if (action === "skip" || action === "like") {
      completeReviewAction(action);
      return;
    }
  });

  refs.likesDetailDialog?.addEventListener("cancel", (event) => {
    if (reviewState.responding) event.preventDefault();
  });

  function renderReceivedGrid() {
    refs.matchCount.textContent = `${state.receivedLikes.length}\u4ef6`;
    refs.receivedLikeGrid.innerHTML = state.receivedLikes.length
      ? renderReceivedLikesScreen(state.receivedLikes, helpers.gradeLabel)
      : renderEmptyState({
          title: "\u53d7\u4fe1\u3044\u3044\u306d\u306f\u3042\u308a\u307e\u305b\u3093",
          body: "\u65b0\u3057\u304f\u5c4a\u3044\u305f\u3089\u3053\u3053\u306b\u8868\u793a\u3055\u308c\u307e\u3059\u3002"
        });

    if (refs.matchGrid) {
      refs.matchGrid.innerHTML = "";
    }
  }

  function renderLoading() {
    refs.matchCount.textContent = "0件";
    refs.receivedLikeGrid.innerHTML = renderEmptyState({
      title: "受信いいねを読み込み中です",
      body: "プロフィールを確認しています。"
    });
  }

  async function loadReceivedLikes() {
    if (state.receivedLikesLoading) return;
    state.receivedLikesLoading = true;
    renderLoading();

    try {
      state.receivedLikes = await fetchReceivedLikes();
      state.receivedLikesLoaded = true;
      renderReceivedGrid();
    } catch (error) {
      console.error("received likes fetch error", error);
      refs.receivedLikeGrid.innerHTML = renderEmptyState({
        title: "受信いいねを読み込めませんでした",
        body: "時間をおいてもう一度確認してください。"
      });
    } finally {
      state.receivedLikesLoading = false;
    }
  }

  function render() {
    if (!state.receivedLikesLoaded) {
      loadReceivedLikes();
      return;
    }
    renderReceivedGrid();
  }

  return {
    render,
    loadReceivedLikes
  };
}
