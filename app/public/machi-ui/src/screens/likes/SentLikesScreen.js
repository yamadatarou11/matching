import { renderLikeList } from "../../components/likes/LikeList.js";

export function renderSentLikesScreen(likes, gradeLabel) {
  return renderLikeList(likes, gradeLabel, "sent");
}
