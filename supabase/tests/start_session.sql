begin;
insert into auth.users (id) values ('10000000-0000-4000-8000-000000000001');
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);

select public.start_learning_session(
  '20000000-0000-4000-8000-000000000001',
  '{"mode":"daily","questionBudget":2}',
  '[{"exerciseId":"office-file-definition","senseId":"office-submit-file","exerciseVersion":1,"source":"new"},{"exerciseId":"office-schedule-choice","senseId":"office-schedule-meeting","exerciseVersion":1,"source":"new"}]',
  '2026-11-25T00:00:00Z'
);

reset role;
update public.learning_sessions set cursor = 1, revision = 1
where id = '20000000-0000-4000-8000-000000000001';
set local role authenticated;
select public.start_learning_session(
  '20000000-0000-4000-8000-000000000001',
  '{"mode":"daily","questionBudget":2}',
  '[{"exerciseId":"office-file-definition","senseId":"office-submit-file","exerciseVersion":1,"source":"new"},{"exerciseId":"office-schedule-choice","senseId":"office-schedule-meeting","exerciseVersion":1,"source":"new"}]',
  '2026-11-25T00:00:00Z'
);
do $$ begin
  if not exists (select 1 from public.learning_sessions where cursor = 1 and revision = 1) then
    raise exception 'A create retry rewound the session';
  end if;
end $$;

select public.start_learning_session(
  '20000000-0000-4000-8000-000000000002',
  '{"mode":"daily","questionBudget":1}',
  '[{"exerciseId":"office-file-definition","senseId":"office-submit-file","exerciseVersion":1,"source":"new"}]',
  '2026-11-25T01:00:00Z'
);
select public.start_learning_session(
  '20000000-0000-4000-8000-000000000001',
  '{"mode":"daily","questionBudget":2}',
  '[{"exerciseId":"office-file-definition","senseId":"office-submit-file","exerciseVersion":1,"source":"new"},{"exerciseId":"office-schedule-choice","senseId":"office-schedule-meeting","exerciseVersion":1,"source":"new"}]',
  '2026-11-25T00:00:00Z'
);
do $$ begin
  if not exists (select 1 from public.learning_sessions
    where id = '20000000-0000-4000-8000-000000000001' and status = 'replaced' and cursor = 1)
    or not exists (select 1 from public.learning_sessions
      where id = '20000000-0000-4000-8000-000000000002' and status = 'current') then
    raise exception 'An old retry reactivated a replaced session';
  end if;
  begin
    perform public.start_learning_session(
      '20000000-0000-4000-8000-000000000001',
      '{"mode":"daily","questionBudget":1}', '[]', '2026-11-25T00:00:00Z');
    raise exception 'A changed retry was accepted';
  exception when invalid_parameter_value then null;
  end;
  begin
    perform public.start_learning_session(
      '20000000-0000-4000-8000-000000000003',
      '{"mode":"daily","questionBudget":1}',
      '[{"exerciseId":"missing","senseId":"office-submit-file","exerciseVersion":1,"source":"new"}]',
      '2026-11-25T02:00:00Z');
    raise exception 'An invalid exercise was accepted';
  exception when invalid_parameter_value then null;
  end;
  if not exists (select 1 from public.learning_sessions
    where id = '20000000-0000-4000-8000-000000000002' and status = 'current') then
    raise exception 'Invalid start replaced the current session';
  end if;
end $$;
select set_config('request.jwt.claim.sub', '', true);
do $$ begin
  begin
    perform public.start_learning_session(
      '20000000-0000-4000-8000-000000000003', '{}', '[]', now());
    raise exception 'An unauthenticated start was accepted';
  exception when insufficient_privilege then null;
  end;
end $$;
rollback;
