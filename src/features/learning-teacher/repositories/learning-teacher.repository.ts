import type { Database } from "@/core/database/database.types";
import { supabase } from "@/core/infrastructure/supabase/client";
import { learningAcademicService } from "@/features/learning-academic";
import { learningAssignmentsService } from "@/features/learning-assignments";
import { learningEnrollmentService } from "@/features/learning-enrollment";
import { learningGradebookService } from "@/features/learning-gradebook";
import type {
  LearningAssignmentMonitor,
  LearningTeacherClass,
  LearningTeacherClassOverview,
  LearningTeacherStudent,
  LearningTeacherStudentAttention,
  LearningTeacherSubjectSummary,
} from "../types/learning-teacher.types";

type UserRow = Database["public"]["Tables"]["users"]["Row"];

export const learningTeacherRepository = {
  async listTeacherClasses(userId: string): Promise<LearningTeacherClass[]> {
    const memberships = (await learningEnrollmentService.listUserClasses(userId)).filter((item) => item.membershipType === "teacher");
    if (!memberships.length) return [];
    const classGroupIds = [...new Set(memberships.map((item) => item.classGroupId))];
    const { data: classGroups, error } = await supabase.from("learning_class_groups").select("*").in("id", classGroupIds);
    if (error) throw error;
    const groupsById = new Map((classGroups ?? []).map((group) => [group.id, {
      id: group.id, organizationId: group.organization_id, academicYearId: group.academic_year_id,
      curriculumId: group.curriculum_id, gradeLevelId: group.grade_level_id, code: group.code, name: group.name,
      status: group.status as "planned" | "active" | "archived", createdAt: group.created_at, updatedAt: group.updated_at,
    }]));
    const subjectCache = new Map<string, Awaited<ReturnType<typeof learningAcademicService.listSubjects>>[number]>();
    (await learningAcademicService.listSubjects()).forEach((subject) => subjectCache.set(subject.id, subject));
    const result: LearningTeacherClass[] = [];
    for (const membership of memberships) {
      const classGroup = groupsById.get(membership.classGroupId);
      if (!classGroup) continue;
      const classSubjects = await learningAcademicService.listClassSubjects(membership.organizationId, membership.classGroupId);
      result.push({
        classGroup, membership,
        subjects: classSubjects.map((classSubject) => {
          const subject = subjectCache.get(classSubject.subjectId);
          return subject ? { ...classSubject, subject } : null;
        }).filter((item): item is LearningTeacherClass["subjects"][number] => Boolean(item)),
      });
    }
    return result.sort((a, b) => a.classGroup.name.localeCompare(b.classGroup.name));
  },

  async getClassOverview(userId: string, classGroupId: string): Promise<LearningTeacherClassOverview> {
    const classes = await learningTeacherRepository.listTeacherClasses(userId);
    const classInfo = classes.find((item) => item.classGroup.id === classGroupId);
    if (!classInfo) throw new Error("You are not assigned to this class.");

    const [members, assignments, terms] = await Promise.all([
      learningEnrollmentService.listClassMembers(classGroupId),
      learningAssignmentsService.listAssignmentsForClass(classGroupId),
      learningGradebookService.listTerms(classInfo.membership.organizationId),
    ]);
    const studentMembers = members.filter((member) => member.membershipType === "student" && member.status === "active");
    const studentIds = studentMembers.map((member) => member.userId);
    const users = studentIds.length ? await supabase.from("users").select("id,name,email").in("id", studentIds).then(({ data, error }) => {
      if (error) throw error;
      return (data ?? []) as Pick<UserRow, "id" | "name" | "email">[];
    }) : [];
    const userMap = new Map(users.map((item) => [item.id, item]));
    const students: LearningTeacherStudent[] = studentMembers.map((membership) => {
      const item = userMap.get(membership.userId);
      return { membership, name: item?.name ?? "Student", email: item?.email ?? "" };
    });

    const classStudentIds = new Set(studentIds);
    const monitors = await Promise.all(assignments.map(async (assignment) => {
      const progress = await learningAssignmentsService.listProgressForAssignment(assignment.id);
      const studentProgress = progress.filter((item) => classStudentIds.has(item.studentUserId));
      return {
        assignment, studentCount: students.length,
        startedCount: studentProgress.filter((item) => item.status !== "not_started").length,
        completedCount: studentProgress.filter((item) => item.status === "completed").length,
        overdueCount: studentProgress.filter((item) => item.status === "overdue").length,
      } satisfies LearningAssignmentMonitor;
    }));

    const activeTerm = terms.find((term) => term.status === "active") ?? terms[0] ?? null;
    const gradeRows = activeTerm && classInfo.subjects.length ? (
      await Promise.all(classInfo.subjects.map(async (subject) => ({
        subject,
        grades: await learningGradebookService.listTermGrades({ termId: activeTerm.id, classSubjectId: subject.id }),
      })))
    ) : [];

    const subjects: LearningTeacherSubjectSummary[] = gradeRows.map(({ subject, grades }) => ({
      classSubjectId: subject.id,
      subjectName: subject.subject.name,
      averageScore: grades.length ? grades.reduce((sum, grade) => sum + grade.score, 0) / grades.length : null,
      gradedStudents: grades.length,
    }));

    const progressByStudent = new Map<string, number>();
    for (const monitor of monitors) {
      const progress = await learningAssignmentsService.listProgressForAssignment(monitor.assignment.id);
      for (const item of progress) {
        if (!classStudentIds.has(item.studentUserId) || item.status === "completed") continue;
        progressByStudent.set(item.studentUserId, (progressByStudent.get(item.studentUserId) ?? 0) + 1);
      }
    }

    const studentGradeScores = new Map<string, number[]>();
    for (const row of gradeRows) {
      for (const grade of row.grades) {
        const list = studentGradeScores.get(grade.studentUserId) ?? [];
        list.push(grade.score);
        studentGradeScores.set(grade.studentUserId, list);
      }
    }
    const attention: LearningTeacherStudentAttention[] = studentIds.map((studentUserId) => {
      const incompleteAssignments = progressByStudent.get(studentUserId) ?? 0;
      const scores = studentGradeScores.get(studentUserId) ?? [];
      const averageScore = scores.length ? scores.reduce((sum, value) => sum + value, 0) / scores.length : null;
      const reasons = [];
      if (incompleteAssignments > 0) reasons.push(incompleteAssignments + " incomplete assignment" + (incompleteAssignments === 1 ? "" : "s"));
      if (averageScore !== null && averageScore < 60) reasons.push("current average below 60%");
      return { studentUserId, incompleteAssignments, averageScore, reasons };
    }).filter((item) => item.reasons.length > 0);

    return {
      classInfo, students, assignments: monitors,
      performance: { termId: activeTerm?.id ?? null, termName: activeTerm?.name ?? null, subjects, attention },
    };
  },

  async getStudentProfile(userId: string, classGroupId: string, studentUserId: string) {
    const overview = await learningTeacherRepository.getClassOverview(userId, classGroupId);
    const student = overview.students.find((item) => item.membership.userId === studentUserId);
    if (!student) throw new Error("The student is not enrolled in this class.");
    return { classInfo: overview.classInfo, student, assignments: overview.assignments };
  },
};
