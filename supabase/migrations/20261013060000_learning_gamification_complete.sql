-- Complete the Learning gamification loop: class challenges, redeemable rewards, and persistent in-app celebrations.
begin;

create table public.learning_class_challenges (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  organization_id uuid not null,
  class_group_id uuid not null,
  title text not null check (length(trim(title)) between 3 and 100),
  description text not null default '',
  target_type text not null check (target_type in ('assignments_completed','xp_earned')),
  target_value integer not null check (target_value between 1 and 10000),
  bonus_xp integer not null default 25 check (bonus_xp between 5 and 100),
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  status text not null default 'active' check (status in ('active','paused','ended')),
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (tenant_id, organization_id) references public.organizations(tenant_id, id) on delete cascade,
  foreign key (organization_id, class_group_id) references public.learning_class_groups(organization_id, id) on delete cascade,
  foreign key (tenant_id, created_by) references public.users(tenant_id, id) on delete restrict,
  check (ends_at > starts_at)
);
create index learning_class_challenges_class_status_idx
  on public.learning_class_challenges(class_group_id, status, starts_at, ends_at);

create table public.learning_reward_shop_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  organization_id uuid not null,
  class_group_id uuid not null,
  name text not null check (length(trim(name)) between 2 and 100),
  description text not null default '',
  cost_xp integer not null check (cost_xp between 1 and 100000),
  quantity_remaining integer check (quantity_remaining is null or quantity_remaining >= 0),
  status text not null default 'active' check (status in ('active','inactive')),
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (tenant_id, organization_id) references public.organizations(tenant_id, id) on delete cascade,
  foreign key (organization_id, class_group_id) references public.learning_class_groups(organization_id, id) on delete cascade,
  foreign key (tenant_id, created_by) references public.users(tenant_id, id) on delete restrict
);
create index learning_reward_shop_items_class_status_idx
  on public.learning_reward_shop_items(class_group_id, status, cost_xp);

create table public.learning_reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  organization_id uuid not null,
  class_group_id uuid not null,
  item_id uuid not null references public.learning_reward_shop_items(id) on delete restrict,
  student_user_id uuid not null,
  cost_xp integer not null check (cost_xp > 0),
  status text not null default 'requested' check (status in ('requested','approved','rejected','fulfilled')),
  requested_at timestamptz not null default now(),
  reviewed_by uuid,
  reviewed_at timestamptz,
  review_note text,
  foreign key (tenant_id, organization_id) references public.organizations(tenant_id, id) on delete cascade,
  foreign key (organization_id, class_group_id) references public.learning_class_groups(organization_id, id) on delete cascade,
  foreign key (tenant_id, student_user_id) references public.users(tenant_id, id) on delete cascade,
  foreign key (tenant_id, reviewed_by) references public.users(tenant_id, id) on delete set null
);
create index learning_reward_redemptions_class_status_idx
  on public.learning_reward_redemptions(class_group_id, status, requested_at desc);
create index learning_reward_redemptions_student_idx
  on public.learning_reward_redemptions(student_user_id, requested_at desc);

create table public.learning_reward_notifications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  organization_id uuid,
  student_user_id uuid not null,
  reward_ledger_id uuid not null references public.learning_reward_ledger(id) on delete cascade,
  title text not null,
  message text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  unique (student_user_id, reward_ledger_id),
  foreign key (tenant_id, organization_id) references public.organizations(tenant_id, id) on delete cascade,
  foreign key (tenant_id, student_user_id) references public.users(tenant_id, id) on delete cascade
);
create index learning_reward_notifications_student_unread_idx
  on public.learning_reward_notifications(student_user_id, created_at desc) where read_at is null;

alter table public.learning_reward_ledger
  drop constraint learning_reward_ledger_check,
  drop constraint learning_reward_ledger_event_type_check,
  drop constraint learning_reward_ledger_source_type_check;
alter table public.learning_reward_ledger
  add constraint learning_reward_ledger_event_type_check
    check (event_type in ('assignment_completed','assessment_passed','objective_mastered','weekly_quest_completed','streak_milestone','challenge_completed')),
  add constraint learning_reward_ledger_source_type_check
    check (source_type in ('assignment','assessment','objective','weekly_quest','streak_milestone','challenge')),
  add constraint learning_reward_ledger_check check (
    (event_type='assignment_completed' and source_type='assignment' and xp_delta=20) or
    (event_type='assessment_passed' and source_type='assessment' and xp_delta=15) or
    (event_type='objective_mastered' and source_type='objective' and xp_delta=10) or
    (event_type='weekly_quest_completed' and source_type='weekly_quest' and xp_delta=25) or
    (event_type='streak_milestone' and source_type='streak_milestone' and xp_delta in (20,50)) or
    (event_type='challenge_completed' and source_type='challenge' and xp_delta between 5 and 100)
  );

