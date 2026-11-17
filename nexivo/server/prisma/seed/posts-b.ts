import type { SeedPost } from "./posts-a.js";

export const postsB: SeedPost[] = [
  {
    title: "How we cut cloud bills by a third without touching features",
    slug: "cut-cloud-bills-by-a-third",
    category: "Cloud & DevOps", tags: ["AWS", "Kubernetes", "FinOps"], author: "admin", daysAgo: 27,
    excerpt: "Cloud cost problems are rarely about one big mistake. They are about hundreds of small defaults. Here is the review process we run for clients.",
    content: `
<p>When a client asks us to look at their cloud bill, they usually expect us to find one dramatic mistake. Occasionally we do: a forgotten GPU cluster or a logging pipeline storing every debug line forever. Much more often, the bill is the sum of hundreds of reasonable defaults that nobody revisited. This is the review process we run, and it typically finds 25 to 40 percent in savings.</p>
<h2>Step one: make costs visible</h2>
<p>You cannot optimise what you cannot attribute. We start by tagging every resource with owner, service and environment, and enforce the tags in infrastructure as code. Then we build a dashboard that breaks spend down by team and service, updated daily. Visibility alone changes behaviour; teams start asking why staging costs as much as production.</p>
<h2>Step two: rightsize compute</h2>
<p>Most workloads are provisioned for a peak that rarely arrives. We compare requested CPU and memory with actual usage over a month.</p>
<h3>Kubernetes specifics</h3>
<p>In Kubernetes, inflated resource requests waste capacity even when pods are idle, because the scheduler reserves what is requested. Setting requests from real percentiles, enabling the cluster autoscaler and using a mix of on-demand and spot nodes for stateless services usually reduces node count by a third.</p>
<h3>Databases</h3>
<p>Managed databases are often the largest single line item. Check whether read replicas are still needed, whether storage is over-provisioned and whether a newer instance generation offers the same performance for less.</p>
<h2>Step three: commit for what is stable</h2>
<p>Once usage is rightsized, commit to the stable baseline with savings plans or committed-use discounts. Committing before rightsizing locks in waste, which is why this step comes third.</p>
<h2>Step four: fix the architecture hot spots</h2>
<ul>
<li><strong>Data transfer:</strong> cross-zone and internet egress charges hide in plain sight. Keep chatty services in the same zone and put a CDN in front of public assets.</li>
<li><strong>Logs and metrics:</strong> set retention by value. Debug logs rarely need more than a week; audit logs may need years in cheap storage.</li>
<li><strong>Idle environments:</strong> schedule non-production environments to shut down outside working hours.</li>
</ul>
<h3>Storage and snapshots</h3>
<p>Object storage feels cheap per gigabyte, but years of uncompressed exports, duplicate uploads and old build artefacts add up. Lifecycle rules that move rarely read objects to infrequent-access tiers and delete temporary files after a set period are easy wins. The same goes for disk snapshots: many accounts keep daily snapshots forever because nobody configured a retention policy.</p>
<h3>Managed services versus self-hosting</h3>
<p>It is tempting to replace managed services with self-hosted alternatives to save money. Sometimes that is right, but include the engineering time to patch, monitor and upgrade them. We usually recommend keeping databases and queues managed, and saving on compute and data movement instead, where the trade-off is far clearer.</p>
<h2>Step five: keep it from creeping back</h2>
<p>Savings fade without guardrails. We add budget alerts per team, a monthly cost review in the engineering calendar and cost checks in pull requests for infrastructure changes. Engineers see the cost impact of a change before it merges, not three weeks later on an invoice.</p>
<h2>A real example</h2>
<p>For a logistics client running on Google Cloud, this process cut monthly spend by 34 percent over eight weeks. The biggest wins were rightsizing Kubernetes requests, moving batch jobs to spot instances, reducing log retention and removing two forgotten staging databases. Not a single customer-facing feature changed, and reliability improved because the cluster was finally sized from real data.</p>
<p>Cost work is not glamorous, but it compounds. Money saved on infrastructure is money available for the product, and the habits that keep costs down also make systems easier to understand.</p>`,
  },
  {
    title: "React Native or native? How we decide for each project",
    slug: "react-native-or-native",
    category: "Engineering", tags: ["Mobile", "React Native", "Architecture"], author: "editor", daysAgo: 36,
    excerpt: "There is no universal answer, but there is a repeatable way to decide. These are the questions we ask before writing the first line of mobile code.",
    content: `
<p>"Should we build in React Native or go native?" is one of the first questions in every mobile engagement. Online debates treat it as a matter of taste. In practice, the answer depends on a few concrete factors, and the wrong choice is expensive to undo. Here is how we decide.</p>
<h2>Question one: what does the app actually do?</h2>
<p>Most business apps are forms, lists, feeds, maps, payments and notifications. React Native handles these extremely well, and one codebase for iOS and Android usually reduces cost by 30 to 40 percent.</p>
<p>Native shines when the core experience depends on heavy graphics, real-time audio or video processing, complex gestures, deep platform integration such as widgets and watch apps, or background work the operating system tightly controls.</p>
<h2>Question two: who will maintain it?</h2>
<p>If your team is strong in TypeScript and React, React Native lets web engineers contribute to mobile and share business logic. If you already employ iOS and Android specialists, native keeps them productive. The best technology for the next five years is often the one your team can hire for and maintain.</p>
<h2>Question three: how fast do you need to learn?</h2>
<p>For an MVP that must prove demand, speed matters most. React Native with Expo gives us over-the-air updates, which means fixing a bug or adjusting copy without waiting for app store review. That feedback loop is invaluable in the first months.</p>
<h3>The performance myth</h3>
<p>Modern React Native, with its new architecture, runs smoothly for the vast majority of apps. Performance problems we see are almost always caused by unvirtualised lists, oversized images or excessive re-renders, the same issues that slow down native apps built carelessly.</p>
<h2>Question four: what is the escape hatch?</h2>
<p>Choosing React Native is not all or nothing. You can write native modules for the parts that need them, and embed native screens where required. We often start cross-platform and move specific features native when there is evidence they need it.</p>
<h2>Our decision matrix</h2>
<ul>
<li><strong>Choose React Native</strong> for content, commerce, fintech, booking, social and internal apps, especially with a web team and a need to iterate quickly.</li>
<li><strong>Choose native</strong> for camera-heavy, audio, AR, games, health sensor or deep platform integration, or when the team is already native.</li>
<li><strong>Choose a hybrid</strong> when most of the app is standard but one capability is demanding.</li>
</ul>
<h2>Costs over the full lifetime</h2>
<p>Build cost is only part of the picture. Two native codebases mean two sets of features to keep in sync, two release trains and two teams to staff. Over three years, maintenance usually costs more than the initial build. React Native narrows that gap, but it has its own upkeep: framework upgrades, native dependency updates and occasional platform-specific bugs. We budget roughly one sprint per quarter for upgrades on cross-platform apps, and plan for it from the start.</p>
<h3>Sharing code with the web</h3>
<p>Teams that also run a web product can share validation, API clients, state management and design tokens between web and mobile. On a recent fintech app this removed an entire class of bugs where the web and mobile apps disagreed about business rules, because they were literally running the same code.</p>
<h3>Hiring and onboarding</h3>
<p>React and TypeScript developers are easier to find than experienced iOS and Android engineers in most markets, and they can be productive on a React Native codebase within a couple of weeks. That matters when you need to grow a team quickly after a funding round.</p>
<h2>What matters more than the framework</h2>
<p>Whatever you choose, the factors that decide quality are the same: offline behaviour, sensible caching, accessibility, crash reporting, automated release pipelines and staged rollouts. An app on the right framework without these will still disappoint users.</p>
<p>Our advice is simple: be honest about what the app needs to do, who will maintain it and how quickly you need to learn. The framework decision usually becomes obvious after that.</p>`,
  },
  {
    title: "Security basics every startup should have before Series A",
    slug: "startup-security-basics-before-series-a",
    category: "Engineering", tags: ["Security", "Compliance", "Startups"], author: "admin", daysAgo: 45,
    excerpt: "You do not need a security team to be secure. You need a short list of habits, applied consistently. Here is ours.",
    content: `
<p>Early-stage startups rarely have a security engineer, and they do not need one to avoid the most common breaches. What they need is a short list of habits applied consistently. Investors and enterprise customers increasingly ask about these in due diligence, so they also make commercial sense. This is the baseline we help clients put in place.</p>
<h2>Identity and access</h2>
<p>Most incidents start with a compromised account, not a clever exploit.</p>
<ul>
<li>Enforce single sign-on and multi-factor authentication for email, code hosting, cloud consoles and every admin tool.</li>
<li>Give people the least access they need, and review it quarterly. Remove access the same day someone leaves.</li>
<li>Never share root or owner accounts. Lock them away and alert on any use.</li>
</ul>
<h2>Secrets management</h2>
<p>API keys in source code are still the most common finding in our reviews. Store secrets in a managed secret store, inject them at runtime and rotate anything that has ever been committed. Add secret scanning to your repositories so new leaks are blocked before they merge.</p>
<h2>Application security</h2>
<h3>Validate everything at the edge</h3>
<p>Treat every input as hostile. Validate request bodies, query strings and file uploads against strict schemas, check file types by their content rather than their extension and sanitise any HTML you store. Most injection and cross-site scripting bugs disappear with these habits.</p>
<h3>Authenticate carefully</h3>
<p>Use proven libraries, hash passwords with a slow algorithm like bcrypt or Argon2, store session tokens in httpOnly cookies and rate-limit login endpoints. Return the same error for a wrong email and a wrong password so attackers cannot enumerate users.</p>
<h3>Keep dependencies current</h3>
<p>Enable automated dependency updates and vulnerability alerts. Patch critical issues within days, not quarters.</p>
<h2>Infrastructure</h2>
<p>Define infrastructure as code so every change is reviewed. Keep databases off the public internet, encrypt data at rest and in transit and turn on audit logging in your cloud provider. Back up critical data and, importantly, test that you can restore it.</p>
<h2>Detection and response</h2>
<p>You will not prevent everything, so make sure you would notice. Centralise logs, alert on suspicious events such as unusual admin logins and write a one-page incident plan: who decides, who communicates and how to reach them at 2 a.m.</p>
<h2>People and process</h2>
<p>Technology covers only part of the risk. Phishing remains the most reliable way into a company, so run short, practical training twice a year and make reporting a suspicious email easy and blame-free. Laptops should have disk encryption, automatic updates and screen locks, managed centrally once you pass a dozen people.</p>
<h3>Vendors and data</h3>
<p>Keep a simple list of every third-party service that touches customer data, what data it holds and who owns the relationship. When a vendor reports a breach, this list turns a panic into a fifteen-minute task. Collect only the personal data you actually need, and set retention periods so old data does not quietly accumulate risk.</p>
<h3>Security reviews in the workflow</h3>
<p>Add a short security checklist to pull requests that touch authentication, payments or file uploads, and schedule an external penetration test before major launches or enterprise deals. Fixing issues found in review costs a fraction of fixing them after an incident.</p>
<h2>Compliance as a by-product</h2>
<p>Frameworks such as SOC 2 and ISO 27001 mostly ask you to prove you do the things above. If you build the habits first, certification becomes an exercise in documentation rather than a scramble. For Indian startups, the DPDP Act adds clear obligations around consent and data minimisation that are far easier to meet early.</p>
<h2>Start this week</h2>
<p>Turn on multi-factor authentication everywhere, scan your repositories for secrets and write down who has admin access to what. Those three steps alone close the doors most attackers walk through. The rest can follow sprint by sprint.</p>`,
  },
];

/** A draft, used to prove that unpublished posts never reach the public site. */
export const draftPost: SeedPost = {
  title: "Inside our 2027 engineering handbook",
  slug: "engineering-handbook-2027",
  category: "Company", tags: ["Culture"], author: "admin", daysAgo: 1,
  excerpt: "A preview of how we plan to work next year. Draft, not yet published.",
  content: "<h2>Why a handbook</h2><p>We are writing down how we work so new teammates can contribute from their first week.</p><h3>What it covers</h3><p>Code review, on-call, design critiques and how we make technical decisions.</p>",
};
