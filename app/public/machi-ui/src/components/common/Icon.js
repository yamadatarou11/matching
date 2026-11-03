const ICONS = {
  like: "\u2665",
  pass: "\u00d7",
  superLike: "S",
  back: "\u2039",
  receivedLike: "\u2665",
  sentLike: "\u2661",
  match: "\u2728",
  message: "\u2709",
  profile: "\u25cc"
};

export function renderIcon(name, { className = "", label = "", filled = false } = {}) {
  const icon = ICONS[name] || name || "";
  const classes = ["app-icon", className, filled ? "app-icon-filled" : ""].filter(Boolean).join(" ");
  const aria = label ? ` aria-label="${label}"` : "";
  return `<span class="${classes}"${aria}>${icon}</span>`;
}

export function resolveIcon(name) {
  return ICONS[name] || name || "";
}

export default renderIcon;
