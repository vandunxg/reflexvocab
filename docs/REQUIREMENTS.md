# Product requirements

This specification preserves the product decisions from the brainstorm. The delivery is documentation plus a minimal React/Vite/TypeScript scaffold. It does not include product screens, learning logic, a vocabulary dataset, or a database implementation.

[PLAN.md](PLAN.md) is the roadmap and phase index. [PROGRESS.md](PROGRESS.md) is the only implementation status and handoff tracker. Requirements below describe intended behavior, not completed features.

## Product goal

Help a learner with some English grammar knowledge close vocabulary gaps for TOEIC through contextual learning, active recall, spaced review, and deliberate practice. Foundational TOEIC vocabulary is central; IT contexts may supplement it. Track a specific meaning of a word or phrase, called a **sense**, rather than treating every meaning of a headword as one item.

Use English for documentation, code and comments. The interface must be internationalized, with reviewed English (`en`) and Vietnamese (`vi`) UI locales and English as the default/fallback locale. Learning content and audio remain English; an optional Vietnamese learning gloss is separate from the interface locale and may be revealed on demand. The whole app, including the dashboard, follows the bright, colorful, youthful Brilliant-inspired direction in [DESIGN.md](../DESIGN.md).

## Requirements

### R01. Stack and starter scope

Use React, Vite, TypeScript with strict checking, and Supabase as the planned authentication/persistence platform. Keep one application and one database. The starter is only the minimal project shell; installing a selected dependency does not mean its integration exists.

Do not add mock feature pages, fake statistics, sample learning content, SQL migrations, auth clients, or placeholder implementations to make this delivery appear complete. Implement subsequent work in the phase files linked from the roadmap. System boundaries are specified in [SDD.md](SDD.md) and [ADAPTERS.md](ADAPTERS.md).

### R02. Private access

Use pre-created accounts with email/password sign-in and sign-out. Disable public signup in Supabase; hiding a signup button is insufficient. Each user may access only their own progress, attempts, sessions, bookmarks, and settings. Enforce ownership through server/database policies, not route guards alone.

Missing production configuration must lead to a clear setup state when authentication is implemented, never an automatic guest or demo session. See [SETUP.md](SETUP.md) for preparation boundaries.

### R03. Hybrid learning

Combine curriculum-led introduction of new vocabulary with scheduled review and optional practice. Organize content as Course → Level → Topic/Unit → Lesson → Sense → Exercise. This is a content hierarchy, not a requirement for a separate service or administration table at every level.

Introduce meaning and context before testing an unfamiliar item. A lesson may span several short sessions. Completing a lesson records activity coverage; it does not certify long-term mastery.

### R04. Guided freedom

Recommend a sequence and allow learners to resume, choose another topic, or revisit earlier content. Do not require boss tests, scores, or mastery locks to open the next lesson. Skipping a lesson must not mark its senses as mastered.

### R05. Exercise types

Provide five exercise types through one session flow:

| Type                  | Interaction                              | Grading requirement                           |
| --------------------- | ---------------------------------------- | --------------------------------------------- |
| Definition matching   | Select the English meaning in context    | One reviewed correct choice                   |
| Multiple-choice cloze | Select the missing word or phrase        | Meaning and grammar both fit                  |
| Typing cloze          | Enter a short word or phrase             | Match an explicit set of accepted answers     |
| Collocation matching  | Select or pair a natural combination     | Context resolves competing valid combinations |
| Sentence building     | Select chunks in order; allow undo/reset | Evaluate the declared valid order             |

Grade immediately without a runtime LLM. Normalize irrelevant case and whitespace for typing; declare accepted spelling variants rather than accepting arbitrary near-matches. Preserve stable choice/chunk IDs after shuffling. Support keyboard, pointer, and touch; drag-and-drop is optional. Enter checks an answer or activates the next available action without submitting twice or skipping feedback.

### R06. Interleaved sessions

