import { component } from "@ochairo/beat";

import {
  TerminalCard as HeadlessTerminalCard,
  type TerminalCardProps,
  type TerminalCardStyles,
} from "../../headless/atoms/TerminalCard";

export type { TerminalCardProps };

const DOT_BASE = [
  "width:12px",
  "height:12px",
  "border-radius:50%",
  "display:inline-block",
].join(";");

function buildStyles(props: TerminalCardProps): TerminalCardStyles {
  const rootParts = [
    "border-radius:10px",
    "overflow:hidden",
    "background:var(--beat-ui-color-background-elevated)",
    "border:1px solid var(--beat-ui-color-border)",
    "box-shadow:0 4px 16px rgba(0,0,0,0.15)",
  ];

  if (props.style) rootParts.push(props.style);

  return {
    root: rootParts.join(";"),
    titleBar: [
      "display:flex",
      "align-items:center",
      "gap:8px",
      "padding:12px 16px",
      "background:var(--beat-ui-color-background-subtle)",
      "border-bottom:1px solid var(--beat-ui-color-border)",
    ].join(";"),
    dotRed: `${DOT_BASE};background:#ff5f57`,
    dotYellow: `${DOT_BASE};background:#febc2e`,
    dotGreen: `${DOT_BASE};background:#28c840`,
    body: [
      "padding:1.25rem 1.5rem",
      "font-family:'SF Mono','Fira Code','JetBrains Mono',monospace",
      "font-size:0.9rem",
      "line-height:1.7",
      "color:var(--beat-ui-color-text)",
      "overflow-x:auto",
    ].join(";"),
  };
}

export const TerminalCard = component<TerminalCardProps>((props) => {
  return <HeadlessTerminalCard {...props} styles={buildStyles(props)} />;
});
