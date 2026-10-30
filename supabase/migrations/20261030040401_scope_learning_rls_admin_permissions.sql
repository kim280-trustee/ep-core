-- Replace tenant-wide academic-management permission predicates in existing
-- learning RLS policies with the active role's organization-scoped permission.
-- All other predicates, including teacher/class membership branches, are preserved.
begin;

ALTER POLICY "learning_academic_years_delete" ON public."learning_academic_years" USING (public.learning_can_manage_academic_records(organization_id));

ALTER POLICY "learning_academic_years_insert" ON public."learning_academic_years" WITH CHECK (public.learning_can_manage_academic_records(organization_id));

ALTER POLICY "learning_academic_years_update" ON public."learning_academic_years" USING (public.learning_can_manage_academic_records(organization_id)) WITH CHECK (public.learning_can_manage_academic_records(organization_id));

ALTER POLICY "learning_attendance_records_delete" ON public."learning_attendance_records" USING ((EXISTS ( SELECT 1
   FROM learning_attendance_sessions s
  WHERE ((s.id = learning_attendance_records.attendance_session_id) AND (s.tenant_id = learning_attendance_records.tenant_id) AND (s.organization_id = learning_attendance_records.organization_id) AND ((public.learning_can_manage_academic_records(s.organization_id)) OR (EXISTS ( SELECT 1
           FROM learning_class_memberships cm
          WHERE ((cm.tenant_id = s.tenant_id) AND (cm.organization_id = s.organization_id) AND (cm.class_group_id = s.class_group_id) AND (cm.user_id = learning_current_user_id()) AND (cm.membership_type = 'teacher'::text) AND (cm.status = 'active'::text)))))))));

ALTER POLICY "learning_attendance_records_insert" ON public."learning_attendance_records" WITH CHECK (((marked_by = learning_current_user_id()) AND (EXISTS ( SELECT 1
   FROM learning_attendance_sessions s
  WHERE ((s.id = learning_attendance_records.attendance_session_id) AND (s.tenant_id = learning_attendance_records.tenant_id) AND (s.organization_id = learning_attendance_records.organization_id) AND ((public.learning_can_manage_academic_records(s.organization_id)) OR (EXISTS ( SELECT 1
           FROM learning_class_memberships teacher_cm
          WHERE ((teacher_cm.tenant_id = s.tenant_id) AND (teacher_cm.organization_id = s.organization_id) AND (teacher_cm.class_group_id = s.class_group_id) AND (teacher_cm.user_id = learning_current_user_id()) AND (teacher_cm.membership_type = 'teacher'::text) AND (teacher_cm.status = 'active'::text))))) AND (EXISTS ( SELECT 1
           FROM learning_class_memberships student_cm
          WHERE ((student_cm.tenant_id = s.tenant_id) AND (student_cm.organization_id = s.organization_id) AND (student_cm.class_group_id = s.class_group_id) AND (student_cm.user_id = learning_attendance_records.student_user_id) AND (student_cm.membership_type = 'student'::text) AND (student_cm.status = 'active'::text)))))))));

ALTER POLICY "learning_attendance_records_select" ON public."learning_attendance_records" USING ((EXISTS ( SELECT 1
   FROM learning_attendance_sessions s
  WHERE ((s.id = learning_attendance_records.attendance_session_id) AND (s.tenant_id = learning_attendance_records.tenant_id) AND (s.organization_id = learning_attendance_records.organization_id) AND ((public.learning_can_manage_academic_records(s.organization_id)) OR (EXISTS ( SELECT 1
           FROM learning_class_memberships cm
          WHERE ((cm.tenant_id = s.tenant_id) AND (cm.organization_id = s.organization_id) AND (cm.class_group_id = s.class_group_id) AND (cm.user_id = learning_current_user_id()) AND (cm.membership_type = 'teacher'::text) AND (cm.status = 'active'::text)))))))));

