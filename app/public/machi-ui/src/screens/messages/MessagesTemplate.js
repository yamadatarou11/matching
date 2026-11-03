import { renderBackButton } from "../../components/navigation/BackButton.js";
import { renderMessageInput, renderSendButton } from "../../components/chat/renderers.js";

export function renderMessagesTemplate() {
  return `
    <section id="messages" class="view">
      <div class="section-heading">
        <h2>\u30e1\u30c3\u30bb\u30fc\u30b8</h2>
        <div class="messages-summary-actions">
          <button id="unreadRepliesButton" class="unread-replies-button" type="button" hidden>
            <span class="unread-replies-label">\u672a\u8fd4\u4fe1</span>
            <span id="unreadRepliesCount">0\u4ef6</span>
          </button>
          <span id="chatCount">0\u4ef6</span>
        </div>
      </div>
      <div class="message-layout">
        <div class="conversation-list-wrap">
          <div class="panel-kicker">Matched people</div>
          <div class="pending-chat-block" id="pendingChatArea">
            <div class="mini-heading chat-mini-heading">
              <strong>\u672a\u8fd4\u4fe1\u306e\u30de\u30c3\u30c1</strong>
              <span id="matchListCount">0\u4ef6</span>
            </div>
            <div class="pending-chat-list" id="pendingChatList"></div>
          </div>
          <div class="mini-heading chat-mini-heading">
            <strong>\u30c1\u30e3\u30c3\u30c8\u4e00\u89a7</strong>
            <span>\u3084\u308a\u53d6\u308a\u4e2d\u306e\u76f8\u624b</span>
          </div>
          <div class="conversation-list" id="conversationList"></div>
        </div>
        <div class="chat-panel">
          <div class="chat-detail-top">
            ${renderBackButton({
              id: "chatBackButton",
              className: "chat-back-button",
              label: "\u30e1\u30c3\u30bb\u30fc\u30b8\u4e00\u89a7\u306b\u623b\u308b",
              ariaLabel: "\u30e1\u30c3\u30bb\u30fc\u30b8\u4e00\u89a7\u306b\u623b\u308b"
            })}
            <button id="chatHeader" class="chat-header" type="button" aria-label="\u76f8\u624b\u306e\u30d7\u30ed\u30d5\u30a3\u30fc\u30eb\u3092\u958b\u304f"></button>
          </div>
          <div id="chatLog" class="chat-log"></div>
          <form id="messageForm" class="message-form">
            ${renderMessageInput()}
            ${renderSendButton()}
          </form>
        </div>
      </div>
    </section>
  `;
}
