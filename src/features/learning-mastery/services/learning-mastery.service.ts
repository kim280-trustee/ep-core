import { learningMasteryRepository } from "../repositories/learning-mastery.repository";
export const learningMasteryService = {
  listStudentMastery: (studentUserId:string) => learningMasteryRepository.listStudentMastery(studentUserId),
  listMasteryEvents: (studentUserId:string) => learningMasteryRepository.listMasteryEvents(studentUserId),
  listRecommendations: (studentUserId:string) => learningMasteryRepository.listRecommendations(studentUserId),
  completeRecommendation: (id:string) => learningMasteryRepository.completeRecommendation(id),
  dismissRecommendation: (id:string) => learningMasteryRepository.dismissRecommendation(id),
};
