-- Validate assignment runtime items before an assignment becomes visible to students.
begin;

create or replace function private.guard_learning_assignment_publication()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if new.status <> 'published' then
    return new;
  end if;

  if not exists (
    select 1 from public.learning_assignment_items ai
    where ai.assignment_id = new.id
  ) then
    raise exception 'An assignment needs at least one learning item before publishing';
  end if;

  if not exists (
    select 1 from public.learning_assignment_items ai
    where ai.assignment_id = new.id and ai.required = true
  ) then
    raise exception 'An assignment needs at least one required learning item before publishing';
  end if;

  if exists (
    select 1
    from public.learning_assignment_items ai
    where ai.assignment_id = new.id
      and (
        ai.organization_id is distinct from new.organization_id
        or (
          ai.item_type = 'content'
          and not exists (
            select 1
            from public.learning_content_items ci
            where ci.id = ai.content_item_id
              and (ci.organization_id is null or ci.organization_id = new.organization_id)
              and ci.status = 'published'
              and exists (
                select 1 from public.learning_content_versions cv
                where cv.content_item_id = ci.id
                  and cv.status = 'published'
                  and cv.published_at is not null
              )
          )
        )
        or (
          ai.item_type = 'assessment'
          and not exists (
            select 1 from public.learning_assessments a
            where a.id = ai.assessment_id
              and a.organization_id = new.organization_id
              and a.status = 'published'
          )
        )
      )
  ) then
    raise exception 'Every assignment item must belong to the assignment organization and be published';
  end if;

  return new;
end;
$function$;

revoke all on function private.guard_learning_assignment_publication() from public, anon, authenticated;

drop trigger if exists learning_assignments_publication_guard on public.learning_assignments;
create trigger learning_assignments_publication_guard
before insert or update of status on public.learning_assignments
for each row execute function private.guard_learning_assignment_publication();

commit;
