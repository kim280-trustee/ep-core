import type { Database } from "@/core/database/database.types";
import { supabase } from "@/core/infrastructure/supabase/client";
import { learningAcademicService } from "@/features/learning-academic";
import { learningAssignmentsService } from "@/features/learning-assignments";
import { learningEnrollmentService } from "@/features/learning-enrollment";
import type {
  LearningAssignmentMonitor,
  LearningTeacherClass,
  LearningTeacherClassOverview,
  LearningTeacherStudent,
} from "../types/learning-teacher.types";

type UserRow = Database["public"]["Tables"]["users"]["Row"];

export const learningTeacherRepository = {
  async listTeacherClasses(userId: string): Promise<LearningTeacherClass[]> {
    const memberships = (await learningEnrollmentService.listUserClasses(userId))
      .filter((item) => item.membershipType === "teacher");

    if (!memberships.length) return [];

    const organizationIds = [...new Set(memberships.map((item) => item.organizationId))];
    const groupsById = new Map<string, LearningTeacherClass["classGroup"]>();

    await Promise.all(
      organizationIds.map(async (organizationId) => {
        const groups = await learningAcademicService.listClassGroups(organizationId);
        groups.forEach((group) => groupsById.set(group.id, group));
      }),
    );

    const subjectCache = new Map<string, Awaited<ReturnType<typeof learningAcademicService.listSubjects>>[number]>();
    const subjects = await learningAcademicService.listSubjects();
    subjects.forEach((subject) => subjectCache.set(subject.id, subject));

    const result: LearningTeacherClass[] = [];
    for (const membership of memberships) {
      const classGroup = groupsById.get(membership.classGroupId);
      if (!classGroup) continue;
      const classSubjects = await learningAcademicService.listClassSubjects(
        membership.organizationId,
        membership.classGroupId,
      );
      result.push({
        classGroup,
        membership,
        subjects: classSubjects
          .map((classSubject) => {
            const subject = subjectCache.get(classSubject.subjectId);
            return subject ? { ...classSubject, subject } : null;
          })
          .filter((item): item is LearningTeacherClass["subjects"][number] => Boolean(item)),
      });
    }

    return result.sort((a, b) => a.classGroup.name.localeCompare(b.classGroup.name));
  },

  async getClassOverview(userId: string, classGroupId: string): Promise<LearningTeacherClassOverview> {
    const classes = await learningTeacherRepository.listTeacherClasses(userId);
    const classInfo = classes.find((item) => item.classGroup.id === classGroupId);
    if (!classInfo) throw new Error("You are not assigned to this class.");

    const [members, assignments] = await Promise.all([
      learningEnrollmentService.listClassMembers(classGroupId),
      learningAssignmentsService.listAssignmentsForClass(classGroupId),
    ]);

    const studentMembers = members.filter(
      (member) => member.membershipType === "student" && member.status === "active",
    );

    const users = studentMembers.length
      ? await supabase
          .from("users")
          .select("id,name,email")
          .in("id", studentMembers.map((member) => member.userId))
          .then(({ data, error }) => {
            if (error) throw error;
            return (data ?? []) as Pick<UserRow, "id" | "name" | "email">[];
          })
      : [];

    const userMap = new Map(users.map((user) => [user.id, user]));
    const students: LearningTeacherStudent[] = studentMembers.map((membership) => {
      const user = userMap.get(membership.userId);
      return {
        membership,
        name: user?.name ?? "Student",
        email: user?.email ?? "",
      };
    });

    const monitors = await Promise.all(
      assignments.map(async (assignment) => {
        const progress = await learningAssignmentsService.listProgressForAssignment(assignment.id);
        const classStudentIds = new Set(studentMembers.map((member) => member.userId));
        const studentProgress = progress.filter((item) => classStudentIds.has(item.studentUserId));
        return {
          assignment,
          studentCount: students.length,
          startedCount: studentProgress.filter((item) => item.status !== "not_started").length,
          completedCount: studentProgress.filter((item) => item.status === "completed").length,
          overdueCount: studentProgress.filter((item) => item.status === "overdue").length,
        } satisfies LearningAssignmentMonitor;
      }),
    );

    return { classInfo, students, assignments: monitors };
  },
};
