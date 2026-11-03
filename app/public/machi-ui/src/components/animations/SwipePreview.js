export function renderSwipePreview({ type }) {
  const isBad = type === "bad";
  const className = isBad ? "swipe-preview swipe-preview-bad" : "swipe-preview swipe-preview-like";
  const symbol = isBad ? "×" : "♥";
  return `<div class="${className}" aria-hidden="true">${symbol}</div>`;
}
