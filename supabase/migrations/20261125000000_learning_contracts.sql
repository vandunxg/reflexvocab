create table public.curriculum_topics (
  id text primary key check (id <> ''),
  course_id text not null check (course_id <> ''),
  level_id text not null check (level_id <> ''),
  title text not null,
  position integer not null check (position >= 0)
);

create table public.curriculum_lessons (
  id text primary key check (id <> ''),
  topic_id text not null references public.curriculum_topics (id),
  title text not null,
  position integer not null check (position >= 0)
);

create table public.vocabulary_senses (
  id text primary key check (id <> ''),
  lesson_id text not null references public.curriculum_lessons (id),
  headword text not null,
  part_of_speech text not null,
  definition text not null,
  vi_gloss text,
  ipa text,
  collocations text[] not null default '{}',
  version integer not null check (version > 0)
);

create table public.vocabulary_contexts (
  sense_id text not null references public.vocabulary_senses (id),
  id text not null check (id <> ''),
  example text not null,
  primary key (sense_id, id)
);

create type public.exercise_kind as enum (
  'definition-match', 'multiple-choice-cloze', 'typing-cloze', 'collocation-match', 'sentence-build'
);

create table public.exercises (
  id text primary key check (id <> ''),
  sense_id text not null,
  context_id text not null,
  kind public.exercise_kind not null,
  prompt text not null,
  explanation text not null,
  version integer not null check (version > 0),
  active boolean not null default true,
  payload jsonb not null,
  foreign key (sense_id, context_id) references public.vocabulary_contexts (sense_id, id),
  unique (id, sense_id, context_id, kind),
  -- Full option/answer validation belongs to the reviewed import boundary.
  check (jsonb_typeof(payload) = 'object' and (
    case kind
      when 'typing-cloze' then
        jsonb_typeof(payload->'acceptedAnswers') = 'array' and
        payload @? '$.acceptedAnswers[0]' and
        not payload @? '$.acceptedAnswers[*] ? (@.type() != "string" || @ == "")'
      when 'sentence-build' then
        jsonb_typeof(payload->'chunks') = 'array' and payload @? '$.chunks[0]' and
        not payload @? '$.chunks[*] ? (@.type() != "object" ||
          !exists(@.id) || @.id.type() != "string" || @.id == "" ||
          !exists(@.text) || @.text.type() != "string")' and
        jsonb_typeof(payload->'correctOrder') = 'array' and
        payload @? '$.correctOrder[0]' and
        not payload @? '$.correctOrder[*] ? (@.type() != "string" || @ == "")'
      else
        jsonb_typeof(payload->'choices') = 'array' and
        not payload @? '$.choices[*] ? (@.type() != "object" ||
          !exists(@.id) || @.id.type() != "string" || @.id == "" ||
          !exists(@.text) || @.text.type() != "string")' and
        jsonb_typeof(payload->'correctChoiceId') = 'string' and
        payload->>'correctChoiceId' <> '' and
        payload->'choices' @> jsonb_build_array(jsonb_build_object('id', payload->'correctChoiceId'))
    end
  ) is true)
);

create table public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  locale text not null default 'en' check (locale in ('en', 'vi')),
  daily_minutes integer not null default 10 check (daily_minutes > 0),
  new_per_day integer not null default 8 check (new_per_day >= 0),
  voice_id text,
  speech_rate double precision not null default 0.9 check (speech_rate between 0.1 and 10),
  timezone text not null default 'Asia/Ho_Chi_Minh' check (timezone <> ''),
  onboarding_completed boolean not null default false
);

create table public.bookmarks (
  user_id uuid not null references auth.users (id) on delete cascade,
  sense_id text not null references public.vocabulary_senses (id),
  primary key (user_id, sense_id)
);

create table public.card_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  sense_id text not null references public.vocabulary_senses (id),
  card jsonb not null check ((jsonb_typeof(card) = 'object' and
    jsonb_typeof(card->'version') = 'number' and jsonb_typeof(card->'dueAt') = 'string' and
    jsonb_typeof(card->'data') = 'object') is true),
  first_seen_at timestamptz not null,
  mastery_stage text not null check (mastery_stage in ('new', 'learning', 'familiar', 'mastered')),
  evidence jsonb not null check ((jsonb_typeof(evidence) = 'object' and
    jsonb_typeof(evidence->'reviewDays') = 'array' and
    jsonb_typeof(evidence->'contextIds') = 'array' and
    jsonb_typeof(evidence->'hasTypingSuccess') = 'boolean') is true),
  mistake_count integer not null default 0 check (mistake_count >= 0),
  last_mistake_at timestamptz,
  primary key (user_id, sense_id)
);

