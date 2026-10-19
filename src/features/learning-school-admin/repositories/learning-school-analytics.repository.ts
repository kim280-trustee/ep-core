import { supabase } from "@/core/infrastructure/supabase/client";

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
  }): Promise<SchoolAnalyticsSummary> {
    const { organizationId, academicYearId, classGroupId } = input;

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
    let studentsQuery = supabase
      .from("learning_class_memberships")
      .select("user_id")
      .eq("organization_id", organizationId)
      .eq("membership_type", "student")
      .eq("status", "active");
    let teachersQuery = supabase
      .from("learning_class_memberships")
      .select("user_id")
      .eq("organization_id", organizationId)
      .eq("membership_type", "teacher")
      .eq("status", "active");
    if (classGroupId) {
      studentsQuery = studentsQuery.eq("class_group_id", classGroupId);
      teachersQuery = teachersQuery.eq("class_group_id", classGroupId);
    } else if (academicYearId) {
      if (visibleClassIds.length) {
        studentsQuery = studentsQuery.in("class_group_id", visibleClassIds);
        teachersQuery = teachersQuery.in("class_group_id", visibleClassIds);
      } else {
        return {
          organizationId,
          activeStudents: 0,
          activeTeachers: 0,
          activeClasses: activeClasses ?? 0,
          publishedAssignments: 0,
          trackedAssignmentRecords: 0,
          completedAssignmentRecords: 0,
          completionRate: null,
          incompleteAssignmentRecords: 0,
          refreshedAt: new Date().toISOString(),
        };
      }
    }
    const [{ data: studentMemberships, error: studentsError }, { data: teacherMemberships, error: teachersError }] = await Promise.all([
      studentsQuery,
      teachersQuery,
    ]);
    if (studentsError) throw studentsError;
    if (teachersError) throw teachersError;
    const activeStudents = new Set((studentMemberships ?? []).map((row) => row.user_id)).size;
    const activeTeachers = new Set((teacherMemberships ?? []).map((row) => row.user_id)).size;
    let assignmentIds: string[] = [];
    if (!classGroupId && !academicYearId) {
      const { data, error } = await supabase
        .from("learning_assignments")
        .select("id")
        .eq("organization_id", organizationId)
        .eq("status", "published");
      if (error) throw error;
      assignmentIds = (data ?? []).map((row) => row.id);
    } else if (visibleClassIds.length) {
      const [{ data: targets, error: targetsError }, { data: subjects, error: subjectsError }] = await Promise.all([
        supabase.from("learning_assignment_targets").select("assignment_id").in("class_group_id", visibleClassIds).eq("status", "active"),
        supabase.from("learning_class_subjects").select("id").in("class_group_id", visibleClassIds).eq("status", "active"),
      ]);
      if (targetsError) throw targetsError;
      if (subjectsError) throw subjectsError;
      const ids = new Set((targets ?? []).map((row) => row.assignment_id));
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
      const { data: progress, error } = await supabase
        .from("learning_assignment_progress")
        .select("id,status")
        .eq("organization_id", organizationId)
        .in("assignment_id", assignmentIds);
      if (error) throw error;
      trackedAssignmentRecords = (progress ?? []).length;
      completedAssignmentRecords = (progress ?? []).filter((row) => row.status === "completed").length;
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
