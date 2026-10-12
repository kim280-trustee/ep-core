import type { Database, Json } from "@/core/database/database.types";
import { supabase } from "@/core/infrastructure/supabase/client";
import type {
  LearningRewardEventType,
  LearningRewardLedgerEntry,
  LearningRewardSourceType,
} from "../types/learning-rewards.types";

type RewardRow = Database["public"]["Tables"]["learning_reward_ledger"]["Row"];

const record = (value: Json): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};

const mapReward = (row: RewardRow): LearningRewardLedgerEntry => ({
  id: row.id,
  tenantId: row.tenant_id,
  organizationId: row.organization_id,
  studentUserId: row.student_user_id,
  eventType: row.event_type as LearningRewardEventType,
  sourceType: row.source_type as LearningRewardSourceType,
  sourceId: row.source_id,
  xpDelta: row.xp_delta,
  metadata: record(row.metadata),
  occurredAt: row.occurred_at,
  createdAt: row.created_at,
});

export const learningRewardsRepository = {
  async listStudentLedger(studentUserId: string): Promise<LearningRewardLedgerEntry[]> {
    const { data, error } = await supabase
      .from("learning_reward_ledger")
      .select("*")
      .eq("student_user_id", studentUserId)
      .order("occurred_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapReward);
  },
};
