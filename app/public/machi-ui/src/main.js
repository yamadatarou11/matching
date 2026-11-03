import { loadPersistedState, getCurrentUser, clearCurrentUser } from "./services/authService.js";
import { deleteMyPublicAccountData, fetchMyPhotoItems, gradeLabel, personPhotos, profileYearValue } from "./services/userService.js";
import { routes } from "./constants/routes.js";
import { createAuthScreen } from "./screens/auth/AuthScreen.js";
import { createDiscoverScreen } from "./screens/discover/DiscoverScreen.js";
import { createLikesScreen } from "./screens/likes/LikesScreen.js";
import { createProfileScreen } from "./screens/profile/ProfileScreen.js";
import { createEditProfileScreen } from "./screens/profile/EditProfileScreen.js";
import { useMessages } from "./hooks/useMessages.js";
import { createChatScreen } from "./screens/chat/ChatScreen.js";
import { createMessagesScreen } from "./screens/messages/MessagesScreen.js";
import { createSettingsScreen } from "./screens/settings/SettingsScreen.js";
import { activateTab } from "./components/navigation/TabBar.js";
import { renderAppLayout } from "./app/renderAppLayout.js";
import { getClient, getMyProfile, getSession } from "./services/supabaseClient.js";
import { fetchMatches, subscribeToMatches, unsubscribeFromMatches } from "./services/matchService.js";
import { subscribeToAllMessages } from "./services/messageService.js";
import { renderMatchModalText } from "./components/match/MatchModal.js";
import { escapeHtml } from "./utils/escapeHtml.js";

window.__townAppMainLoaded = true;

if (!document.querySelector("#authScreen")) {
  renderAppLayout();
}

