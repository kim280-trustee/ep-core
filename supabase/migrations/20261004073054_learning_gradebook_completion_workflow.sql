alter table public.learning_gradebook_entries
  add column if not exists status text not null default 'graded',
  add column if not exists comment text,
  add column if not exists late boolean not null default false;

alter table public.learning_term_grades
  add column if not exists override_score numeric,
  add column if not exists override_grade text,
  add column if not exists override_reason text;

alter table public.learning_gradebook_entries
  drop constraint if exists learning_gradebook_entries_status_check;
alter table public.learning_gradebook_entries
  add constraint learning_gradebook_entries_status_check
  check (status in ('graded','missing','absent','excused','pending'));

alter table public.learning_gradebook_entries
  drop constraint if exists learning_gradebook_entries_score_bounds_check;
alter table public.learning_gradebook_entries
  add constraint learning_gradebook_entries_score_bounds_check
  check (score >= 0 and max_score > 0 and score <= max_score);

alter table public.learning_term_grades
  drop constraint if exists learning_term_grades_override_score_check;
alter table public.learning_term_grades
  add constraint learning_term_grades_override_score_check
  check (override_score is null or (override_score >= 0 and override_score <= 100));

create table if not exists public.learning_gradebook_audit_log (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  term_id uuid not null,
  class_subject_id uuid not null,
  student_user_id uuid not null,
  gradebook_entry_id uuid,
  term_grade_id uuid,
  action text not null,
  before_data jsonb not null default '{}'::jsonb,
  after_data jsonb not null default '{}'::jsonb,
  reason text,
  changed_by uuid not null,
  changed_at timestamptz not null default now()
);
create index if not exists learning_gradebook_audit_student_idx
  on public.learning_gradebook_audit_log(class_subject_id,term_id,student_user_id,changed_at desc);
alter table public.learning_gradebook_audit_log enable row level security;
drop policy if exists learning_gradebook_audit_select on public.learning_gradebook_audit_log;
create policy learning_gradebook_audit_select on public.learning_gradebook_audit_log
for select to authenticated using (is_organization_member(organization_id) and learning_can_manage_academic_records(organization_id));

create or replace function public.update_learning_manual_gradebook_entry(
  p_entry_id uuid,p_title text,p_score numeric,p_max_score numeric,p_category_id uuid default null,
  p_status text default 'graded',p_comment text default null,p_late boolean default false,p_reason text default null
) returns uuid language plpgsql security definer set search_path to ''
as $function$
declare v_entry public.learning_gradebook_entries%rowtype;v_grade_status text;v_user uuid;v_weight numeric:=1;
begin
 v_user:=(select u.id from public.users u where u.auth_user_id=(select auth.uid()) limit 1);
 if v_user is null then raise exception 'Authentication is required';end if;
 select * into v_entry from public.learning_gradebook_entries where id=p_entry_id and source_type='manual' for update;
 if not found then raise exception 'Manual Gradebook entry was not found';end if;
 if not public.learning_can_manage_academic_records(v_entry.organization_id) then raise exception 'You are not allowed to manage academic records for this organization';end if;
 select status into v_grade_status from public.learning_term_grades where term_id=v_entry.term_id and class_subject_id=v_entry.class_subject_id and student_user_id=v_entry.student_user_id limit 1;
 if v_grade_status='finalized' then raise exception 'The term grade is finalized. Reopen it before editing this score';end if;
 if p_title is null or btrim(p_title)='' then raise exception 'Score title is required';end if;
 if p_max_score is null or p_max_score<=0 then raise exception 'Maximum score must be greater than zero';end if;
 if p_score is null or p_score<0 or p_score>p_max_score then raise exception 'Score must be between zero and the maximum score';end if;
 if p_status not in ('graded','missing','absent','excused','pending') then raise exception 'Invalid grade status';end if;
 if p_category_id is not null then
   select default_weight into v_weight from public.learning_gradebook_categories where id=p_category_id and organization_id=v_entry.organization_id and status='active';
   if v_weight is null then raise exception 'Gradebook category was not found or is inactive';end if;
 end if;
 update public.learning_gradebook_entries set title=btrim(p_title),score=p_score,max_score=p_max_score,category_id=p_category_id,weight=v_weight,
 status=p_status,comment=nullif(btrim(coalesce(p_comment,'')),''),late=coalesce(p_late,false),included_in_grade=(p_status='graded'),updated_by=v_user,updated_at=now()
 where id=p_entry_id;
 insert into public.learning_gradebook_audit_log(organization_id,term_id,class_subject_id,student_user_id,gradebook_entry_id,action,before_data,after_data,reason,changed_by)
 values(v_entry.organization_id,v_entry.term_id,v_entry.class_subject_id,v_entry.student_user_id,v_entry.id,'update_entry',to_jsonb(v_entry),
 (select to_jsonb(e) from public.learning_gradebook_entries e where e.id=v_entry.id),p_reason,v_user);
 return p_entry_id;
end;$function$;

