-- Academic administration is distinct from the POS settings-management permission.
insert into public.permissions (code, description)
values ('learning.academic.manage', 'Manage school academic years, terms, classes, subjects, and class rosters')
on conflict (code) do update
set description = excluded.description;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.code = 'learning.academic.manage'
where r.name in ('OWNER', 'MANAGER')
  and not exists (
    select 1 from public.role_permissions rp
    where rp.role_id = r.id and rp.permission_id = p.id
  );

-- School setup is an administrative workflow. Organization membership alone
-- grants access to read academic data, but does not grant permission to mutate it.
-- Keep the existing organization boundary and require the established settings.manage
-- permission for writes. This uses the existing core RBAC model and adds no new role.

drop policy if exists learning_academic_years_manage on public.learning_academic_years;
create policy learning_academic_years_insert on public.learning_academic_years
for insert to authenticated
with check (public.is_organization_member(organization_id) and public.has_permission('learning.academic.manage'));
create policy learning_academic_years_update on public.learning_academic_years
for update to authenticated
using (public.is_organization_member(organization_id) and public.has_permission('learning.academic.manage'))
with check (public.is_organization_member(organization_id) and public.has_permission('learning.academic.manage'));
create policy learning_academic_years_delete on public.learning_academic_years
for delete to authenticated
using (public.is_organization_member(organization_id) and public.has_permission('learning.academic.manage'));

drop policy if exists learning_terms_manage on public.learning_terms;
create policy learning_terms_insert on public.learning_terms
for insert to authenticated
with check (public.is_organization_member(organization_id) and public.has_permission('learning.academic.manage'));
create policy learning_terms_update on public.learning_terms
for update to authenticated
using (public.is_organization_member(organization_id) and public.has_permission('learning.academic.manage'))
with check (public.is_organization_member(organization_id) and public.has_permission('learning.academic.manage'));
create policy learning_terms_delete on public.learning_terms
for delete to authenticated
using (public.is_organization_member(organization_id) and public.has_permission('learning.academic.manage'));

drop policy if exists learning_class_groups_manage on public.learning_class_groups;
create policy learning_class_groups_insert on public.learning_class_groups
for insert to authenticated
with check (public.is_organization_member(organization_id) and public.has_permission('learning.academic.manage'));
create policy learning_class_groups_update on public.learning_class_groups
for update to authenticated
using (public.is_organization_member(organization_id) and public.has_permission('learning.academic.manage'))
with check (public.is_organization_member(organization_id) and public.has_permission('learning.academic.manage'));
create policy learning_class_groups_delete on public.learning_class_groups
for delete to authenticated
using (public.is_organization_member(organization_id) and public.has_permission('learning.academic.manage'));

drop policy if exists learning_class_subjects_manage on public.learning_class_subjects;
create policy learning_class_subjects_insert on public.learning_class_subjects
for insert to authenticated
with check (public.is_organization_member(organization_id) and public.has_permission('learning.academic.manage'));
create policy learning_class_subjects_update on public.learning_class_subjects
for update to authenticated
using (public.is_organization_member(organization_id) and public.has_permission('learning.academic.manage'))
with check (public.is_organization_member(organization_id) and public.has_permission('learning.academic.manage'));
create policy learning_class_subjects_delete on public.learning_class_subjects
for delete to authenticated
using (public.is_organization_member(organization_id) and public.has_permission('learning.academic.manage'));

drop policy if exists learning_class_memberships_insert on public.learning_class_memberships;
create policy learning_class_memberships_insert on public.learning_class_memberships
for insert to authenticated
with check (public.is_organization_member(organization_id) and public.has_permission('learning.academic.manage'));
drop policy if exists learning_class_memberships_update on public.learning_class_memberships;
create policy learning_class_memberships_update on public.learning_class_memberships
for update to authenticated
using (public.is_organization_member(organization_id) and public.has_permission('learning.academic.manage'))
with check (public.is_organization_member(organization_id) and public.has_permission('learning.academic.manage'));
drop policy if exists learning_class_memberships_delete on public.learning_class_memberships;
create policy learning_class_memberships_delete on public.learning_class_memberships
for delete to authenticated
using (public.is_organization_member(organization_id) and public.has_permission('learning.academic.manage'));


-- Keep term dates inside their parent academic year even when writes bypass the UI.
create schema if not exists private;

create or replace function private.validate_learning_term_date_range()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $function$
declare
  v_year record;
begin
  select starts_on, ends_on
    into v_year
    from public.learning_academic_years
   where id = new.academic_year_id
     and organization_id = new.organization_id;

  if not found then
    raise exception 'The academic year does not belong to this school.'
      using errcode = '23503';
  end if;

  if new.starts_on < v_year.starts_on or new.ends_on > v_year.ends_on then
    raise exception 'Term dates must fall within the selected academic year.'
      using errcode = '23514';
  end if;

  return new;
end;
$function$;

create or replace function private.prevent_academic_year_shrinking_over_terms()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $function$
begin
  if exists (
    select 1
      from public.learning_terms t
     where t.academic_year_id = new.id
       and (t.starts_on < new.starts_on or t.ends_on > new.ends_on)
  ) then
    raise exception 'Academic-year dates cannot exclude an existing term.'
      using errcode = '23514';
  end if;

  return new;
end;
$function$;

drop trigger if exists learning_terms_validate_date_range on public.learning_terms;
create trigger learning_terms_validate_date_range
before insert or update of organization_id, academic_year_id, starts_on, ends_on
on public.learning_terms
for each row execute function private.validate_learning_term_date_range();

drop trigger if exists learning_academic_years_preserve_term_range on public.learning_academic_years;
create trigger learning_academic_years_preserve_term_range
before update of starts_on, ends_on
on public.learning_academic_years
for each row execute function private.prevent_academic_year_shrinking_over_terms();
