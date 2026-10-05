create table if not exists public.learning_content_responses (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references public.organizations(id) on delete cascade,
 assignment_id uuid not null references public.learning_assignments(id) on delete cascade,
 content_item_id uuid not null references public.learning_content_items(id) on delete cascade,
 content_version_id uuid references public.learning_content_versions(id) on delete set null,
 student_user_id uuid not null references public.users(id) on delete cascade,
 response_text text not null default '',
 status text not null default 'draft' check (status in ('draft','submitted')),
 score numeric check (score is null or score >= 0),
 max_score numeric check (max_score is null or max_score > 0),
 teacher_feedback text,
 submitted_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique (assignment_id,content_item_id,student_user_id)
);
create index if not exists learning_content_responses_student_assignment_idx on public.learning_content_responses(student_user_id,assignment_id);
create index if not exists learning_content_responses_content_status_idx on public.learning_content_responses(content_item_id,status);
alter table public.learning_content_responses enable row level security;
grant select,insert,update on public.learning_content_responses to authenticated;
drop policy if exists learning_content_responses_student_insert on public.learning_content_responses;
create policy learning_content_responses_student_insert on public.learning_content_responses for insert to authenticated with check (student_user_id=public.learning_current_user_id() and private.learning_student_has_assignment_target(assignment_id,student_user_id));
drop policy if exists learning_content_responses_student_select on public.learning_content_responses;
create policy learning_content_responses_student_select on public.learning_content_responses for select to authenticated using (student_user_id=public.learning_current_user_id() or student_user_id in (select private.learning_parent_student_ids()) or public.learning_can_manage_academic_records(organization_id));
drop policy if exists learning_content_responses_student_update on public.learning_content_responses;
create policy learning_content_responses_student_update on public.learning_content_responses for update to authenticated using ((student_user_id=public.learning_current_user_id() and status='draft') or public.learning_can_manage_academic_records(organization_id)) with check ((student_user_id=public.learning_current_user_id() and status in ('draft','submitted')) or public.learning_can_manage_academic_records(organization_id));

create or replace function public.grade_learning_content_response(p_response_id uuid,p_score numeric,p_max_score numeric,p_teacher_feedback text default null)
returns uuid language plpgsql security definer set search_path=public,private as $$
declare v_response public.learning_content_responses%rowtype; v_assignment public.learning_assignments%rowtype; v_target public.learning_assignment_targets%rowtype; v_class_subject public.learning_class_subjects%rowtype; v_term_id uuid; v_category_id uuid; v_objective_id uuid; v_topic_id uuid; v_entry_id uuid; v_pct numeric;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 select * into v_response from public.learning_content_responses where id=p_response_id for update;
 if not found then raise exception 'Content response not found'; end if;
 if not public.learning_can_manage_academic_records(v_response.organization_id) then raise exception 'Academic record management permission required'; end if;
 if p_score is null or p_max_score is null or p_max_score<=0 or p_score<0 or p_score>p_max_score then raise exception 'Score must be between 0 and the maximum score'; end if;
 select * into v_assignment from public.learning_assignments where id=v_response.assignment_id;
 if not found or v_assignment.organization_id<>v_response.organization_id then raise exception 'Assignment not found'; end if;
 select * into v_target from public.learning_assignment_targets where assignment_id=v_response.assignment_id and student_user_id=v_response.student_user_id and status='active' order by created_at desc limit 1;
 if not found then raise exception 'Active assignment target not found'; end if;
 select * into v_class_subject from public.learning_class_subjects where id=v_assignment.class_subject_id and organization_id=v_response.organization_id;
 if not found then raise exception 'Class subject not found'; end if;
 select id into v_term_id from public.learning_terms where organization_id=v_response.organization_id order by case when status='active' then 0 else 1 end,starts_on desc nulls last limit 1;
 if v_term_id is null then raise exception 'No academic term is configured'; end if;
 select c.id into v_category_id from public.learning_gradebook_categories c where c.organization_id=v_response.organization_id and c.status='active' order by case when lower(c.code)='writing' then 0 when lower(c.code)='homework' then 1 when lower(c.code)='assignment' then 2 else 3 end,c.name limit 1;
 select co.objective_id into v_objective_id from public.learning_content_objectives co where co.content_item_id=v_response.content_item_id order by co.sequence_no limit 1;
 if v_objective_id is not null then select o.topic_id into v_topic_id from public.learning_objectives o where o.id=v_objective_id; end if;
 v_pct:=round((p_score/p_max_score)*100,4);
 update public.learning_content_responses set score=p_score,max_score=p_max_score,teacher_feedback=nullif(trim(coalesce(p_teacher_feedback,'')),''),status='submitted',updated_at=now() where id=p_response_id;
 select e.id into v_entry_id from public.learning_gradebook_entries e where e.organization_id=v_response.organization_id and e.student_user_id=v_response.student_user_id and e.assignment_id=v_response.assignment_id and e.notes->>'content_response_id'=p_response_id::text limit 1;
 if v_entry_id is null then
 insert into public.learning_gradebook_entries(tenant_id,organization_id,term_id,class_group_id,class_subject_id,student_user_id,category_id,title,description,record_type,source_type,assignment_id,assessment_id,attempt_id,assessment_result_id,topic_id,objective_id,score,max_score,percentage,weight,included_in_grade,status,comment,late,recorded_at,notes,created_by,updated_by)
 values(v_target.tenant_id,v_response.organization_id,v_term_id,v_class_subject.class_group_id,v_assignment.class_subject_id,v_response.student_user_id,v_category_id,v_assignment.title,'Content response','assignment','manual',v_response.assignment_id,null,null,null,v_topic_id,v_objective_id,p_score,p_max_score,v_pct,1,true,'graded',nullif(trim(coalesce(p_teacher_feedback,'')),''),false,now(),jsonb_build_object('source','content_response','content_response_id',p_response_id::text,'content_item_id',v_response.content_item_id),auth.uid(),auth.uid()) returning id into v_entry_id;
 else update public.learning_gradebook_entries set score=p_score,max_score=p_max_score,percentage=v_pct,category_id=v_category_id,topic_id=v_topic_id,objective_id=v_objective_id,status='graded',comment=nullif(trim(coalesce(p_teacher_feedback,'')),''),included_in_grade=true,updated_by=auth.uid(),updated_at=now(),recorded_at=now() where id=v_entry_id;
 end if;
 return v_entry_id;
end $$;
revoke all on function public.grade_learning_content_response(uuid,numeric,numeric,text) from public,anon;
grant execute on function public.grade_learning_content_response(uuid,numeric,numeric,text) to authenticated;