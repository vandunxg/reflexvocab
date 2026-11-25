-- Original project-authored content; reviewed by the owner on 25 November 2026.
-- Apply after seed.sql in a single transaction. Stable IDs never change their meaning or parent.
do $$ begin
  if exists (select 1 from public.curriculum_lessons where id = 'office-follow-up' and topic_id <> 'office-basics')
    or exists (
      select 1 from public.vocabulary_senses
      where id in ('office-confirm-arrangement', 'office-postpone-meeting', 'office-deadline-submission', 'office-agenda-meeting')
        and lesson_id <> 'office-follow-up'
    )
    or exists (
      select 1 from public.exercises
      where (id, sense_id, context_id, kind) not in (
        ('office-confirm-definition', 'office-confirm-arrangement', 'appointment-time', 'definition-match'),
        ('office-confirm-typing', 'office-confirm-arrangement', 'delivery-address', 'typing-cloze'),
        ('office-postpone-definition', 'office-postpone-meeting', 'meeting-rescheduled', 'definition-match'),
        ('office-postpone-choice', 'office-postpone-meeting', 'decision-delayed', 'multiple-choice-cloze'),
        ('office-deadline-definition', 'office-deadline-submission', 'report-submission', 'definition-match'),
        ('office-deadline-typing', 'office-deadline-submission', 'application-close', 'typing-cloze'),
        ('office-agenda-definition', 'office-agenda-meeting', 'team-meeting-topics', 'definition-match'),
        ('office-agenda-choice', 'office-agenda-meeting', 'client-discussion', 'multiple-choice-cloze')
      )
      and id in ('office-confirm-definition', 'office-confirm-typing', 'office-postpone-definition', 'office-postpone-choice',
        'office-deadline-definition', 'office-deadline-typing', 'office-agenda-definition', 'office-agenda-choice')
    )
  then raise exception 'Office follow-up IDs conflict with existing content'; end if;
end $$;

insert into public.curriculum_lessons (id, topic_id, title, position)
values ('office-follow-up', 'office-basics', 'Office follow-up', 1)
on conflict (id) do nothing;

insert into public.vocabulary_senses as senses
  (id, lesson_id, headword, part_of_speech, definition, vi_gloss, collocations, version)
values
  ('office-confirm-arrangement', 'office-follow-up', 'confirm', 'verb',
   'to say that an arrangement or detail is correct or definite', 'xác nhận',
   array['confirm an appointment', 'confirm the time'], 1),
  ('office-postpone-meeting', 'office-follow-up', 'postpone', 'verb',
   'to arrange for an event to happen later than planned', 'hoãn lại',
   array['postpone a meeting', 'postpone a decision'], 1),
  ('office-deadline-submission', 'office-follow-up', 'deadline', 'noun',
   'the latest time or date by which something must be done', 'hạn chót',
   array['meet a deadline', 'submission deadline'], 1),
  ('office-agenda-meeting', 'office-follow-up', 'agenda', 'noun',
   'a list of topics to discuss at a meeting', 'chương trình họp',
   array['meeting agenda', 'add an item to the agenda'], 1)
on conflict (id) do update set
  headword = excluded.headword, part_of_speech = excluded.part_of_speech,
  definition = excluded.definition, vi_gloss = excluded.vi_gloss,
  collocations = excluded.collocations, version = excluded.version
where excluded.version > senses.version and excluded.lesson_id = senses.lesson_id;

insert into public.vocabulary_contexts (sense_id, id, example)
values
  ('office-confirm-arrangement', 'appointment-time', 'Please confirm your appointment time by email.'),
  ('office-confirm-arrangement', 'delivery-address', 'The customer called to confirm the delivery address.'),
  ('office-postpone-meeting', 'meeting-rescheduled', 'We had to postpone the meeting until Thursday.'),
  ('office-postpone-meeting', 'decision-delayed', 'The committee decided to postpone its decision until next week.'),
  ('office-deadline-submission', 'report-submission', 'The deadline for the report is Friday at noon.'),
  ('office-deadline-submission', 'application-close', 'The application deadline is 5 p.m. on Monday.'),
  ('office-agenda-meeting', 'team-meeting-topics', 'The agenda lists three topics for tomorrow’s team meeting.'),
  ('office-agenda-meeting', 'client-discussion', 'Please add the budget review to the client meeting agenda.')
on conflict (sense_id, id) do nothing;

insert into public.exercises as exercises
  (id, sense_id, context_id, kind, prompt, explanation, version, payload)
