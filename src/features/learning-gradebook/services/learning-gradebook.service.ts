import { learningGradebookRepository } from "../repositories/learning-gradebook.repository";
export const learningGradebookService={
 listCategories:(organizationId:string)=>learningGradebookRepository.listCategories(organizationId),
 listTerms:(organizationId:string)=>learningGradebookRepository.listTerms(organizationId),
 listEntries:(input:Parameters<typeof learningGradebookRepository.listEntries>[0])=>learningGradebookRepository.listEntries(input),
 listTermGrades:(input:Parameters<typeof learningGradebookRepository.listTermGrades>[0])=>learningGradebookRepository.listTermGrades(input),
 createCategory:(input:Parameters<typeof learningGradebookRepository.createCategory>[0])=>learningGradebookRepository.createCategory(input),
 createEntry:(input:Parameters<typeof learningGradebookRepository.createEntry>[0])=>learningGradebookRepository.createEntry(input),
 upsertTermGrade:(input:Parameters<typeof learningGradebookRepository.upsertTermGrade>[0])=>learningGradebookRepository.upsertTermGrade(input),
};