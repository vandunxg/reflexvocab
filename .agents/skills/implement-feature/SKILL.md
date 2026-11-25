---
name: implement-feature
description: Implement a ReflexVocab task from its phase specification. Use when adding a feature or continuing the next task recorded in the project progress file.
---

# Implement a Phase Task

1. Read [AGENTS](../../../AGENTS.md) and [PROGRESS](../../../docs/PROGRESS.md). Follow the current task's exact phase link. If the user selected a different task, use that explicit scope and record the change.
2. Read the task's linked requirements and contracts. Inspect existing code before deciding which files to add. Treat proposed directories and component names as suggestions until they actually exist.
3. State the intended behavior and the main failure risk briefly. Use the task's existing completion criteria; do not create another plan document, approval loop, or duplicate status board.
4. Implement the smallest complete behavior. Reuse existing components and functions. Add a new boundary only for a real dependency or shared behavior. Keep unrelated cleanup out of the task.
5. Handle the states that the task exposes: loading, empty, success, failure, and recovery where relevant. Follow [DESIGN](../../../DESIGN.md) and the supplied boards for UI work.
6. Review the diff and simplify code where useful. Apply the relevant checks from [CONSTRAINTS](../../../CONSTRAINTS.md), including `npm run check` before a code commit. Add tests only for a plausible, material regression.
7. Update `PROGRESS.md`: what was completed, evidence, unresolved limitations, and the next exact phase/task link. Keep implementation steps and acceptance definitions in the phase file.

If missing input blocks this task, finish independent work and record the specific dependency. Do not implement a substitute UI or silently expand the MVP. For documentation-only tasks, review the relevant text and links; do not run the application pipeline.
