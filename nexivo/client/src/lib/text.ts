/** Plain text from HTML (for meta descriptions and JSON-LD). Uses the DOM parser, so nothing is executed. */
export function stripHtml(html: string) {
  if (typeof DOMParser === "undefined") return html.replace(/<[^>]+>/g, " ");
  return (new DOMParser().parseFromString(html, "text/html").body.textContent ?? "").replace(/\s+/g, " ").trim();
}

export const slugifyHeading = (text: string) =>
  text.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80) || "section";
