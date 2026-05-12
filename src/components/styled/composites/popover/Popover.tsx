import { component } from "@ochairo/beat";

import {
  HlPopover as HeadlessPopover,
  type PopoverPlacement,
  type PopoverProps,
} from "../../../headless/composites/Popover";
import css from "./Popover.module.css";

export type { PopoverPlacement, PopoverProps };

export const Popover = component<PopoverProps>((props) => {
  return (
    <HeadlessPopover
      {...props}
      class={[css["root"], props.class].filter(Boolean).join(" ")}
    />
  );
});
