export type ZoneId =
  | 'spawn'
  | 'about'
  | 'frontend'
  | 'backend'
  | 'database'
  | 'devops'
  | 'projects'
  | 'experience'
  | 'contact';

export interface ZoneInfo {
  id: ZoneId;
  name: string;
  tagline: string;
  position: [number, number, number];
  radius: number;
  color: string;
  icon: string;
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  problemSolved: string;
  role: string;
  features: string[];
  tags: string[];
  metrics?: string;
  liveUrl?: string;
  githubUrl?: string;
  accentColor: string;
  coords: [number, number, number];
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  period: string;
  location: string;
  type: string;
  description: string[];
  tech: string[];
  color: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  period: string;
  grade?: string;
  coursework: string[];
  achievements: string[];
}

export interface SkillItem {
  name: string;
  level: number;
  experience?: string;
}

export interface SkillCategoryData {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  skills: SkillItem[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xp: number;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface DeveloperToken {
  id: string;
  name: string;
  position: [number, number, number];
  color: string;
  points: number;
}
