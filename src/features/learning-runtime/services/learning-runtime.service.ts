import { learningAssignmentsService } from "@/features/learning-assignments";
import { learningActivityService } from "@/features/learning-activity";
import { learningEnrollmentService } from "@/features/learning-enrollment";
import { learningMasteryService } from "@/features/learning-mastery";

export const learningRuntimeService = {
  async getStudentOverview(studentUserId:string) {
    const [assignments,progress,mastery,recommendations,recentActivity]=await Promise.all([
      learningAssignmentsService.listStudentAssignments(),
      learningAssignmentsService.listProgress(studentUserId),
      learningMasteryService.listStudentMastery(studentUserId),
      learningMasteryService.listRecommendations(studentUserId),
      learningActivityService.listRecentEvents(studentUserId),
    ]);
    return {assignments,progress,mastery,recommendations,recentActivity};
  },
  async getTeacherClassOverview(classGroupId:string) {
    const [members,assignments]=await Promise.all([
      learningEnrollmentService.listClassMembers(classGroupId),
      learningAssignmentsService.listAssignmentsForClass(classGroupId),
    ]);
    return {members,assignments};
  },
};