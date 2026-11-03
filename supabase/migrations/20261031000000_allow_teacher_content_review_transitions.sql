-- Allow content authors to submit and withdraw their own work for review.
-- Publishing and retirement remain restricted to organization managers.
begin;

create or replace function public.transition_learning_content_status(
  p_content_item_id uuid,
  p_status text
)
returns public.learning_content_items
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_item public.learning_content_items%rowtype;
  v_version public.learning_content_versions%rowtype;
  v_actor uuid;
  v_now timestamptz := now();
  v_sections jsonb;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication is required';
  end if;

  v_actor := public.learning_current_user_id();
  if v_actor is null then
    raise exception 'The current user profile was not found';
  end if;

  select * into v_item
  from public.learning_content_items
  where id = p_content_item_id
  for update;

  if not found then
    raise exception 'Content item was not found';
  end if;

  if v_item.organization_id is null
     or not (
       public.learning_can_manage_academic_records(v_item.organization_id)
       or (
         p_status in ('draft', 'review')
         and v_item.created_by = v_actor
         and private.learning_can_author_organization_content(v_item.organization_id)
       )
     ) then
    raise exception 'You do not have permission to manage this content';
  end if;

  if p_status is null or p_status not in ('draft', 'review', 'published', 'retired') then
    raise exception 'Unsupported content status';
  end if;

  if v_item.status = p_status then
    return v_item;
  end if;

  if not (
    (v_item.status = 'draft' and p_status = 'review')
    or (v_item.status = 'review' and p_status in ('draft', 'published'))
    or (v_item.status = 'published' and p_status = 'retired')
  ) then
    raise exception 'Invalid content status transition: % -> %', v_item.status, p_status;
  end if;

  if p_status in ('review', 'published') then
    if not exists (
      select 1
      from public.learning_content_objectives co
      where co.content_item_id = v_item.id
    ) then
      raise exception 'Content needs at least one learning objective before review or publishing';
    end if;
  end if;

  if p_status in ('review', 'published', 'draft') then
    select * into v_version
    from public.learning_content_versions
    where content_item_id = v_item.id
    order by version_no desc
    limit 1
    for update;

    if not found then
      raise exception 'Content needs a version before its status can change';
    end if;
  elsif p_status = 'retired' then
    select * into v_version
    from public.learning_content_versions
    where content_item_id = v_item.id
      and status = 'published'
    order by version_no desc
    limit 1
    for update;

    if not found then
      raise exception 'The published content version was not found';
    end if;
  end if;

  if p_status in ('review', 'published') then
    v_sections := v_version.body->'sections';
    if jsonb_typeof(v_sections) is distinct from 'array'
       or not exists (
         select 1
         from jsonb_array_elements(
           case when jsonb_typeof(v_sections) = 'array' then v_sections else '[]'::jsonb end
         ) section
         where jsonb_typeof(section) = 'object'
           and nullif(btrim(section->>'body'), '') is not null
       ) then
      raise exception 'The latest content version cannot be empty';
    end if;
  end if;

  if p_status = 'review' then
    if v_version.status <> 'draft' then
      raise exception 'Only a draft version can be submitted for review';
    end if;

    update public.learning_content_versions
    set status = 'review',
        reviewed_by = null,
        reviewed_at = null,
        published_at = null,
        updated_at = v_now
    where id = v_version.id;

    update public.learning_content_items
    set status = 'review',
        reviewed_by = null,
        reviewed_at = null,
        updated_by = v_actor,
        updated_at = v_now
    where id = v_item.id;
  elsif p_status = 'draft' then
    if v_version.status <> 'review' then
      raise exception 'Only content in review can return to draft';
    end if;

    update public.learning_content_versions
    set status = 'draft',
        reviewed_by = null,
        reviewed_at = null,
        published_at = null,
        updated_at = v_now
    where id = v_version.id;

    update public.learning_content_items
    set status = 'draft',
        reviewed_by = null,
        reviewed_at = null,
        updated_by = v_actor,
        updated_at = v_now
    where id = v_item.id;
  elsif p_status = 'published' then
    if v_item.status <> 'review' or v_version.status <> 'review' then
      raise exception 'Content and its latest version must be in review before publishing';
    end if;

    update public.learning_content_versions
    set status = 'published',
        reviewed_by = v_actor,
        reviewed_at = v_now,
        published_at = v_now,
        updated_at = v_now
    where id = v_version.id;

    update public.learning_content_items
    set status = 'published',
        reviewed_by = v_actor,
        reviewed_at = v_now,
        updated_by = v_actor,
        updated_at = v_now
    where id = v_item.id;
  elsif p_status = 'retired' then
    update public.learning_content_versions
    set status = 'retired',
        updated_at = v_now
    where id = v_version.id;

    update public.learning_content_items
    set status = 'retired',
        updated_by = v_actor,
        updated_at = v_now
    where id = v_item.id;
  end if;

  select * into v_item
  from public.learning_content_items
  where id = p_content_item_id;

  return v_item;
