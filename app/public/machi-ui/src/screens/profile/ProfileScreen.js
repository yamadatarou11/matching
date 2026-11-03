import { renderProfileBio } from "../../components/profile/ProfileBio.js";
import { renderProfileCard } from "../../components/profile/ProfileCard.js";
import { renderProfilePhotoGrid } from "../../components/profile/ProfilePhotoGrid.js";
import { gradeLabel, personPhotos, profileYearValue } from "../../services/userService.js";
import { escapeHtml } from "../../utils/escapeHtml.js";

const HOBBY_OPTIONS = [
  "カフェ巡り", "登山・ハイキング", "写真撮影", "音楽鑑賞", "読書",
  "ゲーム", "料理", "映画鑑賞", "旅行", "スポーツ", "アニメ", "ドライブ",
  "ショッピング", "釣り", "キャンプ"
];
const PERSONALITY_OPTIONS = [
  "おだやか", "明るい", "アクティブ", "インドア派", "アウトドア派",
  "真面目", "のんびり", "好奇心旺盛"
];
const YEAR_OPTIONS = ["1", "2", "3", "4", "院1", "院2"];
const MAX_HOBBIES = 6;
const MAX_PERSONALITY = 3;

function parseList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniqueLimitedList(items, max) {
  const result = [];
  (items || []).forEach((item) => {
    const value = String(item || "").trim();
    if (!value || result.includes(value) || result.length >= max) return;
    result.push(value);
  });
  return result;
}

