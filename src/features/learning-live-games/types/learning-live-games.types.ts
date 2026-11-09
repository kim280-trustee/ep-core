export type LearningLiveGameStatus = "lobby" | "in_progress" | "completed" | "cancelled";

export interface LearningLiveGameSession {
  id: string;
  tenantId: string;
  organizationId: string;
  classGroupId: string;
  assessmentId: string;
  hostUserId: string;
  joinCode: string;
  status: LearningLiveGameStatus;
  currentQuestionIndex: number;
  settings: Record<string, unknown>;
  startedAt: string | null;
  endedAt: string | null;\n  questionDeadlineAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LearningLiveGamePlayer {
  id: string;
  sessionId: string;
  studentUserId: string;
  displayName: string;
  score: number;
  status: "active" | "disconnected";
  joinedAt: string;
  lastSeenAt: string;
}

export interface LearningLiveGameAnswerResult {
  answer_id: string;
  is_correct: boolean;
  points_awarded: number;
}
