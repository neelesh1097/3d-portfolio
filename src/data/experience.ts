import { ExperienceItem, EducationItem } from '../types';

export const EXPERIENCES_DATA: ExperienceItem[] = [
  {
    id: 'trpw',
    company: 'TRPW Strategic Partner',
    role: 'Full-Stack Engineer (Founder Office / SDE-1)',
    period: '2024 — Present',
    location: 'Gurugram, India',
    type: 'Full-time',
    description: [
      'Architected end-to-end client and internal web applications with React, Node.js, and cloud microservices.',
      'Reduced core PostgreSQL query latency by 42% using composite indexes and multi-tier Redis caching.',
      'Automated document analysis pipelines using AI workflows, eliminating 70% of manual processing overhead.'
    ],
    tech: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'Docker'],
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
      'Engineered scalable fintech user acquisition & onboarding modules serving 500,000+ monthly active users.',
      'Partnered with product designers to implement responsive Framer Motion interactions across mobile and web.',
      'Expanded automated test suites, elevating unit & integration test coverage by 30%.'
    ],
    tech: ['Next.js', 'TypeScript', 'Node.js', 'REST APIs', 'Tailwind CSS'],
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
      'Built responsive telemetry monitoring dashboards powered by real-time WebSocket data streams.',
      'Developed reusable UI component primitives and custom analytics graphs.',
      'Optimized frontend bundle chunking, decreasing initial page load time by 35%.'
    ],
    tech: ['React', 'JavaScript', 'WebSockets', 'Chart.js', 'Express.js'],
    color: '#a855f7',
  },
];

export const EDUCATION_DATA: EducationItem[] = [
  {
    id: 'btech-cse',
    institution: 'Bachelor of Technology (B.Tech)',
    degree: 'Computer Science and Engineering',
    period: 'Graduated with Distinction',
    grade: 'Strong Academic Record',
    coursework: [
      'Data Structures & Algorithms',
      'Database Management Systems (DBMS)',
      'Operating Systems & Concurrency',
      'Computer Networks & Distributed Systems',
      'Object-Oriented Software Engineering',
      'Computer Graphics & WebGL Foundations'
    ],
    achievements: [
      'Top 5% performer in competitive algorithmic programming',
      'Led university tech society full-stack & web engineering workshops',
      'Published open-source interactive 3D WebGL demos'
    ]
  }
];

export const CERTIFICATIONS_DATA = [
  {
    id: 'aws-cloud',
    title: 'Cloud Architecture & Deployment',
    issuer: 'AWS / Cloud Tooling',
    year: '2024',
  },
  {
    id: 'fullstack-ts',
    title: 'Advanced Full-Stack TypeScript & React Systems',
    issuer: 'Engineering Certification',
    year: '2023',
  },
  {
    id: 'webgl-creative',
    title: 'Interactive WebGL & Three.js Shaders',
    issuer: 'Creative Coding Mastery',
    year: '2024',
  },
];

