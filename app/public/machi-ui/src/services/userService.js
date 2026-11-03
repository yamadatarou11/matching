import { getClient } from "./supabaseClient.js";

const CANDIDATE_TONES = [
  "linear-gradient(140deg, #1f7a5f, #3267a8)",
  "linear-gradient(140deg, #db6f5f, #c28720)",
  "linear-gradient(140deg, #c28720, #1f7a5f)",
  "linear-gradient(140deg, #ff4d6d, #8b5cf6)"
];

export function parseInterests(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function gradeLabel(grade) {
  const normalized = String(grade ?? "").trim();
  if (/^[1-4]$/.test(normalized)) return `${normalized}年`;
  if (normalized === "5" || normalized === "院1") return "院1";
  if (normalized === "6" || normalized === "院2") return "院2";
  return "学年未設定";
}

export function profileYearValue(grade) {
  const normalized = String(grade ?? "").trim();
  if (/^[1-4]$/.test(normalized)) return normalized;
  if (normalized === "5" || normalized === "院1") return "院1";
  if (normalized === "6" || normalized === "院2") return "院2";
  return "";
}

export function personPhotos(person) {
  const photos = Array.isArray(person.photos) ? person.photos.filter(Boolean) : [];
  if (!photos.length && person.photo) return [person.photo];
  return photos;
}

export function firstProfilePhoto(person) {
  return personPhotos(person)[0] || "";
}

function ageLabel(age) {
  const numericAge = Number(age);
  return Number.isFinite(numericAge) && numericAge >= 0 ? `${numericAge}歳` : "";
}

function normalizeHobbies(hobbies) {
  if (Array.isArray(hobbies)) return hobbies.filter(Boolean).slice(0, 6);
  return parseInterests(hobbies).slice(0, 6);
}

function normalizeStorageName(name) {
  return String(name || "photo")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "photo";
}

function photoExtension(file) {
  const byType = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp"
  };
  if (byType[file?.type]) return byType[file.type];
  const match = String(file?.name || "").match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : "jpg";
}

export async function signedPhotoItems(supabase, userId) {
  const { data: photos, error } = await supabase
    .from("photos")
    .select("id, storage_path, sort_order, is_main")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });

  if (error || !Array.isArray(photos) || !photos.length) return [];

  const signedUrlByPath = await createSignedUrlMap(supabase, photos.map((photo) => photo.storage_path));
  const signedItems = photos.map((photo) => {
    if (!photo.storage_path) return null;
    return {
      id: photo.id,
      path: photo.storage_path,
      sortOrder: photo.sort_order,
      isMain: photo.is_main,
      url: signedUrlByPath.get(photo.storage_path) || ""
    };
  });

  return signedItems.filter((item) => item?.url);
}

async function signedPhotoUrls(supabase, userId) {
  return (await signedPhotoItems(supabase, userId)).map((item) => item.url);
}

async function createSignedUrlMap(supabase, paths) {
  const uniquePaths = [...new Set((paths || []).filter(Boolean))];
  const signedUrlByPath = new Map();
  if (!uniquePaths.length) return signedUrlByPath;

  const bucket = supabase.storage.from("profile-photos");
  if (typeof bucket.createSignedUrls === "function") {
    const { data, error } = await bucket.createSignedUrls(uniquePaths, 3600);
    if (error) {
      console.warn("Profile photo signed URLs failed:", error.message);
      return signedUrlByPath;
    }
    (data || []).forEach((item, index) => {
      signedUrlByPath.set(item.path || uniquePaths[index], item.signedUrl || "");
    });
    return signedUrlByPath;
  }

  await Promise.all(
    uniquePaths.map(async (path) => {
      const { data, error } = await bucket.createSignedUrl(path, 3600);
      if (error) {
        console.warn("Profile photo signed URL failed:", error.message);
        return;
      }
      signedUrlByPath.set(path, data?.signedUrl || "");
    })
  );
  return signedUrlByPath;
}

async function signedPhotoUrlsByUserIds(supabase, userIds) {
  const uniqueIds = [...new Set((userIds || []).filter(Boolean))];
  const urlsByUserId = new Map(uniqueIds.map((userId) => [userId, []]));
  if (!uniqueIds.length) return urlsByUserId;

  const { data: photos, error } = await supabase
    .from("photos")
    .select("user_id, storage_path, sort_order")
    .in("user_id", uniqueIds)
    .order("sort_order", { ascending: true });

  if (error || !Array.isArray(photos) || !photos.length) return urlsByUserId;

  const signedUrlByPath = await createSignedUrlMap(supabase, photos.map((photo) => photo.storage_path));
  photos.forEach((photo) => {
    const url = signedUrlByPath.get(photo.storage_path);
    if (!url) return;
    if (!urlsByUserId.has(photo.user_id)) urlsByUserId.set(photo.user_id, []);
    urlsByUserId.get(photo.user_id).push(url);
  });
  return urlsByUserId;
}