values
  ('office-confirm-definition', 'office-confirm-arrangement', 'appointment-time', 'definition-match',
   'Please confirm your appointment time by email. What does “confirm” mean?',
   'Confirming tells the recipient that the stated time is correct or definite.', 1,
   '{"choices":[{"id":"definite","text":"State that the time is definite"},{"id":"cancel","text":"Cancel the appointment"},{"id":"move","text":"Move it to another day"}],"correctChoiceId":"definite"}'),
  ('office-confirm-typing', 'office-confirm-arrangement', 'delivery-address', 'typing-cloze',
   'The delivery address is correct. Please ___ it by email.',
   'Confirm means to state that a detail is correct.', 1, '{"acceptedAnswers":["confirm"]}'),
  ('office-postpone-definition', 'office-postpone-meeting', 'meeting-rescheduled', 'definition-match',
   'We had to postpone the meeting until Thursday. What does “postpone” mean?',
   'Postpone changes the event to a later time without necessarily cancelling it.', 1,
   '{"choices":[{"id":"later","text":"Arrange for it to happen later"},{"id":"earlier","text":"Hold it earlier"},{"id":"cancel","text":"Cancel it permanently"}],"correctChoiceId":"later"}'),
  ('office-postpone-choice', 'office-postpone-meeting', 'decision-delayed', 'multiple-choice-cloze',
   'The committee needs more time, so it will ___ its decision until next week.',
   'Postponing moves the decision to a later time.', 1,
   '{"choices":[{"id":"postpone","text":"postpone"},{"id":"announce","text":"announce"},{"id":"finalize","text":"finalize"}],"correctChoiceId":"postpone"}'),
  ('office-deadline-definition', 'office-deadline-submission', 'report-submission', 'definition-match',
   'The deadline for the report is Friday at noon. What is the deadline?',
   'The deadline specifies the latest time for completing or submitting the work.', 1,
   '{"choices":[{"id":"latest","text":"The latest time to submit the report"},{"id":"title","text":"The report’s title"},{"id":"author","text":"The person who wrote the report"}],"correctChoiceId":"latest"}'),
  ('office-deadline-typing', 'office-deadline-submission', 'application-close', 'typing-cloze',
   'Applications close at 5 p.m. Monday. That is the submission ___.',
   'A submission deadline is the latest permitted submission time.', 1, '{"acceptedAnswers":["deadline"]}'),
  ('office-agenda-definition', 'office-agenda-meeting', 'team-meeting-topics', 'definition-match',
   'The agenda lists three topics for tomorrow’s team meeting. What is the agenda?',
   'A meeting agenda lists the matters participants plan to discuss.', 1,
   '{"choices":[{"id":"topics","text":"The list of topics for discussion"},{"id":"salaries","text":"A list of employees’ salaries"},{"id":"seating","text":"The room’s seating plan"}],"correctChoiceId":"topics"}'),
  ('office-agenda-choice', 'office-agenda-meeting', 'client-discussion', 'multiple-choice-cloze',
   'Please add the budget review to the list of meeting topics, or the ___.',
   'An agenda is the list of topics for a meeting.', 1,
   '{"choices":[{"id":"agenda","text":"agenda"},{"id":"invoice","text":"invoice"},{"id":"receipt","text":"receipt"}],"correctChoiceId":"agenda"}')
on conflict (id) do update set
  prompt = excluded.prompt, explanation = excluded.explanation,
  payload = excluded.payload, version = excluded.version, active = excluded.active
where excluded.version > exercises.version
  and (excluded.sense_id, excluded.context_id, excluded.kind) =
    (exercises.sense_id, exercises.context_id, exercises.kind);

do $$ begin
  if (select count(*) from public.vocabulary_senses where lesson_id = 'office-follow-up') <> 4 then
    raise exception 'Draft must contain four senses';
  end if;
  if exists (
    select 1 from public.vocabulary_senses s
    where s.lesson_id = 'office-follow-up'
      and (select count(distinct context_id) from public.exercises e where e.sense_id = s.id and e.active) < 2
  ) then
    raise exception 'Each draft sense needs two exercised contexts';
  end if;
  if exists (
    select 1 from public.exercises e
    join public.vocabulary_senses s on s.id = e.sense_id
    cross join lateral (
      select count(*) total, count(distinct option->>'id') distinct_total
      from jsonb_array_elements(coalesce(e.payload->'choices', '[]')) option
    ) options
    where s.lesson_id = 'office-follow-up' and options.total <> options.distinct_total
  ) then
    raise exception 'Draft has duplicate option IDs';
  end if;
end $$;
