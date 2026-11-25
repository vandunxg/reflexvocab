-- Run against a migrated, disposable database with no existing starter content.
begin;
\ir ../seed.sql

insert into auth.users (id) values ('00000000-0000-4000-8000-000000000001');
insert into public.bookmarks (user_id, sense_id)
values ('00000000-0000-4000-8000-000000000001', 'office-submit-file');
update public.exercises set version = 2, explanation = 'Newer editorial wording.'
where id = 'office-file-definition';

\ir ../seed.sql

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000001', true);

do $$ begin
  if (select count(distinct kind) from public.exercises where active) <> 5 then
    raise exception 'The starter catalog does not expose all five exercise types';
  end if;
  if (select count(distinct context_id) from public.exercises
      where active and sense_id = 'office-submit-file') < 2 then
    raise exception 'The starter sense lacks distinct practice contexts';
  end if;
  if not exists (select 1 from public.bookmarks where sense_id = 'office-submit-file') then
    raise exception 'Reimport removed an existing learner bookmark';
  end if;
  if not exists (select 1 from public.exercises where id = 'office-file-definition' and version = 2) then
    raise exception 'Reimport of an old batch overwrote a newer exercise';
  end if;
end $$;

rollback;
