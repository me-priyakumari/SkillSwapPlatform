import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertRequest, type SwapRequest, type Skill, type User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

type RequestWithDetails = SwapRequest & { skill: Skill; otherUser: User };

export function useRequests() {
  return useQuery({
    queryKey: [api.requests.list.path],
    queryFn: async () => {
      const res = await fetch(api.requests.list.path);
      if (!res.ok) throw new Error("Failed to fetch requests");
      return await res.json() as RequestWithDetails[];
    },
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<InsertRequest, "senderId" | "status">) => {
      const res = await fetch(api.requests.create.path, {
        method: api.requests.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to send request");
      return await res.json() as SwapRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.requests.list.path] });
      toast({ title: "Request Sent", description: "The user has been notified." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send request", variant: "destructive" });
    },
  });
}

export function useUpdateRequestStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "accepted" | "rejected" }) => {
      const url = buildUrl(api.requests.updateStatus.path, { id });
      const res = await fetch(url, {
        method: api.requests.updateStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return await res.json() as SwapRequest;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: [api.requests.list.path] });
      toast({ 
        title: status === "accepted" ? "Request Accepted" : "Request Rejected", 
        description: status === "accepted" ? "You can now chat with this user." : undefined 
      });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update request", variant: "destructive" });
    },
  });
}
