"use client";

import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  archiveChatSession,
  createChatMessage,
  createChatSession,
  getChatSession,
  listChatMessages,
  listChatSessions,
  updateChatSession,
} from "@/features/student-chat/api/student-chat-client";
import type { ChatMessage } from "@/features/student-chat/types";
import type { PaginatedView } from "@/lib/api/types";

export const studentChatKeys = {
  all: ["student-chat"] as const,

  sessions: (learningRecordId: string, pageSize: number) =>
    [...studentChatKeys.all, "sessions", learningRecordId, pageSize] as const,

  session: (chatSessionId: string) =>
    [...studentChatKeys.all, "session", chatSessionId] as const,

  messages: (chatSessionId: string, pageSize: number) =>
    [...studentChatKeys.all, "messages", chatSessionId, pageSize] as const,
};

export function useCreateChatMessage(
  chatSessionId: string,
  learningRecordId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => createChatMessage(chatSessionId, content),

    onSuccess: async (turn) => {
      let requiresMessageRefetch = false;

      queryClient.setQueriesData<InfiniteData<PaginatedView<ChatMessage>>>(
        {
          queryKey: [...studentChatKeys.all, "messages", chatSessionId],
        },
        (cached) => {
          if (!cached) {
            return cached;
          }

          const newestPage = cached.pages[0];

          if (!newestPage) {
            requiresMessageRefetch = true;
            return cached;
          }

          const containsFullConversation =
            cached.pages.length === 1 &&
            newestPage.page === 1 &&
            newestPage.total === newestPage.items.length &&
            newestPage.items.length + 2 <= newestPage.page_size;

          if (!containsFullConversation) {
            requiresMessageRefetch = true;
            return cached;
          }

          return {
            ...cached,
            pages: [
              {
                ...newestPage,
                items: [
                  ...newestPage.items,
                  turn.user_message,
                  turn.assistant_message,
                ],
                total: newestPage.total + 2,
              },
              ...cached.pages.slice(1),
            ],
          };
        },
      );

      const invalidations: Promise<unknown>[] = [
        queryClient.invalidateQueries({
          queryKey: studentChatKeys.session(chatSessionId),
        }),

        queryClient.invalidateQueries({
          queryKey: [...studentChatKeys.all, "sessions", learningRecordId],
        }),
      ];

      if (requiresMessageRefetch) {
        invalidations.push(
          queryClient.invalidateQueries({
            queryKey: [...studentChatKeys.all, "messages", chatSessionId],
          }),
        );
      }

      await Promise.all(invalidations);
    },
  });
}

export function useChatSessions(learningRecordId: string, pageSize = 20) {
  return useInfiniteQuery({
    queryKey: studentChatKeys.sessions(learningRecordId, pageSize),

    queryFn: ({ pageParam }) =>
      listChatSessions(learningRecordId, pageParam, pageSize),

    initialPageParam: 1,

    getNextPageParam: (lastPage) => {
      const loadedThrough = lastPage.page * lastPage.page_size;

      return loadedThrough < lastPage.total ? lastPage.page + 1 : undefined;
    },

    staleTime: 15_000,
    enabled: learningRecordId.length > 0,
  });
}

export function useChatSession(chatSessionId: string) {
  return useQuery({
    queryKey: studentChatKeys.session(chatSessionId),
    queryFn: () => getChatSession(chatSessionId),
    staleTime: 15_000,
    retry: false,
  });
}

export function useChatMessages(chatSessionId: string, pageSize = 20) {
  return useInfiniteQuery({
    queryKey: studentChatKeys.messages(chatSessionId, pageSize),

    queryFn: ({ pageParam }) =>
      listChatMessages(chatSessionId, pageParam, pageSize),

    initialPageParam: 1,

    getNextPageParam: (lastPage) => {
      const loadedThrough = lastPage.page * lastPage.page_size;

      return loadedThrough < lastPage.total ? lastPage.page + 1 : undefined;
    },

    staleTime: 0,
    retry: false,
  });
}

export function useCreateChatSession(learningRecordId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (!learningRecordId) {
        throw new Error(
          "A learning record is required before creating a chat session.",
        );
      }

      return createChatSession(learningRecordId);
    },

    onSuccess: async (session) => {
      queryClient.setQueryData(studentChatKeys.session(session.id), {
        ...session,
        archived_at: null,
      });

      await queryClient.invalidateQueries({
        queryKey: [...studentChatKeys.all, "sessions", learningRecordId],
      });
    },
  });
}

export function useUpdateChatSession(
  chatSessionId: string,
  learningRecordId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title: string) => updateChatSession(chatSessionId, title),

    onSuccess: async (session) => {
      queryClient.setQueryData(studentChatKeys.session(chatSessionId), session);

      await queryClient.invalidateQueries({
        queryKey: [...studentChatKeys.all, "sessions", learningRecordId],
      });
    },
  });
}

export function useArchiveChatSession(
  chatSessionId: string,
  learningRecordId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => archiveChatSession(chatSessionId),

    onSuccess: async () => {
      queryClient.removeQueries({
        queryKey: studentChatKeys.session(chatSessionId),
        exact: true,
      });

      queryClient.removeQueries({
        queryKey: [...studentChatKeys.all, "messages", chatSessionId],
      });

      await queryClient.invalidateQueries({
        queryKey: [...studentChatKeys.all, "sessions", learningRecordId],
      });
    },
  });
}