create table public.learning_sessions (
  user_id uuid not null references auth.users (id) on delete cascade,
  id uuid not null,
  config jsonb not null check ((jsonb_typeof(config) = 'object' and
    config->>'mode' in ('daily', 'lesson', 'quick', 'due', 'mistakes', 'weak', 'topic', 'custom') and
    jsonb_typeof(config->'questionBudget') = 'number') is true),
  queue jsonb not null check (not queue @? '$[*] ? (@.type() != "object" ||
    !exists(@.exerciseId) || @.exerciseId.type() != "string" || @.exerciseId == "" ||
    !exists(@.senseId) || @.senseId.type() != "string" || @.senseId == "" ||
    !exists(@.exerciseVersion) || @.exerciseVersion.type() != "number" ||
      @.exerciseVersion < 1 || @.exerciseVersion != @.exerciseVersion.floor() ||
    !exists(@.source) || @.source.type() != "string" ||
      !(@.source == "new" || @.source == "due" || @.source == "weak" ||
        @.source == "practice" || @.source == "retry"))'),
  cursor integer not null default 0 check (cursor >= 0),
  revision integer not null default 0 check (revision >= 0),
  retry_counts jsonb not null default '{}' check (jsonb_typeof(retry_counts) = 'object'),
  status text not null default 'current' check (status in ('current', 'completed', 'replaced')),
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id),
  check (case when jsonb_typeof(queue) = 'array' then
    case status
      when 'current' then cursor < jsonb_array_length(queue)
      when 'completed' then cursor = jsonb_array_length(queue)
      else cursor <= jsonb_array_length(queue)
    end
    else false
  end)
);

create unique index learning_sessions_one_current_per_user
  on public.learning_sessions (user_id) where status = 'current';

create table public.attempts (
  user_id uuid not null references auth.users (id) on delete cascade,
  id uuid not null,
  session_id uuid not null,
  exercise_id text not null,
  sense_id text not null,
  context_id text not null,
  exercise_kind public.exercise_kind not null,
  exercise_version integer not null check (exercise_version > 0),
  answer jsonb not null,
  outcome text not null check (outcome in ('correct', 'incorrect')),
  hint_used boolean not null,
  answer_revealed boolean not null,
  is_retry boolean not null,
  qualified_review boolean not null,
  grade text check (grade in ('again', 'hard', 'good')),
  attempted_at timestamptz not null,
  response_time_ms integer check (response_time_ms >= 0),
  expected_revision integer not null check (expected_revision >= 0),
  request_payload jsonb not null check (jsonb_typeof(request_payload) = 'object'),
  primary key (user_id, id),
  foreign key (user_id, session_id) references public.learning_sessions (user_id, id),
  foreign key (exercise_id, sense_id, context_id, exercise_kind)
    references public.exercises (id, sense_id, context_id, kind),
  check (case
    when answer = 'null'::jsonb then answer_revealed and outcome = 'incorrect'
    when exercise_kind = 'sentence-build' then
      jsonb_typeof(answer) = 'array' and not answer @? '$[*] ? (@.type() != "string" || @ == "")'
    else jsonb_typeof(answer) = 'string'
  end)
);

alter table public.curriculum_topics enable row level security;
alter table public.curriculum_lessons enable row level security;
alter table public.vocabulary_senses enable row level security;
alter table public.vocabulary_contexts enable row level security;
alter table public.exercises enable row level security;
alter table public.user_settings enable row level security;
alter table public.bookmarks enable row level security;
alter table public.card_progress enable row level security;
alter table public.learning_sessions enable row level security;
alter table public.attempts enable row level security;

-- No API client access until the ownership policies and write boundaries are added.
revoke all on public.curriculum_topics, public.curriculum_lessons, public.vocabulary_senses,
  public.vocabulary_contexts, public.exercises, public.user_settings, public.bookmarks,
  public.card_progress, public.learning_sessions, public.attempts from public, anon, authenticated;

grant select, insert, update, delete on public.curriculum_topics, public.curriculum_lessons,
  public.vocabulary_senses, public.vocabulary_contexts, public.exercises, public.user_settings,
  public.bookmarks, public.card_progress, public.learning_sessions, public.attempts to service_role;
