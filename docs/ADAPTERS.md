# Proposed adapter boundaries

The adapter signatures below are design proposals. The shared [learning data types](../src/domain/model.ts) are separate from the adapters. [SDD.md](SDD.md) defines the data and trust boundaries; [PROGRESS.md](PROGRESS.md) tracks what has actually been built.

The first product will separate only **audio**, **learning persistence** and a **thin FSRS wrapper**. Ordinary functions and explicit imports will connect them. There will be no generic adapter base class, dependency injection container, provider discovery registry or interface for every feature.

## 1. Audio boundary

The initial implementation will wrap Browser TTS. A minimal proposed contract is:

```ts
// Proposed contract; not an existing source module.
interface VoiceOption {
  id: string;
  name: string;
  lang: string;
}

interface AudioAdapter {
  readonly supported: boolean;
  listVoices(): VoiceOption[];
  subscribeVoices(listener: () => void): () => void;
  speak(text: string, options?: { voiceId?: string; rate?: number }): Promise<void>;
  stop(): void;
}
```

Browser voice availability can change after initial rendering; the implementation will listen for voice-list updates rather than assume the first list is complete. The underlying API exposes these capabilities through [SpeechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) and `voiceschanged`.

The first adapter will behave as follows:

- It will list available English voices, persist a stable voice preference, and use an available English fallback when the saved voice is missing on another device.
- `speak()` will start from an explicit user action and stop the previous playback before starting another one.
- Completion or cancellation will settle the playback promise. An actual playback error will reject it so the UI can give useful feedback.
- `stop()` will be safe when nothing is playing. Moving to another question, leaving a session or signing out will stop current audio.
- Subscribers will receive an unsubscribe function. Unsupported speech APIs will disable audio controls without disabling learning by text.
- Defaults will be automatic English voice selection and rate `0.9`; Settings will expose a practical supported rate range.

Selecting another browser voice will not require another adapter. The app will bind one audio implementation at a clear composition point and reuse it from audio controls and route/session cleanup.

When a real Listening feature needs consistent pronunciation, reviewed recordings or a cloud provider may replace or extend this implementation. A cloud secret will remain behind a trusted endpoint. If a reviewed recording needs an explicit content/voice/version key, the request shape will be extended at that time; raw text will not be assumed to identify every audio asset uniquely. No audio manifest engine, multi-provider router or cache hierarchy will be built before that feature needs one.

## 2. LearningRepository boundary

The repository will express learning operations, not generic CRUD. A proposed contract is:

```ts
// Proposed repository using AttemptCommit and other shared learning data types.

interface LearningRepository {
  load(): Promise<LearningSnapshot>;
  startSession(session: LearningSession): Promise<void>;
  commitAttempt(change: AttemptCommit): Promise<void>;
  saveSettings(changes: Partial<UserSettings>): Promise<void>;
  setBookmark(senseId: string, saved: boolean): Promise<void>;
}
```

`LearningSnapshot` will contain the signed-in learner's cards, a declared attempt-history window, current session, settings and bookmarks. The history scope will be explicit wherever metrics use it. Read-only catalog loading will be a plain content read function; it will not need a fourth adapter interface.

The first implementation will use Supabase. Authentication will create the repository for the current account; changing accounts will replace it and clear the old snapshot. The server will still derive ownership from Auth, independently of any user ID held in the client.

| Operation       | Required behavior when implemented                                                                                                                |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `load`          | Return committed data; propagate access/network/configuration errors without substituting mock content or local progress.                         |
| `startSession`  | Save the initial queue before use; handle retries without creating duplicate sessions; preserve saved answers when replacing the current session. |
| `commitAttempt` | Atomically save attempt, card and session; resolve only after success; preserve exact-request idempotency and reject stale revisions.             |
| `saveSettings`  | Validate supported changed fields, including `en`/`vi` locale, and merge the patch into that user's settings; omitted values will remain unchanged. |
| `setBookmark`   | Set the desired saved state for one sense. Repeating the same value will be harmless; one word's update will not replace the whole bookmark list. |

Onboarding will send only `dailyMinutes`, `newPerDay` and its minimal completion marker through `saveSettings`. Its topic draft will go into the first `SessionConfig`, never a saved topic-preference field. Saving those onboarding values will not reset locale, voice, rate or timezone. Settings may later save `locale: 'en' | 'vi'` through the same patch boundary. The implementation will validate known patch fields and preserve omitted values, without building a general patch framework.

Session creation will also keep a stable session ID across retries. A repeated create will not rewind an advanced cursor or reactivate an older, replaced session; the client will reload when the current session has moved on.

For `commitAttempt`, the server will match the authenticated attempt ID and original payload before rejecting a stale/current-session revision. This lookup must occur within the serialized mutation boundary, or be repeated after acquiring its lock. An exact committed replay will return the original success acknowledgement even after the session advances; only unseen requests will undergo fresh-transition checks. The proposed `Promise<void>` will resolve for either a new committed write or that prior acknowledgement; it will not imply that every call created a row.

The repository will expose stable distinguishable codes for conflict, invalid-input and recoverable network failures without requiring a general error framework or returning localized prose. The UI will translate those codes and retry the same `AttemptCommit` after an uncertain response. It will not generate another attempt ID or recalculate its timestamp/card while retrying the save.

Authorization, input bounds, content references and transaction constraints will be enforced server-side as described in [SDD.md](SDD.md). Client-side TypeScript will help development but will not validate a request received by the database. The personal-learning trust boundary will allow a client-proposed grading/scheduler result only within that authenticated user's records.

No localStorage, IndexedDB, offline or demo repository will be scaffolded. A future offline requirement will need its own conflict and durability decisions; it will not be introduced as an automatic fallback for Supabase errors.

## 3. FSRS wrapper

The scheduler boundary will be a small function around a maintained library rather than a generic scheduler framework. The implementation task will verify the current library API, pin the selected version in the lockfile and define a serializable card shape.

```ts
// Proposed function; no FSRS dependency or implementation is implied here.
type RecallGrade = 'again' | 'hard' | 'good';

function scheduleRecall(
  card: SerializedCard | undefined,
  grade: RecallGrade,
  now: Date,
): SerializedCard;
```

The wrapper will initialize a card when appropriate, convert persisted date strings to the library's date types, call the scheduler and return a JSON-safe card. A target retention of `0.9` may be the initial named product default; it will not become a promise of measured retention. Implementation details such as scheduler fuzz will be decided explicitly alongside reproducible behavior and documented with that change.

The domain will decide eligibility and the grade before calling this function. Hints, answer reveals, early practice, retry suppression and mastery will not move into the scheduler wrapper. A new wrapper implementation will not redefine learning policy by accident.

When the library version or card shape changes, the task will identify whether stored cards remain compatible. Any necessary conversion will be deliberate; invalid saved cards will not silently reset to new cards. Verification will protect the application's grade/serialization behavior, not re-test the library's mathematics.

## 4. Extension checklist

For a real extension task, the agent will:

1. Identify which existing boundary owns the changing dependency and which current behavior must remain intact.
2. Read the contract and current call sites. If one function or parameter is enough, keep it that small.
3. Implement one useful provider or change and connect it at the existing composition point.
4. Verify the actual failure mode: for example, cancellation for audio, duplicate/rollback for persistence, or saved-card compatibility for FSRS.
5. Update the affected design detail and record results/next action in [PROGRESS.md](PROGRESS.md).

New presets will share session creation. New exercise kinds will extend typed content and their renderer/evaluator together. Neither change will create a new learning engine. Adding an interface will require a meaningful external dependency or real alternate implementation, rather than a hypothetical future feature.
