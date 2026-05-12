import { component } from "@ochairo/beat";

import {
  HlLoading as HeadlessLoading,
  type LoadingProps,
} from "../../../headless/primitives/Loading";
import css from "./Loading.module.css";

export type { LoadingProps };

export const Loading = component<LoadingProps>((props) => {
  return <HeadlessLoading {...props} class={css["root"]!} />;
});
