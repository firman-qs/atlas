import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AtlasRichTextViewer } from "@/components/rich-text/atlas-rich-text-viewer";

describe("AtlasRichTextViewer", () => {
  it("renders CommonMark content as structured HTML", () => {
    const { container } = render(
      <AtlasRichTextViewer
        value={[
          "# Electric Flux",
          "",
          "Electric flux is **important**.",
          "",
          "- Electric field",
          "- Surface area",
          "",
          "`Phi_E`",
        ].join("\n")}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Electric Flux",
        level: 1,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("important")).toHaveProperty("tagName", "STRONG");

    expect(screen.getByText("Electric field")).toBeInTheDocument();
    expect(screen.getByText("Surface area")).toBeInTheDocument();

    expect(screen.getByText("Phi_E")).toHaveProperty("tagName", "CODE");

    expect(container.querySelector("ul")).toBeInTheDocument();
  });

  it("renders inline and display mathematics with KaTeX", () => {
    const { container } = render(
      <AtlasRichTextViewer
        value={[
          "The electric field is $E = \\frac{q}{4\\pi\\epsilon_0 r^2}$.",
          "",
          "$$",
          "\\Phi_E = \\int_S \\mathbf{E} \\cdot d\\mathbf{a}",
          "$$",
        ].join("\n")}
      />,
    );

    expect(container.querySelector(".katex")).toBeInTheDocument();
    expect(container.querySelector(".katex-display")).toBeInTheDocument();
  });

  it("renders Markdown links", () => {
    render(
      <AtlasRichTextViewer value="[Maxwell reference](https://example.com/maxwell)" />,
    );

    expect(
      screen.getByRole("link", {
        name: "Maxwell reference",
      }),
    ).toHaveAttribute("href", "https://example.com/maxwell");
  });

  it("does not interpret raw HTML from Markdown content", () => {
    const { container } = render(
      <AtlasRichTextViewer
        value={'<script data-testid="unsafe">alert("x")</script>'}
      />,
    );

    expect(container.querySelector("script")).not.toBeInTheDocument();

    expect(
      screen.getByText(/<script data-testid="unsafe">/),
    ).toBeInTheDocument();
  });

  it("renders Markdown images through the authenticated media route", () => {
    render(
      <AtlasRichTextViewer value="![Electric field lines](/api/media/media-123)" />,
    );

    const image = screen.getByRole("img", {
      name: "Electric field lines",
    });

    expect(image).toHaveAttribute("src", "/api/media/media-123");

    expect(image).toHaveAttribute("alt", "Electric field lines");
  });
});
