export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  image?: string;
}

export interface WrongQuestion {
  id: string;
  subject: string;
  date: string;
  title: string;
  description: string;
  image?: string;
  difficulty: "easy" | "medium" | "hard";
  status: "pending" | "mastered";
  aiTip: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  color: string;
  iconChar: string;
}

export interface MapNode {
  id: string;
  title: string;
  status: "completed" | "active" | "locked";
  x: number; // percentage width
  y: number; // percentage height
}

export interface UserStats {
  level: number;
  xp: number;
  maxXp: number;
  learningTimeMinutes: number;
  deepThinkingMinutes: number;
  streakCount: number;
}

export interface UserProfile {
  name: string;
  avatarChar: string;
  avatarBg: string;
  avatarColor: string;
  academicTitle: string;
}

