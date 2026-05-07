import { component } from "@ochairo/beat";

import {
  AreaChart as HeadlessAreaChart,
  type AreaChartProps,
  type AreaChartSeries,
} from "../../../headless/primitives/AreaChart";
import css from "./AreaChart.module.css";

export type { AreaChartProps, AreaChartSeries };

export const AreaChart = component<AreaChartProps>((props) => {
  return <HeadlessAreaChart {...props} class={css["root"]!} />;
});
