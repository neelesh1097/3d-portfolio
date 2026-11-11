import { Project, Experience, Education, SkillCategory, Achievement, CollectibleItem, ZoneInfo } from '../types';

export const PERSONAL_INFO = {
  name: 'Neelesh Yadav',
  title: 'Full-Stack & Creative AI Engineer',
  tagline: 'Crafting High-Performance Web Architectures & Immersive 3D Experiences',
  bio: 'Creative software engineer bridging the gap between high-performance web systems and cutting-edge 3D interactive experiences. Experienced in React, Three.js, TypeScript, Next.js, and scalable cloud backends.',
  story: `Ever since writing my first lines of code, I became fascinated by how digital products can feel alive rather than static. My engineering journey spans building high-throughput microservices handling real-time data, crafting interactive 3D WebGL experiences with Three.js, and training intelligent agent workflows.

I love taking complex computational challenges—whether that is real-time physics in the browser or optimized database query plans—and turning them into effortless, delightful user experiences.`,
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  location: 'Bangalore, India (Open to Worldwide Remote)',
  email: 'neelesh1097.dev@gmail.com',
  github: 'https://github.com/neelesh1097',
  linkedin: 'https://linkedin.com/in/neelesh-yadav-a5988b292',
  stats: [
    { label: 'Years Experience', value: '2+' },
    { label: 'Projects Shipped', value: '15+' },
    { label: 'Interactive 3D Demos', value: '8+' },
    { label: 'Code Commits', value: '1,200+' },
  ]
};

export const ZONES: ZoneInfo[] = [
  {
    id: 'spawn',
    name: 'Spawn Plaza',
    tagline: 'Welcome Hub & Vehicle Bay',
    position: [0, 0, 0],
    radius: 12,
    color: '#38bdf8',
    icon: 'Sparkles',
  },
  {
    id: 'about',
    name: 'About Studio',
    tagline: 'Personal Story & Background',
    position: [-38, 0, -28],
    radius: 14,
    color: '#a855f7',
    icon: 'User',
  },
  {
    id: 'skills',
    name: 'Tech Lab',
    tagline: 'Interactive Skill Matrix',
    position: [38, 0, -28],
    radius: 16,
    color: '#06b6d4',
    icon: 'Cpu',
  },
  {
    id: 'projects',
    name: 'Project Arena',
    tagline: 'Featured 3D Exhibitions',
    position: [0, 0, -56],
    radius: 18,
    color: '#3b82f6',
    icon: 'FolderGit2',
  },
  {
    id: 'experience',
    name: 'Career Runway',
    tagline: 'Professional Timeline & Impact',
    position: [42, 0, 24],
    radius: 16,
    color: '#10b981',
    icon: 'Briefcase',
  },
  {
    id: 'education',
    name: 'Academy Campus',
    tagline: 'Academics & Continuous Learning',
    position: [-42, 0, 24],
    radius: 14,
    color: '#f59e0b',
    icon: 'GraduationCap',
  },
  {
    id: 'contact',
    name: 'Comms Station',
    tagline: 'Get in Touch & Socials',
    position: [0, 0, 52],
    radius: 14,
    color: '#ec4899',
    icon: 'Send',
  },
];

