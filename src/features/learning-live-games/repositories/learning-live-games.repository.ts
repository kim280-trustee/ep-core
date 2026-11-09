import type { Database, Json } from "@/core/database/database.types";
import { supabase } from "@/core/infrastructure/supabase/client";
import type { LearningLiveGamePlayer, LearningLiveGameSession, LearningLiveGameAnswerResult } from "../types/learning-live-games.types";

type SessionRow = Database["public"]["Tables"]["learning_live_game_sessions"]["Row"];
type PlayerRow = Database["public"]["Tables"]["learning_live_game_players"]["Row"];

const mapSession = (row: SessionRow): LearningLiveGameSession => ({
  id: row.id, tenantId: row.tenant_id, organizationId: row.organization_id,
  classGroupId: row.class_group_id, assessmentId: row.assessment_id, hostUserId: row.host_user_id,
  joinCode: row.join_code, status: row.status as LearningLiveGameSession["status"],
  currentQuestionIndex: row.current_question_index,
  settings: row.settings && typeof row.settings === "object" && !Array.isArray(row.settings)
    ? row.settings as Record<string, unknown> : {},
  startedAt: row.started_at, endedAt: row.ended_at, createdAt: row.created_at, updatedAt: row.updated_at,
});

const mapPlayer = (row: PlayerRow): LearningLiveGamePlayer => ({
  id: row.id, sessionId: row.session_id, studentUserId: row.student_user_id,
  displayName: row.display_name, score: row.score, status: row.status as LearningLiveGamePlayer["status"],
  joinedAt: row.joined_at, lastSeenAt: row.last_seen_at,
});

export const learningLiveGamesRepository = {
  async createSession(classGroupId: string, assessmentId: string) {
    const { data, error } = await supabase.rpc("create_learning_live_game_session", {
      p_class_group_id: classGroupId, p_assessment_id: assessmentId, p_settings: {} as Json,
    });
    if (error) throw error;
    return data;
  },
  async listClassSessions(classGroupId: string) {
    const { data, error } = await supabase.from("learning_live_game_sessions")
      .select("*").eq("class_group_id", classGroupId).order("created_at", { ascending: false }).limit(10);
    if (error) throw error;
    return (data ?? []).map(mapSession);
  },
  async listPlayers(sessionId: string) {
    const { data, error } = await supabase.from("learning_live_game_players")
      .select("*").eq("session_id", sessionId).order("score", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapPlayer);
  },
  async startSession(sessionId: string) {
    const { error } = await supabase.rpc("start_learning_live_game_session", { p_session_id: sessionId });
    if (error) throw error;
  },
  async advanceQuestion(sessionId: string) {
    const { data, error } = await supabase.rpc("advance_learning_live_game_question", { p_session_id: sessionId });
    if (error) throw error;
    return data;
  },
  async joinSession(joinCode: string) {
    const { data, error } = await supabase.rpc("join_learning_live_game_session", { p_join_code: joinCode });
    if (error) throw error;
    return data;
  },
  async submitAnswer(sessionId: string, answer: Record<string, unknown>, responseTimeMs?: number) {
    const { data, error } = await supabase.rpc("submit_learning_live_game_answer", {
      p_session_id: sessionId, p_answer: answer as Json, p_response_time_ms: responseTimeMs ?? null,
    });
    if (error) throw error;
    return data as LearningLiveGameAnswerResult;
  },
};

export const learningLiveGamesSessionMapper = mapSession;
