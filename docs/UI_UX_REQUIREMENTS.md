# Product UX requirements

These requirements guide later implementation. The starter supplies no implemented product screens, populated dashboard or synthetic progress. Finished reference boards are inventoried in `docs/design/`; [DESIGN.md](../DESIGN.md) governs their use.

## 1. Chosen direction

- Use a bright, colorful, youthful Brilliant-inspired direction across the **entire app**, including Today and other dashboard screens.
- Internationalize every user-facing string through the shared i18n layer. Ship reviewed English and Vietnamese interface copy with consistent learning vocabulary; English is the default/fallback. Optional Vietnamese learning glosses remain separate from interface language.
- Make the next useful study action obvious. Color and illustration should support learning, topic recognition, or feedback rather than fill empty space.
- Reuse components and behavior across pages. A new layout must not create a second session, grading, or save flow.
- Show meaningful data and actual states. Completion, accuracy, and mastery must remain distinct.

The earlier dark dashboard/mixed-theme concept is superseded. Exact layout, colors and assets should follow the supplied screen handoff. If a future surface has no board, record that gap rather than recreating a missing artboard.

## 2. Jobs of the main screens

| Screen     | Primary learner job                                     | UX requirement                                                                               |
| ---------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Onboarding | Set a comfortable starting pace                         | Three short steps: minutes, new items/day, topic; Skip uses defaults; Back preserves choices |
| Today      | Start or resume the next useful session                 | One clear study action; due/new guidance and activity stay secondary                         |
| Learn      | Choose a topic and understand progress                  | Recommended sequence with freedom to choose; completion is distinct from mastery             |
| Practice   | Select a preset or a limited custom session             | Clear options; custom settings remain small; show why an empty selection cannot start        |
| Library    | Find, inspect, listen to, bookmark, and practice senses | Useful search/filters; readable definitions; discoverable audio and selection actions        |
| Progress   | Understand completed work and review needs              | Honest metric labels, denominators, date ranges, and insufficient-data states                |
| Settings   | Adjust language, study and audio preferences            | Related fields grouped together; save state near the changed settings                        |
| Session    | Answer, understand feedback, and continue               | One question in focus; stable action placement; no countdown for new learning                |

Primary navigation uses Today, Learn, Practice, Library, and Progress. Settings is a separate utility destination. Navigation details and recovery paths belong in [FLOWS.md](FLOWS.md).

## 3. First use and onboarding

Offer three optional steps after first sign-in: target minutes, new words/senses per day, and a starting topic. Skip defaults are 10 minutes, 8 new senses/day, and the first available editorially recommended foundation topic. Keep timezone at the editable `Asia/Ho_Chi_Minh` default; do not add a fourth setup question.

Skip defaults only the current field; Back and Skip preserve earlier accepted choices. Save minutes/new-item limit and a minimal onboarding-completed marker. The topic remains a draft for the first `SessionConfig`, not a persistent account preference. Pace stays editable in Settings; later topic choices belong to Learn or Practice.

Finish or skip directly into Today with a route into the first learning session. No compulsory placement test, long product tour, or repeated welcome screens. When a returning learner has an unfinished session, make resuming easy without replaying onboarding.

## 4. States that matter

| Situation               | Required response                                                                   |
| ----------------------- | ----------------------------------------------------------------------------------- |
| No learning history     | Explain the first useful action instead of showing a wall of zero-valued metrics    |
| No due reviews          | Say that nothing is due; do not silently substitute new content                     |
| Filters return no items | Explain the filter result and offer an appropriate way to adjust or clear filters   |
| Loading                 | Keep the page understandable; never substitute fabricated values                    |
| Answer submitted        | Show feedback immediately, save once, and focus the next usable action after saving |
| Save pending/failed     | Retain the answer, state whether it is saved, and retry the same request            |
| Session conflict        | Explain that saved state has changed and provide a recovery path                    |
| Audio unavailable       | Keep the text task usable and provide a concise explanation                         |
| Session finished        | Show a clear result and next step without calling completion “mastery”              |

Show selected, hover, and focus states distinctly. Touch and keyboard users must be able to reach audio, bookmarks, and selection controls without hover. Long vocabulary or explanations should not hide essential actions or make important content inaccessible.

Layouts must tolerate the reviewed English and Vietnamese strings without clipping, horizontal scrolling or obscuring primary actions. Validation, save states, conflict recovery, empty states, `aria-label` values and live announcements require translations just like visible labels. Use locale-aware pluralization and formatting; do not assemble sentences from translated fragments.

## 5. Optional proposals outside committed scope

- Preserve Library search/filters when returning from practice if losing them becomes a repeated annoyance.
- Expand extra examples/details on demand if displaying everything makes the library hard to scan.
- Explain a recommended session in one sentence using due/new/weak data, without building a recommendation service.

These proposals do not authorize additional feature implementation in the starter. Prioritize them through the roadmap when their value is clear. Status remains exclusively in [PROGRESS.md](PROGRESS.md).

## 6. Proportionate UX verification

When a screen is implemented or materially changed, inspect the affected view on desktop and a relevant narrow viewport. Exercise its main action and the error/empty state that the change can affect. Check keyboard/focus when changing an interaction. Extend verification only to address a concrete remaining risk.

Do not introduce mandatory brief/wireframe approval loops, a five-viewport pipeline, or a snapshot test for every card/token. Documentation and supplied designs are inputs to work, not a reason to fabricate a mock application before the phase calls for it.

## 7. UX research source

[Evondev UIUX](https://evondev-uiux.vercel.app/) and the [evondevKit source](https://github.com/evondev/evondevKit/tree/5a892ceac93d1bb286391663eb01cbd011706886/skills/ui-ux) were read to inform this brainstorm. The inspected version was `0.9.3`; relevant references covered reuse, dashboards, lists, and multi-screen flows.

The source is **read only for this project**. No upstream skill, asset, script, installer, or mandatory workflow is copied into the starter. The user will install the skill separately if desired. Product-specific choices above and the project rules govern later implementation.
