---
name: change-learning-rules
description: Change ReflexVocab grading, review scheduling, session selection, retry behavior, or mastery evidence. Use when a change can alter what a learner is shown or what their progress means.
---

# Change Learning Behavior Carefully

Read the affected [requirements](../../../docs/REQUIREMENTS.md), [decisions](../../../docs/DECISIONS.md), and domain contracts in [SDD](../../../docs/SDD.md). Distinguish an agreed behavior from a provisional heuristic; do not present a threshold as a scientifically validated retention guarantee.

1. Identify the observable policy change and the records it affects. Keep one source of truth for the rule instead of duplicating scoring in a component and repository.
2. Preserve the distinctions between correctness, support/reveal, recall evidence, review eligibility, response time, and lesson completion. A correct answer with revealed content must not count as independent recall.
3. Check how the change interacts with bounded retries, new-word quota in the learner's timezone, first exposure, early practice, and resumed sessions. Consider only the interactions relevant to the change.
4. Use a mature scheduling implementation behind the small wrapper. Keep session selection and evidence rules as readable functions; avoid a generic learning-engine framework.
5. Select a few meaningful boundary cases that would expose a wrong policy. Add or update focused tests for nontrivial behavior. Do not add tests for constants, UUID generation, or every trivial helper.
6. Review the touched logic, run the relevant checks, and update the contract or decision if it changed. Record evidence and the next task in [PROGRESS](../../../docs/PROGRESS.md).

Never increase mastery merely for completing a session, answering faster, repeating a just-revealed item, or replaying a save request. Do not add hidden timers, placement requirements, or lesson locks outside the active product scope.
