export function useMatches(state) {
  return {
    getMatches() {
      return state.matches;
    }
  };
}
