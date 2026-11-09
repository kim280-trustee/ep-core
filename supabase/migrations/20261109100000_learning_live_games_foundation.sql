-- E&P Live Games: secure classroom sessions built on published assessments.
begin;

create table public.learning_live_game_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  organization_id uuid not null,
  class_group_id uuid not null,
  assessment_id uuid not null references public.learning_assessments(id) on delete restrict,
  host_user_id uuid not null,
  join_code text not null unique check (join_code ~ '^[0-9]{6}$'),
  status text not null default 'lobby' check (status in ('lobby','in_progress','completed','cancelled')),
  current_question_index integer not null default 1 check (current_question_index > 0),
  settings jsonb not null default '{}'::jsonb,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (tenant_id, organization_id) references public.organizations(tenant_id,id) on delete cascade,
  foreign key (organization_id,class_group_id) references public.learning_class_groups(organization_id,id) on delete cascade,
  foreign key (tenant_id,host_user_id) references public.users(tenant_id,id) on delete restrict,
  check ((status = 'in_progress' and started_at is not null and ended_at is null)
      or (status = 'completed' and ended_at is not null)
      or (status in ('lobby','cancelled')))
);
create index learning_live_game_sessions_class_created_idx
  on public.learning_live_game_sessions(class_group_id,created_at desc);
create index learning_live_game_sessions_status_idx
  on public.learning_live_game_sessions(status,created_at desc);

create table public.learning_live_game_players (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  organization_id uuid not null,
  session_id uuid not null references public.learning_live_game_sessions(id) on delete cascade,
  student_user_id uuid not null,
  display_name text not null check (length(trim(display_name)) between 1 and 80),
  score numeric(10,2) not null default 0 check (score >= 0),
  status text not null default 'active' check (status in ('active','disconnected')),
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (session_id,student_user_id),
  unique (id,session_id),
  foreign key (tenant_id,organization_id) references public.organizations(tenant_id,id) on delete cascade,
  foreign key (tenant_id,student_user_id) references public.users(tenant_id,id) on delete cascade
);
create index learning_live_game_players_session_score_idx
  on public.learning_live_game_players(session_id,score desc,joined_at);

create table public.learning_live_game_answers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  organization_id uuid not null,
  session_id uuid not null,
  player_id uuid not null,
  assessment_question_id uuid not null references public.learning_assessment_questions(id) on delete restrict,
  answer jsonb not null,
  is_correct boolean not null,
  points_awarded numeric(10,2) not null default 0 check (points_awarded >= 0),
  response_time_ms integer check (response_time_ms is null or response_time_ms >= 0),
  submitted_at timestamptz not null default now(),
  unique (player_id,assessment_question_id),
  foreign key (player_id,session_id) references public.learning_live_game_players(id,session_id) on delete cascade,
  foreign key (session_id) references public.learning_live_game_sessions(id) on delete cascade,
  foreign key (tenant_id,organization_id) references public.organizations(tenant_id,id) on delete cascade
);
create index learning_live_game_answers_session_question_idx
  on public.learning_live_game_answers(session_id,assessment_question_id);

alter table public.learning_live_game_sessions enable row level security;
alter table public.learning_live_game_players enable row level security;
alter table public.learning_live_game_answers enable row level security;

grant select on public.learning_live_game_sessions, public.learning_live_game_players,
  public.learning_live_game_answers to authenticated;
revoke insert, update, delete on public.learning_live_game_sessions,
  public.learning_live_game_players, public.learning_live_game_answers from anon, authenticated;

create policy learning_live_game_sessions_class_read
on public.learning_live_game_sessions for select to authenticated
using (exists (
  select 1 from public.learning_class_memberships cm
  where cm.class_group_id = learning_live_game_sessions.class_group_id
    and cm.user_id = public.learning_current_user_id()
    and cm.status = 'active'
    and cm.membership_type in ('teacher','student')
));

create policy learning_live_game_players_participant_read
on public.learning_live_game_players for select to authenticated
using (
  student_user_id = public.learning_current_user_id()
  or exists (
    select 1 from public.learning_live_game_sessions s
    join public.learning_class_memberships cm on cm.class_group_id = s.class_group_id
    where s.id = learning_live_game_players.session_id
      and cm.user_id = public.learning_current_user_id()
      and cm.membership_type = 'teacher'
      and cm.status = 'active'
  )
);

create policy learning_live_game_answers_participant_read
on public.learning_live_game_answers for select to authenticated
using (
  exists (
    select 1 from public.learning_live_game_players p
    where p.id = learning_live_game_answers.player_id
      and p.student_user_id = public.learning_current_user_id()
  )
  or exists (
    select 1 from public.learning_live_game_sessions s
    join public.learning_class_memberships cm on cm.class_group_id = s.class_group_id
    where s.id = learning_live_game_answers.session_id
      and cm.user_id = public.learning_current_user_id()
      and cm.membership_type = 'teacher'
      and cm.status = 'active'
  )
);