create or replace function public.delete_learning_manual_gradebook_entry(p_entry_id uuid,p_reason text default null)
returns boolean language plpgsql security definer set search_path to ''
as $function$
declare v_entry public.learning_gradebook_entries%rowtype;v_grade_status text;v_user uuid;
begin
 v_user:=(select u.id from public.users u where u.auth_user_id=(select auth.uid()) limit 1);
 if v_user is null then raise exception 'Authentication is required';end if;
 select * into v_entry from public.learning_gradebook_entries where id=p_entry_id and source_type='manual' for update;
 if not found then raise exception 'Manual Gradebook entry was not found';end if;
 if not public.learning_can_manage_academic_records(v_entry.organization_id) then raise exception 'You are not allowed to manage academic records for this organization';end if;
 select status into v_grade_status from public.learning_term_grades where term_id=v_entry.term_id and class_subject_id=v_entry.class_subject_id and student_user_id=v_entry.student_user_id limit 1;
 if v_grade_status='finalized' then raise exception 'The term grade is finalized. Reopen it before deleting this score';end if;
 insert into public.learning_gradebook_audit_log(organization_id,term_id,class_subject_id,student_user_id,gradebook_entry_id,action,before_data,reason,changed_by)
 values(v_entry.organization_id,v_entry.term_id,v_entry.class_subject_id,v_entry.student_user_id,v_entry.id,'delete_entry',to_jsonb(v_entry),p_reason,v_user);
 delete from public.learning_gradebook_entries where id=p_entry_id;return true;
end;$function$;

create or replace function public.reopen_learning_term_grade(p_term_id uuid,p_class_subject_id uuid,p_student_user_id uuid,p_reason text)
returns uuid language plpgsql security definer set search_path to ''
as $function$
declare v_grade public.learning_term_grades%rowtype;v_user uuid;
begin
 v_user:=(select u.id from public.users u where u.auth_user_id=(select auth.uid()) limit 1);
 if v_user is null then raise exception 'Authentication is required';end if;
 select * into v_grade from public.learning_term_grades where term_id=p_term_id and class_subject_id=p_class_subject_id and student_user_id=p_student_user_id for update;
 if not found then raise exception 'Term grade was not found';end if;
 if not public.learning_can_manage_academic_records(v_grade.organization_id) then raise exception 'You are not allowed to manage academic records for this organization';end if;
 if v_grade.status<>'finalized' then return v_grade.id;end if;
 if p_reason is null or btrim(p_reason)='' then raise exception 'A reason is required';end if;
 insert into public.learning_gradebook_audit_log(organization_id,term_id,class_subject_id,student_user_id,term_grade_id,action,before_data,reason,changed_by)
 values(v_grade.organization_id,v_grade.term_id,v_grade.class_subject_id,v_grade.student_user_id,v_grade.id,'reopen_term_grade',to_jsonb(v_grade),p_reason,v_user);
 update public.learning_term_grades set status='draft',finalized_at=null,finalized_by=null,updated_at=now() where id=v_grade.id;
 return v_grade.id;
end;$function$;

create or replace function public.override_learning_term_grade(p_term_id uuid,p_class_subject_id uuid,p_student_user_id uuid,p_override_score numeric,p_override_grade text,p_reason text)
returns uuid language plpgsql security definer set search_path to ''
as $function$
declare v_grade public.learning_term_grades%rowtype;v_user uuid;
begin
 v_user:=(select u.id from public.users u where u.auth_user_id=(select auth.uid()) limit 1);
 if v_user is null then raise exception 'Authentication is required';end if;
 if p_override_score<0 or p_override_score>100 then raise exception 'Override percentage must be between 0 and 100';end if;
 if p_reason is null or btrim(p_reason)='' then raise exception 'An override reason is required';end if;
 select * into v_grade from public.learning_term_grades where term_id=p_term_id and class_subject_id=p_class_subject_id and student_user_id=p_student_user_id for update;
 if not found then raise exception 'Term grade was not found';end if;
 if not public.learning_can_manage_academic_records(v_grade.organization_id) then raise exception 'You are not allowed to manage academic records for this organization';end if;
 if v_grade.status='finalized' then raise exception 'Reopen the term grade before applying an override';end if;
 insert into public.learning_gradebook_audit_log(organization_id,term_id,class_subject_id,student_user_id,term_grade_id,action,before_data,reason,changed_by)
 values(v_grade.organization_id,v_grade.term_id,v_grade.class_subject_id,v_grade.student_user_id,v_grade.id,'override_term_grade',to_jsonb(v_grade),p_reason,v_user);
 update public.learning_term_grades set override_score=p_override_score,override_grade=nullif(btrim(coalesce(p_override_grade,'')),''),override_reason=btrim(p_reason),
 score=p_override_score,letter_grade=nullif(btrim(coalesce(p_override_grade,'')),'') ,updated_at=now() where id=v_grade.id;
 return v_grade.id;
end;$function$;

revoke all on function public.update_learning_manual_gradebook_entry(uuid,text,numeric,numeric,uuid,text,text,boolean,text) from public,anon;
grant execute on function public.update_learning_manual_gradebook_entry(uuid,text,numeric,numeric,uuid,text,text,boolean,text) to authenticated;
revoke all on function public.delete_learning_manual_gradebook_entry(uuid,text) from public,anon;
grant execute on function public.delete_learning_manual_gradebook_entry(uuid,text) to authenticated;
revoke all on function public.reopen_learning_term_grade(uuid,uuid,uuid,text) from public,anon;
grant execute on function public.reopen_learning_term_grade(uuid,uuid,uuid,text) to authenticated;
revoke all on function public.override_learning_term_grade(uuid,uuid,uuid,numeric,text,text) from public,anon;
grant execute on function public.override_learning_term_grade(uuid,uuid,uuid,numeric,text,text) to authenticated;

create index if not exists learning_gradebook_entries_status_idx on public.learning_gradebook_entries(class_subject_id,term_id,status);