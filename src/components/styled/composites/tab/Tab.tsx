import { component } from "@ochairo/beat";

import {
  HlTab as HeadlessTab,
  type TabItem,
  type TabOrientation,
  type TabProps,
} from "../../../headless/composites/Tab";
import css from "./Tab.module.css";

export type { TabItem, TabOrientation, TabProps };

function joinClasses(...values: Array<string | undefined>): string | undefined {
  const next = values.filter((value) => value !== undefined && value !== "");
  return next.length > 0 ? next.join(" ") : undefined;
}

export const Tab = component<TabProps>((props) => {
  const orientation = props.orientation ?? "horizontal";
  const cls =
    orientation === "vertical" ? css["vertical"]! : css["horizontal"]!;
  return <HeadlessTab {...props} class={joinClasses(cls, props.class)} />;
});
