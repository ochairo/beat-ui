import { component } from "@ochairo/beat";

import type {
  BeatUiAccessibilityProps,
  BeatUiContentProps,
} from "../../../foundations";

export interface TerminalCardStyles {
  readonly root?: string;
  readonly titleBar?: string;
  readonly dot?: string;
  readonly dotRed?: string;
  readonly dotYellow?: string;
  readonly dotGreen?: string;
  readonly body?: string;
}

export interface TerminalCardProps
  extends BeatUiAccessibilityProps, BeatUiContentProps {
  readonly style?: string;
  readonly styles?: TerminalCardStyles;
}

export const TerminalCard = component<TerminalCardProps>((props) => {
  return (
    <div
      id={props.id}
      class={props.class}
      style={props.styles?.root}
      aria-label={props.ariaLabel ?? "Terminal"}
      aria-labelledby={props.ariaLabelledby}
      aria-describedby={props.ariaDescribedby}
    >
      <div style={props.styles?.titleBar}>
        <span style={props.styles?.dotRed ?? props.styles?.dot} />
        <span style={props.styles?.dotYellow ?? props.styles?.dot} />
        <span style={props.styles?.dotGreen ?? props.styles?.dot} />
      </div>
      <div style={props.styles?.body}>{props.children}</div>
    </div>
  );
});
