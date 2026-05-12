import { component } from "@ochairo/beat";
import { derived } from "@ochairo/pulse";
import { scaleLinear } from "@ochairo/scales";

import type { BeatUiReadonlyState } from "../../../runtime";

const PULSE_BRAND = Symbol.for("@ochairo/pulse.brand");

export interface SparklineStyles {
  readonly root?: string;
}

export interface SparklineProps {
  readonly class?: string;
  readonly height?: number;
  readonly stroke?: BeatUiReadonlyState<string> | string;
  readonly styles?: SparklineStyles;
  readonly values: BeatUiReadonlyState<readonly number[]> | readonly number[];
  readonly width?: number;
}

function isReadonlyState<TValue>(
  value: BeatUiReadonlyState<TValue> | TValue | undefined,
): value is BeatUiReadonlyState<TValue> {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const maybeState = value as {
    readonly [PULSE_BRAND]?: unknown;
    readonly get?: unknown;
    readonly on?: unknown;
  };

  return (
    maybeState[PULSE_BRAND] === true &&
    typeof maybeState.get === "function" &&
    typeof maybeState.on === "function"
  );
}

const PADDING = 4;

function buildPath(values: readonly number[], w: number, h: number): string {
  const length = values.length;
  if (length < 2) {
    return "";
  }

  let min = values[0] ?? 0;
  let max = min;
  for (let index = 1; index < length; index += 1) {
    const value = values[index] ?? 0;
    if (value < min) {
      min = value;
    }
    if (value > max) {
      max = value;
    }
  }

  const spread = max - min === 0 ? Math.abs(max) * 0.1 || 1 : (max - min) * 0.1;
  const domainMin = min - spread;
  const domainMax = max + spread;
  const innerHeight = h - PADDING * 2;
  const xScale = scaleLinear([0, length - 1], [PADDING, w - PADDING]);
  const yRatio = innerHeight / (domainMax - domainMin || 1);

  let path = "";
  for (let index = 0; index < length; index += 1) {
    const value = values[index] ?? 0;
    const x = length === 1 ? PADDING : xScale(index);
    const y = h - PADDING - (value - domainMin) * yRatio;
    path += `${index === 0 ? "M" : " L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }

  return path;
}

export const HlSparkline = component<SparklineProps>((props) => {
  const w = props.width ?? 120;
  const h = props.height ?? 32;

  const d = isReadonlyState(props.values)
    ? derived(props.values, (v) => buildPath(v, w, h))
    : buildPath(props.values, w, h);
  const stroke = isReadonlyState(props.stroke)
    ? props.stroke
    : (props.stroke ?? "currentColor");

  const widthAttr = props.width !== undefined ? String(props.width) : undefined;
  const widthStyle = props.width === undefined ? "width:100%" : undefined;
  const baseStyle = `display:block;overflow:visible;flex-shrink:0${widthStyle !== undefined ? `;${widthStyle}` : ""}`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      height={String(h)}
      preserveAspectRatio="none"
      width={widthAttr}
      class={props.class}
      aria-hidden="true"
      style={props.styles?.root ?? baseStyle}
    >
      <path
        fill="none"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        d={d}
        stroke={stroke}
      />
    </svg>
  );
});