end;
$function$;

create or replace function public.transition_learning_content_version_status(
  p_content_version_id uuid,
  p_status text
)
returns public.learning_content_versions
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_item public.learning_content_items%rowtype;
  v_version public.learning_content_versions%rowtype;
  v_actor uuid;
  v_now timestamptz := now();
  v_sections jsonb;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication is required';
  end if;

  if p_status is null or p_status not in ('draft', 'review', 'published') then
    raise exception 'Unsupported content-version status';
  end if;

  v_actor := public.learning_current_user_id();
  if v_actor is null then
    raise exception 'The current user profile was not found';
  end if;

  select ci.* into v_item
  from public.learning_content_items ci
  join public.learning_content_versions cv on cv.content_item_id = ci.id
  where cv.id = p_content_version_id
  for update of ci;

  if not found then
    raise exception 'Content item or version was not found';
  end if;

  if v_item.organization_id is null then
    raise exception 'You do not have permission to manage this content';
  end if;

  select * into v_version
  from public.learning_content_versions
  where id = p_content_version_id
    and content_item_id = v_item.id
  for update;

  if not found then
    raise exception 'Content version was not found';
  end if;

  if not (
    public.learning_can_manage_academic_records(v_item.organization_id)
    or (
      p_status in ('draft', 'review')
      and v_item.created_by = v_actor
      and v_version.created_by = v_actor
      and private.learning_can_author_organization_content(v_item.organization_id)
    )
  ) then
    raise exception 'You do not have permission to manage this content';
  end if;

  if v_version.status = p_status then
    return v_version;
  end if;

  if not (
    (v_version.status = 'draft' and p_status = 'review')
    or (v_version.status = 'review' and p_status in ('draft', 'published'))
  ) then
    raise exception 'Invalid content-version status transition: % -> %', v_version.status, p_status;
  end if;

  if p_status in ('review', 'published') then
    if not exists (
      select 1 from public.learning_content_objectives co
      where co.content_item_id = v_item.id
    ) then
      raise exception 'Content needs at least one learning objective before review or publishing';
    end if;

    v_sections := v_version.body->'sections';
    if jsonb_typeof(v_sections) is distinct from 'array'
       or not exists (
         select 1
         from jsonb_array_elements(
           case when jsonb_typeof(v_sections) = 'array' then v_sections else '[]'::jsonb end
         ) section
         where jsonb_typeof(section) = 'object'
           and nullif(btrim(section->>'body'), '') is not null
       ) then
      raise exception 'The content version cannot be empty';
    end if;
  end if;

  if p_status = 'review' then
    if v_item.status not in ('draft', 'review', 'published') then
      raise exception 'Retired content cannot be submitted for review';
    end if;

    update public.learning_content_versions
    set status = 'review',
        reviewed_by = null,
        reviewed_at = null,
        published_at = null,
        updated_at = v_now
    where id = v_version.id;

    if v_item.status = 'draft' then
      update public.learning_content_items
      set status = 'review',
          reviewed_by = null,
          reviewed_at = null,
          updated_by = v_actor,
          updated_at = v_now
      where id = v_item.id;
    end if;
  elsif p_status = 'draft' then
    update public.learning_content_versions
    set status = 'draft',
        reviewed_by = null,
        reviewed_at = null,
        published_at = null,
        updated_at = v_now
    where id = v_version.id;

    if v_item.status = 'review' then
      update public.learning_content_items
      set status = 'draft',
          reviewed_by = null,
          reviewed_at = null,
          updated_by = v_actor,
          updated_at = v_now
      where id = v_item.id;
    elsif v_item.status not in ('draft', 'published') then
      raise exception 'Content cannot return to draft from its current status';
    end if;
  elsif p_status = 'published' then
    if v_item.status not in ('review', 'published') then
      raise exception 'Content must be in review before a version can be published';
    end if;

    update public.learning_content_versions
    set status = 'published',
        reviewed_by = v_actor,
        reviewed_at = v_now,
        published_at = v_now,
        updated_at = v_now
    where id = v_version.id;

    if v_item.status = 'review' then
      update public.learning_content_items
      set status = 'published',
          reviewed_by = v_actor,
          reviewed_at = v_now,
          updated_by = v_actor,
          updated_at = v_now
      where id = v_item.id;
    end if;
  end if;

  select * into v_version
  from public.learning_content_versions
  where id = p_content_version_id;

  return v_version;
end;
$function$;

revoke all on function public.transition_learning_content_status(uuid, text) from public, anon;
grant execute on function public.transition_learning_content_status(uuid, text) to authenticated;
revoke all on function public.transition_learning_content_version_status(uuid, text) from public, anon;
grant execute on function public.transition_learning_content_version_status(uuid, text) to authenticated;

commit;
