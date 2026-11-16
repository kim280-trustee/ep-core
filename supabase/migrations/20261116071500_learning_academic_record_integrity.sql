-- Enforce term/calendar and gradebook class-subject consistency at the database boundary.
-- These checks protect both RPC and direct authenticated table writes.

begin;

do $$
begin
  if exists (
    select 1
    from public.learning_terms t
    join public.learning_academic_years ay
      on ay.id = t.academic_year_id
     and ay.organization_id = t.organization_id
    where t.starts_on < ay.starts_on
       or t.ends_on > ay.ends_on
  ) then
    raise exception 'Existing learning terms fall outside their academic-year date range; reconcile them before applying this migration.';
  end if;

  if exists (
    select 1
    from public.learning_gradebook_entries e
    join public.learning_terms t
      on t.id = e.term_id and t.organization_id = e.organization_id
    join public.learning_class_groups cg
      on cg.id = e.class_group_id and cg.organization_id = e.organization_id
    where t.academic_year_id <> cg.academic_year_id
  ) or exists (
    select 1
    from public.learning_term_grades g
    join public.learning_terms t
      on t.id = g.term_id and t.organization_id = g.organization_id
    join public.learning_class_groups cg
      on cg.id = g.class_group_id and cg.organization_id = g.organization_id
    where t.academic_year_id <> cg.academic_year_id
  ) then
    raise exception 'Existing gradebook records connect a class to a term from a different academic year; reconcile them before applying this migration.';
  end if;

  if exists (
    select 1
    from public.learning_gradebook_entries e
    join public.learning_class_subjects cs
      on cs.id = e.class_subject_id and cs.organization_id = e.organization_id
    where cs.class_group_id <> e.class_group_id
  ) or exists (
    select 1
    from public.learning_term_grades g
    join public.learning_class_subjects cs
      on cs.id = g.class_subject_id and cs.organization_id = g.organization_id
    where cs.class_group_id <> g.class_group_id
  ) then
    raise exception 'Existing gradebook records connect a class subject to a different class group; reconcile them before applying this migration.';
  end if;
end;
$$;

-- The class-subject relationship must belong to the exact same class group.
create unique index if not exists learning_class_subjects_org_group_id_id_uq
  on public.learning_class_subjects (organization_id, class_group_id, id);

alter table public.learning_gradebook_entries
  drop constraint if exists gradebook_entry_class_subject_fk;

alter table public.learning_gradebook_entries
  add constraint gradebook_entry_class_subject_group_fk
  foreign key (organization_id, class_group_id, class_subject_id)
  references public.learning_class_subjects (organization_id, class_group_id, id)
  on delete cascade;

alter table public.learning_term_grades
  drop constraint if exists term_grade_class_subject_fk;

alter table public.learning_term_grades
  add constraint term_grade_class_subject_group_fk
  foreign key (organization_id, class_group_id, class_subject_id)
  references public.learning_class_subjects (organization_id, class_group_id, id)
  on delete cascade;

create or replace function private.guard_learning_term_date_range()
returns trigger
language plpgsql
set search_path = ''
as $function$
declare
  v_year_starts_on date;
  v_year_ends_on date;
begin
  select ay.starts_on, ay.ends_on
    into v_year_starts_on, v_year_ends_on
  from public.learning_academic_years ay
  where ay.id = new.academic_year_id
    and ay.organization_id = new.organization_id;

  if not found then
    raise exception 'The selected academic year does not belong to this organization';
  end if;

  if new.starts_on < v_year_starts_on or new.ends_on > v_year_ends_on then
    raise exception 'Term dates must fall within the selected academic year';
  end if;

  return new;
end;
$function$;

drop trigger if exists learning_term_date_range_guard on public.learning_terms;
create trigger learning_term_date_range_guard
before insert or update of organization_id, academic_year_id, starts_on, ends_on
on public.learning_terms
for each row execute function private.guard_learning_term_date_range();

create or replace function private.guard_learning_academic_year_date_update()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  if exists (
    select 1
    from public.learning_terms t
    where t.organization_id = new.organization_id
      and t.academic_year_id = new.id
      and (t.starts_on < new.starts_on or t.ends_on > new.ends_on)
  ) then
    raise exception 'Academic-year dates cannot exclude dates from an existing term';
  end if;

  return new;
end;
$function$;

drop trigger if exists learning_academic_year_term_date_guard on public.learning_academic_years;
create trigger learning_academic_year_term_date_guard
before update of organization_id, starts_on, ends_on
on public.learning_academic_years
for each row execute function private.guard_learning_academic_year_date_update();

create or replace function private.guard_learning_gradebook_term_class_year()
returns trigger
language plpgsql
set search_path = ''
as $function$
declare
  v_term_academic_year_id uuid;
  v_class_academic_year_id uuid;
begin
  select t.academic_year_id
    into v_term_academic_year_id
  from public.learning_terms t
  where t.id = new.term_id
    and t.organization_id = new.organization_id;

  if not found then
    raise exception 'The selected term does not belong to this organization';
  end if;

  select cg.academic_year_id
    into v_class_academic_year_id
  from public.learning_class_groups cg
  where cg.id = new.class_group_id
    and cg.organization_id = new.organization_id;

  if not found then
    raise exception 'The selected class does not belong to this organization';
  end if;

  if v_term_academic_year_id <> v_class_academic_year_id then
    raise exception 'The selected term and class must belong to the same academic year';
  end if;

  return new;
end;
$function$;

drop trigger if exists learning_gradebook_entry_term_class_year_guard on public.learning_gradebook_entries;
create trigger learning_gradebook_entry_term_class_year_guard
before insert or update of organization_id, term_id, class_group_id
on public.learning_gradebook_entries
for each row execute function private.guard_learning_gradebook_term_class_year();

drop trigger if exists learning_term_grade_term_class_year_guard on public.learning_term_grades;
create trigger learning_term_grade_term_class_year_guard
before insert or update of organization_id, term_id, class_group_id
on public.learning_term_grades
for each row execute function private.guard_learning_gradebook_term_class_year();

revoke all on function private.guard_learning_term_date_range() from public, anon, authenticated;
revoke all on function private.guard_learning_academic_year_date_update() from public, anon, authenticated;
revoke all on function private.guard_learning_gradebook_term_class_year() from public, anon, authenticated;

commit;
