import {
  fireEvent,
  screen,
  render as testingLibraryRender,
  waitFor,
  within,
} from "@testing-library/react";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ChatFullscreenProvider } from "@/features/student-chat/components/chat-fullscreen-provider";
import { StudentChatWorkspace } from "@/features/student-chat/components/student-chat-workspace";

const push = vi.hoisted(() => vi.fn());

const useStudentEnrollment = vi.hoisted(() => vi.fn());
const useCreateChatMessage = vi.hoisted(() => vi.fn());
const useChatMessages = vi.hoisted(() => vi.fn());
const useChatSession = vi.hoisted(() => vi.fn());
const useUpdateChatSession = vi.hoisted(() => vi.fn());
const useCreateChatSession = vi.hoisted(() => vi.fn());
const useChatSessions = vi.hoisted(() => vi.fn());
const createChatMessageMutateAsync = vi.hoisted(() => vi.fn());
const uploadMedia = vi.hoisted(() => vi.fn());
const mediaUrl = vi.hoisted(() => vi.fn());
const createChatSessionMutateAsync = vi.hoisted(() => vi.fn());
const useArchiveChatSession = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

vi.mock("@/features/student-course/queries", () => ({
  useStudentEnrollment,
}));

vi.mock("@/features/media/api/media-client", () => ({
  uploadMedia,
  mediaUrl,
}));

vi.mock("@/features/student-chat/queries", () => ({
  useChatSessions,
  useCreateChatSession,
  useChatSession,
  useChatMessages,
  useCreateChatMessage,
  useUpdateChatSession,
  useArchiveChatSession,
}));

const enrollment = {
  id: "enrollment-1",
  enrolled_at: "2026-08-20T00:00:00Z",

  course_offering: {
    id: "offering-1",
    section: "A",

    course: {
      id: "course-1",
      code: "UM032EM000",
      title: "Electromagnetics",
      credits: 3,
    },

    instructor: {
      id: "instructor-1",
      full_name: "Instructor Example",
      email: "instructor@example.com",
    },

    academic_term: {
      id: "term-1",
      year: 2026,
      semester: "odd",
      starts_at: "2026-08-01T00:00:00Z",
      ends_at: "2026-12-31T00:00:00Z",
    },
  },

  learning_record: {
    id: "learning-record-1",
    started_at: "2026-08-20T00:00:00Z",
    completed_at: null,
    active_assessment: null,
  },
};

function render(ui: ReactElement) {
  return testingLibraryRender(ui, {
    wrapper: ChatFullscreenProvider,
  });
}