Mix due reviews, new senses, and weak items. Deduplicate the initial selection by sense and redistribute capacity when a pool is empty. Give new learners a way to start and avoid requiring an entire review backlog in one sitting. Reduce new-item allocation when review load warrants it without removing freedom to select a topic.

Starting defaults are a `due → due → new → weak` selection heuristic, an initial budget of 1–30 questions, and a daily new-sense allowance. These are adjustable implementation defaults, not an exact percentage promise. A 5/10/15/20-minute target guides session size rather than imposing a countdown. Retries do not count as additional new vocabulary. Count daily introductions in the user's configured timezone.

### R07. Adaptive difficulty

Use small rules per sense. Consistent independent success can move from recognition toward recall; repeated difficulty can offer more support or an easier exercise type. Avoid permanent penalties from old mistake totals after recovery. Do not infer a diagnosis, language level, or mastery from one fast answer. No ML model or runtime AI adaptation is required for MVP.

### R08. Progressive immersion

Present English definitions, examples, collocations, and audio first. Make hints and optional Vietnamese glosses available when needed. Hints can provide context, word class, a first letter, or an explanation; do not force a long fixed sequence. Record when a hint or the answer has been shown. Navigation and settings follow the selected `en`/`vi` interface locale; this does not translate or alter learning content.

### R09. Review scheduling

Use FSRS through a small wrapper around a maintained implementation. FSRS decides **when** to review; adaptive rules select **how** to practice; the curriculum selects **what new content** to introduce. Keep these responsibilities separate.

Persist one review card per sense. Serialize dates explicitly and preserve existing card state when changing library versions. Select and verify the library version when implementing the scheduler boundary.

### R10. Mastery evidence

Use understandable stages such as `new`, `learning`, `familiar`, and `mastered`. Mastery needs independent recall over time and across contexts, not a total click count or a synthetic ability score.

**Conservative starting policy — an implementation default, not a previously selected A/B/C option:**

- Record every attempt, including hints, answer reveals, retries, and early practice.
- A first exposure initializes a card but contributes no independent recall day.
- A non-retry review that is due may update the scheduler. Early practice and contextual retries remain practice history without repeatedly pushing the review date forward.
- Grade a due wrong/revealed answer as `Again`, a correct answer with a non-revealing hint as `Hard`, and a correct independent answer as `Good`. Do not automatically assign `Easy` from speed.
- Only correct, unassisted, qualified reviews on later calendar days accumulate mastery evidence. Repeated attempts on the same day do not create additional independent days.
- Proposed initial mastery thresholds: at least three distinct review days after introduction, two distinct contexts, at least one typing-cloze success, and FSRS stability of at least 14 days.
- A qualified failure returns the sense to learning and resets its current mastery-evidence window while retaining attempt and mistake history. Missing a study day is not itself a failed recall.

These thresholds are provisional product heuristics, not a validated TOEIC score or scientific certification. Keep them named and adjustable in the future domain layer. The evidence policy must not rewrite past attempts to improve reported results.

### R11. Mistake recovery

Explain the answer immediately and offer a bounded follow-up, preferably in another reviewed context or exercise type. The starting default is at most two contextual retries per sense, placed after up to three other questions when available. A short remaining queue may not provide that spacing; the retry still remains supported practice.

Showing the solution is unsuccessful independent retrieval even if the learner then enters the correct text. Keep the original mistake visible in history. Do not generate a new sentence at runtime to fill a missing recovery exercise.

### R12. Vocabulary library

Support search, topic/level/mastery filters, bookmarks, and access to definitions, examples, collocations, and audio. Select senses for a practice session. A bookmark or an audio replay is not an attempt and must not increase mastery.

Keep personal vocabulary creation, document import, and separate personal collections for later. Filters should be meaningful for the content actually available.

### R13. Practice modes

Provide Quick Practice, Due Review, Review Mistakes, Weak Words, Topic Practice, and a limited Custom Practice configuration. Custom MVP needs topic, exercise type, and question count; selected library items can also constrain a session.

