import { render } from "@ochairo/beat";
import { pulse } from "@ochairo/pulse";
import { describe, expect, it } from "vitest";

import { CodeBlock } from "../../src";

describe("CodeBlock", () => {
  it("renders code content", () => {
    const target = document.createElement("div");
    const code = pulse("const x = 1;");

    const cleanup = render(target, <CodeBlock code={code} label="TSX" />);

    expect(target.textContent).toContain("const x = 1;");
    expect(target.textContent).toContain("TSX");

    cleanup();
  });

  it("renders line numbers", () => {
    const target = document.createElement("div");
    const code = pulse("line1\nline2\nline3");

    const cleanup = render(target, <CodeBlock code={code} />);

    expect(target.textContent).toContain("1");
    expect(target.textContent).toContain("2");
    expect(target.textContent).toContain("3");

    cleanup();
  });

  it("renders a copy button", () => {
    const target = document.createElement("div");
    const code = pulse("hello");

    const cleanup = render(target, <CodeBlock code={code} />);

    const copyBtn = target.querySelector('button[aria-label="Copy code"]');
    expect(copyBtn).toBeTruthy();
    expect(copyBtn?.textContent).toBe("Copy");

    cleanup();
  });

  it("renders as pre when not editable", () => {
    const target = document.createElement("div");
    const code = pulse("const x = 1;");

    const cleanup = render(target, <CodeBlock code={code} />);

    expect(target.querySelector("pre")).toBeTruthy();
    expect(target.querySelector("textarea")).toBeNull();

    cleanup();
  });

  it("renders as textarea when editable", () => {
    const target = document.createElement("div");
    const code = pulse("const x = 1;");

    const cleanup = render(target, <CodeBlock code={code} editable />);

    expect(target.querySelector("textarea")).toBeTruthy();

    cleanup();
  });

  it("applies accessibility attributes", () => {
    const target = document.createElement("div");
    const code = pulse("");

    const cleanup = render(
      target,
      <CodeBlock code={code} ariaLabel="Example code" />,
    );

    const root = target.firstElementChild;
    expect(root?.getAttribute("aria-label")).toBe("Example code");

    cleanup();
  });
});
