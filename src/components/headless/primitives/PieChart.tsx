import { component, onCleanup } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";
import { scaleOrdinal } from "@ochairo/scales";

import type { BeatUiState } from "../../../runtime";

export interface PieChartSlice {
  readonly label: string;
  readonly value: number;
  readonly color?: string;
}

export interface PieChartStyles {
  readonly root?: string;
}

export interface PieChartProps {
  readonly class?: string;
  readonly slices: BeatUiState<readonly PieChartSlice[]>;
  readonly size?: number;
  readonly donut?: boolean;
  readonly donutThickness?: number;
  readonly showLabels?: boolean;
  readonly showLegend?: boolean;
  readonly styles?: PieChartStyles;
}

const DEFAULT_COLORS = [
  "var(--beat-ui-color-brand)",
  "#60a5fa",
  "#34d399",
  "#fb923c",
  "#a78bfa",
  "#f472b6",
  "#facc15",
  "#2dd4bf",
];

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
  innerR: number,
): string {
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  const s = polarToCartesian(cx, cy, r, startAngle);
  const e = polarToCartesian(cx, cy, r, endAngle);

  if (innerR > 0) {
    const si = polarToCartesian(cx, cy, innerR, endAngle);
    const ei = polarToCartesian(cx, cy, innerR, startAngle);
    return [
      `M${s.x.toFixed(2)},${s.y.toFixed(2)}`,
      `A${r},${r} 0 ${largeArc},1 ${e.x.toFixed(2)},${e.y.toFixed(2)}`,
      `L${si.x.toFixed(2)},${si.y.toFixed(2)}`,
      `A${innerR},${innerR} 0 ${largeArc},0 ${ei.x.toFixed(2)},${ei.y.toFixed(2)}`,
      "Z",
    ].join(" ");
  }

  return [
    `M${cx},${cy}`,
    `L${s.x.toFixed(2)},${s.y.toFixed(2)}`,
    `A${r},${r} 0 ${largeArc},1 ${e.x.toFixed(2)},${e.y.toFixed(2)}`,
    "Z",
  ].join(" ");
}

export const PieChart = component<PieChartProps>((props) => {
  const size = props.size ?? 200;
  const totalH = props.showLegend !== false ? size + 40 : size;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;
  const innerR =
    props.donut !== false
      ? props.donutThickness !== undefined
        ? r - props.donutThickness
        : r * 0.55
      : 0;

  const colorScale = scaleOrdinal(
    DEFAULT_COLORS.map((_, i) => i),
    DEFAULT_COLORS,
  );

  const svgContent = pulse<string>("");

  function rebuild(data: readonly PieChartSlice[]): void {
    if (data.length === 0) {
      svgContent.set("");
      return;
    }

    const total = data.reduce((s, d) => s + d.value, 0);
    if (total === 0) {
      svgContent.set("");
      return;
    }

    const parts: string[] = [];
    let startAngle = 0;

    data.forEach((slice, i) => {
      const color =
        slice.color ?? (colorScale(i) as string) ?? DEFAULT_COLORS[0]!;
      const angle = (slice.value / total) * 360;
      const endAngle = startAngle + angle;

      const d = slicePath(cx, cy, r, startAngle, endAngle, innerR);
      parts.push(`<path d="${d}" fill="${color}" stroke="none" />`);

      if (props.showLabels && angle > 20) {
        const midAngle = startAngle + angle / 2;
        const labelR = innerR > 0 ? (r + innerR) / 2 : r * 0.65;
        const lp = polarToCartesian(cx, cy, labelR, midAngle);
        const pct = ((slice.value / total) * 100).toFixed(0);
        parts.push(
          `<text x="${lp.x.toFixed(2)}" y="${(lp.y + 4).toFixed(2)}" text-anchor="middle" font-size="11" fill="white" font-weight="500">${pct}%</text>`,
        );
      }

      startAngle = endAngle;
    });

    // Legend
    if (props.showLegend !== false) {
      const itemW = Math.min(90, size / Math.min(data.length, 4));
      data.forEach((slice, i) => {
        const color =
          slice.color ?? (colorScale(i) as string) ?? DEFAULT_COLORS[0]!;
        const row = Math.floor(i / 4);
        const col = i % 4;
        const lx = col * itemW;
        const ly = size + 8 + row * 16;
        parts.push(
          `<rect x="${lx}" y="${ly}" width="10" height="10" fill="${color}" rx="2" />`,
        );
        parts.push(
          `<text x="${lx + 14}" y="${ly + 9}" font-size="10" fill="currentColor" opacity="0.7">${slice.label}</text>`,
        );
      });
    }

    svgContent.set(parts.join(""));
  }

  onCleanup(
    props.slices.on(({ currentValue }) => {
      rebuild(currentValue);
    }),
  );

  rebuild(props.slices.get());

  return (
    <svg
      viewBox={`0 0 ${size} ${totalH}`}
      width={String(size)}
      height={String(totalH)}
      class={props.class}
      aria-hidden="true"
      style={
        props.styles?.root ?? "display:block;overflow:visible;flex-shrink:0"
      }
      ref={(el) => {
        const svg = el as SVGElement;
        svgContent.on(({ currentValue }) => {
          svg.innerHTML = currentValue;
        });
        svg.innerHTML = svgContent.get();
      }}
    />
  );
});
