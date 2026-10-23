import { render, type BeatJsxChild } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";
import { afterEach, describe, expect, it } from "vitest";

import {
  AreaChart,
  BarChart,
  LineChart,
  PieChart,
  ScatterPlot,
  type AreaChartSeries,
  type LineChartSeries,
  type PieChartSlice,
  type ScatterPlotSeries,
} from "../../src";

const literalText = `東京 &amp; <雪> "double" 'single' 😀`;
const injectedText = `${literalText}</text><script>void 0</script><g data-chart-injected="text" onload="void 0"></g><text>`;
const injectedColor = `red &amp; 'single'" onload="void 0" data-chart-injected="color"><script>void 0</script><g fill="blue`;
const cssColor = "var(--chart-series, #1a2b3c)";
const cleanups: (() => void)[] = [];

afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) cleanup();
});

function mount(chart: BeatJsxChild): HTMLDivElement {
  const target = document.createElement("div");
  cleanups.push(render(target, chart));
  return target;
}

function expectLiteralText(target: HTMLElement, value: string): void {
  expect(Array.from(target.querySelectorAll("text"), (el) => el.textContent))
    .toContain(value);
}

function expectAttributeCount(
  target: HTMLElement,
  selector: string,
  attribute: string,
  value: string,
  count: number,
): void {
  const matches = Array.from(target.querySelectorAll(selector)).filter(
    (element) => element.getAttribute(attribute) === value,
  );
  expect(matches).toHaveLength(count);
}

function expectNoInjectedMarkup(target: HTMLElement): void {
  expect(target.querySelector("script, foreignObject, [data-chart-injected]"))
    .toBeNull();
  const elements = Array.from(target.querySelectorAll("*"));
  expect(elements.length).toBeGreaterThan(1);
  for (const element of elements) {
    expect(element.namespaceURI).toBe("http://www.w3.org/2000/svg");
    expect(element.getAttributeNames().filter((name) => /^on/i.test(name)))
      .toEqual([]);
  }
}

