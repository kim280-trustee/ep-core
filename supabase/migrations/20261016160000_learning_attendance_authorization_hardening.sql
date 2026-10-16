-- Tighten attendance access to school managers and teachers assigned to the relevant class.
-- The initial register policies allowed every organization member to read and mutate attendance.
begin;

drop policy if exists learning_attendance_sessions_select on public.learning_attendance_sessions;
drop policy if exists learning_attendance_sessions_insert on public.learning_attendance_sessions;
drop policy if exists learning_attendance_sessions_update on public.learning_attendance_sessions;
drop policy if exists learning_attendance_records_select on public.learning_attendance_records;
drop policy if exists learning_attendance_records_insert on public.learning_attendance_records;
drop policy if exists learning_attendance_records_update on public.learning_attendance_records;
drop policy if exists learning_attendance_records_delete on public.learning_attendance_records;

create policy learning_attendance_sessions_select
  on public.learning_attendance_sessions for select to authenticated
  using (
    (public.has_permission('learning.academic.manage') and public.is_organization_member(organization_id))
    or exists (
      select 1
      from public.learning_class_memberships cm
      where cm.tenant_id = learning_attendance_sessions.tenant_id
        and cm.organization_id = learning_attendance_sessions.organization_id
        and cm.class_group_id = learning_attendance_sessions.class_group_id
        and cm.user_id = public.learning_current_user_id()
        and cm.membership_type = 'teacher'
        and cm.status = 'active'
    )
  );

create policy learning_attendance_sessions_insert
  on public.learning_attendance_sessions for insert to authenticated
  with check (
    taken_by = public.learning_current_user_id()
    and (
      (public.has_permission('learning.academic.manage') and public.is_organization_member(organization_id))
      or exists (
        select 1
        from public.learning_class_memberships cm
        where cm.tenant_id = learning_attendance_sessions.tenant_id
          and cm.organization_id = learning_attendance_sessions.organization_id
          and cm.class_group_id = learning_attendance_sessions.class_group_id
          and cm.user_id = public.learning_current_user_id()
          and cm.membership_type = 'teacher'
          and cm.status = 'active'
      )
    )
  );

create policy learning_attendance_sessions_update
  on public.learning_attendance_sessions for update to authenticated
  using (
    (public.has_permission('learning.academic.manage') and public.is_organization_member(organization_id))
    or exists (
      select 1
      from public.learning_class_memberships cm
      where cm.tenant_id = learning_attendance_sessions.tenant_id
        and cm.organization_id = learning_attendance_sessions.organization_id
        and cm.class_group_id = learning_attendance_sessions.class_group_id
        and cm.user_id = public.learning_current_user_id()
        and cm.membership_type = 'teacher'
        and cm.status = 'active'
    )
  )
  with check (
    taken_by = public.learning_current_user_id()
    and (
      (public.has_permission('learning.academic.manage') and public.is_organization_member(organization_id))
      or exists (
        select 1
        from public.learning_class_memberships cm
        where cm.tenant_id = learning_attendance_sessions.tenant_id
          and cm.organization_id = learning_attendance_sessions.organization_id
          and cm.class_group_id = learning_attendance_sessions.class_group_id
          and cm.user_id = public.learning_current_user_id()
          and cm.membership_type = 'teacher'
          and cm.status = 'active'
      )
    )
  );

create policy learning_attendance_records_select
  on public.learning_attendance_records for select to authenticated
  using (
    exists (
      select 1
      from public.learning_attendance_sessions s
      where s.id = learning_attendance_records.attendance_session_id
        and s.tenant_id = learning_attendance_records.tenant_id
        and s.organization_id = learning_attendance_records.organization_id
        and (
          (public.has_permission('learning.academic.manage') and public.is_organization_member(s.organization_id))
          or exists (
            select 1
            from public.learning_class_memberships cm
            where cm.tenant_id = s.tenant_id
              and cm.organization_id = s.organization_id
              and cm.class_group_id = s.class_group_id
              and cm.user_id = public.learning_current_user_id()
              and cm.membership_type = 'teacher'
              and cm.status = 'active'
          )
        )
    )
  );