export const PROJECTS: Project[] = [
  {
    id: 'solar-system-3d',
    title: '3D Deep Space Explorer',
    subtitle: 'Astronomical WebGL Physics Simulation',
    description: 'An interactive 3D solar system with accurate orbital velocities, Keplerian mechanics, volumetric sun corona shaders, and custom celestial body textures.',
    longDescription: 'Engineered a cinematic WebGL simulation featuring all major planets and moons. Implemented real-time gravity assist trajectories, procedural asteroid belt instancing rendering 15,000+ rocks at 60 FPS, and dynamic camera flight paths.',
    tags: ['Three.js', 'React Three Fiber', 'GLSL Shaders', 'TypeScript', 'Vite'],
    features: [
      '15,000+ instanced asteroids running at solid 60fps',
      'Custom procedural GLSL sun flares and atmospheric rim lighting',
      'Realistic scale and orbital velocity calculation',
      'Interactive time-lapse speed control'
    ],
    metrics: '60 FPS on mobile, 15k+ instanced meshes',
    liveUrl: 'https://github.com/neelesh1097',
    githubUrl: 'https://github.com/neelesh1097',
    accentColor: '#38bdf8',
    coords: [-16, 0, -58],
  },
  {
    id: 'docusense-ai',
    title: 'DocuSense AI RAG Engine',
    subtitle: 'Intelligent Enterprise Document Q&A',
    description: 'Enterprise document intelligence system using vector similarity search, multi-modal embeddings, and low-latency streaming responses.',
    longDescription: 'Architected an end-to-end RAG pipeline capable of ingesting PDF, Word, and scan OCR documents. Implemented hybrid search combining BM25 keyword matching with dense pgvector semantic embeddings, cutting hallucination rates by 65%.',
    tags: ['Next.js', 'Python', 'FastAPI', 'pgvector', 'LangChain', 'Docker'],
    features: [
      'Sub-200ms hybrid vector retrieval with reranking',
      'Multi-modal PDF parsing and table extraction',
      'Streaming responses with direct source citation citations',
      'Role-based access control with audited chat logs'
    ],
    metrics: '99.4% retrieval recall, 65% hallucination reduction',
    liveUrl: 'https://github.com/neelesh1097',
    githubUrl: 'https://github.com/neelesh1097',
    accentColor: '#8b5cf6',
    coords: [-5.5, 0, -64],
  },
  {
    id: 'omnishop-cloud',
    title: 'OmniShop Cloud Commerce',
    subtitle: 'High-Throughput Headless E-Commerce Platform',
    description: 'Production-ready headless commerce architecture with microsecond Redis catalog caching, optimistic inventory reservation, and Stripe webhooks.',
    longDescription: 'Built a modular commerce storefront with Next.js App Router and Node.js microservices. Integrated an atomic Lua-scripted inventory locking mechanism in Redis to prevent overselling during flash-sale spikes.',
    tags: ['React 19', 'Node.js', 'PostgreSQL', 'Redis', 'Stripe', 'Tailwind'],
    features: [
      'Atomic Lua lock inventory reservation preventing double-purchases',
      'Instant search with Debounced Redis indexing (<15ms latency)',
      'Automated invoice generation and transactional email queue',
      'Lighthouse 98+ performance score on mobile'
    ],
    metrics: 'Handles 2,000+ req/sec stress tested, sub-15ms search',
    liveUrl: 'https://github.com/neelesh1097',
    githubUrl: 'https://github.com/neelesh1097',
    accentColor: '#10b981',
    coords: [5.5, 0, -64],
  },
  {
    id: 'cryptopulse-terminal',
    title: 'CryptoPulse Realtime Terminal',
    subtitle: 'Ultra Low-Latency Orderbook & Analytics',
    description: 'Financial trading terminal streaming Binance and Coinbase Websocket order books, animated depth charts, and automated technical indicator calculation.',
    longDescription: 'Created a high-density financial terminal capable of parsing and diffing up to 8,000 WebSocket orderbook updates per second with Web Workers to ensure zero main-thread UI jank.',
    tags: ['TypeScript', 'WebSockets', 'Web Workers', 'Canvas 2D', 'Tailwind'],
    features: [
      'Zero-jank UI via off-thread Web Worker orderbook aggregation',
      'Real-time animated depth chart and trade tape',
      'Custom technical indicators (EMA, RSI, MACD, Bollinger Bands)',
      'Custom sound alert system for user-defined price thresholds'
    ],
    metrics: '8,000 ticks/sec processed smoothly with Web Workers',
    liveUrl: 'https://github.com/neelesh1097',
    githubUrl: 'https://github.com/neelesh1097',
    accentColor: '#f59e0b',
    coords: [16, 0, -58],
  },
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'frontend',
    name: 'Frontend & 3D WebGL',
    icon: 'Layers',
    description: 'Building immersive, fluid 60fps web interfaces and WebGL applications.',
    skills: [
      { name: 'React / Next.js', level: 95 },
      { name: 'TypeScript', level: 92 },
      { name: 'Three.js / WebGL', level: 88 },
      { name: 'React Three Fiber', level: 86 },
      { name: 'Tailwind CSS', level: 95 },
      { name: 'Framer Motion / GSAP', level: 90 },
      { name: 'HTML5 / CSS3 / Canvas', level: 98 },
    ],
  },
  {
    id: 'backend',
    name: 'Backend & Cloud Systems',
    icon: 'Server',
    description: 'Designing fault-tolerant microservices, high-speed APIs, and streaming backends.',
    skills: [
      { name: 'Node.js & Express', level: 90 },
      { name: 'Python & FastAPI', level: 84 },
      { name: 'PostgreSQL & SQL', level: 88 },
      { name: 'Redis Caching & PubSub', level: 85 },
      { name: 'REST & GraphQL APIs', level: 92 },
      { name: 'Docker & Microservices', level: 80 },
    ],
  },
  {
    id: 'ai_tools',
    name: 'AI Engineering & Tooling',
    icon: 'Cpu',
    description: 'Deploying modern LLM workflows, RAG vector search, and developer tooling.',
    skills: [
      { name: 'LangChain & Vector DBs', level: 82 },
      { name: 'OpenAI / Claude / Gemini APIs', level: 90 },
      { name: 'Git & GitHub Actions CI/CD', level: 92 },
      { name: 'Linux / Bash Scripting', level: 85 },
      { name: 'Vite & Build Tooling', level: 90 },
    ],
  },
];

