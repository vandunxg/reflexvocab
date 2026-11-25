# Starter setup and future Supabase setup

## 1. Run the starter now

### Local PostgreSQL development database

Start the Docker database with `docker compose up -d --wait`. It listens only on
`127.0.0.1:55432` with database/user `reflexvocab` and the development-only
password `reflexvocab-local`. Its named Docker volume persists data across
container restarts. The first initialization applies the existing migrations and
`supabase/seed.sql`; subsequent starts do not reapply changed files. Never use
`docker compose down -v` unless intentionally discarding local data.

The local `auth` schema only lets PostgreSQL apply and test the existing
Supabase-oriented migrations. It is not Supabase Auth or a secure authentication
service. The React application cannot talk directly to PostgreSQL: a server
boundary is still required before the local database supports an end-to-end
learning flow.

To run the database contract checks without changing persistent data:

```bash
docker compose exec -T postgres psql -U reflexvocab -d reflexvocab -v ON_ERROR_STOP=1 < supabase/tests/learning_contracts.sql
docker compose exec -T postgres psql -U reflexvocab -d reflexvocab -v ON_ERROR_STOP=1 < supabase/tests/private_access.sql
```

The existing local volume does not contain the session functions from
migrations `20261125000400` onward. To check `start_session.sql`,
`commit_attempt.sql` or `spaced_retry.sql`, send `begin;`, migrations
`20261125000400`–`20261125000600`, the fixture without its own `begin;` and
`rollback;` lines, and a final `rollback;` through one `psql` invocation.

[README.md](../README.md) is the canonical quick-start and script reference. Use the Node version required by `package.json`, then run these commands from the repository root:

```bash
cp .env.example .env.local
npm ci
npm run dev
```

The frontend still renders a **blank page** because product screens are not present. Blank Supabase environment values are acceptable for the scaffold; the client is initialized only with valid public configuration.

Installing the SDK does not create a Supabase project. The browser Auth boundary uses these two variables:

```dotenv
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

There is no demo-mode variable or demo persistence strategy. Keep `.env.local` outside version control and keep the example values empty. When the integration phase connects Supabase, only a publishable key will go into the frontend variable. Supabase's [API key guide](https://supabase.com/docs/guides/getting-started/api-keys) explains why elevated keys belong on trusted servers.

## 2. Available development checks

| Command          | Purpose                                             |
| ---------------- | --------------------------------------------------- |
| `npm run dev`    | Run the Vite development server.                    |
| `npm run check`  | Run the configured TypeScript and lint checks.      |
| `npm run build`  | Verify production bundling and create build output. |
| `npm run format` | Apply the configured formatter.                     |

These commands do not connect Supabase. The schema has a separate SQL contract check; there is no application test runner yet.

Before a code commit, inspect the diff, make useful local refactors and run the type/lint check on the final code. Documentation-only edits will not require npm commands. Build/test scope will follow the task's actual risk, as described in [FLOWS.md](FLOWS.md), rather than becoming a gate after every edit.

## 3. Begin product implementation

Read [PROGRESS.md](PROGRESS.md), choose the next authorized task from the detailed phase files indexed in [PLAN.md](PLAN.md), and consult the relevant requirements, [SDD.md](SDD.md) and [ADAPTERS.md](ADAPTERS.md).

The supplied board inventory and its implementation interpretation are in [`docs/design/README.md`](design/README.md). Read the matching desktop, mobile and state boards for a UI task. If a future surface has no board, its absence does not justify inventing a replacement or claiming design approval; identify the specific missing decision and continue independent work.

## 4. Supabase provisioning

Running the frontend does not provision Supabase. The migrations define the schema and authenticated read policies; direct API writes remain denied. For local development, start Docker and run `supabase start` from the project root. The checked-in Supabase configuration disables public and anonymous signup and leaves seeding explicit. Provision test accounts administratively in the disposable stack, and use only the displayed `sb_publishable_` key for the browser. Do not enter a secret key in a `VITE_*` variable: Vite can bundle it regardless of client-side validation.

To check a fresh, disposable Supabase development database manually, apply the migrations and run the SQL fixtures as its database administrator. They insert synthetic rows in rolled-back transactions; never use a production database.

```bash
psql "$DEV_DATABASE_URL" -v ON_ERROR_STOP=1 -1 \
  -f supabase/migrations/20261125000000_learning_contracts.sql \
  -f supabase/migrations/20261125000100_private_access.sql
