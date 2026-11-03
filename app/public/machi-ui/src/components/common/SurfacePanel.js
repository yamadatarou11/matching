export function renderSurfacePanel({ tag = "div", className = "", id = "", body = "", attrs = "" }) {
  const attrList = [
    id ? `id="${id}"` : "",
    className ? `class="${className}"` : "",
    attrs,
  ]
    .filter(Boolean)
    .join(" ");

  return `<${tag} ${attrList}>${body}</${tag}>`;
}

export function renderMiniHeading({ title, subtitle = "" }) {
  return `
    <div class="mini-heading">
      <strong>${title}</strong>
      ${subtitle ? `<span>${subtitle}</span>` : ""}
    </div>
  `;
}
