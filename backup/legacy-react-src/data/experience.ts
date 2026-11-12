import { ExperienceItem, EducationItem } from '../types';

export const EXPERIENCES_DATA: ExperienceItem[] = [
  {
    id: 'trpw',
    company: 'TRPW Strategic Partner',
    role: 'Frontend Intern',
    period: 'Apr 2026 — Present',
    location: 'Gurugram, India',
    type: 'Full-Time',
    description: [
      'Audit Management Tool (AMT): Developed a workflow-driven audit management platform using Next.js, TypeScript, Node.js, and PostgreSQL to streamline the complete audit lifecycle.',
      'Designed and implemented role-based workflows supporting Super Admin, Admin, Auditor, and Auditee operations with hierarchical tasks, sub-tasks, submissions, and review approvals.',
      'Betel Meet: Contributed to a real-time video conferencing platform with room management, participant interactions, and browser-based recording workflows.',
    ],
    tech: ['Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST APIs'],
    color: '#38bdf8',
  },
  {
    id: 'univest',
    company: 'Univest',
    role: 'Tech Intern (Software Engineering Intern)',
    period: 'Jul 2025 — Sep 2025',
    location: 'Full-Time',
    type: 'Internship',
    description: [
      'Validated user-facing web features and backend services for functionality, regression scenarios, and edge cases.',
      'Identified and reported 15+ critical issues, contributing directly to improved application stability and release quality.',
      'Collaborated closely with engineering teams to verify reliable and stable software releases.',
    ],
    tech: ['Web Testing', 'Backend Validation', 'Regression QA', 'Product Engineering'],
    color: '#10b981',
  },
  {
    id: 'phoenix',
    company: 'Phoenix Labs',
    role: 'Software Development Intern',
    period: 'Sep 2024 — Mar 2025',
    location: 'Remote',
    type: 'Internship',
    description: [
      'Worked on backend services, REST API integrations, and data handling solutions for internal applications.',
      'Developed automation scripts and enhanced data processing workflows to improve scalability.',
      'Collaborated with cross-functional teams to test, debug, and enhance overall application reliability.',
    ],
    tech: ['Node.js', 'REST APIs', 'Automation Scripts', 'Data Processing'],
    color: '#a855f7',
  },
];

export const EDUCATION_DATA: EducationItem[] = [
  {
    id: 'btech-ai',
    institution: 'Gurugram University',
    degree: 'B.Tech in Artificial Intelligence',
    period: '2022 — 2026',
    grade: 'Gurugram, Haryana',
    coursework: [
      'Data Structures & Algorithms',
      'Database Management Systems (DBMS)',
      'Operating Systems & Computer Networks',
      'Artificial Intelligence & Machine Learning',
      'Software Engineering & Web Systems',
      'Object-Oriented Programming (Java / TS)',
    ],
    achievements: [
      'Built production-grade workflow & real-time collaboration web applications',
      'Completed 3 software engineering internships across frontend, backend & QA',
    ],
  },
];

export const CERTIFICATIONS_DATA = [
  {
    id: 'fullstack-web',
    title: 'Full-Stack Web Engineering (Next.js, TypeScript, Node.js, PostgreSQL)',
    issuer: 'Production & Internship Experience',
    year: '2026',
  },
  {
    id: 'threejs-webgl',
    title: 'Interactive 3D Graphics with Three.js & Rapier3D',
    issuer: 'Creative Engineering Portfolio',
    year: '2026',
  },
];
