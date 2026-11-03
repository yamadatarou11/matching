import { renderMiniProfileCard } from "../profile/renderers.js";

function likeBadgeText(variant, index) {
  if (variant !== "received") {
    return "\u9001\u4fe1\u6e08\u307f";
  }

  return index < 2 ? "NEW" : "\u65e2\u8aad";
}

function likeStatusText(variant, like, gradeLabel) {
  if (variant === "received") {
    return "\u3042\u306a\u305f\u306b\u3044\u3044\u306d";
  }

  return `${like.school}\u30fb${gradeLabel(like.grade)}`;
}

function likeTopIcon(variant) {
  return variant === "received" ? "receivedLike" : "sentLike";
}

function renderLikeGridCard(like, gradeLabel, variant = "sent", index = 0) {
  return renderMiniProfileCard(like, gradeLabel, {
    className: `like-grid-card like-grid-card-${variant}`,
    variant,
    size: "grid",
    clickable: true,
    overlay: true,
    attrs: `data-like-index="${index}" data-like-variant="${variant}"`,
    topIcon: likeTopIcon(variant),
    badge: likeBadgeText(variant, index),
    subtitle: likeStatusText(variant, like, gradeLabel)
  });
}

export function renderSentLikeCard(like, gradeLabel) {
  return renderMiniProfileCard(like, gradeLabel, {
    className: "match-card match-card-sent",
    variant: "sent",
    size: "default",
    badge: "\u9001\u4fe1\u6e08\u307f",
    topIcon: "sentLike"
  });
}

export function renderReceivedLikeCard(like, gradeLabel) {
  return renderMiniProfileCard(like, gradeLabel, {
    className: "match-card received-like-card",
    variant: "received",
    size: "default",
    badge: "\u53d7\u4fe1\u3044\u3044\u306d",
    topIcon: "receivedLike",
    message: like.receivedMessage
  });
}

export function renderLikeList(list, gradeLabel, variant = "sent") {
  return list.map((item, index) => renderLikeGridCard(item, gradeLabel, variant, index)).join("");
}

export function renderLikeListItem(item, gradeLabel) {
  return renderMiniProfileCard(item, gradeLabel);
}

export function renderLikeDetailCard(like, gradeLabel, variant = "received") {
  const tags = (like.interests || []).map((tag) => `<span>${tag}</span>`).join("");
  const note =
    variant === "received"
      ? (like.receivedMessage || "\u30d7\u30ed\u30d5\u30a3\u30fc\u30eb\u304c\u5c4a\u3044\u3066\u3044\u307e\u3059\u3002")
      : "\u3042\u306a\u305f\u304c\u3044\u3044\u306d\u3057\u305f\u76f8\u624b\u3067\u3059\u3002";

  return `
    <div class="likes-detail-sheet">
      <div class="likes-detail-body">
        ${renderMiniProfileCard(like, gradeLabel, {
          className: "likes-detail-card-shell",
          variant,
          size: "detail",
          overlay: true,
          topIcon: variant === "received" ? "receivedLike" : "sentLike",
          badge: variant === "received" ? "\u53d7\u4fe1\u3044\u3044\u306d" : "\u9001\u4fe1\u6e08\u307f",
          subtitle: `${like.school}\u30fb${gradeLabel(like.grade)}`,
          message: note
        })}
        <div class="likes-detail-section">
          <strong>\u8208\u5473\u30fb\u95a2\u5fc3</strong>
          <div class="likes-detail-tags">${tags || "<span>\u30bf\u30b0\u672a\u8a2d\u5b9a</span>"}</div>
        </div>
        <div class="likes-detail-meta">${variant === "received" ? "\u3042\u306a\u305f\u3078\u306e\u3044\u3044\u306d" : "\u3042\u306a\u305f\u304c\u9001\u3063\u305f\u3044\u3044\u306d"}</div>
      </div>
      <div class="likes-detail-actions">
        <button class="likes-detail-secondary" type="button" data-like-detail-action="close">\u9589\u3058\u308b</button>
        <button class="likes-detail-primary" type="button" data-like-detail-action="message">\u30e1\u30c3\u30bb\u30fc\u30b8</button>
      </div>
    </div>
  `;
}