ALTER POLICY "learning_attendance_records_update" ON public."learning_attendance_records" USING ((EXISTS ( SELECT 1
   FROM learning_attendance_sessions s
  WHERE ((s.id = learning_attendance_records.attendance_session_id) AND (s.tenant_id = learning_attendance_records.tenant_id) AND (s.organization_id = learning_attendance_records.organization_id) AND ((public.learning_can_manage_academic_records(s.organization_id)) OR (EXISTS ( SELECT 1
           FROM learning_class_memberships cm
          WHERE ((cm.tenant_id = s.tenant_id) AND (cm.organization_id = s.organization_id) AND (cm.class_group_id = s.class_group_id) AND (cm.user_id = learning_current_user_id()) AND (cm.membership_type = 'teacher'::text) AND (cm.status = 'active'::text))))))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM learning_attendance_sessions s
  WHERE ((s.id = learning_attendance_records.attendance_session_id) AND (s.tenant_id = learning_attendance_records.tenant_id) AND (s.organization_id = learning_attendance_records.organization_id) AND ((public.learning_can_manage_academic_records(s.organization_id)) OR (EXISTS ( SELECT 1
           FROM learning_class_memberships teacher_cm
          WHERE ((teacher_cm.tenant_id = s.tenant_id) AND (teacher_cm.organization_id = s.organization_id) AND (teacher_cm.class_group_id = s.class_group_id) AND (teacher_cm.user_id = learning_current_user_id()) AND (teacher_cm.membership_type = 'teacher'::text) AND (teacher_cm.status = 'active'::text))))) AND (EXISTS ( SELECT 1
           FROM learning_class_memberships student_cm
          WHERE ((student_cm.tenant_id = s.tenant_id) AND (student_cm.organization_id = s.organization_id) AND (student_cm.class_group_id = s.class_group_id) AND (student_cm.user_id = learning_attendance_records.student_user_id) AND (student_cm.membership_type = 'student'::text) AND (student_cm.status = 'active'::text))))))));

ALTER POLICY "learning_attendance_sessions_insert" ON public."learning_attendance_sessions" WITH CHECK (((taken_by = learning_current_user_id()) AND ((public.learning_can_manage_academic_records(organization_id)) OR (EXISTS ( SELECT 1
   FROM learning_class_memberships cm
  WHERE ((cm.tenant_id = learning_attendance_sessions.tenant_id) AND (cm.organization_id = learning_attendance_sessions.organization_id) AND (cm.class_group_id = learning_attendance_sessions.class_group_id) AND (cm.user_id = learning_current_user_id()) AND (cm.membership_type = 'teacher'::text) AND (cm.status = 'active'::text)))))));

ALTER POLICY "learning_attendance_sessions_select" ON public."learning_attendance_sessions" USING (((public.learning_can_manage_academic_records(organization_id)) OR (EXISTS ( SELECT 1
   FROM learning_class_memberships cm
  WHERE ((cm.tenant_id = learning_attendance_sessions.tenant_id) AND (cm.organization_id = learning_attendance_sessions.organization_id) AND (cm.class_group_id = learning_attendance_sessions.class_group_id) AND (cm.user_id = learning_current_user_id()) AND (cm.membership_type = 'teacher'::text) AND (cm.status = 'active'::text))))));

ALTER POLICY "learning_attendance_sessions_update" ON public."learning_attendance_sessions" USING (((public.learning_can_manage_academic_records(organization_id)) OR (EXISTS ( SELECT 1
   FROM learning_class_memberships cm
  WHERE ((cm.tenant_id = learning_attendance_sessions.tenant_id) AND (cm.organization_id = learning_attendance_sessions.organization_id) AND (cm.class_group_id = learning_attendance_sessions.class_group_id) AND (cm.user_id = learning_current_user_id()) AND (cm.membership_type = 'teacher'::text) AND (cm.status = 'active'::text)))))) WITH CHECK (((public.learning_can_manage_academic_records(organization_id)) OR (EXISTS ( SELECT 1
   FROM learning_class_memberships cm
  WHERE ((cm.tenant_id = learning_attendance_sessions.tenant_id) AND (cm.organization_id = learning_attendance_sessions.organization_id) AND (cm.class_group_id = learning_attendance_sessions.class_group_id) AND (cm.user_id = learning_current_user_id()) AND (cm.membership_type = 'teacher'::text) AND (cm.status = 'active'::text))))));

