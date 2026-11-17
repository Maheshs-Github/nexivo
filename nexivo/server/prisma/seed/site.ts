import { cover } from "./assets.js";

export const settings = () => ({
  general: {
    siteName: "Nexivo Technologies",
    tagline: "Engineering what's next.",
    description: "Nexivo is a product engineering studio that designs, builds and scales web platforms, mobile apps, cloud infrastructure and AI systems for ambitious companies.",
    logo: "", favicon: "/favicon.svg",
    announcement: "Our 2026 field guide to shipping AI features in production",
    announcementUrl: "/blog/shipping-llm-features-to-production",
  },
  contact: {
    email: "hello@nexivo.dev", salesEmail: "projects@nexivo.dev", careersEmail: "careers@nexivo.dev",
    phone: "+91 80 4567 2190", whatsapp: "+91 98450 21900",
    address: "Level 7, Meridian Works, 24 Residency Road", city: "Bengaluru 560025, India",
    hours: "Mon to Fri, 9:30 to 18:30 IST",
    mapEmbedUrl: "https://www.openstreetmap.org/export/embed.html?bbox=77.5946%2C12.9628%2C77.6146%2C12.9768&layer=mapnik&marker=12.9698%2C77.6046",
  },
  social: {
    linkedin: "https://www.linkedin.com/company/nexivo-technologies", x: "https://x.com/nexivotech", github: "https://github.com/nexivo",
    instagram: "", dribbble: "https://dribbble.com/nexivo", youtube: "",
  },
  footer: {
    about: "A senior team of engineers and designers shipping software that holds up under real traffic, real users and real deadlines.",
    copyright: "Nexivo Technologies Pvt. Ltd. All rights reserved.",
    ctaHeading: "Have a product in mind?", ctaText: "Tell us where you are. We reply within one business day with next steps.",
    ctaLabel: "Start a project", ctaUrl: "/contact",
  },
  theme: { accent: "#6366F1", defaultMode: "dark" },
  seo: {
    titleTemplate: "%s · Nexivo Technologies", defaultTitle: "Nexivo Technologies · Product engineering studio",
    defaultDescription: "We design, build and scale web platforms, mobile apps, cloud infrastructure and AI products for ambitious teams.",
    ogImage: cover("og-default.svg", 0, "orbits"), twitterHandle: "@nexivotech",
    keywords: "software development company, web development, mobile app development, cloud devops, AI automation, UI UX design",
  },
  pages: {
    notFoundTitle: "This page took a wrong turn",
    notFoundText: "The link may be outdated or the page has moved. Let's get you back to something useful.",
    applySuccessTitle: "Application received",
    applySuccessText: "Thanks for applying. Our hiring team reads every application and replies within five working days.",
    contactSuccessTitle: "Message sent",
    contactSuccessText: "Thanks for reaching out. A senior engineer from our team will reply within one business day.",
    closedJobTitle: "This position has been filled",
    closedJobText: "We're no longer accepting applications for this role, but we're always meeting great people. Take a look at our open positions.",
    contactFormHeading: "Tell us about your project",
    contactFormText: "Share a few details and we'll come back with questions, a rough plan and a realistic estimate.",
    applyFormIntro: "It takes about three minutes. We reply to every application.",
  },
});

export const nav = [
  { label: "Services", url: "/services", location: "HEADER" as const, order: 0 },
  { label: "About", url: "/about", location: "HEADER" as const, order: 1 },
  { label: "Blog", url: "/blog", location: "HEADER" as const, order: 2 },
  { label: "Careers", url: "/careers", location: "HEADER" as const, order: 3 },
  { label: "Contact", url: "/contact", location: "HEADER" as const, order: 4 },
  { label: "Web Development", url: "/services/web-development", location: "FOOTER" as const, group: "Services", order: 0 },
  { label: "Mobile Apps", url: "/services/mobile-apps", location: "FOOTER" as const, group: "Services", order: 1 },
  { label: "Cloud & DevOps", url: "/services/cloud-devops", location: "FOOTER" as const, group: "Services", order: 2 },
  { label: "AI & Automation", url: "/services/ai-automation", location: "FOOTER" as const, group: "Services", order: 3 },
  { label: "About us", url: "/about", location: "FOOTER" as const, group: "Company", order: 4 },
  { label: "Careers", url: "/careers", location: "FOOTER" as const, group: "Company", order: 5 },
  { label: "Blog", url: "/blog", location: "FOOTER" as const, group: "Company", order: 6 },
  { label: "Contact", url: "/contact", location: "FOOTER" as const, group: "Company", order: 7 },
];

