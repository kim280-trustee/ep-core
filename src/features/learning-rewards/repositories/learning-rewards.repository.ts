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
  classGroupId: row.class_group_id,
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

  async listClassLedger(classGroupId: string): Promise<LearningRewardLedgerEntry[]> {
    const { data, error } = await supabase
      .from("learning_reward_ledger")
      .select("*")
      .eq("class_group_id", classGroupId)
      .order("occurred_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapReward);
  },

  async listClassChallenges(classGroupId: string) {
    const { data, error } = await supabase.from("learning_class_challenges")
      .select("*").eq("class_group_id", classGroupId).order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async listShopItems(classGroupIds: string[], includeInactive = false) {
    if (!classGroupIds.length) return [];
    let request = supabase.from("learning_reward_shop_items").select("*").in("class_group_id", classGroupIds);
    if (!includeInactive) request = request.eq("status", "active");
    const { data, error } = await request.order("cost_xp", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async listClassRedemptions(classGroupId: string) {
    const { data, error } = await supabase.from("learning_reward_redemptions")
      .select("*").eq("class_group_id", classGroupId).order("requested_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async listStudentRedemptions(studentUserId: string) {
    const { data, error } = await supabase.from("learning_reward_redemptions")
      .select("*").eq("student_user_id", studentUserId).order("requested_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async redeemReward(itemId: string): Promise<string> {
    const { data, error } = await supabase.rpc("redeem_learning_reward", { p_item_id: itemId });
    if (error) throw error;
    return data;
  },

  async reviewRedemption(redemptionId: string, decision: "approved" | "rejected" | "fulfilled", note?: string) {
    const { error } = await supabase.rpc("review_learning_reward_redemption", {
      p_redemption_id: redemptionId, p_decision: decision, p_note: note ?? null,
    });
    if (error) throw error;
  },

  async listNotifications(studentUserId: string) {
    const { data, error } = await supabase.from("learning_reward_notifications")
      .select("*").eq("student_user_id", studentUserId).order("created_at", { ascending: false }).limit(20);
    if (error) throw error;
    return data ?? [];
  },

  async markNotificationRead(notificationId: string) {
    const { error } = await supabase.from("learning_reward_notifications")
      .update({ read_at: new Date().toISOString() }).eq("id", notificationId);
    if (error) throw error;
  },
};