describe("chart SVG interpolation boundaries", () => {
  describe.each([
    { name: "AreaChart", Chart: AreaChart, fills: 2, strokes: 1 },
    { name: "BarChart", Chart: BarChart, fills: 3, strokes: 0 },
    { name: "LineChart", Chart: LineChart, fills: 2, strokes: 2 },
  ])("$name", ({ Chart, fills, strokes }) => {
    it.each(["initial render", "reactive update"])(
      "keeps labels, categories, colors and grid colors literal on %s",
      (phase) => {
        const hostileInitially = phase === "initial render";
        const label = `Series ${injectedText}`;
        const category = `Category ${injectedText}`;
        const hostileSeries: readonly AreaChartSeries[] = [
          { label, values: [1, 3], color: injectedColor },
          { label: literalText, values: [2, 4], color: cssColor },
        ];
        const series = pulse<readonly AreaChartSeries[]>(
          hostileInitially
            ? hostileSeries
            : [{ label: "Original", values: [1, 2], color: cssColor }],
        );
        const categories = pulse<readonly string[]>(
          hostileInitially ? [category, literalText] : ["Before", literalText],
        );
        const target = mount(
          <Chart
            series={series}
            categories={categories}
            styles={{ gridLine: injectedColor }}
          />,
        );

        if (!hostileInitially) {
          expectLiteralText(target, "Before");
          series.set(hostileSeries);
          categories.set([category, literalText]);
        }

        expectLiteralText(target, label);
        expectLiteralText(target, category);
        expectLiteralText(target, literalText);
        expectAttributeCount(target, "[fill]", "fill", injectedColor, fills);
        expectAttributeCount(target, "[fill]", "fill", cssColor, fills);
        // Five grid lines plus the series and legend strokes, when present.
        expectAttributeCount(target, "[stroke]", "stroke", injectedColor, 5 + strokes);
        expectAttributeCount(target, "[stroke]", "stroke", cssColor, strokes);
        expectNoInjectedMarkup(target);
      },
    );
  });

  describe("PieChart", () => {
    it.each(["initial render", "reactive update"])(
      "keeps slice labels and colors literal on %s",
      (phase) => {
        const hostileInitially = phase === "initial render";
        const hostileSlices: readonly PieChartSlice[] = [
          { label: injectedText, value: 1, color: injectedColor },
          { label: literalText, value: 3, color: cssColor },
        ];
        const slices = pulse<readonly PieChartSlice[]>(
          hostileInitially
            ? hostileSlices
            : [{ label: "Original", value: 1, color: cssColor }],
        );
        const target = mount(<PieChart slices={slices} showLabels />);

        if (!hostileInitially) {
          expectLiteralText(target, "Original");
          slices.set(hostileSlices);
        }

        expectLiteralText(target, injectedText);
        expectLiteralText(target, literalText);
        expectLiteralText(target, "25%");
        expectLiteralText(target, "75%");
        expectAttributeCount(target, "path, rect", "fill", injectedColor, 2);
        expectAttributeCount(target, "path, rect", "fill", cssColor, 2);
        expect(target.querySelectorAll("path")).toHaveLength(2);
        expectNoInjectedMarkup(target);
      },
    );
  });

  describe("ScatterPlot", () => {
    it.each(["initial render", "reactive update"])(
      "keeps point, axis and series labels and colors literal on %s",
      (phase) => {
        const hostileInitially = phase === "initial render";
        const pointLabel = `Point ${injectedText}`;
        const seriesLabel = `Series ${injectedText}`;
        const xLabel = `X ${injectedText}`;
        const yLabel = `Y ${injectedText}`;
        const hostileSeries: readonly ScatterPlotSeries[] = [
          {
            label: seriesLabel,
            points: [{ x: 1, y: 2, label: pointLabel }, { x: 2, y: 3 }],
            color: injectedColor,
          },
          { label: literalText, points: [{ x: 3, y: 4 }], color: cssColor },
        ];
        const series = pulse<readonly ScatterPlotSeries[]>(
          hostileInitially
            ? hostileSeries
            : [{ label: "Original", points: [{ x: 0, y: 1, label: "Before" }] }],
        );
        const target = mount(
          <ScatterPlot
            series={series}
            xLabel={xLabel}
            yLabel={yLabel}
            showPointLabels
            styles={{ gridLine: injectedColor }}
          />,
        );

        if (!hostileInitially) {
          expectLiteralText(target, "Before");
          series.set(hostileSeries);
        }

        for (const label of [pointLabel, seriesLabel, xLabel, yLabel, literalText]) {
          expectLiteralText(target, label);
        }
        expectAttributeCount(target, "circle", "fill", injectedColor, 3);
        expectAttributeCount(target, "circle", "fill", cssColor, 2);
        expectAttributeCount(target, "line", "stroke", injectedColor, 10);
        expectNoInjectedMarkup(target);
      },
    );
  });

  it("preserves dashed and solid series and legends through updates", () => {
    const series = pulse<readonly LineChartSeries[]>([
      { label: "Dashed", values: [1, 3], color: cssColor, dashed: true },
      { label: "Solid", values: [2, 4], color: "currentColor", dashed: false },
    ]);
    const target = mount(<LineChart series={series} showGrid={false} />);

    function expectDashPatterns(dashedColor: string, solidColor: string): void {
      const lines = Array.from(target.querySelectorAll("polyline, line"));
      const dashed = lines.filter((el) => el.getAttribute("stroke") === dashedColor);
      expect(dashed.map((el) => el.getAttribute("stroke-dasharray")))
        .toEqual(["6 3", "4 2"]);
      const solid = lines.filter((el) => el.getAttribute("stroke") === solidColor);
      expect(solid.length).toBeGreaterThanOrEqual(2);
      for (const line of solid) {
        expect([null, "", "none"]).toContain(line.getAttribute("stroke-dasharray"));
      }
      for (const line of target.querySelectorAll("polyline")) {
        expect(line.getAttribute("points")).toMatch(/^\d+\.\d,\d+\.\d /);
      }
      expectNoInjectedMarkup(target);
    }

    expectLiteralText(target, "Dashed");
    expectDashPatterns(cssColor, "currentColor");
    series.set([
      { label: "Now solid", values: [3, 1], color: cssColor, dashed: false },
      { label: "Now dashed", values: [4, 2], color: "blue", dashed: true },
    ]);
    expectDashPatterns("blue", cssColor);
  });

  it("contains a runtime string supplied through a nominal numeric attribute", () => {
    const injectedWidth = `2" onload="void 0" data-chart-injected="width`;
    const runtimeSeries: LineChartSeries = { label: "Runtime input", values: [1, 2] };
    // JavaScript callers can supply strings despite the TypeScript numeric contract.
    Reflect.set(runtimeSeries, "strokeWidth", injectedWidth);
    const series = pulse<readonly LineChartSeries[]>([runtimeSeries]);
    const target = mount(<LineChart series={series} />);

    expect(target.querySelector("polyline")?.getAttribute("stroke-width"))
      .toBe(injectedWidth);
    expectNoInjectedMarkup(target);
  });
});
