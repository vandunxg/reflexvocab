# System design — planned MVP

This document specifies the system to build. The starter contains the development foundation; the learning application, authentication, database, adapters, content and product screens described here are **not implemented**. [PROGRESS.md](PROGRESS.md) is the sole implementation status and handoff record. [REQUIREMENTS.md](REQUIREMENTS.md) defines product behavior; [PLAN.md](PLAN.md) indexes the detailed phase tasks.

## 1. Scope and architecture

The application will be a React SPA built with Vite and strict TypeScript. Supabase will provide private authentication and PostgreSQL persistence. The first usable product will support context-based vocabulary learning, five exercise kinds, review scheduling, practical feedback and incremental saving.

There will be three deliberate boundaries:

| Boundary             | Responsibility                                                         | First implementation to build                                   |
| -------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------- |
| Audio                | Voice selection, playback and cancellation                             | Browser TTS                                                     |
| `LearningRepository` | Read a learner snapshot and persist meaningful learning operations     | Supabase                                                        |
| FSRS wrapper         | Translate application grades and serialized cards into scheduler calls | A maintained FSRS library, selected and pinned when implemented |

Exercise selection, grading, retry rules and mastery will remain ordinary domain functions. They will not require a plugin registry, dependency injection container, event bus or separate backend service. Components will call application functions and the small boundaries above; domain functions will not import React, the Supabase SDK or browser speech APIs.

Auth and shared learning state will live near the application root. Input text, selected options, hint visibility and unsaved feedback will stay near the session components that use them. A small provider will be sufficient initially; an additional state/cache library will require a concrete problem to solve.

Folder names such as `src/domain/`, `src/features/session/` and `src/lib/repositories/` are possible implementation locations, not directories to generate in advance. A phase task will create only the files needed for its working slice.

## 2. Product surfaces

The whole application will use the bright, colorful Brilliant-inspired direction described in the design requirements. Desktop navigation will contain five pill tabs: **Today, Learn, Practice, Library, Progress**. Mobile will expose the same destinations in bottom navigation. Settings will be a separate account/settings action. The session and onboarding will use focused layouts that remove unrelated navigation while preserving a clear way back.

English will remain the documentation/code language and the default/fallback interface locale. The React composition root will provide one shared i18n instance with reviewed `en` and `vi` message catalogs. Components will use semantic keys for visible copy and accessibility text; domain/repository failures will expose stable codes that the UI translates. English definitions, examples and audio will lead the learning experience. Vietnamese learning glosses remain available on demand and independent of UI locale; showing a gloss will be recorded as assistance when the exercise treats it as a hint.

Onboarding will have three short steps: daily minutes, new senses per day, and a first-session topic. Skipping a step will use its agreed default while preserving earlier choices: 10 minutes, 8 new senses per day and the first editorially recommended available foundation topic. Onboarding will update only the `dailyMinutes` and `newPerDay` preferences plus a minimal completion marker. The topic will remain a draft passed into the first `SessionConfig`, not another saved settings field. Default interface locale will be `en`; default timezone will remain `Asia/Ho_Chi_Minh`, editable independently in Settings; voice will be automatic English and playback rate `0.9`. No language/timezone questionnaire or placement test will block the first session.

The supplied design boards under `docs/design/` will be consulted for screen composition; their inventory is documented in `docs/design/README.md`. Empty or loading states will describe the real state of the application, rather than displaying invented progress or mock accounts.

## 3. Logical data model

The following model will guide the first database migration and TypeScript types. It is not an existing SQL schema. Ownership and relationships will use explicit columns and constraints; variable exercise payloads may use JSONB. The implementation will avoid separate tables for every hint, answer option or scheduler parameter.

| Logical object      | Identity and relationships                                  | Essential data and meaning                                                                                                                                                                              |
| ------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Curriculum metadata | Course → level → topic/unit → lesson                        | Stable IDs, ordering, title and referenced sense IDs. Small metadata collections will be enough before an authoring tool is needed.                                                                     |
| Vocabulary sense    | Stable `senseId`; belongs to content metadata               | One meaning or phrase, word, part of speech, definition, optional VI gloss, examples, collocations, level/topic and content version. Progress will belong to a sense rather than an ambiguous headword. |
| Exercise            | Stable `exerciseId`, `senseId`, `contextId`                 | Discriminated kind, prompt, accepted answer data, explanation and content version. A different UI template will not automatically count as a different context.                                         |
| User settings       | Authenticated user ID                                       | UI locale (`en` or `vi`), daily minutes, new-sense limit, voice, rate and timezone. A minimal completed-onboarding marker will be system metadata; no persistent topic preference will be added.         |
| Bookmark            | Unique user + sense                                         | A deliberate saved/not-saved choice; it will not be learning evidence.                                                                                                                                  |
| Card progress       | Unique user + sense                                         | Serialized FSRS card, `firstSeenAt`, mastery state, qualifying evidence and mistake history/count.                                                                                                      |
| Learning session    | User + session ID                                           | Config, chosen exercise queue, cursor, revision, bounded retry counts, start/update timestamps and completion state. At most one session will be current per user.                                      |
| Attempt             | Unique user + attempt ID; references session/exercise/sense | Immutable answer and outcome, context/kind, assistance flags, retry flag, timestamp and response time when valid. Enough request identity will be retained to recognize an exact retry.                 |

