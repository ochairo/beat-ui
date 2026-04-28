import { component } from "@ochairo/beat";

import {
  Dialog as HeadlessDialog,
  type DialogProps,
  type ModalProps,
} from "../../headless/molecules/Dialog";

export type { DialogProps, ModalProps };

const overlayStyle = [
  "position:fixed",
  "inset:0",
  "display:flex",
  "align-items:center",
  "justify-content:center",
  "padding:1.5rem",
  "background:var(--beat-ui-color-background-overlay)",
].join(";");

const panelStyle = [
  "display:flex",
  "flex-direction:column",
  "gap:1rem",
  "width:min(32rem, 100%)",
  "padding:1.25rem",
  "border:1px solid var(--beat-ui-color-border)",
  "border-radius:1.25rem",
  "background:var(--beat-ui-color-background-elevated)",
  "color:var(--beat-ui-color-text)",
].join(";");

const headerStyle = [
  "display:flex",
  "align-items:center",
  "justify-content:space-between",
  "gap:1rem",
].join(";");

const footerStyle = [
  "display:flex",
  "justify-content:flex-end",
  "gap:0.75rem",
].join(";");

const closeButtonStyle = [
  "display:inline-flex",
  "align-items:center",
  "justify-content:center",
  "gap:0.5rem",
  "min-height:2.5rem",
  "padding:0.625rem 1rem",
  "border-radius:0.75rem",
  "border:1px solid transparent",
  "background:transparent",
  "color:var(--beat-ui-color-primary)",
  "cursor:pointer",
  "font:inherit",
  "font-weight:600",
].join(";");

export const Dialog = component<DialogProps>((props) => {
  return (
    <HeadlessDialog
      {...props}
      styles={{
        overlay: overlayStyle,
        panel: panelStyle,
        header: headerStyle,
        footer: footerStyle,
        closeButton: closeButtonStyle,
      }}
    />
  );
});

export const Modal = Dialog;