const refs = {
  authScreen: document.querySelector("#authScreen"),
  appShell: document.querySelector("#appShell"),
  loginForm: document.querySelector("#loginForm"),
  signupForm: document.querySelector("#signupForm"),
  signupSteps: [...document.querySelectorAll(".signup-step")],
  signupProgress: document.querySelector("#signupProgress"),
  currentUserLabel: document.querySelector("#currentUserLabel"),
  logoutButton: document.querySelector("#logoutButton"),
  startSignupButton: document.querySelector("#startSignupButton"),
  backToLoginButton: document.querySelector("#backToLoginButton"),
  sendVerificationButton: document.querySelector("#sendVerificationButton"),
  verifyCodeButton: document.querySelector("#verifyCodeButton"),
  verificationHelp: document.querySelector("#verificationHelp"),
  completeSignupButton: document.querySelector("#completeSignupButton"),
  signupSkipProfile: document.querySelector("#signupSkipProfile"),
  signupTermsAgreement: document.querySelector("#signupTermsAgreement"),
  signupAgreeNextButton: document.querySelector("#signupAgreeNextButton"),
  signupStudentIdFile: document.querySelector("#signupStudentIdFile"),
  signupStudentIdFileName: document.querySelector("#signupStudentIdFileName"),
  signupStudentNumber: document.querySelector("#signupStudentNumber"),
  privacyButton: document.querySelector("#privacyButton"),
  termsButton: document.querySelector("#termsButton"),
  deleteAccountButton: document.querySelector("#deleteAccountButton"),
  reportDialog: document.querySelector("#reportDialog"),
  reportTarget: document.querySelector("#reportTarget"),
  reportReason: document.querySelector("#reportReason"),
  reportNote: document.querySelector("#reportNote"),
  blockUserButton: document.querySelector("#blockUserButton"),
  submitReportButton: document.querySelector("#submitReportButton"),
  openProfilePreviewButton: document.querySelector("#openProfilePreviewButton"),
  openProfilePreviewTabButton: document.querySelector("#openProfilePreviewTabButton"),
  profilePreviewDialog: document.querySelector("#profilePreviewDialog"),
  profileForm: document.querySelector("#profileForm"),
  profileSaveSubmit: document.querySelector("#profileSaveSubmit"),
  publicProfileCardMount: document.querySelector("#publicProfileCardMount"),
  likesDetailDialog: document.querySelector("#likesDetailDialog"),
  likesDetailContent: document.querySelector("#likesDetailContent"),
  profileName: document.querySelector("#profileName"),
  profileSchool: document.querySelector("#profileSchool"),
  profileUniversity: document.querySelector("#profileUniversity"),
  profileAge: document.querySelector("#profileAge"),
  profileGender: document.querySelector("#profileGender"),
  profileFaculty: document.querySelector("#profileFaculty"),
  profileYear: document.querySelector("#profileYear"),
  profileYearGroup: document.querySelector("#profileYearGroup"),
  profileHometown: document.querySelector("#profileHometown"),
  profileInterests: document.querySelector("#profileInterests"),
  customHobbyInput: document.querySelector("#customHobbyInput"),
  addCustomHobbyButton: document.querySelector("#addCustomHobbyButton"),
  customPersonalityInput: document.querySelector("#customPersonalityInput"),
  addCustomPersonalityButton: document.querySelector("#addCustomPersonalityButton"),
  profileLookingFor: document.querySelector("#profileLookingFor"),
  profileType: document.querySelector("#profileType"),
  profileIdealDate: document.querySelector("#profileIdealDate"),
  profileStatus: document.querySelector("#profileStatus"),
  profileLogoutButton: document.querySelector("#profileLogoutButton"),
  profilePhoto: document.querySelector("#profilePhoto"),
  profilePhotoPreview: document.querySelector("#profilePhotoPreview"),
  profilePreviewName: document.querySelector("#profilePreviewName"),
  profilePreviewMeta: document.querySelector("#profilePreviewMeta"),
  profilePreviewStatus: document.querySelector("#profilePreviewStatus"),
  profilePreviewTags: document.querySelector("#profilePreviewTags"),
  profileBio: document.querySelector("#profileForm textarea[name='bio']"),
  candidateCard: document.querySelector("#candidateCard"),
  candidateActions: document.querySelector("#candidateActions"),
  matchGrid: document.querySelector("#matchGrid"),
  receivedLikeGrid: document.querySelector("#receivedLikeGrid"),
  matchCount: document.querySelector("#matchCount"),
  chatCount: document.querySelector("#chatCount"),
  unreadRepliesButton: document.querySelector("#unreadRepliesButton"),
  unreadRepliesCount: document.querySelector("#unreadRepliesCount"),
  messagesView: document.querySelector("#messages"),
  conversationList: document.querySelector("#conversationList"),
  pendingChatList: document.querySelector("#pendingChatList"),
  chatBackButton: document.querySelector("#chatBackButton"),
  chatHeader: document.querySelector("#chatHeader"),
  chatLog: document.querySelector("#chatLog"),
  messageForm: document.querySelector("#messageForm"),
  messageInput: document.querySelector("#messageInput"),
  toast: document.querySelector("#toast"),
  profileBackButton: document.querySelector(".profile-back-button"),
  verificationForm: document.querySelector("#verificationForm"),
  studentIdFile: document.querySelector("#studentIdFile"),
  studentNumber: document.querySelector("#studentNumber"),
  verificationSchool: document.querySelector("#verificationSchool"),
  verificationStatusBadge: document.querySelector("#verificationStatusBadge"),
  verificationStatusCard: document.querySelector("#verificationStatusCard"),
  verificationStatusTitle: document.querySelector("#verificationStatusTitle"),
  verificationStatusText: document.querySelector("#verificationStatusText"),
  premiumStatusBadge: document.querySelector("#premiumStatusBadge"),
  purchasePlanButton: document.querySelector("#purchasePlanButton"),
  cancelPlanButton: document.querySelector("#cancelPlanButton"),
  purchaseHistory: document.querySelector("#purchaseHistory"),
  purchaseCount: document.querySelector("#purchaseCount"),
  notificationToggle: document.querySelector("#notificationToggle"),
  helpButton: document.querySelector("#helpButton"),
  helpDialog: document.querySelector("#helpDialog"),
  settingsTermsButton: document.querySelector("#settingsTermsButton"),
  settingsPrivacyButton: document.querySelector("#settingsPrivacyButton"),
  reportProblemButton: document.querySelector("#reportProblemButton"),
  problemDialog: document.querySelector("#problemDialog"),
  submitProblemButton: document.querySelector("#submitProblemButton"),
  problemNote: document.querySelector("#problemNote"),
  settingsLogoutButton: document.querySelector("#settingsLogoutButton"),
  settingsDeleteButton: document.querySelector("#settingsDeleteButton"),
  logoutConfirmDialog: document.querySelector("#logoutConfirmDialog"),
  confirmLogoutButton: document.querySelector("#confirmLogoutButton"),
  deleteConfirmDialog: document.querySelector("#deleteConfirmDialog"),
  confirmDeleteButton: document.querySelector("#confirmDeleteButton"),
  deleteConfirmDialog2: document.querySelector("#deleteConfirmDialog2"),
  confirmDeleteButton2: document.querySelector("#confirmDeleteButton2"),
  matchOverlay: document.querySelector("#matchOverlay"),
  matchCandidateAvatar: document.querySelector("#matchCandidateAvatar"),
  matchOverlayText: document.querySelector("#matchOverlayText"),
  matchSkipButton: document.querySelector("#matchSkipButton"),
  matchMessageButton: document.querySelector("#matchMessageButton"),
  moderationList: document.querySelector("#moderationList"),
  settingsContainer: document.querySelector("#settings"),
  loginEmail: document.querySelector("#loginEmail"),
  loginPassword: document.querySelector("#loginPassword"),
  signupEmail: document.querySelector("#signupEmail"),
  signupPassword: document.querySelector("#signupPassword"),
  signupCode: document.querySelector("#signupCode"),
  signupName: document.querySelector("#signupName"),
  signupGender: document.querySelector("#signupGender"),
  signupGenderPicker: document.querySelector("#signupGenderPicker"),
  signupGrade: document.querySelector("#signupGrade"),
  signupAge: document.querySelector("#signupAge"),
  signupAgeDial: document.querySelector("#signupAgeDial"),
  signupSchool: document.querySelector("#signupSchool"),
  signupFaculty: document.querySelector("#signupFaculty"),
  signupInterests: document.querySelector("#signupInterests"),
  signupLookingFor: document.querySelector("#signupLookingFor"),
  signupLookingForPicker: document.querySelector("#signupLookingForPicker"),
  signupType: document.querySelector("#signupType"),
  signupNextButtons: [...document.querySelectorAll(".signup-next")],
  signupSkipButtons: [...document.querySelectorAll(".signup-skip-step")]
};

