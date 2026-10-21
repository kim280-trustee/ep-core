begin;

-- Finalized term grades are immutable snapshots. Existing RPCs check finalization,
-- but direct table updates (such as toggling included_in_grade) also need a
-- database-level guard so an authenticated manager cannot bypass those checks.
create or replace function public.learning_guard_finalized_gradebook_entry_mutation()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  if exists (
    select 1
    from public.learning_term_grades grade
    where grade.tenant_id = old.tenant_id
      and grade.organization_id = old.organization_id
      and grade.term_id = old.term_id
      and grade.class_subject_id = old.class_subject_id
      and grade.student_user_id = old.student_user_id
      and grade.status = 'finalized'
  ) then
    raise exception 'The term grade is finalized. Reopen it with an audit reason before changing or deleting an existing gradebook record.';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$function$;

revoke all on function public.learning_guard_finalized_gradebook_entry_mutation() from public, anon, authenticated;

drop trigger if exists learning_guard_finalized_gradebook_entry_update
  on public.learning_gradebook_entries;
create trigger learning_guard_finalized_gradebook_entry_update
before update or delete on public.learning_gradebook_entries
for each row
execute function public.learning_guard_finalized_gradebook_entry_mutation();

commit;