All modes use the same question renderer, evaluator, recovery, audio, and persistence flow. An empty Due Review explains that nothing is due rather than silently introducing new words. Empty filters must not be bypassed with unrelated content. A new session must handle an existing unfinished session explicitly.

### R14. Incremental persistence

Show answer feedback immediately and save the attempt, card progress, and session position as one atomic change. Each submission has a stable identity so retrying the same request cannot apply progress twice. Reject stale revisions or a replaced current session rather than overwriting another device's work.

The starting MVP default is one current session per account. Keep the answer visible while saving; allow the next question only after a successful save. On failure, show the unsaved state and retry the same request. Resume from acknowledged saves after reload or device changes. Do not promise recovery of an unsaved answer after closing the tab without a durable outbox; offline-first is outside MVP.

### R15. Audio

Browser TTS is the first planned audio implementation. Support available English voices, a saved voice preference, rate adjustment, replay, and stop when leaving a question or screen. Fall back when a selected voice is unavailable, and keep text exercises usable when speech is unsupported or fails.

Place it behind the narrow audio boundary in [ADAPTERS.md](ADAPTERS.md). Consistent, high-quality Listening audio and additional providers come later. Provider credentials belong on the server when that integration exists. Do not scaffold provider registries, unused implementations, or multiple caching layers now.

### R16. Progress metrics

| Metric             | Required meaning                                                                          |
| ------------------ | ----------------------------------------------------------------------------------------- |
| Completion         | Content or session activity completed, separate from mastery                              |
| Mastery            | Senses with sufficient evidence; do not mislabel them as unique headwords                 |
| Due                | Cards due at the relevant time                                                            |
| Accuracy           | Explicit scope and denominator; distinguish first attempts, assisted answers, and retries |
| Observed retention | Independent success on qualified reviews; show insufficient data when appropriate         |
| FSRS estimate      | A model estimate, clearly distinguished from observed results                             |
| Response time      | Compare only valid attempts of comparable type and difficulty                             |

Use actual attempts and declare any date range or history-loading limit. No fabricated percentages, implied score conversion, or all-time claim from a partial history window.

### R17. Lightweight gamification

Use a daily goal, study streak, calendar, and modest mastery milestones. Count meaningful study activity in the selected timezone; signing in, bookmarking, or replaying audio alone must not complete a study day. Encourage returning after a missed day without punishment. Do not add XP, hearts, shops, leaderboard systems, or a reward engine.

### R18. Settings

Allow changes to interface language, target study minutes, new senses per day, voice, speech rate, and timezone. Starting defaults: English (`en`) interface, 10 minutes, 8 new senses per day, automatic English voice, rate `0.9`, and `Asia/Ho_Chi_Minh`. These are editable defaults, not inferred user characteristics. Topic selection belongs to a session rather than a saved account preference.

Keep FSRS tuning out of the initial settings screen. Interface language, learning-gloss visibility and timezone are independent settings: changing one must not silently change another.

### R19. Placement

Adopt optional placement plus continuous adjustment. MVP must let the learner start without a placement test; ordinary practice provides evidence for subsequent recommendations. A short optional placement test belongs to a later phase and must not infer mastery of every word in a topic from a few answers.

### R20. Reflex training

Begin by measuring response time without pressuring new learners. Exclude hidden-tab or interrupted timing from meaningful comparisons. Faster answers alone do not increase mastery or trigger `Easy`. Timed challenges are a later mode for familiar content, not a prerequisite for learning or unlocking lessons.

### R21. Content pipeline

Use a frequency-by-topic strategy with context-based senses and collocations. Prepare and review content offline; runtime selection may choose and shuffle approved material. AI assistance in authoring does not remove editorial review.

The long-term content target is approximately 1,000 reviewed vocabulary items with clear sourcing and redistribution rights. It is not bundled in this starter and is not a quantity gate for an initial private trial. See [CONTENT.md](CONTENT.md).

