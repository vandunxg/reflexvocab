-- Run against a seeded disposable database; all changes are rolled back.
begin;
set local role anon;
do $$
declare preview jsonb;
begin
  select public.sign_in_preview() into preview;
  if preview->>'topic' <> 'Office basics'
     or preview->>'prompt' is null
     or jsonb_array_length(preview->'choices') <> 3 then
    raise exception 'Preview must contain the selected exercise';
  end if;
  if preview ? 'correctChoiceId' or preview ? 'explanation' then
    raise exception 'Preview exposes additional exercise fields';
  end if;
  begin
    perform id from public.exercises;
    raise exception 'Anonymous role could read the catalog';
  exception when insufficient_privilege then null;
  end;
end $$;
rollback;
