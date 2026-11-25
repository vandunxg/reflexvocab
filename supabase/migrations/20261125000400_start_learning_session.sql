alter table public.learning_sessions add column start_request jsonb;

create function public.start_learning_session(
  session_id uuid, config jsonb, queue jsonb, started_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
  request jsonb := jsonb_build_object('config', config, 'queue', queue, 'startedAt', started_at);
  existing_request jsonb;
begin
  if owner_id is null then
    raise exception using errcode = '42501', message = 'unauthenticated';
  end if;
  if session_id is null or config is null or queue is null or started_at is null
    or jsonb_typeof(queue) <> 'array' then
    raise exception using errcode = '22023', message = 'invalid session';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(owner_id::text, 0));
  select s.start_request into existing_request
  from public.learning_sessions s where s.user_id = owner_id and s.id = session_id;
  if found then
    if existing_request is distinct from request then
      raise exception using errcode = '22023', message = 'session request differs';
    end if;
    return;
  end if;

  if jsonb_array_length(queue) = 0
    or exists (
      select 1 from jsonb_array_elements(queue) item
      where not exists (
        select 1 from public.exercises e
        where e.id = item->>'exerciseId' and e.sense_id = item->>'senseId'
          and e.active and to_jsonb(e.version) = item->'exerciseVersion'
      )
    ) then
    raise exception using errcode = '22023', message = 'invalid session queue';
  end if;

  update public.learning_sessions s set status = 'replaced', updated_at = now()
  where s.user_id = owner_id and s.status = 'current';
  insert into public.learning_sessions
    (user_id, id, config, queue, cursor, revision, retry_counts, status, started_at, updated_at, start_request)
  values (owner_id, session_id, config, queue, 0, 0, '{}'::jsonb, 'current', started_at, started_at, request);
end;
$$;

revoke all on function public.start_learning_session(uuid, jsonb, jsonb, timestamptz) from public, anon;
grant execute on function public.start_learning_session(uuid, jsonb, jsonb, timestamptz) to authenticated;
