# ReflexVocab Design

**Current direction: 25 November 2026. The entire app uses a bright, colorful, youthful Brilliant-inspired style, including the dashboard.** This supersedes the earlier dark Linear dashboard direction. See [DECISIONS](docs/DECISIONS.md).

**Starter status:** the application is a blank React scaffold. The following is the target specification, not an implemented UI. There is no dark dashboard to migrate and no product component library yet. The supplied screen boards are inventoried under [docs/design](docs/design/README.md).

## 1. Design authority and references

| Source                                                                    | Usage                                                                                                                                              |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Owner's existing ReflexVocab screen designs                               | Primary screen-level reference after the files are added to `docs/design/`; follow their layout, states, and composition                           |
| This document                                                             | Whole-app direction, shared roles, interaction requirements, and constraints                                                                       |
| [Brilliant — Welcome](https://brilliant.org/welcome/?cta_persona=learner) | Inspiration for one question per step, large choice cards, top progress, a consistently placed 3D Continue button, and color on a light background |
| [Brilliant — About](https://brilliant.org/about/)                         | Inspiration for interaction, learning cadence, and immediate feedback                                                                              |
| [UI/UX requirements](docs/UI_UX_REQUIREMENTS.md)                          | Product-specific usability requirements informed by Evondev; the external skill is not bundled                                                     |

The supplied boards are references for layout, responsive composition and state treatment, not replacements for [product requirements](docs/REQUIREMENTS.md). Their Vietnamese copy can inform—but does not automatically become—the reviewed `vi` locale; legacy `M02–M05` labels, assumptions about an earlier base and sample values are not implementation truth. Every screen uses the shared i18n layer with complete `en` and `vi` entries, current phase IDs and persisted data. Resolve any other meaningful behavior/design conflict explicitly; do not silently drop required states. If a future task requires an absent board, record that dependency without fabricating a substitute design.

The colors, radii, and button treatments below are project-adapted choices. They are not official Brilliant design tokens. Do not use Brilliant's CoFo font, logo, mascot, illustrations, or copy. The `r.` identity and learning content belong to this project. Do not recreate another product's proprietary assets.

## 2. Usage principles

- **One primary task per screen.** Today leads into a learning session; an exercise focuses on one question and one next action.
- **Interaction first.** Let learners attempt an answer, then provide the result and explanation. Avoid introductory blocks that delay the first action.
- **Evidence-based progress.** Counts, history, and memory status come from stored data. Finishing a session does not demonstrate long-term retention.
- **Color has a purpose.** Use consistent roles for selection, correct answers, reinforcement, topic identity, and progress. Pair meaningful color with text.
- **Reuse first.** Reuse components and tokens once implemented. Extract shared behavior or a section that has become hard to read; do not create a second UI kit.

Flat geometric circles, rounded squares, and triangles may identify topics and support the Continue hero or session-end screen. Mark decorative shapes `aria-hidden`. Avoid decorative gradients, glowing backgrounds, glassmorphism, mascots, confetti, XP, reward badges, and filler cards. Functional choice numbers and status labels remain appropriate. Use an honest empty state when data is unavailable.

## 3. Screens and navigation

| Screen                        | Priority content                                                                                                    | Primary action           |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Sign in                       | Email, password, brief greeting; no public signup                                                                   | Start learning           |
| First-sign-in onboarding      | Minutes/day, new words/day, first-session topic; three steps, each with Skip, use defaults                          | Continue                 |
| Today `/`                     | Resume or recommended-session hero, streak and weekly calendar, due/started/mastered counts, filterable topic cards | Start or continue        |
| Learning path `/learn`        | Courses, levels, and topics; distinguish started from mastered                                                      | Study a topic            |
| Practice `/practice`          | Preset cards with colorful icons, a separate custom form, unfinished-session reminder                               | Create session           |
| Vocabulary library `/library` | Search, filters, meanings, examples, audio, bookmarks, multi-select                                                 | Select items to practice |
| Progress `/progress`          | Metrics with denominators, memory distribution, weekly calendar, session history                                    | See what needs review    |
| Settings `/settings`          | Goals, new words/day, timezone, voice, speech rate                                                                  | Save changes             |
| Learning session `/session`   | One question, hints, feedback, session progress                                                                     | Check, then continue     |

Onboarding is an MVP requirement. Its first two steps write real settings (`dailyMinutes` and `newPerDay`); its topic step selects the first session's topic. Each step offers a default. Do not ask for a TOEIC score, require placement, or add decorative onboarding steps. No onboarding code exists in this starter.

Desktop uses **top navigation**: logo, five pill tabs (Today, Learn, Practice, Library, Progress), streak chip, and Settings button. Center the main content in a column up to approximately 1100px wide. Use no sidebar. Mobile uses bottom navigation and Settings in the top bar. Onboarding and learning sessions use focus mode: exit/back, progress, and bottom action, with the main navigation removed. Do not add global search, an inbox, or a command menu. Library search is local to the library.

## 4. Theme and tokens

Use one light theme for the whole application. Implement the shared tokens in `src/styles.css` and the shared `en`/`vi` message catalogs during the UI foundation task. These foundations are not yet implemented. Keep styles and translations in their respective shared sources of truth instead of per-screen copies.

| Role                          | Target value and usage                                                                                                           |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Canvas, surface, soft surface | `#f7f6f1`, `#ffffff`, `#f0eee8`                                                                                                  |
| Borders                       | Default `#e4e1d8`; strong `#cfcbbf`                                                                                              |
| Text                          | Ink `#17181a`; muted `#5b5d57`                                                                                                   |
| Brand                         | Lime `#d2f55d`, lower shadow `#a9c93a`: identity, progress, study days, session completion; avoid long text on a lime background |
| Selection, focus, hero        | Blue `#3d57e6`; tint `#eef1ff`; strong text `#2a3fb8`                                                                            |
| Correct                       | Tint `#e6f8ec`; border `#2fc66b`; text `#17703a`                                                                                 |
| Reinforcement or save error   | Tint `#fff1e3`; border `#ff9238`; text `#a14e0a`                                                                                 |
| Topic identity                | Blue `#3d57e6`, orange `#ff9238`, purple `#8a5cf0`; secondary shapes pink `#ff76d6`, yellow `#ffcf3d`                            |
| Memory states                 | New: gray; Learning: yellow tint `#fff7dc` and text `#7a5a00`; Familiar: blue tint; Mastered: green tint                         |

| Element                       | Target treatment                                                                                                                                                                                |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Typography                    | Manrope Variable 800 for headings with mild negative letter spacing; DM Sans Variable 15–16px for body. Bundle through `@fontsource-variable` when the UI is implemented, with system fallbacks |
| Primary button                | Ink background, white text, 14px radius, at least 48px high, darker bottom shadow `0 4px 0` for the 3D treatment                                                                                |
| Secondary button              | White background, 2px light border, bottom shadow matching the border                                                                                                                           |
| Disabled button               | Background `#e4e1d8`, muted text, and a visible nearby reason                                                                                                                                   |
| Answer and onboarding choices | White, 2px border, 14px radius, 4px bottom shadow. Selected: blue border/shadow, blue tint, solid number badge                                                                                  |
| Card and panel                | 20–24px radius, 2px light border. Hero: flat color and 6px bottom shadow                                                                                                                        |
| Progress                      | 10–14px high, rounded; lime for a session or the relevant topic color                                                                                                                           |

Avoid making optional Vietnamese glosses too small to read. On mobile, touch targets are at least 44px and the primary action spans the available bottom width. Press feedback may translate a button by 1–2px; disable that motion for `prefers-reduced-motion`. Keep enough bottom padding and safe-area space that the action does not cover content.

These values describe intended roles. Verify text/background combinations when implemented; do not claim the blank starter has passed a color or accessibility audit.

## 5. Shared components and interactions

Start with a small shared set when the first screens need it:

| Proposed responsibility                        | Reuse target                                                                        |
| ---------------------------------------------- | ----------------------------------------------------------------------------------- |
| Button with primary, secondary, quiet variants | The same action styles across screens; add 3D styling in CSS                        |
| Page heading and empty state                   | Consistent headings and useful recovery actions                                     |
| Speak button                                   | One audio trigger with accessible label and provider fallback                       |
| Start or continue session action               | Today, Learn, Practice, and Library                                                 |
| Question renderer                              | The five exercise formats use one session flow, not a separate flow for each preset |
| Navigation shell and focus mode                | Top/bottom navigation for main screens; focused session/onboarding                  |

These are planned responsibilities, not existing files. Let the first implementation task establish actual file locations and reuse them afterward. Avoid creating every possible component ahead of a screen that needs it.

Each screen has one prominent primary action. A disabled control explains why it cannot proceed. An icon without visible text has a localized accessible name. Preserve a predictable position for Check and Continue across both supported locales; allow translated copy to wrap without hiding the action.

| State                                    | Required response                                                                                                                 |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Loading                                  | Brief status; no fabricated metrics or placeholder values presented as real progress                                              |
| No content, due items, or filter results | Explain the condition and offer an appropriate next action                                                                        |
| Correct or incorrect answer              | Bottom feedback panel with a text heading, answer, explanation, and example; pair the correct/reinforcement color with text       |
| Saving an answer                         | Keep feedback visible; show Saving… beside disabled Continue                                                                      |
| Save failure                             | Keep the current answer and allow retrying the same request                                                                       |
| Session changed elsewhere                | Explain that a reload is required; never silently overwrite another device's progress                                             |
| TTS unavailable or failed                | Show an understandable message and offer the defined text path; do not represent a text fallback as successful listening evidence |

Record answer-revealing hints as reveals. A green correct state must not imply that a supported answer was independent recall. Recovery behavior and evidence are defined in [REQUIREMENTS](docs/REQUIREMENTS.md) and [SDD](docs/SDD.md).

## 6. Accessibility and responsive behavior

Use semantic HTML, real form labels, sensible Tab order, visible blue focus, and text announcements for results. Neither color nor animation is the only carrier of meaning. Normal-size text should meet a 4.5:1 contrast target; check actual text/background pairs, including solid blue and lime heroes. Do not assume a decorative accent is safe for text.

Retain a skip link in the implemented app shell, respect reduced motion, and stop audio when leaving a screen. Long answers, hints, validation messages, and examples must not overlap the primary action or create horizontal scrolling. Keep feedback understandable at desktop and narrow mobile widths, including the supplied 390px boards.

For a changed interaction, inspect the affected screen and relevant error state at desktop and mobile. Try keyboard navigation when controls, focus, or the question renderer change. Do not require visual snapshots or a whole-app accessibility audit for every small copy or CSS change.

## 7. How an AI agent adds UI

Read the active task, its matching supplied design board, and a similar implemented screen. Reuse actual tokens and components, implement only the required behavior, inspect the primary and relevant failure states, and fix observed usability issues. Update [PROGRESS](docs/PROGRESS.md) with evidence and the next task link.

Follow the learning rules in [REQUIREMENTS](docs/REQUIREMENTS.md). Do not add rewards, timers, lesson locks, new navigation, invented metrics, or replacement mockups to make a screen appear more complete.
