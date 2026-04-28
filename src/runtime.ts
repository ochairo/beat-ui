import type { BeatJsxChild } from "@ochairo/beat";
import type { Pulse } from "@ochairo/pulse";

export type BeatUiRenderable = BeatJsxChild;

export type BeatUiState<TValue> = Pulse<TValue>;
