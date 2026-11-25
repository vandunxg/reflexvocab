# Decisions and implementation defaults

This file records product choices and superseded directions. It is not an implementation tracker. Use [PLAN.md](PLAN.md) for the phase roadmap and [PROGRESS.md](PROGRESS.md) for execution status.

## Confirmed product choices

| ID  | Area                | Decision                                                              | Consequence                                                                                                                       |
| --- | ------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| D01 | Stack               | React + Vite + Supabase; TypeScript strict                            | One app and database; no separate backend merely for CRUD                                                                         |
| D02 | Quality             | Proportionate gates and meaningful tests                              | No full pipeline for every edit, coverage quota, or trivial tests                                                                 |
| D03 | React               | Reuse components and flows                                            | Extract only useful shared behavior; keep UI consistent                                                                           |
| D04 | Visual direction    | Bright, colorful, youthful Brilliant-inspired UI across the whole app | Dashboard follows the same direction; supplied desktop/mobile/state boards guide implementation                                   |
| D05 | Learning model      | C — Hybrid learning                                                   | Curriculum plus scheduled review                                                                                                  |
| D06 | Unlocking           | C — Guided freedom                                                    | Recommend a path without hard lesson locks                                                                                        |
| D07 | Difficulty          | B — Rule-based adaptive difficulty                                    | Small per-sense rules, no ML engine                                                                                               |
| D08 | Vocabulary content  | C — Context-based hybrid                                              | Track a meaning; teach with examples and collocations                                                                             |
| D09 | Exercise generation | C — Hybrid generation                                                 | Reviewed offline content; selection/shuffling at runtime                                                                          |
| D10 | Mastery             | C — Evidence-based mastery                                            | Independent recall across time and contexts                                                                                       |
| D11 | Sessions            | C — Interleaved learning                                              | Mix due, new, and weak items without duplicate initial senses                                                                     |
| D12 | Placement           | C — Optional plus continuous                                          | Start learning immediately; optional test later                                                                                   |
| D13 | Gamification        | B — Lightweight                                                       | Goals, streak, calendar, milestones; no XP/shop/leaderboards                                                                      |
| D14 | Learning language   | C — Progressive immersion                                             | English first; optional on-demand Vietnamese gloss                                                                                |
| D15 | Audio               | Browser TTS first, narrow extensible boundary                         | Additional voices/providers only when actually integrated                                                                         |
| D16 | Dataset             | C — Frequency × topic                                                 | Editorial levels/topics with verified sources where claimed                                                                       |
| D17 | Exploration         | B — Interactive vocabulary library                                    | Search, inspect, listen, bookmark, and select for practice                                                                        |
| D18 | Reflex              | C — Progressive training                                              | Measure first; timed practice for familiar content later                                                                          |
| D19 | Recovery            | C — Contextual recovery                                               | Explanation and bounded practice in another context where available                                                               |
| D20 | Persistence         | B — Incremental Supabase persistence                                  | Save each answer consistently; resume acknowledged progress                                                                       |
| D21 | Authentication      | A — Private application                                               | Pre-created accounts; public signup disabled                                                                                      |
| D22 | Practice            | C — Presets plus custom configuration                                 | One session engine for all modes                                                                                                  |
| D23 | Current deliverable | English documentation and a minimal React/Vite/TypeScript scaffold    | No mock UI, feature implementation, synthetic dataset, or SQL implementation                                                      |
| D24 | Evondev UIUX        | Read only for requirements brainstorming                              | Do not install, vendor, or package the upstream skill; the user will install it separately if desired                             |
| D25 | Onboarding          | Three optional steps: minutes, new items, first-session topic         | Persist minutes/new-item limit and a completion marker; pass the topic draft into the first session, not a saved topic preference |
| D26 | Project language    | English docs/code/comments; internationalized `en`/`vi` interface    | English is the default/fallback UI locale; interface locale remains separate from optional Vietnamese learning glosses              |
| D27 | Internationalization | Mandatory for every implemented feature                              | User-facing copy uses one shared i18n layer and ships with reviewed English and Vietnamese entries                                  |