### R22. Onboarding

After first sign-in, offer three short steps: daily study minutes, new words/senses per day, and the first session's topic. Skip uses the defaults in R18 for the first two steps and the first editorially recommended available foundation topic for the last step. Apply a default only to the skipped field and preserve accepted earlier choices, including when moving back. Do not add a timezone question or require placement.

Persist `dailyMinutes`, `newPerDay`, and a minimal onboarding-completed marker after a successful save. Keep the topic in the onboarding draft and pass it into the first `SessionConfig`; do not create a saved preferred-topic setting. Learners can change their pace later in Settings and choose other topics through Learn or Practice.

Finishing or skipping onboarding leads directly to Today and a clear way to begin learning. Derive topic options from the actual curriculum when available; never invent a topic ID before content exists. Exact screen treatment follows the supplied onboarding and Today boards in `docs/design/`.

### R23. Design and accessibility

Use a bright, colorful, youthful Brilliant-inspired visual direction across the entire app. Clear localized labels, purposeful color, hierarchy, and interaction matter more than decorative effects. Follow the supplied screen inventory in `docs/design/` for composition and states. The export's Vietnamese UI copy, legacy task/status labels and sample metrics are illustrative; implementation uses reviewed `en`/`vi` product vocabulary, current phase tasks and persisted data.

Provide responsive layouts, semantic controls, visible focus, labels, usable touch targets, reduced motion, and feedback expressed in text as well as color. Product-specific UX requirements are in [UI_UX_REQUIREMENTS.md](UI_UX_REQUIREMENTS.md); navigation and error paths are in [FLOWS.md](FLOWS.md).

### R24. Agent workflow and quality

Reuse existing components and behavior before creating new abstractions. Before a code commit, review the diff, refactor only where useful, and run type checking and the configured lint check on the final code state. Use the smallest verification that addresses the change's real risk.

Do not impose coverage quotas, mandatory TDD, five-viewport pipelines, or tests for trivial getters, generated UUIDs, and library internals. Documentation-only changes need a claim/link review, not an application test run. Choose project skills by task; Evondev UIUX is a read-only research source, not a bundled or installed skill.

### R25. Mandatory internationalization

Internationalization is mandatory for every implemented feature. All user-facing interface copy—including navigation, headings, controls, form validation, empty/loading/error/conflict states, feedback, accessibility labels and announcements—must use the shared i18n layer rather than hard-coded component strings. A feature is incomplete if its new or changed UI copy is missing from either the English or Vietnamese locale.

Use English (`en`) as the default and fallback locale and support Vietnamese (`vi`) from the first implemented screen. Persist the authenticated learner's locale preference and apply it after account loading; signed-out or missing-preference flows use English. Unsupported or malformed locale values fall back to English without breaking access. Do not infer timezone, speech voice, content language or gloss visibility from interface locale.

Keep translation keys stable and semantic. Use interpolation and plural rules rather than concatenating translated fragments. Format user-visible numbers, dates and relative times with locale-aware platform APIs while retaining the saved IANA timezone for calendar boundaries. Domain, repository and server boundaries return stable data/error codes; UI code translates them. Learning prompts, accepted answers, vocabulary definitions and audio remain reviewed learning content, not UI translation resources.

## Later scope

Optional placement, timed reflex, listening/dictation, reading and word-form exercises, connectors, mini TOEIC tasks, higher-quality audio, shadowing, speech assessment, personal imports, other courses, additional UI locales beyond `en`/`vi`, offline support, reminders, advanced analytics, and theme switching remain candidates for later work. They do not justify dormant code or infrastructure in the starter.

The MVP outcome is a private learner completing a reviewed lesson/review session, understanding feedback, resuming acknowledged progress, and seeing meaningful metrics without duplicate learning evidence. Phase task definitions and progress live only in the documents linked at the top.
