# P05 — MVP completion

## Purpose

Complete the usable MVP with truthful progress, modest motivation and reviewed content. Resolve concrete gaps in the end-to-end experience rather than adding speculative analytics, infrastructure or decorative features.

Consult [REQUIREMENTS.md](../REQUIREMENTS.md), [DESIGN.md](../../DESIGN.md) and the repository quality rules. Use [PROGRESS.md](../PROGRESS.md) for status and evidence; this phase is not an additional always-run quality gate.

<a id="p05-t01"></a>

## P05-T01 — Present progress with explicit meanings

**Outcome / problem:** Learners can distinguish activity, lesson completion and durable recall instead of reading an attractive but misleading score.

**Requirement references:** [R09 — Review scheduling](../REQUIREMENTS.md#r09-review-scheduling), [R10 — Mastery evidence](../REQUIREMENTS.md#r10-mastery-evidence), [R16 — Progress metrics](../REQUIREMENTS.md#r16-progress-metrics), [R20 — Reflex training](../REQUIREMENTS.md#r20-reflex-training).

**Dependencies:** [P03-T03](PHASE_03_LEARNING_EXPERIENCE.md#p03-t03), settings from [P04-T04](PHASE_04_ONBOARDING_AND_PRACTICE.md#p04-t04).

**Implementation steps:**

1. Derive completion, started/mastered senses and due counts from persisted records, using the requirement-defined units and meanings.
2. Present recent attempts and first-attempt accuracy separately from retries and revealed answers. Keep the denominator and time/data scope explicit.
3. Implement observed qualified-review retention only when its data supports it; distinguish that observation from FSRS estimates and show an honest insufficient-data state.
4. If response-time trends are shown, compare valid observations of comparable kind/difficulty. Do not convert these metrics into a TOEIC score or an invented proficiency percentage.

**Suggested files:** `src/pages/ProgressPage.tsx`, small domain/app metric helpers, scoped history queries if necessary.

**Acceptance:** Counts reconcile with their underlying attempts; revealed/retry practice is not mislabeled independent recall. Bounded history is not labeled all-time, and the empty state does not contain fabricated results.

**Risk-targeted verification:** Use a small meaningful history containing an initial attempt, assisted/retry evidence and a later qualified review to check the displayed definitions. Verify period/query completeness if aggregation changes. Avoid tests of trivial arithmetic detached from product semantics.

<a id="p05-t02"></a>

## P05-T02 — Add lightweight motivation from real activity

**Outcome / problem:** Daily goals and small milestones encourage returning without creating a game economy or punishing missed days.

**Requirement references:** [R16 — Progress metrics](../REQUIREMENTS.md#r16-progress-metrics), [R17 — Lightweight gamification](../REQUIREMENTS.md#r17-lightweight-gamification), [R18 — Settings](../REQUIREMENTS.md#r18-settings).

**Dependencies:** [P05-T01](#p05-t01), [P04-T04](PHASE_04_ONBOARDING_AND_PRACTICE.md#p04-t04).

**Implementation steps:**

1. Show session progress, the agreed daily goal and a recent-activity calendar using actual saved learning activity.
2. Calculate streak days using the user's timezone. Login, lookup, audio playback or bookmarking must not create a learning day by themselves.
3. Add a restrained completion or mastery milestone where it helps the learner understand progress; respect reduced motion and allow continuation without interruption.
4. Keep missed-day copy neutral and avoid points, leaderboards, lives, shops or a general reward engine.

**Suggested files:** reusable activity/goal components, `src/pages/HomePage.tsx`, `src/pages/ProgressPage.tsx`, shared activity derivation.

**Acceptance:** Goal/streak/calendar agree on the same activity and timezone rules. Celebrations reflect a real event and do not claim mastery from lesson completion alone.

**Risk-targeted verification:** Check the relevant timezone/day-boundary behavior and verify that non-learning actions do not increment activity. Inspect celebration/focus behavior with reduced motion where changed. Do not add tests for every icon or day label.

<a id="p05-t03"></a>

## P05-T03 — Expand and review the usable content set

**Outcome / problem:** The MVP offers enough coherent, correct material for a real learning routine while keeping content quality ahead of item-count targets.

**Requirement references:** [R03 — Hybrid learning](../REQUIREMENTS.md#r03-hybrid-learning), [R05 — Exercise types](../REQUIREMENTS.md#r05-exercise-types), [R11 — Mistake recovery](../REQUIREMENTS.md#r11-mistake-recovery), [R21 — Content pipeline](../REQUIREMENTS.md#r21-content-pipeline).

**Dependencies:** [P01-T04](PHASE_01_DATA_AND_PRIVATE_ACCESS.md#p01-t04), functional exercise feedback from [P03-T02](PHASE_03_LEARNING_EXPERIENCE.md#p03-t02), lesson flow from [P04-T05](PHASE_04_ONBOARDING_AND_PRACTICE.md#p04-t05), and practice entry points from [P04-T06](PHASE_04_ONBOARDING_AND_PRACTICE.md#p04-t06).

**Implementation steps:**

1. Organize reviewed senses into the agreed course/level/topic/lesson metadata, keeping TOEIC use central and optional IT contexts supportive.
2. Add batches with useful examples, explicit accepted variants, plausible distractors and enough authored context variation for learning/recovery.
3. Review language, answer uniqueness, licensing/provenance and level labels; correct the content rather than adding fuzzy grading to conceal ambiguity.
4. Import changes through the existing versioned path and retain stable IDs. Document the actual available content and any limitations in context coverage.

**Suggested files:** existing catalog/data files, content provenance notes, import/validation scripts, generated content seed.

**Acceptance:** The released batch is coherent and reviewed; lesson size and content availability are represented honestly. The larger vocabulary target remains an expansion direction, not a reason to publish unreviewed items or claim a frequency ranking without evidence.

**Risk-targeted verification:** Run validation on changed content, read representative questions across the changed kinds and confirm a content correction preserves existing progress. Do not turn every vocabulary row into an individual unit test or introduce a CMS before scripts become insufficient.

<a id="p05-t04"></a>

## P05-T04 — Resolve end-to-end usability and state gaps

**Outcome / problem:** The implemented MVP behaves coherently across onboarding, learning, library and progress, including the states a learner is likely to encounter.

**Requirement references:** [R14 — Incremental persistence](../REQUIREMENTS.md#r14-incremental-persistence), [R22 — Onboarding](../REQUIREMENTS.md#r22-onboarding), [R23 — Design and accessibility](../REQUIREMENTS.md#r23-design-and-accessibility), [R24 — Agent workflow and quality](../REQUIREMENTS.md#r24-agent-workflow-and-quality), [R25 — Mandatory internationalization](../REQUIREMENTS.md#r25-mandatory-internationalization).

**Dependencies:** P03 and P04 outcomes; [P05-T01](#p05-t01), [P05-T02](#p05-t02), [P05-T03](#p05-t03).

**Implementation steps:**

1. Review the actual first-use → session → save/resume → progress flow against the requirements and available design references.
2. Resolve observed gaps in mobile layout, keyboard/touch operation, focus, localized labels, loading, empty and failure states; run locale-key parity and reuse shared controls before adding another variant.
3. Refactor local duplication or unclear responsibility revealed by the review. Keep unrelated architectural rewrites out of this task.
4. Record unresolved limitations and map any material missing behavior to a concrete task; do not hide it behind a generic 'polish complete' claim.

**Suggested files:** only the screens/components/flows affected by the observed gaps; `docs/PROGRESS.md` for verification evidence and handoff.

**Acceptance:** Core journeys are understandable and operable in both `en` and `vi`; primary actions remain reachable at relevant viewport sizes; unsaved/error states and accessibility text are translated and truthful. Locale catalogs have matching keys, and no required MVP behavior is silently deferred to an unspecified later pass.

**Risk-targeted verification:** Reuse existing passing evidence, run locale-key parity and inspect the actual changed screens in both supported locales. Add or rerun a small regression only for an identified failure worth protecting. No coverage percentage, exhaustive browser matrix or universal performance budget is introduced here.
