const ul = (items: string[]) => `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;

export const jobs = () => [
  {
    title: "Senior Full-Stack Engineer (React + Node)", slug: "senior-full-stack-engineer", department: "Engineering", location: "Bengaluru / Remote (India)",
    type: "FULL_TIME" as const, experience: "5+ years", salary: "INR 32 to 45 LPA", status: "OPEN" as const, daysAgo: 4,
    summary: "Lead features end to end on client products, from schema design to polished UI, in a small senior team.",
    description: "<p>You'll join a cross-functional team of four to six people building products for fintech and logistics clients. You'll own features end to end, talk directly with client stakeholders and help shape architecture.</p><h3>What you'll do</h3>" +
      ul(["Design and build APIs in Node.js and TypeScript", "Build accessible, fast interfaces in React", "Review code and mentor mid-level engineers", "Join Friday demos with clients"]),
    requirements: ul(["5+ years building production web applications", "Strong TypeScript, React and Node.js", "Solid SQL and data modelling", "Clear written communication in English", "Nice to have: AWS or GCP, testing culture, open source work"]),
  },
  {
    title: "DevOps Engineer (Kubernetes, Terraform)", slug: "devops-engineer", department: "Cloud & DevOps", location: "Remote (India)",
    type: "FULL_TIME" as const, experience: "3+ years", salary: "INR 24 to 34 LPA", status: "OPEN" as const, daysAgo: 9,
    summary: "Build and run reliable cloud platforms for clients on AWS and GCP with infrastructure as code.",
    description: "<p>Help our clients run software that stays up and costs what it should. You'll design platforms, automate pipelines and set up observability.</p><h3>What you'll do</h3>" +
      ul(["Provision infrastructure with Terraform", "Operate Kubernetes clusters", "Build CI/CD pipelines and preview environments", "Define SLOs and alerting with client teams"]),
    requirements: ul(["3+ years in DevOps or platform roles", "Hands-on Kubernetes and Terraform", "Experience with AWS or GCP", "Comfortable with Linux, networking and scripting"]),
  },
  {
    title: "Product Designer", slug: "product-designer", department: "Design", location: "Bengaluru (Hybrid)",
    type: "FULL_TIME" as const, experience: "4+ years", salary: "INR 20 to 30 LPA", status: "OPEN" as const, daysAgo: 14,
    summary: "Shape complex B2B and consumer products through research, interaction design and design systems.",
    description: "<p>You'll lead design on one or two client products at a time, running research, designing flows and maintaining design systems shared with engineering.</p>" +
      ul(["Plan and run user interviews and usability tests", "Design flows, prototypes and high-fidelity UI", "Contribute to design systems in Figma and code"]),
    requirements: ul(["4+ years of product design experience", "A portfolio showing process, not only visuals", "Strong interaction design and accessibility knowledge", "Experience working closely with engineers"]),
  },
  {
    title: "Software Engineering Intern", slug: "software-engineering-intern", department: "Engineering", location: "Bengaluru",
    type: "INTERN" as const, experience: "Final-year students", salary: "INR 40,000 per month", status: "OPEN" as const, daysAgo: 20,
    summary: "A six-month paid internship working on real client projects, with a path to a full-time role.",
    description: "<p>Work alongside senior engineers on production code from your first week. Most interns join us full time after the programme.</p>" +
      ul(["Ship features with code review and mentoring", "Learn testing, CI/CD and cloud basics", "Present your work in client demos"]),
    requirements: ul(["Final-year student or recent graduate", "Good fundamentals in JavaScript or Python", "Projects you can show us, from college or personal work", "Curiosity and willingness to learn"]),
  },
  {
    title: "Machine Learning Engineer", slug: "machine-learning-engineer", department: "AI & Automation", location: "Remote",
    type: "CONTRACT" as const, experience: "4+ years", salary: null, status: "CLOSED" as const, daysAgo: 60,
    summary: "Build retrieval, evaluation and LLM pipelines for client AI features.",
    description: "<p>This role has been filled. Thank you to everyone who applied.</p>",
    requirements: ul(["4+ years in ML engineering", "Python, vector search, evaluation"]),
  },
];

export const applicants = [
  { name: "Rohan Gupta", email: "rohan.gupta@example.com", job: "senior-full-stack-engineer", status: "NEW" as const, daysAgo: 1 },
  { name: "Neha Sharma", email: "neha.sharma@example.com", job: "product-designer", status: "REVIEWING" as const, daysAgo: 3 },
  { name: "Arjun Menon", email: "arjun.menon@example.com", job: "devops-engineer", status: "SHORTLISTED" as const, daysAgo: 6 },
  { name: "Kavya Reddy", email: "kavya.reddy@example.com", job: "software-engineering-intern", status: "NEW" as const, daysAgo: 8 },
  { name: "Imran Khan", email: "imran.khan@example.com", job: "senior-full-stack-engineer", status: "REJECTED" as const, daysAgo: 12 },
  { name: "Sneha Pillai", email: "sneha.pillai@example.com", job: "software-engineering-intern", status: "NEW" as const, daysAgo: 15 },
  { name: "Aditya Joshi", email: "aditya.joshi@example.com", job: "devops-engineer", status: "REVIEWING" as const, daysAgo: 22 },
];

export const messages = [
  { name: "Elena Rossi", email: "elena@verdantfoods.example", company: "Verdant Foods", subject: "Rebuilding our ordering app",
    message: "We run a grocery delivery app in three cities and our current React Native app is slow and crashes on older Android phones. Could we talk about a rebuild or a rescue plan?", daysAgo: 0, isRead: false },
  { name: "Rahul Bansal", email: "rahul@ledgerly.example", company: "Ledgerly", subject: "SOC 2 readiness",
    message: "We're a 25-person fintech preparing for SOC 2 Type 1 next quarter. Looking for help with a gap assessment and fixing what you find.", daysAgo: 2, isRead: false },
  { name: "Grace Lee", email: "grace@northpoint.example", company: "Northpoint Clinics", subject: "Patient portal",
    message: "We want a patient portal for appointment booking and reports. Do you have healthcare experience and how do you handle data privacy?", daysAgo: 5, isRead: true },
  { name: "Omar Haddad", email: "omar@sandline.example", company: "Sandline", subject: "AI document extraction",
    message: "We process 3,000 shipping documents a day by hand. Interested in your document extraction work. Can you share a case study?", daysAgo: 9, isRead: true },
  { name: "Ishita Verma", email: "ishita.verma@example.com", company: null, subject: "Speaking at our meetup",
    message: "Would someone from your team like to speak at our Bengaluru frontend meetup next month about performance?", daysAgo: 17, isRead: true },
];
