import { component } from "@ochairo/beat";

import {
  PieChart as HeadlessPieChart,
  type PieChartProps,
  type PieChartSlice,
} from "../../../headless/primitives/PieChart";
import css from "./PieChart.module.css";

export type { PieChartProps, PieChartSlice };

export const PieChart = component<PieChartProps>((props) => {
  return <HeadlessPieChart {...props} class={css["root"]!} />;
});
