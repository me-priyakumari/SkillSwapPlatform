import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertReview, type Review, type User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

type ReviewWithAuthor = Review & { author: User };

export function useReviews(userId: number) {
  return useQuery({
    queryKey: [api.reviews.list.path, userId],
    queryFn: async () => {
      const url = buildUrl(api.reviews.list.path, { userId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return await res.json() as ReviewWithAuthor[];
    },
    enabled: !!userId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<InsertReview, "authorId">) => {
      const res = await fetch(api.reviews.create.path, {
        method: api.reviews.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to submit review");
      return await res.json() as Review;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.reviews.list.path, variables.targetId] });
      toast({ title: "Review Submitted", description: "Thanks for your feedback!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit review", variant: "destructive" });
    },
  });
}