const state = {
  currentIndex: 0,
  activeChat: null,
  profilePhotosData: [],
  publicProfile: null,
  publicPhotoIndex: 0,
  candidatePhotoIndexes: {},
  activePhotoSlot: null,
  suppressCandidateClick: false,
  activeCandidateForReport: null,
  matchedCandidateForOverlay: null,
  currentUser: null,
  ...loadPersistedState(),
  matches: [],
  likes: [],
  reports: [],
  blockedUsers: []
};

const shownMatchIds = new Set();
let allMessagesSubscription = null;

function showToast(message) {
  if (!refs.toast) return;
  refs.toast.textContent = message;
  refs.toast.classList.add("visible");
  window.setTimeout(() => refs.toast.classList.remove("visible"), 1800);
}

function showBrowserNotification(title, options = {}) {
  if (state.appSettings?.notifications === false) return;
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    new Notification(title, options);
  } catch (error) {
    console.warn("Browser notification failed:", error);
  }
}

function syncViewportSize() {
  const viewport = window.visualViewport;
  const height = viewport?.height || window.innerHeight;
  const top = viewport?.offsetTop || 0;
  document.documentElement.style.setProperty("--chat-viewport-height", `${height}px`);
  document.documentElement.style.setProperty("--chat-viewport-top", `${top}px`);
}

function switchView(viewId) {
  if (!document.querySelector(`#${viewId}`)) return;
  activateTab(viewId);
  if (viewId !== routes.messages) chatScreen.closeChatDetail();
}

function showDiscoverFallback(message) {
  if (!refs.candidateCard) return;
  refs.candidateCard.innerHTML = `
      <div class="candidate-body">
        <h2>探す画面の表示でエラーが発生しました</h2>
      <p>${escapeHtml(message)}</p>
      </div>
  `;
  if (refs.candidateActions) {
    refs.candidateActions.hidden = true;
  }
}

function forceShowDiscoverShell() {
  refs.authScreen?.classList.add("hidden");
  refs.authScreen?.style.setProperty("display", "none");
  refs.appShell?.classList.remove("app-locked");
  refs.appShell?.style.removeProperty("display");

  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("active-view", view.id === routes.discover);
  });
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.view === routes.discover);
  });

  if (refs.candidateCard && !refs.candidateCard.innerHTML.trim()) {
    refs.candidateCard.innerHTML = `
      <div class="candidate-body">
        <h2>探す画面を読み込み中です</h2>
        <p>プロフィールカードを準備しています。</p>
      </div>
    `;
  }
  if (refs.candidateActions) {
    refs.candidateActions.hidden = false;
  }
}

