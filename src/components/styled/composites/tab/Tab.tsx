import { component } from "@ochairo/beat";

import {
  Tab as HeadlessTab,
  type TabItem,
  type TabOrientation,
  type TabProps,
} from "../../../headless/composites/Tab";
import css from "./Tab.module.css";

export type { TabItem, TabOrientation, TabProps };

export const Tab = component<TabProps>((props) => {
  const orientation = props.orientation ?? "horizontal";
  const cls = orientation === "vertical" ? css["vertical"]! : css["horizontal"]!;
  return <HeadlessTab {...props} class={cls} />;
});
