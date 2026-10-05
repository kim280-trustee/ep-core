-- Secure teacher access to student content responses.
create or replace function public.learning_teacher_can_manage_content_response(p_assignment_id uuid,p_student_user_id uuid)
returns boolean
language sql stable security definer set search_path=''
as $$
 select exists(
  select 1 from public.learning_assignments a
  join public.learning_class_subjects cs on cs.id=a.class_subject_id
  join public.learning_class_memberships tm on tm.class_group_id=cs.class_group_id and tm.membership_type='teacher' and tm.status='active'
  join public.users tu on tu.id=tm.user_id and tu.auth_user_id=auth.uid()
  join public.learning_class_memberships sm on sm.class_group_id=cs.class_group_id and sm.user_id=p_student_user_id and sm.membership_type='student' and sm.status='active'
  where a.id=p_assignment_id
 );
$$;
revoke all on function public.learning_teacher_can_manage_content_response(uuid,uuid) from public,anon;
grant execute on function public.learning_teacher_can_manage_content_response(uuid,uuid) to authenticated;

drop policy if exists learning_content_responses_student_select on public.learning_content_responses;
drop policy if exists learning_content_responses_select on public.learning_content_responses;
create policy learning_content_responses_select on public.learning_content_responses for select using (
 student_user_id=learning_current_user_id()
 or student_user_id in (select private.learning_parent_student_ids())
 or learning_can_manage_academic_records(organization_id)
 or learning_teacher_can_manage_content_response(assignment_id,student_user_id)
);

drop policy if exists learning_content_responses_student_update on public.learning_content_responses;
drop policy if exists learning_content_responses_update on public.learning_content_responses;
create policy learning_content_responses_update on public.learning_content_responses for update using (
 (student_user_id=learning_current_user_id() and status='draft')
 or learning_can_manage_academic_records(organization_id)
 or learning_teacher_can_manage_content_response(assignment_id,student_user_id)
) with check (
 (student_user_id=learning_current_user_id() and status in ('draft','submitted'))
 or learning_can_manage_academic_records(organization_id)
 or learning_teacher_can_manage_content_response(assignment_id,student_user_id)
);