describe("StudentChatWorkspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useStudentEnrollment.mockReturnValue({
      data: enrollment,
      isPending: false,
      isError: false,
      error: null,
    });

    useChatSessions.mockReturnValue({
      data: {
        pages: [
          {
            items: [
              {
                id: "chat-session-2",
                learning_record_id: "learning-record-1",
                title: "Maxwell equations",
                created_at: "2026-08-25T00:00:00Z",
                updated_at: "2026-08-25T00:05:00Z",
                archived_at: null,
              },
              {
                id: "chat-session-1",
                learning_record_id: "learning-record-1",
                title: "Electric flux",
                created_at: "2026-08-24T23:00:00Z",
                updated_at: "2026-08-25T00:01:00Z",
                archived_at: null,
              },
            ],
            page: 1,
            page_size: 20,
            total: 2,
          },
        ],
        pageParams: [1],
      },

      isPending: false,
      isError: false,
      error: null,

      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    });

    useCreateChatSession.mockReturnValue({
      mutateAsync: createChatSessionMutateAsync,
      isPending: false,
      isError: false,
      error: null,
    });

    useChatSession.mockReturnValue({
      data: {
        id: "chat-session-2",
        learning_record_id: "learning-record-1",
        title: "Maxwell equations",
        created_at: "2026-08-25T00:00:00Z",
        updated_at: "2026-08-25T00:05:00Z",
        archived_at: null,
      },
      isPending: false,
      isError: false,
      error: null,
    });

    useChatMessages.mockReturnValue({
      data: {
        pages: [
          {
            items: [
              {
                id: "message-1",
                chat_session_id: "chat-session-2",
                role: "user",
                content: "Why does Gauss's law use a closed surface?",
                provider: null,
                model: null,
                created_at: "2026-08-25T00:01:00Z",
              },
              {
                id: "message-2",
                chat_session_id: "chat-session-2",
                role: "assistant",
                content:
                  "Because Gauss's law relates **net electric flux** through a closed surface to the enclosed charge.",
                provider: "ollama",
                model: "gemma4:cloud",
                created_at: "2026-08-25T00:01:05Z",
              },
            ],
            page: 1,
            page_size: 20,
            total: 2,
          },
        ],
        pageParams: [1],
      },

      isPending: false,
      isError: false,
      error: null,

      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    });

    createChatSessionMutateAsync.mockResolvedValue({
      id: "chat-session-new",
      learning_record_id: "learning-record-1",
      title: "New chat",
      created_at: "2026-08-25T01:00:00Z",
      updated_at: "2026-08-25T01:00:00Z",
    });

    useCreateChatMessage.mockReturnValue({
      mutateAsync: createChatMessageMutateAsync,
      isPending: false,
      isError: false,
      error: null,
    });

    createChatMessageMutateAsync.mockResolvedValue({
      user_message: {
        id: "message-3",
        chat_session_id: "chat-session-2",
        role: "user",
        content: "Why is divergence of B zero?",
        provider: null,
        model: null,
        created_at: "2026-08-25T00:02:00Z",
      },
      assistant_message: {
        id: "message-4",
        chat_session_id: "chat-session-2",
        role: "assistant",
        content:
          "Because magnetic field lines do not begin or end at isolated magnetic charges.",
        provider: "ollama",
        model: "gemma4:cloud",
        created_at: "2026-08-25T00:02:05Z",
      },
    });

    uploadMedia.mockResolvedValue({
      id: "chat-media-1",
      purpose: "chat",
      original_filename: "maxwell.png",
      mime_type: "image/png",
      size_bytes: 128,
    });

    mediaUrl.mockReturnValue("/api/media/chat-media-1");

    useUpdateChatSession.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    });

    useArchiveChatSession.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    });
  });

  it("renders course-scoped chat sessions and opens a newly created session", async () => {
    render(<StudentChatWorkspace enrollmentId="enrollment-1" />);

    expect(
      screen.getByRole("heading", {
        name: "AI Tutor",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Electromagnetics")).toBeInTheDocument();
    expect(screen.getByText("Maxwell equations")).toBeInTheDocument();
    expect(screen.getByText("Electric flux")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "New chat",
      }),
    );

    await waitFor(() => {
      expect(createChatSessionMutateAsync).toHaveBeenCalledTimes(1);

      expect(push).toHaveBeenCalledWith(
        "/student/courses/enrollment-1/chat/chat-session-new",
      );
    });
  });

  it("renders the selected chat session and its persisted messages", () => {
    render(
      <StudentChatWorkspace
        enrollmentId="enrollment-1"
        selectedChatSessionId="chat-session-2"
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Maxwell equations",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Why does Gauss's law use a closed surface?"),
    ).toBeInTheDocument();

    expect(screen.getByText(/net electric flux/)).toBeInTheDocument();

    expect(useChatSession).toHaveBeenCalledWith("chat-session-2");
    expect(useChatMessages).toHaveBeenCalledWith("chat-session-2");
  });

  it("sends a message from the selected conversation and clears the composer after success", async () => {
    render(
      <StudentChatWorkspace
        enrollmentId="enrollment-1"
        selectedChatSessionId="chat-session-2"
      />,
    );

    const composer = screen.getByRole("textbox", {
      name: "Message your ATLAS tutor",
    });

    fireEvent.change(composer, {
      target: {
        value: "Why is divergence of B zero?",
      },
    });

    expect(composer).toHaveValue("Why is divergence of B zero?");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Send message",
      }),
    );

    await waitFor(() => {
      expect(createChatMessageMutateAsync).toHaveBeenCalledWith(
        "Why is divergence of B zero?",
      );
    });

    await waitFor(() => {
      expect(composer).toHaveValue("");
    });
  });

  it("preserves the draft and shows the send error when creating a chat turn fails", async () => {
    createChatMessageMutateAsync.mockRejectedValueOnce(
      new Error("Chat AI completion failed"),
    );

    useCreateChatMessage.mockReturnValue({
      mutateAsync: createChatMessageMutateAsync,
      isPending: false,
      isError: true,
      error: new Error("Chat AI completion failed"),
    });

    render(
      <StudentChatWorkspace
        enrollmentId="enrollment-1"
        selectedChatSessionId="chat-session-2"
      />,
    );

    const composer = screen.getByRole("textbox", {
      name: "Message your ATLAS tutor",
    });

    fireEvent.change(composer, {
      target: {
        value: "Please explain this another way.",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Send message",
      }),
    );

    await waitFor(() => {
      expect(createChatMessageMutateAsync).toHaveBeenCalledWith(
        "Please explain this another way.",
      );
    });

    expect(composer).toHaveValue("Please explain this another way.");

    expect(screen.getByText("Chat AI completion failed")).toBeInTheDocument();
  });

  it("uploads a chat image and includes its media reference when sending", async () => {
    render(
      <StudentChatWorkspace
        enrollmentId="enrollment-1"
        selectedChatSessionId="chat-session-2"
      />,
    );

    const file = new File(["image-bytes"], "maxwell.png", {
      type: "image/png",
    });

    fireEvent.change(screen.getByLabelText("Attach image"), {
      target: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(uploadMedia).toHaveBeenCalledWith(file, "chat");
    });

    fireEvent.change(
      screen.getByRole("textbox", {
        name: "Message your ATLAS tutor",
      }),
      {
        target: {
          value: "What does this diagram show?",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Send message",
      }),
    );

    await waitFor(() => {
      expect(createChatMessageMutateAsync).toHaveBeenCalledWith(
        [
          "What does this diagram show?",
          "",
          "![maxwell](/api/media/chat-media-1)",
        ].join("\n"),
      );
    });
  });

  it("removes an uploaded image before sending the message", async () => {
    render(
      <StudentChatWorkspace
        enrollmentId="enrollment-1"
        selectedChatSessionId="chat-session-2"
      />,
    );

    const file = new File(["image-bytes"], "maxwell.png", {
      type: "image/png",
    });

    fireEvent.change(screen.getByLabelText("Attach image"), {
      target: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(uploadMedia).toHaveBeenCalledWith(file, "chat");
    });

    expect(
      screen.getByRole("img", {
        name: "maxwell",
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Remove maxwell",
      }),
    );

    expect(
      screen.queryByRole("img", {
        name: "maxwell",
      }),
    ).not.toBeInTheDocument();

    fireEvent.change(
      screen.getByRole("textbox", {
        name: "Message your ATLAS tutor",
      }),
      {
        target: {
          value: "Explain Maxwell's equations.",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Send message",
      }),
    );

    await waitFor(() => {
      expect(createChatMessageMutateAsync).toHaveBeenCalledWith(
        "Explain Maxwell's equations.",
      );
    });
  });

  it("preserves an uploaded image when sending the chat turn fails", async () => {
    createChatMessageMutateAsync.mockRejectedValueOnce(
      new Error("Chat AI completion failed"),
    );

    useCreateChatMessage.mockReturnValue({
      mutateAsync: createChatMessageMutateAsync,
      isPending: false,
      isError: true,
      error: new Error("Chat AI completion failed"),
    });

    render(
      <StudentChatWorkspace
        enrollmentId="enrollment-1"
        selectedChatSessionId="chat-session-2"
      />,
    );

    const file = new File(["image-bytes"], "maxwell.png", {
      type: "image/png",
    });

    fireEvent.change(screen.getByLabelText("Attach image"), {
      target: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(uploadMedia).toHaveBeenCalledWith(file, "chat");
    });

    fireEvent.change(
      screen.getByRole("textbox", {
        name: "Message your ATLAS tutor",
      }),
      {
        target: {
          value: "Explain this figure.",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Send message",
      }),
    );

    await waitFor(() => {
      expect(createChatMessageMutateAsync).toHaveBeenCalledWith(
        [
          "Explain this figure.",
          "",
          "![maxwell](/api/media/chat-media-1)",
        ].join("\n"),
      );
    });

    expect(
      screen.getByRole("textbox", {
        name: "Message your ATLAS tutor",
      }),
    ).toHaveValue("Explain this figure.");

    expect(
      screen.getByRole("img", {
        name: "maxwell",
      }),
    ).toBeInTheDocument();
  });

  it("sends at most two uploaded images in one chat message", async () => {
    uploadMedia
      .mockResolvedValueOnce({
        id: "chat-media-1",
        purpose: "chat",
        original_filename: "maxwell.png",
        mime_type: "image/png",
        size_bytes: 128,
      })
      .mockResolvedValueOnce({
        id: "chat-media-2",
        purpose: "chat",
        original_filename: "gauss.jpg",
        mime_type: "image/jpeg",
        size_bytes: 256,
      });

    mediaUrl
      .mockReturnValueOnce("/api/media/chat-media-1")
      .mockReturnValueOnce("/api/media/chat-media-2");

    render(
      <StudentChatWorkspace
        enrollmentId="enrollment-1"
        selectedChatSessionId="chat-session-2"
      />,
    );

    const firstFile = new File(["first-image"], "maxwell.png", {
      type: "image/png",
    });

    const secondFile = new File(["second-image"], "gauss.jpg", {
      type: "image/jpeg",
    });

    const input = screen.getByLabelText("Attach image");

    fireEvent.change(input, {
      target: {
        files: [firstFile],
      },
    });

    await waitFor(() => {
      expect(uploadMedia).toHaveBeenCalledWith(firstFile, "chat");
    });

    fireEvent.change(input, {
      target: {
        files: [secondFile],
      },
    });

    await waitFor(() => {
      expect(uploadMedia).toHaveBeenCalledWith(secondFile, "chat");
    });

    expect(
      screen.getByRole("img", {
        name: "maxwell",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("img", {
        name: "gauss",
      }),
    ).toBeInTheDocument();

    fireEvent.change(
      screen.getByRole("textbox", {
        name: "Message your ATLAS tutor",
      }),
      {
        target: {
          value: "Compare these two figures.",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Send message",
      }),
    );

    await waitFor(() => {
      expect(createChatMessageMutateAsync).toHaveBeenCalledWith(
        [
          "Compare these two figures.",
          "",
          "![maxwell](/api/media/chat-media-1)",
          "",
          "![gauss](/api/media/chat-media-2)",
        ].join("\n"),
      );
    });
  });

  it("disables adding another image after two attachments", async () => {
    uploadMedia
      .mockResolvedValueOnce({
        id: "chat-media-1",
        purpose: "chat",
        original_filename: "one.png",
        mime_type: "image/png",
        size_bytes: 100,
      })
      .mockResolvedValueOnce({
        id: "chat-media-2",
        purpose: "chat",
        original_filename: "two.png",
        mime_type: "image/png",
        size_bytes: 100,
      });

    mediaUrl
      .mockReturnValueOnce("/api/media/chat-media-1")
      .mockReturnValueOnce("/api/media/chat-media-2");

    render(
      <StudentChatWorkspace
        enrollmentId="enrollment-1"
        selectedChatSessionId="chat-session-2"
      />,
    );

    const input = screen.getByLabelText("Attach image");

    fireEvent.change(input, {
      target: {
        files: [
          new File(["one"], "one.png", {
            type: "image/png",
          }),
        ],
      },
    });

    await screen.findByRole("img", {
      name: "one",
    });

    fireEvent.change(input, {
      target: {
        files: [
          new File(["two"], "two.png", {
            type: "image/png",
          }),
        ],
      },
    });

    await screen.findByRole("img", {
      name: "two",
    });

    expect(
      screen.getByRole("button", {
        name: "Choose image",
      }),
    ).toBeDisabled();
  });

  it("prevents sending when text plus image references exceed the chat message limit", async () => {
    render(
      <StudentChatWorkspace
        enrollmentId="enrollment-1"
        selectedChatSessionId="chat-session-2"
      />,
    );

    const file = new File(["image-bytes"], "maxwell.png", {
      type: "image/png",
    });

    fireEvent.change(screen.getByLabelText("Attach image"), {
      target: {
        files: [file],
      },
    });

    await screen.findByRole("img", {
      name: "maxwell",
    });

    fireEvent.change(
      screen.getByRole("textbox", {
        name: "Message your ATLAS tutor",
      }),
      {
        target: {
          // Under the textarea's 4000-char limit by itself,
          // but over 4000 once the generated image Markdown is appended.
          value: "a".repeat(3990),
        },
      },
    );

    expect(
      screen.getByRole("button", {
        name: "Send message",
      }),
    ).toBeDisabled();
  });

  it("renders persisted chat images through the authenticated media route", () => {
    useChatMessages.mockReturnValue({
      data: {
        pages: [
          {
            items: [
              {
                id: "message-image-1",
                chat_session_id: "chat-session-2",
                role: "user",
                content: [
                  "Compare these figures.",
                  "",
                  "![maxwell](/api/media/chat-media-1)",
                  "",
                  "![gauss](/api/media/chat-media-2)",
                ].join("\n"),
                provider: null,
                model: null,
                created_at: "2026-08-25T00:02:00Z",
              },
              {
                id: "message-image-2",
                chat_session_id: "chat-session-2",
                role: "assistant",
                content:
                  "The first figure shows Maxwell's equations, while the second illustrates Gauss's law.",
                provider: "ollama",
                model: "gemma4:cloud",
                created_at: "2026-08-25T00:02:05Z",
              },
            ],
            page: 1,
            page_size: 20,
            total: 2,
          },
        ],
        pageParams: [1],
      },

      isPending: false,
      isError: false,
      error: null,

      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    });

    render(
      <StudentChatWorkspace
        enrollmentId="enrollment-1"
        selectedChatSessionId="chat-session-2"
      />,
    );

    const maxwellImage = screen.getByRole("img", {
      name: "maxwell",
    });

    const gaussImage = screen.getByRole("img", {
      name: "gauss",
    });

    expect(maxwellImage).toHaveAttribute("src", "/api/media/chat-media-1");

    expect(gaussImage).toHaveAttribute("src", "/api/media/chat-media-2");

    expect(screen.getByText("Compare these figures.")).toBeInTheDocument();

    expect(
      screen.getByText(/first figure shows Maxwell's equations/),
    ).toBeInTheDocument();
  });

  it("renames the selected chat session", async () => {
    const renameMutateAsync = vi.fn().mockResolvedValue({
      id: "chat-session-2",
      learning_record_id: "learning-record-1",
      title: "Maxwell equations review",
      created_at: "2026-08-25T00:00:00Z",
      updated_at: "2026-08-25T00:20:00Z",
      archived_at: null,
    });

    useUpdateChatSession.mockReturnValue({
      mutateAsync: renameMutateAsync,
      isPending: false,
      isError: false,
      error: null,
    });

    render(
      <StudentChatWorkspace
        enrollmentId="enrollment-1"
        selectedChatSessionId="chat-session-2"
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Chat session actions",
      }),
    );

    fireEvent.click(
      screen.getByRole("menuitem", {
        name: "Rename",
      }),
    );

    const titleInput = screen.getByRole("textbox", {
      name: "Chat title",
    });

    fireEvent.change(titleInput, {
      target: {
        value: "Maxwell equations review",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Save",
      }),
    );

    await waitFor(() => {
      expect(renameMutateAsync).toHaveBeenCalledWith(
        "Maxwell equations review",
      );
    });
  });

  it("archives the selected chat session and returns to the course chat workspace", async () => {
    const archiveMutateAsync = vi.fn().mockResolvedValue(undefined);

    useArchiveChatSession.mockReturnValue({
      mutateAsync: archiveMutateAsync,
      isPending: false,
      isError: false,
      error: null,
    });

    render(
      <StudentChatWorkspace
        enrollmentId="enrollment-1"
        selectedChatSessionId="chat-session-2"
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Chat session actions",
      }),
    );

    fireEvent.click(
      screen.getByRole("menuitem", {
        name: "Archive",
      }),
    );

    expect(
      screen.getByRole("heading", {
        name: "Archive chat?",
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Archive chat",
      }),
    );

    await waitFor(() => {
      expect(archiveMutateAsync).toHaveBeenCalledTimes(1);
    });

    expect(push).toHaveBeenCalledWith("/student/courses/enrollment-1/chat");
  });

  it("requests an older message page when the student loads older messages", async () => {
    const fetchNextPage = vi.fn().mockResolvedValue(undefined);

    useChatMessages.mockReturnValue({
      data: {
        pages: [
          {
            items: [
              {
                id: "message-21",
                chat_session_id: "chat-session-2",
                role: "user",
                content: "This is the newer user message.",
                provider: null,
                model: null,
                created_at: "2026-08-25T00:20:00Z",
              },
              {
                id: "message-22",
                chat_session_id: "chat-session-2",
                role: "assistant",
                content: "This is the newer assistant response.",
                provider: "ollama",
                model: "gemma4:cloud",
                created_at: "2026-08-25T00:20:01Z",
              },
            ],
            page: 1,
            page_size: 20,
            total: 22,
          },
        ],
        pageParams: [1],
      },

      isPending: false,
      isError: false,
      error: null,

      hasNextPage: true,
      isFetchingNextPage: false,
      fetchNextPage,
    });

    render(
      <StudentChatWorkspace
        enrollmentId="enrollment-1"
        selectedChatSessionId="chat-session-2"
      />,
    );

    expect(
      screen.getByRole("button", {
        name: "Load older messages",
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Load older messages",
      }),
    );

    await waitFor(() => {
      expect(fetchNextPage).toHaveBeenCalledTimes(1);
    });
  });

  it("renders older loaded message pages before newer message pages", () => {
    useChatMessages.mockReturnValue({
      data: {
        pages: [
          {
            items: [
              {
                id: "message-21",
                chat_session_id: "chat-session-2",
                role: "user",
                content: "Newer user message",
                provider: null,
                model: null,
                created_at: "2026-08-25T00:20:00Z",
              },
              {
                id: "message-22",
                chat_session_id: "chat-session-2",
                role: "assistant",
                content: "Newer assistant message",
                provider: "ollama",
                model: "gemma4:cloud",
                created_at: "2026-08-25T00:20:01Z",
              },
            ],
            page: 1,
            page_size: 20,
            total: 22,
          },
          {
            items: [
              {
                id: "message-1",
                chat_session_id: "chat-session-2",
                role: "user",
                content: "Older user message",
                provider: null,
                model: null,
                created_at: "2026-08-25T00:00:00Z",
              },
              {
                id: "message-2",
                chat_session_id: "chat-session-2",
                role: "assistant",
                content: "Older assistant message",
                provider: "ollama",
                model: "gemma4:cloud",
                created_at: "2026-08-25T00:00:01Z",
              },
            ],
            page: 2,
            page_size: 20,
            total: 22,
          },
        ],
        pageParams: [1, 2],
      },

      isPending: false,
      isError: false,
      error: null,

      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    });

    render(
      <StudentChatWorkspace
        enrollmentId="enrollment-1"
        selectedChatSessionId="chat-session-2"
      />,
    );

    const olderUser = screen.getByText("Older user message");
    const olderAssistant = screen.getByText("Older assistant message");
    const newerUser = screen.getByText("Newer user message");
    const newerAssistant = screen.getByText("Newer assistant message");

    expect(
      olderUser.compareDocumentPosition(olderAssistant) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    expect(
      olderAssistant.compareDocumentPosition(newerUser) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    expect(
      newerUser.compareDocumentPosition(newerAssistant) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("requests older chat sessions when the student loads more chats", async () => {
    const fetchNextPage = vi.fn().mockResolvedValue(undefined);

    useChatSessions.mockReturnValue({
      data: {
        pages: [
          {
            items: [
              {
                id: "chat-session-2",
                learning_record_id: "learning-record-1",
                title: "Maxwell equations",
                created_at: "2026-08-25T00:00:00Z",
                updated_at: "2026-08-25T00:05:00Z",
                archived_at: null,
              },
              {
                id: "chat-session-1",
                learning_record_id: "learning-record-1",
                title: "Electric flux",
                created_at: "2026-08-24T23:00:00Z",
                updated_at: "2026-08-25T00:01:00Z",
                archived_at: null,
              },
            ],
            page: 1,
            page_size: 20,
            total: 22,
          },
        ],
        pageParams: [1],
      },

      isPending: false,
      isError: false,
      error: null,

      hasNextPage: true,
      isFetchingNextPage: false,
      fetchNextPage,
    });

    render(
      <StudentChatWorkspace
        enrollmentId="enrollment-1"
        selectedChatSessionId="chat-session-2"
      />,
    );

    const loadMoreButton = screen.getByRole("button", {
      name: "Load more chats",
    });

    expect(loadMoreButton).toBeInTheDocument();

    fireEvent.click(loadMoreButton);

    await waitFor(() => {
      expect(fetchNextPage).toHaveBeenCalledTimes(1);
    });
  });

  it("renders newer chat-session pages before older loaded pages", () => {
    useChatSessions.mockReturnValue({
      data: {
        pages: [
          {
            items: [
              {
                id: "chat-session-21",
                learning_record_id: "learning-record-1",
                title: "Newest discussion",
                created_at: "2026-08-25T00:20:00Z",
                updated_at: "2026-08-25T00:20:00Z",
                archived_at: null,
              },
              {
                id: "chat-session-20",
                learning_record_id: "learning-record-1",
                title: "Another recent discussion",
                created_at: "2026-08-25T00:19:00Z",
                updated_at: "2026-08-25T00:19:00Z",
                archived_at: null,
              },
            ],
            page: 1,
            page_size: 20,
            total: 22,
          },
          {
            items: [
              {
                id: "chat-session-1",
                learning_record_id: "learning-record-1",
                title: "Older discussion",
                created_at: "2026-08-20T00:00:00Z",
                updated_at: "2026-08-20T00:00:00Z",
                archived_at: null,
              },
            ],
            page: 2,
            page_size: 20,
            total: 22,
          },
        ],
        pageParams: [1, 2],
      },

      isPending: false,
      isError: false,
      error: null,

      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    });

    render(
      <StudentChatWorkspace
        enrollmentId="enrollment-1"
        selectedChatSessionId="chat-session-21"
      />,
    );

    const newest = screen.getByRole("link", {
      name: "Newest discussion",
    });

    const recent = screen.getByRole("link", {
      name: "Another recent discussion",
    });

    const older = screen.getByRole("link", {
      name: "Older discussion",
    });

    expect(
      newest.compareDocumentPosition(recent) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    expect(
      recent.compareDocumentPosition(older) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("preserves the visible message position when older messages are loaded", async () => {
    const fetchNextPage = vi.fn();

    const newestPage = {
      items: [
        {
          id: "message-21",
          chat_session_id: "chat-session-2",
          role: "user" as const,
          content: "Newer user message",
          provider: null,
          model: null,
          created_at: "2026-08-25T00:20:00Z",
        },
        {
          id: "message-22",
          chat_session_id: "chat-session-2",
          role: "assistant" as const,
          content: "Newer assistant message",
          provider: "ollama",
          model: "gemma4:cloud",
          created_at: "2026-08-25T00:20:01Z",
        },
      ],
      page: 1,
      page_size: 20,
      total: 22,
    };

    const olderPage = {
      items: [
        {
          id: "message-1",
          chat_session_id: "chat-session-2",
          role: "user" as const,
          content: "Older user message",
          provider: null,
          model: null,
          created_at: "2026-08-25T00:00:00Z",
        },
        {
          id: "message-2",
          chat_session_id: "chat-session-2",
          role: "assistant" as const,
          content: "Older assistant message",
          provider: "ollama",
          model: "gemma4:cloud",
          created_at: "2026-08-25T00:00:01Z",
        },
      ],
      page: 2,
      page_size: 20,
      total: 22,
    };

    useChatMessages.mockReturnValue({
      data: {
        pages: [newestPage],
        pageParams: [1],
      },

      isPending: false,
      isError: false,
      error: null,

      hasNextPage: true,
      isFetchingNextPage: false,
      fetchNextPage,
    });

    const { rerender } = render(
      <StudentChatWorkspace
        enrollmentId="enrollment-1"
        selectedChatSessionId="chat-session-2"
      />,
    );

    const scroller = screen.getByTestId("chat-message-scroll");

    Object.defineProperty(scroller, "scrollHeight", {
      configurable: true,
      value: 1000,
    });

    Object.defineProperty(scroller, "clientHeight", {
      configurable: true,
      value: 400,
    });

    scroller.scrollTop = 300;

    fetchNextPage.mockImplementation(async () => {
      useChatMessages.mockReturnValue({
        data: {
          pages: [newestPage, olderPage],
          pageParams: [1, 2],
        },

        isPending: false,
        isError: false,
        error: null,

        hasNextPage: false,
        isFetchingNextPage: false,
        fetchNextPage,
      });
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Load older messages",
      }),
    );

    await waitFor(() => {
      expect(fetchNextPage).toHaveBeenCalledTimes(1);
    });

    Object.defineProperty(scroller, "scrollHeight", {
      configurable: true,
      value: 1500,
    });

    rerender(
      <StudentChatWorkspace
        enrollmentId="enrollment-1"
        selectedChatSessionId="chat-session-2"
      />,
    );

    await waitFor(() => {
      expect(scroller.scrollTop).toBe(800);
    });
  });

  it("opens an existing conversation at the newest loaded messages", async () => {
    useChatMessages.mockReturnValue({
      data: {
        pages: [
          {
            items: [
              {
                id: "message-21",
                chat_session_id: "chat-session-2",
                role: "user",
                content: "Newest user message",
                provider: null,
                model: null,
                created_at: "2026-08-25T00:20:00Z",
              },
              {
                id: "message-22",
                chat_session_id: "chat-session-2",
                role: "assistant",
                content: "Newest assistant message",
                provider: "ollama",
                model: "gemma4:cloud",
                created_at: "2026-08-25T00:20:01Z",
              },
            ],
            page: 1,
            page_size: 20,
            total: 22,
          },
        ],
        pageParams: [1],
      },

      isPending: false,
      isError: false,
      error: null,

      hasNextPage: true,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    });

    const scrollHeightSpy = vi
      .spyOn(HTMLElement.prototype, "scrollHeight", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.dataset.testid === "chat-message-scroll") {
          return 1400;
        }

        return 0;
      });

    try {
      render(
        <StudentChatWorkspace
          enrollmentId="enrollment-1"
          selectedChatSessionId="chat-session-2"
        />,
      );

      const scroller = screen.getByTestId("chat-message-scroll");

      await waitFor(() => {
        expect(scroller.scrollTop).toBe(1400);
      });
    } finally {
      scrollHeightSpy.mockRestore();
    }
  });

  it("follows newly appended messages when the student is already near the bottom", async () => {
    let scrollHeight = 1400;

    const scrollHeightSpy = vi
      .spyOn(HTMLElement.prototype, "scrollHeight", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.dataset.testid === "chat-message-scroll") {
          return scrollHeight;
        }

        return 0;
      });

    const clientHeightSpy = vi
      .spyOn(HTMLElement.prototype, "clientHeight", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.dataset.testid === "chat-message-scroll") {
          return 600;
        }

        return 0;
      });

    const newestPage = {
      items: [
        {
          id: "message-21",
          chat_session_id: "chat-session-2",
          role: "user" as const,
          content: "Existing user message",
          provider: null,
          model: null,
          created_at: "2026-08-25T00:20:00Z",
        },
        {
          id: "message-22",
          chat_session_id: "chat-session-2",
          role: "assistant" as const,
          content: "Existing assistant message",
          provider: "ollama",
          model: "gemma4:cloud",
          created_at: "2026-08-25T00:20:01Z",
        },
      ],
      page: 1,
      page_size: 20,
      total: 2,
    };

    useChatMessages.mockReturnValue({
      data: {
        pages: [newestPage],
        pageParams: [1],
      },

      isPending: false,
      isError: false,
      error: null,

      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    });

    const { rerender } = render(
      <StudentChatWorkspace
        enrollmentId="enrollment-1"
        selectedChatSessionId="chat-session-2"
      />,
    );

    const scroller = screen.getByTestId("chat-message-scroll");

    // Initial conversation opening should already have placed us at the bottom.
    expect(scroller.scrollTop).toBe(1400);

    // Simulate the student remaining close to the visible bottom.
    //
    // scrollHeight - clientHeight - scrollTop
    // = 1400 - 600 - 750
    // = 50px from the bottom.
    scroller.scrollTop = 750;

    scrollHeight = 1600;

    useChatMessages.mockReturnValue({
      data: {
        pages: [
          {
            ...newestPage,
            items: [
              ...newestPage.items,
              {
                id: "message-23",
                chat_session_id: "chat-session-2",
                role: "user" as const,
                content: "New user message",
                provider: null,
                model: null,
                created_at: "2026-08-25T00:21:00Z",
              },
              {
                id: "message-24",
                chat_session_id: "chat-session-2",
                role: "assistant" as const,
                content: "New assistant response",
                provider: "ollama",
                model: "gemma4:cloud",
                created_at: "2026-08-25T00:21:01Z",
              },
            ],
            total: 4,
          },
        ],
        pageParams: [1],
      },

      isPending: false,
      isError: false,
      error: null,

      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    });

    rerender(
      <StudentChatWorkspace
        enrollmentId="enrollment-1"
        selectedChatSessionId="chat-session-2"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("New assistant response")).toBeInTheDocument();

      expect(scroller.scrollTop).toBe(1600);
    });

    scrollHeightSpy.mockRestore();
    clientHeightSpy.mockRestore();
  });

  it("preserves the reading position when new messages arrive while the student is scrolled up", async () => {
    let scrollHeight = 1400;

    const scrollHeightSpy = vi
      .spyOn(HTMLElement.prototype, "scrollHeight", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.dataset.testid === "chat-message-scroll") {
          return scrollHeight;
        }

        return 0;
      });

    const clientHeightSpy = vi
      .spyOn(HTMLElement.prototype, "clientHeight", "get")
      .mockImplementation(function (this: HTMLElement) {
        if (this.dataset.testid === "chat-message-scroll") {
          return 600;
        }

        return 0;
      });

    const newestPage = {
      items: [
        {
          id: "message-21",
          chat_session_id: "chat-session-2",
          role: "user" as const,
          content: "Existing user message",
          provider: null,
          model: null,
          created_at: "2026-08-25T00:20:00Z",
        },
        {
          id: "message-22",
          chat_session_id: "chat-session-2",
          role: "assistant" as const,
          content: "Existing assistant message",
          provider: "ollama",
          model: "gemma4:cloud",
          created_at: "2026-08-25T00:20:01Z",
        },
      ],
      page: 1,
      page_size: 20,
      total: 2,
    };

    useChatMessages.mockReturnValue({
      data: {
        pages: [newestPage],
        pageParams: [1],
      },

      isPending: false,
      isError: false,
      error: null,

      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    });

    const { rerender } = render(
      <StudentChatWorkspace
        enrollmentId="enrollment-1"
        selectedChatSessionId="chat-session-2"
      />,
    );

    const scroller = screen.getByTestId("chat-message-scroll");

    expect(scroller.scrollTop).toBe(1400);

    // Student intentionally scrolls upward.
    //
    // Previous distance from bottom:
    // 1400 - 600 - 300 = 500px
    //
    // This is well outside the 100px auto-follow threshold.
    scroller.scrollTop = 300;

    scrollHeight = 1600;

    useChatMessages.mockReturnValue({
      data: {
        pages: [
          {
            ...newestPage,
            items: [
              ...newestPage.items,
              {
                id: "message-23",
                chat_session_id: "chat-session-2",
                role: "user" as const,
                content: "New user message while reading history",
                provider: null,
                model: null,
                created_at: "2026-08-25T00:21:00Z",
              },
              {
                id: "message-24",
                chat_session_id: "chat-session-2",
                role: "assistant" as const,
                content: "New assistant response while reading history",
                provider: "ollama",
                model: "gemma4:cloud",
                created_at: "2026-08-25T00:21:01Z",
              },
            ],
            total: 4,
          },
        ],
        pageParams: [1],
      },

      isPending: false,
      isError: false,
      error: null,

      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    });

    rerender(
      <StudentChatWorkspace
        enrollmentId="enrollment-1"
        selectedChatSessionId="chat-session-2"
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText("New assistant response while reading history"),
      ).toBeInTheDocument();
    });

    expect(scroller.scrollTop).toBe(300);

    scrollHeightSpy.mockRestore();
    clientHeightSpy.mockRestore();
  });

  it("opens chat session navigation from the conversation header", () => {
    render(
      <StudentChatWorkspace
        enrollmentId="enrollment-1"
        selectedChatSessionId="chat-session-2"
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Open chats",
      }),
    );

    const chatsDialog = screen.getByRole("dialog", {
      name: "Chats",
    });

    expect(chatsDialog).toBeInTheDocument();

    expect(
      within(chatsDialog).getByText("Maxwell equations"),
    ).toBeInTheDocument();

    expect(within(chatsDialog).getByText("Electric flux")).toBeInTheDocument();

    expect(
      within(chatsDialog).getByRole("button", {
        name: "New chat",
      }),
    ).toBeInTheDocument();
  });

  it("enters and exits chat fullscreen mode", () => {
    render(
      <StudentChatWorkspace
        enrollmentId="enrollment-1"
        selectedChatSessionId="chat-session-2"
      />,
    );

    const enterFullscreen = screen.getByRole("button", {
      name: "Enter fullscreen",
    });

    fireEvent.click(enterFullscreen);

    expect(
      screen.getByRole("button", {
        name: "Exit fullscreen",
      }),
    ).toBeInTheDocument();

    fireEvent.keyDown(document, {
      key: "Escape",
    });

    expect(
      screen.getByRole("button", {
        name: "Enter fullscreen",
      }),
    ).toBeInTheDocument();
  });
});
