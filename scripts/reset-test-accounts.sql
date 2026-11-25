-- Removes learning data only for the dedicated hosted test accounts.
begin;
create temp table test_users on commit drop as
  select id from auth.users where email in ('rv-test-1@example.com', 'rv-test-2@example.com');
delete from public.attempts where user_id in (select id from test_users);
delete from public.learning_sessions where user_id in (select id from test_users);
delete from public.card_progress where user_id in (select id from test_users);
delete from public.bookmarks where user_id in (select id from test_users);
delete from public.user_settings where user_id in (select id from test_users);
select count(*) as test_users from test_users;
commit;