const profileScreen = createProfileScreen({ refs, state, showToast });
const messageHook = useMessages(state);
const chatScreen = createChatScreen({
  refs,
  state,
  messageHook,
  renderConversations: () => messagesScreen.renderConversations(),
  syncViewportSize,
  openPublicProfile: profileScreen.openPublicProfile
});
const messagesScreen = createMessagesScreen({ refs, state, helpers: { gradeLabel }, messageHook, chatScreen, showToast });
const likesScreen = createLikesScreen({
  refs,
  state,
  helpers: { gradeLabel },
  showToast,
  onMatchFound: (match) => handleMatchFound(match)
});
const discoverScreen = createDiscoverScreen({
  refs,
  state,
  helpers: { gradeLabel },
  showToast,
  switchView,
  openChat: chatScreen.openChat,
  showDiscoverFallback,
  onMatchFound: (match) => handleMatchFound(match)
});
const settingsScreen = createSettingsScreen({
  refs,
  state,
  showToast,
  switchView,
  logout: () => logoutFromParentSession(),
  deleteAccount: () => deleteCurrentAccount()
});

const authScreen = createAuthScreen({ refs });
createEditProfileScreen({ refs, state, profileScreen, switchView, showToast });

function normalizeProfileList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function hasSupabaseConfig() {
  try {
    const config = JSON.parse(localStorage.getItem("townSupabaseConfig") || "null");
    return Boolean(config?.url && config?.anonKey);
  } catch {
    return false;
  }
}

function ageFromBirthdate(birthdate) {
  const date = new Date(birthdate);
  if (Number.isNaN(date.getTime())) return "";
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const birthdayPassed = today.getMonth() > date.getMonth()
    || (today.getMonth() === date.getMonth() && today.getDate() >= date.getDate());
  if (!birthdayPassed) age -= 1;
  return age >= 0 ? String(age) : "";
}

function profileToCurrentUser(profile, session, photoItems = []) {
  const hobbies = normalizeProfileList(profile.hobbies);
  const personality = normalizeProfileList(profile.personality);
  const photos = photoItems.map((item) => item.url).filter(Boolean);
  return {
    name: profile.nickname || "",
    email: session?.user?.email || "",
    password: "",
    school: profile.university || "",
    university: profile.university || "",
    gender: profile.gender || "other",
    grade: profile.grade == null ? "" : String(profile.grade),
    year: profileYearValue(profile.grade),
    age: ageFromBirthdate(profile.birthdate),
    faculty: profile.department || "",
    department: profile.department || "",
    interests: hobbies,
    hobbies,
    personality,
    lookingFor: normalizeProfileList(profile.looking_for).join(", "),
    hometown: profile.hometown || "",
    type: profile.profile_type || "",
    idealDate: profile.ideal_date || "",
    photo: photos[0] || "",
    photos,
    photoItems,
    bio: profile.bio || "",
    userId: profile.user_id || session?.user?.id || ""
  };
}

function showGlobalMatchOverlay(match) {
  if (!refs.matchOverlay || !refs.matchCandidateAvatar || !refs.matchOverlayText) return;

  state.matchedCandidateForOverlay = match;
  const photos = personPhotos(match);
  const name = escapeHtml(match.name);
  const initial = escapeHtml(String(match.name || "").slice(0, 1));
  refs.matchCandidateAvatar.innerHTML = photos.length
    ? `<img src="${escapeHtml(photos[0])}" alt="${name}のプロフィール画像" />`
    : `<span>${initial}</span>`;
  refs.matchOverlayText.textContent = renderMatchModalText(match.name);
  refs.matchOverlay.hidden = false;
  requestAnimationFrame(() => refs.matchOverlay.classList.add("visible"));
}

