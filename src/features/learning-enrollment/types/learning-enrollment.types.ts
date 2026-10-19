export type LearningClassMembershipType = "student" | "teacher";
export type LearningClassMembershipStatus = "invited" | "active" | "suspended" | "inactive";

export interface LearningClassMembership {
  id: string; tenantId: string; organizationId: string; classGroupId: string; userId: string;
  membershipType: LearningClassMembershipType; status: LearningClassMembershipStatus;
  joinedAt: string | null; createdAt: string; updatedAt: string;
}

export interface LearningClassMembershipInput {
  tenantId: string; organizationId: string; classGroupId: string; userId: string;
  membershipType: LearningClassMembershipType; status?: LearningClassMembershipStatus; joinedAt?: string | null;
}