import { component, onCleanup } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";
import { scaleLinear } from "@ochairo/scales";

import type { BeatUiState } from "../../../runtime";

export interface SparkLineStyles {
  readonly root?: string;
}

export interface SparkLineProps {
  readonly height?: number;
  readonly positive?: BeatUiState<boolean>;
  readonly stroke?: BeatUiState<string>;
  readonly styles?: SparkLineStyles;
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

function autoPositive(values: readonly number[]): boolean {
  if (values.length < 2) return true;
  return values[values.length - 1]! >= values[0]!;
}

export const SparkLine = component<SparkLineProps>((props) => {
  const w = props.width ?? 120;
  const h = props.height ?? 32;

  const initialValues = props.values.get();
  const initialPositive =
    props.positive !== undefined
      ? props.positive.get()
      : autoPositive(initialValues);

  const d = pulse(buildPath(initialValues, w, h));
  const strokeColor = pulse(
    props.stroke?.get() ?? (initialPositive ? "currentColor" : "currentColor"),
  );

  onCleanup(
    props.values.on((event) => {
      d.set(buildPath(event.currentValue, w, h));
      if (props.positive === undefined && props.stroke === undefined) {
        strokeColor.set("currentColor");
      }
    }),
  );

  if (props.stroke !== undefined) {
    onCleanup(
      props.stroke.on((event) => {
        strokeColor.set(event.currentValue);
      }),
    );
  } else if (props.positive !== undefined) {
    onCleanup(
      props.positive.on((event) => {
        strokeColor.set(event.currentValue ? "currentColor" : "currentColor");
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
