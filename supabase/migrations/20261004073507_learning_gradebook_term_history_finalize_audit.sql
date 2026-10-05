create table if not exists public.learning_term_grade_history (
  id uuid primary key default gen_random_uuid(),
  term_grade_id uuid not null,
  organization_id uuid not null,
  term_id uuid not null,
  class_subject_id uuid not null,
  student_user_id uuid not null,
  score numeric not null,
  letter_grade text,
  calculation jsonb not null default '{}'::jsonb,
  status text not null,
  finalized_at timestamptz,
  finalized_by uuid,
  snapshot_reason text,
  captured_at timestamptz not null default now()
);
create index if not exists learning_term_grade_history_student_idx on public.learning_term_grade_history(class_subject_id,term_id,student_user_id,captured_at desc);
alter table public.learning_term_grade_history enable row level security;
drop policy if exists learning_term_grade_history_select on public.learning_term_grade_history;
create policy learning_term_grade_history_select on public.learning_term_grade_history for select to authenticated using (is_organization_member(organization_id) and learning_can_manage_academic_records(organization_id));

create or replace function public.finalize_learning_term_grade(p_term_id uuid,p_class_subject_id uuid,p_student_user_id uuid)
returns uuid language plpgsql security definer set search_path to ''
as $function$
declare v_current_user_id uuid;v_organization_id uuid;v_grade public.learning_term_grades%rowtype;
begin
 if (select auth.uid()) is null then raise exception 'Authentication is required'; end if;
 select u.id into v_current_user_id from public.users u where u.auth_user_id=(select auth.uid()) limit 1;
 if v_current_user_id is null then raise exception 'Application user record was not found'; end if;
 select cs.organization_id into v_organization_id from public.learning_class_subjects cs where cs.id=p_class_subject_id and cs.status='active' limit 1;
 if v_organization_id is null then raise exception 'Class subject was not found or inactive'; end if;
 if not public.learning_can_manage_academic_records(v_organization_id) then raise exception 'You are not allowed to manage academic records for this organization'; end if;
 select * into v_grade from public.learning_term_grades where term_id=p_term_id and class_subject_id=p_class_subject_id and student_user_id=p_student_user_id for update;
 if not found then raise exception 'Calculate the term grade before finalizing it'; end if;
 if v_grade.status='finalized' then return v_grade.id; end if;
 insert into public.learning_term_grade_history(term_grade_id,organization_id,term_id,class_subject_id,student_user_id,score,letter_grade,calculation,status,finalized_at,finalized_by,snapshot_reason)
 values(v_grade.id,v_grade.organization_id,v_grade.term_id,v_grade.class_subject_id,v_grade.student_user_id,v_grade.score,v_grade.letter_grade,v_grade.calculation,'finalized',now(),v_current_user_id,'term_finalized');
 update public.learning_term_grades set status='finalized',finalized_at=now(),finalized_by=v_current_user_id,updated_at=now() where id=v_grade.id and status='draft';
 insert into public.learning_gradebook_audit_log(organization_id,term_id,class_subject_id,student_user_id,term_grade_id,action,before_data,after_data,reason,changed_by)
 values(v_grade.organization_id,v_grade.term_id,v_grade.class_subject_id,v_grade.student_user_id,v_grade.id,'finalize_term_grade',to_jsonb(v_grade),(select to_jsonb(g) from public.learning_term_grades g where g.id=v_grade.id),'term finalized',v_current_user_id);
 return v_grade.id;
end;$function$;

revoke all on function public.finalize_learning_term_grade(uuid,uuid,uuid) from public,anon;
grant execute on function public.finalize_learning_term_grade(uuid,uuid,uuid) to authenticated;