import { supabase } from "@/core/infrastructure/supabase/client";

function localMidnightUtc(date: string, timezone: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const targetUtc = Date.UTC(year, month - 1, day);
  let guess = targetUtc;
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const parts = Object.fromEntries(
        formatter.formatToParts(new Date(guess))
          .filter((part) => part.type !== "literal")
          .map((part) => [part.type, part.value]),
      );
      const observedUtc = Date.UTC(
        Number(parts.year),
        Number(parts.month) - 1,
        Number(parts.day),
        Number(parts.hour),
        Number(parts.minute),
        Number(parts.second),
      );
      guess += targetUtc - observedUtc;
    }
  } catch {
    // Fall back to UTC only if an organisation has an invalid timezone value.
  }
  return new Date(guess).toISOString();
}


export interface SchoolAnalyticsSummary {
  organizationId: string;
  activeStudents: number;
  activeTeachers: number;
  activeClasses: number;
  publishedAssignments: number;
  trackedAssignmentRecords: number;
  completedAssignmentRecords: number;
  completionRate: number | null;
  incompleteAssignmentRecords: number;
  refreshedAt: string;
}

export const learningSchoolAnalyticsRepository = {
  async getSummary(input: {
    organizationId: string;
    academicYearId?: string;
    classGroupId?: string;
    classSubjectId?: string;
    activityFrom?: string;
    activityTo?: string;
    timezone?: string;
  }): Promise<SchoolAnalyticsSummary> {
    const { organizationId, academicYearId, classGroupId, classSubjectId, activityFrom, activityTo, timezone = "UTC" } = input;

    let classesQuery = supabase
      .from("learning_class_groups")
      .select("id", { count: "exact" })
      .eq("organization_id", organizationId)
      .eq("status", "active");
    if (academicYearId) classesQuery = classesQuery.eq("academic_year_id", academicYearId);
    if (classGroupId) classesQuery = classesQuery.eq("id", classGroupId);
    const { data: classRows, count: activeClasses, error: classesError } = await classesQuery;
    if (classesError) throw classesError;

    const visibleClassIds = (classRows ?? []).map((row) => row.id);
    let studentMemberships: Array<{ user_id: string }> = [];
    let teacherMemberships: Array<{ user_id: string }> = [];
    // Count memberships only when they belong to an active class in the selected scope.
    // This prevents inactive-class memberships inflating school-wide totals.
    if (visibleClassIds.length) {
      const studentsQuery = supabase
        .from("learning_class_memberships")
        .select("user_id")
        .eq("organization_id", organizationId)
        .eq("membership_type", "student")
        .eq("status", "active")
        .in("class_group_id", visibleClassIds);
      const teachersQuery = supabase
        .from("learning_class_memberships")
        .select("user_id")
        .eq("organization_id", organizationId)
        .eq("membership_type", "teacher")
        .eq("status", "active")
        .in("class_group_id", visibleClassIds);
      const [{ data: students, error: studentsError }, { data: teachers, error: teachersError }] = await Promise.all([
        studentsQuery,
        teachersQuery,
      ]);
      if (studentsError) throw studentsError;
      if (teachersError) throw teachersError;
      studentMemberships = students ?? [];
      teacherMemberships = teachers ?? [];
    }
    const activeStudents = new Set((studentMemberships ?? []).map((row) => row.user_id)).size;
    const activeTeachers = new Set((teacherMemberships ?? []).map((row) => row.user_id)).size;
    let assignmentIds: string[] = [];
    if (classSubjectId) {
      // Validate the selected subject against the active class scope before using it.
      // Never trust a client-supplied class-subject ID on its own.
      const { data: scopedSubjects, error: scopedSubjectsError } = await supabase
        .from("learning_class_subjects")
        .select("id")
        .eq("organization_id", organizationId)
        .eq("status", "active")
        .eq("id", classSubjectId)
        .in("class_group_id", visibleClassIds);
      if (scopedSubjectsError) throw scopedSubjectsError;
      const validSubjectIds = (scopedSubjects ?? []).map((row) => row.id);
      if (validSubjectIds.length) {
        const { data, error } = await supabase
          .from("learning_assignments")
          .select("id")
          .eq("organization_id", organizationId)
          .eq("status", "published")
          .eq("class_subject_id", classSubjectId);
        if (error) throw error;
        assignmentIds = (data ?? []).map((row) => row.id);
      }
    } else if (!classGroupId && !academicYearId) {
      const { data, error } = await supabase
        .from("learning_assignments")
        .select("id")
        .eq("organization_id", organizationId)
        .eq("status", "published");
      if (error) throw error;
      assignmentIds = (data ?? []).map((row) => row.id);
    } else if (visibleClassIds.length) {
      const [{ data: classTargets, error: targetsError }, { data: subjects, error: subjectsError }] = await Promise.all([
        supabase.from("learning_assignment_targets").select("assignment_id").eq("organization_id", organizationId).in("class_group_id", visibleClassIds).eq("status", "active"),
        supabase.from("learning_class_subjects").select("id").eq("organization_id", organizationId).in("class_group_id", visibleClassIds).eq("status", "active"),
      ]);
      if (targetsError) throw targetsError;
      if (subjectsError) throw subjectsError;
      // In class/year scope, only include assignments explicitly targeted to
      // the selected classes or attached to their active class subjects. A student
      // may belong to multiple classes, so their individual targets alone must not
      // pull unrelated assignments from another class into this report.
      const ids = new Set((classTargets ?? []).map((row) => row.assignment_id));
      const classSubjectIds = (subjects ?? []).map((row) => row.id);
      if (classSubjectIds.length) {
        const { data: subjectAssignments, error } = await supabase
          .from("learning_assignments")
          .select("id")
          .eq("organization_id", organizationId)
          .eq("status", "published")
          .in("class_subject_id", classSubjectIds);
        if (error) throw error;
        (subjectAssignments ?? []).forEach((row) => ids.add(row.id));
      }
      if (ids.size) {
        const { data, error } = await supabase
          .from("learning_assignments")
          .select("id")
          .eq("organization_id", organizationId)
          .eq("status", "published")
          .in("id", [...ids]);
        if (error) throw error;
        assignmentIds = (data ?? []).map((row) => row.id);
      }
    }

    let trackedAssignmentRecords = 0;
    let completedAssignmentRecords = 0;
    if (assignmentIds.length) {
      // Progress is attached to an assignment target. Count only progress for active
      // targets, and when a class/year filter is selected, only targets that belong
      // to the selected classes or to students actively enrolled in those classes.
      const { data: targets, error: targetsError } = await supabase
        .from("learning_assignment_targets")
        .select("id,student_user_id,class_group_id")
        .eq("organization_id", organizationId)
        .eq("status", "active")
        .in("assignment_id", assignmentIds);
      if (targetsError) throw targetsError;

      const selectedStudentIds = new Set(studentMemberships.map((row) => row.user_id));
      const targetIds = (targets ?? [])
        .filter((target) => {
          if (!classGroupId && !academicYearId) return true;
          if (target.class_group_id) return visibleClassIds.includes(target.class_group_id);
          // A direct-to-student target has no class_group_id. Include it only when
          // the assignment itself is already in the selected class/subject scope.
          return Boolean(target.student_user_id && selectedStudentIds.has(target.student_user_id));
        })
        .map((target) => target.id);

      if (targetIds.length) {
        let progressQuery = supabase
          .from("learning_assignment_progress")
          .select("id,status")
          .eq("organization_id", organizationId)
          .in("assignment_id", assignmentIds)
          .in("assignment_target_id", targetIds);
        if (activityFrom) progressQuery = progressQuery.gte("last_activity_at", localMidnightUtc(activityFrom, timezone));
        if (activityTo) {
          const [year, month, day] = activityTo.split("-").map(Number);
          const nextDate = new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10);
          progressQuery = progressQuery.lt("last_activity_at", localMidnightUtc(nextDate, timezone));
        }
        const { data: progress, error } = await progressQuery;
        if (error) throw error;
        trackedAssignmentRecords = (progress ?? []).length;
        completedAssignmentRecords = (progress ?? []).filter((row) => row.status === "completed").length;
      }
    }

    return {
      organizationId,
      activeStudents: activeStudents ?? 0,
      activeTeachers: activeTeachers ?? 0,
      activeClasses: activeClasses ?? 0,
      publishedAssignments: assignmentIds.length,
      trackedAssignmentRecords,
      completedAssignmentRecords,
      completionRate: trackedAssignmentRecords
        ? (completedAssignmentRecords / trackedAssignmentRecords) * 100
        : null,
      incompleteAssignmentRecords: trackedAssignmentRecords - completedAssignmentRecords,
      refreshedAt: new Date().toISOString(),
    };
  },
};
