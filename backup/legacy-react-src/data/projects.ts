import { Project } from '../types';

export const PROJECTS_DATA: Project[] = [
  {
    id: 'audit-management-tool',
    title: 'Audit Management Tool (AMT)',
    subtitle: 'Workflow-Driven Enterprise Audit Platform',
    description:
      'A full-stack enterprise audit management platform built with Next.js, TypeScript, Node.js, and PostgreSQL to streamline the complete audit lifecycle from assignment to final approval.',
    problemSolved:
      'Replaced fragmented audit tracking with strict role-based workflows across Super Admin, Admin, Auditor, and Auditee personas, supporting hierarchical tasks, sub-tasks, data submissions, and multi-stage review cycles.',
    role: 'Frontend & Full-Stack Engineer — Built reusable dashboards, RBAC workflows, and backend API integrations.',
    features: [
      'Role-based access control for Super Admin, Admin, Auditor & Auditee',
      'Hierarchical task & sub-task assignment with progress tracking',
      'Structured data submission, review cycles & approval history',
      'Reusable reporting dashboards and status visibility components',
    ],
    tags: ['Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST APIs'],
    metrics: '4-Role Enterprise RBAC Workflow',
    githubUrl: 'https://github.com/neelesh1097',
    accentColor: '#38bdf8',
    coords: [-8, 0, 32],
  },
  {
    id: 'betel-meet',
    title: 'Betel Meet',
    subtitle: 'Real-Time Video Conferencing & Recording Platform',
    description:
      'Real-time video conferencing platform supporting secure meetings, live participant interactions, room management, and browser-based session recording.',
    problemSolved:
      'Engineered client-side browser recording workflows and optimized frontend-backend room signaling to deliver cost-effective, reliable meeting capture without heavy server transcoding overhead.',
    role: 'Frontend Engineer — Implemented room controls, participant interactions, and browser media recording flows.',
    features: [
      'Secure meeting room management and participant controls',
      'Optimized real-time frontend-backend communication',
      'Browser-based media capture & recording reliability improvements',
      'Responsive conferencing UI tailored for active team collaboration',
    ],
    tags: ['Next.js', 'TypeScript', 'WebRTC / Media API', 'Node.js'],
    metrics: 'Browser-Native Recording Workflow',
    githubUrl: 'https://github.com/neelesh1097',
    accentColor: '#8b5cf6',
    coords: [-2.5, 0, 35],
  },
  {
    id: 'mern-fullstack-app',
    title: 'Full-Stack MERN Application',
    subtitle: 'Authenticated REST Architecture & Optimized React UI',
    description:
      'End-to-end full-stack web application built with MongoDB, Express.js, React, and Node.js featuring secure authentication, structured REST endpoints, and tuned client rendering.',
    problemSolved:
      'Eliminated redundant component re-renders and optimized asset/bundle delivery on the frontend, reducing initial load time by approximately 40%.',
    role: 'Full-Stack Developer — Designed MongoDB schemas, Express REST APIs, authentication, and React frontend.',
    features: [
      'Secure user authentication and protected API routes',
      'Modular Express.js REST endpoints backed by MongoDB',
      'Optimized React rendering cutting initial load time by ~40%',
      'Clean state synchronization and responsive mobile layout',
    ],
    tags: ['MongoDB', 'Express.js', 'React', 'Node.js', 'REST APIs'],
    metrics: '~40% Faster Initial Load',
    githubUrl: 'https://github.com/neelesh1097',
    accentColor: '#10b981',
    coords: [2.5, 0, 35],
  },
  {
    id: 'crypto-price-tracker',
    title: 'Crypto Price Tracker & 3D Portfolio',
    subtitle: 'Live Market Dashboard & WebGPU Interactive World',
    description:
      'Interactive React cryptocurrency dashboard consuming live public market APIs alongside this WebGPU/Rapier3D interactive portfolio world engineered with Three.js TSL shaders.',
    problemSolved:
      'Combined clean live data visualization with a decoupled 60 FPS Three.js WebGPU + Rapier3D physics engine architecture for smooth exploration across desktop and mobile.',
    role: 'Creator & Full-Stack Engineer — Built live API integrations, TSL shaders, vehicle physics, and responsive UI.',
    features: [
      'Live cryptocurrency price feeds & interactive market trend views',
      'Lazy-loaded React SPA architecture for fast navigation',
      'Three.js WebGPU + Rapier3D physics engine in Full Stack Island',
      'Custom TSL core-shadow, grass, water & track shaders',
    ],
    tags: ['React', 'TypeScript', 'Three.js TSL', 'Rapier3D', 'REST APIs'],
    metrics: 'Live Market Data + WebGPU 3D',
    githubUrl: 'https://github.com/neelesh1097',
    accentColor: '#f59e0b',
    coords: [8, 0, 32],
  },
];
