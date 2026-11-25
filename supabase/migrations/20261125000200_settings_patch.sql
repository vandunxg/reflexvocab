create function public.save_settings(changes jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
begin
  if owner_id is null then
    raise exception using errcode = '42501', message = 'unauthenticated';
  end if;
  if jsonb_typeof(changes) is distinct from 'object'
     or exists (
       select 1 from jsonb_object_keys(changes) as key
       where key not in ('locale', 'dailyMinutes', 'newPerDay', 'voiceId',
                         'speechRate', 'timezone', 'onboardingCompleted')
     )
     or (changes ? 'locale' and (jsonb_typeof(changes->'locale') <> 'string'
         or changes->>'locale' not in ('en', 'vi')))
     or (changes ? 'dailyMinutes' and (jsonb_typeof(changes->'dailyMinutes') <> 'number'
         or changes->>'dailyMinutes' !~ '^[1-9][0-9]{0,3}$'))
     or (changes ? 'newPerDay' and (jsonb_typeof(changes->'newPerDay') <> 'number'
         or changes->>'newPerDay' !~ '^(0|[1-9][0-9]{0,3})$'))
     or (changes ? 'voiceId' and jsonb_typeof(changes->'voiceId') not in ('string', 'null'))
     or (changes ? 'speechRate' and (jsonb_typeof(changes->'speechRate') <> 'number'
         or (changes->>'speechRate')::numeric not between 0.1 and 10))
     or (changes ? 'timezone' and (jsonb_typeof(changes->'timezone') <> 'string'
         or not exists (select 1 from pg_catalog.pg_timezone_names
                        where name = changes->>'timezone')))
     or (changes ? 'onboardingCompleted' and jsonb_typeof(changes->'onboardingCompleted') <> 'boolean')
  then
    raise exception using errcode = '22023', message = 'invalid settings patch';
  end if;

  insert into public.user_settings (user_id) values (owner_id)
  on conflict (user_id) do nothing;
  update public.user_settings set
    locale = case when changes ? 'locale' then changes->>'locale' else locale end,
    daily_minutes = case when changes ? 'dailyMinutes' then (changes->>'dailyMinutes')::integer else daily_minutes end,
    new_per_day = case when changes ? 'newPerDay' then (changes->>'newPerDay')::integer else new_per_day end,
    voice_id = case when changes ? 'voiceId' then changes->>'voiceId' else voice_id end,
    speech_rate = case when changes ? 'speechRate' then (changes->>'speechRate')::double precision else speech_rate end,
    timezone = case when changes ? 'timezone' then changes->>'timezone' else timezone end,
    onboarding_completed = case when changes ? 'onboardingCompleted' then (changes->>'onboardingCompleted')::boolean else onboarding_completed end
  where user_id = owner_id;
end;
$$;

revoke all on function public.save_settings(jsonb) from public, anon;
grant execute on function public.save_settings(jsonb) to authenticated;
