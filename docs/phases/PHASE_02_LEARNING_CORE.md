# P02 — Learning core

## Purpose

Implement small pure functions that select learning material, evaluate answers and update evidence. Keep curriculum selection, adaptive exercise choice and review scheduling distinct. The domain must not import React, the Supabase client or browser audio APIs.

Use the behavior in [REQUIREMENTS.md](../REQUIREMENTS.md), the boundaries in [ADAPTERS.md](../ADAPTERS.md), and [PROGRESS.md](../PROGRESS.md) for execution state. The checks below protect learning correctness, not library internals.

<a id="p02-t01"></a>

## P02-T01 — Implement answer evaluation and evidence classification

**Outcome / problem:** An answer is marked correctly without treating a hint, revealed answer or immediate retry as independent recall.

**Requirement references:** [R05 — Exercise types](../REQUIREMENTS.md#r05-exercise-types), [R08 — Progressive immersion](../REQUIREMENTS.md#r08-progressive-immersion), [R10 — Mastery evidence](../REQUIREMENTS.md#r10-mastery-evidence).

**Dependencies:** The model from [P01-T01](PHASE_01_DATA_AND_PRIVATE_ACCESS.md#p01-t01) and reviewed examples from the content-authoring portion of [P01-T04](PHASE_01_DATA_AND_PRIVATE_ACCESS.md#p01-t04). Pure evaluator work may proceed before authentication and the import/runtime catalog path are complete; those remain dependencies for the integrated product flow.

**Implementation steps:**

1. Evaluate choice answers against declared answer IDs, typing against the authored accepted set, and sentence building against valid chunk order.
2. Normalize only the agreed spaces/case rules. Do not silently accept fuzzy spelling or infer undeclared synonyms.
3. Classify independent, hinted, revealed and retry attempts separately from whether the submitted string matches the answer key.
4. Preserve immutable attempt metadata so later history and metrics can explain what happened.

**Suggested files:** `src/domain/answers.ts` or `src/domain/learning.ts`, relevant domain types, a focused domain test file.

**Acceptance:** All five kinds have explicit evaluation behavior. Revealing the answer cannot become independent recall merely because the learner enters the displayed answer. Unsupported answer shapes fail clearly.

**Risk-targeted verification:** Protect meaningful boundaries: an explicitly accepted typing variant, an incorrect near-match, wrong sentence ordering and a correct submission after reveal. Avoid comparing generated UUIDs or asserting trivial getters.

<a id="p02-t02"></a>

## P02-T02 — Integrate scheduling and mastery evidence

**Outcome / problem:** Review dates and mastery reflect qualified learning evidence rather than repeated clicks or response speed.

**Requirement references:** [R09 — Review scheduling](../REQUIREMENTS.md#r09-review-scheduling), [R10 — Mastery evidence](../REQUIREMENTS.md#r10-mastery-evidence), [R20 — Reflex training](../REQUIREMENTS.md#r20-reflex-training).

**Dependencies:** [P02-T01](#p02-t01); serialized card contract from P01-T01.

**Implementation steps:**

1. Integrate a verified, locked FSRS library version behind one wrapper that handles card creation and JSON/date conversion.
2. Apply the requirement-defined eligibility and Again/Hard/Good mapping outside the wrapper. Initial exposure, early practice and recovery retries must retain their distinct meanings.
3. Accumulate mastery evidence across the required days, contexts and recall kinds using the learner's timezone and centrally named product defaults.
4. Reset the current evidence window after a qualified lapse while preserving attempt/mistake history. Allow legitimate scheduled learning/relearning within a day without inventing extra mastery days.

**Suggested files:** `src/domain/fsrs.ts`, `src/domain/learning.ts`, `src/domain/model.ts`, dependency manifest/lockfile.

**Acceptance:** Early repetitions and revealed retries cannot repeatedly advance long-term scheduling or mastery; qualifying reviews can. Date serialization round-trips safely. Speed alone never assigns Easy, and defaults are not described as scientifically validated proficiency thresholds.

**Risk-targeted verification:** Check a lapse followed by retry, independent recall across local calendar days, and a legitimate due learning/relearning step. Verify adapter serialization with an actual scheduler card; do not re-test the FSRS mathematics.

<a id="p02-t03"></a>

## P02-T03 — Compose sessions and bounded recovery

**Outcome / problem:** The learner receives a useful mix of due, new and weak material without duplicates, hidden filter overrides or endless retries.

**Requirement references:** [R03 — Hybrid learning](../REQUIREMENTS.md#r03-hybrid-learning), [R04 — Guided freedom](../REQUIREMENTS.md#r04-guided-freedom), [R06 — Interleaved sessions](../REQUIREMENTS.md#r06-interleaved-sessions), [R07 — Adaptive difficulty](../REQUIREMENTS.md#r07-adaptive-difficulty), [R11 — Mistake recovery](../REQUIREMENTS.md#r11-mistake-recovery), [R13 — Practice modes](../REQUIREMENTS.md#r13-practice-modes).

**Dependencies:** [P02-T02](#p02-t02), reviewed catalog from P01-T04.

**Implementation steps:**

1. Translate a shared session configuration into eligible senses/exercises, preserving topic, kind and explicit selections.
2. Interleave due/new/weak candidates with deduplication and the timezone-aware daily new cap. Reduce new intake when review debt warrants it, using a small documented rule.
3. Choose easier or less-supported exercise types from meaningful evidence; keep introduction material available before a new sense's first question.
4. Insert a bounded recovery attempt after mistakes, preferring another authored context or simpler kind. Return an explicit empty result when no eligible content exists.

**Suggested files:** `src/domain/session.ts` or `src/domain/learning.ts`, `src/domain/model.ts`.

**Acceptance:** A sense that is both due and weak appears once in the initial queue; recovery is finite and tagged as retry. Filters and new quotas hold across sessions, and Due Review never silently becomes new learning.

**Risk-targeted verification:** Check duplicate-category eligibility, an exhausted daily quota at a timezone boundary, an empty filtered pool and repeated mistakes reaching the recovery limit. Avoid a Cartesian product of every preset and every content item.

<a id="p02-t04"></a>

## P02-T04 — Produce one consistent answer transition

**Outcome / problem:** The UI receives one coherent next state for persistence instead of independently incrementing progress, scheduling and session position.

**Requirement references:** [R10 — Mastery evidence](../REQUIREMENTS.md#r10-mastery-evidence), [R11 — Mistake recovery](../REQUIREMENTS.md#r11-mistake-recovery), [R14 — Incremental persistence](../REQUIREMENTS.md#r14-incremental-persistence).

**Dependencies:** [P02-T01](#p02-t01), [P02-T02](#p02-t02), [P02-T03](#p02-t03), repository contract from [P01-T03](PHASE_01_DATA_AND_PRIVATE_ACCESS.md#p01-t03).

**Implementation steps:**

1. Implement one pure transition that validates the active session item and consumes one attempt.
2. Calculate the next sense progress, recovery queue, cursor, completion flag and revision together.
3. Return an immutable commit payload with stable attempt identity and expected revision; keep network writes outside the domain.
4. Define clear rejection behavior for a mismatched exercise/session or an already completed session so the caller can recover instead of corrupting state.

**Suggested files:** `src/domain/learning.ts`, `src/domain/model.ts`, existing domain tests.

**Acceptance:** The same accepted transition supplies both immediate feedback and the persisted next state. Invalid input cannot partially mutate the previous snapshot; the repository can retry the exact payload safely.

**Risk-targeted verification:** Protect one representative normal transition and the material mismatched/stale input case. Reuse existing answer/scheduler tests instead of repeating their assertions through every layer. Persisted idempotency remains a repository responsibility.
