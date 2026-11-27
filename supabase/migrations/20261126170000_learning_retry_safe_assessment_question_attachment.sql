-- Make assessment question attachment safe to retry after partial client/network failures.
begin;
create or replace function public.add_learning_assessment_questions(p_assessment_id uuid,p_questions jsonb)
returns integer language plpgsql security definer set search_path = ''
as $function$
declare
 v_auth_user_id uuid := (select auth.uid());
 v_actor_id uuid := public.learning_current_user_id();
 v_assessment public.learning_assessments%rowtype;
 v_existing_max integer;
 v_added integer;
 v_question_count integer;
 v_distinct_count integer;
begin
 if v_auth_user_id is null or v_actor_id is null then raise exception 'Authentication is required'; end if;
 if p_questions is null or jsonb_typeof(p_questions) <> 'array' or jsonb_array_length(p_questions)=0 then raise exception 'Select at least one question to attach'; end if;
 if jsonb_array_length(p_questions)>100 then raise exception 'A single assessment batch cannot contain more than 100 questions'; end if;
 select * into v_assessment from public.learning_assessments where id=p_assessment_id for update;
 if not found then raise exception 'Assessment was not found'; end if;
 if v_assessment.status in ('published','retired') then raise exception 'Questions can only be added to an unpublished assessment'; end if;
 if v_assessment.organization_id is null or not (
  public.learning_can_manage_academic_records(v_assessment.organization_id)
  or (v_assessment.created_by=v_actor_id and public.learning_is_active_teacher(v_assessment.organization_id))
 ) then raise exception 'You are not authorized to edit this assessment'; end if;
 select count(*),count(distinct x.question_version_id) into v_question_count,v_distinct_count
 from jsonb_to_recordset(p_questions) as x(question_version_id uuid,points numeric,required boolean);
 if v_question_count=0 or v_question_count<>jsonb_array_length(p_questions) or v_question_count<>v_distinct_count then raise exception 'Question selection must contain unique valid question version IDs'; end if;
 if exists (
  select 1 from jsonb_to_recordset(p_questions) as x(question_version_id uuid,points numeric,required boolean)
  left join public.learning_question_versions qv on qv.id=x.question_version_id
  left join public.learning_questions q on q.id=qv.question_id
  where qv.id is null or q.organization_id is distinct from v_assessment.organization_id
   or q.status<>'published' or qv.published_at is null
   or qv.curriculum_id is distinct from v_assessment.curriculum_id
   or qv.grade_level_id is distinct from v_assessment.grade_level_id
   or qv.subject_id is distinct from v_assessment.subject_id
   or x.points is null or x.points<=0 or x.required is null
 ) then raise exception 'Every selected question must be published, organization-owned and aligned to the assessment academic scope with valid points'; end if;
 select coalesce(max(sequence_no),0) into v_existing_max from public.learning_assessment_questions where assessment_id=p_assessment_id;
 insert into public.learning_assessment_questions(assessment_id,question_version_id,sequence_no,points,required)
 select p_assessment_id,x.question_version_id,v_existing_max+row_number() over(order by x.ordinality)::integer,x.points,x.required
 from jsonb_to_recordset(p_questions) with ordinality as x(question_version_id uuid,points numeric,required boolean,ordinality bigint)
 where not exists (
  select 1 from public.learning_assessment_questions already_attached
  where already_attached.assessment_id=p_assessment_id
    and already_attached.question_version_id=x.question_version_id
 );
 get diagnostics v_added=row_count;
 return v_added;
end;
$function$;
revoke all on function public.add_learning_assessment_questions(uuid,jsonb) from public,anon;
grant execute on function public.add_learning_assessment_questions(uuid,jsonb) to authenticated;
commit;
