import { component } from "@ochairo/beat";

import {
  ScatterPlot as HeadlessScatterPlot,
  type ScatterPlotPoint,
  type ScatterPlotProps,
  type ScatterPlotSeries,
} from "../../../headless/primitives/ScatterPlot";
import css from "./ScatterPlot.module.css";

export type { ScatterPlotPoint, ScatterPlotProps, ScatterPlotSeries };

export const ScatterPlot = component<ScatterPlotProps>((props) => {
  return <HeadlessScatterPlot {...props} class={css["root"]!} />;
});
