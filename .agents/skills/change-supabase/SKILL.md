---
name: change-supabase
description: Implement or change ReflexVocab Supabase authentication, schema, RLS, or atomic learning saves. Use when a task affects ownership, persistence, migrations, or retry and conflict behavior.
---

# Change the Data Boundary

Read the affected contracts in [SDD](../../../docs/SDD.md), [ADAPTERS](../../../docs/ADAPTERS.md), and [SETUP](../../../docs/SETUP.md). Inspect existing migrations and repository code if present. The starter includes the SDK and an environment template only; it has no database implementation.

1. Identify the affected data and its owner. Derive the learner identity from trusted authentication, not a client-provided user ID. Keep privileged credentials out of the client and `VITE_*` variables.
2. Implement the smallest migration and operation required by the task. Use RLS, appropriate grants, foreign keys, and unique constraints to enforce the changed contract. Keep `SECURITY DEFINER` use deliberate, scoped, and documented if needed.
3. For an accepted answer, preserve the atomic attempt/progress/session update, request idempotency, and revision check. A retry must replay the original result rather than advance progress twice.
4. Preserve failure distinctions the UI needs: unauthenticated, unavailable, invalid input, and session conflict. Do not silently overwrite another session or turn all errors into a generic success.
5. Verify changed database behavior against a disposable development database. Check two-user access when authorization changes and duplicate/conflicting submissions when save behavior changes. Use focused integration cases rather than mocks as proof of RLS.
6. Review the migration and code diff, run the relevant checks, and update [PROGRESS](../../../docs/PROGRESS.md) with actual evidence or the exact unverified environment dependency.

Do not deploy to production, reset an existing database, create users, or change account settings merely because the task describes a future setup. Perform external changes only within the user's authorized scope. Do not add queues, event sourcing, offline synchronization, or a general repository framework for this MVP.
