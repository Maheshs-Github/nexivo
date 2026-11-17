export interface SeedPost { title: string; slug: string; category: string; tags: string[]; excerpt: string; author: "admin" | "editor"; daysAgo: number; featured?: boolean; content: string }

export const postsA: SeedPost[] = [
  {
    title: "Shipping LLM features to production: a field guide",
    slug: "shipping-llm-features-to-production",
    category: "AI & Automation", tags: ["LLM", "RAG", "Evaluation"], author: "admin", daysAgo: 3, featured: true,
    excerpt: "Demos are easy. Features that behave on the ten-thousandth request are not. Here is the checklist we use to take LLM features from prototype to production.",
    content: `
<p>Almost every team we talk to has an impressive AI demo. Far fewer have an AI feature that customers rely on every day. The gap between the two is not model quality. It is engineering: evaluation, guardrails, cost control and an honest plan for when the model is wrong. This is the field guide we use on client projects.</p>
<h2>Start with a workflow, not a model</h2>
<p>The best first AI feature is boring. Look for a task that is high volume, text heavy and already done by people following a written process: triaging support tickets, extracting fields from invoices, drafting replies from a knowledge base. These tasks have clear inputs, clear outputs and, crucially, historical examples you can test against.</p>
<p>Write the success metric before writing a prompt. "Agents accept the drafted reply without edits 60 percent of the time" is a metric. "The answers feel good" is not.</p>
<h2>Build the evaluation set first</h2>
<p>An evaluation set is a few hundred real examples with the answer you would accept. On a recent retail project we pulled 600 historical tickets, removed personal data and labelled the correct resolution for each. That set became the single most valuable asset of the project.</p>
<h3>What a good eval set contains</h3>
<ul>
<li>The common cases, in roughly the proportion they occur in production.</li>
<li>The awkward cases: ambiguous questions, angry customers, mixed languages.</li>
<li>The dangerous cases: requests the system must refuse or escalate.</li>
</ul>
<p>Every prompt change, model upgrade or retrieval tweak runs against the full set in CI. If the score drops, the change does not ship. This one habit prevents most of the regressions we see in the wild.</p>
<h2>Retrieval is where quality is won</h2>
<p>Most "hallucinations" in business applications are really retrieval failures: the model was never shown the right policy or product page. Before changing models, inspect what context was retrieved for failing cases.</p>
<h3>Practical retrieval improvements</h3>
<p>Chunk documents along their natural structure, such as headings and FAQ entries, instead of fixed character counts. Store metadata like product category and effective date so you can filter before searching. Combine keyword and vector search; product codes and order numbers are poorly served by embeddings alone. Finally, log the retrieved chunks with every answer so you can debug real conversations later.</p>
<h2>Guardrails and graceful failure</h2>
<p>Assume the model will occasionally be confidently wrong, and design for it. We use three layers. Input checks route out-of-scope or sensitive requests before they reach the model. Output checks validate structure, block policy violations and verify that cited sources exist. And a human-in-the-loop path lets the system hand over to an agent with a summary instead of guessing.</p>
<p>The handover experience matters as much as the happy path. A copilot that says "I've passed this to Priya with the order details" builds more trust than one that invents a refund policy.</p>
<h2>Keep costs boring</h2>
<p>Token costs scale with success, which surprises teams in the second month. Cache answers for repeated questions, use smaller models for classification and routing, and reserve the largest model for the steps that need it. Set per-tenant budgets and alerts from day one. On most projects these steps cut inference spend by more than half without measurable quality loss.</p>
<h2>Roll out like any other risky change</h2>
<p>Ship to internal users first, then to a small percentage of traffic, with a kill switch that falls back to the old workflow. Watch acceptance rate, escalation rate, latency and cost per resolved task on a dashboard the whole team can see. Expand only when the numbers hold for a full business cycle.</p>
<h2>The checklist</h2>
<ol>
<li>A workflow with volume and a written success metric.</li>
<li>An evaluation set of real examples, run in CI.</li>
<li>Retrieval you can inspect and debug.</li>
<li>Input checks, output checks and a human handover.</li>
<li>Caching, model routing and budgets.</li>
<li>Staged rollout with a kill switch and a shared dashboard.</li>
</ol>
<p>None of this is glamorous, and that is the point. AI features earn their place the same way every other feature does: by being measured, tested and dependable. If you are sitting on a promising demo and wondering how to make it real, we are always happy to compare notes.</p>`,
  },
  {
    title: "Core Web Vitals in 2026: what actually moves the needle",
    slug: "core-web-vitals-what-moves-the-needle",
    category: "Engineering", tags: ["Performance", "React", "Frontend"], author: "editor", daysAgo: 11,
    excerpt: "After auditing dozens of production sites, the same few fixes keep delivering most of the gains. Here they are, in the order we apply them.",
    content: `
<p>Performance advice is everywhere, and most of it is correct but unprioritised. After auditing more than forty production sites over the past two years, we have found that a handful of changes deliver most of the improvement. This post walks through them in the order we apply them.</p>
<h2>Measure the field, not the lab</h2>
<p>Lighthouse is a fine diagnostic tool, but your users do not browse on a developer laptop. Start with field data from real visitors, either from the Chrome UX Report or your own real-user monitoring. Segment by device and connection. On one e-commerce client, desktop scores were excellent while the 75th-percentile mobile user in tier-two cities waited over four seconds for the largest image.</p>
<h2>Largest Contentful Paint: the hero is usually the problem</h2>
<p>The LCP element is almost always a hero image, a heading in a web font or a product photo. Three fixes cover most cases.</p>
<h3>Ship the right image, early</h3>
<p>Serve modern formats like WebP or AVIF at the size actually displayed, with explicit width and height. Do not lazy-load the hero; mark it with a high fetch priority instead. Preload it if it is discovered late, for example when it is a CSS background.</p>
<h3>Stop blocking on fonts</h3>
<p>Use font-display swap, preconnect to the font host and subset fonts to the characters you use. For headings, a well-matched fallback with adjusted metrics prevents both invisible text and layout jumps.</p>
<h3>Render something on the server</h3>
<p>A client-only app must download, parse and run JavaScript before showing the main content. Server rendering or static generation for landing pages typically cuts LCP by a second or more on mid-range phones.</p>
<h2>Interaction to Next Paint: long tasks are the enemy</h2>
<p>INP measures how quickly the page responds to taps and clicks. Poor INP almost always traces back to long JavaScript tasks on the main thread.</p>
<ul>
<li>Audit third-party scripts. Tag managers, chat widgets and A/B testing tools are frequent offenders. Load them after interaction or remove them.</li>
<li>Split work. Break large renders and data processing into smaller chunks, and yield to the browser between them.</li>
<li>Keep React lean. Avoid re-rendering whole pages on every keystroke, virtualise long lists and move expensive calculations out of render.</li>
</ul>
<h2>Cumulative Layout Shift: reserve the space</h2>
<p>Layout shift is the easiest metric to fix and the most annoying for users. Give every image and video explicit dimensions or an aspect ratio. Reserve space for ads, banners and embeds before they load. Avoid inserting content above what the user is reading, such as cookie bars that push the page down instead of overlaying it.</p>
<h2>Do not forget the back end</h2>
<p>Frontend teams often own the Core Web Vitals project, but a slow server response sinks every other improvement. Time to First Byte above 800 milliseconds leaves almost no budget for rendering. Cache rendered pages and API responses at the edge where content allows, add indexes for the queries behind your most visited pages and keep database connections pooled. On one content site, moving the homepage to a cached, revalidated response cut TTFB from 1.2 seconds to 90 milliseconds, and LCP followed it down.</p>
<h3>Images deserve their own pipeline</h3>
<p>Uploading a 5 MB photo from a phone and serving it untouched is still common. Convert uploads to modern formats when they arrive, generate a few sizes and store dimensions alongside the file so templates can always set width and height. It is a one-time investment that keeps every future page fast, no matter who publishes the content.</p>
<h2>Budget and automate</h2>
<p>Improvements decay without guardrails. Add performance budgets to CI that fail the build when bundle size or lab metrics regress beyond a threshold. Track field metrics on a dashboard reviewed in sprint demos, so performance stays a product concern rather than a one-off project.</p>
<h2>What the results look like</h2>
<p>On a recent marketplace project, these steps took mobile LCP from 4.1 seconds to 1.8, INP from 380 milliseconds to 140 and CLS from 0.21 to 0.02. Organic traffic grew 18 percent over the following quarter, and conversion on mobile rose by 9 percent. None of the changes required a rewrite. They required prioritisation, measurement and the discipline to keep the gains.</p>
<p>If your site feels slower than it should, start with field data, fix the hero, hunt down long tasks and reserve space for everything that loads late. That sequence has not let us down yet.</p>`,
  },
  {
    title: "Designing a design system your engineers will actually use",
    slug: "design-system-engineers-will-use",
    category: "Design", tags: ["Design Systems", "UI/UX", "Frontend"], author: "editor", daysAgo: 19,
    excerpt: "Most design systems die as beautiful Figma files. The ones that survive are built as products, with engineers as their first customers.",
    content: `
<p>We have inherited many design systems over the years. The majority shared a fate: a beautiful Figma library, a component package that drifted out of sync within months and engineers who quietly went back to writing one-off styles. The systems that thrived were treated differently. They were run as products, and engineers were their first customers.</p>
<h2>Start from the code you already have</h2>
<p>Before designing anything new, inventory what exists in production. Screenshot every button, input and card. You will usually find a dozen shades of grey and five button heights. This audit gives you two things: a list of real needs and a persuasive slide for stakeholders.</p>
<h2>Tokens are the foundation</h2>
<p>Design tokens are named decisions: colour, spacing, radius, typography, shadow and motion. Define them once and use them everywhere, in Figma variables and in code as CSS variables.</p>
<h3>Name by role, not by value</h3>
<p>A token called blue-500 tells you nothing about where to use it. A token called text-muted or surface-raised describes intent, survives rebranding and makes dark mode almost free, because each role simply gets a different value per theme.</p>
<h3>Keep the scale small</h3>
<p>Eight spacing steps and six type sizes cover nearly every interface. Fewer options mean faster decisions and more consistent screens.</p>
<h2>Build components with engineers, not for them</h2>
<p>Pair a designer and an engineer on each core component. The designer brings states, accessibility and behaviour. The engineer brings the API, composition patterns and performance. Together they produce a component that is pleasant to use in code, which is what decides whether it gets adopted.</p>
<ul>
<li>Document every state: default, hover, focus, active, disabled, loading, error.</li>
<li>Make accessibility the default: labels, focus rings, keyboard support and sensible ARIA.</li>
<li>Prefer composition over configuration. Ten boolean props are a warning sign.</li>
</ul>
<h2>Documentation that answers real questions</h2>
<p>Engineers do not read essays. They want to know which component to use, how to use it and what not to do. Each component page should open with a live example, show the props and include short do and don't guidance with visuals. Link the Figma component and the source code from the same page.</p>
<h2>Governance without bureaucracy</h2>
<p>A system needs owners, but not a committee. We recommend a small core team that reviews contributions weekly, a clear process for proposing new components and a changelog that product teams actually read. Versioning matters: breaking changes should be rare, announced early and accompanied by codemods where possible.</p>
<h2>Plan the migration, not just the library</h2>
<p>A new system is only useful once it replaces what is already in production, and nobody gets a quarter off to restyle every screen. We migrate opportunistically: any screen touched by a feature gets moved to system components as part of that work. High-traffic flows such as sign-up and checkout are migrated deliberately, with before and after usability checks.</p>
<h3>Make the right thing the easy thing</h3>
<p>Lint rules that flag raw colour values, editor snippets for common layouts and page templates that already use the system all lower the cost of doing the right thing. When using the system is faster than not using it, adoption takes care of itself.</p>
<h3>Leave room for exceptions</h3>
<p>Marketing pages and experiments sometimes need to break the rules. Allow it explicitly, keep those exceptions in a clearly named place and review them each quarter. Successful experiments graduate into the system; the rest are deleted.</p>
<h2>Measure adoption</h2>
<p>Treat adoption as the key metric. Scan repositories for usage of system components versus custom ones, track the number of hard-coded colours and spacing values over time and ask teams quarterly what slows them down. On one client, adoption went from 30 to 85 percent of screens in six months once we published these numbers in sprint reviews.</p>
<h2>The payoff</h2>
<p>A healthy design system makes new features faster to design and build, makes accessibility consistent and lets a brand evolve without a rewrite. It also changes the relationship between design and engineering: fewer pixel debates, more conversations about the user. That alone is worth the investment.</p>`,
  },
];
