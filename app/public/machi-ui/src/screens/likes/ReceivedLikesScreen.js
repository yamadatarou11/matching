import { renderLikeList } from "../../components/likes/LikeList.js";

export function renderReceivedLikesScreen(receivedLikes, gradeLabel) {
  return renderLikeList(receivedLikes, gradeLabel, "received");
}