alter table public.learning_class_challenges enable row level security;
alter table public.learning_reward_shop_items enable row level security;
alter table public.learning_reward_redemptions enable row level security;
alter table public.learning_reward_notifications enable row level security;

grant select, insert, update on public.learning_class_challenges to authenticated;
grant select, insert, update on public.learning_reward_shop_items to authenticated;
grant select on public.learning_reward_redemptions to authenticated;
grant select, update(read_at) on public.learning_reward_notifications to authenticated;
revoke all on public.learning_class_challenges, public.learning_reward_shop_items, public.learning_reward_redemptions, public.learning_reward_notifications from anon;

create policy learning_class_challenges_class_read
  on public.learning_class_challenges for select to authenticated
  using (exists (
    select 1 from public.learning_class_memberships cm
    where cm.class_group_id=learning_class_challenges.class_group_id
      and cm.user_id=public.learning_current_user_id() and cm.status='active'
  ));
create policy learning_class_challenges_teacher_insert
  on public.learning_class_challenges for insert to authenticated
  with check (
    created_by=public.learning_current_user_id()
    and exists (select 1 from public.learning_class_memberships cm
      where cm.class_group_id=learning_class_challenges.class_group_id
        and cm.user_id=public.learning_current_user_id()
        and cm.membership_type='teacher' and cm.status='active')
  );
create policy learning_class_challenges_teacher_update
  on public.learning_class_challenges for update to authenticated
  using (exists (select 1 from public.learning_class_memberships cm
      where cm.class_group_id=learning_class_challenges.class_group_id
        and cm.user_id=public.learning_current_user_id()
        and cm.membership_type='teacher' and cm.status='active'))
  with check (exists (select 1 from public.learning_class_memberships cm
      where cm.class_group_id=learning_class_challenges.class_group_id
        and cm.user_id=public.learning_current_user_id()
        and cm.membership_type='teacher' and cm.status='active'));

create policy learning_reward_shop_items_class_read
  on public.learning_reward_shop_items for select to authenticated
  using (exists (select 1 from public.learning_class_memberships cm
    where cm.class_group_id=learning_reward_shop_items.class_group_id
      and cm.user_id=public.learning_current_user_id() and cm.status='active'));
create policy learning_reward_shop_items_teacher_insert
  on public.learning_reward_shop_items for insert to authenticated
  with check (created_by=public.learning_current_user_id()
    and exists (select 1 from public.learning_class_memberships cm
      where cm.class_group_id=learning_reward_shop_items.class_group_id
        and cm.user_id=public.learning_current_user_id()
        and cm.membership_type='teacher' and cm.status='active'));
create policy learning_reward_shop_items_teacher_update
  on public.learning_reward_shop_items for update to authenticated
  using (exists (select 1 from public.learning_class_memberships cm
      where cm.class_group_id=learning_reward_shop_items.class_group_id
        and cm.user_id=public.learning_current_user_id()
        and cm.membership_type='teacher' and cm.status='active'))
  with check (exists (select 1 from public.learning_class_memberships cm
      where cm.class_group_id=learning_reward_shop_items.class_group_id
        and cm.user_id=public.learning_current_user_id()
        and cm.membership_type='teacher' and cm.status='active'));

create policy learning_reward_redemptions_student_read
  on public.learning_reward_redemptions for select to authenticated
  using (student_user_id=public.learning_current_user_id());
create policy learning_reward_redemptions_teacher_read
  on public.learning_reward_redemptions for select to authenticated
  using (exists (select 1 from public.learning_class_memberships cm
    where cm.class_group_id=learning_reward_redemptions.class_group_id
      and cm.user_id=public.learning_current_user_id()
      and cm.membership_type='teacher' and cm.status='active'));

create policy learning_reward_notifications_student_read
  on public.learning_reward_notifications for select to authenticated
  using (student_user_id=public.learning_current_user_id());
