import { describe, expect, it } from "vitest";

describe("ATLAS test environment", () => {
  it("runs Vitest with the jsdom environment", () => {
    const element = document.createElement("div");
    element.textContent = "ATLAS";

    document.body.appendChild(element);

    expect(document.body).toHaveTextContent("ATLAS");
  });
});
