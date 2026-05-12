import { component, onCleanup } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";
import { scaleLinear, scaleOrdinal } from "@ochairo/scales";

import type { BeatUiState } from "../../../runtime";

export interface LineChartSeries {
  readonly label: string;
  readonly values: readonly number[];
  readonly color?: string;
  readonly strokeWidth?: number;
  readonly dashed?: boolean;
  readonly showDots?: boolean;
}

export interface LineChartStyles {
  readonly root?: string;
  readonly gridLine?: string;
}

export interface LineChartProps {
  readonly class?: string;
  readonly series: BeatUiState<readonly LineChartSeries[]>;
  readonly categories?: BeatUiState<readonly string[]>;
  readonly width?: number;
  readonly height?: number;
  readonly padding?: number;
  readonly showGrid?: boolean;
  readonly showLabels?: boolean;
  readonly styles?: LineChartStyles;
}

const DEFAULT_COLORS = [
  "var(--beat-ui-color-brand)",
  "#60a5fa",
  "#34d399",
  "#fb923c",
  "#a78bfa",
  "#f472b6",
];

export const HlLineChart = component<LineChartProps>((props) => {
  const w = props.width ?? 400;
  const h = props.height ?? 240;
  const pad = props.padding ?? 40;

  const colorScale = scaleOrdinal(
    DEFAULT_COLORS.map((_, i) => i),
    DEFAULT_COLORS,
  );

  const svgContent = pulse<string>("");

  function rebuild(
    seriesData: readonly LineChartSeries[],
    cats: readonly string[] | undefined,
  ): void {
    if (seriesData.length === 0) {
      svgContent.set("");
      return;
    }

    const n = seriesData[0]?.values.length ?? 0;
    const categories =
      cats ?? seriesData[0]?.values.map((_, i) => String(i)) ?? [];
    const allValues = seriesData.flatMap((s) => s.values);
    const maxVal = Math.max(...allValues, 0);
    const minVal = Math.min(...allValues, 0);

    const innerW = w - pad * 2;
    const innerH = h - pad * 1.5;

    const xScale = scaleLinear([0, n - 1], [0, innerW]);
    const yScale = scaleLinear(
      [minVal, maxVal === 0 ? 1 : maxVal],
      [innerH, 0],
    );
    const zeroY = pad * 0.5 + yScale(0);

    const parts: string[] = [];

    // Grid lines
    if (props.showGrid !== false) {
      const ticks = 4;
      for (let t = 0; t <= ticks; t++) {
        const val = minVal + ((maxVal - minVal) * t) / ticks;
        const y = pad * 0.5 + yScale(val);
        const color = props.styles?.gridLine ?? "var(--beat-ui-color-border)";
        parts.push(
          `<line x1="${pad}" y1="${y.toFixed(1)}" x2="${w - pad}" y2="${y.toFixed(1)}" stroke="${color}" stroke-width="0.5" stroke-dasharray="4 4" />`,
        );
        parts.push(
          `<text x="${(pad - 6).toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="10" fill="currentColor" opacity="0.5">${val % 1 === 0 ? val : val.toFixed(1)}</text>`,
        );
      }
    }

    // Lines
    seriesData.forEach((s, si) => {
      const color = s.color ?? (colorScale(si) as string) ?? DEFAULT_COLORS[0]!;
      const sw = s.strokeWidth ?? 2;
      const dash = s.dashed ? "stroke-dasharray='6 3'" : "";

      const points = s.values
        .map((v, i) => {
          const x = pad + xScale(i);
          const y = pad * 0.5 + yScale(v);
          return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" ");

      parts.push(
        `<polyline points="${points}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round" ${dash} />`,
      );

      if (s.showDots !== false) {
        s.values.forEach((v, i) => {
          const x = pad + xScale(i);
          const y = pad * 0.5 + yScale(v);
          parts.push(
            `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="${color}" />`,
          );
        });
      }
    });

    // X axis
    parts.push(
      `<line x1="${pad}" y1="${zeroY.toFixed(1)}" x2="${w - pad}" y2="${zeroY.toFixed(1)}" stroke="currentColor" opacity="0.2" stroke-width="1" />`,
    );

    // Category labels
    if (props.showLabels !== false) {
      categories.forEach((cat, i) => {
        const x = pad + xScale(i);
        parts.push(
          `<text x="${x.toFixed(1)}" y="${(h - 8).toFixed(1)}" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.6">${cat}</text>`,
        );
      });
    }

    // Legend
    if (seriesData.length > 1) {
      seriesData.forEach((s, si) => {
        const color =
          s.color ?? (colorScale(si) as string) ?? DEFAULT_COLORS[0]!;
        const lx = pad + si * 90;
        const dash = s.dashed ? `stroke-dasharray='4 2'` : "";
        parts.push(
          `<line x1="${lx}" y1="7" x2="${lx + 12}" y2="7" stroke="${color}" stroke-width="2" ${dash} />`,
        );
        parts.push(
          `<text x="${lx + 16}" y="11" font-size="10" fill="currentColor" opacity="0.7">${s.label}</text>`,
        );
      });
    }

    svgContent.set(parts.join(""));
  }

  onCleanup(
    props.series.on(({ currentValue }) => {
      rebuild(currentValue, props.categories?.get());
    }),
  );

  if (props.categories !== undefined) {
    onCleanup(
      props.categories.on(({ currentValue }) => {
        rebuild(props.series.get(), currentValue);
      }),
    );
  }

  rebuild(props.series.get(), props.categories?.get());

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={props.width !== undefined ? String(w) : undefined}
      height={String(h)}
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