function profileToDisplayUser(profile, photos, index = 0, extra = {}) {
  const tags = [...normalizeHobbies(profile.hobbies), ...normalizeHobbies(profile.personality)].slice(0, 8);
  return {
    userId: profile.user_id,
    name: profile.nickname || "",
    age: ageLabel(profile.age),
    grade: profile.grade ? `${profile.grade}` : "",
    gender: profile.gender || "",
    school: profile.university || "",
    distance: profile.department || "",
    hometown: profile.hometown || "",
    profileType: profile.profile_type || "",
    idealDate: profile.ideal_date || "",
    bio: profile.bio || "",
    prompt: profile.profile_type || "",
    interests: tags,
    photo: photos[0] || "",
    photos,
    match: null,
    tone: CANDIDATE_TONES[index % CANDIDATE_TONES.length],
    ...extra
  };
}

export async function fetchProfilesByUserIds(userIds, extrasByUserId = {}, { requirePhotos = false } = {}) {
  const supabase = getClient();
  const uniqueIds = [...new Set((userIds || []).filter(Boolean))];
  if (!supabase || !uniqueIds.length) return [];

  const { data: profiles, error } = await supabase.rpc("get_profiles_public", { user_ids: uniqueIds });

  if (error) throw error;

  const profileById = new Map((profiles || []).map((profile) => [profile.user_id, profile]));
  const photosByUserId = await signedPhotoUrlsByUserIds(supabase, uniqueIds);
  const users = uniqueIds.map((userId, index) => {
    const profile = profileById.get(userId);
    if (!profile) return null;

    const photos = photosByUserId.get(userId) || [];
    if (requirePhotos && !photos.length) return null;
    return profileToDisplayUser(profile, photos, index, extrasByUserId[userId] || {});
  });

  return users.filter(Boolean);
}

export async function fetchCandidates() {
  const supabase = getClient();
  if (!supabase) return [];

  const { data: profiles, error } = await supabase.rpc("get_candidates", { limit_count: 20 });
  if (error) throw error;
  if (!Array.isArray(profiles)) return [];

  const photosByUserId = await signedPhotoUrlsByUserIds(supabase, profiles.map((profile) => profile.user_id));
  const candidates = profiles.map((profile, index) => {
    const photos = photosByUserId.get(profile.user_id) || [];
    if (!photos.length) return null;
    return profileToDisplayUser(profile, photos, index);
  });

  return candidates.filter(Boolean);
}

export async function fetchMyPhotoItems() {
  const supabase = getClient();
  if (!supabase) return [];
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData?.session?.user?.id;
  if (!userId) return [];
  return signedPhotoItems(supabase, userId);
}

export async function updateMyProfile(profileInput) {
  const supabase = getClient();
  if (!supabase) throw new Error("Supabaseに接続できません");
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  const userId = sessionData?.session?.user?.id;
  if (!userId) throw new Error("ログイン状態を確認できません");

  const payload = {
    nickname: profileInput.nickname,
    university: profileInput.university,
    department: profileInput.department || null,
    grade: profileInput.grade,
    hometown: profileInput.hometown || null,
    profile_type: profileInput.profileType || null,
    ideal_date: profileInput.idealDate || null,
    bio: profileInput.bio || null,
    hobbies: profileInput.hobbies,
    personality: Array.isArray(profileInput.personality) ? profileInput.personality.slice(0, 3) : []
  };

  async function updateProfile(nextPayload) {
    return supabase
      .from("profiles")
      .update(nextPayload)
      .eq("user_id", userId)
      .select("*")
      .single();
  }

  let { data, error } = await updateProfile(payload);

  if (error && String(error.message || "").includes("'personality' column")) {
    const { personality, ...fallbackPayload } = payload;
    ({ data, error } = await updateProfile(fallbackPayload));
    if (data) data.personality = profileInput.personality || [];
  }

  if (error) throw error;
  return data;
}

