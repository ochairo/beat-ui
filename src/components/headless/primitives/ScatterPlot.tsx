import { component, onCleanup } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";
import { scaleLinear, scaleOrdinal } from "@ochairo/scales";

import type { BeatUiState } from "../../../runtime";

export interface ScatterPlotPoint {
  readonly x: number;
  readonly y: number;
  readonly r?: number;
  readonly label?: string;
}

export interface ScatterPlotSeries {
  readonly label: string;
  readonly points: readonly ScatterPlotPoint[];
  readonly color?: string;
  readonly pointRadius?: number;
}

export interface ScatterPlotStyles {
  readonly root?: string;
  readonly gridLine?: string;
}

export interface ScatterPlotProps {
  readonly class?: string;
  readonly series: BeatUiState<readonly ScatterPlotSeries[]>;
  readonly xLabel?: string;
  readonly yLabel?: string;
  readonly width?: number;
  readonly height?: number;
  readonly padding?: number;
  readonly showGrid?: boolean;
  readonly showPointLabels?: boolean;
  readonly styles?: ScatterPlotStyles;
}

const DEFAULT_COLORS = [
  "var(--beat-ui-color-brand)",
  "#60a5fa",
  "#34d399",
  "#fb923c",
  "#a78bfa",
  "#f472b6",
];

export const ScatterPlot = component<ScatterPlotProps>((props) => {
  const w = props.width ?? 400;
  const h = props.height ?? 300;
  const pad = props.padding ?? 44;
  const padBottom = props.xLabel ? pad + 18 : pad;

  const colorScale = scaleOrdinal(
    DEFAULT_COLORS.map((_, i) => i),
    DEFAULT_COLORS,
  );

  const svgContent = pulse<string>("");

  function rebuild(seriesData: readonly ScatterPlotSeries[]): void {
    if (seriesData.length === 0) {
      svgContent.set("");
      return;
    }

    const allX = seriesData.flatMap((s) => s.points.map((p) => p.x));
    const allY = seriesData.flatMap((s) => s.points.map((p) => p.y));
    const minX = Math.min(...allX);
    const maxX = Math.max(...allX);
    const minY = Math.min(...allY);
    const maxY = Math.max(...allY);

    const xPad = (maxX - minX) * 0.05 || 1;
    const yPad = (maxY - minY) * 0.05 || 1;

    const xScale = scaleLinear([minX - xPad, maxX + xPad], [pad, w - pad]);
    const yScale = scaleLinear(
      [minY - yPad, maxY + yPad],
      [h - padBottom, pad * 0.5],
    );

    const parts: string[] = [];

    // Grid
    if (props.showGrid !== false) {
      const ticks = 4;
      const gridColor = props.styles?.gridLine ?? "var(--beat-ui-color-border)";

      for (let t = 0; t <= ticks; t++) {
        const yVal = minY + ((maxY - minY) * t) / ticks;
        const y = yScale(yVal);
        parts.push(
          `<line x1="${pad}" y1="${y.toFixed(1)}" x2="${w - pad}" y2="${y.toFixed(1)}" stroke="${gridColor}" stroke-width="0.5" stroke-dasharray="4 4" />`,
        );
        parts.push(
          `<text x="${(pad - 6).toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="10" fill="currentColor" opacity="0.5">${yVal % 1 === 0 ? yVal : yVal.toFixed(1)}</text>`,
        );
        const xVal = minX + ((maxX - minX) * t) / ticks;
        const x = xScale(xVal);
        parts.push(
          `<line x1="${x.toFixed(1)}" y1="${(pad * 0.5).toFixed(1)}" x2="${x.toFixed(1)}" y2="${(h - padBottom).toFixed(1)}" stroke="${gridColor}" stroke-width="0.5" stroke-dasharray="4 4" />`,
        );
        parts.push(
          `<text x="${x.toFixed(1)}" y="${(h - padBottom + 14).toFixed(1)}" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.5">${xVal % 1 === 0 ? xVal : xVal.toFixed(1)}</text>`,
        );
      }
    }

    // Axes
    const zeroX = xScale(Math.max(minX - xPad, 0));
    const zeroY = yScale(Math.max(minY - yPad, 0));
    parts.push(
      `<line x1="${pad}" y1="${zeroY.toFixed(1)}" x2="${w - pad}" y2="${zeroY.toFixed(1)}" stroke="currentColor" opacity="0.2" stroke-width="1" />`,
    );
    parts.push(
      `<line x1="${zeroX.toFixed(1)}" y1="${(pad * 0.5).toFixed(1)}" x2="${zeroX.toFixed(1)}" y2="${(h - padBottom).toFixed(1)}" stroke="currentColor" opacity="0.2" stroke-width="1" />`,
    );

    // Axis labels
    if (props.xLabel) {
      parts.push(
        `<text x="${(w / 2).toFixed(1)}" y="${(h - 3).toFixed(1)}" text-anchor="middle" font-size="11" fill="currentColor" opacity="0.5">${props.xLabel}</text>`,
      );
    }
    if (props.yLabel) {
      parts.push(
        `<text x="${8}" y="${(h / 2).toFixed(1)}" text-anchor="middle" font-size="11" fill="currentColor" opacity="0.5" transform="rotate(-90,8,${(h / 2).toFixed(1)})">${props.yLabel}</text>`,
      );
    }

    // Points
    seriesData.forEach((s, si) => {
      const color = s.color ?? (colorScale(si) as string) ?? DEFAULT_COLORS[0]!;
      const defaultR = s.pointRadius ?? 5;

      s.points.forEach((p) => {
        const cx = xScale(p.x);
        const cy = yScale(p.y);
        const r = p.r ?? defaultR;
        parts.push(
          `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r}" fill="${color}" fill-opacity="0.8" />`,
        );
        if (props.showPointLabels && p.label) {
          parts.push(
            `<text x="${(cx + r + 3).toFixed(1)}" y="${(cy + 4).toFixed(1)}" font-size="9" fill="currentColor" opacity="0.6">${p.label}</text>`,
          );
        }
      });
    });

    // Legend
    if (seriesData.length > 1) {
      seriesData.forEach((s, si) => {
        const color =
          s.color ?? (colorScale(si) as string) ?? DEFAULT_COLORS[0]!;
        const lx = pad + si * 90;
        parts.push(
          `<circle cx="${lx + 5}" cy="7" r="4" fill="${color}" fill-opacity="0.8" />`,
        );
        parts.push(
          `<text x="${lx + 14}" y="11" font-size="10" fill="currentColor" opacity="0.7">${s.label}</text>`,
        );
      });
    }

    svgContent.set(parts.join(""));
  }

  onCleanup(
    props.series.on(({ currentValue }) => {
      rebuild(currentValue);
    }),
  );

  rebuild(props.series.get());

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
