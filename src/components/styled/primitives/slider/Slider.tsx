import { component } from "@ochairo/beat";

import {
  Slider as HeadlessSlider,
  type SliderProps,
} from "../../../headless/primitives/Slider";
import css from "./Slider.module.css";

export type { SliderProps };

export const Slider = component<SliderProps>((props) => {
  return <HeadlessSlider {...props} class={css["root"]!} />;
});