ALTER POLICY "learning_class_groups_delete" ON public."learning_class_groups" USING (public.learning_can_manage_academic_records(organization_id));

ALTER POLICY "learning_class_groups_insert" ON public."learning_class_groups" WITH CHECK (public.learning_can_manage_academic_records(organization_id));

ALTER POLICY "learning_class_groups_update" ON public."learning_class_groups" USING (public.learning_can_manage_academic_records(organization_id)) WITH CHECK (public.learning_can_manage_academic_records(organization_id));

ALTER POLICY "learning_class_memberships_delete" ON public."learning_class_memberships" USING (public.learning_can_manage_academic_records(organization_id));

ALTER POLICY "learning_class_memberships_insert" ON public."learning_class_memberships" WITH CHECK (public.learning_can_manage_academic_records(organization_id));

ALTER POLICY "learning_class_memberships_update" ON public."learning_class_memberships" USING (public.learning_can_manage_academic_records(organization_id)) WITH CHECK (public.learning_can_manage_academic_records(organization_id));

ALTER POLICY "learning_class_subjects_delete" ON public."learning_class_subjects" USING (public.learning_can_manage_academic_records(organization_id));

ALTER POLICY "learning_class_subjects_insert" ON public."learning_class_subjects" WITH CHECK (public.learning_can_manage_academic_records(organization_id));

ALTER POLICY "learning_class_subjects_update" ON public."learning_class_subjects" USING (public.learning_can_manage_academic_records(organization_id)) WITH CHECK (public.learning_can_manage_academic_records(organization_id));

ALTER POLICY "learning_terms_delete" ON public."learning_terms" USING (public.learning_can_manage_academic_records(organization_id));

ALTER POLICY "learning_terms_insert" ON public."learning_terms" WITH CHECK (public.learning_can_manage_academic_records(organization_id));

ALTER POLICY "learning_terms_update" ON public."learning_terms" USING (public.learning_can_manage_academic_records(organization_id)) WITH CHECK (public.learning_can_manage_academic_records(organization_id));

ALTER POLICY "learning_timetable_delete" ON public."learning_timetable_entries" USING ((public.learning_can_manage_academic_records(organization_id)));

ALTER POLICY "learning_timetable_insert" ON public."learning_timetable_entries" WITH CHECK (((created_by = learning_current_user_id()) AND public.learning_can_manage_academic_records(organization_id)));

ALTER POLICY "learning_timetable_update" ON public."learning_timetable_entries" USING ((public.learning_can_manage_academic_records(organization_id))) WITH CHECK ((public.learning_can_manage_academic_records(organization_id)));

ALTER POLICY "learning_vocabulary_entries_delete" ON public."learning_vocabulary_entries" USING ((public.learning_can_manage_academic_records(organization_id) OR (EXISTS ( SELECT 1
   FROM (learning_class_memberships cm
     JOIN users u ON (((u.id = cm.user_id) AND (u.tenant_id = cm.tenant_id))))
  WHERE ((cm.tenant_id = learning_vocabulary_entries.tenant_id) AND (cm.organization_id = learning_vocabulary_entries.organization_id) AND (cm.membership_type = 'teacher'::text) AND (cm.status = 'active'::text) AND (u.auth_user_id = ( SELECT auth.uid() AS uid)))))));