Lesson completion will remain separate from sense mastery. Initially it may be derived from committed learning activity; a stored lesson-progress record will be introduced only if the curriculum flow needs it. Beginning a topic, browsing a word or skipping a lesson will not mark its senses as mastered.

The initial exercise union will cover:

- Definition matching: choose the accepted definition for the given context.
- Multiple-choice cloze: choose a word or phrase that fits meaning and grammar.
- Typing cloze: compare normalized input with an explicit accepted-answer set.
- Collocation matching: choose or match the appropriate partner in context.
- Sentence building: select ordered chunks with undo/reset support.

Content will be authored or prepared ahead of use and reviewed before import. Runtime behavior will select and shuffle valid content, not depend on a generative AI call. Content IDs will remain stable when correcting spelling or explanations. A changed meaning will receive a new sense ID. Imports will not overwrite learner progress. Imported provenance/license information will be retained where applicable.

Timestamps will be stored in UTC; calendar-based limits, streaks and day comparisons will use the saved IANA timezone. `firstSeenAt` will distinguish introduction day from later recall. Card date serialization will be handled by the FSRS wrapper, rather than scattered through components.

User-visible numbers, dates and relative times will be formatted with the active UI locale and the saved timezone. Locale resources contain UI copy only; reviewed learning content and answer keys remain in the content model. Missing translation keys fail the locale-parity check during development, while an unsupported persisted locale safely resolves to `en` at runtime.

## 4. Auth and ownership

The product will use pre-created accounts and email/password sign-in. Public registration and anonymous sign-ins will be disabled in Supabase. A frontend auth gate will control screen access, while database grants, RLS and validated write operations will enforce data access. Supabase's [Auth configuration](https://supabase.com/docs/guides/auth/general-configuration) describes the provider-side signup setting.

| Actor                 | Planned catalog access                                               | Planned learner-data access                                                       |
| --------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Signed out            | None                                                                 | None                                                                              |
| Signed-in learner     | Read reviewed shared content                                         | Read own records; write only permitted settings/bookmark and learning operations  |
| Content administrator | Import/update reviewed content through a trusted administrative path | No administrator UI or elevated credential will be shipped in the learning client |

