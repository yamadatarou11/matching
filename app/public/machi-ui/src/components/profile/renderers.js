import { personPhotos } from "../../services/userService.js";
import { escapeHtml, safeStyleUrl } from "../../utils/escapeHtml.js";
import { renderIcon } from "../common/Icon.js";

export function renderProfileTags(tags) {
  return tags.length
    ? tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")
    : `<span class="tag">\u30bf\u30b0\u672a\u8a2d\u5b9a</span>`;
}

export function renderProfileInfo(candidate, gradeLabel) {
  const name = escapeHtml(candidate.name);
  const age = escapeHtml(candidate.age);
  const school = escapeHtml(candidate.school);
  const grade = escapeHtml(gradeLabel(candidate.grade));
  const distance = escapeHtml(candidate.distance);
  const hometown = escapeHtml(candidate.hometown);
  const genderLabels = { male: "男性", female: "女性", other: "その他" };
  const gender = escapeHtml(genderLabels[candidate.gender] || "");
  const meta = [school, grade, distance].filter(Boolean).map((item) => `<span>${item}</span>`).join("");
  const details = [
    gender ? `<span>性別: ${gender}</span>` : "",
    hometown ? `<span>出身地: ${hometown}</span>` : ""
  ].filter(Boolean).join("");

  return `
    <div class="candidate-identity">
      <h2>${name}${age ? `, ${age}` : ""}</h2>
      <div class="candidate-meta">${meta}</div>
      ${details ? `<div class="profile-card-details">${details}</div>` : ""}
    </div>
  `;
}

export function renderProfileImageCarousel(candidate, gradeLabel, photoIndex) {
  const photos = personPhotos(candidate);
  const currentPhoto = photos[photoIndex] || "";
  const prompt = escapeHtml(candidate.prompt);
  const idealDate = escapeHtml(candidate.idealDate);
  const bio = escapeHtml(candidate.bio);
  const fallbackInitial = escapeHtml(String(candidate.name || "").slice(0, 1));
  const dots = photos.length
    ? photos.map((_, index) => `<span class="${index === photoIndex ? "active" : ""}"></span>`).join("")
    : `<span class="active"></span><span></span><span></span><span></span>`;
  const backgroundStyle = currentPhoto
    ? `background-image: linear-gradient(180deg, rgba(0, 0, 0, 0.06) 0%, rgba(0, 0, 0, 0.18) 42%, rgba(0, 0, 0, 0.88) 100%), url('${safeStyleUrl(currentPhoto)}');`
    : `background: ${candidate.tone};`;

  return `
    <div class="candidate-hero" style="${escapeHtml(backgroundStyle)}">
      <div class="photo-dots">${dots}</div>
      ${
        photos.length
          ? `<div class="candidate-photo-count">${photoIndex + 1} / ${photos.length}</div>`
          : `<div class="candidate-photo-mark">${fallbackInitial}</div>`
      }
      <div class="candidate-body candidate-body-overlay">
        ${renderProfileInfo(candidate, gradeLabel)}
        <p class="bio-text">${bio}</p>
        ${prompt ? `<div class="prompt-card">
          <span>求めているもの</span>
          <strong>${prompt}</strong>
        </div>` : ""}
        ${idealDate ? `<div class="prompt-card profile-date-card">
          <span>理想のデートプラン</span>
          <strong>${idealDate}</strong>
        </div>` : ""}
        <div class="tag-row">${renderProfileTags(candidate.interests || [])}</div>
      </div>
    </div>
  `;
}

export function renderProfileCard(candidate, gradeLabel, photoIndex = 0) {
  return renderProfileImageCarousel(candidate, gradeLabel, photoIndex);
}

export function renderMiniProfileCard(
  candidate,
  gradeLabel,
  {
    className = "",
    variant = "plain",
    size = "default",
    clickable = false,
    attrs = "",
    topIcon = "",
    badge = "",
    subtitle = "",
    message = "",
    overlay = false
  } = {}
) {
  const photos = personPhotos(candidate);
  const photo = photos[0] || "";
  const rootTag = clickable ? "button" : "article";
  const classes = [
    "mini-profile-card",
    `mini-profile-card-${variant}`,
    `mini-profile-card-${size}`,
    overlay ? "mini-profile-card-overlay" : "",
    clickable ? "mini-profile-card-clickable" : "",
    className
  ]
    .filter(Boolean)
    .join(" ");

  const resolvedSubtitle = subtitle || `${candidate.school}\u30fb${gradeLabel(candidate.grade)}`;
  const messageHtml = message ? `<p class="mini-profile-card-message">${escapeHtml(message)}</p>` : "";
  const badgeHtml = badge ? `<div class="mini-profile-card-badge">${badge}</div>` : "";
  const iconHtml = topIcon ? `<div class="mini-profile-card-icon">${renderIcon(topIcon, { filled: topIcon === "like" || topIcon === "receivedLike" })}</div>` : "";
  const name = escapeHtml(candidate.name);
  const age = escapeHtml(candidate.age);
  const subtitleText = escapeHtml(resolvedSubtitle);
  const initial = escapeHtml(String(candidate.name || "").slice(0, 1));
  const mediaHtml = photo
    ? `<img src="${escapeHtml(photo)}" alt="${name}\u306e\u30d7\u30ed\u30d5\u30a3\u30fc\u30eb\u753b\u50cf" class="mini-profile-card-photo" />`
    : `<div class="mini-profile-card-photo mini-profile-card-photo-fallback">${initial}</div>`;

  return `
    <${rootTag} class="${classes}" ${clickable ? 'type="button"' : ""} ${attrs}>
      <div class="mini-profile-card-media">
        ${mediaHtml}
        ${overlay ? `<div class="mini-profile-card-media-overlay"></div>` : ""}
        ${iconHtml}
        ${badgeHtml}
      </div>
      <div class="mini-profile-card-body">
        <strong>${name}${age ? `, ${age}` : ""}</strong>
        <p class="mini-profile-card-subtitle">${subtitleText}</p>
        ${messageHtml}
        <div class="tag-row">${renderProfileTags(candidate.interests || [])}</div>
      </div>
    </${rootTag}>
  `;
}

