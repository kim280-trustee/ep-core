-- Database catalog smoke test for assessment-result gradebook integrity.
-- Run only after a full local Supabase migration replay, never against production.
begin;

do $mapping_catalog$
declare
  v_count integer;
  v_definer boolean;
  v_config text;
  v_changed_by_nullable text;
begin
  if to_regprocedure('private.learning_assessment_gradebook_mapping_is_valid(uuid)') is null then
    raise exception 'Assessment mapping validation helper is missing';
  end if;
  if to_regprocedure('private.exclude_assessment_gradebook_entries_for_mapping_change(uuid,uuid,uuid,uuid,text)') is null then
    raise exception 'Automatic mapping reconciliation helper is missing';
  end if;

  select count(*) into v_count
  from pg_trigger t
  where t.tgrelid = 'public.learning_assignment_items'::regclass
    and t.tgname = 'learning_assessment_assignment_item_mapping_guard'
    and not t.tgisinternal and t.tgenabled <> 'D';
  if v_count <> 1 then raise exception 'Assessment assignment-item mapping trigger is missing or disabled'; end if;

  select count(*) into v_count
  from pg_trigger t
  where t.tgrelid = 'public.learning_assignment_targets'::regclass
    and t.tgname = 'learning_assessment_assignment_target_mapping_guard'
    and not t.tgisinternal and t.tgenabled <> 'D';
  if v_count <> 1 then raise exception 'Assessment assignment-target mapping trigger is missing or disabled'; end if;

  select count(*) into v_count
  from pg_trigger t
  where t.tgrelid = 'public.learning_assignments'::regclass
    and t.tgname = 'learning_assessment_assignment_parent_mapping_guard'
    and not t.tgisinternal and t.tgenabled <> 'D';
  if v_count <> 1 then raise exception 'Assessment assignment parent-mapping trigger is missing or disabled'; end if;


  select count(*) into v_count
  from pg_trigger t
  where t.tgrelid = 'public.learning_terms'::regclass
    and t.tgname = 'learning_term_gradebook_retention_guard'
    and not t.tgisinternal and t.tgenabled <> 'D';
  if v_count <> 1 then raise exception 'Linked academic-term retention trigger is missing or disabled'; end if;

  select p.prosecdef, array_to_string(p.proconfig, ',')
    into v_definer, v_config
  from pg_proc p
  where p.oid = 'private.exclude_assessment_gradebook_entries_for_mapping_change(uuid,uuid,uuid,uuid,text)'::regprocedure;
  if not coalesce(v_definer, false) then raise exception 'Reconciliation helper must be SECURITY DEFINER'; end if;
  if coalesce(v_config, '') not like '%search_path=""%' then
    raise exception 'Reconciliation helper must use an empty search_path';
  end if;

  if has_function_privilege('anon',
    'private.exclude_assessment_gradebook_entries_for_mapping_change(uuid,uuid,uuid,uuid,text)',
    'EXECUTE') then
    raise exception 'Anonymous role must not execute the reconciliation helper';
  end if;
  if has_function_privilege('authenticated',
    'private.exclude_assessment_gradebook_entries_for_mapping_change(uuid,uuid,uuid,uuid,text)',
    'EXECUTE') then
    raise exception 'Authenticated role must not execute the reconciliation helper directly';
  end if;

  if not has_function_privilege('authenticated',
    'public.set_learning_gradebook_entry_included(uuid,boolean,text)',
    'EXECUTE') then
    raise exception 'Authenticated role must retain the audited inclusion RPC';
  end if;
  if has_function_privilege('anon',
    'public.set_learning_gradebook_entry_included(uuid,boolean,text)',
    'EXECUTE') then
    raise exception 'Anonymous role must not execute the audited inclusion RPC';
  end if;

  select is_nullable into v_changed_by_nullable
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'learning_gradebook_audit_log'
    and column_name = 'changed_by';
  if v_changed_by_nullable is distinct from 'NO' then
    raise exception 'Gradebook audit actor must remain mandatory';
  end if;
end;
$mapping_catalog$;

rollback;
