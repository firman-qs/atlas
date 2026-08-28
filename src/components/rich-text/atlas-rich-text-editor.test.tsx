import { fireEvent, render, screen, waitFor } from "@/test/render";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AtlasRichTextEditor } from "@/components/rich-text/atlas-rich-text-editor";

const uploadMedia = vi.hoisted(() => vi.fn());
const mediaUrl = vi.hoisted(() => vi.fn());
const mockAction = vi.hoisted(() => vi.fn());
const mockSetReadonly = vi.hoisted(() => vi.fn());
const mockOn = vi.hoisted(() => vi.fn());
const mockGetMarkdown = vi.hoisted(() => vi.fn(() => ""));
const mockCreate = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockDestroy = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.mock("@milkdown/crepe", () => {
  class MockCrepe {
    static Feature = {
      Latex: "latex",
      Toolbar: "toolbar",
      BlockEdit: "block-edit",
      ListItem: "list-item",
      LinkTooltip: "link-tooltip",
      Cursor: "cursor",
      ImageBlock: "image-block",
      Placeholder: "placeholder",
      Table: "table",
      CodeMirror: "code-mirror",
    };
    editor = {
      action: mockAction,
    };
    setReadonly = mockSetReadonly;
    on = mockOn;
    getMarkdown = mockGetMarkdown;
    create = mockCreate;
    destroy = mockDestroy;
  }
  return {
    Crepe: MockCrepe,
  };
});

vi.mock("@/features/media/api/media-client", () => ({
  uploadMedia,
  mediaUrl,
}));

describe("AtlasRichTextEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders formatting toolbar buttons for heading, bold, italic, lists, and math", async () => {
    render(<AtlasRichTextEditor value="Initial text" onChange={vi.fn()} />);

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalled();
    });

    expect(screen.getByRole("button", { name: "Heading 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Heading 2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Heading 3" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bold" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Italic" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bullet list" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Numbered list" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Quote" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Code block" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Math block ($$)" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Inline math ($)" })).toBeInTheDocument();
  });

  it("triggers editor actions when toolbar buttons are clicked", async () => {
    render(<AtlasRichTextEditor value="Initial text" onChange={vi.fn()} />);

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole("button", { name: "Bold" }));
    expect(mockAction).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Italic" }));
    expect(mockAction).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Heading 1" }));
    expect(mockAction).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Bullet list" }));
    expect(mockAction).toHaveBeenCalled();
  });

  it("shows and hides a rendered Markdown and math preview", async () => {
    const { container } = render(
      <AtlasRichTextEditor
        value={"Apply **Gauss's law** using $\\Phi_E = q / \\epsilon_0$."}
        onChange={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalled();
    });

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

  it("renders an empty preview state", async () => {
    render(<AtlasRichTextEditor value="" onChange={vi.fn()} />);

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalled();
    });

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

