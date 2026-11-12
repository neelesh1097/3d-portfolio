import { SkillCategoryData } from '../types';

export const SKILL_CATEGORIES_DATA: Record<string, SkillCategoryData> = {
  frontend: {
    id: 'frontend',
    title: 'Frontend City',
    description:
      'Building responsive, maintainable React & Next.js interfaces, TypeScript architectures, and interactive Three.js 3D experiences.',
    icon: 'Layout',
    color: '#38bdf8',
    skills: [
      { name: 'JavaScript (ES6+)', level: 94, experience: 'Core' },
      { name: 'TypeScript', level: 92, experience: 'Production' },
      { name: 'React.js & React Router', level: 94, experience: 'Production' },
      { name: 'Next.js (App Router)', level: 92, experience: 'Production' },
      { name: 'HTML5 / CSS3 / Tailwind CSS', level: 94, experience: 'Production' },
      { name: 'Three.js / WebGPU & TSL', level: 85, experience: 'Creative 3D' },
    ],
  },
  backend: {
    id: 'backend',
    title: 'Backend Lab',
    description:
      'Designing REST APIs, role-based access workflows, real-time room communication, and backend automation scripts.',
    icon: 'Server',
    color: '#10b981',
    skills: [
      { name: 'Node.js Runtime', level: 90, experience: 'Production' },
      { name: 'Express.js', level: 89, experience: 'Production' },
      { name: 'RESTful API Design & Integration', level: 92, experience: 'Production' },
      { name: 'Role-Based Access Control (RBAC)', level: 88, experience: 'Enterprise' },
      { name: 'Browser Media & Real-Time Conferencing', level: 84, experience: 'Production' },
      { name: 'Java (OOP & DSA)', level: 84, experience: 'Core CS' },
    ],
  },
  database: {
    id: 'database',
    title: 'Database Hub',
    description:
      'Modeling relational and document schemas for hierarchical tasks, audit trails, and scalable web applications.',
    icon: 'Database',
    color: '#f59e0b',
    skills: [
      { name: 'PostgreSQL', level: 88, experience: 'Production' },
      { name: 'MongoDB', level: 88, experience: 'MERN Stack' },
      { name: 'Relational Schema Design (DBMS)', level: 89, experience: 'Core CS' },
      { name: 'Hierarchical Task & Audit Modeling', level: 86, experience: 'Enterprise' },
    ],
  },
  devops: {
    id: 'devops',
    title: 'Cloud & Tooling',
    description:
      'Streamlining version control, API verification, performance profiling, and modern build tooling.',
    icon: 'Cloud',
    color: '#8b5cf6',
    skills: [
      { name: 'Git & GitHub Workflows', level: 93, experience: 'Daily' },
      { name: 'Postman & API Testing', level: 90, experience: 'Daily' },
      { name: 'Vite & Modern Bundling', level: 88, experience: 'Production' },
      { name: 'Frontend Performance & Lazy Loading', level: 88, experience: 'Production' },
      { name: 'Regression & Edge-Case QA', level: 87, experience: 'Internship' },
    ],
  },
};
