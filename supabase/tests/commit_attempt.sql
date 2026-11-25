begin;
insert into auth.users (id) values ('10000000-0000-4000-8000-000000000002');
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000002', true);
select public.start_learning_session(
  '20000000-0000-4000-8000-000000000011',
  '{"mode":"daily","questionBudget":2}',
  '[{"exerciseId":"office-file-definition","senseId":"office-submit-file","exerciseVersion":1,"source":"new"},{"exerciseId":"office-schedule-choice","senseId":"office-schedule-meeting","exerciseVersion":1,"source":"new"}]',
  '2026-11-25T00:00:00Z'
);
do $$
declare
  request jsonb := '{
    "expectedRevision": 0,
    "attempt": {
      "id":"30000000-0000-4000-8000-000000000001",
      "sessionId":"20000000-0000-4000-8000-000000000011",
      "exerciseId":"office-file-definition", "senseId":"office-submit-file",
      "contextId":"expense-claim", "exerciseKind":"definition-match", "exerciseVersion":1,
      "answer":"a", "outcome":"correct", "hintUsed":false, "answerRevealed":false,
      "isRetry":false, "qualifiedReview":false, "grade":null,
      "attemptedAt":"2026-11-25T00:01:00Z", "responseTimeMs":1000
    },
    "progress": {
      "senseId":"office-submit-file", "card":{"version":1,"dueAt":"2026-11-26T00:00:00Z","data":{}},
      "firstSeenAt":"2026-11-25T00:00:00Z", "masteryStage":"learning",
      "evidence":{"reviewDays":[],"contextIds":[],"hasTypingSuccess":false},
      "mistakeCount":0,"lastMistakeAt":null
    },
    "session": {
      "id":"20000000-0000-4000-8000-000000000011",
      "config":{"mode":"daily","questionBudget":2},
      "queue":[{"exerciseId":"office-file-definition","senseId":"office-submit-file","exerciseVersion":1,"source":"new"},{"exerciseId":"office-schedule-choice","senseId":"office-schedule-meeting","exerciseVersion":1,"source":"new"}],
      "cursor":1,"revision":1,"retryCounts":{},"status":"current",
      "startedAt":"2026-11-25T00:00:00Z","updatedAt":"2026-11-25T00:01:00Z"
    }
  }';
begin
  begin
    perform public.commit_learning_attempt(jsonb_set(request, '{progress,masteryStage}', '"invalid"'));
    raise exception 'Invalid progress was accepted';
  exception when check_violation then null;
  end;
  if exists (select 1 from public.attempts)
    or not exists (select 1 from public.learning_sessions where cursor = 0 and revision = 0) then
    raise exception 'Failed commit was not rolled back';
  end if;
  begin
    perform public.commit_learning_attempt(jsonb_set(request, '{attempt,contextId}', '"wrong-context"'));
    raise exception 'Mismatched content was accepted';
  exception when invalid_parameter_value then null;
  end;
  begin
    perform public.commit_learning_attempt(jsonb_set(request, '{session,status}', '"replaced"'));
    raise exception 'An answer replaced the session';
  exception when invalid_parameter_value then null;
  end;
  perform public.commit_learning_attempt(request);
  perform public.commit_learning_attempt(request);
  if (select count(*) from public.attempts) <> 1
    or not exists (select 1 from public.learning_sessions where cursor = 1 and revision = 1 and status = 'current')
    or not exists (select 1 from public.card_progress where sense_id = 'office-submit-file') then
    raise exception 'Commit or replay did not preserve one consistent transition';
  end if;
  begin
    perform public.commit_learning_attempt(jsonb_set(request, '{attempt,outcome}', '"incorrect"'));
    raise exception 'A changed replay was accepted';
  exception when invalid_parameter_value then null;
  end;
  begin
    perform public.commit_learning_attempt(jsonb_set(request, '{attempt,id}', '"30000000-0000-4000-8000-000000000002"'));
    raise exception 'A stale new attempt was accepted';
  exception when serialization_failure then null;
  end;
  if (select count(*) from public.attempts) <> 1 then
    raise exception 'Rejected attempts changed history';
  end if;
  perform public.start_learning_session(
    '20000000-0000-4000-8000-000000000012',
    '{"mode":"daily","questionBudget":1}',
    '[{"exerciseId":"office-file-definition","senseId":"office-submit-file","exerciseVersion":1,"source":"new"}]',
    '2026-11-25T00:02:00Z');
  perform public.commit_learning_attempt(request);
  if not exists (select 1 from public.learning_sessions
    where id = '20000000-0000-4000-8000-000000000011' and status = 'replaced' and cursor = 1)
    or not exists (select 1 from public.learning_sessions
    where id = '20000000-0000-4000-8000-000000000012' and status = 'current' and cursor = 0) then
    raise exception 'Replaying an earlier commit changed the new session';
  end if;
end $$;
rollback;
