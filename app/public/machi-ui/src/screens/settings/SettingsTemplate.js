export function renderSettingsTemplate() {
  return `
    <section id="verification" class="view" hidden>
      <div class="section-heading">
        <h2>本人確認</h2>
        <span id="verificationStatusBadge">未提出</span>
      </div>
      <div class="mvp-panel">
        <div class="mvp-status-card" id="verificationStatusCard">
          <span class="mvp-status-icon">✓</span>
          <div>
            <strong id="verificationStatusTitle">本人確認を提出してください</strong>
            <p id="verificationStatusText">メール認証に加えて、エリア確認を行うための簡易フォームです。</p>
          </div>
        </div>
        <form id="verificationForm" class="mvp-form">
          <label>確認画像<input id="studentIdFile" type="file" accept="image/*" /></label>
          <label>確認番号<input id="studentNumber" type="text" placeholder="例: T1234" /></label>
          <label>エリア<input id="verificationSchool" type="text" placeholder="例: 中央通り" /></label>
          <button type="submit">確認を提出する</button>
        </form>
        <div class="mvp-checklist">
          <strong>提出時のチェック</strong>
          <label><input type="checkbox" checked disabled /> 画像を添付</label>
          <label><input type="checkbox" checked disabled /> エリア入力</label>
          <label><input type="checkbox" checked disabled /> 18歳以上</label>
          <label><input type="checkbox" checked disabled /> 登録メールと同一ユーザー</label>
        </div>
      </div>
    </section>
    <section id="premium" class="view" hidden>
      <div class="section-heading">
        <h2>プレミアム</h2>
        <span id="premiumStatusBadge">未加入</span>
      </div>
      <div class="plan-card">
        <div>
          <span class="plan-kicker">Town Support</span>
          <h3>月額 500円</h3>
          <p>追加機能は現在準備中です。</p>
        </div>
        <ul class="plan-list">
          <li>いいね履歴</li>
          <li>メッセージ</li>
          <li>イベントの追加表示</li>
          <li>加入・解約の確認</li>
        </ul>
        <button id="purchasePlanButton" type="button" hidden>購入する</button>
      </div>
      <div class="mvp-panel compact-panel">
        <div class="section-heading compact-heading">
          <h2>購入履歴</h2>
          <span id="purchaseCount">0件</span>
        </div>
        <div id="purchaseHistory" class="history-list"></div>
        <button class="ghost-button" id="cancelPlanButton" type="button" hidden>解約する</button>
      </div>
    </section>
    <section id="settings" class="view">
      <div class="section-heading">
        <h2>設定・ヘルプ</h2>
      </div>
      <div class="settings-group">
        <div class="settings-item">
          <div><strong>通知設定</strong><p>いいね、メッセージ、更新通知を切り替えます。</p></div>
          <label class="switch"><input id="notificationToggle" type="checkbox" checked /><span></span></label>
        </div>
        <button class="settings-row" type="button" data-open-view="safety">
          <div><strong>セーフティセンター</strong><p>通報・ブロック、ガイドライン、本人確認の仕組み。</p></div>
          <span class="settings-chevron" aria-hidden="true">›</span>
        </button>
        <button class="settings-row" id="helpButton" type="button">
          <div><strong>ヘルプ・FAQ</strong><p>使い方、本人確認、プレミアム、通報について確認できます。</p></div>
          <span class="settings-chevron" aria-hidden="true">›</span>
        </button>
        <button class="settings-row" id="reportProblemButton" type="button">
          <div><strong>問題を報告</strong><p>不具合やご意見を運営チームに送信します。</p></div>
          <span class="settings-chevron" aria-hidden="true">›</span>
        </button>
        <button class="settings-row" id="settingsTermsButton" type="button">
          <div><strong>利用規約</strong><p>サービス利用時のルールを確認します。</p></div>
          <span class="settings-chevron" aria-hidden="true">›</span>
        </button>
        <button class="settings-row" id="settingsPrivacyButton" type="button">
          <div><strong>プライバシーポリシー</strong><p>個人情報の取り扱いについて確認します。</p></div>
          <span class="settings-chevron" aria-hidden="true">›</span>
        </button>
      </div>
      <div class="settings-group">
        <button class="settings-row" id="settingsLogoutButton" type="button">
          <div><strong>ログアウト</strong></div>
          <span class="settings-chevron" aria-hidden="true">›</span>
        </button>
        <button class="settings-row settings-row-danger" id="settingsDeleteButton" type="button" hidden>
          <div><strong>アカウントを削除</strong></div>
          <span class="settings-chevron" aria-hidden="true">›</span>
        </button>
      </div>
    </section>
    <section id="safety" class="view">
      <div class="detail-header">
        <button class="icon-back" type="button" data-back-view="settings" aria-label="設定に戻る">←</button>
        <h2>セーフティセンター</h2>
      </div>

      <div class="safety-hero">
        <div class="safety-hero-title">あなたの安全を守ります</div>
        <p>富山の大学生コミュニティを安心して利用できるよう、各種サポートを提供しています。</p>
      </div>

      <div class="safety-menu">
        <button class="safety-menu-item" type="button" data-open-view="safetyBlocking">
          <div>
            <strong>通報・ブロック機能</strong>
            <p>不快なユーザーへの対処方法</p>
          </div>
          <span class="settings-chevron" aria-hidden="true">›</span>
        </button>
        <button class="safety-menu-item" type="button" data-open-view="safetyGuidelines">
          <div>
            <strong>コミュニティガイドライン</strong>
            <p>安全なコミュニティのルール</p>
          </div>
          <span class="settings-chevron" aria-hidden="true">›</span>
        </button>
        <button class="safety-menu-item" type="button" data-open-view="safetyStudentId">
          <div>
            <strong>学生証チェックについて</strong>
            <p>運営による在籍確認の仕組み</p>
          </div>
          <span class="settings-chevron" aria-hidden="true">›</span>
        </button>
        <button class="safety-menu-item" type="button" data-open-view="safetyEmail">
          <div>
            <strong>メールアドレス確認について</strong>
            <p>運営による公式メール認証の仕組み</p>
          </div>
          <span class="settings-chevron" aria-hidden="true">›</span>
        </button>
      </div>

      <p class="safety-footnote">問題や懸念がある場合は、設定の「問題を報告」からもご連絡いただけます。</p>
    </section>

    <section id="safetyBlocking" class="view">
      <div class="detail-header">
        <button class="icon-back" type="button" data-back-view="safety" aria-label="戻る">←</button>
        <h2>通報・ブロック機能</h2>
      </div>
      <p class="detail-lead">不快なユーザーや問題のあるコンテンツに対して、通報・ブロック機能を使ってコミュニティを守りましょう。</p>

      <article class="info-card">
        <div class="info-card-title">ユーザーを通報する</div>
        <ol class="step-list">
          <li><span class="step-num">1</span>通報したいユーザーのプロフィール、または投稿を開く</li>
          <li><span class="step-num">2</span>右上の「⋮」メニューをタップ</li>
          <li><span class="step-num">3</span>「報告する」を選択し、理由を選んで送信</li>
        </ol>
        <div class="note-box">通報内容は匿名で処理されます。運営が内容を確認し、24時間以内に対応します。悪質なケースはアカウント停止となります。</div>
      </article>

      <article class="info-card">
        <div class="info-card-title">ユーザーをブロックする</div>
        <ol class="step-list">
          <li><span class="step-num">1</span>ブロックしたいユーザーのプロフィールを開く</li>
          <li><span class="step-num">2</span>右上の「⋮」メニューから「ブロック」を選択</li>
          <li><span class="step-num">3</span>確認ダイアログで「ブロック」をタップ</li>
        </ol>
        <div class="note-box">ブロックすると、相手にはあなたのプロフィールや投稿が表示されなくなります。相手にはブロックされたことは通知されません。</div>
      </article>

      <article class="info-card">
        <div class="info-card-title">メッセージをブロックする</div>
        <ol class="step-list">
          <li><span class="step-num">1</span>ブロックしたい相手とのトーク画面を開く</li>
          <li><span class="step-num">2</span>右上のメニューから「このユーザーをブロック」を選択</li>
          <li><span class="step-num">3</span>確認ダイアログで「ブロック」をタップ</li>
        </ol>
        <div class="note-box">メッセージブロック後、相手からのメッセージは届かなくなります。既存のメッセージ履歴はあなたにのみ表示されます。</div>
      </article>
    </section>

    <section id="safetyGuidelines" class="view">
      <div class="detail-header">
        <button class="icon-back" type="button" data-back-view="safety" aria-label="戻る">←</button>
        <h2>コミュニティガイドライン</h2>
      </div>
      <p class="detail-lead">富山の大学生コミュニティを安全で快適な場所に保つため、以下のガイドラインを遵守してください。</p>

      <article class="rule-card">
        <div class="rule-card-title"><span class="rule-badge">1</span> 相互尊重</div>
        <p>他のユーザーを尊重し、差別的・侮辱的な発言はしないようにしましょう。</p>
      </article>
      <article class="rule-card">
        <div class="rule-card-title"><span class="rule-badge">2</span> 個人情報の保護</div>
        <p>自分や他人の住所・電話番号・学籍番号などの個人情報を無断で共有しないでください。</p>
      </article>
      <article class="rule-card">
        <div class="rule-card-title"><span class="rule-badge">3</span> ハラスメントの禁止</div>
        <p>ストーキング、付きまとい、脅迫行為は厳しく禁止されています。違反が確認された場合はアカウントを停止します。</p>
      </article>
      <article class="rule-card">
        <div class="rule-card-title"><span class="rule-badge">4</span> 不適切なコンテンツの禁止</div>
        <p>暴力的・性的・違法なコンテンツの投稿・共有は禁止です。</p>
      </article>
      <article class="rule-card">
        <div class="rule-card-title"><span class="rule-badge">5</span> なりすましの禁止</div>
        <p>他のユーザーや著名人、大学関係者になりすます行為は禁止です。</p>
      </article>
      <article class="rule-card">
        <div class="rule-card-title"><span class="rule-badge">6</span> 商業目的の禁止</div>
        <p>許可なく商業的な宣伝や勧誘を行うことは禁止されています。</p>
      </article>

      <div class="callout callout-amber">
        ガイドライン違反を見つけた場合は、「問題を報告」機能からご報告ください。運営チームが確認し、適切に対応いたします。
      </div>
    </section>

    <section id="safetyStudentId" class="view">
      <div class="detail-header">
        <button class="icon-back" type="button" data-back-view="safety" aria-label="戻る">←</button>
        <h2>学生証チェックについて</h2>
      </div>

      <div class="callout callout-blue">
        <div class="callout-title">在籍確認のための学生証審査</div>
        このアプリは富山の大学・短期大学・専門学校に在籍する学生のみが利用できます。なりすましや不正利用を防ぐため、運営が学生証を確認します。
      </div>

      <article class="info-card">
        <h3>確認の流れ</h3>
        <ol class="step-list">
          <li><span class="step-num">1</span>学生証（氏名・大学名・有効期限が確認できるもの）を準備する</li>
          <li><span class="step-num">2</span>アカウント登録画面で学生証の写真をアップロードする</li>
          <li><span class="step-num">3</span>運営スタッフが内容を確認（1〜2営業日）</li>
          <li><span class="step-num">4</span>審査通過後、アカウントが有効化されメール通知が届く</li>
        </ol>
      </article>

      <h3 class="detail-section-title">よくある質問</h3>
      <article class="qa-card">
        <p class="q">Q. なぜ学生証チェックが必要ですか？</p>
        <p class="a">A. 本アプリは富山の大学生のみが利用できるコミュニティです。在学中の学生であることを確認し、安全で信頼性の高い環境を維持するために学生証の確認を行っています。</p>
      </article>
      <article class="qa-card">
        <p class="q">Q. どのように確認が行われますか？</p>
        <p class="a">A. 登録時またはアカウント認証の際に、学生証の写真をアップロードしていただきます。運営スタッフが手動で確認し、通常1〜2営業日以内に審査結果をお知らせします。</p>
      </article>
      <article class="qa-card">
        <p class="q">Q. 学生証の情報はどう扱われますか？</p>
        <p class="a">A. 提出された学生証の画像は在籍確認のみに使用されます。確認完了後は速やかに削除され、第三者への提供は一切行いません。</p>
      </article>
      <article class="qa-card">
        <p class="q">Q. 卒業・退学した場合はどうなりますか？</p>
        <p class="a">A. 在籍状況に変更があった場合は、速やかに運営までご連絡ください。確認の結果、在籍が認められない場合はアカウントが停止されます。</p>
      </article>
    </section>

    <section id="safetyEmail" class="view">
      <div class="detail-header">
        <button class="icon-back" type="button" data-back-view="safety" aria-label="戻る">←</button>
        <h2>メールアドレス確認について</h2>
      </div>

      <div class="callout callout-green">
        <div class="callout-title">大学公式メールで本人確認</div>
        運営は大学から発行された公式メールアドレスへ確認メールを送信し、リンクをクリックすることで認証を完了します。フリーメールは使用できません。
      </div>

      <article class="info-card">
        <h3>確認の流れ</h3>
        <ol class="step-list">
          <li><span class="step-num">1</span>登録時に大学公式メールアドレスを入力する</li>
          <li><span class="step-num">2</span>運営から確認メールが送信される（数分以内）</li>
          <li><span class="step-num">3</span>メール内の「確認する」リンクをタップ</li>
          <li><span class="step-num">4</span>メールアドレスの確認完了・アカウント登録が進む</li>
        </ol>
      </article>

      <article class="info-card">
        <h3>利用可能なメールドメイン例</h3>
        <div class="domain-row"><span>富山大学</span><span class="domain-tag">@st.u-toyama.ac.jp</span></div>
        <div class="domain-row"><span>富山県立大学</span><span class="domain-tag">@pu-toyama.ac.jp</span></div>
        <div class="domain-row"><span>富山短期大学</span><span class="domain-tag">@toyama-c.ac.jp</span></div>
        <div class="domain-row"><span>その他 ac.jp ドメイン</span><span class="domain-tag">@＿＿＿.ac.jp</span></div>
      </article>

      <h3 class="detail-section-title">よくある質問</h3>
      <article class="qa-card">
        <p class="q">Q. なぜメールアドレスの確認が必要ですか？</p>
        <p class="a">A. 大学の公式メールアドレス（ac.jpドメイン）を確認することで、実際に在籍している学生であることを二重に保証します。また、パスワードリセットや重要なお知らせの受信にも使用します。</p>
      </article>
      <article class="qa-card">
        <p class="q">Q. どのメールアドレスを使えばいいですか？</p>
        <p class="a">A. 大学から発行された公式メールアドレス（例：＿＿＿@st.u-toyama.ac.jp）をご使用ください。フリーメール（Gmail、Yahoo等）は使用できません。</p>
      </article>
      <article class="qa-card">
        <p class="q">Q. 確認メールが届かない場合は？</p>
        <p class="a">A. 迷惑メールフォルダを確認してください。それでも届かない場合は、「確認メールを再送信」ボタンから再送できます。それでも解決しない場合は運営にお問い合わせください。</p>
      </article>
      <article class="qa-card">
        <p class="q">Q. メールアドレスを変更したい場合は？</p>
        <p class="a">A. 設定画面の「アカウント情報」からメールアドレスの変更が可能です。変更後は再度確認メールが送信されます。</p>
      </article>
    </section>
  `;
}
