import sanitizeHtml from "sanitize-html";

const RICH_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["h2", "h3", "h4", "p", "br", "hr", "strong", "b", "em", "i", "u", "s", "a", "ul", "ol", "li",
    "blockquote", "code", "pre", "img", "figure", "figcaption", "table", "thead", "tbody", "tr", "th", "td", "span", "mark"],
  allowedAttributes: {
    a: ["href", "target", "rel", "title"],
    img: ["src", "alt", "width", "height", "loading", "title"],
    code: ["class"], pre: ["class"], span: ["class"], th: ["colspan", "rowspan"], td: ["colspan", "rowspan"],
    h2: ["id"], h3: ["id"], h4: ["id"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https"] },
  allowProtocolRelative: false,
  transformTags: {
    a: (tagName, attribs) => {
      const external = /^https?:\/\//i.test(attribs.href ?? "");
      return { tagName, attribs: external ? { ...attribs, target: "_blank", rel: "noopener noreferrer" } : attribs };
    },
    img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy" } }),
  },
};

/** Sanitizes editor HTML. Relative image paths (/uploads/...) are kept. */
export const sanitizeRich = (html: string) => sanitizeHtml(html, RICH_OPTIONS);

/** Strips every tag (plain text fields that should never hold markup). */
export const stripTags = (text: string) => sanitizeHtml(text, { allowedTags: [], allowedAttributes: {} });

export function readTimeOf(html: string) {
  const words = stripTags(html).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
