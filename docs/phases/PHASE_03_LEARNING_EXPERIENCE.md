# P03 — Learning experience

## Purpose

Turn the data and domain boundaries into one usable learning session. The entire product follows the bright, colorful, youthful direction in [DESIGN.md](../../DESIGN.md); session and onboarding screens use a focused version of that system.

Use [FLOWS.md](../FLOWS.md) for interaction order and [ADAPTERS.md](../ADAPTERS.md) for external boundaries. Product-screen composition requires the relevant design board in `docs/design/`; a written style direction alone does not authorize inventing that screen. Record a concrete missing-board blocker when reached and continue independent domain, token or primitive work. Record execution only in [PROGRESS.md](../PROGRESS.md). Do not expand a UI task into a new component framework.

<a id="p03-t01"></a>

## P03-T01 — Build the shared visual, i18n and application shell foundations

**Outcome / problem:** Product screens share a coherent visual language, translation system and navigation while learning stays focused and easy to operate.

**Requirement references:** [R04 — Guided freedom](../REQUIREMENTS.md#r04-guided-freedom), [R23 — Design and accessibility](../REQUIREMENTS.md#r23-design-and-accessibility), [R24 — Agent workflow and quality](../REQUIREMENTS.md#r24-agent-workflow-and-quality), [R25 — Mandatory internationalization](../REQUIREMENTS.md#r25-mandatory-internationalization).

**Dependencies:** [P00-T03](PHASE_00_FOUNDATION.md#p00-t03). Generic tokens/primitives can proceed alongside P01 after contracts and file ownership are agreed. Application-shell/sign-in composition requires the relevant supplied boards; functional sign-in also requires [P01-T02](PHASE_01_DATA_AND_PRIVATE_ACCESS.md#p01-t02).

**Implementation steps:**

1. Read DESIGN and the actual references in `docs/design/`. Identify the board for each screen being composed; do not invent absent boards or claim fidelity without the reference. If a required board is absent, limit work to independent generic tokens/primitives and record the precise missing input.
2. Establish a small set of tokens and reusable primitives for typography, color, spacing, buttons, form fields, feedback and empty/loading states; reuse the scaffold where appropriate.
3. Add `i18next` with `react-i18next` at the application composition root. Create semantic `en` and `vi` catalogs, English fallback, safe interpolation/pluralization and a small key-parity check; keep reviewed learning content outside these catalogs.
4. Compose the reviewed sign-in surface and connect the P01 authentication operations. Build desktop top navigation and mobile bottom navigation for implemented product surfaces, adding routes as their feature tasks land. Keep session and onboarding navigation focused, with a clear exit/back action; do not add mock pages for missing features.
5. Support visible keyboard focus, readable contrast, semantic controls and reduced motion. Localize visible and accessibility copy, and keep both locale layouts usable when labels wrap.

**Suggested files:** `src/app/App.tsx`, `src/app/AuthGate.tsx`, `src/i18n.ts`, `src/locales/en.ts`, `src/locales/vi.ts`, a locale-parity check, a sign-in surface, `src/components/`, `src/styles.css` or a small styles directory, `src/pages/` as features are implemented.

**Acceptance:** Sign-in uses the implemented authentication boundary; navigation works for implemented routes on desktop/mobile; focused layouts omit distracting primary navigation. Every implemented string and accessible label resolves in `en` and `vi`, unsupported locales fall back to English, and catalogs have matching keys. Repeated controls follow the supplied boards and written design constraints. Generic tokens alone do not complete this task. No fake statistics, nonfunctional controls or speculative theme framework are introduced.

**Risk-targeted verification:** Run the locale-key parity check. Inspect sign-in/navigation in `en` and `vi` at a representative desktop and narrow mobile width; use keyboard navigation for the changed controls. Check fallback for one unsupported locale and review actual content wrapping/focus visibility. Do not add global CSS snapshot tests or a compulsory viewport matrix.

<a id="p03-t02"></a>

## P03-T02 — Implement the five exercise interactions

**Outcome / problem:** Learners can understand new material, answer in context and receive clear feedback using touch, mouse or keyboard.

**Requirement references:** [R05 — Exercise types](../REQUIREMENTS.md#r05-exercise-types), [R07 — Adaptive difficulty](../REQUIREMENTS.md#r07-adaptive-difficulty), [R08 — Progressive immersion](../REQUIREMENTS.md#r08-progressive-immersion), [R11 — Mistake recovery](../REQUIREMENTS.md#r11-mistake-recovery), [R20 — Reflex training](../REQUIREMENTS.md#r20-reflex-training).

**Dependencies:** [P03-T01](#p03-t01), [P02-T04](PHASE_02_LEARNING_CORE.md#p02-t04), content from P01-T04.

**Implementation steps:**

1. Build reusable renderers for definition choice, cloze choice, typing cloze, collocation and sentence chunks under one question/feedback flow.
2. Introduce an unfamiliar sense in context before its first recall attempt. Keep English primary and offer progressive Vietnamese support when requested.
3. Pass answer, hint, reveal and retry metadata into the domain transition. A hint that exposes the correct definition must be classified as a reveal for that exercise.
4. Shuffle choice presentation once per question, preserve native keyboard behavior, allow chunk removal/reset, and prevent a rapid second submission from skipping feedback.
5. Record response time only when valid; interrupted/backgrounded questions do not create misleading speed evidence. Keep normal learning untimed.

**Suggested files:** `src/features/session/Question.tsx`, `src/features/session/`, `src/pages/SessionPage.tsx`, shared UI primitives.

**Acceptance:** All five kinds work without drag-and-drop requirements; hints and revealed answers cannot masquerade as independent recall. Feedback explains the answer in context and is not communicated by color alone.

**Risk-targeted verification:** Exercise each distinct interaction once during initial implementation, including typing submission and keyboard chunk selection. Add a focused regression only for a meaningful risk such as revealed-answer metadata or double-submit behavior; avoid one test per presentational component.

<a id="p03-t03"></a>

## P03-T03 — Connect saving, retry and session resume

**Outcome / problem:** The learner sees prompt feedback while the application accurately distinguishes an answered question from a durably saved result.

**Requirement references:** [R06 — Interleaved sessions](../REQUIREMENTS.md#r06-interleaved-sessions), [R14 — Incremental persistence](../REQUIREMENTS.md#r14-incremental-persistence).

**Dependencies:** [P03-T02](#p03-t02), [P01-T03](PHASE_01_DATA_AND_PRIVATE_ACCESS.md#p01-t03), [P02-T04](PHASE_02_LEARNING_CORE.md#p02-t04).

**Implementation steps:**

1. Load account state into one modest application provider; derive page values instead of maintaining duplicate counters.
2. Persist a new session before entering it. After an answer, show local feedback and submit the exact transition payload through the repository.
3. Enable the next question only after a successful save. Preserve the same attempt ID/payload for retry and distinguish network failure from a revision conflict.
4. Resume from the saved cursor after reload or another device's successful update. Offer reload/recovery for conflicts; explain unsaved-exit risk without promising offline durability.
5. Show a completion summary based on the recorded attempts, separating first attempts and recovery practice.

**Suggested files:** `src/app/LearningProvider.tsx`, `src/pages/SessionPage.tsx`, `src/components/StartPractice.tsx`, repository integration.

**Acceptance:** A saved answer survives reload; a failed save is not announced as synced; retries do not double-count. Stale sessions have an actionable recovery path, and completion is not labeled mastery.

**Risk-targeted verification:** Follow answer → save → reload/resume and the affected save-failure/conflict path. Use one meaningful browser regression if it protects this integration boundary. Reuse repository transaction evidence instead of re-running all SQL cases after a copy/style edit.

<a id="p03-t04"></a>

## P03-T04 — Add Browser TTS through the audio boundary

**Outcome / problem:** Learners can hear English content now, while future voice providers can be integrated without coupling exercise UI to them.

**Requirement references:** [R15 — Audio](../REQUIREMENTS.md#r15-audio), [R18 — Settings](../REQUIREMENTS.md#r18-settings).

**Dependencies:** [P03-T02](#p03-t02), audio contract in [ADAPTERS.md](../ADAPTERS.md), settings model from P01-T01.

**Implementation steps:**

1. Implement the small AudioAdapter with voice listing/subscription, speak and stop behavior using the browser's speech synthesis capability.
2. Handle late-loaded voices, missing previously selected voices and unsupported devices. Keep text exercises usable when audio is unavailable.
3. Add reusable playback controls with voice/rate preferences and stop active speech on question or route changes.
4. Ensure pre-answer playback reads the intended prompt only; playing an answer must use the same reveal semantics as showing it.

**Suggested files:** `src/features/audio/browser-audio.ts`, a shared playback control, session integration.

**Acceptance:** Available English voices can be selected; fallback and failure are understandable; stop/route changes prevent old audio from leaking into a new question. The interface does not require a cloud account or a plugin registry.

**Risk-targeted verification:** Try play/stop and missing-voice fallback on the actual target browser. Verify the unsupported-device path if relevant. Inspect the prompt passed before an answer; do not mock every browser voice or build adapters for providers not being used.
