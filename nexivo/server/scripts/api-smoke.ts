/**
 * End-to-end API smoke test. Start the API (npm run dev) on a seeded database, then run:
 *   npm run test:api            (from the repo root or server/)
 * Covers every endpoint group plus the security negatives from the brief.
 */
import "dotenv/config";

const BASE = process.env.API_URL ?? `http://localhost:${process.env.PORT ?? 4000}`;
let passed = 0;
const failures: string[] = [];

type Res = { status: number; body: { success?: boolean; data?: unknown; message?: string; errors?: unknown } | null; headers: Headers };

async function call(method: string, path: string, opts: { cookie?: string; json?: unknown; form?: FormData } = {}): Promise<Res> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { ...(opts.json !== undefined ? { "Content-Type": "application/json" } : {}), ...(opts.cookie ? { Cookie: opts.cookie } : {}) },
    body: opts.form ?? (opts.json !== undefined ? JSON.stringify(opts.json) : undefined),
  });
  const text = await res.text();
  let body = null;
  try { body = JSON.parse(text); } catch { /* xml / pdf */ }
  return { status: res.status, body, headers: res.headers };
}

function check(name: string, ok: boolean, detail = "") {
  if (ok) { passed++; console.log(`  ✓ ${name}`); }
  else { failures.push(name); console.log(`  ✗ ${name} ${detail}`); }
}
const expect = (name: string, r: Res, status: number) => check(`${name} -> ${status}`, r.status === status, `(got ${r.status}: ${r.body?.message ?? ""})`);

