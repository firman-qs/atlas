import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AtlasRichTextEditor } from "@/components/rich-text/atlas-rich-text-editor";

const uploadMedia = vi.hoisted(() => vi.fn());
const mediaUrl = vi.hoisted(() => vi.fn());

vi.mock("@milkdown/react", () => ({
  Milkdown: () => <div data-testid="milkdown-editor" />,
  MilkdownProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useEditor: () => undefined,
  useInstance: () => [true, () => null],
}));

vi.mock("@/features/media/api/media-client", () => ({
  uploadMedia,
  mediaUrl,
}));

describe("AtlasRichTextEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows and hides a rendered Markdown and math preview", () => {
    const { container } = render(
      <AtlasRichTextEditor
        value={"Apply **Gauss's law** using $\\Phi_E = q / \\epsilon_0$."}
        onChange={vi.fn()}
      />,
    );

    expect(screen.queryByText("Rendered preview")).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: /preview/i,
      }),
    );

    expect(screen.getByText("Rendered preview")).toBeInTheDocument();

    expect(screen.getByText("Gauss's law")).toHaveProperty("tagName", "STRONG");

    expect(container.querySelector(".katex")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: /hide preview/i,
      }),
    );

    expect(screen.queryByText("Rendered preview")).not.toBeInTheDocument();
  });

  it("renders an empty preview state", () => {
    render(<AtlasRichTextEditor value="" onChange={vi.fn()} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /preview/i,
      }),
    );

    expect(screen.getByText("Nothing to preview yet.")).toBeInTheDocument();
  });

  it("uploads an authoring image and appends its Markdown reference", async () => {
    const onChange = vi.fn();

    uploadMedia.mockResolvedValue({
      id: "media-123",
      purpose: "authoring",
      original_filename: "electric-field.png",
      mime_type: "image/png",
      size_bytes: 128,
    });

    mediaUrl.mockReturnValue("/api/media/media-123");

    render(
      <AtlasRichTextEditor
        value="Explain the electric field."
        onChange={onChange}
        mediaPurpose="authoring"
      />,
    );

    const file = new File(["image-bytes"], "electric-field.png", {
      type: "image/png",
    });

    fireEvent.change(screen.getByLabelText("Choose image"), {
      target: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(uploadMedia).toHaveBeenCalledWith(file, "authoring");
    });

    expect(mediaUrl).toHaveBeenCalledWith("media-123");

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        [
          "Explain the electric field.",
          "",
          "![electric-field](/api/media/media-123)",
        ].join("\n"),
      );
    });
  });

  it("shows an upload error without modifying the Markdown", async () => {
    const onChange = vi.fn();

    uploadMedia.mockRejectedValue(new Error("Uploaded file is too large."));

    render(
      <AtlasRichTextEditor
        value="Existing content"
        onChange={onChange}
        mediaPurpose="authoring"
      />,
    );

    const file = new File(["image-bytes"], "large.png", {
      type: "image/png",
    });

    fireEvent.change(screen.getByLabelText("Choose image"), {
      target: {
        files: [file],
      },
    });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Uploaded file is too large.",
    );

    expect(onChange).not.toHaveBeenCalled();
  });
});
