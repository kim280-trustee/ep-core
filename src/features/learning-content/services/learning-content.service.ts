import { learningContentRepository } from "../repositories/learning-content.repository";

export const learningContentService = {
  listSkills: (subjectId?: string) => learningContentRepository.listSkills(subjectId),
  listTopics: (skillId?: string) => learningContentRepository.listTopics(skillId),
  listObjectives: (topicId?: string) => learningContentRepository.listObjectives(topicId),
  listPrerequisites: (objectiveId: string) => learningContentRepository.listPrerequisites(objectiveId),
  listAlignments: (objectiveId?: string, curriculumId?: string, gradeLevelId?: string) =>
    learningContentRepository.listAlignments(objectiveId, curriculumId, gradeLevelId),
  listContent: (organizationId?: string) => learningContentRepository.listContent(organizationId),
  listContentVersions: (contentItemId: string) => learningContentRepository.listContentVersions(contentItemId),
  listContentObjectives: (contentItemId: string) => learningContentRepository.listContentObjectives(contentItemId),
};
