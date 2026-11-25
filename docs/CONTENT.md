# Vocabulary content strategy

The intended dataset combines frequency-informed sequencing with TOEIC topics, contextual meanings, and collocations. The eventual target is approximately 1,000 reviewed learning items. **No vocabulary dataset, sample questions, generated seed, or content-import implementation is included in this starter.**

This document specifies future authoring work. [PLAN.md](PLAN.md) locates the relevant phase tasks; [PROGRESS.md](PROGRESS.md) tracks execution. Content must satisfy [REQUIREMENTS.md](REQUIREMENTS.md), especially R03, R05, R10, and R21.

## 1. Unit of learning

A sense is one meaning of a word or phrase. Keep its ID stable when correcting wording; assign a new ID when the meaning itself changes. Report sense counts separately from unique headword counts once a dataset exists.

| Information                    | Authoring requirement                                                                         |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| Stable sense ID                | Independent of array position and display order                                               |
| Word/phrase and part of speech | Match the specific meaning being taught                                                       |
| English definition             | Clear and easier than the target item where possible                                          |
| Optional Vietnamese gloss      | On-demand support, not the default exercise language                                          |
| Pronunciation/IPA              | Verified and consistent with the chosen accent convention; do not invent missing data         |
| Topic and editorial level      | One primary grouping/order; distinguish editorial classification from verified frequency data |
| Contexts and examples          | Distinct, natural situations; provide enough variety for later independent recall             |
| Collocations                   | Useful, natural combinations for that meaning                                                 |
| Source and version             | Traceable to an original or appropriately licensed batch/source record                        |

Word family information is optional when useful. Do not expand the schema or fill fields merely to make every record equally large.

## 2. Reviewed exercise content

An exercise needs a stable ID, sense ID, context ID, prompt, explanation, and explicit answer representation. These are design requirements for the future model, not existing TypeScript contracts.

| Exercise              | Content to prepare                                  | Editorial risk to check                                                  |
| --------------------- | --------------------------------------------------- | ------------------------------------------------------------------------ |
| Definition matching   | Choices and a correct choice ID                     | Multiple meanings accidentally make another choice valid                 |
| Multiple-choice cloze | Context, alternatives, correct choice ID            | A distractor also fits the meaning and grammar                           |
| Typing cloze          | Context and accepted answer variants                | An ordinary spelling variant is rejected, or an invalid form is accepted |
| Collocation matching  | Prompt, options/pairs, and the intended combination | More than one combination is natural without additional context          |
| Sentence building     | Chunk IDs and a valid order                         | Another grammatical order is rejected, or repeated chunks lose identity  |

A `contextId` represents the underlying situation/example, not the question ID. Rephrasing two questions around the same example does not create two independent mastery contexts. Keep answers hidden until feedback or an intentional reveal; a definition hint can itself reveal a definition-matching answer and must be recorded accordingly.

Runtime generation means selecting and shuffling approved material. It does not mean inventing distractors, substituting arbitrary words into templates, or calling a model to grade learner answers.

## 3. Dataset scope and provenance

Use Foundation → Intermediate → Advanced as editorial groupings. Candidate topics include office work, meetings, recruitment, travel, finance, and logistics; they are planning categories, not an installed catalog. The starting topic comes from the first editorially recommended item in the eventual curriculum, not a fabricated slug.

Where frequency, CEFR, coverage, or TOEIC relevance is claimed, retain the supporting source and describe its scope. Without such support, use an honest editorial label such as “recommended starting order.” Do not invent precise frequency ranks or imply endorsement by an exam provider.

Record a batch's source, attribution, reuse terms, and modifications. Use original or appropriately licensed examples and explanations. Do not import proprietary exam questions merely to reach a numeric target. The 1,000-item goal is a roadmap direction, not a release gate; a useful smaller reviewed batch can support an initial private trial.

## 4. A small-batch workflow

1. Choose one topic and level with enough senses for a coherent learning sequence.
2. Establish sources and reuse terms before importing content.
3. Draft definitions, optional glosses, examples, collocations, and exercises. AI may assist offline.
4. Check structure: IDs, references, exercise kind, answer membership, chunk identity/order, and non-empty accepted answers.
5. Review meaning, naturalness, ambiguity, distractors, and explanations. Structural validity does not establish language quality.
6. When the learning UI exists, preview representative and doubtful items there; resolve confusing interaction or wording.
7. Publish the reviewed batch through the eventual import mechanism with stable IDs and a recorded version.

Build a small content validator when the first real batch needs it; do not create a CMS, content-generation queue, or multiple model adapters in advance. Recheck the changed batch and affected references rather than making every UI edit run a complete content audit.

## 5. What automation can establish

| Useful structural checks                          | Needs editorial judgment                            |
| ------------------------------------------------- | --------------------------------------------------- |
| Duplicate IDs or missing sense/context references | Whether contexts are truly different                |
| Correct choice absent from the available options  | Whether another option is also correct              |
| Missing/duplicate chunk IDs or invalid ordering   | Whether another sentence order should be accepted   |
| Empty answers or missing required fields          | Whether the language is natural and appropriate     |
| A sense with no supported exercise                | Whether exercise variety supports meaningful recall |

No AI language-quality score or arbitrary coverage threshold replaces reading the actual content. Testing effort should follow a concrete failure mode.

## 6. Audio preparation

Browser TTS will initially read the English text supplied by the content. It does not establish identical pronunciation across devices. Later Listening content can use reviewed audio with an exact transcript and stable content/voice/version identifiers through the boundary in [ADAPTERS.md](ADAPTERS.md).

Add asset metadata when that integration is undertaken; do not bundle nonexistent audio manifests, provider stubs, or cloud credentials now.

## 7. Corrections after publication

Keep sense IDs for spelling and wording fixes that preserve meaning. Withdraw an ambiguous exercise from new sessions until corrected. Handle a removed or changed exercise in an unfinished session explicitly, preserving acknowledged attempts rather than resetting all progress.

Do not silently regrade history or alter mastery to hide content errors. When a correction materially affects evidence, define a narrow, explainable migration or recovery action as part of that change. Data ownership and persistence behavior are specified in [SDD.md](SDD.md).
