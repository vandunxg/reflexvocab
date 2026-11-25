grant select on public.curriculum_topics, public.curriculum_lessons, public.vocabulary_senses,
  public.vocabulary_contexts, public.exercises, public.user_settings, public.bookmarks,
  public.card_progress, public.learning_sessions, public.attempts to authenticated;

create policy catalog_select on public.curriculum_topics
  for select to authenticated using ((select auth.uid()) is not null);
create policy catalog_select on public.curriculum_lessons
  for select to authenticated using ((select auth.uid()) is not null);
create policy catalog_select on public.vocabulary_senses
  for select to authenticated using ((select auth.uid()) is not null);
create policy catalog_select on public.vocabulary_contexts
  for select to authenticated using ((select auth.uid()) is not null);
create policy catalog_select on public.exercises
  for select to authenticated using ((select auth.uid()) is not null);

create policy owner_select on public.user_settings
  for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_select on public.bookmarks
  for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_select on public.card_progress
  for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_select on public.learning_sessions
  for select to authenticated using ((select auth.uid()) = user_id);
create policy owner_select on public.attempts
  for select to authenticated using ((select auth.uid()) = user_id);
