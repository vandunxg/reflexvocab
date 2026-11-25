# P00 — Foundation

## Purpose

Prepare a small, runnable React project and a dependable implementation guide. This phase delivers a scaffold and specifications, not a partially implemented learning product.

Execution status belongs only in [PROGRESS.md](../PROGRESS.md). Suggested paths below must be reconciled with the actual scaffold. Use [REQUIREMENTS.md](../REQUIREMENTS.md), [DESIGN.md](../../DESIGN.md) and the repository rules as the source of truth.

<a id="p00-t01"></a>

## P00-T01 — Establish the runnable scaffold

**Outcome / problem:** A developer can install and run the project without inheriting unfinished product features or unnecessary dependencies.

**Requirement references:** [R01 — Stack and starter scope](../REQUIREMENTS.md#r01-stack-and-starter-scope), [R24 — Agent workflow and quality](../REQUIREMENTS.md#r24-agent-workflow-and-quality).

**Dependencies:** None.

**Implementation steps:**

1. Create the minimal React + Vite + TypeScript project with strict type checking and an intentionally blank mount: `App` returns `null`. Do not add a placeholder or starter-status screen.
2. Add consistent scripts for development, type checking, linting and production build; commit the package lockfile and document the supported runtime.
3. Provide an environment example and ignore local secrets, build output and dependencies. Describe future Supabase configuration without connecting a product backend now.
4. Keep domain logic, authentication, onboarding, exercise screens, database migrations and adapters out of this scaffold until their implementation tasks begin.

**Suggested files:** `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `src/main.tsx`, `src/App.tsx`, `src/styles.css`, `.env.example`, `.gitignore`.

**Acceptance:** Installation is reproducible from the lockfile; the scaffold type-checks and builds; `App` returns `null` and README explains the intentional blank mount. No bundled product feature is presented as complete.

**Risk-targeted verification:** Run the scaffold's type/lint check and production build once on the final code/configuration. Inspect the blank `App`, dependency list and tracked files for accidental product code or secrets. Do not create a test suite for the empty mount.

<a id="p00-t02"></a>

## P00-T02 — Establish the specification and agent workflow

**Outcome / problem:** An agent can identify the intended behavior, choose one bounded task and locate its acceptance criteria without inventing missing decisions.

**Requirement references:** [R23 — Design and accessibility](../REQUIREMENTS.md#r23-design-and-accessibility), [R24 — Agent workflow and quality](../REQUIREMENTS.md#r24-agent-workflow-and-quality).

**Dependencies:** Repository scope from P00-T01; this documentation can be drafted in parallel with the scaffold.

**Implementation steps:**

1. Write the canonical requirements, design direction, system design, flows, adapter boundaries and setup instructions in English.
2. Keep this roadmap as an index, each phase as a separate task specification, and PROGRESS as the sole execution tracker.
3. Add practical repository rules and narrowly scoped agent skills: inspect existing work, reuse components, implement a bounded change, review/refactor the diff and verify only the affected risks.
4. Provide a location for design references that the user may add later. Describe the written bright, youthful design baseline without claiming any board collection has already been delivered.

**Suggested files:** `AGENTS.md`, `CONSTRAINTS.md`, `DESIGN.md`, `docs/REQUIREMENTS.md`, `docs/SDD.md`, `docs/FLOWS.md`, `docs/ADAPTERS.md`, `docs/SETUP.md`, `docs/PLAN.md`, `docs/PROGRESS.md`, `docs/phases/`, `docs/design/`, `.agents/skills/`.

**Acceptance:** Requirements and task references resolve; phase tasks have stable IDs; there is one status tracker. The instructions do not require blanket gates, coverage quotas, one test per component or speculative adapter frameworks.

**Risk-targeted verification:** Read the documentation diff, check local links/task anchors and reconcile scope claims. Confirm that design guidance covers the entire bright application, desktop top navigation, mobile bottom navigation and focused session/onboarding layouts. Documentation-only edits do not require npm or browser checks.

<a id="p00-t03"></a>

## P00-T03 — Verify and hand over the starter

**Outcome / problem:** The delivered starter has an accurate inventory, a reproducible setup path and a clear next product task.

**Requirement references:** [R01 — Stack and starter scope](../REQUIREMENTS.md#r01-stack-and-starter-scope), [R24 — Agent workflow and quality](../REQUIREMENTS.md#r24-agent-workflow-and-quality).

**Dependencies:** [P00-T01](#p00-t01), [P00-T02](#p00-t02).

**Implementation steps:**

1. Review the final scaffold and documentation together; remove contradictory claims about implemented product features.
2. Reuse the final scaffold check/build results where code is unchanged, and record the commands and outcomes in PROGRESS.
3. Package source and documentation without dependencies, credentials, generated build output or the old implemented application.
4. Set the handoff's next action to P01-T01. Mark only foundation work supported by actual evidence as complete.

**Suggested files:** `README.md`, `docs/PROGRESS.md`, the starter archive outside the source tree.

**Acceptance:** The archive contains the minimal scaffold and documentation; instructions distinguish available files from future implementation paths. Every product task remains unstarted at this handoff.

**Risk-targeted verification:** Inspect the archive inventory and local documentation links. Use installation/build evidence from the final scaffold, rerunning only if relevant code/configuration changed. Do not report Supabase, learning, UI or browser tests that were not performed for this package.
