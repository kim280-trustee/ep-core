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
      and exists (
        select 1
        from public.learning_content_versions cv
        where cv.content_item_id = ai.content_item_id
          and cv.status = 'published'
          and exists (
            select 1
            from jsonb_array_elements(
              case when jsonb_typeof(cv.body->'sections') = 'array'
                then cv.body->'sections' else '[]'::jsonb end
            ) section
            where section->>'type' = 'project_activity'
          )
      )
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
    or exists (
      select 1
      from public.learning_content_responses admin_response
      where admin_response.organization_id::text = (storage.foldername(name))[1]
        and admin_response.assignment_id::text = (storage.foldername(name))[2]
        and admin_response.content_item_id::text = (storage.foldername(name))[3]
        and admin_response.student_user_id::text = (storage.foldername(name))[4]
        and public.learning_can_manage_academic_records(admin_response.organization_id)
    )
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

create or replace function private.enforce_learning_project_submission_file_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_folders text[];
  v_existing_count integer;
begin
  if new.bucket_id <> 'learning-project-submissions' then
    return new;
  end if;

  v_folders := storage.foldername(new.name);
  if cardinality(v_folders) <> 4 then
    raise exception 'Invalid project evidence storage path';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext(array_to_string(v_folders, '/'))::bigint
  );

  select count(*)::integer into v_existing_count
  from storage.objects o
  where o.bucket_id = 'learning-project-submissions'
    and storage.foldername(o.name) = v_folders;

  if v_existing_count >= 3 then
    raise exception 'A practical project can include no more than 3 evidence files';
  end if;

  return new;
end;
$function$;

drop trigger if exists learning_project_submission_file_limit on storage.objects;
create trigger learning_project_submission_file_limit
before insert on storage.objects
for each row
execute function private.enforce_learning_project_submission_file_limit();

commit;
