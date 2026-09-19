export type LearningKnowledgeStatus = "active" | "inactive";
export type LearningContentStatus = "draft" | "review" | "published" | "retired";
export type LearningContentType =
  | "lesson" | "explanation" | "reading" | "listening" | "speaking" | "writing"
  | "worksheet" | "video" | "audio" | "interactive" | "reference" | "other";

export interface LearningSkill {
  id: string; subjectId: string; code: string; name: string; description: string | null;
  status: LearningKnowledgeStatus; createdAt: string; updatedAt: string;
}
export interface LearningTopic {
  id: string; skillId: string; code: string; name: string; description: string | null;
  sequenceNo: number; status: LearningKnowledgeStatus; createdAt: string; updatedAt: string;
}
export interface LearningObjective {
  id: string; topicId: string; code: string; name: string; description: string | null;
  sequenceNo: number; status: LearningKnowledgeStatus; createdAt: string; updatedAt: string;
}
export interface LearningObjectivePrerequisite {
  objectiveId: string; prerequisiteObjectiveId: string; createdAt: string;
}
export interface LearningObjectiveAlignment {
  id: string; objectiveId: string; curriculumId: string; gradeLevelId: string;
  sequenceNo: number; required: boolean; notes: string | null; createdAt: string; updatedAt: string;
}
export interface LearningContentItem {
  id: string; organizationId: string | null; code: string; title: string;
  contentType: LearningContentType; languageCode: string; status: LearningContentStatus;
  createdBy: string; updatedBy: string | null; reviewedBy: string | null; reviewedAt: string | null;
  metadata: Record<string, unknown>; createdAt: string; updatedAt: string;
}
export interface LearningContentVersion {
  id: string; contentItemId: string; versionNo: number; body: Record<string, unknown>;
  changeSummary: string | null; status: LearningContentStatus; createdBy: string;
  reviewedBy: string | null; reviewedAt: string | null; publishedAt: string | null;
  createdAt: string; updatedAt: string;
}
export interface LearningContentObjective {
  contentItemId: string; objectiveId: string; sequenceNo: number; createdAt: string;
}
