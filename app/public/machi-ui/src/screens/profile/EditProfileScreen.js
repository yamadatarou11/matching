import { fetchMyPhotoItems, profileYearValue, replaceMyPhotos, updateMyProfile } from "../../services/userService.js";

const MAX_PHOTOS = 6;

function normalizedGrade(value) {
  if (value === "院1") return 5;
  if (value === "院2") return 6;
  const grade = Number.parseInt(String(value || ""), 10);
  return Number.isInteger(grade) && grade >= 1 && grade <= 4 ? grade : null;
}

function syncPhotoState(state, profileScreen, items) {
  state.profilePhotoItems = items.slice(0, MAX_PHOTOS);
  state.profilePhotosData = state.profilePhotoItems.map((item) => item.url).filter(Boolean);
  profileScreen.renderProfilePhoto({ photos: state.profilePhotosData, photoItems: state.profilePhotoItems });
  profileScreen.renderProfilePreview();
}

export function createEditProfileScreen({ refs, state, profileScreen, switchView, showToast }) {
  const openPickerButton = document.querySelector("#profileOpenPickerButton");
  let activePhotoSlot = null;
  let saving = false;

  async function refreshPhotoItems() {
    try {
      const items = await fetchMyPhotoItems();
      if (items.length) syncPhotoState(state, profileScreen, items);
    } catch (error) {
      console.warn("Profile photos refresh failed:", error);
    }
  }

  function openPhotoPicker(slot) {
    activePhotoSlot = slot;
    refs.profilePhoto?.click();
  }

  function addFiles(files) {
    const selectedFiles = Array.from(files || []).filter((file) => file.type.startsWith("image/"));
    if (!selectedFiles.length) return;

    const items = Array.isArray(state.profilePhotoItems) ? state.profilePhotoItems.slice(0, MAX_PHOTOS) : [];
    selectedFiles.forEach((file) => {
      const url = URL.createObjectURL(file);
      const nextItem = { file, url, isTemporary: true };
      if (activePhotoSlot != null && activePhotoSlot < MAX_PHOTOS) {
        items[activePhotoSlot] = nextItem;
        activePhotoSlot = null;
      } else if (items.length < MAX_PHOTOS) {
        items.push(nextItem);
      }
    });

    syncPhotoState(state, profileScreen, items.filter(Boolean));
    refs.profilePhoto.value = "";
  }

  function removePhoto(slot) {
    const items = Array.isArray(state.profilePhotoItems) ? state.profilePhotoItems.slice(0, MAX_PHOTOS) : [];
    const [removed] = items.splice(slot, 1);
    if (removed?.isTemporary && removed.url) URL.revokeObjectURL(removed.url);
    syncPhotoState(state, profileScreen, items);
  }

  function profilePayload() {
    return {
      nickname: refs.profileName.value.trim(),
      university: refs.profileUniversity.value.trim(),
      department: refs.profileFaculty.value.trim(),
      grade: normalizedGrade(refs.profileYear?.value || state.selectedYear),
      hometown: refs.profileHometown?.value.trim() || "",
      profileType: refs.profileType?.value.trim() || "",
      idealDate: refs.profileIdealDate?.value.trim() || "",
      bio: refs.profileBio.value.trim(),
      hobbies: Array.isArray(state.selectedHobbies) ? state.selectedHobbies.slice(0, 6) : [],
      personality: Array.isArray(state.selectedPersonality) ? state.selectedPersonality.slice(0, 3) : []
    };
  }

  function validatePayload(payload) {
    if (!payload.nickname) return "名前を入力してください";
    if (payload.nickname.length > 20) return "名前は20文字以内で入力してください";
    if (!payload.university) return "大学を入力してください";
    if ((payload.bio || "").length > 500) return "自己紹介は500文字以内で入力してください";
    if ((state.profilePhotoItems || []).filter(Boolean).length < 2) return "写真は2枚以上登録してください";
    return "";
  }

  refs.profilePhotoPreview?.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-photo-slot]");
    if (removeButton) {
      removePhoto(Number(removeButton.dataset.removePhotoSlot));
      return;
    }

    const slotButton = event.target.closest("[data-photo-slot]");
    if (slotButton) openPhotoPicker(Number(slotButton.dataset.photoSlot));
  });

  openPickerButton?.addEventListener("click", () => openPhotoPicker(null));
  refs.profilePhoto?.addEventListener("change", (event) => addFiles(event.target.files));

  refs.profileForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (saving) return;

    const payload = profilePayload();
    const validationError = validatePayload(payload);
    if (validationError) {
      showToast(validationError);
      return;
    }

    saving = true;
    refs.profileSaveSubmit?.setAttribute("disabled", "disabled");
    try {
      const [profile, photoItems] = await Promise.all([
        updateMyProfile(payload),
        replaceMyPhotos(state.profilePhotoItems)
      ]);

      const currentUser = {
        ...state.currentUser,
        name: profile.nickname || payload.nickname,
        school: profile.university || payload.university,
        university: profile.university || payload.university,
        faculty: profile.department || "",
        department: profile.department || "",
        grade: profile.grade == null ? "" : String(profile.grade),
        year: profileYearValue(profile.grade),
        hometown: profile.hometown || payload.hometown,
        type: profile.profile_type || payload.profileType,
        idealDate: profile.ideal_date || payload.idealDate,
        bio: profile.bio || "",
        hobbies: profile.hobbies || [],
        interests: profile.hobbies || [],
        personality: profile.personality || payload.personality,
        photos: photoItems.map((item) => item.url),
        photoItems,
        photo: photoItems[0]?.url || ""
      };
      state.currentUser = currentUser;
      profileScreen.applyCurrentUser(currentUser);
    } catch (error) {
      console.error(error);
      showToast(error.message || "保存に失敗しました");
    } finally {
      saving = false;
      refs.profileSaveSubmit?.removeAttribute("disabled");
    }
  });

  refs.profileBackButton?.addEventListener("click", () => switchView("discover"));
  refreshPhotoItems();
}
