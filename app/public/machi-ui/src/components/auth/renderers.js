export function readEmailInput(input) {
  return input.value.trim().toLowerCase();
}

export function readPasswordInput(input) {
  return input.value;
}

export function authButtonLabel(mode) {
  return mode === "register" ? "登録して始める" : "ログインする";
}

export function loginFormState() {
  return true;
}

export function registerFormState() {
  return true;
}
