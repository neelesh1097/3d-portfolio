import React from 'react';
import {
  Sparkles,
  User,
  Layout,
  Server,
  Database,
  Cloud,
  FolderGit2,
  Briefcase,
  Send,
  Car,
  Flame,
  Zap,
  Gem,
  Compass,
  Trophy,
} from 'lucide-react';

interface ZoneIconProps {
  name: string;
  className?: string;
  size?: number;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  Sparkles,
  User,
  Layout,
  Server,
  Database,
  Cloud,
  FolderGit2,
  Briefcase,
  Send,
  Car,
  Flame,
  Zap,
  Gem,
  Compass,
  Trophy,
};

/** Renders a consistent Lucide icon from a data icon key. */
export const ZoneIcon: React.FC<ZoneIconProps> = ({ name, className, size = 16 }) => {
  const Icon = ICON_MAP[name] || Sparkles;
  return <Icon className={className} size={size} />;
};