export function createProfileScreen({ refs, state, showToast }) {
  const photoCountLabel = document.querySelector("#photoCount");
  const editTabButton = document.querySelector("#editTabButton");
  const profileEditPane = document.querySelector("#profileEditPane");
  const profilePreviewPane = document.querySelector("#profilePreviewPane");
  const profilePreviewCardMount = document.querySelector("#profilePreviewCardMount");
  const hobbyGroup = document.querySelector("#hobbyGroup");
  const personalityGroup = document.querySelector("#personalityGroup");
  const hobbyCount = document.querySelector("#hobbyCount");
  const bioCount = document.querySelector("#bioCount");
  const typeCount = document.querySelector("#typeCount");
  const idealDateCount = document.querySelector("#idealDateCount");

  state.selectedHobbies = [];
  state.selectedPersonality = [];
  state.selectedYear = "";
  state.profilePreviewPhotoIndex = 0;

  function updatePhotoCount() {
    if (!photoCountLabel) return;
    photoCountLabel.textContent = `${state.profilePhotosData.filter(Boolean).length}/6枚`;
  }

  function updateCharCounts() {
    if (bioCount) bioCount.textContent = String(refs.profileBio?.value.length || 0);
    if (typeCount) typeCount.textContent = String(refs.profileType?.value.length || 0);
    if (idealDateCount) idealDateCount.textContent = String(refs.profileIdealDate?.value.length || 0);
  }

  function renderHobbyChips() {
    if (!hobbyGroup) return;
    const options = [...new Set([...HOBBY_OPTIONS, ...state.selectedHobbies])];
    hobbyGroup.innerHTML = options.map((hobby) => {
      const active = state.selectedHobbies.includes(hobby);
      return `<button class="chip ${active ? "active" : ""}" type="button" data-hobby="${escapeHtml(hobby)}" aria-pressed="${active}">${escapeHtml(hobby)}</button>`;
    }).join("");
    if (hobbyCount) hobbyCount.textContent = String(state.selectedHobbies.length);
    if (refs.profileInterests) refs.profileInterests.value = state.selectedHobbies.join(", ");
  }

  function renderPersonalityChips() {
    if (!personalityGroup) return;
    const options = [...new Set([...PERSONALITY_OPTIONS, ...state.selectedPersonality])];
    personalityGroup.innerHTML = options.map((item) => {
      const active = state.selectedPersonality.includes(item);
      return `<button class="chip chip-accent ${active ? "active" : ""}" type="button" data-personality="${escapeHtml(item)}" aria-pressed="${active}">${escapeHtml(item)}</button>`;
    }).join("");
  }

  function renderYearButtons() {
    if (!refs.profileYearGroup) return;
    refs.profileYearGroup.innerHTML = YEAR_OPTIONS.map((year) => {
      const active = state.selectedYear === year;
      const label = year.startsWith("院") ? year : `${year}年`;
      return `<button class="seg-button ${active ? "active" : ""}" type="button" data-year="${year}" aria-pressed="${active}">${label}</button>`;
    }).join("");
    if (refs.profileYear) refs.profileYear.value = state.selectedYear;
  }

  function setProfileMode(mode) {
    const preview = mode === "preview";
    editTabButton?.classList.toggle("active", !preview);
    refs.openProfilePreviewTabButton?.classList.toggle("active", preview);
    refs.profileForm?.classList.toggle("profile-preview-active", preview);
    profileEditPane?.classList.toggle("profile-pane-hidden", preview);
    profilePreviewPane?.classList.toggle("profile-pane-hidden", !preview);
    if (preview) renderProfileCardPreview();
  }

  function renderPublicProfileCard() {
    const profile = state.publicProfile;
    if (!profile || !refs.publicProfileCardMount) return;
    const photos = personPhotos(profile);
    if (state.publicPhotoIndex >= photos.length) state.publicPhotoIndex = Math.max(photos.length - 1, 0);
    refs.publicProfileCardMount.innerHTML = renderProfileCard(profile, gradeLabel, state.publicPhotoIndex);
  }

  function renderProfilePhoto(user) {
    state.profilePhotoItems = Array.isArray(user.photoItems)
      ? user.photoItems.slice(0, 6)
      : Array.isArray(user.photos)
        ? user.photos.slice(0, 6).map((url) => ({ url }))
        : [];
    state.profilePhotosData = state.profilePhotoItems.map((item) => item.url || item).filter(Boolean);
    if (!state.profilePhotosData.length && user.photo) state.profilePhotosData = [user.photo];
    refs.profilePhotoPreview.innerHTML = renderProfilePhotoGrid(state.profilePhotosData, { slots: 6 });
    updatePhotoCount();
  }

  function profileFormPreviewData() {
    const name = refs.profileName.value.trim() || "ニックネーム";
    const age = refs.profileAge.value.trim() ? `${refs.profileAge.value.trim()}歳` : "年齢未設定";
    const university = (refs.profileUniversity || refs.profileSchool).value.trim() || "大学未設定";
    const faculty = refs.profileFaculty.value.trim();
    const status = refs.profileType.value.trim() || refs.profileStatus?.value.trim() || "気軽に話しかけてください！";
    const tags = [...state.selectedHobbies, ...state.selectedPersonality].slice(0, 8);

    return {
      name,
      meta: [age, university, faculty].filter(Boolean).join(" / "),
      status,
      tags,
      bio: renderProfileBio(refs.profileBio.value.trim() || "自己紹介文が未設定です。"),
      photos: state.profilePhotosData.filter(Boolean)
    };
  }

  function profileFormCandidateData() {
    const preview = profileFormPreviewData();
    return {
      name: preview.name,
      age: refs.profileAge.value.trim() || "",
      grade: refs.profileYear?.value || state.currentUser?.grade || "resident",
      gender: refs.profileGender.value || "other",
      school: (refs.profileUniversity || refs.profileSchool).value.trim() || "大学未設定",
      distance: "",
      hometown: refs.profileHometown?.value.trim() || "",
      idealDate: refs.profileIdealDate?.value.trim() || "",
      bio: refs.profileBio.value.trim() || "自己紹介文が未設定です。",
      prompt: refs.profileType.value.trim() || refs.profileIdealDate?.value.trim() || "気軽に話しかけてください！",
      interests: preview.tags,
      tone: "linear-gradient(140deg, #1f7a5f, #3267a8)",
      photo: state.profilePhotosData.filter(Boolean)[0] || "",
      photos: state.profilePhotosData.filter(Boolean),
      match: 88
    };
  }

  function renderProfilePreview() {
    const preview = profileFormPreviewData();
    refs.profilePreviewName.textContent = preview.name;
    refs.profilePreviewMeta.textContent = preview.meta;
    refs.profilePreviewStatus.textContent = preview.status;
    refs.profilePreviewTags.innerHTML = preview.tags.length
      ? preview.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")
      : `<span>興味・関心未設定</span>`;
    updateCharCounts();
    updatePhotoCount();
  }

  function renderProfileCardPreview() {
    if (!profilePreviewCardMount) return;
    const candidate = profileFormCandidateData();
    const photoCount = Array.isArray(candidate.photos) ? candidate.photos.length : 0;
    if (state.profilePreviewPhotoIndex >= photoCount) state.profilePreviewPhotoIndex = Math.max(photoCount - 1, 0);
    profilePreviewCardMount.innerHTML = renderProfileCard(candidate, gradeLabel, state.profilePreviewPhotoIndex);
  }

  function openPublicProfile(candidate) {
    state.publicProfile = candidate;
    state.publicPhotoIndex = 0;
    renderPublicProfileCard();
    refs.profilePreviewDialog?.showModal();
  }

  function applyCurrentUser(user) {
    state.currentUser = user;
    refs.currentUserLabel.textContent = `${user.name} / ログイン済み`;
    refs.profileName.value = user.name || "";
    if (refs.profileUniversity) refs.profileUniversity.value = user.university || user.school || "";
    if (refs.profileSchool) refs.profileSchool.value = user.school || user.university || "";
    refs.profileAge.value = user.age || "";
    refs.profileGender.value = user.gender || "other";
    refs.profileFaculty.value = user.faculty || "";
    if (refs.profileHometown) refs.profileHometown.value = user.hometown || "";
    refs.profileType.value = user.type || user.status || "";
    if (refs.profileIdealDate) refs.profileIdealDate.value = user.idealDate || "";
    if (refs.profileStatus) refs.profileStatus.value = user.status || "";
    refs.profileBio.value = user.bio || "";
    state.selectedHobbies = uniqueLimitedList(
      Array.isArray(user.hobbies) ? user.hobbies : parseList(user.interests),
      MAX_HOBBIES
    );
    state.selectedPersonality = uniqueLimitedList(
      Array.isArray(user.personality) ? user.personality : [],
      MAX_PERSONALITY
    );
    state.selectedYear = user.year || profileYearValue(user.grade);
    renderProfilePhoto(user);
    renderHobbyChips();
    renderPersonalityChips();
    renderYearButtons();
    renderProfilePreview();
    setProfileMode("edit");
  }

  editTabButton?.addEventListener("click", () => setProfileMode("edit"));
  refs.openProfilePreviewTabButton?.addEventListener("click", () => setProfileMode("preview"));

  profilePreviewCardMount?.addEventListener("click", (event) => {
    const photos = state.profilePhotosData.filter(Boolean);
    if (photos.length <= 1) return;
    const bounds = profilePreviewCardMount.getBoundingClientRect();
    const clickX = event.clientX - bounds.left;
    if (clickX < bounds.width / 2) {
      state.profilePreviewPhotoIndex = Math.max(0, state.profilePreviewPhotoIndex - 1);
    } else {
      state.profilePreviewPhotoIndex = Math.min(photos.length - 1, state.profilePreviewPhotoIndex + 1);
    }
    renderProfileCardPreview();
  });

  refs.publicProfileCardMount?.addEventListener("click", (event) => {
    const media = event.target.closest(".candidate-hero");
    if (!media || !state.publicProfile) return;
    const photoCount = personPhotos(state.publicProfile).length;
    if (photoCount <= 1) return;
    const bounds = media.getBoundingClientRect();
    const clickX = event.clientX - bounds.left;
    if (clickX < bounds.width / 2) {
      state.publicPhotoIndex = Math.max(0, state.publicPhotoIndex - 1);
    } else {
      state.publicPhotoIndex = Math.min(photoCount - 1, state.publicPhotoIndex + 1);
    }
    renderPublicProfileCard();
  });

  hobbyGroup?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-hobby]");
    if (!button) return;
    const hobby = button.dataset.hobby;
    if (state.selectedHobbies.includes(hobby)) {
      state.selectedHobbies = state.selectedHobbies.filter((item) => item !== hobby);
    } else if (state.selectedHobbies.length < MAX_HOBBIES) {
      state.selectedHobbies.push(hobby);
    } else {
      showToast(`趣味は最大${MAX_HOBBIES}つまでです`);
    }
    renderHobbyChips();
    renderProfilePreview();
  });

  personalityGroup?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-personality]");
    if (!button) return;
    const item = button.dataset.personality;
    if (state.selectedPersonality.includes(item)) {
      state.selectedPersonality = state.selectedPersonality.filter((value) => value !== item);
    } else if (state.selectedPersonality.length < MAX_PERSONALITY) {
      state.selectedPersonality.push(item);
    } else {
      showToast(`性格は最大${MAX_PERSONALITY}つまでです`);
    }
    renderPersonalityChips();
    renderProfilePreview();
  });

  refs.profileYearGroup?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-year]");
    if (!button) return;
    state.selectedYear = button.dataset.year;
    renderYearButtons();
  });

  function addCustomTag(kind) {
    const isHobby = kind === "hobby";
    const input = isHobby ? refs.customHobbyInput : refs.customPersonalityInput;
    const value = input?.value.trim();
    if (!value) return;

    const selected = isHobby ? state.selectedHobbies : state.selectedPersonality;
    const max = isHobby ? MAX_HOBBIES : MAX_PERSONALITY;
    if (selected.includes(value)) {
      showToast("すでに追加されています");
      return;
    }
    if (selected.length >= max) {
      showToast(`${isHobby ? "趣味" : "性格"}は最大${max}つまでです`);
      return;
    }

    selected.push(value);
    if (input) input.value = "";
    if (isHobby) renderHobbyChips();
    else renderPersonalityChips();
    renderProfilePreview();
    renderProfileCardPreview();
  }

  refs.addCustomHobbyButton?.addEventListener("click", () => addCustomTag("hobby"));
  refs.addCustomPersonalityButton?.addEventListener("click", () => addCustomTag("personality"));
  refs.customHobbyInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addCustomTag("hobby");
    }
  });
  refs.customPersonalityInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addCustomTag("personality");
    }
  });

  [
    refs.profileName,
    refs.profileAge,
    refs.profileUniversity,
    refs.profileFaculty,
    refs.profileHometown,
    refs.profileType,
    refs.profileIdealDate,
    refs.profileStatus,
    refs.profileBio
  ].forEach((input) => input?.addEventListener("input", renderProfilePreview));

  return {
    applyCurrentUser,
    renderProfilePhoto,
    renderProfilePreview,
    renderProfileCardPreview,
    openPublicProfile,
    updatePhotoCount,
    setProfileMode
  };
}