export async function replaceMyPhotos(photoItems) {
  const supabase = getClient();
  if (!supabase) throw new Error("Supabaseに接続できません");
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  const userId = sessionData?.session?.user?.id;
  if (!userId) throw new Error("ログイン状態を確認できません");

  const normalizedItems = (photoItems || []).filter(Boolean).slice(0, 6);
  if (normalizedItems.length < 2) throw new Error("写真は2枚以上登録してください");

  const { data: existingRows, error: existingError } = await supabase
    .from("photos")
    .select("storage_path, sort_order, is_main")
    .eq("user_id", userId);
  if (existingError) throw existingError;
  const restoreRows = (existingRows || []).map((row) => ({
    user_id: userId,
    storage_path: row.storage_path,
    sort_order: row.sort_order,
    is_main: row.is_main
  }));

  const uploadedPaths = [];
  const nextPaths = [];
  for (const [index, item] of normalizedItems.entries()) {
    if (item.path && !item.file) {
      nextPaths.push(item.path);
      continue;
    }
    if (!item.file) continue;

    const ext = photoExtension(item.file);
    const storagePath = `${userId}/${Date.now()}-${index}-${normalizeStorageName(item.file.name)}.${ext}`;
    const { error: uploadError } = await supabase
      .storage
      .from("profile-photos")
      .upload(storagePath, item.file, {
        cacheControl: "3600",
        contentType: item.file.type || "image/jpeg",
        upsert: false
      });
    if (uploadError) throw uploadError;
    uploadedPaths.push(storagePath);
    nextPaths.push(storagePath);
  }

  const existingPaths = new Set((existingRows || []).map((row) => row.storage_path).filter(Boolean));
  const keepPaths = new Set(nextPaths);
  const removePaths = [...existingPaths].filter((path) => !keepPaths.has(path));

  const { error: deleteRowsError } = await supabase
    .from("photos")
    .delete()
    .eq("user_id", userId);
  if (deleteRowsError) throw deleteRowsError;

  const photoRows = nextPaths.map((storage_path, index) => ({
    user_id: userId,
    storage_path,
    sort_order: index,
    is_main: index === 0
  }));
  const { error: insertRowsError } = await supabase.from("photos").insert(photoRows);
  if (insertRowsError) {
    if (uploadedPaths.length) await supabase.storage.from("profile-photos").remove(uploadedPaths);
    if (restoreRows.length) {
      const { error: restoreError } = await supabase.from("photos").insert(restoreRows);
      if (restoreError) throw restoreError;
    }
    throw insertRowsError;
  }

  if (removePaths.length) {
    const { error: removeError } = await supabase.storage.from("profile-photos").remove(removePaths);
    if (removeError) console.warn("Old profile photos remove failed:", removeError.message);
  }

  return fetchMyPhotoItems();
}

export async function deleteMyPublicAccountData() {
  const supabase = getClient();
  if (!supabase) throw new Error("Supabaseに接続できません");
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  const userId = sessionData?.session?.user?.id;
  if (!userId) throw new Error("ログイン状態を確認できません");

  const { data: photos } = await supabase
    .from("photos")
    .select("storage_path")
    .eq("user_id", userId);
  const paths = (photos || []).map((photo) => photo.storage_path).filter(Boolean);
  if (paths.length) {
    const { error: storageError } = await supabase.storage.from("profile-photos").remove(paths);
    if (storageError) console.warn("Profile photos remove failed:", storageError.message);
  }

  const { error } = await supabase.from("profiles").delete().eq("user_id", userId);
  if (error) throw error;
  await supabase.auth.signOut();
}

export async function submitMyVerification(file) {
  const supabase = getClient();
  if (!supabase) throw new Error("Supabaseに接続できません");
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  const userId = sessionData?.session?.user?.id;
  if (!userId) throw new Error("ログイン状態を確認できません");
  if (!file) throw new Error("確認画像を選択してください");

  const ext = photoExtension(file);
  const storagePath = `${userId}/${Date.now()}-${normalizeStorageName(file.name)}.${ext}`;
  const { error: uploadError } = await supabase
    .storage
    .from("student-ids")
    .upload(storagePath, file, {
      cacheControl: "3600",
      contentType: file.type || "image/jpeg",
      upsert: false
    });
  if (uploadError) throw uploadError;

  const { error } = await supabase.from("verifications").upsert({
    user_id: userId,
    storage_path: storagePath,
    status: "pending",
    submitted_at: new Date().toISOString(),
    reviewed_at: null,
    reject_note: null
  });
  if (error) throw error;
  return { status: "pending", storage_path: storagePath };
}

export async function getMyVerification() {
  const supabase = getClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("verifications").select("*").maybeSingle();
  if (error) throw error;
  return data || null;
}
