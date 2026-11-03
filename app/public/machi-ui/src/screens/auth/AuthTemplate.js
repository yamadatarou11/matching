export function renderAuthTemplate() {
  return `
    <section class="auth-screen hidden" id="authScreen" aria-label="ログイン" style="display: none">
      <div class="auth-card">
        <form class="auth-form active-auth-form" id="loginForm">
          <div class="auth-form-heading">
            <h2>ログインが必要です</h2>
            <p>親アプリでログインしてください。</p>
          </div>
          <label hidden>メールアドレス<input id="loginEmail" type="email" placeholder="name@u-toyama.ac.jp" autocomplete="email" /></label>
          <label hidden>パスワード<input id="loginPassword" type="password" autocomplete="current-password" /></label>
          <button type="submit" hidden>ログインする</button>
          <button class="ghost-button" id="startSignupButton" type="button" hidden>新規登録はこちら</button>
          <p class="auth-scope-note">Campus Matchは親アプリのログイン状態を使います。</p>
        </form>
        <form class="auth-form" id="signupForm" hidden></form>
      </div>
    </section>
  `;
}
