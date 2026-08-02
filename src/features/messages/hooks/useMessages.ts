import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import { messagesApi } from "@/features/messages/api/messagesApi";
import type {
  SendQuickMessageInput,
  UpsertQuickMessageTemplateInput,
} from "@/features/messages/types";

export function useQuickMessageTemplates() {
  return useQuery({
    queryKey: queryKeys.quickMessageTemplates,
    queryFn: ({ signal }) => messagesApi.getTemplates(signal),
  });
}

export function useQuickMessageHistory(otherPublicProfileId?: string | null) {
  return useQuery({
    queryKey: queryKeys.quickMessageHistory(otherPublicProfileId),
    queryFn: ({ signal }) =>
      messagesApi.getHistory(otherPublicProfileId, signal),
  });
}

export function useQuickMessageUnreadCount() {
  return useQuery({
    queryKey: queryKeys.quickMessageUnreadCount,
    queryFn: ({ signal }) => messagesApi.getUnreadCount(signal),
    refetchInterval: 60_000,
  });
}

function useInvalidateMessages() {
  const client = useQueryClient();
  return async () => {
    await client.invalidateQueries({ queryKey: queryKeys.quickMessages });
  };
}

export function useCreateQuickMessageTemplate() {
  const invalidate = useInvalidateMessages();
  return useMutation({
    mutationFn: (input: UpsertQuickMessageTemplateInput) =>
      messagesApi.createTemplate(input),
    onSuccess: invalidate,
  });
}

export function useUpdateQuickMessageTemplate() {
  const invalidate = useInvalidateMessages();
  return useMutation({
    mutationFn: ({
      publicTemplateId,
      input,
    }: {
      publicTemplateId: string;
      input: UpsertQuickMessageTemplateInput;
    }) => messagesApi.updateTemplate(publicTemplateId, input),
    onSuccess: invalidate,
  });
}

export function useDeleteQuickMessageTemplate() {
  const invalidate = useInvalidateMessages();
  return useMutation({
    mutationFn: (publicTemplateId: string) =>
      messagesApi.deleteTemplate(publicTemplateId),
    onSuccess: invalidate,
  });
}

export function useSendQuickMessage() {
  const invalidate = useInvalidateMessages();
  return useMutation({
    mutationFn: (input: SendQuickMessageInput) => messagesApi.send(input),
    onSuccess: invalidate,
  });
}

export function useMarkQuickMessageRead() {
  const invalidate = useInvalidateMessages();
  return useMutation({
    mutationFn: (publicMessageId: string) => messagesApi.markRead(publicMessageId),
    onSuccess: invalidate,
  });
}
