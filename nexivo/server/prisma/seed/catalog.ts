import { avatar, cover, logo } from "./assets.js";

const svc = (title: string, slug: string, icon: string, shortDesc: string, intro: string, features: string[], body: [string, string][], palette: number) => ({
  title, slug, icon, shortDesc, features, image: cover(`service-${slug}.svg`, palette, palette % 3 === 0 ? "orbits" : palette % 3 === 1 ? "bars" : "nodes"),
  description: `<p>${intro}</p>${body.map(([h, p]) => `<h2>${h}</h2><p>${p}</p>`).join("")}`,
});

export const services = () => [
  svc("Web Development", "web-development", "code",
    "Fast, accessible web platforms and SaaS products built on React, Next.js and Node, ready for real traffic from day one.",
    "From marketing sites that load in under a second to multi-tenant SaaS platforms, we build web products that are fast, secure and pleasant to maintain.",
    ["Next.js and React applications", "Node.js and Go APIs", "Headless CMS and e-commerce", "Performance and Core Web Vitals audits", "Accessibility (WCAG 2.2 AA)"],
    [["What we build", "Customer portals, internal tools, marketplaces, dashboards and complete SaaS products, typically on React and TypeScript with Node.js or Go services behind them."],
     ["How we build it", "Typed end to end, tested at the right layers and deployed through CI/CD pipelines with preview environments for every pull request, so stakeholders can review real software, not screenshots."],
     ["What you get", "A codebase your team can own: documented architecture decisions, a design system in code, monitoring dashboards and a handover plan."]], 0),
  svc("Mobile Apps", "mobile-apps", "smartphone",
    "Native-quality iOS and Android apps with React Native or Swift and Kotlin, from MVP to millions of installs.",
    "We design and build mobile apps people keep on their home screen: quick to open, reliable offline and respectful of battery and data.",
    ["React Native and Expo", "Native Swift and Kotlin", "Offline-first sync", "Push, payments and deep links", "App Store and Play Store releases"],
    [["Cross-platform without compromise", "Most products ship faster with React Native. When you need native APIs, heavy graphics or the last bit of performance, our Swift and Kotlin engineers go native."],
     ["Release engineering", "Automated builds, over-the-air updates, crash reporting and staged rollouts keep releases boring in the best way."]], 1),
  svc("Cloud & DevOps", "cloud-devops", "cloud",
    "Infrastructure as code, CI/CD and observability on AWS and GCP that cut cloud bills and pager noise.",
    "We design cloud platforms that scale automatically, recover on their own and cost what they should.",
    ["AWS and Google Cloud architecture", "Kubernetes and serverless", "Terraform and GitOps", "Observability and SLOs", "Cost optimisation reviews"],
    [["Platform engineering", "Golden paths for your developers: templates, pipelines and environments that make the right way the easy way."],
     ["Reliability", "SLOs, alerting that pages only for real problems, runbooks and game days. We've taken clients from monthly outages to 99.95% uptime."],
     ["Cost", "Most audits find 25 to 40 percent savings through rightsizing, reserved capacity and architecture fixes."]], 2),
  svc("AI & Automation", "ai-automation", "sparkles",
    "Production LLM features, document intelligence and workflow automation that save hours, measured and monitored.",
    "We help teams move from AI demos to dependable features with evaluation, guardrails and costs under control.",
    ["LLM features and copilots", "Retrieval-augmented generation (RAG)", "Document extraction pipelines", "Workflow and back-office automation", "Evaluation and monitoring"],
    [["Start with the workflow", "We find the repetitive, high-volume tasks where automation pays back fastest, then prototype against your real data in days."],
     ["Make it dependable", "Evaluation sets, guardrails, fallbacks and human-in-the-loop review ensure the feature behaves on the hundredth request, not just the first."]], 3),
  svc("UI/UX Design", "ui-ux-design", "pen-tool",
    "Research-led product design and design systems that make complex software feel simple.",
    "Good design is how a product works, not just how it looks. We combine research, interaction design and visual craft.",
    ["User research and usability testing", "Product and interaction design", "Design systems in Figma and code", "Prototyping", "Brand and marketing sites"],
    [["Research that changes decisions", "Interviews, analytics and usability tests reveal where users struggle, before engineering time is spent."],
     ["Systems, not screens", "We deliver a design system with tokens and components shared between Figma and code, so the product stays consistent as it grows."]], 4),
  svc("Cybersecurity", "cybersecurity", "shield-check",
    "Security reviews, penetration testing and compliance readiness for SOC 2, ISO 27001 and DPDP.",
    "Security that fits how your team ships: practical controls, clear priorities and fixes, not just reports.",
    ["Application security reviews", "Penetration testing", "Cloud security posture", "SOC 2 and ISO 27001 readiness", "Secure SDLC training"],
    [["Find what matters", "We test like an attacker would, then rank findings by real-world risk to your business."],
     ["Fix it together", "Our engineers pair with yours to remediate, add automated checks to CI and keep you audit-ready."]], 5),
];

