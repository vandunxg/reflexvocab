---
name: extend-adapter
description: Add or replace a ReflexVocab audio, learning-persistence, or scheduling provider. Use when an external integration needs a small stable boundary without a provider framework.
---

# Extend One Integration Boundary

Read the relevant contract in [ADAPTERS](../../../docs/ADAPTERS.md), its data rules in [SDD](../../../docs/SDD.md), and the active phase task. Inspect the current implementation; the blank starter contains no adapter code.

1. Identify the actual provider-specific detail that would otherwise leak into the UI or domain. Keep a plain function or small interface around that detail.
2. Preserve product semantics while replacing the dependency. Map provider results and errors at the boundary rather than making screens understand provider-specific formats.
3. For audio, preserve language/voice preference, cancellation, asynchronous voice availability, and the explicit unavailable/text fallback. Do not silently claim that Browser TTS or another voice is equivalent to reviewed listening audio.
4. For persistence, preserve authenticated ownership, idempotent retries, revision conflicts, and an atomic accepted answer. A local mock is not evidence that those database guarantees work.
5. For scheduling, keep grading/evidence policy in the domain and dependency-specific card shapes inside the wrapper. Use the installed library's documented API instead of rewriting the algorithm.
6. Verify the changed boundary with its meaningful success and failure cases. Add a contract test only when it protects real behavior. Review, type-check/lint changed code, and update [PROGRESS](../../../docs/PROGRESS.md).

Do not introduce a plugin registry, dependency-injection container, universal base adapter, capability graph, or multiple inactive providers. Extend a contract when the current feature needs it, and change its documentation with that implementation.
