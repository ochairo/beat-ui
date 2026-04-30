import { component } from "@ochairo/beat";

import {
  Sparkline as HeadlessSparkline,
  type SparklineProps,
} from "../../../headless/primitives/Sparkline";
import css from "./Sparkline.module.css";

export type { SparklineProps };

export const Sparkline = component<SparklineProps>((props) => {
  return (
    <HeadlessSparkline
      {...props}
      class={css["root"]!}
      {...(props.width === undefined ? { styles: { root: "width:100%" } } : {})}
    />
  );
});