export const testimonials = () => [
  { name: "Ananya Rao", role: "CTO", company: "Fernhill Bank", rating: 5, avatar: avatar("Ananya Rao", 0),
    quote: "Nexivo rebuilt our onboarding flow in eleven weeks. Account opening time dropped from four days to twenty minutes, and their team left our engineers better than they found them." },
  { name: "Daniel Okafor", role: "VP Engineering", company: "Kestrel Logistics", rating: 5, avatar: avatar("Daniel Okafor", 2),
    quote: "They took over a platform nobody wanted to touch and turned it into the most reliable system we run. Our on-call pages went from daily to almost never." },
  { name: "Meera Iyer", role: "Founder & CEO", company: "Aurelia Health", rating: 5, avatar: avatar("Meera Iyer", 3),
    quote: "As a non-technical founder I needed a partner who would tell me the truth. Nexivo cut our MVP scope in half, launched on time and the app is still the backbone of our business." },
  { name: "Lukas Brandt", role: "Head of Product", company: "Quanta Retail", rating: 5, avatar: avatar("Lukas Brandt", 5),
    quote: "Their AI team shipped a support copilot that resolves 38% of tickets on its own. More impressive was how carefully they measured quality before we let it near customers." },
];

export const team = () => [
  { name: "Aarav Mehta", role: "Co-founder & CEO", photo: avatar("Aarav Mehta", 0), linkedin: "https://www.linkedin.com/",
    bio: "Former principal engineer who has led platform teams for fifteen years. Still reviews architecture docs every week." },
  { name: "Sara Kapoor", role: "Co-founder & Head of Design", photo: avatar("Sara Kapoor", 3), linkedin: "https://www.linkedin.com/",
    bio: "Design leader focused on research-led product design and design systems for complex software." },
  { name: "Vikram Nair", role: "CTO", photo: avatar("Vikram Nair", 2), linkedin: "https://www.linkedin.com/",
    bio: "Distributed systems engineer who runs our cloud and AI practices. Happiest when latency graphs go down." },
  { name: "Priya Desai", role: "Director of Delivery", photo: avatar("Priya Desai", 1), linkedin: "https://www.linkedin.com/",
    bio: "Keeps every project on track with calm planning, honest reporting and a sharp eye for risk." },
];

export const clients = () => [
  ["Fernhill Bank", "ring"], ["Kestrel Logistics", "diamond"], ["Aurelia Health", "wave"], ["Quanta Retail", "bars"],
  ["Orbitly", "dot"], ["Helio Energy", "hex"], ["Marlowe & Co", "ring"], ["Tidewater Labs", "wave"],
].map(([name, mark]) => ({ name, logo: logo(name, mark as Parameters<typeof logo>[1]) }));

export const projects = () => [
  { title: "Twenty-minute account opening for a digital bank", slug: "fernhill-digital-onboarding", client: "Fernhill Bank", industry: "Fintech",
    summary: "We rebuilt Fernhill's onboarding with video KYC, instant verification and a design system that now powers all their apps.",
    cover: cover("project-fernhill.svg", 0, "orbits"), techStack: ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS"],
    metrics: [{ value: "20 min", label: "Account opening, down from 4 days" }, { value: "+63%", label: "Completed sign-ups" }, { value: "11 wks", label: "Kickoff to launch" }],
    content: "<h2>The challenge</h2><p>Fernhill's paper-heavy onboarding took four days and lost more than half of applicants along the way.</p><h2>What we did</h2><p>We mapped every step with compliance, replaced manual checks with automated verification and designed a mobile-first flow with video KYC. A shared design system let three product teams adopt the new patterns quickly.</p><h2>The result</h2><p>Accounts now open in about twenty minutes and completed sign-ups grew by 63 percent in the first quarter.</p>" },
  { title: "A logistics platform that stopped paging at 3 a.m.", slug: "kestrel-platform-reliability", client: "Kestrel Logistics", industry: "Logistics",
    summary: "We migrated Kestrel's dispatch platform to Kubernetes, introduced SLOs and cut infrastructure costs by a third.",
    cover: cover("project-kestrel.svg", 2, "bars"), techStack: ["Go", "Kubernetes", "Terraform", "GCP", "Grafana"],
    metrics: [{ value: "99.97%", label: "Uptime over 12 months" }, { value: "-34%", label: "Cloud spend" }, { value: "-90%", label: "Pager alerts" }],
    content: "<h2>The challenge</h2><p>A monolith on hand-built servers handled 40,000 deliveries a day and failed under peak load.</p><h2>What we did</h2><p>We containerised the platform, moved it to GKE with Terraform, split the hottest paths into Go services and built dashboards around customer-facing SLOs.</p><h2>The result</h2><p>Uptime of 99.97 percent through two peak seasons, a third less cloud spend and an on-call rotation that finally sleeps.</p>" },
  { title: "An AI copilot that resolves 38% of support tickets", slug: "quanta-support-copilot", client: "Quanta Retail", industry: "Retail",
    summary: "A retrieval-augmented support assistant grounded in Quanta's catalogue and policies, with human review built in.",
    cover: cover("project-quanta.svg", 3, "nodes"), techStack: ["Python", "LangGraph", "OpenAI API", "pgvector", "React"],
    metrics: [{ value: "38%", label: "Tickets resolved automatically" }, { value: "4.7/5", label: "Customer satisfaction" }, { value: "6 wks", label: "To production" }],
    content: "<h2>The challenge</h2><p>Support volume doubled during sales events and response times stretched to two days.</p><h2>What we did</h2><p>We built a retrieval pipeline over policies, orders and the product catalogue, wrote an evaluation set of 600 real tickets and shipped a copilot that drafts answers for agents before automating the safest categories.</p><h2>The result</h2><p>38 percent of tickets are now resolved without an agent, with satisfaction scores higher than before.</p>" },
];