type S = { type: string; label?: string; content: Record<string, unknown> };

const home: S[] = [
  { type: "HERO", content: {
    eyebrow: "Product engineering studio",
    headline: "We build software that moves companies forward",
    highlight: "moves companies forward",
    subheadline: "Nexivo is a senior team of engineers and designers. We take products from first sketch to millions of requests a day across web, mobile, cloud and AI, with clear weekly progress you can see.",
    primaryCta: { label: "Start a project", href: "/contact" },
    secondaryCta: { label: "See our work", href: "/services" },
    trustNote: "Trusted by 60+ product teams across fintech, health and logistics",
    badges: ["Web platforms", "Mobile apps", "Cloud & DevOps", "AI systems"],
  } },
  { type: "CLIENTS", content: { heading: "Teams we've shipped with" } },
  { type: "STATS", content: { items: [
    { value: 140, suffix: "+", label: "Products shipped" }, { value: 98, suffix: "%", label: "Client retention" },
    { value: 12, suffix: "", label: "Countries served" }, { value: 9, suffix: " yrs", label: "Building software" },
  ] } },
  { type: "SERVICES", content: {
    eyebrow: "Services", heading: "Everything you need to ship, under one roof",
    subheading: "Strategy, design, engineering and operations work as one team, so nothing gets lost between handoffs.",
    cta: { label: "Explore all services", href: "/services" },
  } },
  { type: "PROCESS", content: {
    eyebrow: "How we work", heading: "A process built for momentum",
    subheading: "Short cycles, honest demos and decisions made with data. You always know what shipped this week and what ships next.",
    steps: [
      { title: "Discovery", description: "We map your users, constraints and goals in focused workshops, then turn them into a scoped roadmap with clear milestones.", duration: "1 to 2 weeks" },
      { title: "Design", description: "Wireframes become a clickable prototype and a design system your engineers can build from directly.", duration: "2 to 4 weeks" },
      { title: "Build", description: "Two-week sprints with a live demo every Friday. CI/CD, code review and automated tests from day one.", duration: "Ongoing" },
      { title: "Launch & scale", description: "Staged rollouts, observability and on-call support. After launch we keep tuning performance, cost and conversion.", duration: "Ongoing" },
    ],
  } },
  { type: "CASE_STUDIES", content: {
    eyebrow: "Selected work", heading: "Outcomes, not just output",
    subheading: "A few recent engagements and the numbers our clients care about.", cta: { label: "Talk to us about yours", href: "/contact" },
  } },
  { type: "TESTIMONIALS", content: { eyebrow: "Testimonials", heading: "What our partners say" } },
  { type: "BLOGS", content: {
    eyebrow: "Insights", heading: "Notes from the build",
    subheading: "Practical writing on engineering, design and running software in production.", cta: { label: "Read the blog", href: "/blog" },
  } },
  { type: "FAQ", content: { eyebrow: "FAQ", heading: "Questions we hear often", items: [
    { question: "How quickly can you start?", answer: "Most engagements start within two weeks of signing. For urgent rescues we can put a senior engineer on your codebase within days." },
    { question: "Do you work with early-stage startups?", answer: "Yes. Around a third of our work is MVPs for funded startups. We help you cut scope to what proves the idea and build it so it can grow." },
    { question: "How do you price projects?", answer: "Fixed-scope projects get a fixed price after discovery. Ongoing product work is billed monthly per dedicated team, with no lock-in beyond a 30-day notice." },
    { question: "Who owns the code?", answer: "You do, from the first commit. Everything lives in your repositories and cloud accounts, and we document it so your team can take over at any point." },
  ] } },
  { type: "CTA", content: {
    eyebrow: "Let's build", heading: "Have an idea worth building? Let's make it real.",
    subheading: "Book a 30-minute call with a senior engineer. No sales script, just an honest look at your problem and how we'd approach it.",
    primaryCta: { label: "Book a call", href: "/contact" }, secondaryCta: { label: "hello@nexivo.dev", href: "mailto:hello@nexivo.dev" },
  } },
];