create policy learning_reward_notifications_parent_read
  on public.learning_reward_notifications for select to authenticated
  using (exists (select 1 from public.learning_parent_student_links pl
    where pl.student_user_id=learning_reward_notifications.student_user_id
      and pl.organization_id=learning_reward_notifications.organization_id
      and pl.parent_user_id=public.learning_current_user_id()
      and pl.status='active'));
create policy learning_reward_notifications_student_update
  on public.learning_reward_notifications for update to authenticated
  using (student_user_id=public.learning_current_user_id())
  with check (student_user_id=public.learning_current_user_id());

create policy learning_reward_ledger_parent_read
  on public.learning_reward_ledger for select to authenticated
  using (exists (select 1 from public.learning_parent_student_links pl
    where pl.student_user_id=learning_reward_ledger.student_user_id
      and pl.organization_id=learning_reward_ledger.organization_id
      and pl.parent_user_id=public.learning_current_user_id()
      and pl.status='active'));

create policy learning_activity_events_parent_read
  on public.learning_activity_events for select to authenticated
  using (exists (select 1 from public.learning_parent_student_links pl
    where pl.student_user_id=learning_activity_events.student_user_id
      and pl.organization_id=learning_activity_events.organization_id
      and pl.parent_user_id=public.learning_current_user_id()
      and pl.status='active'));

create or replace function private.create_learning_reward_notification()
returns trigger language plpgsql security definer set search_path = ''
as $function$
declare v_title text; v_message text;
begin
  v_title := case new.event_type
    when 'assignment_completed' then 'Assignment completed'
    when 'assessment_passed' then 'Assessment passed'
    when 'objective_mastered' then 'Learning objective mastered'
    when 'weekly_quest_completed' then 'Weekly quest completed'
    when 'streak_milestone' then 'Learning streak milestone'
    when 'challenge_completed' then 'Class challenge completed'
    else 'Learning reward earned' end;
  v_message := '+' || new.xp_delta::text || ' XP earned. Keep up your learning progress.';
  insert into public.learning_reward_notifications(tenant_id,organization_id,student_user_id,reward_ledger_id,title,message)
  values(new.tenant_id,new.organization_id,new.student_user_id,new.id,v_title,v_message)
  on conflict(student_user_id,reward_ledger_id) do nothing;
  return new;
end;
$function$;
revoke all on function private.create_learning_reward_notification() from public, anon, authenticated;
create trigger learning_reward_notification_created after insert on public.learning_reward_ledger
  for each row execute function private.create_learning_reward_notification();

create or replace function private.evaluate_learning_class_challenges()
returns trigger language plpgsql security definer set search_path = ''
as $function$
declare
  v_student uuid;
  v_class uuid;
  v_tenant uuid;
  v_org uuid;
  v_occurred timestamptz;
  v_challenge record;
  v_progress integer;
begin
  if new.event_type='challenge_completed' then return new; end if;
  v_student:=new.student_user_id; v_class:=new.class_group_id;
  v_tenant:=new.tenant_id; v_org:=new.organization_id; v_occurred:=new.occurred_at;
  if v_student is null or v_class is null then return new; end if;
  for v_challenge in
    select c.* from public.learning_class_challenges c
    where c.class_group_id=v_class and c.tenant_id=v_tenant and c.organization_id=v_org
      and c.status='active' and v_occurred between c.starts_at and c.ends_at
  loop
    if v_challenge.target_type='assignments_completed' then
      select count(distinct l.source_id)::integer into v_progress
      from public.learning_reward_ledger l
      where l.student_user_id=v_student and l.class_group_id=v_class
        and l.event_type='assignment_completed'
        and l.occurred_at between v_challenge.starts_at and v_challenge.ends_at;
    else
      select coalesce(sum(l.xp_delta),0)::integer into v_progress
      from public.learning_reward_ledger l
      where l.student_user_id=v_student and l.class_group_id=v_class
        and l.event_type<>'challenge_completed'
        and l.occurred_at between v_challenge.starts_at and v_challenge.ends_at;
    end if;
    if v_progress>=v_challenge.target_value then
      insert into public.learning_reward_ledger(tenant_id,organization_id,class_group_id,student_user_id,event_type,source_type,source_id,xp_delta,metadata,occurred_at)
      values(v_tenant,v_org,v_class,v_student,'challenge_completed','challenge',v_challenge.id,v_challenge.bonus_xp,
        jsonb_build_object('challenge_title',v_challenge.title,'target_type',v_challenge.target_type),v_occurred)
      on conflict(student_user_id,event_type,source_type,source_id) do nothing;
    end if;
  end loop;
  return new;