psql "$DEV_DATABASE_URL" -v ON_ERROR_STOP=1 \
  -f supabase/tests/learning_contracts.sql \
  -f supabase/tests/private_access.sql \
  -f supabase/tests/starter_content.sql
```

If the local Supabase stack already applied the migrations, run only the fixtures. To retain the starter catalog in the disposable environment after checks, run `psql "$DEV_DATABASE_URL" -v ON_ERROR_STOP=1 -1 -f supabase/seed.sql`. The batch does not write to learner tables. To check SQL without Supabase, a disposable PostgreSQL instance needs the API roles `anon`, `authenticated` and `service_role` (with `BYPASSRLS`), `auth.users` with a UUID primary key, and a minimal `auth.uid()` that reads the test claim. That substitute does not verify Supabase Auth or the Data API.

The authorized hosted development project has had migrations through
`20261125000600_spaced_retry_queue.sql` applied directly with `psql`.
It has no Supabase CLI migration-history table. Reconcile migration history
before using CLI migration commands there; blindly replaying these files will
fail on existing objects. The new SQL functions were checked with rolled-back
fixtures, not a full application flow.

To check the repository through the hosted Data API, add the test-account
variables `TEST_EMAIL_1`, `TEST_PASSWORD_1`, `TEST_EMAIL_2` and
`TEST_PASSWORD_2` to `.env.local`, then run:

```bash
set -a && . ./.env.local && set +a
node scripts/hosted-check.ts
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/reset-test-accounts.sql
```

The check writes a session and attempt for test account 1; the reset script
removes learning data only for the two dedicated test accounts.

For the future integration, the implementer will:

1. Choose the authorized development environment. A local stack can use the [Supabase CLI and Docker workflow](https://supabase.com/docs/guides/local-development/cli/getting-started); a hosted development project will use the owner's chosen Supabase project. Docker will not be needed for the bare React starter.
2. Configure private access: turn off public signup and anonymous sign-ins, keep only the chosen email/password sign-in path, and pre-create permitted accounts through a trusted administrative path. Confirm the initial account/email setup as required by that environment. Use the current [Auth configuration guide](https://supabase.com/docs/guides/auth/general-configuration).
3. Extend the initial schema with owner-scoped RLS policies, explicit grants and narrow atomic learning writes. Do not weaken RLS to make a frontend query succeed.
4. Import the reviewed content batch without altering learner progress.
5. Fill the two `.env.local` values from the selected development project, then restart the dev server. SDK session behavior and database access can be verified before a screen is available. Connect the real sign-in surface during the UI phase rather than inventing a mock login to claim Auth verification.
6. Verify signed-out denial, isolation between two test accounts, a successful answer save/reload, duplicate request handling and stale revision behavior. These will be targeted checks for the new persistence code, not permanent gates for unrelated UI edits.
7. Record the actual environment and results in PROGRESS. SQL fixture checks, local-stack checks and hosted Auth/Data API checks will be described separately; none will be claimed to prove the others.

Local configuration will not automatically configure a hosted project. Before any future migration command, the implementer will identify the target environment and the effect of the command. Database reset/fixtures will be restricted to disposable development data. Provisioning, credentials, deployment and production data changes will not be implied by starting the documentation or frontend task.

## 5. Configuration and recovery expectations

Once the integration is built, missing configuration will show an actionable setup state. Missing reviewed content will show a content-availability state. Network failure will retain the answer request for retry, and a stale revision will offer authoritative reload. The application will not replace any of these failures with mock data or local progress.

The planned private boundary will protect catalog and learner data behind authentication. If a future deployment also needs to hide the public login page itself, that will be a hosting-access requirement, not something a client-side route can enforce. Deployment choice will be made in its own authorized task.
