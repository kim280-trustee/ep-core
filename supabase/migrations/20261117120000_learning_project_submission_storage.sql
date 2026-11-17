-- Private storage for student practical-project evidence.
-- Object paths: organization/assignment/content/student/filename
begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'learning-project-submissions',
  'learning-project-submissions',
  false,
  15728640,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'text/plain',
    'application/zip',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists learning_project_submissions_student_insert on storage.objects;
create policy learning_project_submissions_student_insert
on storage.objects for insert to authenticated
with check (
  bucket_id = 'learning-project-submissions'
  and cardinality(storage.foldername(name)) = 4
  and (storage.foldername(name))[4] = public.learning_current_user_id()::text
  and exists (
    select 1
    from public.learning_assignment_items ai
    join public.learning_assignments a on a.id = ai.assignment_id
    where a.id::text = (storage.foldername(name))[2]
      and ai.assignment_id = a.id
      and ai.organization_id::text = (storage.foldername(name))[1]
      and ai.content_item_id::text = (storage.foldername(name))[3]
      and ai.item_type = 'content'
      and a.organization_id = ai.organization_id
      and a.status = 'published'
      and (a.available_from is null or a.available_from <= now())
      and private.learning_student_has_assignment_target(a.id, public.learning_current_user_id())
  )
);

drop policy if exists learning_project_submissions_select on storage.objects;
create policy learning_project_submissions_select
on storage.objects for select to authenticated
using (
  bucket_id = 'learning-project-submissions'
  and cardinality(storage.foldername(name)) = 4
  and (
    (storage.foldername(name))[4] = public.learning_current_user_id()::text
    or public.learning_can_manage_academic_records(((storage.foldername(name))[1])::uuid)
    or exists (
      select 1
      from public.learning_content_responses r
      where r.organization_id::text = (storage.foldername(name))[1]
        and r.assignment_id::text = (storage.foldername(name))[2]
        and r.content_item_id::text = (storage.foldername(name))[3]
        and r.student_user_id::text = (storage.foldername(name))[4]
        and public.learning_teacher_can_manage_content_response(r.assignment_id, r.student_user_id)
    )
  )
);

drop policy if exists learning_project_submissions_student_delete on storage.objects;
create policy learning_project_submissions_student_delete
on storage.objects for delete to authenticated
using (
  bucket_id = 'learning-project-submissions'
  and cardinality(storage.foldername(name)) = 4
  and (storage.foldername(name))[4] = public.learning_current_user_id()::text
  and not exists (
    select 1
    from public.learning_content_responses r
    where r.assignment_id::text = (storage.foldername(name))[2]
      and r.content_item_id::text = (storage.foldername(name))[3]
      and r.student_user_id::text = (storage.foldername(name))[4]
      and r.status = 'submitted'
  )
);

commit;