end;
$function$;
revoke all on function private.evaluate_learning_class_challenges() from public, anon, authenticated;
create trigger learning_class_challenges_evaluate after insert on public.learning_reward_ledger
  for each row execute function private.evaluate_learning_class_challenges();

create or replace function public.redeem_learning_reward(p_item_id uuid)
returns uuid language plpgsql security definer set search_path = ''
as $function$
declare
  v_user uuid;
  v_item public.learning_reward_shop_items%rowtype;
  v_tenant uuid;
  v_redemption uuid;
  v_balance bigint;
begin
  v_user:=public.learning_current_user_id();
  if v_user is null then raise exception 'Sign in before redeeming a reward.'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_user::text,0));
  select * into v_item from public.learning_reward_shop_items i
  where i.id=p_item_id and i.status='active' for update;
  if not found then raise exception 'This reward is not available.'; end if;
  if not exists(select 1 from public.learning_class_memberships cm
    where cm.class_group_id=v_item.class_group_id and cm.user_id=v_user
      and cm.membership_type='student' and cm.status='active') then
    raise exception 'You are not an active student in this reward class.';
  end if;
  select tenant_id into v_tenant from public.users where id=v_user;
  select coalesce(sum(xp_delta),0) - coalesce((
    select sum(r.cost_xp) from public.learning_reward_redemptions r
    where r.student_user_id=v_user and r.organization_id=v_item.organization_id
      and r.status in ('requested','approved','fulfilled')
  ),0) into v_balance
  from public.learning_reward_ledger l
  where l.student_user_id=v_user and l.organization_id=v_item.organization_id;
  if v_balance<v_item.cost_xp then raise exception 'You do not have enough XP for this reward.'; end if;
  if v_item.quantity_remaining is not null then
    update public.learning_reward_shop_items
      set quantity_remaining=quantity_remaining-1,updated_at=now()
      where id=v_item.id and quantity_remaining>0;
    if not found then raise exception 'This reward is out of stock.'; end if;
  end if;
  insert into public.learning_reward_redemptions(tenant_id,organization_id,class_group_id,item_id,student_user_id,cost_xp)
  values(v_tenant,v_item.organization_id,v_item.class_group_id,v_item.id,v_user,v_item.cost_xp)
  returning id into v_redemption;
  return v_redemption;
end;
$function$;

create or replace function public.review_learning_reward_redemption(p_redemption_id uuid,p_decision text,p_note text default null)
returns void language plpgsql security definer set search_path = ''
as $function$
declare v_user uuid; v_row public.learning_reward_redemptions%rowtype;
begin
  v_user:=public.learning_current_user_id();
  if p_decision not in ('approved','rejected','fulfilled') then raise exception 'Invalid redemption decision.'; end if;
  select * into v_row from public.learning_reward_redemptions where id=p_redemption_id for update;
  if not found then raise exception 'Redemption not found.'; end if;
  if not exists(select 1 from public.learning_class_memberships cm where cm.class_group_id=v_row.class_group_id
    and cm.user_id=v_user and cm.membership_type='teacher' and cm.status='active') then
    raise exception 'Only a teacher in this class can review redemptions.';
  end if;
  if p_decision='approved' and v_row.status<>'requested' then raise exception 'Only requested rewards can be approved.'; end if;
  if p_decision='rejected' and v_row.status<>'requested' then raise exception 'Only requested rewards can be rejected.'; end if;
  if p_decision='fulfilled' and v_row.status<>'approved' then raise exception 'Only approved rewards can be fulfilled.'; end if;
  if p_decision='rejected' then
    update public.learning_reward_shop_items set quantity_remaining=case when quantity_remaining is null then null else quantity_remaining+1 end,updated_at=now()
    where id=v_row.item_id;
  end if;
  update public.learning_reward_redemptions set status=p_decision,reviewed_by=v_user,reviewed_at=now(),review_note=nullif(trim(coalesce(p_note,'')),'')
  where id=p_redemption_id;
end;
$function$;

revoke all on function public.redeem_learning_reward(uuid) from public, anon;
grant execute on function public.redeem_learning_reward(uuid) to authenticated;
revoke all on function public.review_learning_reward_redemption(uuid,text,text) from public, anon;
grant execute on function public.review_learning_reward_redemption(uuid,text,text) to authenticated;

commit;
