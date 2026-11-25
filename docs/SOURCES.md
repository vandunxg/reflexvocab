# Sources and How to Use Them

## Product authority

The owner's requirements, explicit conversation decisions, and latest design specification define this project. [DECISIONS](DECISIONS.md) records the current interpretation and marks superseded directions. Letter-only choices such as B or C do not establish an unseen option's exact wording; provisional implementation defaults must remain labeled as defaults.

All normative project documentation is written in English. The earlier supplied requirements have been distilled into [REQUIREMENTS](REQUIREMENTS.md) and [CONTENT](CONTENT.md); the original non-English file is not copied into this starter. The owner's static screen export is supplied in [design](design/README.md). Its Vietnamese UI copy is input for the reviewed `vi` catalog, not an authoritative translation or a change to the English documentation/code language.

## Design and usability references

| Reference                                                                                                                                   | Intended use                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| [Brilliant — Welcome](https://brilliant.org/welcome/?cta_persona=learner)                                                                   | The owner's reference for step-by-step learning, large choices, progress, and the prominent Continue action |
| [Brilliant — About](https://brilliant.org/about/)                                                                                           | The owner's reference for the learning cadence and interaction direction                                    |
| [Evondev UIUX](https://evondev-uiux.vercel.app/)                                                                                            | Read-only input for product-specific usability requirements                                                 |
| [Evondev Kit](https://github.com/evondev/evondevKit)                                                                                        | Upstream material reviewed during the earlier requirements work; do not install or bundle it                |
| [Earlier Linear reference](https://shezan-ali.github.io/linear-ui-clone/)                                                                   | Historical reference only, superseded by the light whole-app Brilliant direction                            |
| [Earlier Linear Figma kit](https://www.figma.com/design/BYskh9RqFgnXf7iZGGr7HA/Linear-UI---Free-UI-Kit--Recreated---Community-?node-id=0-1) | Historical reference only; not the implementation target                                                    |

The earlier Evondev review used `evondevKit` v0.9.3, commit `5a892ceac93d1bb286391663eb01cbd011706886`, including its [UI/UX skill](https://github.com/evondev/evondevKit/blob/5a892ceac93d1bb286391663eb01cbd011706886/skills/ui-ux/SKILL.md) and [flow reference](https://github.com/evondev/evondevKit/blob/5a892ceac93d1bb286391663eb01cbd011706886/skills/ui-ux/references/flows.md). The result is [UI_UX_REQUIREMENTS](UI_UX_REQUIREMENTS.md), adapted to this application's requirements. External approval loops, mandatory audit routines, scripts, and skill assets are not imported.

The tokens in [DESIGN](../DESIGN.md) are project-specific choices based on the owner's specification, not official Brilliant tokens. Do not copy proprietary branding, fonts, illustrations, or educational content.

## Technical references

Use the installed version's documentation and types when implementation begins. A link to current documentation is not proof that a future dependency version or proposed feature has been implemented.

| Primary reference                                                                                    | Relevant boundary                                                                  |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [React documentation](https://react.dev/learn)                                                       | Components, state, effects, and accessibility through semantic markup              |
| [Vite guide](https://vite.dev/guide/)                                                                | Local development, builds, and runtime requirements                                |
| [Vite environment variables](https://vite.dev/guide/env-and-mode)                                    | Public browser configuration and environment handling                              |
| [Supabase JavaScript reference](https://supabase.com/docs/reference/javascript/introduction)         | SDK integration when the data phase starts                                         |
| [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) | Enforce access to learner-owned data                                               |
| [Supabase Auth configuration](https://supabase.com/docs/guides/auth/general-configuration)           | Private account access and hosted configuration                                    |
| [Supabase database functions](https://supabase.com/docs/guides/database/functions)                   | Atomic database operations and execution privileges                                |
| [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs)                                         | Future scheduling integration behind a thin wrapper; not installed in this starter |
| [MDN SpeechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)              | Browser TTS voices, lifecycle, and availability                                    |

Dependency versions for the delivered scaffold are pinned in `package.json` and `package-lock.json`. Verification evidence is in [VERIFICATION](VERIFICATION.md). Recheck upstream behavior when implementing or upgrading the relevant integration, rather than treating this source list as a permanent API guarantee.
