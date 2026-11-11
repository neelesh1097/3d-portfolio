export const resumeData = {
  name: "Neelesh Yadav",
  title: "Full-Stack Software Developer",
  subtitle: "B.Tech in Artificial Intelligence | Gurugram University (2022–2026)",
  location: "Gurugram, India",
  summary:
    "Full-Stack Software Developer with proven experience architecting scalable web applications using Next.js, TypeScript, Node.js, and PostgreSQL. Experienced in workflow-driven enterprise platforms, real-time collaboration systems, and performant REST APIs with a focus on maintainable, production-ready code.",
  
  socials: {
    github: "https://github.com/neelesh1097",
    linkedin: "https://linkedin.com/in/neelesh-yadav-a5988b292",
    email: "neelesh6kumar@gmail.com"
  },

  skills: [
    { category: "Frontend", items: ["JavaScript (ES6+)", "React.js", "Next.js", "TypeScript", "Tailwind CSS", "HTML5/CSS3"] },
    { category: "Backend & APIs", items: ["Node.js", "Express.js", "REST APIs", "WebSockets / WebRTC"] },
    { category: "Databases", items: ["PostgreSQL", "MongoDB", "Prisma / TypeORM"] },
    { category: "Languages & Tools", items: ["JavaScript", "TypeScript", "Java", "Git", "GitHub", "Postman", "VS Code"] }
  ],

  projects: [
    {
      id: "amt",
      title: "Audit Management Tool (AMT)",
      category: "Enterprise System",
      tech: ["Next.js", "TypeScript", "Node.js", "PostgreSQL"],
      tagline: "Workflow-Driven Enterprise Audit Lifecycle Platform",
      description:
        "Developed a comprehensive enterprise platform to streamline the full audit lifecycle. Engineered role-based access workflows supporting Super Admin, Admin, Auditor, and Auditee operations with complete data compliance.",
      highlights: [
        "Hierarchical task management covering tasks, sub-tasks, data submissions, review cycles, approvals, and progress tracking.",
        "Engineered reusable UI component library and executive dashboards for real-time audit visibility.",
        "Designed scalable frontend architecture and performant PostgreSQL schemas to handle complex enterprise requirements."
      ],
      links: {
        github: "https://github.com/neelesh1097",
        live: null
      },
      color: 0x3b82f6 // vibrant blue
    },
    {
      id: "betel-meet",
      title: "Betel Meet",
      category: "Real-Time Collaboration",
      tech: ["WebRTC", "React.js", "Node.js", "MediaStreams", "WebSockets"],
      tagline: "Secure Real-Time Video Conferencing & Recording",
      description:
        "Engineered key modules for a real-time video conferencing platform enabling secure multi-party meetings, low-latency collaboration, and client-side meeting recording.",
      highlights: [
        "Implemented room management, role elevation, and seamless participant interaction features.",
        "Optimized frontend-backend communication to minimize latency and bandwidth consumption during multi-stream calls.",
        "Architected browser-based recording workflows and media handling mechanisms for cost-effective local recording without high server strain."
      ],
      links: {
        github: "https://github.com/neelesh1097",
        live: null
      },
      color: 0x10b981 // emerald green
    },
    {
      id: "mern-app",
      title: "Full-Stack MERN Platform",
      category: "Web Application",
      tech: ["MongoDB", "Express.js", "React.js", "Node.js", "JWT"],
      tagline: "High-Performance Full-Stack Platform",
      description:
        "Built a robust full-stack web application featuring secure JWT authentication, role-based resource access, and responsive single-page architecture.",
      highlights: [
        "Architected clean RESTful endpoints with input validation and rate limiting.",
        "Optimized frontend rendering and code splitting, reducing initial load time by approximately 40%.",
        "Configured MongoDB indexing and aggregation pipelines for sub-50ms query response times."
      ],
      links: {
        github: "https://github.com/neelesh1097",
        live: null
      },
      color: 0x8b5cf6 // purple
    },
    {
      id: "crypto-tracker",
      title: "Crypto Price Tracker",
      category: "Fintech Dashboard",
      tech: ["React.js", "REST APIs", "Chart.js", "Tailwind CSS"],
      tagline: "Live Cryptocurrency Market Trends & Analytics",
      description:
        "Interactive real-time financial dashboard fetching live cryptocurrency price data and market trends from public exchanges and API streams.",
      highlights: [
        "Live price tickers, historical interactive trend charts, and market cap rank sorting.",
        "Implemented debounce search, client-side caching, and error-resilient API polling.",
        "Mobile-first responsive design delivering fluid transitions and clean data visualizations."
      ],
      links: {
        github: "https://github.com/neelesh1097",
        live: null
      },
      color: 0xf59e0b // amber
    }
  ],

  experience: [
    {
      role: "Frontend Intern",
      company: "TRPW Strategic Partner",
      period: "Apr 2026 – Present",
      location: "Gurugram, India",
      type: "Full-Time",
      description:
        "Leading frontend architecture for flagship enterprise systems including Audit Management Tool (AMT) and Betel Meet real-time video platform."
    },
    {
      role: "Tech Intern",
      company: "Univest",
      period: "Jul 2025 – Sep 2025",
      location: "Gurugram, India",
      type: "Full-Time",
      description:
        "Validated user-facing features & backend services, identifying and reporting 15+ critical bugs to boost stability and release quality."
    },
    {
      role: "Software Development Intern",
      company: "Phoenix Labs",
      period: "Sep 2024 – Mar 2025",
      location: "Remote",
      type: "Software Intern",
      description:
        "Engineered backend services, API integrations, and scalable automation scripts for internal data processing workflows."
    }
  ],

  education: {
    institution: "Gurugram University",
    degree: "B.Tech in Artificial Intelligence",
    period: "2022 – 2026",
    location: "Gurugram, Haryana"
  }
};
