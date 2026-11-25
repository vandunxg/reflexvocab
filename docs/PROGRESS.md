# Execution progress

This is the **only execution/status tracker** for this starter. Requirements, PLAN and phase files describe intended behavior and tasks; they do not record completion. Update this file at a meaningful task handoff, not after every keystroke.

## Current handoff

| Field                  | Value                                                                                                                                                                                                       |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Last updated           | 25 November 2026                                                                                                                                                                                            |
| Current phase          | [P03 — Learning experience](phases/PHASE_03_LEARNING_EXPERIENCE.md); [P01-T02](phases/PHASE_01_DATA_AND_PRIVATE_ACCESS.md#p01-t02) remains blocked on hosted signup configuration |
| Current task           | [P03-T02 — Five exercise interactions](phases/PHASE_03_LEARNING_EXPERIENCE.md#p03-t02) |
| Last completed task    | [P03-T01 — Visual, i18n and application shell](phases/PHASE_03_LEARNING_EXPERIENCE.md#p03-t01) |
| Work stopped after     | Tokens, fonts, i18next with typed `en`/`vi` catalogs, sign-in (Login/M-Login boards), account-keyed loading of catalog and learning state, saved-locale application, top/bottom navigation, Settings account section with sign-out, and a not-found route. |
| Next task              | [P03-T02 — Five exercise interactions](phases/PHASE_03_LEARNING_EXPERIENCE.md#p03-t02) |
| Next action            | Compose the session question renderer for all five kinds from the Session-* boards, with introduction, hints/reveal metadata and double-submit protection. |
| Product implementation | 8 of 25 product tasks complete |

## Status meanings

| Status        | Meaning                                                                                                          |
| ------------- | ---------------------------------------------------------------------------------------------------------------- |
| `NOT_STARTED` | No implementation work for this task has begun. A detailed specification does not count as implementation.       |
| `IN_PROGRESS` | Work has begun; acceptance and required verification are not yet confirmed.                                      |
| `BLOCKED`     | A concrete missing input, access or prerequisite prevents useful progress on this task. Record what resolves it. |
| `DONE`        | The stated outcome is implemented and supported by the relevant verification evidence.                           |

## Task status

Task details, dependencies and acceptance criteria are intentionally kept in the linked phase files.

| Task                                                                                                  | Status        |
| ----------------------------------------------------------------------------------------------------- | ------------- |
| [P00-T01 — Runnable scaffold](phases/PHASE_00_FOUNDATION.md#p00-t01)                                  | `DONE`        |
| [P00-T02 — Specification and agent workflow](phases/PHASE_00_FOUNDATION.md#p00-t02)                   | `DONE`        |
| [P00-T03 — Starter verification and handoff](phases/PHASE_00_FOUNDATION.md#p00-t03)                   | `DONE`        |
| [P01-T01 — Content and learning data contracts](phases/PHASE_01_DATA_AND_PRIVATE_ACCESS.md#p01-t01)   | `DONE`        |
| [P01-T02 — Private authentication and ownership](phases/PHASE_01_DATA_AND_PRIVATE_ACCESS.md#p01-t02)  | `BLOCKED`     |
| [P01-T03 — Learning repository and atomic writes](phases/PHASE_01_DATA_AND_PRIVATE_ACCESS.md#p01-t03) | `DONE`        |
| [P01-T04 — Starter content and import path](phases/PHASE_01_DATA_AND_PRIVATE_ACCESS.md#p01-t04)       | `DONE`        |
| [P02-T01 — Answer evaluation and evidence](phases/PHASE_02_LEARNING_CORE.md#p02-t01)                  | `DONE`        |
| [P02-T02 — Scheduling and mastery](phases/PHASE_02_LEARNING_CORE.md#p02-t02)                          | `DONE`        |
| [P02-T03 — Sessions and recovery](phases/PHASE_02_LEARNING_CORE.md#p02-t03)                           | `DONE`        |
| [P02-T04 — Consistent answer transition](phases/PHASE_02_LEARNING_CORE.md#p02-t04)                    | `DONE`        |
| [P03-T01 — Visual, i18n and application shell](phases/PHASE_03_LEARNING_EXPERIENCE.md#p03-t01)       | `DONE`        |
| [P03-T02 — Five exercise interactions](phases/PHASE_03_LEARNING_EXPERIENCE.md#p03-t02)                | `NOT_STARTED` |
| [P03-T03 — Saving and resume](phases/PHASE_03_LEARNING_EXPERIENCE.md#p03-t03)                         | `NOT_STARTED` |
| [P03-T04 — Browser TTS](phases/PHASE_03_LEARNING_EXPERIENCE.md#p03-t04)                               | `NOT_STARTED` |
| [P04-T01 — Three-step onboarding](phases/PHASE_04_ONBOARDING_AND_PRACTICE.md#p04-t01)                 | `NOT_STARTED` |
| [P04-T02 — Vocabulary library](phases/PHASE_04_ONBOARDING_AND_PRACTICE.md#p04-t02)                    | `NOT_STARTED` |
| [P04-T03 — Today start and resume](phases/PHASE_04_ONBOARDING_AND_PRACTICE.md#p04-t03)                | `NOT_STARTED` |
| [P04-T04 — Account learning preferences](phases/PHASE_04_ONBOARDING_AND_PRACTICE.md#p04-t04)          | `NOT_STARTED` |
| [P04-T05 — Learning path and lesson lifecycle](phases/PHASE_04_ONBOARDING_AND_PRACTICE.md#p04-t05)    | `NOT_STARTED` |
| [P04-T06 — Practice modes and results](phases/PHASE_04_ONBOARDING_AND_PRACTICE.md#p04-t06)            | `NOT_STARTED` |
| [P05-T01 — Progress metrics](phases/PHASE_05_MVP_COMPLETION.md#p05-t01)                               | `NOT_STARTED` |
| [P05-T02 — Lightweight motivation](phases/PHASE_05_MVP_COMPLETION.md#p05-t02)                         | `NOT_STARTED` |
| [P05-T03 — Reviewed content expansion](phases/PHASE_05_MVP_COMPLETION.md#p05-t03)                     | `NOT_STARTED` |
| [P05-T04 — End-to-end usability gaps](phases/PHASE_05_MVP_COMPLETION.md#p05-t04)                      | `NOT_STARTED` |
| [P06-T01 — Private deployment](phases/PHASE_06_PRIVATE_RELEASE.md#p06-t01)                            | `NOT_STARTED` |
| [P06-T02 — Private learning and recovery](phases/PHASE_06_PRIVATE_RELEASE.md#p06-t02)                 | `NOT_STARTED` |
| [P06-T03 — MVP handoff](phases/PHASE_06_PRIVATE_RELEASE.md#p06-t03)                                   | `NOT_STARTED` |

## Verification evidence

| Task    | Evidence recorded on 25 November 2026                                                                 | Result                                                                                                                                                                             |
| ------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P00-T01 | `npm ci --no-audit --no-fund` using Node 24.22.3 and npm 11.19.1                                      | Passed; lockfile installation completed                                                                                                                                            |
| P00-T01 | `npm run check`                                                                                       | Passed; TypeScript and ESLint completed                                                                                                                                            |
| P00-T01 | `npm run build`                                                                                       | Passed; production bundle created from the blank React application                                                                                                                 |
| P00-T02 | Reviewed scope, English wording, requirements/design/contracts, local document links and task anchors | Passed; seven separate phase files, 28 unique tasks, 28 linked tracker rows after reconciling the supplied boards                                                                  |
| P00-T02 | Reviewed six repository-local skill guides and their metadata                                         | Passed; no global installation, Evondev copy, compulsory TDD, or universal check pipeline                                                                                          |
| P00-T03 | Reviewed and packaged the starter inventory                                                           | Passed; 46 files, including 30 Markdown files and four files under `src/`; no product screens, mock dataset, SQL, secrets, dependencies, build output, or Git internals in the ZIP |
| P01-T01 | Ran `npm run check`, including type checks for five exercise shapes and a rejected typing exercise with no answer key. | Passed. ESLint excludes `.agents/`; project source remains in scope. |
| P01-T01 | Applied the migration and ran `supabase/tests/learning_contracts.sql` on disposable PostgreSQL 18.6 with minimal Supabase prerequisite roles and `auth.users`. | Passed: five exercise shapes; rejected invalid payloads, queue entries, evidence, locales, revisions, orphaned contexts and cross-owner references; enforced current-session uniqueness and default-deny API grants. Content edits and standalone session deletion preserve attempts; account deletion removes them. |
| P01-T02 | `npm run check`, `npm run build`, `node --test tests/auth.test.ts`, and `supabase/tests/private_access.sql` on disposable PostgreSQL 18.6. | Passed: client configuration, owner-only select for two simulated JWT subjects, authenticated catalog access, and denial for missing identity/direct writes. |
| P01-T02 | Hosted development Auth and Data API using the two owner-provided test accounts. | Both accounts signed in and out, each read six exercises across five kinds, and direct settings updates were denied (`42501`). Neither account had a settings row, so this does not prove cross-account isolation. Hosted signup configuration and account-state switching remain unverified. |
| P01-T02 | Hosted Data API after the owner inserted test settings for both accounts. | Both accounts read their own settings row and received zero rows when querying the other account's row. Hosted signup configuration and application account-state switching remain unverified. |
| P01-T04 | `supabase/tests/starter_content.sql` on the same disposable database. | Passed: authenticated SQL role sees all five exercise kinds, the batch has distinct contexts, and repeated import preserves existing bookmarks and newer exercise revisions. Independent editorial review and live Data API verification remain open. |
| Local PostgreSQL | `docker compose up -d --wait`, schema/seed counts, `learning_contracts.sql`, and `private_access.sql` in PostgreSQL 17. | Passed: 3 senses, 6 exercises and 5 kinds; SQL contract fixtures rolled back. The local Auth shim is not a real authentication service or end-to-end application. |
| P02-T01 | `node --test tests/*.test.ts` and `npm run check`. | Passed: five exercise kinds, accepted spelling/whitespace, wrong chunk order, assistance/retry classification and invalid answer shapes. |
| P01-T03 | Applied `20261125000200_settings_patch.sql` and ran `settings_patch.sql` against Docker PostgreSQL 17. | Passed: partial updates preserve unrelated fields, owner override/null locale/invalid timezone and rate are rejected, the other account is unchanged, and missing identity is rejected. |
| P01-T03 | Applied the settings migration to the authorized Supabase development database; exercised a rolled-back SQL transaction and authenticated Data API calls. | Passed: partial update preserves locale, invalid locale/owner override/missing identity are rejected; authenticated empty patch succeeds and invalid locale is rejected through the Data API. |
| P01-T03 | Applied `20261125000300_set_bookmark.sql`; ran `bookmark.sql` locally, an isolated rolled-back hosted SQL transaction, and an invalid-input Data API call. | Passed: repeated save/remove is idempotent, other bookmarks and another account's bookmark are preserved, and invalid input and missing identity are rejected. |
| P01-T03 | Ran `start_session.sql` with the new migration in a rolled-back local PostgreSQL transaction. | Session creation retry preserved an advanced cursor and did not reactivate a replaced session. |
| P01-T03 | Ran `commit_attempt.sql` with both new migrations in a rolled-back local PostgreSQL transaction. | Checked atomic rollback, exact replay, changed replay rejection, stale writes and replay after session replacement. |
| P01-T03 | `node --test tests/repository.test.ts` and `npm run check`. | Repository maps representative account rows and surfaces a conflict. Live integration and account switching remain unverified. |
| P01-T03 | Applied migrations `20261125000400` and `20261125000500` together to hosted development, then ran `start_session.sql` and `commit_attempt.sql` in rolled-back transactions. | Passed the SQL fixtures on hosted PostgreSQL. A hosted Data API check rejected unauthenticated session creation (`42501`) and an authenticated empty queue (`22023`). Concurrent requests and end-to-end answer saving through the Data API remain unverified. The project has no Supabase CLI migration-history table; these migrations were applied directly with `psql`. |
| P01-T03 | Repository tests with short server pages. | Cards and bookmarks are paginated, and the declared latest-1,000 attempt history is filled across short pages; live integration remains unverified. |
| P02-T02 | FSRS wrapper tests and type/lint checks. | Pinned `ts-fsrs` 5.4.2 for the project's Node 22 support; tested card initialization, JSON round-trip and invalid-card rejection. |
| P02-T02 | `tests/mastery.test.ts`, `tests/fsrs.test.ts`, and `npm run check`. | Verified due grading, early practice/retry suppression, lapse reset, same-day learning steps, timezone-local evidence, provisional mastery thresholds and serialized card round-trip. First exposure uses `startProgress`; callers must not also treat it as a review. |
| P02-T03 | `node --test tests/*.test.ts` (28 passed) and `npm run check`. | `tests/session.test.ts` verified that a due-and-weak sense appears once and Due Review adds no new senses, the daily allowance follows the local calendar day in both directions across midnight, a backlog larger than the budget halves new intake, a strict topic/kind filter returns an empty queue, and recovery prefers another context, inserts after three questions, and stops after two retries. |
| P01-T03 | Ran `start_session.sql`, `commit_attempt.sql` and new `spaced_retry.sql` on local Docker PostgreSQL 17, each in one rolled-back transaction with migrations `20261125000400`–`20261125000600`. | Passed. Without `20261125000600`, `spaced_retry.sql` failed on the mid-queue retry. With it, one active retry for the answered sense is accepted after the cursor; insertion before the cursor, replacing a pending item, a non-retry source, another sense and two insertions are rejected without writing an attempt. |
| P01-T03 | With owner approval, applied `20261125000600` to hosted development in one `psql` transaction, then ran `start_session.sql`, `commit_attempt.sql` and `spaced_retry.sql` there and called the RPC anonymously through the Data API. | Passed. The function remains `SECURITY DEFINER` with an empty `search_path`, executable by `authenticated` but not `anon`; anonymous RPC returned `42501`. No fixture users, sessions or attempts remained after rollback. An end-to-end authenticated answer save through the Data API remains unverified. |
| P02-T04 | `tests/transition.test.ts`, `node --test tests/*.test.ts` (31 passed) and `npm run check`. | A wrong first answer returns feedback and one payload with matching attempt flags, initialized progress, a recovery retry, cursor/revision advance and unchanged inputs; the final answer completes the session; mismatched exercise/version, closed session and malformed answers are rejected without a payload. A payload generated from seed exercises was accepted by `commit_learning_attempt` on local PostgreSQL and its exact replay added no second attempt. |
| P01-T04 | `loadCatalog` (`src/lib/catalog.ts`) read through an authenticated test account's Data API session; `npm run build` followed by a search of `dist/`. | Returned 1 topic, 3 senses and 6 exercises covering all five kinds; the production bundle contains no catalog text or exercise IDs. Seed validation plus schema constraints reject broken references, missing answer keys, duplicate IDs and invalid option/chunk sets; the owner confirmed the editorial review. |
| P01-T02 | Hosted Auth settings endpoint read with the publishable key. | **Failed requirement:** `disable_signup` is `false` (email provider enabled, `mailer_autoconfirm` false), so public signup is open on hosted development. No Supabase CLI or access token is available to change project Auth settings. |
| P01-T03 | `node scripts/hosted-check.ts` against hosted development with two dedicated test accounts, then `scripts/reset-test-accounts.sql`. | Passed through the real Data API: session start retried without duplication; a wrong answer from `submitAnswer` was saved with its retry; two concurrent deliveries of the same commit stored one attempt; a fresh stale write returned `conflict`; the exact replay after the cursor advanced was acknowledged. Account 2 could not read account 1's session or attempt, and replaying account 1's payload was rejected without writing. |
| P03-T01 | `npm run check`, `node --test tests/*.test.ts` (locale parity included) and a Playwright Chromium run against `vite` with hosted development at 1440×900 and 390×844. | Passed. Catalog keys, non-empty text and interpolation variables match; sign-in matches the Login/M-Login boards; empty and wrong-password submissions show localized errors; account 1's saved `vi` locale switches copy and `html[lang]`; the first Tab focuses the visible skip link; an unknown direct route shows a localized not-found page. Signing out returns to English sign-in, and signing in as account 2 (saved `en`) replaces account-bound state. The only console error was the expected 400 from the wrong-password attempt. Unsupported locales resolve to English through `normalizeLocale` and `fallbackLng`. |
| P01-T02 | Same Playwright run. | Account switching through the app remounts account-bound state; missing/invalid configuration renders a localized message. The hosted signup setting remains the only open item. |

The source/configuration review found no useful further scaffold refactor. Formatting left executable source and configuration unchanged after the passing checks; later documentation edits reused that evidence. The fixed delivery report is [VERIFICATION.md](VERIFICATION.md).

P00 did not verify product behavior. The P01-T01 fixture verifies database constraints, not Supabase Auth or Data API behavior.

## Handoff notes and blockers

- On 25 November 2026 the owner confirmed they reviewed the starter content. This satisfies the editorial review prerequisite for P02-T03; it is not evidence that unrelated structural or hosted checks have run.
- The first migration denies API client access by default. The second migration permits owner-scoped reads and authenticated catalog reads; session, attempt and settings writes remain denied until P01-T03.
- The existing desktop, mobile and state boards are inventoried under [docs/design](design/README.md). Screen composition must read its matching supplied boards; data/domain work and generic token groundwork can proceed independently.
- The owner authorized use of the hosted development project in `.env.local` and reported applying both migrations and `supabase/seed.sql`. Auth health responded successfully, and unauthenticated Data API reads of `curriculum_topics` and `user_settings` were denied with SQLSTATE `42501`. Both owner-provided test accounts can authenticate and read the starter content; after the owner added settings rows, each account could read its own row but not the other's. Hosted signup configuration and application account-state switching remain unverified. Local Vite public-variable aliases reference the existing `NEXT_PUBLIC_*` values. P06 additionally needs an authorized private deployment target.
- **Blocker (P01-T02):** public signup is enabled on hosted development. The owner must turn off **Allow new users to sign up** under Supabase Dashboard → Authentication → Sign In / Providers; afterwards re-read `/auth/v1/settings` and expect `disable_signup: true`. Account-state switching is verified with the P03-T01 shell.
- With owner approval on 25 November 2026, two dedicated hosted test accounts (`rv-test-1@example.com`, `rv-test-2@example.com`) were provisioned through SQL. Their passwords exist only in `.env.local` as `TEST_EMAIL_1/2` and `TEST_PASSWORD_1/2`.
- The owner subsequently requested local PostgreSQL in Docker, then switched back to hosted Supabase development. The Docker database at `127.0.0.1:55432` remains available for local SQL checks; its `auth` schema is a test shim, not an authentication provider. Initial scripts run only on a new volume; do not remove the volume to re-run them without explicit permission.

## Updating this tracker

When handing off a task, update its row and the current/last/next fields, then add only the verification evidence or concrete blocker needed by the next agent. Link to the task rather than copying its implementation steps. A task may be marked `DONE` only for work performed in this clean starter and verified to the extent required by its actual risk.
