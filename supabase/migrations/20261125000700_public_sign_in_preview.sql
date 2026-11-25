-- Only this reviewed exercise is public; the underlying catalog remains private.
create function public.sign_in_preview()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'topic', t.title,
    'prompt', e.prompt,
    'choices', (select jsonb_agg(choice->>'text' order by ordinal)
                from jsonb_array_elements(e.payload->'choices') with ordinality as items(choice, ordinal))
  )
  from public.exercises e
  join public.vocabulary_senses s on s.id = e.sense_id
  join public.curriculum_lessons l on l.id = s.lesson_id
  join public.curriculum_topics t on t.id = l.topic_id
  where e.id = 'office-schedule-choice' and e.active and e.kind = 'multiple-choice-cloze';
$$;

revoke all on function public.sign_in_preview() from public;
grant execute on function public.sign_in_preview() to anon, authenticated;