export const EXPERIENCES: Experience[] = [
  {
    id: 'trpw',
    company: 'TRPW Strategic Partner',
    role: 'Full-Stack Engineer (Founder Office / SDE-1)',
    period: '2024 — Present',
    location: 'Gurugram, India',
    type: 'Full-time',
    description: [
      'Architected and delivered mission-critical internal and client platforms using React, Node.js, and cloud workflows.',
      'Reduced core database query latency by 42% through strategic index design, connection pooling, and multi-tier Redis caching.',
      'Integrated AI-assisted automated document analysis pipelines, eliminating manual verification overhead by 70%.'
    ],
    tech: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'Tailwind', 'AI Workflows'],
    color: '#38bdf8',
  },
  {
    id: 'univest',
    company: 'Univest',
    role: 'Software Development Engineer Intern',
    period: '2023 — 2024',
    location: 'Gurugram, India',
    type: 'Internship',
    description: [
      'Engineered high-traffic fintech user acquisition and onboarding flows serving 500,000+ active users.',
      'Collaborated closely with UX designers to craft high-conversion micro-interactions with Framer Motion and optimized mobile responsive layouts.',
      'Authored automated unit and integration tests, increasing codebase coverage by 30%.'
    ],
    tech: ['Next.js', 'TypeScript', 'Node.js', 'REST APIs', 'Framer Motion'],
    color: '#10b981',
  },
  {
    id: 'phoenix',
    company: 'Phoenix Labs',
    role: 'Full Stack Engineering Intern',
    period: '2023',
    location: 'Remote',
    type: 'Internship',
    description: [
      'Developed real-time analytics monitoring dashboards integrating bi-directional WebSocket telemetry.',
      'Built reusable component libraries and customized chart visualizations for telemetry data.',
      'Assisted in optimizing bundle sizes, decreasing initial page load times by 35%.'
    ],
    tech: ['React', 'JavaScript', 'WebSockets', 'Chart.js', 'Tailwind'],
    color: '#a855f7',
  },
];

export const EDUCATION_DATA: Education[] = [
  {
    id: 'btech-cse',
    institution: 'Bachelor of Technology (B.Tech)',
    degree: 'Computer Science and Engineering',
    period: 'Graduated with Distinction',
    grade: 'Strong Academic Record',
    coursework: [
      'Data Structures & Algorithms',
      'Object-Oriented Programming (C++/Java)',
      'Database Management Systems (DBMS)',
      'Operating Systems & Concurrency',
      'Computer Networks & Distributed Systems',
      'Computer Graphics & WebGL Foundations'
    ],
    achievements: [
      'Top 5% in University Coding Competitions',
      'Led university tech society web development workshops',
      'Published open-source interactive computer graphics demos'
    ]
  }
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_drive',
    title: 'First Ignition',
    description: 'Started the engine and steered the vehicle.',
    icon: 'Car',
    xp: 50,
    unlocked: false,
  },
  {
    id: 'nitro_boost',
    title: 'Supersonic Boost',
    description: 'Triggered Nitro Boost (Shift) for over 2 seconds.',
    icon: 'Flame',
    xp: 75,
    unlocked: false,
  },
  {
    id: 'stunt_jumper',
    title: 'Airtime Daredevil',
    description: 'Hit a jump ramp and cleared the gap.',
    icon: 'Rocket',
    xp: 100,
    unlocked: false,
  },
  {
    id: 'project_curator',
    title: 'Project Curator',
    description: 'Explored and inspected a project exhibition in the Arena.',
    icon: 'FolderGit2',
    xp: 100,
    unlocked: false,
  },
  {
    id: 'skill_specialist',
    title: 'Tech Specialist',
    description: 'Interacted with the futuristic Tech Laboratory.',
    icon: 'Cpu',
    xp: 100,
    unlocked: false,
  },
  {
    id: 'pin_striker',
    title: 'Bowling Legend',
    description: 'Knocked over the interactive physics pins.',
    icon: 'Trophy',
    xp: 150,
    unlocked: false,
  },
  {
    id: 'gem_collector',
    title: 'Crystal Hunter',
    description: 'Discovered and collected energy orbs scattered across the world.',
    icon: 'Gem',
    xp: 150,
    unlocked: false,
  },
  {
    id: 'world_traveler',
    title: 'Grand Tour Master',
    description: 'Visited all 6 zones across the interactive world.',
    icon: 'Compass',
    xp: 250,
    unlocked: false,
  },
];

export const COLLECTIBLES: CollectibleItem[] = [
  { id: 'crystal_1', name: 'Plaza Energy', position: [0, 1.2, -15], color: '#38bdf8', points: 100 },
  { id: 'crystal_2', name: 'Studio Insight', position: [-34, 1.2, -24], color: '#c084fc', points: 100 },
  { id: 'crystal_3', name: 'Lab Quantum', position: [34, 1.2, -24], color: '#22d3ee', points: 100 },
  { id: 'crystal_4', name: 'Arena Core', position: [0, 1.2, -72], color: '#60a5fa', points: 100 },
  { id: 'crystal_5', name: 'Runway Momentum', position: [46, 1.2, 32], color: '#34d399', points: 100 },
  { id: 'crystal_6', name: 'Academy Wisdom', position: [-46, 1.2, 32], color: '#fbbf24', points: 100 },
  { id: 'crystal_7', name: 'Comms Signal', position: [0, 1.2, 60], color: '#f472b6', points: 100 },
  { id: 'crystal_8', name: 'Secret Stunt Apex', position: [26, 3.8, 0], color: '#a78bfa', points: 250 },
];
