const STORAGE_KEYS = {
  currentUser: "townCurrentUser",
  verification: "townVerification",
  premium: "townPremium",
  settings: "townSettings"
};

export function readStoredJson(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeStoredJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getCurrentUser() {
  return readStoredJson(STORAGE_KEYS.currentUser, null);
}

export function clearCurrentUser() {
  localStorage.removeItem(STORAGE_KEYS.currentUser);
}

export function loadPersistedState() {
  return {
    verificationState: readStoredJson(STORAGE_KEYS.verification, null),
    premiumState: readStoredJson(STORAGE_KEYS.premium, null),
    appSettings: readStoredJson(STORAGE_KEYS.settings, { notifications: true })
  };
}

export function saveAppSettings(appSettings) {
  writeStoredJson(STORAGE_KEYS.settings, appSettings);
}