create or replace function public.create_learning_live_game_session(
  p_class_group_id uuid,
  p_assessment_id uuid,
  p_settings jsonb default '{}'::jsonb
) returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user uuid := public.learning_current_user_id();
  v_tenant uuid;
  v_org uuid;
  v_code text;
  v_session uuid;
  v_assessment_org uuid;
begin
  if v_user is null then raise exception 'Sign in to host a live game.'; end if;
  if not exists (
    select 1 from public.learning_class_memberships cm
    where cm.class_group_id = p_class_group_id and cm.user_id = v_user
      and cm.membership_type = 'teacher' and cm.status = 'active'
  ) then raise exception 'Only an active teacher in this class can host a game.'; end if;

  select cg.organization_id,o.tenant_id into v_org,v_tenant
  from public.learning_class_groups cg
  join public.organizations o on o.id=cg.organization_id
  where cg.id=p_class_group_id and o.status='active';
  if v_org is null then raise exception 'Class not found or inactive.'; end if;

  select a.organization_id into v_assessment_org
  from public.learning_assessments a
  where a.id=p_assessment_id and a.status='published';
  if not found or v_assessment_org is distinct from v_org then
    raise exception 'Choose a published assessment from this school.';
  end if;
  if not exists (select 1 from public.learning_assessment_questions aq where aq.assessment_id=p_assessment_id) then
    raise exception 'The assessment has no questions.';
  end if;

  loop
    v_code := lpad((floor(random()*1000000))::integer::text,6,'0');
    exit when not exists(select 1 from public.learning_live_game_sessions s where s.join_code=v_code);
  end loop;

  insert into public.learning_live_game_sessions(
    tenant_id,organization_id,class_group_id,assessment_id,host_user_id,join_code,settings
  ) values (
    v_tenant,v_org,p_class_group_id,p_assessment_id,v_user,v_code,
    case when jsonb_typeof(p_settings)='object' then p_settings else '{}'::jsonb end
  ) returning id into v_session;
  return v_session;
end;
$function$;

