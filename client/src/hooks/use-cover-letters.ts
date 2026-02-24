import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertCoverLetter } from "@shared/schema";
import { z } from "zod";
import { apiFetch } from "@/lib/api-fetch";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useCoverLetters() {
  return useQuery({
    queryKey: [api.coverLetters.list.path],
    queryFn: async () => {
      const res = await apiFetch(api.coverLetters.list.path);
      if (!res.ok) throw new Error("Failed to fetch cover letters");
      return parseWithLogging(api.coverLetters.list.responses[200], await res.json(), "coverLetters.list");
    },
  });
}

export function useCoverLetter(id: number) {
  return useQuery({
    queryKey: [api.coverLetters.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.coverLetters.get.path, { id });
      const res = await apiFetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch cover letter");
      return parseWithLogging(api.coverLetters.get.responses[200], await res.json(), "coverLetters.get");
    },
    enabled: !!id,
  });
}

export function useCreateCoverLetter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertCoverLetter) => {
      const validated = api.coverLetters.create.input.parse(data);
      const res = await apiFetch(api.coverLetters.create.path, {
        method: api.coverLetters.create.method,
        body: JSON.stringify(validated),
      });
      if (!res.ok) throw new Error("Failed to save cover letter");
      return parseWithLogging(api.coverLetters.create.responses[201], await res.json(), "coverLetters.create");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.coverLetters.list.path] }),
  });
}

export function useUpdateCoverLetter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertCoverLetter>) => {
      const validated = api.coverLetters.update.input.parse(updates);
      const url = buildUrl(api.coverLetters.update.path, { id });
      const res = await apiFetch(url, {
        method: api.coverLetters.update.method,
        body: JSON.stringify(validated),
      });
      if (!res.ok) throw new Error("Failed to update cover letter");
      return parseWithLogging(api.coverLetters.update.responses[200], await res.json(), "coverLetters.update");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.coverLetters.list.path] }),
  });
}

export function useDeleteCoverLetter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.coverLetters.delete.path, { id });
      const res = await apiFetch(url, { method: api.coverLetters.delete.method });
      if (!res.ok) throw new Error("Failed to delete cover letter");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.coverLetters.list.path] }),
  });
}

export function useGenerateCoverLetter() {
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.coverLetters.generate.input>) => {
      const validated = api.coverLetters.generate.input.parse(data);
      const res = await apiFetch(api.coverLetters.generate.path, {
        method: api.coverLetters.generate.method,
        body: JSON.stringify(validated),
      });
      if (!res.ok) throw new Error("Failed to generate cover letter content");
      return parseWithLogging(api.coverLetters.generate.responses[200], await res.json(), "coverLetters.generate");
    },
  });
}
