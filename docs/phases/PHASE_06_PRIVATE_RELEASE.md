# P06 — Private release

## Purpose

Release the implemented MVP to its intended private environment with truthful operational evidence. This is a future product release, distinct from the scaffold/documentation handoff in P00.

Use [SETUP.md](../SETUP.md) for environment procedures, [SDD.md](../SDD.md) for trust boundaries and [PROGRESS.md](../PROGRESS.md) as the sole execution tracker. Reuse earlier results when their code and environment assumptions still apply.

<a id="p06-t01"></a>

## P06-T01 — Configure the private deployment

**Outcome / problem:** The real environment serves the built application, private accounts and reviewed content with the intended access boundaries.

**Requirement references:** [R01 — Stack and starter scope](../REQUIREMENTS.md#r01-stack-and-starter-scope), [R02 — Private access](../REQUIREMENTS.md#r02-private-access), [R14 — Incremental persistence](../REQUIREMENTS.md#r14-incremental-persistence), [R21 — Content pipeline](../REQUIREMENTS.md#r21-content-pipeline).

**Dependencies:** Required P01–P05 implementation outcomes and an identified, authorized target environment.

**Implementation steps:**

1. Set the production public configuration and server-side secrets in their appropriate environment stores; keep service-role credentials outside browser builds.
2. Apply reviewed migrations/content batches, configure private account provisioning and disable public signup at the service level.
3. Configure SPA routing and authentication redirect settings for the actual origin. Deploy the final production build through the chosen host's normal workflow.
4. Confirm the documented missing-configuration/error behavior and record environment-specific limits without inventing a fallback production demo.

**Suggested files:** deployment configuration only where the host needs it, existing `supabase/` migrations/content, `docs/SETUP.md`.

**Acceptance:** Direct routes load, intended accounts can authenticate and required content is available. Production contains no development demo bypass or client-side secret.

**Risk-targeted verification:** Build the final release candidate and check the actual deployed startup/auth path. Confirm the affected access policies in the target environment; a local UI mock is not deployment evidence. Do not repeat unrelated unit tests merely because deployment configuration changed.

<a id="p06-t02"></a>

## P06-T02 — Confirm the private learning and recovery journey

**Outcome / problem:** The intended learner can rely on a saved session in the actual environment, and the important failure paths have an actionable outcome.

**Requirement references:** [R02 — Private access](../REQUIREMENTS.md#r02-private-access), [R14 — Incremental persistence](../REQUIREMENTS.md#r14-incremental-persistence), [R15 — Audio](../REQUIREMENTS.md#r15-audio), [R23 — Design and accessibility](../REQUIREMENTS.md#r23-design-and-accessibility), [R25 — Mandatory internationalization](../REQUIREMENTS.md#r25-mandatory-internationalization).

**Dependencies:** [P06-T01](#p06-t01).

**Implementation steps:**

1. Use a provisioned account to complete or skip onboarding, start a session, answer, save, leave and resume from persisted state.
2. Validate the release-sensitive persistence boundary: retry or conflict recovery must behave as documented on the real service, and another account must remain isolated.
3. Switch between `en` and `vi`, reload and sign in again to confirm the saved locale, complete catalogs, English fallback and independence from timezone/gloss/voice.
4. Try Browser TTS on the device/browser intended for use, including a missing-voice or unavailable-audio fallback when relevant.
5. Confirm a practical backup/recovery approach supported by the selected Supabase environment and document its actual limits; do not build custom backup infrastructure for this MVP.

**Suggested files:** only fixes justified by observed failures; `docs/SETUP.md` for operating instructions; `docs/PROGRESS.md` for dated evidence.

**Acceptance:** Saved learning can be resumed, ownership is enforced and failures are not falsely reported as success. The full private journey is usable in `en` and `vi`, the account locale persists, and Browser-dependent audio limitations and recovery constraints are explicit.

**Risk-targeted verification:** Use a short end-to-end smoke and the critical environment-specific allow/deny or persistence checks not already evidenced there. If a check cannot run, record the missing access/capability and affected claim; do not mark that outcome verified.

<a id="p06-t03"></a>

## P06-T03 — Publish the MVP handoff and next scope

**Outcome / problem:** The owner receives a reproducible product release with clear evidence, known limitations and a sensible next task.

**Requirement references:** [R01 — Stack and starter scope](../REQUIREMENTS.md#r01-stack-and-starter-scope), [R24 — Agent workflow and quality](../REQUIREMENTS.md#r24-agent-workflow-and-quality).

**Dependencies:** [P06-T02](#p06-t02) and resolution or explicit agreement on material release blockers.

**Implementation steps:**

1. Review/refactor the final code diff where needed and run the required code check once on the final changed code. Reuse valid build/flow evidence from this release candidate.
2. Reconcile setup instructions, content inventory, requirements and actual implementation; state limits without calling the private MVP a complete exam platform.
3. Update PROGRESS with the final completed task, evidence, blockers if any and the next agreed action. Keep task specifications and PLAN free of duplicated status reports.
4. Prepare the source/documentation archive or repository handoff with the lockfile and migrations, excluding credentials, account data, dependencies and temporary screenshots/logs.

**Suggested files:** `README.md`, `docs/SETUP.md`, `docs/PROGRESS.md`, release archive or repository metadata.

**Acceptance:** Another developer can reproduce the release from documented inputs; checks and limitations are reported accurately. Deferred features remain a backlog until a concrete need justifies implementing them.

**Risk-targeted verification:** Inspect the final source/archive inventory and links, and ensure evidence applies to the released revision. Documentation-only corrections after passing code checks do not trigger the entire suite again. No new gate or coverage quota is created at handoff.
