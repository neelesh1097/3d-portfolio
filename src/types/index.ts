export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  longDescription?: string;
  tags: string[];
  features: string[];
  metrics?: string;
  liveUrl?: string;
  githubUrl?: string;
  image?: string;
  accentColor: string;
  coords: [number, number, number];
}

export interface Experience {
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

export interface Education {
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
  level: number; // 1-100
  iconName?: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
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

export interface CollectibleItem {
  id: string;
  name: string;
  position: [number, number, number];
  color: string;
  points: number;
}

export type ZoneId = 'spawn' | 'about' | 'skills' | 'projects' | 'experience' | 'education' | 'contact';

export interface ZoneInfo {
  id: ZoneId;
  name: string;
  tagline: string;
  position: [number, number, number];
  radius: number;
  color: string;
  icon: string;
}
