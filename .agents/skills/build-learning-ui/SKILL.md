---
name: build-learning-ui
description: Build or change ReflexVocab screens using owner-supplied designs and the light Brilliant-inspired product specification. Use for navigation, learning interactions, responsive behavior, and UI states.
---

# Build the Supplied Screen

Read [DESIGN](../../../DESIGN.md), the relevant [UI/UX requirements](../../../docs/UI_UX_REQUIREMENTS.md), and the matching supplied file indexed in [design](../../../docs/design/README.md). Inspect a similar implemented screen and actual shared components.

- Implement the active task and its supplied composition. Do not generate wireframes or replacement mockups. If the needed board is absent, record that specific dependency in [PROGRESS](../../../docs/PROGRESS.md).
- Use the one light token set. Add shared tokens and basic components only as the first real screens need them. Reuse their actual implementation afterward; do not build a parallel UI kit.
- Keep one prominent primary action. Use the desktop top navigation and mobile bottom navigation for main screens; use focus mode for onboarding and sessions.
- Preserve real data, evidence labels, save states, and text/audio fallbacks. Show useful empty states instead of fake metrics. Keep supported answers distinct from independent recall.
- Use semantic controls, labels, visible focus, text feedback, reduced motion, and usable touch targets. Stop speech on exit. Keep long content clear of the bottom action.
- Inspect the changed screen at a desktop and a relevant narrow width. Try the keyboard if focus, controls, or question interactions changed. Inspect the relevant failure state, not every app state by default.

Use [CONSTRAINTS](../../../CONSTRAINTS.md) for verification and commit checks. Do not add rewards, decorative gradients, sidebars, global search, visual snapshot gates, or mandatory five-viewport audits. The owner may install Evondev separately; this guide neither installs nor vendors that skill.
