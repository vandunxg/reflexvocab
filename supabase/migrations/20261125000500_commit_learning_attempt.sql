create function public.commit_learning_attempt(request jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
  attempt jsonb := request->'attempt';
  progress jsonb := request->'progress';
  next_session jsonb := request->'session';
  attempt_id uuid;
  session_id uuid;
  expected_revision integer;
  previous_request jsonb;
  current_session public.learning_sessions%rowtype;
  active_item jsonb;
begin
  if owner_id is null then
    raise exception using errcode = '42501', message = 'unauthenticated';
  end if;
  if (jsonb_typeof(request) = 'object' and jsonb_typeof(attempt) = 'object'
    and jsonb_typeof(progress) = 'object' and jsonb_typeof(next_session) = 'object'
    and jsonb_typeof(request->'expectedRevision') = 'number'
    and jsonb_typeof(attempt->'id') = 'string'
    and jsonb_typeof(attempt->'sessionId') = 'string') is not true then
    raise exception using errcode = '22023', message = 'invalid attempt request';
  end if;
  attempt_id := (attempt->>'id')::uuid;
  session_id := (attempt->>'sessionId')::uuid;
  expected_revision := (request->>'expectedRevision')::integer;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(owner_id::text, 0));
  select a.request_payload into previous_request from public.attempts a
  where a.user_id = owner_id and a.id = attempt_id;
  if found then
    if previous_request is distinct from request then
      raise exception using errcode = '22023', message = 'attempt request differs';
    end if;
    return;
  end if;

  select * into current_session from public.learning_sessions s
  where s.user_id = owner_id and s.id = session_id;
  if not found or current_session.status <> 'current'
    or current_session.revision <> expected_revision then
    raise exception using errcode = '40001', message = 'session conflict';
  end if;
  active_item := current_session.queue->current_session.cursor;
  if (attempt->>'exerciseId' = active_item->>'exerciseId'
    and attempt->>'senseId' = active_item->>'senseId'
    and attempt->'exerciseVersion' = active_item->'exerciseVersion'
    and progress->>'senseId' = active_item->>'senseId'
    and (attempt->>'isRetry')::boolean = (active_item->>'source' = 'retry')
    and next_session->>'id' = session_id::text
    and next_session->'config' = current_session.config
    and (next_session->>'startedAt')::timestamptz = current_session.started_at
    and (next_session->>'cursor')::integer = current_session.cursor + 1
    and (next_session->>'revision')::integer = expected_revision + 1
    and next_session->>'status' in ('current', 'completed')
    and jsonb_typeof(next_session->'queue') = 'array'
    and jsonb_typeof(next_session->'retryCounts') = 'object'
    and exists (
      select 1 from public.exercises e
      where e.id = attempt->>'exerciseId' and e.sense_id = attempt->>'senseId'
        and e.context_id = attempt->>'contextId' and e.kind::text = attempt->>'exerciseKind'
        and to_jsonb(e.version) = attempt->'exerciseVersion' and e.active
    )) is not true then
    raise exception using errcode = '22023', message = 'invalid attempt transition';
  end if;
  if jsonb_array_length(next_session->'queue') < jsonb_array_length(current_session.queue)
    or exists (
      select 1 from jsonb_array_elements(current_session.queue) with ordinality old(item, position)
      where old.item is distinct from (next_session->'queue')->((old.position - 1)::integer)
    )
    or exists (
      select 1 from jsonb_array_elements(next_session->'queue') with ordinality added(item, position)
      where added.position > jsonb_array_length(current_session.queue)
        and (added.item->>'source' is distinct from 'retry' or not exists (
          select 1 from public.exercises e
          where e.id = added.item->>'exerciseId' and e.sense_id = added.item->>'senseId'
            and to_jsonb(e.version) = added.item->'exerciseVersion' and e.active
        ))
    ) then
    raise exception using errcode = '22023', message = 'invalid session queue';
  end if;

  insert into public.attempts
    (user_id, id, session_id, exercise_id, sense_id, context_id, exercise_kind,
     exercise_version, answer, outcome, hint_used, answer_revealed, is_retry,
     qualified_review, grade, attempted_at, response_time_ms, expected_revision, request_payload)
  values
    (owner_id, attempt_id, session_id, attempt->>'exerciseId', attempt->>'senseId',
     attempt->>'contextId', (attempt->>'exerciseKind')::public.exercise_kind,
     (attempt->>'exerciseVersion')::integer, attempt->'answer', attempt->>'outcome',
     (attempt->>'hintUsed')::boolean, (attempt->>'answerRevealed')::boolean,
     (attempt->>'isRetry')::boolean, (attempt->>'qualifiedReview')::boolean,
     attempt->>'grade', (attempt->>'attemptedAt')::timestamptz,
     (attempt->>'responseTimeMs')::integer, expected_revision, request);

  insert into public.card_progress
    (user_id, sense_id, card, first_seen_at, mastery_stage, evidence, mistake_count, last_mistake_at)
  values
    (owner_id, progress->>'senseId', progress->'card', (progress->>'firstSeenAt')::timestamptz,
     progress->>'masteryStage', progress->'evidence', (progress->>'mistakeCount')::integer,
     (progress->>'lastMistakeAt')::timestamptz)
  on conflict (user_id, sense_id) do update set
    card = excluded.card, first_seen_at = excluded.first_seen_at,
    mastery_stage = excluded.mastery_stage, evidence = excluded.evidence,
    mistake_count = excluded.mistake_count, last_mistake_at = excluded.last_mistake_at;

  update public.learning_sessions set queue = next_session->'queue',
    cursor = (next_session->>'cursor')::integer, revision = (next_session->>'revision')::integer,
    retry_counts = next_session->'retryCounts', status = next_session->>'status',
    updated_at = (next_session->>'updatedAt')::timestamptz
  where user_id = owner_id and id = session_id;
end;
$$;

revoke all on function public.commit_learning_attempt(jsonb) from public, anon;
grant execute on function public.commit_learning_attempt(jsonb) to authenticated;
