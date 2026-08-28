import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import "@/app/globals.css";
import { AtlasRichTextViewer } from "@/components/rich-text/atlas-rich-text-viewer";

describe("KaTeX stylesheet isolation", () => {
  it("preserves KaTeX content-box metrics inside the Milkdown reset", () => {
    const { container } = render(
      <div className="milkdown">
        <span className="katex">
          <span className="katex-html">
            <span className="base">
              <span className="mord mfrac" data-testid="fraction-layout" />
            </span>
          </span>
        </span>
      </div>,
    );

    const fractionLayout = container.querySelector<HTMLElement>(
      '[data-testid="fraction-layout"]',
    );

    expect(fractionLayout).not.toBeNull();
    expect(getComputedStyle(fractionLayout!).boxSizing).toBe("content-box");
  });

  it("renders subscripts with the stylesheet version used by the renderer", () => {
    const { container } = render(<AtlasRichTextViewer value="$\\Phi_E$" />);

    const math = container.querySelector<HTMLElement>(".katex");
    const subscript = container.querySelector<HTMLElement>(
      '.msupsub [class*="sizing"]',
    );

    expect(math).not.toBeNull();
    expect(subscript).not.toBeNull();
    expect(Number.parseFloat(getComputedStyle(subscript!).fontSize)).toBeLessThan(
      Number.parseFloat(getComputedStyle(math!).fontSize),
    );
  });
});
