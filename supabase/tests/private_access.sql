-- Run as the database administrator against a migrated disposable Supabase database.
begin;

insert into auth.users (id) values
  ('00000000-0000-4000-8000-000000000001'),
  ('00000000-0000-4000-8000-000000000002');
insert into public.user_settings (user_id, locale) values
  ('00000000-0000-4000-8000-000000000001', 'vi'),
  ('00000000-0000-4000-8000-000000000002', 'en');
insert into public.curriculum_topics (id, course_id, level_id, title, position)
values ('test-topic', 'test-course', 'foundation', 'Office', 0);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000001', true);

do $$
begin
  if (select array_agg(locale) from public.user_settings) is distinct from array['vi'] then
    raise exception 'Authenticated learner cannot read exactly their own settings';
  end if;
  if not exists (select 1 from public.curriculum_topics where id = 'test-topic') then
    raise exception 'The signed-in learner cannot read the shared catalog';
  end if;
  begin
    update public.user_settings set locale = 'vi'
    where user_id = '00000000-0000-4000-8000-000000000002';
    raise exception 'Authenticated client could directly update settings';
  exception when insufficient_privilege then null;
  end;
end $$;

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000002', true);
do $$ begin
  if (select array_agg(locale) from public.user_settings) is distinct from array['en'] then
    raise exception 'The second identity did not see exactly its own settings';
  end if;
end $$;

select set_config('request.jwt.claim.sub', '', true);
do $$ begin
  if exists (select 1 from public.curriculum_topics) or exists (select 1 from public.user_settings) then
    raise exception 'Authenticated role without a user identity could read rows';
  end if;
end $$;

set local role anon;
do $$ begin
  perform id from public.curriculum_topics;
  raise exception 'Signed-out role could read catalog rows';
exception when insufficient_privilege then null;
end $$;

rollback;
