import { component } from "@ochairo/beat";

import {
  Switch as HeadlessSwitch,
  type SwitchProps,
} from "../../../headless/primitives/Switch";
import css from "./Switch.module.css";

export type { SwitchProps };

export const Switch = component<SwitchProps>((props) => {
  return <HeadlessSwitch {...props} class={css["root"]!} />;
});