async function login(email: string, password: string) {
  const res = await fetch(`${BASE}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
  const cookie = res.headers.get("set-cookie")?.split(";")[0] ?? "";
  return { status: res.status, cookie, setCookie: res.headers.get("set-cookie") ?? "" };
}

const pdf = (bytes = 2048) => { const b = Buffer.alloc(bytes, 0x20); b.write("%PDF-1.4\n"); b.write("%%EOF", bytes - 6); return b; };
const exe = () => { const b = Buffer.alloc(4096); b.write("MZ"); return b; };
const applyForm = (file: Buffer, name: string, extra: Record<string, string> = {}) => {
  const f = new FormData();
  f.append("name", "Smoke Test"); f.append("email", "smoke@example.com");
  for (const [k, v] of Object.entries(extra)) f.append(k, v);
  f.append("resume", new Blob([new Uint8Array(file)], { type: "application/pdf" }), name);
  return f;
};

async function main() {
  console.log(`API smoke test against ${BASE}\n\nPublic`);
  expect("GET /api/health", await call("GET", "/api/health"), 200);
  for (const p of ["/api/settings", "/api/nav", "/api/services", "/api/testimonials", "/api/team", "/api/clients", "/api/projects", "/api/categories", "/api/jobs"]) {
    const r = await call("GET", p);
    check(`GET ${p} returns data`, r.status === 200 && r.body?.success === true && r.body.data !== undefined, `(${r.status})`);
  }
  for (const page of ["home", "about", "services", "blog", "careers", "contact"]) {
    const r = await call("GET", `/api/pages/${page}/sections`);
    check(`GET /api/pages/${page}/sections`, r.status === 200 && Array.isArray(r.body?.data), `(${r.status})`);
  }
  expect("GET /api/seo/home", await call("GET", "/api/seo/home"), 200);
  expect("GET /api/pages/nope/sections (bad param)", await call("GET", "/api/pages/nope/sections"), 400);
  const services = (await call("GET", "/api/services")).body?.data as { slug: string }[];
  expect("GET /api/services/:slug", await call("GET", `/api/services/${services[0].slug}`), 200);
  const projects = (await call("GET", "/api/projects")).body?.data as { slug: string }[];
  expect("GET /api/projects/:slug", await call("GET", `/api/projects/${projects[0].slug}`), 200);

  console.log("\nBlog");
  const list = await call("GET", "/api/blogs?limit=2&page=1");
  const page = list.body?.data as { items: { slug: string; views: number }[]; total: number; pages: number };
  check("GET /api/blogs paginates {items,total,page,pages}", list.status === 200 && page.items.length === 2 && page.pages >= 3);
  expect("GET /api/blogs?limit=500 (limit max 50)", await call("GET", "/api/blogs?limit=500"), 400);
  check("GET /api/blogs?q= search", ((await call("GET", "/api/blogs?q=cloud")).body?.data as { total: number }).total >= 1);
  check("GET /api/blogs?category=design filter", ((await call("GET", "/api/blogs?category=design")).body?.data as { total: number }).total >= 1);
  const d1 = (await call("GET", `/api/blogs/${page.items[0].slug}`)).body?.data as { post: { views: number }; related: unknown[] };
  const d2 = (await call("GET", `/api/blogs/${page.items[0].slug}`)).body?.data as { post: { views: number } };
  check("GET /api/blogs/:slug increments views", d2.post.views === d1.post.views + 1);
  check("GET /api/blogs/:slug returns 3 related", d1.related.length === 3);
  expect("Draft post is hidden publicly", await call("GET", "/api/blogs/engineering-handbook-2027"), 404);
  const sm = await fetch(`${BASE}/sitemap.xml`);
  check("GET /sitemap.xml", sm.status === 200 && (await sm.text()).includes("<urlset"));

  console.log("\nAuth");
  expect("GET /api/admin/blogs without cookie", await call("GET", "/api/admin/blogs"), 401);
  expect("POST /api/auth/login bad body", await call("POST", "/api/auth/login", { json: { email: "nope" } }), 400);
  const bad = await call("POST", "/api/auth/login", { json: { email: process.env.ADMIN_EMAIL, password: "wrong-password" } });
  check("Wrong password -> 401 generic message", bad.status === 401 && bad.body?.message === "Invalid email or password");
  const admin = await login(process.env.ADMIN_EMAIL!, process.env.ADMIN_PASSWORD!);
  check("Admin login sets httpOnly SameSite=Lax cookie", admin.status === 200 && /HttpOnly/i.test(admin.setCookie) && /SameSite=Lax/i.test(admin.setCookie));
  const editor = await login(process.env.EDITOR_EMAIL!, process.env.EDITOR_PASSWORD!);
  check("Editor login", editor.status === 200);
  const me = await call("GET", "/api/auth/me", { cookie: admin.cookie });
  check("GET /api/auth/me never returns passwordHash", me.status === 200 && !JSON.stringify(me.body).includes("passwordHash"));
  expect("EDITOR on /api/admin/users", await call("GET", "/api/admin/users", { cookie: editor.cookie }), 403);
  expect("EDITOR on admin-only settings group", await call("PUT", "/api/admin/settings/theme", { cookie: editor.cookie, json: { accent: "#22D3EE" } }), 403);

  console.log("\nAdmin CRUD");
  const A = { cookie: admin.cookie };
  for (const r of ["services", "testimonials", "team", "clients", "projects", "categories", "tags", "jobs", "nav", "sections", "seo", "blogs", "applications", "messages", "media"]) {
    const res = await call("GET", `/api/admin/${r}?limit=5`, A);
    check(`GET /api/admin/${r}`, res.status === 200 && Array.isArray((res.body?.data as { items: unknown[] }).items), `(${res.status})`);
  }
  expect("GET /api/admin/users (admin)", await call("GET", "/api/admin/users", A), 200);
  expect("GET /api/admin/settings", await call("GET", "/api/admin/settings", A), 200);
  const stats = await call("GET", "/api/admin/dashboard/stats", A);
  check("GET /api/admin/dashboard/stats has 30-day activity", stats.status === 200 && (stats.body?.data as { activity: unknown[] }).activity.length === 30);
  expect("POST /api/admin/services bad body", await call("POST", "/api/admin/services", { ...A, json: { title: "" } }), 400);
  const created = await call("POST", "/api/admin/services", { ...A, json: { title: "Smoke Service", shortDesc: "Temp", description: "<p>x</p><script>alert(1)</script>", isAdmin: true } });
  const svc = created.body?.data as { id: number; slug: string; description: string };
  check("Create service strips <script> and unknown fields", created.status === 201 && !svc.description.includes("<script") && !("isAdmin" in svc));
  const dup = (await call("POST", "/api/admin/services", { ...A, json: { title: "Smoke Service", shortDesc: "Temp", description: "<p>y</p>" } })).body?.data as { id: number; slug: string };
  check("Duplicate slug gets -2 suffix", dup.slug === `${svc.slug}-2`);
  expect("PATCH visibility", await call("PATCH", `/api/admin/services/${svc.id}`, { ...A, json: { isVisible: false } }), 200);
  expect("DELETE service", await call("DELETE", `/api/admin/services/${svc.id}`, A), 200);
  await call("DELETE", `/api/admin/services/${dup.id}`, A);
  expect("Section content validated per type", await call("POST", "/api/admin/sections", { ...A, json: { page: "HOME", type: "HERO", content: { headline: "" } } }), 400);

  const post = await call("POST", "/api/admin/blogs", { ...A, json: { title: "Smoke post", excerpt: "Excerpt", content: "<h2>Hi</h2><p>Body</p>", tags: ["Smoke Tag"], status: "DRAFT" } });
  const pid = (post.body?.data as { id: number; slug: string }).id;
  const pslug = (post.body?.data as { slug: string }).slug;
  expect("Create draft post", post, 201);
  expect("Draft not public", await call("GET", `/api/blogs/${pslug}`), 404);
  expect("Publish post", await call("PATCH", `/api/admin/blogs/${pid}/publish`, A), 200);
  expect("Published post is public", await call("GET", `/api/blogs/${pslug}`), 200);
  expect("Delete post", await call("DELETE", `/api/admin/blogs/${pid}`, A), 200);

  console.log("\nForms & uploads");
  expect("POST /api/contact", await call("POST", "/api/contact", { json: { name: "Smoke", email: "smoke@example.com", subject: "Hello", message: "Testing the contact form end to end." } }), 201);
  expect("POST /api/contact bad body", await call("POST", "/api/contact", { json: { name: "", email: "x" } }), 400);
  expect("POST /api/contact honeypot filled", await call("POST", "/api/contact", { json: { name: "Bot", email: "bot@example.com", subject: "Hi", message: "Buy cheap things now", website: "spam.example" } }), 400);
  const jobs = (await call("GET", "/api/admin/jobs?limit=20", A)).body?.data as { items: { id: number; status: string }[] };
  const open = jobs.items.find((j) => j.status === "OPEN")!;
  const closed = jobs.items.find((j) => j.status === "CLOSED")!;
  expect("Apply with a real PDF", await call("POST", `/api/jobs/${open.id}/apply`, { form: applyForm(pdf(), "cv.pdf") }), 201);
  expect("Resume over 5 MB rejected", await call("POST", `/api/jobs/${open.id}/apply`, { form: applyForm(pdf(6 * 1024 * 1024), "big.pdf") }), 413);
  expect(".exe renamed to .pdf rejected", await call("POST", `/api/jobs/${open.id}/apply`, { form: applyForm(exe(), "cv.pdf") }), 400);
  expect("Closed job cannot be applied to", await call("POST", `/api/jobs/${closed.id}/apply`, { form: applyForm(pdf(), "cv.pdf") }), 410);
  const apps = (await call("GET", "/api/admin/applications?limit=1", A)).body?.data as { items: { id: number }[] };
  const resume = await fetch(`${BASE}/api/admin/applications/${apps.items[0].id}/resume`, { headers: { Cookie: admin.cookie } });
  check("Resume download (admin) is a PDF", resume.status === 200 && resume.headers.get("content-type") === "application/pdf");
  expect("Resume download without cookie", await call("GET", `/api/admin/applications/${apps.items[0].id}/resume`), 401);
  expect("Resumes are not under /uploads", await call("GET", "/uploads/../private/resumes/x.pdf"), 404);

  const svg = new FormData();
  svg.append("file", new Blob(["<svg xmlns='http://www.w3.org/2000/svg'><script>alert(1)</script></svg>"], { type: "image/png" }), "x.png");
  expect("SVG disguised as PNG rejected", await call("POST", "/api/admin/media/upload", { ...A, form: svg }), 400);

  expect("POST /api/auth/logout", await call("POST", "/api/auth/logout", A), 200);
  console.log(`\n${passed} passed, ${failures.length} failed`);
  if (failures.length) { console.log("Failed:\n - " + failures.join("\n - ")); process.exit(1); }
}

main().catch((e) => { console.error("Smoke test crashed:", e); process.exit(1); });
