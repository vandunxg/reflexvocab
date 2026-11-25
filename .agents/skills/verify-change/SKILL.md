---
name: verify-change
description: Choose proportionate verification for a ReflexVocab change and prepare an accurate commit or handoff. Use before marking a task done or when deciding whether tests, build, browser checks, or database checks are necessary.
---

# Verify the Changed Risk

Read the active phase task's completion criteria and the change matrix in [CONSTRAINTS](../../../CONSTRAINTS.md). Inspect the actual diff before choosing checks.

1. Name the behavior that changed and the plausible failure it could introduce. Reuse existing evidence when its relevant code, configuration, and environment have not changed.
2. For documentation-only changes, check the changed text, links, and affected contracts. Do not run the app or test pipeline.
3. For a code commit, review the touched code, simplify where useful, and run `npm run check` against the final relevant code state. No refactor is required when the code is already clear.
4. Add a build check when dependencies, build tooling, entry points, asset/module resolution, or release packaging changed. An ordinary component import does not require another build. Inspect changed UI states when the change is visual or interactive.
5. Use focused tests for meaningful domain or integration risks. Select the cheapest evidence that would catch the failure; do not require coverage percentages, snapshots, trivial assertions, or a test per file.
6. For authorization or atomic persistence, use real database evidence when that boundary changed. If the environment is unavailable, record the unverified behavior and leave the affected acceptance criteria open.
7. Update [PROGRESS](../../../docs/PROGRESS.md) with the result, any remaining limitation, and the exact next task link. Report what actually ran; do not claim a mock, specification, or clean build proves product behavior.

Stop when the task's risk is addressed. Do not repeat a full suite after every edit or start a separate audit without a concrete reason. This starter has no feature tests; do not add fake tests just to make a command appear green.
