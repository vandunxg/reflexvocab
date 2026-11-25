begin;
insert into auth.users (id) values
  ('00000000-0000-4000-8000-000000000001'),
  ('00000000-0000-4000-8000-000000000002');
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000001', true);
select public.set_bookmark('office-submit-file', true);
select public.set_bookmark('office-submit-file', true);
select public.set_bookmark('office-schedule-meeting', true);
do $$ begin
  if (select count(*) from public.bookmarks) <> 2 then
    raise exception 'Saving bookmarks is not idempotent';
  end if;
  begin
    perform public.set_bookmark('nonexistent-sense', true);
    raise exception 'An unknown sense was accepted';
  exception when foreign_key_violation then null;
  end;
  begin
    perform public.set_bookmark('office-submit-file', null);
    raise exception 'A null desired state was accepted';
  exception when invalid_parameter_value then null;
  end;
end $$;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000002', true);
select public.set_bookmark('office-submit-file', true);
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000001', true);
select public.set_bookmark('office-submit-file', false);
select public.set_bookmark('office-submit-file', false);
do $$ begin
  if (select count(*) from public.bookmarks) <> 1
    or not exists (select 1 from public.bookmarks where sense_id='office-schedule-meeting') then
    raise exception 'Deleting one bookmark changed another';
  end if;
end $$;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000002', true);
do $$ begin
  if not exists (select 1 from public.bookmarks where sense_id='office-submit-file') then
    raise exception 'Deleting a bookmark changed another account';
  end if;
end $$;
select set_config('request.jwt.claim.sub', '', true);
do $$ begin
  begin
    perform public.set_bookmark('office-submit-file', true);
    raise exception 'Missing identity accepted';
  exception when insufficient_privilege then null;
  end;
end $$;
rollback;