function handleMatchFound(match, { showOverlay = false } = {}) {
  if (!match?.matchId) return;

  const alreadyShown = shownMatchIds.has(match.matchId);
  shownMatchIds.add(match.matchId);
  const activeChatMatchId = state.activeChatMatchId || state.matches[state.activeChat]?.matchId || null;

  const existingIndex = state.matches.findIndex((item) => item.matchId === match.matchId);
  if (existingIndex >= 0) {
    state.matches[existingIndex] = { ...state.matches[existingIndex], ...match };
  } else {
    state.matches.unshift(match);
  }
  state.receivedLikes = (state.receivedLikes || []).filter((item) => item.userId !== match.userId);

  if (activeChatMatchId) {
    const activeIndex = state.matches.findIndex((item) => item.matchId === activeChatMatchId);
    if (activeIndex >= 0) state.activeChat = activeIndex;
  }

  if (document.querySelector(`#${routes.matches}`)?.classList.contains("active-view")) {
    likesScreen.render();
  }
  messagesScreen.renderConversations();
  if (showOverlay && !alreadyShown) {
    showGlobalMatchOverlay(match);
    showBrowserNotification("新しいマッチが成立しました", {
      body: `${match.name || "相手"}さんとマッチしました。`,
      tag: `town-match-${match.matchId}`
    });
  }
}

function appendUniqueMessage(match, message) {
  if (!match || !message) return false;
  if (!Array.isArray(match.messages)) match.messages = [];
  if (message.id && match.messages.some((item) => item.id === message.id)) return false;
  match.messages.push(message);
  match.latestMessage = message;
  return true;
}

async function handleGlobalMessage(message) {
  if (!message?.matchId) return;
  if (state.activeChatMatchId === message.matchId) return;

  let match = state.matches.find((item) => item.matchId === message.matchId);
  if (!match) {
    await refreshMatches();
    match = state.matches.find((item) => item.matchId === message.matchId);
  }
  if (!match || !appendUniqueMessage(match, message)) return;

  messagesScreen.renderConversations();
  showBrowserNotification("新しいメッセージが届きました", {
    body: `${match.name || "相手"}さんからメッセージが届きました。`,
    tag: `town-message-${message.matchId}`
  });
}

async function refreshMatches() {
  try {
    state.matches = await fetchMatches();
    state.matches.forEach((match) => {
      if (match.matchId) shownMatchIds.add(match.matchId);
    });
    messagesScreen.renderConversations();
  } catch (error) {
    console.error("matches fetch error", error);
    showToast("マッチ一覧を読み込めませんでした");
  }
}

function setupMatchRealtime() {
  subscribeToMatches((match) => {
    handleMatchFound(match, { showOverlay: true });
  }).catch((error) => {
    console.error("match realtime setup error", error);
  });
}

function setupMessageRealtime() {
  allMessagesSubscription?.unsubscribe?.();
  subscribeToAllMessages((message) => {
    handleGlobalMessage(message).catch((error) => {
      console.error("message realtime handle error", error);
    });
  }).then((subscription) => {
    allMessagesSubscription = subscription;
  }).catch((error) => {
    console.error("message realtime setup error", error);
  });
}

function teardownMessageRealtime() {
  allMessagesSubscription?.unsubscribe?.();
  allMessagesSubscription = null;
}

function teardownRealtime() {
  teardownMessageRealtime();
  unsubscribeFromMatches();
}

function showAuthNotice(message) {
  authScreen.showAuth();
  refs.signupForm?.classList.remove("active-auth-form");
  refs.signupForm?.setAttribute("hidden", "hidden");
  refs.loginForm?.classList.add("active-auth-form");
  refs.loginForm?.querySelectorAll("label, button, .demo-login-note, .auth-scope-note").forEach((node) => {
    node.setAttribute("hidden", "hidden");
  });

  const heading = refs.loginForm?.querySelector(".auth-form-heading");
  if (!heading) return;
  const title = heading.querySelector("h2");
  const copy = heading.querySelector("p");
  if (title) title.textContent = "ログインが必要です";
  if (copy) copy.textContent = message;
}

refs.loginForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  event.stopImmediatePropagation();
}, { capture: true });
refs.signupForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  event.stopImmediatePropagation();
}, { capture: true });