Letters preserve the brainstorm's labels. The behavior stated here and in [REQUIREMENTS.md](REQUIREMENTS.md) is authoritative; an isolated “option C” is not a sufficient specification.

## Starting defaults, distinct from historical selections

The following choices make later MVP implementation concrete. They are adjustable product defaults, not claims that the user separately selected each number or that they are scientifically validated.

| Default                     | Initial choice and reason                                                                                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Study preferences           | 10 minutes and 8 new senses/day; editable later in Settings                                                                                                   |
| First-session topic         | First editorially recommended available foundation topic when skipped; used in the first SessionConfig, not persisted as an account preference                |
| Locale-related settings     | English (`en`) default/fallback, Vietnamese (`vi`) supported, editable `Asia/Ho_Chi_Minh` timezone; locale and timezone remain independent                      |
| Audio preferences           | Automatic available English voice, speech rate `0.9`                                                                                                          |
| Session selection           | Initial budget 1–30 questions; `due → due → new → weak` heuristic, adjusted for available pools rather than exact ratios                                      |
| Recovery                    | Up to two retries per sense; insert after up to three other questions when possible                                                                           |
| Qualified learning evidence | Record all attempts, but only suitable new/due non-retry attempts update scheduling; only later unassisted qualified recalls accumulate mastery evidence      |
| Mastery threshold           | Three later review days, two contexts, a typing-cloze success, and stability of at least 14 days; reset the current evidence window after a qualified failure |
| Review rating               | Due wrong/revealed → Again; correct with a non-revealing hint → Hard; correct independent → Good; no automatic Easy from speed                                |
| Current session             | One active session per user with revision conflict detection; no automatic merging of concurrent sessions                                                     |
| Save failure                | Keep one pending answer, retry its stable request, and pause Next until saved; no durable offline queue in MVP                                                |

**Qualified Learning Evidence** was a recommendation before the request to prepare the project, not an explicitly selected A/B/C strategy. It is retained as the conservative starting default. FSRS schedules short-term relearning as needed, but repeated same-day practice must not count as several days of long-term memory evidence.

## Superseded directions

| Earlier direction                                                 | Current requirement                                                                                              |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Deliver a working feature prototype and sample pack               | Deliver documentation and only the minimal scaffold; implement features later through phase tasks                |
| Dark dashboard or mixed visual themes                             | One bright, colorful Brilliant-inspired direction for the whole app                                              |
| Vietnamese project documents/code/comments                        | English project language; the product interface itself supports reviewed English and Vietnamese locales           |
| Local-first storage and no account                                | Planned private Supabase access with incremental persistence                                                     |
| Mandatory unlock tests, timed new learning, or required placement | Guided freedom, untimed new learning, optional placement later                                                   |
| Automatic Easy for a fast correct response                        | Speed is a measurement, not sufficient memory evidence                                                           |
| A universal gate/test pipeline                                    | Checks chosen by changed behavior and actual risk                                                                |
| Add/install the Evondev skill to the package                      | Read it as a UX source only                                                                                      |
| Duplicate task/status tables across documents                     | Phase files hold task details; PROGRESS is the sole status/handoff tracker; PLAN is the index/dependency roadmap |

## Questions to resolve when relevant

- Which sources and redistribution terms support the future vocabulary batches?
- Which Supabase development project and deployment host will be used when implementation reaches that work?
- Which voice/provider and budget are appropriate if consistent Listening audio becomes necessary?

These questions do not block a documentation-first starter. Record new product decisions here when authorized. Keep local naming, spacing, and routine implementation choices out of an unnecessary ADR process. See [DESIGN.md](../DESIGN.md), [SDD.md](SDD.md), and [ADAPTERS.md](ADAPTERS.md) for their respective boundaries.
