import { render } from "@ochairo/beat";
import { describe, expect, it } from "vitest";

import { TextInput } from "../../src";

describe("TextInput", () => {
  it("renders a text input by default", () => {
    const target = document.createElement("div");

    const cleanup = render(target, <TextInput defaultValue="hello" />);

    const input = target.querySelector("input");

    expect(input).not.toBeNull();
    expect(input?.type).toBe("text");
    expect(input?.value).toBe("hello");

    cleanup();
  });
});
