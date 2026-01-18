import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertMessage, type Message } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useMessages(userId: number) {
  return useQuery({
    queryKey: [api.messages.list.path, userId],
    queryFn: async () => {
      const url = buildUrl(api.messages.list.path, { userId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return await res.json() as Message[];
    },
    enabled: !!userId,
    refetchInterval: 3000, // Simple polling for messages
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<InsertMessage, "senderId">) => {
      const res = await fetch(api.messages.send.path, {
        method: api.messages.send.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return await res.json() as Message;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.messages.list.path, variables.receiverId] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    },
  });
}
