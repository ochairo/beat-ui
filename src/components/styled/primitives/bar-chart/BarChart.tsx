import { component } from "@ochairo/beat";

import {
  HlBarChart as HeadlessBarChart,
  type BarChartProps,
  type BarChartSeries,
} from "../../../headless/primitives/BarChart";
import css from "./BarChart.module.css";

export type { BarChartProps, BarChartSeries };

export const BarChart = component<BarChartProps>((props) => {
  return <HeadlessBarChart {...props} class={css["root"]!} />;
});