export function renderProfileHeader(name, meta, status) {
  return { name, meta, status };
}

export function renderProfileDetail({ name, school, age, gender, faculty, lookingFor, type, status }) {
  return { name, school, age, gender, faculty, lookingFor, type, status };
}

export function renderProfileBio(bio) {
  return bio || "\u81ea\u5df1\u7d39\u4ecb\u306f\u307e\u3060\u3042\u308a\u307e\u305b\u3093\u3002";
}

export function renderEditProfileForm(data) {
  return data;
}

export function renderProfileSaveButton(label = "\u4fdd\u5b58") {
  return label;
}

export function renderProfilePhotoGrid(photos = [], { slots = 6 } = {}) {
  const normalizedPhotos = Array.isArray(photos) ? photos.slice(0, slots) : [];

  return Array.from({ length: slots }, (_, index) => {
    const photo = normalizedPhotos[index] || "";
    const isMain = index === 0;
    const slotLabel = isMain ? "メイン写真" : `写真 ${index + 1}`;
    const classes = ["photo-slot", isMain ? "main-photo-slot" : "", photo ? "" : "empty-photo-slot"]
      .filter(Boolean)
      .join(" ");

    if (photo) {
      return `
        <div class="${classes} photo-slot-filled">
          <button class="photo-slot-trigger" type="button" data-photo-slot="${index}" aria-label="${slotLabel}を変更">
            <img src="${escapeHtml(photo)}" alt="${slotLabel}" />
            <span>${slotLabel}</span>
            <i aria-hidden="true">+</i>
          </button>
          <button class="photo-slot-remove" type="button" data-remove-photo-slot="${index}" aria-label="${slotLabel}を削除">×</button>
        </div>
      `;
    }

    return `
      <button class="${classes}" type="button" data-photo-slot="${index}" aria-label="${slotLabel}を追加">
        <span>${slotLabel}</span>
        <i aria-hidden="true">+</i>
      </button>
    `;
  }).join("");
}

export function renderPublicProfilePreviewCard(preview, photoIndex = 0) {
  const photos = Array.isArray(preview?.photos) ? preview.photos.filter(Boolean) : [];
  const currentIndex = Math.min(Math.max(photoIndex, 0), Math.max(photos.length - 1, 0));
  const tags = Array.isArray(preview?.tags) ? preview.tags : [];
  const mediaHtml = photos.length
    ? `
      <div class="profile-photo-carousel" data-photo-count="${photos.length}" data-photo-index="${currentIndex}">
        <img src="${escapeHtml(photos[currentIndex])}" alt="プロフィール画像 ${currentIndex + 1}" />
        <span>${currentIndex + 1} / ${photos.length}</span>
        <div class="profile-photo-dots">
          ${photos.map((_, index) => `<i class="${index === currentIndex ? "active" : ""}"></i>`).join("")}
        </div>
        <button class="profile-photo-nav profile-photo-nav-prev" type="button" data-public-photo-direction="prev" aria-label="前の画像"${currentIndex === 0 ? " hidden" : ""}></button>
        <button class="profile-photo-nav profile-photo-nav-next" type="button" data-public-photo-direction="next" aria-label="次の画像"${currentIndex >= photos.length - 1 ? " hidden" : ""}></button>
      </div>
    `
    : `<div class="photo-slot empty-photo-slot main-photo-slot"><span>画像未設定</span></div>`;

  return {
    name: preview?.name || "",
    meta: preview?.meta || "",
    status: preview?.status || "",
    bio: preview?.bio || renderProfileBio(""),
    tagsHtml: tags.length
      ? tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")
      : `<span>興味・関心未設定</span>`,
    mediaHtml
  };
}