create or replace function public.join_learning_live_game_session(p_join_code text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user uuid := public.learning_current_user_id();
  v_session public.learning_live_game_sessions%rowtype;
  v_player uuid;
  v_name text;
begin
  if v_user is null then raise exception 'Sign in to join a live game.'; end if;
  select * into v_session from public.learning_live_game_sessions s
  where s.join_code=trim(p_join_code) and s.status='lobby' for update;
  if not found then raise exception 'Game code is invalid or the game has already started.'; end if;
  if not exists (
    select 1 from public.learning_class_memberships cm
    where cm.class_group_id=v_session.class_group_id and cm.user_id=v_user
      and cm.membership_type='student' and cm.status='active'
  ) then raise exception 'You are not an active student in this class.'; end if;
  select coalesce(nullif(trim(u.name),''),'Student') into v_name
  from public.users u where u.id=v_user and u.tenant_id=v_session.tenant_id;
  if v_name is null then raise exception 'Student account was not found in this school.'; end if;
  insert into public.learning_live_game_players(tenant_id,organization_id,session_id,student_user_id,display_name)
  values(v_session.tenant_id,v_session.organization_id,v_session.id,v_user,v_name)
  on conflict(session_id,student_user_id) do update set status='active',last_seen_at=now()
  returning id into v_player;
  return v_player;
end;
$function$;

create or replace function public.start_learning_live_game_session(p_session_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare v_user uuid := public.learning_current_user_id();
begin
  update public.learning_live_game_sessions s
  set status='in_progress',started_at=now(),current_question_index=1,updated_at=now()
  where s.id=p_session_id and s.status='lobby' and s.host_user_id=v_user
    and exists(select 1 from public.learning_class_memberships cm
      where cm.class_group_id=s.class_group_id and cm.user_id=v_user
        and cm.membership_type='teacher' and cm.status='active');
  if not found then raise exception 'You cannot start this game or it is no longer in the lobby.'; end if;
end;
$function$;

create or replace function public.advance_learning_live_game_question(p_session_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare v_user uuid := public.learning_current_user_id(); v_next integer; v_total integer;
begin
  select s.current_question_index+1 into v_next
  from public.learning_live_game_sessions s
  where s.id=p_session_id and s.status='in_progress' and s.host_user_id=v_user
    and exists(select 1 from public.learning_class_memberships cm
      where cm.class_group_id=s.class_group_id and cm.user_id=v_user
        and cm.membership_type='teacher' and cm.status='active')
  for update;
  if not found then raise exception 'You cannot advance this game.'; end if;
  select count(*) into v_total from public.learning_assessment_questions aq
  join public.learning_live_game_sessions s on s.assessment_id=aq.assessment_id
  where s.id=p_session_id;
  if v_next>v_total then
    update public.learning_live_game_sessions set status='completed',ended_at=now(),updated_at=now() where id=p_session_id;
    return false;
  end if;
  update public.learning_live_game_sessions set current_question_index=v_next,updated_at=now() where id=p_session_id;
  return true;
end;
$function$;

create or replace function public.submit_learning_live_game_answer(
  p_session_id uuid,
  p_answer jsonb,
  p_response_time_ms integer default null
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user uuid := public.learning_current_user_id();
  v_session public.learning_live_game_sessions%rowtype;
  v_player public.learning_live_game_players%rowtype;
  v_question record;
  v_key jsonb;
  v_rules jsonb;
  v_correct boolean;
  v_points numeric(10,2);
  v_answer_id uuid;
begin
  if v_user is null then raise exception 'Sign in to submit an answer.'; end if;
  if p_response_time_ms is not null and p_response_time_ms<0 then raise exception 'Invalid response time.'; end if;
  select * into v_session from public.learning_live_game_sessions s
  where s.id=p_session_id and s.status='in_progress' for update;
  if not found then raise exception 'This game is not accepting answers.'; end if;
  select * into v_player from public.learning_live_game_players p
  where p.session_id=p_session_id and p.student_user_id=v_user and p.status='active';
  if not found then raise exception 'Join this game before answering.'; end if;

  select aq.id as assessment_question_id,aq.question_version_id,aq.points,q.question_type
  into v_question
  from public.learning_assessment_questions aq
  join public.learning_question_versions qv on qv.id=aq.question_version_id
  join public.learning_questions q on q.id=qv.question_id
  where aq.assessment_id=v_session.assessment_id
  order by aq.sequence_no
  offset (v_session.current_question_index-1) limit 1;
  if not found then raise exception 'Current question was not found.'; end if;

  select ek.evaluation_key,ek.scoring_rules into v_key,v_rules
  from public.learning_question_evaluation_keys ek
  where ek.question_version_id=v_question.question_version_id;
  if v_question.question_type not in ('single_choice','true_false')
     or v_key is null or coalesce(v_rules->>'method','')<>'exact_option' then
    raise exception 'This question type is not supported in live games yet.';
  end if;
  v_correct := (p_answer->>'option_id')=(v_key->>'correct_option_id');
  v_points := case when v_correct then v_question.points else 0 end;

  insert into public.learning_live_game_answers(
    tenant_id,organization_id,session_id,player_id,assessment_question_id,
    answer,is_correct,points_awarded,response_time_ms
  ) values (
    v_session.tenant_id,v_session.organization_id,p_session_id,v_player.id,
    v_question.assessment_question_id,p_answer,v_correct,v_points,p_response_time_ms
  ) returning id into v_answer_id;

  update public.learning_live_game_players
  set score=score+v_points,last_seen_at=now()
  where id=v_player.id;

  return jsonb_build_object('answer_id',v_answer_id,'is_correct',v_correct,'points_awarded',v_points);
exception when unique_violation then
  raise exception 'You have already answered this question.';
end;
$function$;

revoke all on function public.create_learning_live_game_session(uuid,uuid,jsonb) from public,anon;
revoke all on function public.join_learning_live_game_session(text) from public,anon;
revoke all on function public.start_learning_live_game_session(uuid) from public,anon;
revoke all on function public.advance_learning_live_game_question(uuid) from public,anon;
revoke all on function public.submit_learning_live_game_answer(uuid,jsonb,integer) from public,anon;
grant execute on function public.create_learning_live_game_session(uuid,uuid,jsonb) to authenticated;
grant execute on function public.join_learning_live_game_session(text) to authenticated;
grant execute on function public.start_learning_live_game_session(uuid) to authenticated;
grant execute on function public.advance_learning_live_game_question(uuid) to authenticated;
grant execute on function public.submit_learning_live_game_answer(uuid,jsonb,integer) to authenticated;

do $publication$
begin
  if exists(select 1 from pg_publication where pubname='supabase_realtime') then
    if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='learning_live_game_sessions') then
      alter publication supabase_realtime add table public.learning_live_game_sessions;
    end if;
    if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='learning_live_game_players') then
      alter publication supabase_realtime add table public.learning_live_game_players;
    end if;
    if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='learning_live_game_answers') then
      alter publication supabase_realtime add table public.learning_live_game_answers;
    end if;
  end if;
end;
$publication$;

commit;
