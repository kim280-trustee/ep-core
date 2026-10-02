import { learningGradebookRepository } from "../repositories/learning-gradebook.repository";
export const learningGradebookService={
 listCategories:(organizationId:string)=>learningGradebookRepository.listCategories(organizationId),
 listTerms:(organizationId:string)=>learningGradebookRepository.listTerms(organizationId),
 listEntries:(input:Parameters<typeof learningGradebookRepository.listEntries>[0])=>learningGradebookRepository.listEntries(input),
 listTermGrades:(input:Parameters<typeof learningGradebookRepository.listTermGrades>[0])=>learningGradebookRepository.listTermGrades(input),
 createCategory:(input:Parameters<typeof learningGradebookRepository.createCategory>[0])=>learningGradebookRepository.createCategory(input),
 createEntry:(input:Parameters<typeof learningGradebookRepository.createEntry>[0])=>learningGradebookRepository.createEntry(input),
 upsertTermGrade:(input:Parameters<typeof learningGradebookRepository.upsertTermGrade>[0])=>learningGradebookRepository.upsertTermGrade(input),
 createManualEntry:(input:Parameters<typeof learningGradebookRepository.createManualEntry>[0])=>learningGradebookRepository.createManualEntry(input),
 bulkImportEntries:(input:Parameters<typeof learningGradebookRepository.bulkImportEntries>[0])=>learningGradebookRepository.bulkImportEntries(input),
 calculateTermGrade:(input:Parameters<typeof learningGradebookRepository.calculateTermGrade>[0])=>learningGradebookRepository.calculateTermGrade(input),
 finalizeTermGrade:(input:Parameters<typeof learningGradebookRepository.finalizeTermGrade>[0])=>learningGradebookRepository.finalizeTermGrade(input),
};