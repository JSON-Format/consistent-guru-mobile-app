export interface Level {
  level: number;
  title: string;
  emoji: string;
  minStreak: number;
  description: string;
  colors: [string, string];
color: string;
  glow: string;
}

export const LEVELS: Level[] = [
  {
    level: 1,
    title: "Guru",
    emoji: "🧘",
    minStreak: 0,
    description: "The journey begins. Show up every day.",
    colors: ["#34d399", "#059669"],
    color: "#10b981",
    glow: "#10b981",
  },
  {
    level: 2,
    title: "Master",
    emoji: "⚔️",
    minStreak: 7,
    description: "7-day streak. Discipline is forming.",
    colors: ["#fb923c", "#ea580c"],
    color: "#f97316",
    glow: "#f97316",
  },
  {
    level: 3,
    title: "Sage",
    emoji: "📜",
    minStreak: 21,
    description: "21-day streak. Habits are taking root.",
    colors: ["#c084fc", "#9333ea"],
    color: "#a855f7",
    glow: "#a855f7",
  },
  {
    level: 4,
    title: "Enlightened",
    emoji: "✨",
    minStreak: 50,
    description: "50-day streak. You've transcended.",
    colors: ["#facc15", "#d97706"],
    color: "#eab308",
    glow: "#eab308",
  },
  {
    level: 5,
    title: "Ascendant",
    emoji: "🔱",
    minStreak: 100,
    description: "100-day streak. Legendary consistency.",
    colors: ["#fb7185", "#dc2626"],
    color: "#f43f5e",
    glow: "#f43f5e",
  },
];


// 🔥 GET CURRENT LEVEL
export function getActivityLevel(streak: number): Level {
  let current = LEVELS[0];

  for (const l of LEVELS) {
    if (streak >= l.minStreak) {
      current = l;
    }
  }

  return current;
}

// 🔥 GET NEXT LEVEL
export function getNextLevel(streak: number): Level | null {
  for (const l of LEVELS) {
    if (streak < l.minStreak) {
      return l;
    }
  }
  return null;
}

// 🔥 PROGRESS % TO NEXT LEVEL
export function getLevelProgress(streak: number): number {
  const current = getActivityLevel(streak);
  const next = getNextLevel(streak);

  if (!next) return 100;

  const range = next.minStreak - current.minStreak;

  if (range === 0) return 100;

  const progress = streak - current.minStreak;

  return Math.min(100, Math.round((progress / range) * 100));
}