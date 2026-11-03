-- Protect response-derived Gradebook records from manual score edits/deletion.
-- Existing finalized rows are intentionally not rewritten: the finalized-entry
-- trigger preserves their snapshots. Legacy response-linked rows are protected
-- by the RPC guards below using notes.source = 'content_response'.

do $migration$
declare v_def text; v_new text;
begin
  select pg_get_functiondef('public.grade_learning_content_response(uuid,numeric,numeric,text)'::regprocedure) into v_def;
  if position($needle$'Content response', 'assignment', 'manual', v_response.assignment_id$needle$ in v_def)=0 then raise exception 'Response-grade insert fragment not found'; end if;
  v_new := replace(v_def,$needle$'Content response', 'assignment', 'manual', v_response.assignment_id$needle$,$replacement$'Content response', 'assignment', 'assignment', v_response.assignment_id$replacement$);
  execute v_new;

  select pg_get_functiondef('public.update_learning_manual_gradebook_entry(uuid,text,numeric,numeric,uuid,text,text,boolean,text)'::regprocedure) into v_def;
  if position($needle$if not found then raise exception 'Manual Gradebook entry was not found'; end if;$needle$ in v_def)=0 then raise exception 'Manual-update guard location not found'; end if;
  v_new := replace(v_def,$needle$if not found then raise exception 'Manual Gradebook entry was not found'; end if;$needle$,$replacement$if not found then raise exception 'Manual Gradebook entry was not found'; end if;
  if v_entry.notes->>'source' = 'content_response' then
    raise exception 'Response-derived grades must be corrected through the original content response workflow';
  end if;$replacement$);
  execute v_new;

  select pg_get_functiondef('public.delete_learning_manual_gradebook_entry(uuid,text)'::regprocedure) into v_def;
  if position($needle$if not found then raise exception 'Manual Gradebook entry was not found'; end if;$needle$ in v_def)=0 then raise exception 'Manual-delete guard location not found'; end if;
  v_new := replace(v_def,$needle$if not found then raise exception 'Manual Gradebook entry was not found'; end if;$needle$,$replacement$if not found then raise exception 'Manual Gradebook entry was not found'; end if;
  if v_entry.notes->>'source' = 'content_response' then
    raise exception 'Response-derived grades cannot be deleted from the Gradebook';
  end if;$replacement$);
  execute v_new;
end
$migration$;
