export function renderProfileTemplate() {
  return `
    <section id="profile" class="view">
      <form class="profile-editor" id="profileForm">
        <div class="profile-setting-top">
          <strong>プロフィール設定</strong>
          <button class="profile-save-button" id="profileSaveSubmit" type="submit">保存</button>
        </div>
        <div class="profile-mode-tabs" aria-label="プロフィール編集モード">
          <button class="active" id="editTabButton" type="button">編集</button>
          <button id="openProfilePreviewTabButton" type="button">プレビュー</button>
        </div>

        <div id="profileEditPane">
          <input class="visually-hidden" name="photo" id="profilePhoto" type="file" accept="image/*" multiple />

          <div class="profile-section">
            <div class="profile-subhead">
              <h2>写真</h2>
              <span class="profile-count" id="photoCount">0/6枚</span>
            </div>
            <div class="profile-photo-preview" id="profilePhotoPreview"></div>
            <button class="ghost-button" id="profileOpenPickerButton" type="button">写真を追加</button>
            <p class="profile-help">最初の写真がメイン表示になります。最大6枚まで登録できます。</p>
            <div class="profile-preview-card visually-hidden">
              <div class="profile-preview-body">
                <strong id="profilePreviewName">Haruka</strong>
                <span id="profilePreviewMeta">富山大学 / 人文学部</span>
                <p id="profilePreviewStatus">気軽に話しかけてください！</p>
                <div id="profilePreviewTags" class="profile-preview-tags"></div>
              </div>
            </div>
          </div>

          <div class="profile-section">
            <div class="profile-subhead"><h2>基本情報</h2></div>
            <label>名前<input name="name" id="profileName" value="" placeholder="例: 田中 さくら" /></label>
            <label>年齢
              <span class="profile-readonly-field">
                <input name="age" id="profileAge" type="number" readonly />
                <small>変更不可</small>
              </span>
            </label>
            <label>大学・エリア<input name="university" id="profileUniversity" placeholder="例: 富山大学 / 中央通り" /></label>
            <input type="hidden" name="school" id="profileSchool" value="" />
            <label>学部・補足<input name="faculty" id="profileFaculty" placeholder="例: 人文学部 文化学科" /></label>
            <div class="profile-block">
              <span class="profile-block-label">学年</span>
              <div class="seg-group" id="profileYearGroup" role="group" aria-label="学年"></div>
              <input type="hidden" name="year" id="profileYear" value="" />
            </div>
            <label>出身地<input name="hometown" id="profileHometown" placeholder="例: 富山市" /></label>
            <label>性別
              <span class="profile-readonly-field">
                <select name="gender" id="profileGender" disabled>
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                  <option value="other">その他</option>
                </select>
                <small>変更不可</small>
              </span>
            </label>
          </div>

          <div class="profile-section">
            <div class="profile-subhead"><h2>自己紹介</h2></div>
            <textarea name="bio" id="profileBio" rows="4" maxlength="200" placeholder="自分のことを自由に書いてください"></textarea>
            <div class="char-count"><span id="bioCount">0</span>/200</div>
          </div>

          <div class="profile-section">
            <div class="profile-subhead">
              <h2>趣味・好きなこと</h2>
              <span class="profile-count">最大6つ</span>
            </div>
            <p class="profile-help">選択中: <span id="hobbyCount">0</span>/6</p>
            <div class="chip-group" id="hobbyGroup"></div>
            <div class="tag-add-row">
              <input id="customHobbyInput" type="text" maxlength="20" placeholder="好きなことを追加" />
              <button class="tag-add-button" id="addCustomHobbyButton" type="button" aria-label="好きなことを追加">＋</button>
            </div>
            <input type="hidden" name="interests" id="profileInterests" value="" />
          </div>

          <div class="profile-section">
            <div class="profile-subhead">
              <h2>性格・タイプ</h2>
              <span class="profile-count">最大3つ</span>
            </div>
            <div class="chip-group" id="personalityGroup"></div>
            <div class="tag-add-row">
              <input id="customPersonalityInput" type="text" maxlength="20" placeholder="性格・タイプを追加" />
              <button class="tag-add-button" id="addCustomPersonalityButton" type="button" aria-label="性格・タイプを追加">＋</button>
            </div>
          </div>

          <div class="profile-section">
            <div class="profile-subhead"><h2>求めているもの</h2></div>
            <div class="profile-block">
              <span class="profile-block-label">どんな出会いを求めていますか？</span>
              <textarea name="type" id="profileType" rows="3" maxlength="100" placeholder="例：一緒に富山を探索してくれる人"></textarea>
              <div class="char-count"><span id="typeCount">0</span>/100</div>
            </div>
            <div class="profile-block">
              <span class="profile-block-label">理想のデートプラン</span>
              <textarea name="idealDate" id="profileIdealDate" rows="2" maxlength="80" placeholder="例：富山湾でランチ → 富岩運河を散歩"></textarea>
              <div class="char-count"><span id="idealDateCount">0</span>/80</div>
            </div>
          </div>

          <div class="account-actions">
            <button class="ghost-button" id="profileLogoutButton" type="button">ログアウト</button>
            <button class="danger-button" id="deleteAccountButton" type="button">アカウント削除</button>
          </div>
        </div>

        <div id="profilePreviewPane" class="profile-pane-hidden">
          <div class="profile-preview-stage">
            <article class="profile-card profile-preview-result-card" id="profilePreviewCardMount" aria-live="polite"></article>
          </div>
        </div>
      </form>
    </section>
  `;
}
