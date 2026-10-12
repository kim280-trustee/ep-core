export interface LearningBadge {
  id: "first_steps" | "content_explorer" | "assessment_achiever" | "learning_champion";
  name: string;
  description: string;
  icon: "sparkles" | "book" | "target" | "trophy";
  earned: boolean;
  progress: number;
  goal: number;
}

export interface StudentGamificationSummary {
  xp: number;
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  completedLessons: number;
  assessedQuizzes: number;
  badges: LearningBadge[];
  evidenceCount: number;
}
