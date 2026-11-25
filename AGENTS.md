# Working on ReflexVocab

This repository starts as a blank React scaffold with product specifications and supplied static design boards. Do not describe planned features, adapters, product screens or migrations as existing code; design files are references, not implementation.

## Begin with the active task

Read [docs/PROGRESS.md](docs/PROGRESS.md), follow its exact phase/task link, and inspect the relevant code and specification before editing. [docs/PLAN.md](docs/PLAN.md) is the roadmap; files in `docs/phases/` define the tasks. **Only `PROGRESS.md` tracks execution status and handoff.** Do not create a competing `TASKS.md`, task board, status log, or phase status checklist.

Current user instructions take precedence over repository defaults. Requirements define behavior; [DESIGN.md](DESIGN.md) and the owner's supplied boards in [docs/design](docs/design/README.md) define the UI. Use the board's composition and states with reviewed `en`/`vi` product copy, current phase ownership and persisted values; do not copy its legacy status labels or sample metrics. If a future task needs a missing board, record that specific dependency and continue independent work where possible. Do not invent or redesign the missing screen. Add a decision entry only when a meaningful product or architectural choice changes.

## Implementation rules

- Keep changes within the active task. Use English for code, docs and comments. Route every user-facing string through the shared i18n layer and update both `en` and `vi` catalogs in the same feature change; English remains the default/fallback.
- Inspect similar code first. Reuse existing components, styles, and behavior; do not assume planned files already exist.
- Keep state close to its owner. Derive values instead of maintaining synchronized copies. Use effects for external synchronization, not routine calculations.
- Add a shared component when behavior is reused or a section becomes hard to follow. Avoid speculative wrappers, generic factories, provider registries, and one interface per function.
- Add dependencies only when the current task needs them. Prefer mature libraries for complex behavior such as scheduling; keep their external details behind the small boundaries in [ADAPTERS](docs/ADAPTERS.md).
- Validate untrusted input at the boundary. Supabase authorization belongs in RLS and trusted operations, not hidden UI controls. Never put privileged credentials in browser configuration.
- Preserve the current answer and request identity on save failure. Respect the evidence, retry, and concurrency rules in [SDD](docs/SDD.md).
- Keep UI locale separate from timezone, speech voice and optional Vietnamese learning glosses. Domain/repository errors expose stable codes; translate them only at the UI boundary.

## Verify and finish

Follow [CONSTRAINTS.md](CONSTRAINTS.md). Before a code commit, review the diff, make any useful local simplification, and run `npm run check` on the final code state. A refactor review may conclude that no refactor is needed. Do not broaden scope to satisfy that rule.

Tests are selected by a named failure risk, not by file count or coverage percentage. Documentation-only edits need document/link review, not a build or test run. Small styling or copy edits need focused inspection of the affected state. Reuse valid evidence when relevant inputs have not changed; do not run the same suite at every sub-step.

Update `PROGRESS.md` with the completed task, evidence, remaining limitation, and exact next task link. Mark a task done only when its completion criteria are met. If blocked, state what is missing and point to independent work that can continue. Do not count a written requirement as an implemented product feature.

## Project-local skills

Load only the guide relevant to the current task; do not run all skills as a pipeline.

| Skill                                                                  | Use when                                                                      |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [implement-feature](.agents/skills/implement-feature/SKILL.md)         | Implementing a task from a phase file                                         |
| [build-learning-ui](.agents/skills/build-learning-ui/SKILL.md)         | Building a supplied screen or changing UI behavior                            |
| [extend-adapter](.agents/skills/extend-adapter/SKILL.md)               | Adding or replacing an audio, persistence, or scheduling integration          |
| [change-learning-rules](.agents/skills/change-learning-rules/SKILL.md) | Changing grading, review scheduling, session composition, or mastery evidence |
| [change-supabase](.agents/skills/change-supabase/SKILL.md)             | Changing schema, authorization, authentication, or save transactions          |
| [verify-change](.agents/skills/verify-change/SKILL.md)                 | Choosing sufficient verification and preparing a commit/handoff               |

These are repository guides, not globally installed skills. Do not install Evondev or another external skill without an explicit request. Do not create approval ceremonies, mandatory TDD, visual snapshots, or a full-app audit for every task.
