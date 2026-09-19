import { learningContentRepository } from "../repositories/learning-content.repository";
export const learningContentService={
  listSkills:(subjectId?:string)=>learningContentRepository.listSkills(subjectId),
  listTopics:(skillId?:string)=>learningContentRepository.listTopics(skillId),
  listObjectives:(topicId?:string)=>learningContentRepository.listObjectives(topicId),
  listPrerequisites:(objectiveId:string)=>learningContentRepository.listPrerequisites(objectiveId),
  listAlignments:(objectiveId?:string,curriculumId?:string,gradeLevelId?:string)=>learningContentRepository.listAlignments(objectiveId,curriculumId,gradeLevelId),
  listContent:(organizationId?:string)=>learningContentRepository.listContent(organizationId),
  listContentVersions:(id:string)=>learningContentRepository.listContentVersions(id),
  listContentObjectives:(id:string)=>learningContentRepository.listContentObjectives(id),
  createContent:(input:Parameters<typeof learningContentRepository.createContent>[0])=>learningContentRepository.createContent(input),
  createVersion:(input:Parameters<typeof learningContentRepository.createVersion>[0])=>learningContentRepository.createVersion(input),
  addObjective:(input:Parameters<typeof learningContentRepository.addObjective>[0])=>learningContentRepository.addObjective(input),
  updateContentStatus:(id:string,status:Parameters<typeof learningContentRepository.updateContentStatus>[1],reviewerId?:string)=>learningContentRepository.updateContentStatus(id,status,reviewerId),
  updateVersionStatus:(id:string,status:Parameters<typeof learningContentRepository.updateVersionStatus>[1],reviewerId?:string)=>learningContentRepository.updateVersionStatus(id,status,reviewerId),
};
