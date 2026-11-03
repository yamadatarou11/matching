export function createAuthScreen({ refs }) {
  return {
    showAuth() {
      refs.authScreen.classList.add("hidden");
      refs.authScreen.style.setProperty("display", "none");
      refs.appShell.classList.add("app-locked");
      refs.signupForm?.classList.remove("active-auth-form");
      refs.signupForm?.setAttribute("hidden", "hidden");
      refs.startSignupButton?.setAttribute("hidden", "hidden");
    },
    hideAuth() {
      refs.authScreen.classList.add("hidden");
      refs.appShell.classList.remove("app-locked");
    }
  };
}
