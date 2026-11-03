export function useLikes(state) {
  return {
    getSentLikes() {
      return state.likes;
    },
    getReceivedLikes() {
      return state.receivedLikes;
    }
  };
}
