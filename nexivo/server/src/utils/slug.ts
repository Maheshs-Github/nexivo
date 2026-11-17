import slugify from "slugify";

export const toSlug = (input: string) => slugify(input, { lower: true, strict: true, trim: true }).slice(0, 180) || "item";

/** Returns a unique slug, appending -2, -3... when taken. `exists` checks a candidate, ignoring `selfId`. */
export async function uniqueSlug(base: string, exists: (slug: string) => Promise<boolean>) {
  const root = toSlug(base);
  let candidate = root;
  for (let i = 2; await exists(candidate); i++) candidate = `${root}-${i}`;
  return candidate;
}
