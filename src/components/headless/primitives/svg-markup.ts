/**
 * Builds internal SVG fragments. Substitutions are data, never markup, and must
 * appear only as text or inside quoted attributes in the literal template.
 */
export function svgMarkup(
  strings: TemplateStringsArray,
  ...values: readonly (string | number)[]
): string {
  let markup = strings[0] ?? "";
  for (let index = 0; index < values.length; index += 1) {
    const escaped = String(values[index])
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
    markup += escaped + (strings[index + 1] ?? "");
  }
  return markup;
}
