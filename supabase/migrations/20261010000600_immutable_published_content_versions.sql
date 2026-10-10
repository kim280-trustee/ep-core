-- Published learning-content versions are immutable.
begin;

revoke update on table public.learning_content_versions from public, anon, authenticated;
grant update (status, reviewed_by, reviewed_at, published_at, updated_at)
  on table public.learning_content_versions to authenticated;

drop policy if exists learning_content_versions_update on public.learning_content_versions;
create policy learning_content_versions_update
on public.learning_content_versions for update to authenticated
using (
  status in ('draft', 'review')
  and exists (
    select 1 from public.learning_content_items ci
    where ci.id = learning_content_versions.content_item_id
      and ci.organization_id is not null
      and is_organization_member(ci.organization_id)
  )
)
with check (
  status in ('draft', 'review', 'published')
  and exists (
    select 1 from public.learning_content_items ci
    where ci.id = learning_content_versions.content_item_id
      and ci.organization_id is not null
      and is_organization_member(ci.organization_id)
  )
);

drop policy if exists learning_content_versions_delete on public.learning_content_versions;
create policy learning_content_versions_delete
on public.learning_content_versions for delete to authenticated
using (
  status in ('draft', 'review')
  and exists (
    select 1 from public.learning_content_items ci
    where ci.id = learning_content_versions.content_item_id
      and ci.organization_id is not null
      and is_organization_member(ci.organization_id)
  )
);

commit;
