-- Run with psql -v ON_ERROR_STOP=1 against a disposable database after migrating.
begin;

insert into auth.users (id) values
  ('00000000-0000-4000-8000-000000000001'),
  ('00000000-0000-4000-8000-000000000002');

insert into public.curriculum_topics (id, course_id, level_id, title, position)
values ('office', 'test-course', 'foundation', 'Office', 0);
insert into public.curriculum_lessons (id, topic_id, title, position)
values ('office-1', 'office', 'Office 1', 0);
insert into public.vocabulary_senses (id, lesson_id, headword, part_of_speech, definition, version)
values ('file-verb', 'office-1', 'file', 'verb', 'submit formally', 1),
       ('file-noun', 'office-1', 'file', 'noun', 'collection of records', 1);
insert into public.vocabulary_contexts (sense_id, id, example)
values ('file-verb', 'report', 'Please file the report.');
insert into public.exercises (id, sense_id, context_id, kind, prompt, explanation, version, payload)
values ('e1', 'file-verb', 'report', 'typing-cloze', 'Please ___ the report.',
        'Submit the report formally.', 1, '{"acceptedAnswers":["file"]}');

insert into public.exercises (id, sense_id, context_id, kind, prompt, explanation, version, payload)
select 'e-' || kind::text, 'file-verb', 'report', kind, 'Prompt', 'Explanation', 1,
       '{"choices":[{"id":"a","text":"submit"},{"id":"b","text":"read"}],"correctChoiceId":"a"}'
from unnest(array['definition-match', 'multiple-choice-cloze', 'collocation-match']::public.exercise_kind[]) as kind;

insert into public.exercises (id, sense_id, context_id, kind, prompt, explanation, version, payload)
values ('e-sentence', 'file-verb', 'report', 'sentence-build', 'Build a sentence.', 'An imperative.', 1,
        '{"chunks":[{"id":"a","text":"File"},{"id":"b","text":"the report."}],"correctOrder":["a","b"]}');

insert into public.user_settings (user_id, locale)
values ('00000000-0000-4000-8000-000000000001', 'vi');

insert into public.learning_sessions (user_id, id, config, queue, cursor, revision, status)
values (
  '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000011',
  '{"mode":"daily","questionBudget":1}', '[{"exerciseId":"e1","exerciseVersion":1,"senseId":"file-verb","source":"new"}]',
  0, 0, 'current'
);

do $$
declare
  learner constant uuid := '00000000-0000-4000-8000-000000000001';
  other_learner constant uuid := '00000000-0000-4000-8000-000000000002';
  session_id constant uuid := '00000000-0000-4000-8000-000000000011';
  attempt_id constant uuid := '00000000-0000-4000-8000-000000000021';
  context_result text;
  answer_result jsonb;
  version_result integer;
