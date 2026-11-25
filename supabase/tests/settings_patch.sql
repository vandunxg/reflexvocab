begin;
insert into auth.users (id) values
  ('00000000-0000-4000-8000-000000000001'),
  ('00000000-0000-4000-8000-000000000002');
insert into public.user_settings (user_id, locale, timezone, daily_minutes)
values ('00000000-0000-4000-8000-000000000001', 'vi', 'Asia/Ho_Chi_Minh', 10),
       ('00000000-0000-4000-8000-000000000002', 'en', 'UTC', 20);
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000001', true);
select public.save_settings('{"dailyMinutes":15}');
do $$ begin
  if not exists (select 1 from public.user_settings
      where locale = 'vi' and timezone = 'Asia/Ho_Chi_Minh' and daily_minutes = 15) then
    raise exception 'Patch did not preserve unrelated fields';
  end if;
  begin
    perform public.save_settings('{"userId":"00000000-0000-4000-8000-000000000002"}');
    raise exception 'Patch accepted an owner override';
  exception when invalid_parameter_value then null;
  end;
  begin
    perform public.save_settings('{"locale":null}');
    raise exception 'Patch accepted a null locale';
  exception when invalid_parameter_value then null;
  end;
  begin
    perform public.save_settings('{"timezone":"Invalid/Timezone"}');
    raise exception 'Patch accepted an invalid timezone';
  exception when invalid_parameter_value then null;
  end;
  begin
    perform public.save_settings('{"speechRate":"fast"}');
    raise exception 'Patch accepted a non-numeric speech rate';
  exception when invalid_parameter_value then null;
  end;
  perform public.save_settings('{"voiceId":null}');
end $$;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000002', true);
do $$ begin
  if not exists (select 1 from public.user_settings
      where locale = 'en' and timezone = 'UTC' and daily_minutes = 20) then
    raise exception 'Patch changed another account';
  end if;
end $$;
select set_config('request.jwt.claim.sub', '', true);
do $$ begin
  begin
    perform public.save_settings('{"locale":"vi"}');
    raise exception 'Patch accepted a missing identity';
  exception when insufficient_privilege then null;
  end;
end $$;
rollback;
