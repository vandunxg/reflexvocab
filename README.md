# ReflexVocab

A docs-first foundation for a private, English-first vocabulary learning application built with React, Vite, TypeScript, and Supabase.

## What this package contains

- A minimal React application that intentionally renders a blank page.
- TypeScript, ESLint, Prettier, editor settings, environment template, and an npm lockfile.
- Product requirements, system design, learning and persistence contracts, user flows, and UI/UX specifications.
- A separate file for every implementation phase, with detailed tasks.
- One progress and handoff file: [docs/PROGRESS.md](docs/PROGRESS.md).
- Project instructions and six small, repository-local skill guides for working with AI agents.

Product screens, mockups, sample vocabulary, learning algorithms, Supabase client initialization, SQL migrations, and feature tests are not implemented in this starter. The Supabase SDK is included as a stack dependency. All product implementation work starts in Phase 01. The specification describes the intended MVP, not completed functionality.

## Run the blank starter

Use Node 24 (see `.nvmrc`) and npm.

```bash
npm ci
npm run dev
```

Open the local URL reported by Vite. A blank page is the expected result; `src/App.tsx` returns `null`. No Supabase credentials are needed to run this scaffold. Copy `.env.example` to `.env.local` when implementing the Supabase integration; keep secrets out of all `VITE_*` variables.

```bash
npm run check
npm run build
```

`check` runs type checking and ESLint. `build` creates the production bundle. `format` and `format:check` are available as formatting tools. There is no placeholder test command or test suite: add a test tool when a real task needs meaningful regression coverage. See [CONSTRAINTS.md](CONSTRAINTS.md) for checks by change risk.

## Start or resume work

1. Read [AGENTS.md](AGENTS.md), then [docs/PROGRESS.md](docs/PROGRESS.md).
2. Follow the **Next task** link to its task in the corresponding phase file.
3. Read only the linked requirements, contracts, and design references that affect that task.
4. Implement the task, verify the relevant behavior, and update `PROGRESS.md` with evidence and the next exact task link.

Use [docs/PLAN.md](docs/PLAN.md) to understand phase order. Each file under `docs/phases/` contains that phase's detailed tasks, dependencies, completion criteria, and proportionate verification. Task definitions stay in phase files; execution status stays in `PROGRESS.md`.

## Documentation map

| File                                             | Purpose                                                                |
| ------------------------------------------------ | ---------------------------------------------------------------------- |
| [REQUIREMENTS](docs/REQUIREMENTS.md)             | Product behavior, MVP scope, defaults, and deferred features           |
| [DECISIONS](docs/DECISIONS.md)                   | Agreed direction, superseded choices, and provisional defaults         |
| [SDD](docs/SDD.md)                               | System boundaries, state, data ownership, security, and save semantics |
| [ADAPTERS](docs/ADAPTERS.md)                     | Small audio, persistence, and scheduling contracts                     |
| [CONTENT](docs/CONTENT.md)                       | Vocabulary senses, reviewed content, and dataset intake                |
| [FLOWS](docs/FLOWS.md)                           | Learning, onboarding, recovery, and AI implementation workflows        |
| [DESIGN](DESIGN.md)                              | Product design direction, tokens, components, and interaction states   |
| [UI/UX requirements](docs/UI_UX_REQUIREMENTS.md) | Practical usability requirements informed by Evondev                   |
| [Design boards](docs/design/README.md)           | Supplied screen inventory and current implementation interpretation    |
| [PLAN](docs/PLAN.md)                             | Phase roadmap and dependency index                                     |
| [PROGRESS](docs/PROGRESS.md)                     | Current status, last stopping point, and exact next task               |
| [SETUP](docs/SETUP.md)                           | Local setup and later Supabase configuration                           |
| [CONSTRAINTS](CONSTRAINTS.md)                    | Reuse, simplicity, testing, and commit rules                           |
| [SOURCES](docs/SOURCES.md)                       | Source references and their intended use                               |
| [VERIFICATION](docs/VERIFICATION.md)             | Evidence from checking this delivered starter                          |

## Design handoff

The entire product follows the light, colorful, Brilliant-inspired direction in [DESIGN.md](DESIGN.md). Desktop, mobile and state boards are supplied under `docs/design/`; they are implementation references, not implemented product screens. A UI task must read its matching boards and the current requirement/phase task instead of copying legacy status labels, Vietnamese placeholder copy or sample values from the export.

Evondev UIUX is a reference for the requirements only. Its skill is not installed or bundled. Project-local guides live under `.agents/skills/`; an agent that does not discover that directory automatically can read the relevant `SKILL.md` directly through the links in [AGENTS.md](AGENTS.md).

Project documentation, identifiers, code and comments use English. Every implemented feature must route user-facing copy through the shared i18n layer and provide reviewed English (`en`) and Vietnamese (`vi`) entries; English is the default/fallback. Optional Vietnamese vocabulary glosses remain learning content and are independent of the interface locale.
