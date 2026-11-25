# Engineering Rules and Proportionate Verification

Use the smallest design that supports the current MVP behavior and leaves a clear boundary for the next known integration. A boundary is useful when an external dependency may change; it does not require a framework.

## 1. Code and architecture

- Use React with strict TypeScript. Keep data shapes explicit and avoid `any`; narrow `unknown` at input boundaries.
- Keep feature logic with its feature. Extract pure learning functions when there is real domain behavior to isolate.
- Reuse actual components and tokens before adding another implementation. Keep readable local code until sharing has a concrete benefit.
- Start with component state and small contexts where needed. Add a store or data-fetching library only for a demonstrated coordination problem.
- Prefer native semantic controls. Add a maintained accessible primitive when implementing a complex interaction; do not build accessibility machinery from scratch or import a whole UI system for one button.
- Use stable keys, clean up subscriptions and audio, and handle loading, empty, and failure states near the relevant interaction.
- Use one light design token set. Follow supplied boards; do not add stock gradients, generic dashboard cards, fake metrics, reward badges, or unrelated navigation.
- Internationalize every feature through the shared i18n instance. No hard-coded user-facing labels, validation/errors, empty states or accessibility text; every changed key must exist in reviewed `en` and `vi` catalogs with English fallback.
- Keep the three planned boundaries small: audio, learning persistence, and scheduling. Add a second provider only when needed; no plugin framework, dependency-injection container, event bus, microservices, or offline sync engine for this MVP.
- Keep secrets on trusted servers. Use RLS for user-owned records. Validate a changed boundary once at the correct layer; avoid repeating the same validation at every internal function.
- Refactor the code touched by the task when it removes duplication or makes behavior clearer. Do not refactor unrelated files or force a new abstraction before each commit.

## 2. Checks follow the change

The phase task defines acceptance. This matrix selects how to verify it. Checks run at a useful boundary, usually before a code commit or handoff, not after every edit.

| Change                                    | Sufficient default verification                                                                                | Add only when relevant                                                                                                                                        |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Docs, instructions, task descriptions     | Read the changed text and affected references                                                                  | Cross-document consistency when a requirement or contract changes                                                                                             |
| Small UI copy or CSS change               | Inspect the affected screen/state; check the relevant narrow layout if it can change                           | Keyboard check if controls/focus changed; no full-app run                                                                                                     |
| UI copy or locale behavior                | Run locale-key parity and inspect the changed state in `en` and `vi`                                           | Unsupported-locale fallback, plural/date formatting and narrow-layout checks where affected                                                                   |
| React/TypeScript code                     | `npm run check` before the code commit; inspect the changed behavior                                           | Production build for build settings, dependencies, entry points, asset/module resolution, or release; ordinary component imports do not need a separate build |
| Learning rules or session behavior        | `npm run check` plus focused cases for the failure risks introduced                                            | A regression test for a non-obvious bug or important evidence/scheduling boundary                                                                             |
| Schema, authentication, RLS, atomic saves | `npm run check` if app code changed; verify the changed database contract in a disposable development database | Two-user isolation, unauthorized writes, retry/conflict behavior, and migration checks where touched                                                          |
| Private release                           | Production build and one representative end-to-end learning/save/resume path                                   | Deployment routing, actual auth configuration, and the core security/data checks not already evidenced for the release                                        |

**Always type-check code before committing it.** Do not re-run a passed check when only unrelated Markdown changed afterward. A relevant code or configuration change invalidates the affected earlier result. SQL-only work needs database verification rather than an irrelevant frontend type check. Formatting is a tool, not a new approval gate; format touched files without rewriting the whole repository during unrelated tasks.

A missing credential or database is a real limitation: do not claim the corresponding integration was verified. Finish independent work and record exactly which task still needs that environment. Do not call a requirement implemented because a mock passed.

## 3. Tests must protect meaningful behavior

Before adding a test, be able to finish this sentence: **“This catches a plausible regression that would …”** Use a short explanation in the task or code review only when the value is not obvious. A separate test plan document is unnecessary.

Useful candidates for this application:

- A revealed answer must not become independent recall or incorrectly increase mastery.
- A timed-out save retried with the same request must not create a second attempt or advance the session twice.
- One learner must not read or modify another learner's progress.
- A retry must respect its bound, and an unfinished session must restore the same question.
- A timezone boundary must not spend the next day's new-word quota prematurely.

Do not add tests for UUID equality, a constant returning itself, trivial setters, library behavior already owned by that library, duplicated implementation details, or snapshots that merely freeze markup. Do not mock every layer until the test only asserts that the mocks agree.

There is no coverage target, minimum test count, test-per-function rule, mandatory TDD, or requirement to add tests to every patch. Add a unit test for nontrivial domain logic, an integration test for a boundary, or one browser flow for a critical user path when that is the cheapest reliable evidence. Fix an important bug with a focused regression test when one would catch its return. Do not install three test frameworks for a blank scaffold.

## 4. Stop when the risk is addressed

Once the required behavior is evidenced and the relevant checks pass, finish the task. Expand verification only to resolve a concrete remaining uncertainty or a changed contract. Do not turn a small change into a full accessibility audit, visual regression project, dependency audit, or performance benchmark.

Before a code commit: inspect the diff, simplify where useful, type-check and lint, and run the selected behavior check. Record the result in [PROGRESS](docs/PROGRESS.md). “Reviewed; no useful refactor needed” is a valid outcome. The starter includes no compulsory Git hook or CI gate; add automation later only to remove recurring manual work.
