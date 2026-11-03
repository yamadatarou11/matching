export function renderAppOverlaysTemplate() {
  return `
    <dialog class="report-dialog" id="reportDialog">
      <form method="dialog" class="report-card">
        <h2>通報・ブロック</h2>
        <p id="reportTarget">対象ユーザーを確認してください。</p>
        <label>理由
          <select id="reportReason">
            <option value="inappropriate">不適切なプロフィール</option>
            <option value="harassment">迷惑なメッセージ</option>
            <option value="fake_profile">なりすまし</option>
            <option value="solicitation">勧誘・営業</option>
            <option value="underage">年齢に関する問題</option>
            <option value="other">その他</option>
          </select>
        </label>
        <label>詳細<textarea id="reportNote" rows="3" placeholder="補足があれば入力"></textarea></label>
        <div class="report-actions">
          <button value="cancel" type="submit">閉じる</button>
          <button id="blockUserButton" value="block" type="button">ブロック</button>
          <button id="submitReportButton" value="report" type="button">通報する</button>
        </div>
      </form>
    </dialog>
    <dialog class="profile-preview-dialog" id="profilePreviewDialog">
      <form method="dialog" class="profile-preview-sheet profile-card-dialog">
        <button class="dialog-close-button" value="cancel" type="submit" aria-label="閉じる">×</button>
        <div id="publicProfileCardMount" class="public-profile-card-mount"></div>
      </form>
    </dialog>
    <dialog class="profile-preview-dialog likes-detail-dialog" id="likesDetailDialog">
      <div id="likesDetailContent"></div>
    </dialog>
    <dialog class="report-dialog" id="helpDialog">
      <form method="dialog" class="report-card">
        <h2>ヘルプ・FAQ</h2>
        <div class="faq-list">
          <strong>Q. 何で登録できますか？</strong><p>A. MVP ではメール認証を使った簡易登録です。</p>
          <strong>Q. 本人確認は必要ですか？</strong><p>A. エリア確認用のフォームから提出できます。</p>
          <strong>Q. プレミアムは使えますか？</strong><p>A. 現在は準備中です。</p>
          <strong>Q. 危険な相手を見つけたら？</strong><p>A. プロフィールから通報・ブロックできます。</p>
        </div>
        <div class="report-actions single-action"><button value="cancel" type="submit">閉じる</button></div>
      </form>
    </dialog>
    <dialog class="report-dialog" id="problemDialog">
      <form method="dialog" class="report-card">
        <h2>問題を報告</h2>
        <p>不具合や気になった点、ご意見を運営チームにお送りください。</p>
        <label>種類
          <select id="problemCategory">
            <option value="不具合">不具合・エラー</option>
            <option value="迷惑ユーザー">迷惑なユーザー</option>
            <option value="ご意見・要望">ご意見・要望</option>
            <option value="その他">その他</option>
          </select>
        </label>
        <label>内容<textarea id="problemNote" rows="4" placeholder="できるだけ詳しくご記入ください"></textarea></label>
        <div class="report-actions">
          <button value="cancel" type="submit">閉じる</button>
          <button id="submitProblemButton" value="send" type="button">送信する</button>
        </div>
      </form>
    </dialog>
    <dialog class="report-dialog" id="logoutConfirmDialog">
      <form method="dialog" class="report-card">
        <h2>ログアウトしますか？</h2>
        <p>ログアウトすると、再度ログインが必要になります。</p>
        <div class="report-actions">
          <button value="cancel" type="submit">キャンセル</button>
          <button id="confirmLogoutButton" value="logout" type="button">ログアウト</button>
        </div>
      </form>
    </dialog>
    <dialog class="report-dialog" id="deleteConfirmDialog">
      <form method="dialog" class="report-card">
        <h2>公開データを削除しますか？</h2>
        <p>プロフィール、写真、いいね、マッチ、チャットなどの公開データを削除してログアウトします。</p>
        <div class="report-actions">
          <button value="cancel" type="submit">キャンセル</button>
          <button id="confirmDeleteButton" class="danger-button" value="delete" type="button">削除する</button>
        </div>
      </form>
    </dialog>
    <dialog class="report-dialog" id="deleteConfirmDialog2">
      <form method="dialog" class="report-card">
        <h2>本当に削除しますか？</h2>
        <p>この操作は元に戻せません。Authユーザー自体の完全削除は運営側で別途行います。</p>
        <div class="report-actions">
          <button value="cancel" type="submit">やめる</button>
          <button id="confirmDeleteButton2" class="danger-button" value="delete" type="button">完全に削除する</button>
        </div>
      </form>
    </dialog>
    <div class="swipe-preview swipe-preview-like" aria-hidden="true">♥</div>
    <div class="swipe-preview swipe-preview-bad" aria-hidden="true">×</div>
    <div class="match-overlay" id="matchOverlay" hidden>
      <div class="match-overlay-card" role="dialog" aria-modal="true" aria-labelledby="matchOverlayTitle">
        <div class="match-hearts" aria-hidden="true">♥ ♥ ♥</div>
        <h2 id="matchOverlayTitle">マッチング成立！</h2>
        <div class="match-avatars">
          <div class="match-avatar" id="matchCandidateAvatar"></div>
          <span>♥</span>
          <div class="match-avatar match-avatar-you">You</div>
        </div>
        <p id="matchOverlayText"></p>
        <div class="match-overlay-actions">
          <button type="button" id="matchSkipButton">あとで</button>
          <button type="button" id="matchMessageButton">メッセージする</button>
        </div>
      </div>
    </div>
    <div id="toast" class="toast" role="status" aria-live="polite"></div>
  `;
}
