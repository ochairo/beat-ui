import type { BeatJsxChild } from "@ochairo/beat";
import type { Pulse, ReadonlyPulse } from "@ochairo/pulse";

export type BeatUiRenderable = BeatJsxChild;

export type BeatUiState<TValue> = Pulse<TValue>;
export type BeatUiReadonlyState<TValue> = Pulse<TValue> | ReadonlyPulse<TValue>;
