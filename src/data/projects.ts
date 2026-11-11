import { Project } from '../types';

export const PROJECTS_DATA: Project[] = [
  {
    id: 'solar-space-3d',
    title: '3D Deep Space Simulation',
    subtitle: 'Interactive Astronomical Physics & WebGL Engine',
    description: 'An interactive 3D solar system with accurate orbital velocities, Keplerian physics, volumetric sun corona shaders, and celestial camera trajectories.',
    problemSolved: 'Rendered 15,000+ interactive celestial bodies and asteroid particles smoothly at 60 FPS in browser mobile viewports by leveraging instanced geometries and offloaded shader mathematics.',
    role: 'Lead Creative Developer — Designed 3D architecture, GLSL shaders, and camera interpolation.',
    features: [
      '15,000+ instanced asteroid belt meshes rendered at solid 60fps',
      'Custom procedural GLSL sun surface and rim-lighting shaders',
      'Interactive time-scrubber to simulate planetary orbits',
      'Cinematic fly-to camera controls with smooth cubic easing'
    ],
    tags: ['Three.js', 'React Three Fiber', 'GLSL Shaders', 'TypeScript', 'Vite'],
    metrics: '60 FPS stable on mobile, 15k+ instanced meshes',
    liveUrl: 'https://github.com/neelesh1097',
    githubUrl: 'https://github.com/neelesh1097',
    accentColor: '#38bdf8',
    coords: [-8, 0, -32],
  },
  {
    id: 'docusense-ai',
    title: 'DocuSense AI RAG Engine',
    subtitle: 'Intelligent Enterprise Document Retrieval & Q&A',
    description: 'Production-ready enterprise document intelligence platform featuring hybrid vector search, multi-modal PDF parsing, and real-time streaming LLM responses.',
    problemSolved: 'Cut document retrieval latency to <200ms and reduced LLM hallucinations by 65% through a reciprocal rank fusion (RRF) pipeline combining dense embeddings with sparse BM25 indexing.',
    role: 'Full-Stack Engineer — Built FastAPI microservices, pgvector index pipelines, and streaming Next.js frontend.',
    features: [
      'Sub-200ms hybrid vector retrieval with cross-encoder reranking',
      'Multi-modal document chunking supporting complex PDF tables',
      'Real-time streaming answers with exact page citation previews',
      'Role-based access control and audited search query logs'
    ],
    tags: ['Next.js', 'Python', 'FastAPI', 'pgvector', 'PostgreSQL', 'Docker'],
    metrics: '<200ms retrieval, 65% hallucination reduction',
    liveUrl: 'https://github.com/neelesh1097',
    githubUrl: 'https://github.com/neelesh1097',
    accentColor: '#8b5cf6',
    coords: [-2.5, 0, -36],
  },
  {
    id: 'omnishop-cloud',
    title: 'OmniShop Cloud Commerce',
    subtitle: 'High-Throughput Distributed E-Commerce Architecture',
    description: 'Modern headless commerce platform engineered with Next.js App Router, Node.js microservices, and atomic Redis inventory locking.',
    problemSolved: 'Prevented flash-sale inventory overselling under high concurrency by designing atomic Lua-scripted lock reservations in Redis with TTL expiration.',
    role: 'Backend & Full-Stack Architect — Built payment webhooks, database query optimization, and UI storefront.',
    features: [
      'Atomic Lua lock inventory reservation preventing double purchases',
      'Instant debounced Redis catalog search (<15ms response time)',
      'Stripe webhook checkout with automated transactional emails',
      'Lighthouse 98+ mobile performance rating'
    ],
    tags: ['React 19', 'Node.js', 'PostgreSQL', 'Redis', 'Stripe', 'Tailwind'],
    metrics: 'Stress tested to 2,500 req/sec, sub-15ms search',
    liveUrl: 'https://github.com/neelesh1097',
    githubUrl: 'https://github.com/neelesh1097',
    accentColor: '#10b981',
    coords: [2.5, 0, -36],
  },
  {
    id: 'cryptopulse-terminal',
    title: 'CryptoPulse Realtime Terminal',
    subtitle: 'Sub-Second Order Book & Telemetry Analytics',
    description: 'High-density financial analytics terminal processing live Binance and Coinbase WebSocket streams with Web Workers for zero-jank charting.',
    problemSolved: 'Eliminated browser main-thread UI freezing during high-volatility market events by offloading WebSocket stream parsing and order book diffing to dedicated background Web Workers.',
    role: 'Frontend & Systems Developer — Designed Web Worker message architecture and hardware-accelerated Canvas graphics.',
    features: [
      'Zero-jank UI via off-thread Web Worker orderbook diffing',
      'High-throughput WebSocket telemetry handling 8,000 updates/sec',
      'Real-time animated depth chart and interactive trade tape',
      'Custom threshold alert system with Web Audio chimes'
    ],
    tags: ['TypeScript', 'WebSockets', 'Web Workers', 'Canvas API', 'Tailwind'],
    metrics: '8,000 events/sec processed with zero frame drops',
    liveUrl: 'https://github.com/neelesh1097',
    githubUrl: 'https://github.com/neelesh1097',
    accentColor: '#f59e0b',
    coords: [8, 0, -32],
  },
];

