import { component } from "@ochairo/beat";

import {
  CodeBlock as HeadlessCodeBlock,
  type CodeBlockProps,
} from "../../../headless/primitives/CodeBlock";
import css from "./CodeBlock.module.css";

export type { CodeBlockProps };

export const CodeBlock = component<CodeBlockProps>((props) => {
  return (
    <HeadlessCodeBlock
      {...props}
      class={css["root"]!}
      {...(props.style !== undefined ? { styles: { root: props.style } } : {})}
    />
  );
});
