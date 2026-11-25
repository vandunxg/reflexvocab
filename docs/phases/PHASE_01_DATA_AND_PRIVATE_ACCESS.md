# P01 — Data and private access

## Purpose

Give the future learning flow a small, trustworthy data foundation: stable content identifiers, private accounts and an atomic persistence boundary. Follow [SDD.md](../SDD.md), [ADAPTERS.md](../ADAPTERS.md) and [SETUP.md](../SETUP.md). Do not create a separate backend or generic CRUD framework.

Task states and evidence belong in [PROGRESS.md](../PROGRESS.md). These specifications describe future implementation.

<a id="p01-t01"></a>

## P01-T01 — Define the content and learning data contracts

**Outcome / problem:** UI, learning rules and persistence share one explicit model instead of each inventing its own meaning of a word, answer or session.

**Requirement references:** [R05 — Exercise types](../REQUIREMENTS.md#r05-exercise-types), [R10 — Mastery evidence](../REQUIREMENTS.md#r10-mastery-evidence), [R14 — Incremental persistence](../REQUIREMENTS.md#r14-incremental-persistence), [R21 — Content pipeline](../REQUIREMENTS.md#r21-content-pipeline), [R25 — Mandatory internationalization](../REQUIREMENTS.md#r25-mandatory-internationalization).

**Dependencies:** [P00-T03](PHASE_00_FOUNDATION.md#p00-t03).

**Implementation steps:**

1. Define a vocabulary sense as the progress unit, with stable sense, exercise and context IDs. Represent the five exercise types as a discriminated union with explicit accepted answers.
2. Define attempts, serializable scheduler cards, mastery evidence, session configuration/state, settings and bookmarks. Include the `en | vi` interface locale plus the timestamps, hint/reveal/retry flags and revision fields required by the agreed behavior.
3. Map the contracts to the minimum Supabase tables and constraints in SDD. Add versioned migrations; avoid creating a management table for every curriculum label.
4. Specify how content edits preserve progress IDs and how one current session is identified per account.

**Suggested files:** `src/domain/model.ts`, `src/lib/database.types.ts`, `supabase/migrations/`.

**Acceptance:** Each exercise can be evaluated without guessing; attempts can retain their original evidence; session revisions, ownership and the supported interface locale are representable. TypeScript and database constraints agree on required fields and identifiers.

**Risk-targeted verification:** Type-check representative objects for all five exercise shapes. Apply the migration to a disposable database and check constraints that prevent orphaned content or invalid ownership. Do not test each field merely because it exists.

<a id="p01-t02"></a>

## P01-T02 — Implement private authentication and ownership

**Outcome / problem:** The authentication boundary supports pre-provisioned accounts while other users cannot read or modify a learner's data. The reviewed sign-in screen is composed later in P03-T01.

**Requirement references:** [R02 — Private access](../REQUIREMENTS.md#r02-private-access), [R14 — Incremental persistence](../REQUIREMENTS.md#r14-incremental-persistence).

**Dependencies:** [P01-T01](#p01-t01).

**Implementation steps:**

1. Configure the Supabase client using public environment values and implement SDK operations for sign-in, session loading and sign-out. This mechanism can be built and verified without a sign-in board or placeholder login UI.
2. Disable public signup in the service configuration; protect private tables with ownership rules based on authenticated server identity.
3. Clear/remount account-bound application state when identity changes. Handle missing configuration and authentication/network errors explicitly.

**Suggested files:** `src/lib/supabase.ts`, `src/lib/auth.ts` or equivalent auth operations, `supabase/migrations/`, `docs/SETUP.md`.

**Acceptance:** Intended accounts can authenticate and sign out through the implemented boundary; signup is not publicly available; unauthenticated and cross-account access is rejected at the data boundary. No secret/service-role key reaches the browser or repository. This task does not claim a completed sign-in surface.

**Risk-targeted verification:** Exercise one intended allow path and the relevant unauthenticated/cross-user deny paths against Supabase/Postgres. Check account switching and missing-config behavior. Mocking the UI is not evidence that RLS works.

<a id="p01-t03"></a>

## P01-T03 — Implement the learning repository and atomic writes

**Outcome / problem:** Saving one answer cannot leave the attempt, progress and session cursor inconsistent or apply the same answer twice.

**Requirement references:** [R14 — Incremental persistence](../REQUIREMENTS.md#r14-incremental-persistence), [R18 — Settings](../REQUIREMENTS.md#r18-settings), [R25 — Mandatory internationalization](../REQUIREMENTS.md#r25-mandatory-internationalization).

**Dependencies:** [P01-T01](#p01-t01), [P01-T02](#p01-t02).

**Implementation steps:**

1. Implement the small LearningRepository boundary described in ADAPTERS: load account state, start a session, commit an attempt, merge a settings patch and set one bookmark's desired state. Preserve omitted settings fields.
2. Give session creation a stable ID and idempotent retry semantics. An uncertain-response retry must not rewind an advanced cursor or reactivate a replaced session.
3. Within an authenticated account-scoped, serialized transaction boundary, look up an already committed attempt and compare its payload before checking current-session/revision freshness. An identical replay is acknowledged without rewriting data; a changed payload under the same ID is rejected. Ensure concurrent retries recheck after acquiring the relevant lock.
4. For a new attempt, validate ownership, content compatibility, current session/cursor and expected revision, then write the attempt, next progress and next session state together. Reject conflicts without partial writes.
5. Return success only after persistence succeeds. Expose actionable failure/conflict results; do not introduce a durable offline queue for this MVP.

**Suggested files:** `src/lib/repositories/supabase-repository.ts`, `src/domain/model.ts`, `supabase/migrations/`.

**Acceptance:** A successful commit is durable and atomic; retry does not advance scheduling or cursor twice. A committed replay remains idempotent after the session advances or is replaced. Retrying session creation cannot reset progress or restore an obsolete session. Stale new writes cannot overwrite newer state, and locale/settings/bookmarks stay account-scoped.

**Risk-targeted verification:** Verify committed-request replay, stale new writes and rollback behavior using the real transaction boundary; include an uncertain-response session-start retry when implementing that operation. Reuse the ownership cases from P01-T02 when unchanged. Avoid tests that only assert that a mocked SDK function was called.

<a id="p01-t04"></a>

## P01-T04 — Add a reviewed starter content batch and import path

**Outcome / problem:** Development and the first vertical slice use valid, traceable learning material instead of fabricated answers or placeholder statistics.

**Requirement references:** [R05 — Exercise types](../REQUIREMENTS.md#r05-exercise-types), [R08 — Progressive immersion](../REQUIREMENTS.md#r08-progressive-immersion), [R21 — Content pipeline](../REQUIREMENTS.md#r21-content-pipeline).

**Dependencies:** [P01-T01](#p01-t01), authenticated catalog access from [P01-T02](#p01-t02).

**Implementation steps:**

1. Author or properly source a small TOEIC-focused batch with sense definitions, examples, collocations, level/topic metadata and optional Vietnamese support. Keep authoring data outside the Vite source bundle.
2. Provide reviewed templates for the five exercise types and multiple useful contexts; explicitly declare accepted typing forms and valid chunk order.
3. Add a lightweight content checker for broken references, missing answers, duplicate IDs and structurally invalid exercises.
4. Add an idempotent administrative import/seed path with content versions. Keep personal progress out of content seed files and record provenance or attribution where needed. Runtime catalog reads use authenticated Supabase access; do not import the authoring batch into browser source as a fallback.

**Suggested files:** `content/` or `supabase/content/`, `scripts/validate-content.ts`, `scripts/generate-seed.ts`, `supabase/seed.sql`, a plain authenticated catalog read function.

**Acceptance:** The catalog is available through authenticated reads and sufficient to exercise all five interactions; it is not embedded in the public browser bundle. Answer keys and distractors have been read by a reviewer; importing a content correction does not reset unrelated learner progress.

**Risk-targeted verification:** Run the content checker on the changed batch and review representative prompts/answers for actual language quality. Test repeat import only if import logic changes. A sample pack is not a validated frequency list or a completed 1,000-item collection.
