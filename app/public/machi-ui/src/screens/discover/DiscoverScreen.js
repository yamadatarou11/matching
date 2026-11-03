import { renderProfileCard } from "../../components/profile/ProfileCard.js";
import { renderMatchModalText } from "../../components/match/MatchModal.js";
import { renderLikeAnimation } from "../../components/actions/LikeAnimation.js";
import { useSwipeAction } from "../../hooks/useSwipeAction.js";
import { addLike, addPass, blockUser, createReport, removeUserFromLocalLists } from "../../services/likeService.js";
import { findMatchWith } from "../../services/matchService.js";
import { fetchCandidates, personPhotos } from "../../services/userService.js";
import { escapeHtml } from "../../utils/escapeHtml.js";

const moderationChecks = [
  "新規登録時にメール認証フローを確認",
  "年齢と地域カテゴリ入力のレビュー",
  "イベント詳細に危険な表現がないか確認",
  "プロフィール公開前に通報とブロック導線を確認"
];
const CARD_EXIT_DURATION_MS = 180;

export function createDiscoverScreen({ refs, state, helpers, showToast, switchView, openChat, showDiscoverFallback, onMatchFound }) {
  state.candidates = Array.isArray(state.candidates) ? state.candidates : [];
  state.candidatesLoaded = Boolean(state.candidatesLoaded);
  state.candidatesLoading = false;
  let candidateSelectionPending = false;

  function filteredList() {
    return state.candidates.filter((candidate) => !state.blockedUsers.includes(candidate.userId));
  }

  function resetSwipeCard() {
    state.suppressCandidateClick = false;
    refs.candidateCard.classList.remove(
      "dragging",
      "swipe-right",
      "swipe-left",
      "profile-card-action-like",
      "profile-card-action-skip"
    );
    refs.candidateCard.style.transform = "";
    document.body.classList.remove("preview-like", "preview-bad");
  }

  function canInteractWithCandidate() {
    if (!state.candidatesLoaded || state.candidatesLoading || candidateSelectionPending) return false;
    return Boolean(filteredList()[state.currentIndex]);
  }

  function moveCardBySwipe(diff) {
    const rotate = diff / 18;
    const directionClass = diff > 0 ? "swipe-right" : "swipe-left";
    const oppositeClass = diff > 0 ? "swipe-left" : "swipe-right";
    const showPreview = Math.abs(diff) > 48;

    refs.candidateCard.classList.toggle(directionClass, showPreview);
    refs.candidateCard.classList.remove(oppositeClass);
    document.body.classList.toggle("preview-like", showPreview && diff > 0);
    document.body.classList.toggle("preview-bad", showPreview && diff < 0);
    refs.candidateCard.style.transform = `translateX(${diff}px) rotate(${rotate}deg)`;
  }

  function renderEmptyCandidate() {
    resetSwipeCard();
    refs.candidateCard.classList.add("candidate-card-empty");
    refs.candidateCard.innerHTML = `
      <div class="candidate-body">
        <h2>表示できる相手がいません</h2>
        <p>条件に合う相手が増えたら表示されます。</p>
        <button class="ghost-button" type="button" data-action="reload-candidates">再読み込み</button>
      </div>
    `;
    refs.candidateActions.hidden = true;
  }

  function renderLoadingCandidate() {
    resetSwipeCard();
    refs.candidateCard.classList.add("candidate-card-empty");
    refs.candidateCard.innerHTML = `
      <div class="candidate-body">
        <h2>探す画面を読み込み中です</h2>
        <p>プロフィールカードを準備しています。</p>
      </div>
    `;
    refs.candidateActions.hidden = true;
  }

  async function loadCandidateList() {
    if (state.candidatesLoading) return;
    state.candidatesLoading = true;
    renderLoadingCandidate();

    try {
      state.candidates = await fetchCandidates();
      state.candidatesLoaded = true;
      state.currentIndex = 0;
      renderCandidate();
    } catch (error) {
      console.error("candidate fetch error", error);
      showDiscoverFallback?.("候補の取得に失敗しました。再読み込みしても直らない場合は、この画面名を教えてください。");
    } finally {
      state.candidatesLoading = false;
    }
  }

  function renderCandidate() {
    candidateSelectionPending = false;
    if (!state.candidatesLoaded) {
      loadCandidateList();
      return;
    }

    const list = filteredList();
    if (!list.length) {
      renderEmptyCandidate();
      return;
    }

    refs.candidateActions.hidden = false;
    refs.candidateCard.classList.remove("candidate-card-empty");
    // The outer card element is reused. Clear the exit state so the next
    // profile does not inherit the previous card's opacity and transform.
    refs.candidateCard.classList.remove("profile-card-action-like", "profile-card-action-skip");
    state.currentIndex = state.currentIndex % list.length;
    state.suppressCandidateClick = false;

    const candidate = list[state.currentIndex];
    const photos = personPhotos(candidate);
    const candidateKey = candidate.userId || candidate.name;
    const photoIndex = photos.length ? (state.candidatePhotoIndexes[candidateKey] || 0) % photos.length : 0;

    refs.candidateCard.innerHTML = renderProfileCard(candidate, helpers.gradeLabel, photoIndex);
    refs.candidateCard.style.transform = "";
    refs.candidateCard.classList.remove("swipe-right", "swipe-left", "dragging");
    document.body.classList.remove("preview-like", "preview-bad");
  }

  function nextCandidate() {
    const list = filteredList();
    if (list.length) {
      state.currentIndex = (state.currentIndex + 1) % list.length;
    }
    renderCandidate();
  }

  function showCandidatePhoto(direction = 1) {
    const list = filteredList();
    const candidate = list[state.currentIndex];
    if (!candidate) return;

    const photos = personPhotos(candidate);
    if (photos.length <= 1) return;

    const candidateKey = candidate.userId || candidate.name;
    const currentPhotoIndex = state.candidatePhotoIndexes[candidateKey] || 0;
    state.candidatePhotoIndexes[candidateKey] =
      (currentPhotoIndex + direction + photos.length) % photos.length;
    renderCandidate();
  }

  function showCandidatePhotoFromTap(clientX) {
    const list = filteredList();
    const candidate = list[state.currentIndex];
    if (!candidate) return;

    const photos = personPhotos(candidate);
    if (photos.length <= 1) return;

    const candidateKey = candidate.userId || candidate.name;
    const currentPhotoIndex = state.candidatePhotoIndexes[candidateKey] || 0;
    const rect = refs.candidateCard.getBoundingClientRect();
    const direction = clientX - rect.left < rect.width / 2 ? -1 : 1;
    const nextPhotoIndex = currentPhotoIndex + direction;
    if (nextPhotoIndex < 0 || nextPhotoIndex >= photos.length) return;
    showCandidatePhoto(direction);
  }

  function showDecisionEffect(type) {
    const node = document.createElement("div");
    node.className = `decision-effect ${type === "bad" ? "bad-effect" : "like-effect"}`;
    node.innerHTML = `
      <div class="${type === "bad" ? "bad-effect-mark" : "like-effect-heart"}">${renderLikeAnimation(type)}</div>
      <div class="${type === "bad" ? "bad-effect-ring" : "like-effect-ring"}"></div>
      <span class="${type === "bad" ? "bad-effect-spark" : "like-effect-spark"} spark-one">${renderLikeAnimation(type)}</span>
      <span class="${type === "bad" ? "bad-effect-spark" : "like-effect-spark"} spark-two">${renderLikeAnimation(type)}</span>
      <span class="${type === "bad" ? "bad-effect-spark" : "like-effect-spark"} spark-three">${renderLikeAnimation(type)}</span>
      <strong>${type === "bad" ? "見送り" : "いいね"}</strong>
    `;
    document.body.appendChild(node);
    window.setTimeout(() => node.remove(), 900);
  }

  function showMatchOverlay(candidate) {
    state.matchedCandidateForOverlay = candidate;
    const photos = personPhotos(candidate);
    const name = escapeHtml(candidate.name);
    const initial = escapeHtml(String(candidate.name || "").slice(0, 1));
    refs.matchCandidateAvatar.innerHTML = photos.length
      ? `<img src="${escapeHtml(photos[0])}" alt="${name}のプロフィール画像" />`
      : `<span>${initial}</span>`;
    refs.matchOverlayText.textContent = renderMatchModalText(candidate.name);
    refs.matchOverlay.hidden = false;
    requestAnimationFrame(() => refs.matchOverlay.classList.add("visible"));
  }

  function hideMatchOverlay() {
    refs.matchOverlay.classList.remove("visible");
    window.setTimeout(() => {
      if (!refs.matchOverlay.classList.contains("visible")) {
        refs.matchOverlay.hidden = true;
        state.matchedCandidateForOverlay = null;
      }
    }, 180);
  }

  function removeCandidate(candidate) {
    state.candidates = (state.candidates || []).filter((item) => item.userId !== candidate.userId);
    if (state.currentIndex >= state.candidates.length) {
      state.currentIndex = 0;
    }
  }

  async function persistSwipe(candidate, direction) {
    try {
      if (direction === "right") {
        await addLike(candidate);
        const match = await findMatchWith(candidate.userId);
        if (match) {
          onMatchFound?.(match);
          showMatchOverlay(match);
        }
      } else {
        await addPass(candidate);
      }
    } catch (error) {
      console.error("swipe persist error", error);
      showToast("スワイプ結果の保存に失敗しました");
    }
  }

  function completeCandidateSelection(direction, input = "swipe") {
    if (candidateSelectionPending) return;
    const list = filteredList();
    const candidate = list[state.currentIndex];
    if (!candidate) {
      resetSwipeCard();
      return;
    }

    candidateSelectionPending = true;
    document.body.classList.remove("preview-like", "preview-bad");
    refs.candidateCard.classList.remove("dragging");

    showDecisionEffect(direction === "right" ? "like" : "bad");
    persistSwipe(candidate, direction);

    if (input === "button") {
      refs.candidateCard.classList.add(
        direction === "right" ? "profile-card-action-like" : "profile-card-action-skip"
      );
    } else {
      refs.candidateCard.style.transform = direction === "right"
        ? "translateX(120vw) rotate(18deg)"
        : "translateX(-120vw) rotate(-18deg)";
    }

    window.setTimeout(() => {
      state.suppressCandidateClick = false;
      removeCandidate(candidate);
      renderCandidate();
    }, CARD_EXIT_DURATION_MS);
  }

  function completeCandidateSwipe(direction) {
    completeCandidateSelection(direction, "swipe");
  }

  function completeCandidateButton(direction) {
    completeCandidateSelection(direction, "button");
  }

  function openReportDialog(candidate) {
    state.activeCandidateForReport = candidate;
    refs.reportTarget.textContent = `${candidate.name} さんを通報しますか？`;
    refs.reportReason.value = "inappropriate";
    refs.reportNote.value = "";
    refs.reportDialog.showModal();
  }

  function renderModeration() {
    if (!refs.moderationList) return;
    refs.moderationList.innerHTML = moderationChecks
      .map((item) => `<label><input type="checkbox" /> ${item}</label>`)
      .join("");
  }

  refs.candidateCard?.addEventListener("click", (event) => {
    if (state.suppressCandidateClick) {
      state.suppressCandidateClick = false;
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    const action = event.target.closest("[data-action]")?.dataset.action;
    if (action) {
      if (action === "reload-candidates") {
        state.candidatesLoaded = false;
        loadCandidateList();
        return;
      }
      if (!canInteractWithCandidate()) return;
      const candidate = filteredList()[state.currentIndex];
      if (!candidate) return;

      if (action === "like") completeCandidateButton("right");
      if (action === "skip") completeCandidateButton("left");
      if (action === "report") openReportDialog(candidate);
      return;
    }
  });

  refs.candidateActions?.addEventListener("click", (event) => {
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (!action) return;
    if (!canInteractWithCandidate()) return;
    if (action === "like") completeCandidateButton("right");
    if (action === "skip") completeCandidateButton("left");
  });

  useSwipeAction({
    card: refs.candidateCard,
    onTapPhoto: showCandidatePhotoFromTap,
    onSwipe: completeCandidateSwipe,
    onPreview: moveCardBySwipe,
    onReset: resetSwipeCard,
    getOverlayVisible: () => !refs.matchOverlay.hidden,
    canSwipe: canInteractWithCandidate,
    setSuppressClick: (value) => {
      state.suppressCandidateClick = value;
    }
  });

  refs.submitReportButton?.addEventListener("click", () => {
    if (!state.activeCandidateForReport) return;

    createReport(state.activeCandidateForReport, {
      reason: refs.reportReason.value,
      note: refs.reportNote.value.trim()
    })
      .then(() => {
        refs.reportDialog.close();
        showToast("通報を送信しました");
      })
      .catch((error) => {
        console.error("report submit error", error);
        showToast("通報の送信に失敗しました");
      });
  });

  refs.blockUserButton?.addEventListener("click", () => {
    if (!state.activeCandidateForReport) return;

    const blockedUser = state.activeCandidateForReport;
    blockUser(blockedUser)
      .then(() => {
        removeUserFromLocalLists(state, blockedUser.userId);
        refs.reportDialog.close();
        showToast(`${blockedUser.name} さんをブロックしました`);
        renderCandidate();
      })
      .catch((error) => {
        console.error("block user error", error);
        showToast("ブロックに失敗しました");
      });
  });

  refs.matchSkipButton?.addEventListener("click", hideMatchOverlay);
  refs.matchMessageButton?.addEventListener("click", () => {
    const targetUserId = state.matchedCandidateForOverlay?.userId;
    hideMatchOverlay();
    if (!targetUserId) return;

    switchView("messages");
    const matchIndex = state.matches.findIndex((match) => match.userId === targetUserId);
    if (matchIndex >= 0) {
      openChat(matchIndex);
    }
  });

  return {
    renderCandidate,
    renderModeration,
    nextCandidate,
    completeCandidateSwipe,
    showCandidatePhotoFromTap
  };
}