function showApp(user) {
  state.currentUser = user;
  forceShowDiscoverShell();
  authScreen.hideAuth();
  switchView(routes.discover);

  const tasks = [
    ["profile", () => profileScreen.applyCurrentUser(user)],
    [
      "discover",
      () => {
        state.currentIndex = 0;
        discoverScreen.renderCandidate();
        discoverScreen.renderModeration();
      }
    ],
    ["likes", () => likesScreen.render()],
    ["messages", () => messagesScreen.renderConversations()],
    ["verification", () => settingsScreen.renderVerification()],
    ["premium", () => settingsScreen.renderPremium()],
    ["settings", () => settingsScreen.renderSettings()]
  ];

  let discoverFailed = false;
  for (const [label, task] of tasks) {
    try {
      task();
    } catch (error) {
      console.error(`render error: ${label}`, error);
      if (label === "discover") {
        discoverFailed = true;
        showDiscoverFallback("再読み込みしても直らない場合は、この画面名を教えてください。");
      }
    }
  }

  if (discoverFailed) {
    showToast("探す画面の描画でエラーが発生しました");
  }

  refreshMatches();
  setupMatchRealtime();
  setupMessageRealtime();

  if (isPaywalled(user)) {
    switchView(routes.premium);
    showToast("男性会員のご利用にはサブスク登録が必要です");
  }
}

// 課金ゲートは現在無効化する。
function isPaywalled(user) {
  return false;
}

async function deleteCurrentAccount() {
  try {
    teardownRealtime();
    await deleteMyPublicAccountData();
    clearCurrentUser();
    Object.keys(localStorage)
      .filter((key) => key.startsWith("town"))
      .forEach((key) => localStorage.removeItem(key));
    window.top.location.replace("/");
  } catch (error) {
    console.error(error);
    showToast(error.message || "アカウント削除に失敗しました");
  }
}

async function logoutFromParentSession() {
  teardownRealtime();
  clearCurrentUser();
  try {
    await getClient()?.auth.signOut();
  } catch (error) {
    console.warn("Supabase sign out failed:", error);
  }
  Object.keys(localStorage)
    .filter((key) => key.startsWith("town"))
    .forEach((key) => localStorage.removeItem(key));
  chatScreen.closeChatDetail();
  window.top.location.replace("/");
}

refs.logoutButton?.addEventListener("click", () => refs.logoutConfirmDialog?.showModal());
refs.profileLogoutButton?.addEventListener("click", () => refs.logoutConfirmDialog?.showModal());
refs.privacyButton?.addEventListener("click", () => window.parent.location.assign("/legal/privacy"));
refs.termsButton?.addEventListener("click", () => window.parent.location.assign("/legal/terms"));
refs.deleteAccountButton?.addEventListener("click", () => refs.deleteConfirmDialog?.showModal());
refs.confirmDeleteButton?.addEventListener("click", () => {
  refs.deleteConfirmDialog?.close();
  refs.deleteConfirmDialog2?.showModal();
});
refs.confirmDeleteButton2?.addEventListener("click", () => {
  refs.deleteConfirmDialog2?.close();
  deleteCurrentAccount();
});

document.querySelector(".nav-tabs")?.addEventListener("click", (event) => {
  const button = event.target.closest(".nav-tab");
  if (!button) return;
  const target = button.dataset.view;
  if (isPaywalled(state.currentUser) && target !== routes.premium && target !== routes.settings) {
    switchView(routes.premium);
    showToast("男性会員のご利用にはサブスク登録が必要です");
    return;
  }
  switchView(target);
  if (target === routes.matches) {
    state.receivedLikesLoaded = false;
    likesScreen.render();
  }
  if (target === routes.messages) {
    refreshMatches();
  }
});

syncViewportSize();
window.addEventListener("resize", syncViewportSize);
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", syncViewportSize);
  window.visualViewport.addEventListener("scroll", syncViewportSize);
}
refs.messageInput?.addEventListener("focus", () => {
  syncViewportSize();
  window.setTimeout(syncViewportSize, 80);
});

async function initApp() {
  try {
    const session = await getSession();
    if (session) {
      const profile = await getMyProfile();
      if (profile) {
        const photoItems = await fetchMyPhotoItems();
        showApp(profileToCurrentUser(profile, session, photoItems));
      } else {
        showAuthNotice("親アプリでプロフィールを作成してください。");
      }
      return;
    }

    const savedUser = getCurrentUser();
    if (!hasSupabaseConfig() && savedUser?.userId) {
      showApp(savedUser);
    } else {
      clearCurrentUser();
      showAuthNotice("親アプリにログインしてからCampus Matchを開いてください。");
    }
  } catch (error) {
    console.error(error);
    refs.authScreen?.classList.remove("hidden");
    refs.appShell?.classList.add("app-locked");
    showToast("初期化でエラーが発生しました");
  }
}

initApp();
