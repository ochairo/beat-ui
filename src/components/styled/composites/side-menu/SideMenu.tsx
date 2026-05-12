import { component } from "@ochairo/beat";

import {
  HlSideMenu as HeadlessSideMenu,
  type SideMenuItem,
  type SideMenuProps,
} from "../../../headless/composites/SideMenu";
import css from "./SideMenu.module.css";

export type { SideMenuItem, SideMenuProps };

export const SideMenu = component<SideMenuProps>((props) => {
  return <HeadlessSideMenu {...props} class={css["root"]!} />;
});
