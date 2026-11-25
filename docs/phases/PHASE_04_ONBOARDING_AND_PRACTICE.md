# P04 — Onboarding and learning entry points

## Purpose

Let people choose a practical starting pace, follow the curriculum and revisit material in several useful ways. All entry points feed the same session engine and persistence flow; they do not create competing learning systems.

Follow [FLOWS.md](../FLOWS.md), [DESIGN.md](../../DESIGN.md) and [REQUIREMENTS.md](../REQUIREMENTS.md). Compose each screen from its actual supplied board; if that reference is absent, record the specific blocker and continue independent behavior work rather than inventing a layout. Track task execution only in [PROGRESS.md](../PROGRESS.md).

<a id="p04-t01"></a>

## P04-T01 — Implement the three-step MVP onboarding

**Outcome / problem:** A new account can start learning quickly without being forced into a placement test or a long preference questionnaire.

**Requirement references:** [R18 — Settings](../REQUIREMENTS.md#r18-settings), [R19 — Placement](../REQUIREMENTS.md#r19-placement), [R22 — Onboarding](../REQUIREMENTS.md#r22-onboarding), [R23 — Design and accessibility](../REQUIREMENTS.md#r23-design-and-accessibility).

**Dependencies:** [P03-T01](PHASE_03_LEARNING_EXPERIENCE.md#p03-t01), [P03-T03](PHASE_03_LEARNING_EXPERIENCE.md#p03-t03), account settings persistence from P01-T03.

**Implementation steps:**

1. Build a focused three-step flow for daily minutes, new words per day and the first-session topic, using the canonical defaults in R18/R22.
2. Provide back and skip actions on each step. Preserve accepted earlier choices when navigating or skipping; fill only skipped fields with the documented defaults.
3. Persist daily minutes, the new-word allowance and the necessary onboarding-completion marker consistently, preserving unrelated voice/timezone settings. Pass the selected topic into the first SessionConfig; do not add a persistent preferred-topic setting. Handle failure before claiming the account is ready.
4. Route completed onboarding to Today and a clear start action. Daily minutes and the new-word allowance remain editable in Settings; learners can choose any topic through the normal learning/practice entry points. The first topic selection does not lock other topics or award mastery.

**Suggested files:** `src/features/onboarding/`, `src/pages/OnboardingPage.tsx`, account settings/profile model, application route guard.

**Acceptance:** The flow has three meaningful steps; skipping all three leads to Today with usable defaults, while partially skipped onboarding retains the accepted choices. Refresh/account changes use the correct completion state. No placement test, fabricated skill score or extra onboarding step is required.

**Risk-targeted verification:** Check complete onboarding, skip/default behavior and persistence after reload. Exercise a failed save only where the new integration changes that risk. Do not add tests for every static option label.

<a id="p04-t02"></a>

## P04-T02 — Build the vocabulary library

**Outcome / problem:** Learners can explore vocabulary, hear it and save it for later without accidentally changing review schedules or mastery.

**Requirement references:** [R08 — Progressive immersion](../REQUIREMENTS.md#r08-progressive-immersion), [R12 — Vocabulary library](../REQUIREMENTS.md#r12-vocabulary-library), [R15 — Audio](../REQUIREMENTS.md#r15-audio), [R21 — Content pipeline](../REQUIREMENTS.md#r21-content-pipeline).

**Dependencies:** [P01-T04](PHASE_01_DATA_AND_PRIVATE_ACCESS.md#p01-t04), [P03-T01](PHASE_03_LEARNING_EXPERIENCE.md#p03-t01), [P03-T04](PHASE_03_LEARNING_EXPERIENCE.md#p03-t04), bookmark persistence from P01-T03.

**Implementation steps:**

1. Add search and topic/level/mastery/bookmark filters over real catalog data, with a useful no-results state.
2. Show definition, examples, collocations and pronunciation controls; reveal Vietnamese support on request.
3. Save bookmark desired state per sense, handling pending/error feedback and parallel toggles without overwriting unrelated bookmarks.
4. Allow explicit sense selection for practice, passing IDs to the shared session entry point. Show actual content levels rather than a hard-coded collection label.

**Suggested files:** `src/pages/LibraryPage.tsx`, reusable vocabulary detail components, repository `setBookmark` integration.

**Acceptance:** Search and filters agree with shown results; bookmarked items survive reload; lookup/listening/bookmarking alone creates no learning evidence. Selected practice does not silently include unselected senses.

**Risk-targeted verification:** Use a representative filtered search and bookmark/reload flow, including parallel toggles if the implementation changes that behavior. Inspect the narrow layout with a long definition and keyboard-accessible controls. Do not snapshot the entire catalog.

<a id="p04-t03"></a>

## P04-T03 — Build the Today start and resume experience

**Outcome / problem:** The learner sees one truthful next action and can start or resume learning without creating competing current sessions.

**Requirement references:** [R03 — Hybrid learning](../REQUIREMENTS.md#r03-hybrid-learning), [R04 — Guided freedom](../REQUIREMENTS.md#r04-guided-freedom), [R06 — Interleaved sessions](../REQUIREMENTS.md#r06-interleaved-sessions), [R14 — Incremental persistence](../REQUIREMENTS.md#r14-incremental-persistence), [R23 — Design and accessibility](../REQUIREMENTS.md#r23-design-and-accessibility).

**Dependencies:** [P03-T03](PHASE_03_LEARNING_EXPERIENCE.md#p03-t03), [P04-T01](#p04-t01). Compose from `Main.dc.html` and `M-Home.dc.html`.

**Implementation steps:**

1. Make Today choose one primary action: resume the saved current session, or start a recommended due/new/weak session through the shared SessionConfig and session-start boundary.
2. Show only persisted due, started, mastered and recent-activity values. Use the supplied no-history/loading/error states instead of fabricated dashboard statistics.
3. If starting would replace an unfinished session, offer an explicit resume-or-replace choice; preserve committed answers and never create two current sessions silently.
4. Keep topic cards and secondary actions subordinate to the primary action. Do not implement the board's proposal-only recommendation explanation unless it is separately promoted into scope.

**Suggested files:** `src/pages/HomePage.tsx`, `src/components/StartPractice.tsx`, shared dashboard state components.

**Acceptance:** Today has one clear start/resume action backed by the existing engine and repository. Dashboard values come from committed data, no-history is useful, and replacing a session is deliberate.

**Risk-targeted verification:** Follow the no-session start and saved-session resume paths through the real session entry point. Check replacement confirmation if that path changed. Inspect the desktop and 390px boards; do not duplicate session-engine tests in the page layer.

<a id="p04-t04"></a>

## P04-T04 — Complete account learning preferences

**Outcome / problem:** Preferences chosen during onboarding remain editable and are applied consistently across interface language, sessions, progress dates and audio.

**Requirement references:** [R15 — Audio](../REQUIREMENTS.md#r15-audio), [R18 — Settings](../REQUIREMENTS.md#r18-settings), [R22 — Onboarding](../REQUIREMENTS.md#r22-onboarding), [R25 — Mandatory internationalization](../REQUIREMENTS.md#r25-mandatory-internationalization).

**Dependencies:** [P04-T01](#p04-t01), [P03-T04](PHASE_03_LEARNING_EXPERIENCE.md#p03-t04), P01-T03 settings persistence.

**Implementation steps:**

1. Reuse onboarding preference controls and defaults for daily time and new-word limits; add interface language (`en`/`vi`), timezone, voice and speech-rate controls where appropriate. The onboarding topic is a first-session choice, not an additional saved setting.
2. Validate only supported values at the boundary, save account settings explicitly and show pending/success/failure truthfully.
3. Apply the saved interface locale without reloading account data, use it for UI number/date formatting, apply timezone independently to daily quotas/activity summaries, and apply voice fallback when a saved device-specific voice is absent.
4. Keep internal scheduler parameters out of Settings unless a separate product decision requires exposing them.

**Suggested files:** `src/pages/SettingsPage.tsx`, shared preference controls, settings normalization boundary.

**Acceptance:** Saved values survive reload and account switching; changing locale updates all implemented UI copy between complete `en` and `vi` catalogs without changing timezone, gloss or voice; new sessions respect the remaining settings. Changing a preference does not rewrite historical attempt timestamps or invent mastery.

**Risk-targeted verification:** Check locale save/reload, account switching and one other downstream effect such as a changed new-word limit or voice fallback. Verify one locale-formatted date across a timezone boundary and confirm unsupported persisted locale fallback. Reuse existing domain cases unless policy changed; no getter/setter test suite is needed.

<a id="p04-t05"></a>

## P04-T05 — Build the learning path and lesson lifecycle

**Outcome / problem:** The learner can understand the curriculum, open any lesson, continue its activity and see lesson completion without confusing it with mastery.

**Requirement references:** [R03 — Hybrid learning](../REQUIREMENTS.md#r03-hybrid-learning), [R04 — Guided freedom](../REQUIREMENTS.md#r04-guided-freedom), [R10 — Mastery evidence](../REQUIREMENTS.md#r10-mastery-evidence), [R16 — Progress metrics](../REQUIREMENTS.md#r16-progress-metrics), [R23 — Design and accessibility](../REQUIREMENTS.md#r23-design-and-accessibility).

**Dependencies:** Reviewed curriculum metadata from [P01-T04](PHASE_01_DATA_AND_PRIVATE_ACCESS.md#p01-t04), the saved session flow from [P03-T03](PHASE_03_LEARNING_EXPERIENCE.md#p03-t03), and the shared entry action from [P04-T03](#p04-t03). Compose from `Learn.dc.html`, `Lesson.dc.html`, `Lesson-Complete.dc.html` and their `M-*` boards.

**Implementation steps:**

1. Render Course → Level → Topic → Lesson from reviewed catalog order, with every available lesson open and a clear recommended/continue position.
2. Build lesson detail from real lesson metadata and sense activity. Start or continue the lesson through the shared SessionConfig rather than a lesson-specific engine.
3. Derive lesson completion from committed coverage of all lesson senses. Keep completion, session completion and sense mastery as separate labels and values.
4. Show the lesson-complete surface only when the coverage condition is met, with the next lesson/review action backed by available content. Skipping or merely opening a lesson changes no progress.

**Suggested files:** `src/pages/LearnPage.tsx`, `src/pages/LessonPage.tsx`, a lesson-complete surface, small curriculum/coverage selectors.

**Acceptance:** A learner can choose any available lesson, resume a partially covered lesson and complete it after encountering all its senses. No lock, score or mastery claim blocks the next lesson; the desktop and mobile layouts preserve this distinction.

**Risk-targeted verification:** Follow untouched → partial → complete lesson coverage using committed attempts and confirm that browsing/skipping does not complete a lesson. Inspect the supplied desktop and 390px lesson boards with long content; reuse session persistence evidence.

<a id="p04-t06"></a>

## P04-T06 — Add practice presets, custom practice and results

**Outcome / problem:** The learner can practice a specific need and understand the result without forking session, recovery, scheduling or persistence behavior.

**Requirement references:** [R06 — Interleaved sessions](../REQUIREMENTS.md#r06-interleaved-sessions), [R11 — Mistake recovery](../REQUIREMENTS.md#r11-mistake-recovery), [R12 — Vocabulary library](../REQUIREMENTS.md#r12-vocabulary-library), [R13 — Practice modes](../REQUIREMENTS.md#r13-practice-modes), [R14 — Incremental persistence](../REQUIREMENTS.md#r14-incremental-persistence).

**Dependencies:** [P03-T03](PHASE_03_LEARNING_EXPERIENCE.md#p03-t03), selected senses from [P04-T02](#p04-t02), and the shared start/replace behavior from [P04-T03](#p04-t03). Compose from `Practice.dc.html`, `Practice-Session.dc.html`, `Practice-Summary.dc.html` and their supplied mobile counterparts.

**Implementation steps:**

1. Add Quick Practice, Due Review, Review Mistakes, Weak Words and Topic Practice as SessionConfig presets; selected library senses constrain the same configuration.
2. Add the limited custom form for topic, exercise kind and a 1–30 question budget. Explain empty or undersized eligible pools without widening filters.
3. Reuse the shared session renderer, bounded contextual recovery, audio and atomic save flow. Show practice-mode/context labels only from the active configuration and authored exercise.
4. Present a practice result from committed attempts, separating first attempts, assistance and retries. Describe next review timing only from qualified scheduling evidence; completion is not mastery.

**Suggested files:** `src/pages/PracticePage.tsx`, `src/pages/PracticeSummaryPage.tsx`, `src/components/StartPractice.tsx`, existing session summary components.

**Acceptance:** Every preset and custom/selected-sense entry uses the existing engine. Due Review stays empty when nothing is due, filters stay strict, unfinished-session replacement is explicit, and the result does not inflate independent recall.

**Risk-targeted verification:** Follow one preset and one constrained custom/selected-sense route through the real session entry point. Check empty Due Review, an undersized filtered pool and a mistake-recovery result. Inspect desktop and 390px result layouts; do not multiply the same engine tests across every preset card.
