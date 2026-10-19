begin;

create table if not exists public.learning_grade_scales (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  code text not null,
  name text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, code)
);

create table if not exists public.learning_grade_scale_rules (
  id uuid primary key default gen_random_uuid(),
  grade_scale_id uuid not null references public.learning_grade_scales(id) on delete cascade,
  min_percentage numeric(6,2) not null,
  max_percentage numeric(6,2) not null,
  grade numeric(4,2) not null,
  label text not null,
  sequence_no integer not null default 1,
  created_at timestamptz not null default now(),
  constraint learning_grade_scale_rules_range check (min_percentage >= 0 and max_percentage <= 100 and min_percentage <= max_percentage)
);

create index if not exists learning_grade_scale_rules_scale_idx on public.learning_grade_scale_rules(grade_scale_id, min_percentage desc);
alter table public.learning_class_subjects add column if not exists grading_method text not null default 'weighted_percentage';
alter table public.learning_class_subjects add column if not exists grade_scale_id uuid references public.learning_grade_scales(id);

alter table public.learning_grade_scales enable row level security;
alter table public.learning_grade_scale_rules enable row level security;

drop policy if exists learning_grade_scales_select on public.learning_grade_scales;
drop policy if exists learning_grade_scales_manage on public.learning_grade_scales;
drop policy if exists learning_grade_scale_rules_select on public.learning_grade_scale_rules;
drop policy if exists learning_grade_scale_rules_manage on public.learning_grade_scale_rules;

create policy learning_grade_scales_select on public.learning_grade_scales for select to authenticated using (is_organization_member(organization_id));
create policy learning_grade_scales_manage on public.learning_grade_scales for all to authenticated using (learning_can_manage_academic_records(organization_id)) with check (learning_can_manage_academic_records(organization_id));
create policy learning_grade_scale_rules_select on public.learning_grade_scale_rules for select to authenticated using (exists (select 1 from public.learning_grade_scales s where s.id=grade_scale_id and is_organization_member(s.organization_id)));
create policy learning_grade_scale_rules_manage on public.learning_grade_scale_rules for all to authenticated using (exists (select 1 from public.learning_grade_scales s where s.id=grade_scale_id and learning_can_manage_academic_records(s.organization_id))) with check (exists (select 1 from public.learning_grade_scales s where s.id=grade_scale_id and learning_can_manage_academic_records(s.organization_id)));

create or replace function public.create_learning_gradebook_bulk_entries(p_term_id uuid,p_class_subject_id uuid,p_rows jsonb)
returns integer language plpgsql security definer set search_path=''
as $function$
declare v_current_user_id uuid; v_organization_id uuid; v_class_group_id uuid; v_tenant_id uuid; v_count integer:=0; r jsonb; v_student_user_id uuid; v_title text; v_score numeric; v_max_score numeric; v_category_id uuid;
begin
 if (select auth.uid()) is null then raise exception 'Authentication is required'; end if;
 select u.id,u.tenant_id into v_current_user_id,v_tenant_id from public.users u where u.auth_user_id=(select auth.uid()) limit 1;
 if v_current_user_id is null then raise exception 'Application user record was not found'; end if;
 select cs.organization_id,cs.class_group_id into v_organization_id,v_class_group_id from public.learning_class_subjects cs where cs.id=p_class_subject_id and cs.status='active' limit 1;
 if v_organization_id is null then raise exception 'Class subject was not found or is inactive'; end if;
 if not public.learning_can_manage_academic_records(v_organization_id) then raise exception 'You are not allowed to manage academic records for this organization'; end if;
 if not exists(select 1 from public.learning_terms t where t.id=p_term_id and t.organization_id=v_organization_id) then raise exception 'Term does not belong to the selected organization'; end if;
 if jsonb_typeof(p_rows)<>'array' or jsonb_array_length(p_rows)=0 then raise exception 'No score rows were supplied'; end if;
 for r in select value from jsonb_array_elements(p_rows) loop
  v_student_user_id:=(r->>'studentUserId')::uuid; v_title:=nullif(btrim(r->>'title'),''); v_score:=(r->>'score')::numeric; v_max_score:=(r->>'maxScore')::numeric; v_category_id:=nullif(r->>'categoryId','')::uuid;
  if v_title is null then raise exception 'Every imported score needs an assessment title'; end if;
  if v_max_score is null or v_max_score<=0 then raise exception 'Maximum score must be greater than zero for %',v_title; end if;
  if v_score is null or v_score<0 or v_score>v_max_score then raise exception 'Score must be between zero and the maximum score for %',v_title; end if;
  if not exists(select 1 from public.learning_class_memberships cm where cm.organization_id=v_organization_id and cm.class_group_id=v_class_group_id and cm.user_id=v_student_user_id and cm.membership_type='student' and cm.status='active') then raise exception 'Imported student is not an active member of the selected class'; end if;
  if v_category_id is not null and not exists(select 1 from public.learning_gradebook_categories gc where gc.id=v_category_id and gc.organization_id=v_organization_id and gc.status='active') then raise exception 'Imported category is not valid for this organization'; end if;
  insert into public.learning_gradebook_entries(tenant_id,organization_id,term_id,class_group_id,class_subject_id,student_user_id,category_id,title,record_type,source_type,score,max_score,weight,included_in_grade,recorded_at,created_by,notes)
  values(v_tenant_id,v_organization_id,p_term_id,v_class_group_id,p_class_subject_id,v_student_user_id,v_category_id,v_title,'manual','manual',v_score,v_max_score,1,true,now(),v_current_user_id,jsonb_build_object('source','bulk_import'));
  v_count:=v_count+1;
 end loop;
 return v_count;
