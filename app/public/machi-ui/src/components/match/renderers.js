import { renderMiniProfileCard } from "../profile/renderers.js";

export function renderMatchCard(match, gradeLabel, index = 0) {
  return renderMiniProfileCard(match, gradeLabel, {
    className: "match-card match-card-match-list",
    variant: "match",
    size: "compact",
    clickable: true,
    attrs: `data-match-index="${index}"`,
    topIcon: "match",
    badge: "\u30de\u30c3\u30c1\u6210\u7acb"
  });
}

export function renderMatchList(matches, gradeLabel) {
  return matches.map((match, index) => renderMatchCard(match, gradeLabel, index)).join("");
}

export function renderMatchModalText(name) {
  return `${name}\u3055\u3093\u3068\u30de\u30c3\u30c1\u3057\u307e\u3057\u305f\u3002\u30e1\u30c3\u30bb\u30fc\u30b8\u3092\u9001\u3063\u3066\u307f\u307e\u3057\u3087\u3046`;
}
