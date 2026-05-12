import { component } from "@ochairo/beat";

import {
  HlDialog as HeadlessDialog,
  type DialogProps,
  type ModalProps,
} from "../../../headless/composites/Dialog";
import css from "./Dialog.module.css";

export type { DialogProps, ModalProps };

export const Dialog = component<DialogProps>((props) => {
  return <HeadlessDialog {...props} class={css["root"]!} />;
});

export const Modal = Dialog;