end;$function$;

revoke all on function public.create_learning_gradebook_bulk_entries(uuid,uuid,jsonb) from public;
grant execute on function public.create_learning_gradebook_bulk_entries(uuid,uuid,jsonb) to authenticated;

create or replace function public.calculate_learning_term_grade(p_term_id uuid,p_class_subject_id uuid,p_student_user_id uuid)
returns uuid language plpgsql security definer set search_path=''
as $function$
declare v_current_user_id uuid; v_tenant_id uuid; v_organization_id uuid; v_class_group_id uuid; v_grade_id uuid; v_existing_status text; v_entry_count integer; v_total_weight numeric; v_score numeric; v_calculation jsonb; v_grading_method text; v_grade_scale_id uuid; v_letter_grade text;
begin
 if (select auth.uid()) is null then raise exception 'Authentication is required'; end if;
 select u.id,u.tenant_id into v_current_user_id,v_tenant_id from public.users u where u.auth_user_id=(select auth.uid()) limit 1;
 if v_current_user_id is null then raise exception 'Application user record was not found'; end if;
 select cs.organization_id,cs.class_group_id,cs.grading_method,cs.grade_scale_id into v_organization_id,v_class_group_id,v_grading_method,v_grade_scale_id from public.learning_class_subjects cs where cs.id=p_class_subject_id and cs.status='active' limit 1;
 if v_organization_id is null then raise exception 'Class subject was not found or is inactive'; end if;
 if not public.learning_can_manage_academic_records(v_organization_id) then raise exception 'You are not allowed to manage academic records for this organization'; end if;
 if not exists(select 1 from public.learning_terms t where t.id=p_term_id and t.organization_id=v_organization_id) then raise exception 'Term does not belong to the selected organization'; end if;
 if not exists(select 1 from public.learning_class_memberships cm where cm.organization_id=v_organization_id and cm.class_group_id=v_class_group_id and cm.user_id=p_student_user_id and cm.membership_type='student' and cm.status='active') then raise exception 'Student is not an active member of the selected class'; end if;
 select tg.id,tg.status into v_grade_id,v_existing_status from public.learning_term_grades tg where tg.term_id=p_term_id and tg.class_subject_id=p_class_subject_id and tg.student_user_id=p_student_user_id limit 1;
 if v_existing_status='finalized' then raise exception 'The term grade is already finalized'; end if;
 select count(*)::integer,coalesce(sum(e.weight),0) into v_entry_count,v_total_weight from public.learning_gradebook_entries e where e.term_id=p_term_id and e.class_subject_id=p_class_subject_id and e.student_user_id=p_student_user_id and e.included_in_grade=true;
 if v_entry_count=0 then raise exception 'No included gradebook scores exist for this student'; end if;
 if coalesce(v_grading_method,'weighted_percentage')='points_total' then
  select round(100*sum(e.score)/nullif(sum(e.max_score),0),4) into v_score from public.learning_gradebook_entries e where e.term_id=p_term_id and e.class_subject_id=p_class_subject_id and e.student_user_id=p_student_user_id and e.included_in_grade=true;
 else
  if v_total_weight<=0 then raise exception 'Included gradebook weights must be greater than zero'; end if;
  select round(sum(e.percentage*e.weight)/nullif(sum(e.weight),0),4) into v_score from public.learning_gradebook_entries e where e.term_id=p_term_id and e.class_subject_id=p_class_subject_id and e.student_user_id=p_student_user_id and e.included_in_grade=true;
 end if;
 if v_grade_scale_id is not null then
  select r.label into v_letter_grade from public.learning_grade_scale_rules r where r.grade_scale_id=v_grade_scale_id and v_score between r.min_percentage and r.max_percentage order by r.sequence_no,r.min_percentage desc limit 1;
 end if;
 select jsonb_build_object('method',coalesce(v_grading_method,'weighted_percentage'),'entryCount',v_entry_count,'totalWeight',v_total_weight,'calculatedScore',v_score,'letterGrade',v_letter_grade,'calculatedAt',now(),'entries',coalesce((select jsonb_agg(jsonb_build_object('entryId',e.id,'title',e.title,'recordType',e.record_type,'percentage',e.percentage,'weight',e.weight) order by e.recorded_at,e.id) from public.learning_gradebook_entries e where e.term_id=p_term_id and e.class_subject_id=p_class_subject_id and e.student_user_id=p_student_user_id and e.included_in_grade=true),'[]'::jsonb)) into v_calculation;
 insert into public.learning_term_grades(tenant_id,organization_id,term_id,class_group_id,class_subject_id,student_user_id,score,letter_grade,status,calculation) values(v_tenant_id,v_organization_id,p_term_id,v_class_group_id,p_class_subject_id,p_student_user_id,v_score,v_letter_grade,'draft',v_calculation)
 on conflict(term_id,class_subject_id,student_user_id) do update set score=excluded.score,letter_grade=excluded.letter_grade,calculation=excluded.calculation,updated_at=now();
 select tg.id into v_grade_id from public.learning_term_grades tg where tg.term_id=p_term_id and tg.class_subject_id=p_class_subject_id and tg.student_user_id=p_student_user_id limit 1; return v_grade_id;
end;$function$;

commit;