begin
  begin
    insert into public.exercises (id, sense_id, context_id, kind, prompt, explanation, version, payload)
    values ('orphan', 'file-noun', 'report', 'typing-cloze', 'Prompt', 'Explanation', 1,
            '{"acceptedAnswers":["file"]}');
    raise exception 'Exercise accepted another sense''s context';
  exception when foreign_key_violation then null;
  end;

  begin
    update public.exercises set payload = '{}' where id = 'e1';
    raise exception 'Exercise accepted a missing answer key';
  exception when check_violation then null;
  end;

  begin
    update public.exercises set payload = '{"acceptedAnswers":["file",42]}' where id = 'e1';
    raise exception 'Exercise accepted a non-string answer variant';
  exception when check_violation then null;
  end;

  begin
    update public.exercises set payload = '{"choices":[{"id":"a"}],"correctChoiceId":"a"}'
    where kind = 'definition-match';
    raise exception 'Exercise accepted a choice without display text';
  exception when check_violation then null;
  end;

  begin
    update public.exercises set payload = '{"chunks":[{}],"correctOrder":["a"]}'
    where id = 'e-sentence';
    raise exception 'Exercise accepted a chunk without an ID and text';
  exception when check_violation then null;
  end;

  begin
    update public.learning_sessions set queue = '[{}]' where user_id = learner;
    raise exception 'Session accepted an unusable queue entry';
  exception when check_violation then null;
  end;

  begin
    update public.user_settings set locale = 'fr' where user_id = learner;
    raise exception 'Settings accepted an unsupported locale';
  exception when check_violation then null;
  end;

  begin
    update public.learning_sessions set revision = -1 where user_id = learner;
    raise exception 'Session accepted a negative revision';
  exception when check_violation then null;
  end;

  begin
    insert into public.learning_sessions (user_id, id, config, queue, cursor, revision, status)
    select user_id, gen_random_uuid(), config, queue, cursor, revision, status
    from public.learning_sessions where user_id = learner;
    raise exception 'Account accepted two current sessions';
  exception when unique_violation then null;
  end;

  begin
    insert into public.attempts (
      user_id, id, session_id, exercise_id, sense_id, context_id, exercise_kind,
      exercise_version, answer, outcome, hint_used, answer_revealed, is_retry,
      qualified_review, attempted_at, expected_revision, request_payload
    ) values (
      other_learner, attempt_id, session_id, 'e1', 'file-verb', 'report', 'typing-cloze',
      1, '"File"', 'correct', false, false, false, false, now(), 0, '{}'
    );
    raise exception 'Attempt accepted another account''s session';
  exception when foreign_key_violation then null;
  end;

  insert into public.attempts (
    user_id, id, session_id, exercise_id, sense_id, context_id, exercise_kind,
    exercise_version, answer, outcome, hint_used, answer_revealed, is_retry,
    qualified_review, attempted_at, expected_revision, request_payload
  ) values (
    learner, attempt_id, session_id, 'e1', 'file-verb', 'report', 'typing-cloze',
    1, '"File"', 'correct', false, false, false, false, now(), 0, '{}'
  );
  begin
    update public.attempts set answer = 'null', answer_revealed = true where id = attempt_id;
    raise exception 'Attempt accepted a correct outcome without a submission';
  exception when check_violation then null;
  end;

  begin
    update public.attempts set exercise_id = 'e-sentence', exercise_kind = 'sentence-build',
      answer = '[42]' where id = attempt_id;
    raise exception 'Sentence attempt accepted a non-string chunk ID';
  exception when check_violation then null;
  end;

  update public.learning_sessions set status = 'completed', cursor = 1, revision = 1 where user_id = learner;
  insert into public.learning_sessions (user_id, id, config, queue, cursor, revision, status)
  select user_id, gen_random_uuid(), config, queue, 0, 0, 'current'
  from public.learning_sessions where id = session_id;
  update public.exercises set version = 2, explanation = 'Corrected wording' where id = 'e1';

  select a.context_id, a.answer, a.exercise_version into strict context_result, answer_result, version_result
  from public.attempts a where a.user_id = learner and a.id = attempt_id;
  if (context_result, answer_result, version_result) is distinct from ('report'::text, '"File"'::jsonb, 1) then
    raise exception 'Content edit did not retain the attempt''s original evidence';
  end if;

  begin
    delete from public.learning_sessions where id = session_id;
    set constraints all immediate;
    raise exception 'Deleting a session erased its attempts';
  exception when foreign_key_violation then null;
  end;

  delete from auth.users where id = learner;
  set constraints all immediate;
  if exists (select 1 from public.attempts where user_id = learner) then
    raise exception 'Deleting the account left behind its attempts';
  end if;
end $$;

set local role anon;
do $$ begin
  perform id from public.exercises;
  raise exception 'Signed-out API role could read exercises';
exception when insufficient_privilege then null;
end $$;

set local role authenticated;
do $$ begin
  update public.learning_sessions set revision = 2;
  raise exception 'Authenticated API role could directly update sessions';
exception when insufficient_privilege then null;
end $$;

rollback;
