import { component, onCleanup } from "@ochairo/beat";
import { derived, pulse } from "@ochairo/pulse";
import { scaleLinear } from "@ochairo/scales";

import type { BeatUiState } from "../../../runtime";

export interface SparklineStyles {
  readonly root?: string;
}

export interface SparklineProps {
  readonly class?: string;
  readonly height?: number;
  readonly stroke?: BeatUiState<string>;
  readonly styles?: SparklineStyles;
  readonly values: BeatUiState<readonly number[]>;
  readonly width?: number;
}

const PADDING = 4;

function buildPath(values: readonly number[], w: number, h: number): string {
  if (values.length < 2) return "";

  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min === 0 ? Math.abs(max) * 0.1 || 1 : (max - min) * 0.1;

  const xScale = scaleLinear([0, values.length - 1], [PADDING, w - PADDING]);
  const yScale = scaleLinear(
    [min - spread, max + spread],
    [h - PADDING, PADDING],
  );

  return values
    .map(
      (v, i) =>
        `${i === 0 ? "M" : "L"}${xScale(i).toFixed(1)},${yScale(v).toFixed(1)}`,
    )
    .join(" ");
}

export const Sparkline = component<SparklineProps>((props) => {
  const w = props.width ?? 120;
  const h = props.height ?? 32;

  const d = derived(props.values, (v) => buildPath(v, w, h));
  const strokeColor = pulse(props.stroke?.get() ?? "currentColor");

  if (props.stroke !== undefined) {
    onCleanup(
      props.stroke.on((event) => {
        strokeColor.set(event.currentValue);
      }),
    );
  }

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
        stroke={strokeColor}
      />
    </svg>
  );
});
