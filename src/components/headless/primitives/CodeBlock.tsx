import { component, For, type BeatJsxChild } from "@ochairo/beat";
import { pulse, type Pulse } from "@ochairo/pulse";

import type {
  BeatUiAccessibilityProps,
  BeatUiContentProps,
} from "../../../foundations";

export interface CodeBlockStyles {
  readonly root?: string;
  readonly header?: string;
  readonly label?: string;
  readonly copyButton?: string;
  readonly body?: string;
  readonly lineNumbers?: string;
  readonly lineNumber?: string;
  readonly editorOverlay?: string;
  readonly editor?: string;
}

export interface CodeBlockProps
  extends BeatUiAccessibilityProps, BeatUiContentProps {
  readonly code: Pulse<string>;
  readonly label?: string;
  readonly editable?: boolean;
  readonly copyable?: boolean;
  readonly highlight?: (code: string) => string;
  readonly style?: string;
  readonly styles?: CodeBlockStyles;
  readonly onCodeChange?: (value: string) => void;
}

function buildLineNumbers(code: string): readonly number[] {
  const count = code.split("\n").length;
  const nums: number[] = [];
  for (let i = 1; i <= count; i++) {
    nums.push(i);
  }
  return nums;
}

export const HlCodeBlock = component<CodeBlockProps>((props): BeatJsxChild => {
  const copyLabel = pulse("Copy");
  const lineNums = pulse<readonly number[]>(buildLineNumbers(props.code.get()));

  props.code.on((event) => {
    lineNums.set(buildLineNumbers(event.currentValue));
  });

  const handleCopy = (): void => {
    const text = props.code.get();
    navigator.clipboard.writeText(text).then(() => {
      copyLabel.set("Copied!");
      setTimeout(() => {
        copyLabel.set("Copy");
      }, 2000);
    });
  };

  const handleInput = (e: Event): void => {
    const target = e.target as HTMLTextAreaElement;
    props.onCodeChange?.(target.value);
    props.code.set(target.value);
  };

  let highlightedRef: HTMLPreElement | undefined;

  const updateHighlight = (code: string): void => {
    if (highlightedRef && props.highlight) {
      highlightedRef.innerHTML = props.highlight(code);
    }
  };

  if (props.highlight) {
    props.code.on((event) => {
      updateHighlight(event.currentValue);
    });
  }

  return (
    <div
      id={props.id}
      class={props.class}
      style={props.styles?.root}
      aria-label={props.ariaLabel ?? "Code block"}
      aria-labelledby={props.ariaLabelledby}
      aria-describedby={props.ariaDescribedby}
    >
      <div data-part="header" style={props.styles?.header}>
        <span data-part="label" style={props.styles?.label}>
          {props.label ?? ""}
        </span>
        {(props.copyable ?? true) ? (
          <button
            type="button"
            data-part="copy-button"
            style={props.styles?.copyButton}
            onClick={handleCopy}
            aria-label="Copy code"
          >
            {copyLabel}
          </button>
        ) : null}
      </div>
      <div data-part="body" style={props.styles?.body}>
        <div
          data-part="line-numbers"
          style={props.styles?.lineNumbers}
          aria-hidden="true"
        >
          <For each={lineNums} key={(n) => n}>
            {(num) => (
              <div data-part="line-number" style={props.styles?.lineNumber}>
                {num}
              </div>
            )}
          </For>
        </div>
        {props.editable && props.highlight ? (
          <div data-part="editor-overlay" style={props.styles?.editorOverlay}>
            <pre
              data-part="editor-highlight"
              style={props.styles?.editor}
              aria-hidden="true"
              ref={(el) => {
                highlightedRef = el as HTMLPreElement;
                updateHighlight(props.code.get());
              }}
            />
            <textarea
              id={props.id ? `${props.id}-editor` : undefined}
              name={props.name ? `${props.name}-editor` : undefined}
              data-part="editor"
              style={props.styles?.editor}
              spellcheck={false}
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              aria-label={
                props.ariaLabel ? `${props.ariaLabel} editor` : "Code editor"
              }
              value={props.code}
              onInput={handleInput}
            />
          </div>
        ) : props.editable ? (
          <textarea
            id={props.id ? `${props.id}-editor` : undefined}
            name={props.name ? `${props.name}-editor` : undefined}
            data-part="editor"
            style={props.styles?.editor}
            spellcheck={false}
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            aria-label={
              props.ariaLabel ? `${props.ariaLabel} editor` : "Code editor"
            }
            value={props.code}
            onInput={handleInput}
          />
        ) : props.highlight ? (
          <pre
            data-part="editor"
            style={props.styles?.editor}
            ref={(el) => {
              highlightedRef = el as HTMLPreElement;
              updateHighlight(props.code.get());
            }}
          />
        ) : (
          <pre data-part="editor" style={props.styles?.editor}>
            {props.code}
          </pre>
        )}
      </div>
    </div>
  );
});