create policy learning_attendance_records_insert
  on public.learning_attendance_records for insert to authenticated
  with check (
    marked_by = public.learning_current_user_id()
    and exists (
      select 1
      from public.learning_attendance_sessions s
      where s.id = learning_attendance_records.attendance_session_id
        and s.tenant_id = learning_attendance_records.tenant_id
        and s.organization_id = learning_attendance_records.organization_id
        and (
          (public.has_permission('learning.academic.manage') and public.is_organization_member(s.organization_id))
          or exists (
            select 1
            from public.learning_class_memberships teacher_cm
            where teacher_cm.tenant_id = s.tenant_id
              and teacher_cm.organization_id = s.organization_id
              and teacher_cm.class_group_id = s.class_group_id
              and teacher_cm.user_id = public.learning_current_user_id()
              and teacher_cm.membership_type = 'teacher'
              and teacher_cm.status = 'active'
          )
        )
        and exists (
          select 1
          from public.learning_class_memberships student_cm
          where student_cm.tenant_id = s.tenant_id
            and student_cm.organization_id = s.organization_id
            and student_cm.class_group_id = s.class_group_id
            and student_cm.user_id = learning_attendance_records.student_user_id
            and student_cm.membership_type = 'student'
            and student_cm.status = 'active'
        )
    )
  );

create policy learning_attendance_records_update
  on public.learning_attendance_records for update to authenticated
  using (
    exists (
      select 1
      from public.learning_attendance_sessions s
      where s.id = learning_attendance_records.attendance_session_id
        and s.tenant_id = learning_attendance_records.tenant_id
        and s.organization_id = learning_attendance_records.organization_id
        and (
          (public.has_permission('learning.academic.manage') and public.is_organization_member(s.organization_id))
          or exists (
            select 1
            from public.learning_class_memberships cm
            where cm.tenant_id = s.tenant_id
              and cm.organization_id = s.organization_id
              and cm.class_group_id = s.class_group_id
              and cm.user_id = public.learning_current_user_id()
              and cm.membership_type = 'teacher'
              and cm.status = 'active'
          )
        )
    )
  )
  with check (
    marked_by = public.learning_current_user_id()
    and exists (
      select 1
      from public.learning_attendance_sessions s
      where s.id = learning_attendance_records.attendance_session_id
        and s.tenant_id = learning_attendance_records.tenant_id
        and s.organization_id = learning_attendance_records.organization_id
        and (
          (public.has_permission('learning.academic.manage') and public.is_organization_member(s.organization_id))
          or exists (
            select 1
            from public.learning_class_memberships teacher_cm
            where teacher_cm.tenant_id = s.tenant_id
              and teacher_cm.organization_id = s.organization_id
              and teacher_cm.class_group_id = s.class_group_id
              and teacher_cm.user_id = public.learning_current_user_id()
              and teacher_cm.membership_type = 'teacher'
              and teacher_cm.status = 'active'
          )
        )
        and exists (
          select 1
          from public.learning_class_memberships student_cm
          where student_cm.tenant_id = s.tenant_id
            and student_cm.organization_id = s.organization_id
            and student_cm.class_group_id = s.class_group_id
            and student_cm.user_id = learning_attendance_records.student_user_id
            and student_cm.membership_type = 'student'
            and student_cm.status = 'active'
        )
    )
  );

create policy learning_attendance_records_delete
  on public.learning_attendance_records for delete to authenticated
  using (
    exists (
      select 1
      from public.learning_attendance_sessions s
      where s.id = learning_attendance_records.attendance_session_id
        and s.tenant_id = learning_attendance_records.tenant_id
        and s.organization_id = learning_attendance_records.organization_id
        and (
          (public.has_permission('learning.academic.manage') and public.is_organization_member(s.organization_id))
          or exists (
            select 1
            from public.learning_class_memberships cm
            where cm.tenant_id = s.tenant_id
              and cm.organization_id = s.organization_id
              and cm.class_group_id = s.class_group_id
              and cm.user_id = public.learning_current_user_id()
              and cm.membership_type = 'teacher'
              and cm.status = 'active'
          )
        )
    )
  );

commit;
