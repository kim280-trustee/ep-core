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

type BadgeAwardRow = Database["public"]["Tables"]["learning_badge_awards"]["Row"];

const mapBadgeAward = (row: BadgeAwardRow): LearningBadgeAward => ({
  id: row.id,
  tenantId: row.tenant_id,
  studentUserId: row.student_user_id,
  badgeCode: row.badge_code as LearningBadgeAward["badgeCode"],
  title: row.badge_title,
  description: row.description,
  ruleVersion: row.rule_version,
  evidenceCount: row.evidence_count,
  awardedAt: row.awarded_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

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
  async getClassContext(classGroupId: string) {
    const { data: classGroup, error: classError } = await supabase
      .from("learning_class_groups")
      .select("id, organization_id, name")
      .eq("id", classGroupId)
      .single();
    if (classError) throw classError;

    const { data: organization, error: organizationError } = await supabase
      .from("organizations")
      .select("tenant_id")
      .eq("id", classGroup.organization_id)
      .single();
    if (organizationError) throw organizationError;

    return { ...classGroup, tenant_id: organization.tenant_id };
  },

  async createClassChallenge(input: {
    tenantId: string;
    organizationId: string;
    classGroupId: string;
    title: string;
    description: string;
    targetType: "assignments_completed" | "xp_earned";
    targetValue: number;
    bonusXp: number;
    endsAt: string;
    createdBy: string;
  }) {
    const { error } = await supabase.from("learning_class_challenges").insert({
      tenant_id: input.tenantId,
      organization_id: input.organizationId,
      class_group_id: input.classGroupId,
      title: input.title,
      description: input.description,
      target_type: input.targetType,
      target_value: input.targetValue,
      bonus_xp: input.bonusXp,
      ends_at: input.endsAt,
      created_by: input.createdBy,
    });
    if (error) throw error;
  },

  async createShopItem(input: {
    tenantId: string;
    organizationId: string;
    classGroupId: string;
    name: string;
    description: string;
    costXp: number;
    quantityRemaining: number | null;
    createdBy: string;
  }) {
    const { error } = await supabase.from("learning_reward_shop_items").insert({
      tenant_id: input.tenantId,
      organization_id: input.organizationId,
      class_group_id: input.classGroupId,
      name: input.name,
      description: input.description,
      cost_xp: input.costXp,
      quantity_remaining: input.quantityRemaining,
      created_by: input.createdBy,
    });
    if (error) throw error;
  },

  async updateClassChallengeStatus(id: string, status: "active" | "paused" | "ended") {
    const { error } = await supabase.from("learning_class_challenges")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },

  async updateShopItemStatus(id: string, status: "active" | "inactive") {
    const { error } = await supabase.from("learning_reward_shop_items")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },

  async getClassLeaderboardEnabled(classGroupId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc("get_learning_class_leaderboard_setting", {
      p_class_group_id: classGroupId,
    });
    if (error) throw error;
    return data === true;
  },

  async setClassLeaderboardEnabled(classGroupId: string, enabled: boolean): Promise<boolean> {
    const { data, error } = await supabase.rpc("set_learning_class_leaderboard_enabled", {
      p_class_group_id: classGroupId,
      p_enabled: enabled,
    });
    if (error) throw error;
    return data === true;
  },

  async createClassTeam(classGroupId: string, name: string, description: string): Promise<string> {
    const { data, error } = await supabase.rpc("create_learning_class_team", {
      p_class_group_id: classGroupId,
      p_name: name,
      p_description: description,
    });
    if (error) throw error;
    return data;
  },

  async listClassTeams(classGroupId: string) {
    const { data, error } = await supabase.rpc("get_learning_class_teams", {
      p_class_group_id: classGroupId,
    });
    if (error) throw error;
    return data ?? [];
  },

  async listClassTeamMembers(classGroupId: string) {
    const { data, error } = await supabase.rpc("get_learning_class_team_members", {
      p_class_group_id: classGroupId,
    });
    if (error) throw error;
    return data ?? [];
  },

  async assignStudentToTeam(classGroupId: string, teamId: string, studentUserId: string): Promise<string> {
    const { data, error } = await supabase.rpc("assign_learning_student_to_team", {
      p_class_group_id: classGroupId,
      p_team_id: teamId,
      p_student_user_id: studentUserId,
    });
    if (error) throw error;
    return data;
  },

  async createTeamChallenge(input: {
    classGroupId: string;
    title: string;
    description: string;
    targetType: "assignments_completed" | "xp_earned";
    targetValue: number;
    bonusXp: number;
    startsAt: string;
    endsAt: string;
  }): Promise<string> {
    const { data, error } = await supabase.rpc("create_learning_team_challenge", {
      p_class_group_id: input.classGroupId,
      p_title: input.title,
      p_description: input.description,
      p_target_type: input.targetType,
      p_target_value: input.targetValue,
      p_bonus_xp: input.bonusXp,
      p_starts_at: input.startsAt,
      p_ends_at: input.endsAt,
    });
    if (error) throw error;
    return data;
  },

  async listTeamChallenges(classGroupId: string) {
    const { data, error } = await supabase.rpc("get_learning_team_challenges", {
      p_class_group_id: classGroupId,
    });
    if (error) throw error;
    return data ?? [];
  },

  async setTeamChallengeStatus(challengeId: string, status: "active" | "paused" | "ended") {
    const { error } = await supabase.rpc("set_learning_team_challenge_status", {
      p_challenge_id: challengeId,
      p_status: status,
    });
    if (error) throw error;
  },

  async listTeamChallengeStandings(challengeId: string) {
    const { data, error } = await supabase.rpc("get_learning_team_challenge_standings", {
      p_challenge_id: challengeId,
    });
    if (error) throw error;
    return data ?? [];
  },

  async getStudentDailyXpGoal(): Promise<number> {
    const { data, error } = await supabase.rpc("get_learning_student_daily_xp_goal");
    if (error) throw error;
    return data ?? 20;
  },

  async setStudentDailyXpGoal(dailyXpGoal: number): Promise<number> {
    const { data, error } = await supabase.rpc("set_learning_student_daily_xp_goal", {
      p_daily_xp_goal: dailyXpGoal,
    });
    if (error) throw error;
    return data ?? 20;
  },

  async canManageSchoolCompetitions(): Promise<boolean> {
    const { data, error } = await supabase.rpc("has_permission", {
      permission_code: "learning.academic.manage",
    });
    if (error) throw error;
    return data === true;
  },

  async listSchoolCompetitions(organizationId: string) {
    const { data, error } = await supabase.rpc("get_learning_school_competitions", {
      p_organization_id: organizationId,
    });
    if (error) throw error;
    return data ?? [];
  },

  async createSchoolCompetition(input: {
    organizationId: string;
    title: string;
    description: string;
    targetType: "assignments_completed" | "xp_earned";
    targetValue: number;
    bonusXp: number;
    startsAt: string;
    endsAt: string;
  }): Promise<string> {
    const { data, error } = await supabase.rpc("create_learning_school_competition", {
      p_organization_id: input.organizationId,
      p_title: input.title,
      p_description: input.description,
      p_target_type: input.targetType,
      p_target_value: input.targetValue,
      p_bonus_xp: input.bonusXp,
      p_starts_at: input.startsAt,
      p_ends_at: input.endsAt,
    });
    if (error) throw error;
    return data;
  },

  async setSchoolCompetitionStatus(competitionId: string, status: "active" | "paused" | "ended") {
    const { error } = await supabase.rpc("set_learning_school_competition_status", {
      p_competition_id: competitionId,
      p_status: status,
    });
    if (error) throw error;
  },

  async listSchoolCompetitionStandings(competitionId: string) {
    const { data, error } = await supabase.rpc("get_learning_school_competition_standings", {
      p_competition_id: competitionId,
    });
    if (error) throw error;
    return data ?? [];
  },

  async listClassLeaderboard(classGroupId: string) {
    const { data, error } = await supabase.rpc("get_learning_class_leaderboard", {
      p_class_group_id: classGroupId,
    });
    if (error) throw error;
    return data ?? [];
  },
  async syncStudentBadgeAwards(): Promise<LearningBadgeAward[]> {
    const { data, error } = await supabase.rpc("sync_learning_badge_awards");
    if (error) throw error;
    return (data ?? []).map(mapBadgeAward);
  },

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
