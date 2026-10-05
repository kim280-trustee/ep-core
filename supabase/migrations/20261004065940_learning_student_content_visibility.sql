create or replace function private.learning_content_visible(target_content_id uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public', 'pg_catalog'
as $function$
  select exists (
    select 1
    from public.learning_assignment_items ai
    join public.learning_assignments a on a.id = ai.assignment_id
    where ai.content_item_id = target_content_id
      and a.status = 'published'
      and private.learning_assignment_visible(a.id)
  );
$function$;

revoke all on function private.learning_content_visible(uuid) from public;
grant execute on function private.learning_content_visible(uuid) to authenticated;

drop policy if exists learning_content_items_read on public.learning_content_items;

create policy learning_content_items_read
on public.learning_content_items
for select
to authenticated
using (
  (organization_id is null and status = 'published')
  or (
    organization_id is not null
    and (
      is_organization_member(organization_id)
      or (status = 'published' and (select private.learning_content_visible(id)))
    )
  )
);

drop policy if exists learning_content_versions_read on public.learning_content_versions;

create policy learning_content_versions_read
on public.learning_content_versions
for select
to authenticated
using (
  exists (
    select 1
    from public.learning_content_items ci
    where ci.id = learning_content_versions.content_item_id
      and (
        (ci.organization_id is null and ci.status = 'published')
        or (
          ci.organization_id is not null
          and (
            is_organization_member(ci.organization_id)
            or (
              ci.status = 'published'
              and learning_content_versions.status = 'published'
              and (select private.learning_content_visible(ci.id))
            )
          )
        )
      )
  )
);