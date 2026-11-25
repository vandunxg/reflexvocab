-- Original project-authored development content; no official TOEIC material.
insert into public.curriculum_topics (id, course_id, level_id, title, position)
values ('office-basics', 'workplace-english', 'foundation', 'Office basics', 0)
on conflict (id) do update set title = excluded.title, position = excluded.position;

insert into public.curriculum_lessons (id, topic_id, title, position)
values ('office-requests', 'office-basics', 'Day-to-day requests', 0)
on conflict (id) do update set title = excluded.title, position = excluded.position;

insert into public.vocabulary_senses as senses
  (id, lesson_id, headword, part_of_speech, definition, vi_gloss, collocations, version)
values
  ('office-submit-file', 'office-requests', 'file', 'verb',
   'to officially submit a document or request', 'nộp chính thức',
   array['file a report', 'file a claim'], 1),
  ('office-schedule-meeting', 'office-requests', 'schedule', 'verb',
   'to arrange for something to happen at a particular time', 'lên lịch',
   array['schedule a meeting', 'schedule an interview'], 1),
  ('office-attach-document', 'office-requests', 'attach', 'verb',
   'to include a file with an email or online message', 'đính kèm',
   array['attach a document', 'attach a copy'], 1)
on conflict (id) do update set
  headword = excluded.headword, part_of_speech = excluded.part_of_speech,
  definition = excluded.definition, vi_gloss = excluded.vi_gloss,
  collocations = excluded.collocations, version = excluded.version
where excluded.version > senses.version;

insert into public.vocabulary_contexts (sense_id, id, example)
values
  ('office-submit-file', 'expense-claim', 'Please file your expense claim by Friday.'),
  ('office-submit-file', 'incident-report', 'We need to file the incident report today.'),
  ('office-schedule-meeting', 'weekly-check-in', 'Let’s schedule a meeting for Tuesday at ten.'),
  ('office-schedule-meeting', 'candidate-interview', 'I’ll schedule an interview with the candidate for Monday.'),
  ('office-attach-document', 'email-invoice', 'Please attach the invoice to your email.'),
  ('office-attach-document', 'online-application', 'Attach a copy of your ID to the online application.')
on conflict (sense_id, id) do update set example = excluded.example;

insert into public.exercises as exercises
  (id, sense_id, context_id, kind, prompt, explanation, version, payload)
values
  ('office-file-definition', 'office-submit-file', 'expense-claim', 'definition-match',
   '“Please file your expense claim by Friday.” What does “file” mean here?',
   'You are asked to formally submit an expense claim for review.', 1,
   '{"choices":[{"id":"submit","text":"Submit it officially"},{"id":"discard","text":"Throw it away"},{"id":"read","text":"Read it out loud"}],"correctChoiceId":"submit"}'),
  ('office-file-collocation', 'office-submit-file', 'incident-report', 'collocation-match',
   'The safety officer needs the written report today. Which phrase means to submit it officially?',
   '“File an incident report” means to submit it through the official process.', 1,
   '{"choices":[{"id":"file","text":"file an incident report"},{"id":"read","text":"read an incident report"},{"id":"draft","text":"draft an incident report"}],"correctChoiceId":"file"}'),
  ('office-schedule-choice', 'office-schedule-meeting', 'weekly-check-in', 'multiple-choice-cloze',
   'We still need to pick a time. Let’s ___ a meeting for Tuesday at ten.',
   '“Schedule” means to arrange a time for the meeting.', 1,
   '{"choices":[{"id":"schedule","text":"schedule"},{"id":"attend","text":"attend"},{"id":"cancel","text":"cancel"}],"correctChoiceId":"schedule"}'),
  ('office-schedule-sentence', 'office-schedule-meeting', 'candidate-interview', 'sentence-build',
   'Arrange the chunks to confirm you will set up the candidate’s Monday interview.',
   'Use “schedule” before the event you are arranging: “I’ll schedule an interview with the candidate for Monday.”', 1,
   '{"chunks":[{"id":"speaker","text":"I’ll"},{"id":"verb","text":"schedule"},{"id":"event","text":"an interview"},{"id":"details","text":"with the candidate for Monday."}],"correctOrder":["speaker","verb","event","details"]}'),
  ('office-attach-typing', 'office-attach-document', 'email-invoice', 'typing-cloze',
   'Use the word meaning “include a file with a message”: Please ___ the invoice to your email.',
   '“Attach the invoice” means to include the invoice file with your email.', 1,
   '{"acceptedAnswers":["attach"]}'),
  ('office-attach-collocation', 'office-attach-document', 'online-application', 'collocation-match',
   'The application requires a digital copy of your ID. Which instruction says to include the copy with the application?',
   'To attach a copy is to include it as a file. Saving or printing the copy does not submit it with the form.', 1,
   '{"choices":[{"id":"attach","text":"attach a copy"},{"id":"print","text":"print a copy"},{"id":"save","text":"save a copy"}],"correctChoiceId":"attach"}')
on conflict (id) do update set
  prompt = excluded.prompt, explanation = excluded.explanation,
  payload = excluded.payload, version = excluded.version, active = excluded.active
where excluded.version > exercises.version
  and (excluded.sense_id, excluded.context_id, excluded.kind) =
    (exercises.sense_id, exercises.context_id, exercises.kind);

-- The schema checks references and keys; this also rejects ambiguous option IDs and invalid order.
do $$ begin
  if exists (
    select 1
    from public.exercises e
    join public.vocabulary_senses s on s.id = e.sense_id
    cross join lateral (
      select array_agg(option->>'id' order by option->>'id') as ids,
             count(*) as total, count(distinct option->>'id') as distinct_total
      from jsonb_array_elements(coalesce(e.payload->'choices', e.payload->'chunks', '[]')) as option
    ) options
    where s.lesson_id = 'office-requests'
      and (
        options.total <> options.distinct_total or
        (e.kind = 'sentence-build' and options.ids is distinct from array(
          select chunk.id
          from jsonb_array_elements_text(e.payload->'correctOrder') as chunk(id)
          order by chunk.id
        ))
      )
  ) then
    raise exception 'Starter catalog has duplicate option IDs or an invalid chunk order';
  end if;
end $$;