Private records will be scoped to the authenticated server identity. Supabase RLS policies will use `auth.uid()` for ownership; a user ID passed by the browser will not grant permission. Table grants and policies will be reviewed together, following the [RLS documentation](https://supabase.com/docs/guides/database/postgres/row-level-security).

The browser will receive only the project URL and publishable key. Administrative secrets and service-role keys will stay outside the frontend; publishable-key access will still be constrained by authentication and database policies. The [API key guide](https://supabase.com/docs/guides/getting-started/api-keys) distinguishes these key types.

Changing accounts will clear the previous account's in-memory snapshot. Refreshing a token for the same user will not restart the active question or discard unsaved feedback. Sign-out will stop audio and remove private application state. A missing configuration or failed request will show a recoverable error; it will not activate a local demo or substitute mock content.

## 5. Atomic answer saving

Supabase will be the source of truth for saved learning data. The first persistence implementation will provide one narrow transaction for each answer, rather than independent browser writes to attempts, cards and sessions.

1. The client will persist the initial session before presenting its first question. Starting a replacement session will preserve previous saved answers and clearly end the previous current session.
2. On submission, the client will create one attempt ID and compute feedback plus the proposed progress/session transition. It will retain this exact request while saving or retrying.
3. The server operation will authenticate the user and validate enough request structure to identify the user-scoped attempt. Within the serialized write boundary, it will look for that attempt ID and compare the original payload **before checking the current session revision**. The same committed request will return its prior success acknowledgement without applying another transition, even if the session has since advanced or been replaced. Reusing that ID with different content will be rejected.
4. Only a fresh request will proceed to content/reference validation and the current-session/cursor/`expectedRevision` checks. A stale or replaced session will reject a fresh request without partial writes.
5. The lookup and mutation will share a concurrency-safe transaction boundary. For example, a per-user/session mutation lock can precede the duplicate lookup; an implementation that checks before locking must check again after acquiring the lock. Two simultaneous deliveries of the same request must both observe its single committed result, rather than the second failing solely because the first advanced the revision.
6. Attempt, card progress and session cursor/revision will commit together. Failure at any stage will roll back the complete transition.
7. The UI will show grading feedback immediately, but will say "Saved" and allow the next question only after the save succeeds.

Direct writes that bypass this learning transaction will be denied. If a privileged database function is needed, it will use explicit authenticated ownership checks, a restricted search path and restricted execution grants. Privilege will not be treated as permission to trust caller-supplied ownership.

An exact retry after an uncertain network response will reuse the original ID and payload. An already committed request will remain a successful replay; a genuinely fresh stale request will reload authoritative state rather than merge two learning sessions. The MVP will not include a durable offline outbox: closing the tab before a successful save may lose that unsaved answer, and the UI will explain that limit when relevant.

The client will grade exercises and propose its own scheduler transition for this personal learning product. The server will protect ownership and transaction consistency. This trust boundary will not provide exam integrity or hide answer keys from the learner. A certification feature would require server-side grading and a separate requirement decision.

## 6. Learning evidence and scheduling

Curriculum will decide what new content to introduce. Rule-based adaptation will choose an appropriate exercise form. FSRS will decide when an eligible card should be reviewed. Only the learning domain will decide whether an attempt qualifies to change scheduling or mastery.

| Situation                                          | Planned effect                                                                                                        |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| First encounter                                    | Record the attempt and initialize the card; record introduction time without treating it as later independent recall. |
| Due, correct, unassisted recall                    | Apply the chosen successful grade; add eligible context/day/productive-recall evidence.                               |
| Due recall with a non-revealing hint               | Record assistance and apply the assisted grade; do not add independent-recall evidence.                               |
| Due failure or answer reveal                       | Apply the failure grade and reassess current mastery evidence while keeping attempt history.                          |
| Immediate retry or practice before the card is due | Record practice and feedback; do not repeatedly push the long-term schedule forward or manufacture new evidence days. |
| Fast response                                      | Record valid timing for future analysis; do not infer mastery or assign `Easy` from speed alone.                      |

Initial grade mapping will be `Again` for an eligible failed/revealed recall, `Hard` for an eligible correct assisted recall, and `Good` for an eligible independent success. Exact mastery thresholds and retry limits will live in [REQUIREMENTS.md](REQUIREMENTS.md), with implementation defaults named in one domain location. They will be product heuristics, not claims of a validated TOEIC score.

The session builder will interleave due, new and weak senses, respect the daily new-sense limit, and avoid duplicate initial entries for the same sense. Retry practice will be bounded and separated by intervening questions where possible. It will prefer another reviewed context when one exists, without fabricating one at runtime. Requested topic/kind/sense filters will not be silently widened to fill a queue.

Progress screens will distinguish lesson/session completion, sense mastery, unassisted accuracy, observed eligible-review retention and scheduler estimates. Each metric will have a clear denominator and date/history scope. Paginated or bounded history will not be presented as complete lifetime analytics. Initial reads will use ordinary bounded queries; aggregates or additional caching will be added only when a real screen requires them.

## 7. Runtime failures and extensions

Content unavailable, access denied, network failure, stale session and unavailable audio will have different recoverable states. An unavailable TTS voice will not prevent text-based exercises. A missing catalog will not become a fabricated lesson.

| Later need                                                                  | Smallest expected change                                                                      |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Another audio provider or reviewed recordings                               | Implement the audio boundary; add a trusted server endpoint only if secrets are needed.       |
| Another exercise kind                                                       | Extend the typed exercise union, evaluator, renderer and content validation together.         |
| Another topic or preset                                                     | Add reviewed metadata/content or session config using the existing learning flow.             |
| A different scheduler                                                       | Change the wrapper and explicitly handle existing card serialization/migration.               |
| Large catalog or long history                                               | Measure a real query, then add suitable pagination, indexes or an aggregate.                  |
| Offline use, placement, timed reflex, Listening/Reading or personal content | Take the corresponding future task from the plan; do not generate placeholder subsystems now. |

The detailed contracts will be in [ADAPTERS.md](ADAPTERS.md), behavior sequences in [FLOWS.md](FLOWS.md), and implementation setup in [SETUP.md](SETUP.md). These documents will not introduce a second quality-gate policy or a second status board.
