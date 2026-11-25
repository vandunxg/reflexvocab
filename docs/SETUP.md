# Starter setup and future Supabase setup

## 1. Run the starter now

[README.md](../README.md) is the canonical quick-start and script reference. Use the Node version required by `package.json`, then run these commands from the repository root:

```bash
cp .env.example .env.local
npm ci
npm run dev
```

The starter intentionally renders a **blank page** from the minimal React/Vite/TypeScript bootstrap. There are no learning screens, example vocabulary, mock progress, login flow or connected database to try yet. Blank Supabase environment values are acceptable because no Supabase client is initialized.

The chosen Supabase SDK is a dependency for the planned stack; installing it does not create a project, initialize a client or implement authentication. The two reserved environment names are:

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

These commands do not connect Supabase or verify future learning behavior. Follow `package.json` and README if a later task changes a script. There is no Vitest, Playwright or test script. A task will add test tooling when it has a concrete behavior worth protecting.

Before a code commit, inspect the diff, make useful local refactors and run the type/lint check on the final code. Documentation-only edits will not require npm commands. Build/test scope will follow the task's actual risk, as described in [FLOWS.md](FLOWS.md), rather than becoming a gate after every edit.

## 3. Begin product implementation

Read [PROGRESS.md](PROGRESS.md), choose the next authorized task from the detailed phase files indexed in [PLAN.md](PLAN.md), and consult the relevant requirements, [SDD.md](SDD.md) and [ADAPTERS.md](ADAPTERS.md).

The supplied board inventory and its implementation interpretation are in [`docs/design/README.md`](design/README.md). Read the matching desktop, mobile and state boards for a UI task. If a future surface has no board, its absence does not justify inventing a replacement or claiming design approval; identify the specific missing decision and continue independent work.

## 4. Future Supabase provisioning — not implemented

This section will guide the authentication/data phase. The starter does not contain a Supabase client module, migrations, schema SQL, seed data, RPCs or database tests. Running the frontend today does not provision any of them.

For the future integration, the implementer will:

1. Choose the authorized development environment. A local stack can use the [Supabase CLI and Docker workflow](https://supabase.com/docs/guides/local-development/cli/getting-started); a hosted development project will use the owner's chosen Supabase project. Docker will not be needed for the bare React starter.
2. Configure private access: turn off public signup and anonymous sign-ins, keep only the chosen email/password sign-in path, and pre-create permitted accounts through a trusted administrative path. Confirm the initial account/email setup as required by that environment. Use the current [Auth configuration guide](https://supabase.com/docs/guides/auth/general-configuration).
3. Implement the first reviewed migration from the logical model in SDD. Include explicit grants, owner-scoped RLS and narrow atomic learning writes. Do not weaken RLS to make a frontend query succeed.
4. Add reviewed content through the import process developed for that phase. No catalog or seed file currently exists to run. Importing content will preserve user progress.
5. Initialize the client and connect the repository/auth state. Fill the two `.env.local` values from the selected development project, then restart the dev server so configuration changes are read. SDK session behavior and database access can be verified before a screen is available; connect the real sign-in surface during the UI phase rather than inventing a mock login to claim Auth verification.
6. Verify signed-out denial, isolation between two test accounts, a successful answer save/reload, duplicate request handling and stale revision behavior. These will be targeted checks for the new persistence code, not permanent gates for unrelated UI edits.
7. Record the actual environment and results in PROGRESS. SQL fixture checks, local-stack checks and hosted Auth/Data API checks will be described separately; none will be claimed to prove the others.

Local configuration will not automatically configure a hosted project. Before any future migration command, the implementer will identify the target environment and the effect of the command. Database reset/fixtures will be restricted to disposable development data. Provisioning, credentials, deployment and production data changes will not be implied by starting the documentation or frontend task.

## 5. Configuration and recovery expectations

Once the integration is built, missing configuration will show an actionable setup state. Missing reviewed content will show a content-availability state. Network failure will retain the answer request for retry, and a stale revision will offer authoritative reload. The application will not replace any of these failures with mock data or local progress.

The planned private boundary will protect catalog and learner data behind authentication. If a future deployment also needs to hide the public login page itself, that will be a hosting-access requirement, not something a client-side route can enforce. Deployment choice will be made in its own authorized task.
