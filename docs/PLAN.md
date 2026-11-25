# Implementation roadmap

This is the dependency map for building the product from the minimal React scaffold. It is not a delivery report or a status board. The scaffold and documentation are the current deliverable; product work belongs to the tasks below.

Read [PROGRESS.md](PROGRESS.md) for the current task, execution status, evidence and next action. Open the linked phase file for implementation instructions. Product behavior is defined by [REQUIREMENTS.md](REQUIREMENTS.md), visual direction by [DESIGN.md](../DESIGN.md), and technical boundaries by [SDD.md](SDD.md) and [ADAPTERS.md](ADAPTERS.md).

## Phase index

| Phase                                                                       | Task range      | Outcome                                                                                        | Primary dependencies                                                                      |
| --------------------------------------------------------------------------- | --------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| [P00 — Foundation](phases/PHASE_00_FOUNDATION.md)                           | P00-T01–P00-T03 | Minimal runnable scaffold, coherent specifications and a truthful starter handoff              | None                                                                                      |
| [P01 — Data and private access](phases/PHASE_01_DATA_AND_PRIVATE_ACCESS.md) | P01-T01–P01-T04 | Reviewed sample data, private accounts and reliable persistence contracts                      | P00                                                                                       |
| [P02 — Learning core](phases/PHASE_02_LEARNING_CORE.md)                     | P02-T01–P02-T04 | Answer evaluation, evidence policy, scheduling and bounded session transitions                 | P01 content and persistence contracts                                                     |
| [P03 — Learning experience](phases/PHASE_03_LEARNING_EXPERIENCE.md)         | P03-T01–P03-T04 | Internationalized application shell and a complete learning session with saving, recovery and audio | P01 + P02 + supplied session/sign-in design boards; generic P03-T01 foundations may start after P00 |
| [P04 — Onboarding and learning entry points](phases/PHASE_04_ONBOARDING_AND_PRACTICE.md) | P04-T01–P04-T06 | Onboarding, Today, curriculum lessons, library, practice and settings using the same session flow | P03; individual task dependencies are listed in the phase                              |
| [P05 — MVP completion](phases/PHASE_05_MVP_COMPLETION.md)                   | P05-T01–P05-T04 | Honest progress metrics, light motivation, reviewed content and resolved usability gaps        | P03 + P04                                                                                 |
| [P06 — Private release](phases/PHASE_06_PRIVATE_RELEASE.md)                 | P06-T01–P06-T03 | Configured private deployment and an evidence-based product handoff                            | Required MVP outcomes from P01–P05                                                        |

## Dependency and scope rules

1. Follow the task dependencies, not an automatic approval ceremony between phases. A completed prerequisite allows the next task to begin.
2. Keep the first vertical slice small: one private account can start a session, answer, save and resume before adding more entry points or analytics.
3. The current screen inventory is supplied in [`design/README.md`](design/README.md). Read the matching desktop, mobile and state boards before composing a screen. A future screen without a board is not permission to invent a layout: record the specific blocker and continue independent work. P03-T01 may establish generic tokens and semantic primitives while data work proceeds. Agree on contracts before parallel agents edit dependent behavior; give each agent a bounded file scope.
4. A task's suggested file paths are proposals for future implementation. Inspect the actual repository and reuse existing components and boundaries before creating directories or abstractions. A listed path does not mean that file exists in the starter.
5. Verification sections identify risks worth checking. They are not mandatory suites to rerun after every edit. Apply the repository's quality rules and reuse relevant evidence when the affected code has not changed.
6. Phase specifications remain normative. Record task states, check results, blockers and handoffs only in [PROGRESS.md](PROGRESS.md).
7. R25 is mandatory for every feature task. User-facing copy, validation, failures, accessibility text and locale-sensitive formatting must use the shared i18n layer with complete `en` and `vi` entries. A task that adds or changes interface copy is not complete until both catalogs and the affected layouts are verified; learning content/glosses remain separate from UI translations.

## MVP screen coverage

This table maps the supplied boards to the task that owns their behavior and composition. It is a coverage check, not a second status tracker.

| Supplied screen group | Owning task |
| --- | --- |
| Sign-in, desktop/mobile navigation and focus shell | [P03-T01](phases/PHASE_03_LEARNING_EXPERIENCE.md#p03-t01) |
| New-sense introduction, five exercises and immediate feedback | [P03-T02](phases/PHASE_03_LEARNING_EXPERIENCE.md#p03-t02) |
| Saving/error/conflict states and session summary | [P03-T03](phases/PHASE_03_LEARNING_EXPERIENCE.md#p03-t03) |
| Three-step onboarding | [P04-T01](phases/PHASE_04_ONBOARDING_AND_PRACTICE.md#p04-t01) |
| Vocabulary library | [P04-T02](phases/PHASE_04_ONBOARDING_AND_PRACTICE.md#p04-t02) |
| Today start/resume experience | [P04-T03](phases/PHASE_04_ONBOARDING_AND_PRACTICE.md#p04-t03) |
| Settings | [P04-T04](phases/PHASE_04_ONBOARDING_AND_PRACTICE.md#p04-t04) |
| Learning path, lesson detail and lesson completion | [P04-T05](phases/PHASE_04_ONBOARDING_AND_PRACTICE.md#p04-t05) |
| Practice configuration, mistake-recovery session and practice result | [P04-T06](phases/PHASE_04_ONBOARDING_AND_PRACTICE.md#p04-t06) |
| Progress metrics and motivation surfaces | [P05-T01](phases/PHASE_05_MVP_COMPLETION.md#p05-t01) and [P05-T02](phases/PHASE_05_MVP_COMPLETION.md#p05-t02) |
| Cross-screen loading, empty, failure and responsive gaps | [P05-T04](phases/PHASE_05_MVP_COMPLETION.md#p05-t04) |

## Deliberate stopping points

P00 hands over the scaffold and documentation. P06 hands over an implemented private MVP. These are different deliverables; completing the starter does not complete a product task.

Optional placement testing, timed challenges, listening with curated recordings, additional audio providers, runtime AI, offline-first storage and a full-scale vocabulary collection remain governed by the deferred scope in [REQUIREMENTS.md](REQUIREMENTS.md). Do not install their dependencies or create placeholder implementations during the earlier phases.