ALTER POLICY "learning_vocabulary_entries_insert" ON public."learning_vocabulary_entries" WITH CHECK (((tenant_id = ( SELECT u.tenant_id
   FROM users u
  WHERE (u.auth_user_id = ( SELECT auth.uid() AS uid))
 LIMIT 1)) AND (created_by = ( SELECT u.id
   FROM users u
  WHERE (u.auth_user_id = ( SELECT auth.uid() AS uid))
 LIMIT 1)) AND (updated_by = ( SELECT u.id
   FROM users u
  WHERE (u.auth_user_id = ( SELECT auth.uid() AS uid))
 LIMIT 1)) AND (public.learning_can_manage_academic_records(organization_id) OR (EXISTS ( SELECT 1
   FROM (learning_class_memberships cm
     JOIN users u ON (((u.id = cm.user_id) AND (u.tenant_id = cm.tenant_id))))
  WHERE ((cm.tenant_id = learning_vocabulary_entries.tenant_id) AND (cm.organization_id = learning_vocabulary_entries.organization_id) AND (cm.user_id = learning_vocabulary_entries.created_by) AND (cm.membership_type = 'teacher'::text) AND (cm.status = 'active'::text) AND (u.auth_user_id = ( SELECT auth.uid() AS uid))))))));

ALTER POLICY "learning_vocabulary_entries_select" ON public."learning_vocabulary_entries" USING ((((status = 'published'::text) AND (is_organization_member(organization_id) OR (EXISTS ( SELECT 1
   FROM (learning_class_memberships cm
     JOIN users u ON (((u.id = cm.user_id) AND (u.tenant_id = cm.tenant_id))))
  WHERE ((cm.tenant_id = learning_vocabulary_entries.tenant_id) AND (cm.organization_id = learning_vocabulary_entries.organization_id) AND (cm.status = 'active'::text) AND (u.auth_user_id = ( SELECT auth.uid() AS uid))))))) OR public.learning_can_manage_academic_records(organization_id) OR (EXISTS ( SELECT 1
   FROM (learning_class_memberships cm
     JOIN users u ON (((u.id = cm.user_id) AND (u.tenant_id = cm.tenant_id))))
  WHERE ((cm.tenant_id = learning_vocabulary_entries.tenant_id) AND (cm.organization_id = learning_vocabulary_entries.organization_id) AND (cm.membership_type = 'teacher'::text) AND (cm.status = 'active'::text) AND (u.auth_user_id = ( SELECT auth.uid() AS uid)))))));

ALTER POLICY "learning_vocabulary_entries_update" ON public."learning_vocabulary_entries" USING ((public.learning_can_manage_academic_records(organization_id) OR (EXISTS ( SELECT 1
   FROM (learning_class_memberships cm
     JOIN users u ON (((u.id = cm.user_id) AND (u.tenant_id = cm.tenant_id))))
  WHERE ((cm.tenant_id = learning_vocabulary_entries.tenant_id) AND (cm.organization_id = learning_vocabulary_entries.organization_id) AND (cm.membership_type = 'teacher'::text) AND (cm.status = 'active'::text) AND (u.auth_user_id = ( SELECT auth.uid() AS uid))))))) WITH CHECK (((tenant_id = ( SELECT u.tenant_id
   FROM users u
  WHERE (u.auth_user_id = ( SELECT auth.uid() AS uid))
 LIMIT 1)) AND (updated_by = ( SELECT u.id
   FROM users u
  WHERE (u.auth_user_id = ( SELECT auth.uid() AS uid))
 LIMIT 1)) AND (public.learning_can_manage_academic_records(organization_id) OR (EXISTS ( SELECT 1
   FROM (learning_class_memberships cm
     JOIN users u ON (((u.id = cm.user_id) AND (u.tenant_id = cm.tenant_id))))
  WHERE ((cm.tenant_id = learning_vocabulary_entries.tenant_id) AND (cm.organization_id = learning_vocabulary_entries.organization_id) AND (cm.membership_type = 'teacher'::text) AND (cm.status = 'active'::text) AND (u.auth_user_id = ( SELECT auth.uid() AS uid))))))));

commit;
