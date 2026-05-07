import { component } from "@ochairo/beat";

import {
  LineChart as HeadlessLineChart,
  type LineChartProps,
  type LineChartSeries,
} from "../../../headless/primitives/LineChart";
import css from "./LineChart.module.css";

export type { LineChartProps, LineChartSeries };

export const LineChart = component<LineChartProps>((props) => {
  return <HeadlessLineChart {...props} class={css["root"]!} />;
});
