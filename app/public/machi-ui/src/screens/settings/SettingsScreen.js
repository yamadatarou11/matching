import { saveAppSettings } from "../../services/authService.js";
import { getMyVerification, submitMyVerification } from "../../services/userService.js";

export function createSettingsScreen({ refs, state, showToast, switchView, logout, deleteAccount }) {
  async function renderVerification() {
    document.querySelector("#verification")?.removeAttribute("hidden");
    try {
      const verification = await getMyVerification();
      const status = verification?.status || "unsubmitted";
      const labels = {
        unsubmitted: ["未提出", "本人確認を提出してください", "確認画像を送信すると、運営が内容を確認します。"],
        pending: ["審査中", "本人確認を審査中です", "提出済みです。運営の確認完了までお待ちください。"],
        approved: ["承認済み", "本人確認が完了しています", "チャットなどの本人確認対象機能を利用できます。"],
        rejected: ["否認", "本人確認が否認されました", verification?.reject_note || "内容を確認して再提出してください。"]
      };
      const [badge, title, text] = labels[status] || labels.unsubmitted;
      refs.verificationStatusBadge.textContent = badge;
      refs.verificationStatusTitle.textContent = title;
      refs.verificationStatusText.textContent = text;
      refs.verificationForm?.toggleAttribute("hidden", status === "pending" || status === "approved");
    } catch (error) {
      console.warn("Verification read failed:", error);
      refs.verificationStatusText.textContent = "本人確認状態を取得できませんでした。";
    }
  }

  function renderPremium() {
    document.querySelector("#premium")?.setAttribute("hidden", "hidden");
  }

  function renderSettings() {
    refs.notificationToggle.checked = state.appSettings.notifications !== false;
    refs.settingsDeleteButton?.removeAttribute("hidden");
  }

  refs.verificationForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await submitMyVerification(refs.studentIdFile?.files?.[0]);
      showToast("本人確認を提出しました");
      renderVerification();
    } catch (error) {
      console.error(error);
      showToast(error.message || "本人確認の提出に失敗しました");
    }
  });

  refs.purchasePlanButton?.addEventListener("click", () => {
    return;
  });

  refs.cancelPlanButton?.addEventListener("click", () => {
    return;
  });

  refs.notificationToggle?.addEventListener("change", async () => {
    if (refs.notificationToggle.checked && "Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      if (permission === "denied") {
        refs.notificationToggle.checked = false;
        showToast("ブラウザ通知が許可されていません");
      }
    }
    state.appSettings = { ...state.appSettings, notifications: refs.notificationToggle.checked };
    saveAppSettings(state.appSettings);
    showToast(refs.notificationToggle.checked ? "通知をオンにしました" : "通知をオフにしました");
  });

  document.addEventListener("click", (event) => {
    const openButton = event.target.closest("[data-open-view]");
    if (openButton) {
      switchView(openButton.dataset.openView);
      return;
    }
    const backButton = event.target.closest("[data-back-view]");
    if (backButton) {
      switchView(backButton.dataset.backView);
    }
  });

  refs.helpButton?.addEventListener("click", () => refs.helpDialog?.showModal());
  refs.reportProblemButton?.addEventListener("click", () => {
    if (refs.problemNote) refs.problemNote.value = "";
    refs.problemDialog?.showModal();
  });
  refs.submitProblemButton?.addEventListener("click", () => {
    if (!refs.problemNote?.value.trim()) {
      showToast("内容を入力してください");
      return;
    }
    refs.problemDialog?.close();
    showToast("問題報告を送信しました");
  });
  refs.settingsLogoutButton?.addEventListener("click", () => refs.logoutConfirmDialog?.showModal());
  refs.confirmLogoutButton?.addEventListener("click", () => {
    refs.logoutConfirmDialog?.close();
    logout();
  });
  refs.settingsDeleteButton?.addEventListener("click", () => refs.deleteConfirmDialog?.showModal());
  refs.settingsTermsButton?.addEventListener("click", () => window.parent.location.assign("/legal/terms"));
  refs.settingsPrivacyButton?.addEventListener("click", () => window.parent.location.assign("/legal/privacy"));

  return { renderVerification, renderPremium, renderSettings };
}
