begin;
insert into auth.users (id) values ('10000000-0000-4000-8000-000000000003');
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000003', true);
select public.start_learning_session(
  '20000000-0000-4000-8000-000000000021',
  '{"mode":"daily","questionBudget":3}',
  '[{"exerciseId":"office-file-definition","senseId":"office-submit-file","exerciseVersion":1,"source":"new"},{"exerciseId":"office-schedule-choice","senseId":"office-schedule-meeting","exerciseVersion":1,"source":"new"},{"exerciseId":"office-attach-typing","senseId":"office-attach-document","exerciseVersion":1,"source":"new"}]',
  '2026-11-25T00:00:00Z'
);
do $$
declare
  original jsonb := '[{"exerciseId":"office-file-definition","senseId":"office-submit-file","exerciseVersion":1,"source":"new"},{"exerciseId":"office-schedule-choice","senseId":"office-schedule-meeting","exerciseVersion":1,"source":"new"},{"exerciseId":"office-attach-typing","senseId":"office-attach-document","exerciseVersion":1,"source":"new"}]';
  retry jsonb := '{"exerciseId":"office-file-collocation","senseId":"office-submit-file","exerciseVersion":1,"source":"retry"}';
  request jsonb := '{
    "expectedRevision": 0,
    "attempt": {
      "id":"30000000-0000-4000-8000-000000000021",
      "sessionId":"20000000-0000-4000-8000-000000000021",
      "exerciseId":"office-file-definition", "senseId":"office-submit-file",
      "contextId":"expense-claim", "exerciseKind":"definition-match", "exerciseVersion":1,
      "answer":"discard", "outcome":"incorrect", "hintUsed":false, "answerRevealed":false,
      "isRetry":false, "qualifiedReview":false, "grade":null,
      "attemptedAt":"2026-11-25T00:01:00Z", "responseTimeMs":1000
    },
    "progress": {
      "senseId":"office-submit-file", "card":{"version":1,"dueAt":"2026-11-25T00:00:00Z","data":{}},
      "firstSeenAt":"2026-11-25T00:00:00Z", "masteryStage":"learning",
      "evidence":{"reviewDays":[],"contextIds":[],"hasTypingSuccess":false},
      "mistakeCount":1,"lastMistakeAt":"2026-11-25T00:01:00Z"
    },
    "session": {
      "id":"20000000-0000-4000-8000-000000000021",
      "config":{"mode":"daily","questionBudget":3},
      "queue":[],
      "cursor":1,"revision":1,"retryCounts":{"office-submit-file":1},"status":"current",
      "startedAt":"2026-11-25T00:00:00Z","updatedAt":"2026-11-25T00:01:00Z"
    }
  }';
  candidate jsonb;
begin
  foreach candidate in array array[
    jsonb_insert(original, '{0}', retry),
    jsonb_set(original, '{2}', retry),
    jsonb_insert(original, '{2}', jsonb_set(retry, '{source}', '"practice"')),
    jsonb_insert(original, '{2}', '{"exerciseId":"office-attach-collocation","senseId":"office-attach-document","exerciseVersion":1,"source":"retry"}'),
    jsonb_insert(jsonb_insert(original, '{2}', retry), '{2}', retry)
  ] loop
    begin
      perform public.commit_learning_attempt(jsonb_set(request, '{session,queue}', candidate));
      raise exception 'Invalid recovery queue was accepted: %', candidate;
    exception when invalid_parameter_value then null;
    end;
  end loop;
  if exists (select 1 from public.attempts) then
    raise exception 'A rejected recovery queue wrote an attempt';
  end if;

  perform public.commit_learning_attempt(jsonb_set(request, '{session,queue}', jsonb_insert(original, '{2}', retry)));
  if not exists (
    select 1 from public.learning_sessions
    where id = '20000000-0000-4000-8000-000000000021' and cursor = 1 and revision = 1
      and queue = jsonb_insert(original, '{2}', retry)
  ) then
    raise exception 'A spaced retry inserted after the cursor was not saved';
  end if;
end $$;
rollback;
