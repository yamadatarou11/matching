import { renderAppLayout } from "./app/renderAppLayout.js";

renderAppLayout();
registerServiceWorker();

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((registration) => {
        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;

          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              showToast("更新を反映しました。次回起動時に新しい内容で開きます。");
              worker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });
      })
      .catch((error) => {
        console.warn("Service worker registration failed:", error);
      });
  });

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    showToast("アプリを更新しました。");
  });
}

window.addEventListener("offline", () => {
  showToast("オフラインです。保存済みの画面を表示しています。");
});

window.addEventListener("online", () => {
  showToast("オンラインに戻りました。");
});

function showToast(message) {
  const toast = document.querySelector("#toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("visible"), 2200);
}

function setNotice(message) {
  let notice = document.querySelector("#bootErrorNotice");
  if (!notice) {
    notice = document.createElement("p");
    notice.id = "bootErrorNotice";
    notice.className = "legal-note";
    document.querySelector(".auth-card")?.appendChild(notice);
  }
  notice.textContent = message;
}

import("./main.js").catch((error) => {
  console.error(error);
  document.querySelector("#authScreen")?.classList.remove("hidden");
  document.querySelector("#appShell")?.classList.add("app-locked");
  setNotice("アプリの読み込みに失敗しました。再読み込みしてください。");
});
