/**
 * Generates local placeholder artwork (no hotlinked images): gradient covers, initials avatars and
 * wordmark logos for fictional client companies. Written to server/uploads/seed/ and committed to git.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../uploads/seed");

type Palette = [string, string, string];
export const PALETTES: Palette[] = [
  ["#6366F1", "#22D3EE", "#0B1020"],
  ["#8B5CF6", "#6366F1", "#0B1020"],
  ["#22D3EE", "#10B981", "#07141F"],
  ["#F472B6", "#8B5CF6", "#120B20"],
  ["#F59E0B", "#EF4444", "#1A0F0B"],
  ["#38BDF8", "#6366F1", "#0A1222"],
];

function hash(s: string) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

function rand(seed: number) {
  let t = seed;
  return () => { t = (t + 0x6d2b79f5) | 0; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
}

function write(name: string, svg: string) {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, name), svg.replace(/\n\s*/g, ""));
  return `/uploads/seed/${name}`;
}

/** Abstract "engineering" cover: soft mesh blobs, a hairline grid and a few orbit lines. */
export function cover(name: string, paletteIndex: number, motif: "orbits" | "bars" | "nodes" = "orbits") {
  const [a, b, bg] = PALETTES[paletteIndex % PALETTES.length];
  const r = rand(hash(name));
  const W = 1600, H = 900;
  const blobs = Array.from({ length: 3 }, (_, i) =>
    `<circle cx="${Math.round(W * (0.2 + r() * 0.6))}" cy="${Math.round(H * (0.2 + r() * 0.6))}" r="${Math.round(260 + r() * 220)}" fill="${i === 1 ? b : a}" opacity="${(0.45 + r() * 0.3).toFixed(2)}"/>`).join("");
  const grid = Array.from({ length: 25 }, (_, i) => `<path d="M${i * 64} 0V${H}" />`).join("") + Array.from({ length: 15 }, (_, i) => `<path d="M0 ${i * 64}H${W}" />`).join("");
  let fg = "";
  if (motif === "orbits") {
    const cx = W * 0.68, cy = H * 0.5;
    fg = [140, 230, 330, 440].map((rad, i) => `<ellipse cx="${cx}" cy="${cy}" rx="${rad * 1.35}" ry="${rad}" fill="none" stroke="white" stroke-opacity="${0.22 - i * 0.04}" stroke-width="1.5" transform="rotate(${-18 + i * 6} ${cx} ${cy})"/>`).join("")
      + `<circle cx="${cx}" cy="${cy}" r="10" fill="white"/><circle cx="${cx + 190}" cy="${cy - 140}" r="6" fill="${b}"/><circle cx="${cx - 300}" cy="${cy + 120}" r="5" fill="white" opacity=".7"/>`;
  } else if (motif === "bars") {
    fg = Array.from({ length: 14 }, (_, i) => {
      const h = Math.round(80 + r() * 420);
      return `<rect x="${760 + i * 52}" y="${720 - h}" width="28" height="${h}" rx="6" fill="white" opacity="${(0.12 + (i / 14) * 0.5).toFixed(2)}"/>`;
    }).join("");
  } else {
    const pts = Array.from({ length: 9 }, () => [Math.round(700 + r() * 760), Math.round(140 + r() * 620)]);
    fg = pts.slice(1).map(([x, y], i) => `<path d="M${pts[i][0]} ${pts[i][1]}L${x} ${y}" stroke="white" stroke-opacity=".25" stroke-width="1.5"/>`).join("")
      + pts.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 3 === 0 ? 9 : 5}" fill="${i % 2 ? "white" : b}"/>`).join("");
  }
  return write(name, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
    <defs><filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="120"/></filter>
    <radialGradient id="v" cx="50%" cy="40%" r="75%"><stop offset="60%" stop-color="${bg}" stop-opacity="0"/><stop offset="100%" stop-color="${bg}" stop-opacity=".85"/></radialGradient></defs>
    <rect width="${W}" height="${H}" fill="${bg}"/><g filter="url(#blur)">${blobs}</g>
    <g stroke="white" stroke-opacity=".06" stroke-width="1">${grid}</g>${fg}<rect width="${W}" height="${H}" fill="url(#v)"/></svg>`);
}

/** Initials avatar with a soft two-tone gradient. */
export function avatar(name: string, paletteIndex: number) {
  const [a, b] = PALETTES[paletteIndex % PALETTES.length];
  const initials = name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const file = `avatar-${name.toLowerCase().replace(/[^a-z]+/g, "-")}.svg`;
  return write(file, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
    <rect width="256" height="256" fill="url(#g)"/><circle cx="200" cy="40" r="90" fill="white" opacity=".08"/>
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Sora, Inter, Arial, sans-serif" font-size="96" font-weight="600" fill="white" letter-spacing="-2">${initials}</text></svg>`);
}

/** Neutral wordmark logo (works on dark and light backgrounds) for a fictional company. */
export function logo(name: string, mark: "ring" | "diamond" | "bars" | "wave" | "hex" | "dot") {
  const marks: Record<typeof mark, string> = {
    ring: `<circle cx="20" cy="24" r="12" fill="none" stroke="#8B93B5" stroke-width="4"/>`,
    diamond: `<path d="M20 8l14 16-14 16L6 24z" fill="#8B93B5"/>`,
    bars: `<rect x="6" y="14" width="6" height="20" rx="2" fill="#8B93B5"/><rect x="16" y="8" width="6" height="26" rx="2" fill="#8B93B5"/><rect x="26" y="18" width="6" height="16" rx="2" fill="#8B93B5"/>`,
    wave: `<path d="M4 28c6-10 10-10 16 0s10 10 16 0" fill="none" stroke="#8B93B5" stroke-width="4" stroke-linecap="round"/>`,
    hex: `<path d="M20 6l15 9v18l-15 9-15-9V15z" fill="none" stroke="#8B93B5" stroke-width="4"/>`,
    dot: `<circle cx="14" cy="24" r="8" fill="#8B93B5"/><circle cx="30" cy="24" r="5" fill="#8B93B5" opacity=".6"/>`,
  };
  const width = 56 + name.length * 15;
  const file = `logo-${name.toLowerCase().replace(/[^a-z]+/g, "-")}.svg`;
  return write(file, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 48" width="${width}" height="48">${marks[mark]}
    <text x="46" y="32" font-family="Sora, Inter, Arial, sans-serif" font-size="22" font-weight="600" fill="#8B93B5" letter-spacing="-0.5">${name}</text></svg>`);
}

/** A tiny but valid PDF, used for seeded demo applications. */
export function samplePdf(title: string) {
  const text = `BT /F1 18 Tf 72 720 Td (${title.replace(/[()\\]/g, "")}) Tj ET`;
  const objs = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${text.length} >>\nstream\n${text}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let body = "%PDF-1.4\n";
  const offsets: number[] = [];
  objs.forEach((o, i) => { offsets.push(body.length); body += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = body.length;
  body += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}`;
  body += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(body, "latin1");
}
