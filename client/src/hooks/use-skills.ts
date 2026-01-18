import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertSkill, type Skill, type User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

type SkillWithUser = Skill & { user: User };

export function useSkills(filters?: { category?: string; search?: string; type?: 'teach' | 'learn' }) {
  const queryKey = [api.skills.list.path, filters];
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      // Build query string manually since filters is an object
      const params = new URLSearchParams();
      if (filters?.category) params.append("category", filters.category);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.type) params.append("type", filters.type);
      
      const url = `${api.skills.list.path}?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch skills");
      return await res.json() as SkillWithUser[];
    },
  });
}

export function useCreateSkill() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (skill: Omit<InsertSkill, "userId">) => {
      const res = await fetch(api.skills.create.path, {
        method: api.skills.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(skill),
      });
      if (!res.ok) throw new Error("Failed to create skill");
      return await res.json() as Skill;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.skills.list.path] });
      toast({ title: "Success", description: "Skill added to your profile" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add skill", variant: "destructive" });
    },
  });
}
