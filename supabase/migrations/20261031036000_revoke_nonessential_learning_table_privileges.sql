-- Learning clients never need TRUNCATE, REFERENCES or TRIGGER privileges.
-- RLS does not constrain these table privileges, so remove them from API roles.
begin;

do $$
declare
  v_table record;
begin
  for v_table in
    select schemaname, tablename
    from pg_tables
    where schemaname = 'public'
      and left(tablename, 9) = 'learning_'
  loop
    execute format(
      'revoke truncate, references, trigger on table %I.%I from anon, authenticated',
      v_table.schemaname,
      v_table.tablename
    );
  end loop;
end;
$$;

-- Prevent future Learning tables created by the migration owner from inheriting
-- non-essential table privileges for anon/authenticated.
alter default privileges for role postgres
  revoke truncate, references, trigger on tables from anon, authenticated;

alter default privileges for role postgres in schema public
  revoke truncate, references, trigger on tables from anon, authenticated;

commit;