const about: S[] = [
  { type: "PAGE_HEADER", content: { eyebrow: "About Nexivo", heading: "A studio of builders who care how things work", subheading: "Since 2017 we've helped startups and enterprises turn ambitious ideas into dependable software, and stayed on to keep it running." } },
  { type: "STORY", content: {
    eyebrow: "Our story", heading: "Started in a two-desk office. Still obsessed with craft.",
    image: cover("about-studio.svg", 1, "nodes"), imageAlt: "Abstract illustration of connected nodes representing the Nexivo team",
    paragraphs: [
      "Nexivo began in 2017 when three engineers left large consultancies with a simple belief: clients deserve the people who actually write the code in the room, not layers of account managers.",
      "Today we are 70 engineers, designers and product people across Bengaluru and a remote team spread over five time zones. We still keep teams small and senior, and we still demo working software every Friday.",
      "We measure ourselves by what happens after launch: uptime, conversion, cost per request and how confidently our clients' own teams can extend what we built.",
    ],
    highlights: [{ value: "2017", label: "Founded" }, { value: "70+", label: "Team members" }, { value: "4.9/5", label: "Average client rating" }],
  } },
  { type: "MISSION_VISION", content: {
    eyebrow: "Why we exist", heading: "Mission and vision",
    mission: "To give every ambitious team access to senior engineering and design, delivered with the transparency and care of an in-house team.",
    vision: "A world where great software is not a privilege of the biggest companies, and every product we touch is faster, safer and kinder to its users.",
  } },
  { type: "VALUES", content: { eyebrow: "Values", heading: "How we make decisions", items: [
    { icon: "eye", title: "Radical transparency", description: "Shared boards, open repositories and honest estimates. Bad news travels fast so it can be fixed early." },
    { icon: "gauge", title: "Speed with standards", description: "We move quickly because we invest in tests, automation and review, not in spite of them." },
    { icon: "users", title: "Small senior teams", description: "Fewer handoffs, more ownership. Every engineer talks to users and understands the business goal." },
    { icon: "leaf", title: "Built to last", description: "Readable code, real documentation and sensible architecture your team can live with for years." },
  ] } },
  { type: "TIMELINE", content: { eyebrow: "Milestones", heading: "The road so far", items: [
    { year: "2017", title: "Nexivo is founded", description: "Three engineers, two desks and our first client: a logistics startup that still works with us today." },
    { year: "2019", title: "Mobile and design practice", description: "We opened a dedicated design team and shipped our first app to one million users." },
    { year: "2021", title: "Cloud & DevOps division", description: "AWS and GCP certified engineers joined to run infrastructure for clients at scale." },
    { year: "2023", title: "AI & Automation lab", description: "We began building production LLM features, from document intelligence to support copilots." },
    { year: "2026", title: "70 people, 12 countries", description: "A remote-first team serving clients across India, Europe, the Middle East and North America." },
  ] } },
  { type: "STATS", content: { items: [
    { value: 70, suffix: "+", label: "Engineers & designers" }, { value: 140, suffix: "+", label: "Products shipped" },
    { value: 99.95, suffix: "%", label: "Average uptime we run" }, { value: 12, label: "Countries served" },
  ] } },
  { type: "TEAM", content: { eyebrow: "Leadership", heading: "The people accountable for your project", subheading: "Every engagement has a partner from this group involved from kickoff to launch." } },
  { type: "TECH_STACK", content: { eyebrow: "Tech stack", heading: "Proven tools, chosen for the job", subheading: "We pick boring technology where reliability matters and new tools where they earn their place.", groups: [
    { name: "Frontend", items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Vite"] },
    { name: "Mobile", items: ["React Native", "Swift", "Kotlin", "Flutter"] },
    { name: "Backend", items: ["Node.js", "Go", "Python", "PostgreSQL", "MySQL", "Redis"] },
    { name: "Cloud & AI", items: ["AWS", "Google Cloud", "Kubernetes", "Terraform", "OpenAI API", "LangGraph"] },
  ] } },
  { type: "CTA", content: { heading: "Want to build with us, or join us?", subheading: "We're always happy to talk about products, and always looking for great engineers.", primaryCta: { label: "Start a project", href: "/contact" }, secondaryCta: { label: "See open roles", href: "/careers" } } },
];

const services: S[] = [
  { type: "PAGE_HEADER", content: { eyebrow: "Services", heading: "Senior teams for every layer of your product", subheading: "Pick a single capability or a full product team. Either way you get people who have done it before." } },
  { type: "SERVICES", content: { eyebrow: "What we do", heading: "Six practices, one team" } },
  { type: "PROCESS", content: { eyebrow: "Engagement", heading: "From first call to first release", steps: [
    { title: "Intro call", description: "A 30-minute conversation with a senior engineer about your goals and constraints.", duration: "Day 1" },
    { title: "Discovery sprint", description: "Workshops, technical audit and a prioritised roadmap with estimates.", duration: "Week 1 to 2" },
    { title: "Dedicated team", description: "A cross-functional team ships in two-week sprints with Friday demos.", duration: "Ongoing" },
  ] } },
  { type: "TESTIMONIALS", content: { eyebrow: "Proof", heading: "Teams that trusted us with their roadmap" } },
  { type: "CTA", content: { heading: "Not sure which service you need?", subheading: "Describe the problem. We'll suggest the smallest team that can solve it.", primaryCta: { label: "Get a recommendation", href: "/contact" } } },
];

const blog: S[] = [
  { type: "PAGE_HEADER", content: { eyebrow: "Blog", heading: "Notes from the build", subheading: "Engineering deep dives, design thinking and lessons from running software in production." } },
];

const careers: S[] = [
  { type: "PAGE_HEADER", content: { eyebrow: "Careers", heading: "Do the best work of your career, with people who care", subheading: "Small senior teams, real ownership and clients who value craft. Remote-friendly, based in Bengaluru." } },
  { type: "VALUES", content: { eyebrow: "Life at Nexivo", heading: "What you can expect", items: [
    { icon: "laptop", title: "Remote-friendly", description: "Work from our Bengaluru studio or from home. Core hours overlap, the rest is yours." },
    { icon: "graduation-cap", title: "Learning budget", description: "INR 75,000 a year for courses, books and conferences, plus a paid week to learn something new." },
    { icon: "heart-pulse", title: "Health first", description: "Comprehensive health insurance for you and your family, and mental health support." },
    { icon: "rocket", title: "Real ownership", description: "No ticket factories. You'll talk to users, shape scope and ship to production in your first month." },
  ] } },
  { type: "FAQ", content: { eyebrow: "Hiring process", heading: "How hiring works", items: [
    { question: "What are the interview steps?", answer: "A 30-minute intro call, a practical take-home or pairing session (your choice), a system design or portfolio conversation and a culture chat with a founder. We aim to finish within two weeks." },
    { question: "Do you hire freshers?", answer: "Yes, through our six-month internship programme, which converts to a full-time role for most interns." },
  ] } },
];

const contact: S[] = [
  { type: "PAGE_HEADER", content: { eyebrow: "Contact", heading: "Let's talk about what you're building", subheading: "Whether it's a new product, a rescue mission or a second opinion, a senior engineer will reply within one business day." } },
  { type: "FAQ", content: { eyebrow: "Before you write", heading: "Good to know", items: [
    { question: "What should I include in my message?", answer: "Your goal, rough timeline and any constraints such as budget, existing tech or compliance needs. Links to designs or documents help too." },
    { question: "Do you sign NDAs?", answer: "Yes, happily, before any detailed discussion. Just mention it in your message." },
  ] } },
];

export const sections = { HOME: home, ABOUT: about, SERVICES: services, BLOG: blog, CAREERS: careers, CONTACT: contact } as const;

export const pageSeo = () => [
  { page: "HOME" as const, title: "Nexivo Technologies · Product engineering studio", description: "Senior engineers and designers building web platforms, mobile apps, cloud infrastructure and AI products that scale." },
  { page: "ABOUT" as const, title: "About us", description: "Meet Nexivo: a studio of 70 builders in Bengaluru and remote, shipping dependable software since 2017." },
  { page: "SERVICES" as const, title: "Services", description: "Web development, mobile apps, cloud and DevOps, AI and automation, UI/UX design and cybersecurity from one senior team." },
  { page: "BLOG" as const, title: "Blog", description: "Engineering deep dives, design thinking and production lessons from the Nexivo team." },
  { page: "CAREERS" as const, title: "Careers", description: "Join Nexivo: remote-friendly roles in engineering, design and DevOps with real ownership and a learning budget." },
  { page: "CONTACT" as const, title: "Contact", description: "Tell us about your project. A senior engineer replies within one business day." },
];
