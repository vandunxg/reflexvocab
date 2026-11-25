-- Run on a disposable development database; all fixture writes are rolled back.
begin;
\ir ../seed.sql

insert into auth.users (id) values ('68956dc4-1e4b-4e96-90ca-ec3b1b80ad7f');
insert into public.bookmarks (user_id, sense_id)
values ('68956dc4-1e4b-4e96-90ca-ec3b1b80ad7f', 'office-submit-file');
\ir ../content/office_follow_up.sql
update public.exercises set version = 2, explanation = 'Newer editorial wording.'
where id = 'office-confirm-definition';
\ir ../content/office_follow_up.sql

do $$ begin
  if (select count(*) from public.vocabulary_senses where lesson_id = 'office-follow-up') <> 4
    or (select count(*) from public.exercises where sense_id in
      ('office-confirm-arrangement', 'office-postpone-meeting', 'office-deadline-submission', 'office-agenda-meeting')) <> 8
  then raise exception 'Reviewed batch has an unexpected count'; end if;
  if not exists (select 1 from public.exercises where id = 'office-confirm-definition'
    and version = 2 and explanation = 'Newer editorial wording.')
  then raise exception 'Reimport overwrote a newer exercise revision'; end if;
  if not exists (select 1 from public.bookmarks
    where user_id = '68956dc4-1e4b-4e96-90ca-ec3b1b80ad7f' and sense_id = 'office-submit-file')
  then raise exception 'Reimport changed an existing bookmark'; end if;
end $$;
rollback;
