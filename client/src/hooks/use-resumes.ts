import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertResume } from "@shared/schema";
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

export function useResumes() {
  return useQuery({
    queryKey: [api.resumes.list.path],
    queryFn: async () => {
      const res = await apiFetch(api.resumes.list.path);
      if (!res.ok) throw new Error("Failed to fetch resumes");
      return parseWithLogging(api.resumes.list.responses[200], await res.json(), "resumes.list");
    },
  });
}

export function useResume(id: number) {
  return useQuery({
    queryKey: [api.resumes.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.resumes.get.path, { id });
      const res = await apiFetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch resume");
      return parseWithLogging(api.resumes.get.responses[200], await res.json(), "resumes.get");
    },
    enabled: !!id,
  });
}

export function useCreateResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertResume) => {
      const validated = api.resumes.create.input.parse(data);
      const res = await apiFetch(api.resumes.create.path, {
        method: api.resumes.create.method,
        body: JSON.stringify(validated),
      });
      if (!res.ok) throw new Error("Failed to save resume");
      return parseWithLogging(api.resumes.create.responses[201], await res.json(), "resumes.create");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.resumes.list.path] }),
  });
}

export function useUpdateResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertResume>) => {
      const validated = api.resumes.update.input.parse(updates);
      const url = buildUrl(api.resumes.update.path, { id });
      const res = await apiFetch(url, {
        method: api.resumes.update.method,
        body: JSON.stringify(validated),
      });
      if (!res.ok) throw new Error("Failed to update resume");
      return parseWithLogging(api.resumes.update.responses[200], await res.json(), "resumes.update");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.resumes.list.path] }),
  });
}

export function useDeleteResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.resumes.delete.path, { id });
      const res = await apiFetch(url, { method: api.resumes.delete.method });
      if (!res.ok) throw new Error("Failed to delete resume");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.resumes.list.path] }),
  });
}

export function useGenerateResume() {
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.resumes.generate.input>) => {
      const validated = api.resumes.generate.input.parse(data);
      const res = await apiFetch(api.resumes.generate.path, {
        method: api.resumes.generate.method,
        body: JSON.stringify(validated),
      });
      if (!res.ok) throw new Error("Failed to generate resume content");
      return parseWithLogging(api.resumes.generate.responses[200], await res.json(), "resumes.generate");
    },
  });
}

export function useOptimizeResume() {
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.resumes.optimize.input>) => {
      const validated = api.resumes.optimize.input.parse(data);
      const res = await apiFetch(api.resumes.optimize.path, {
        method: api.resumes.optimize.method,
        body: JSON.stringify(validated),
      });
      if (!res.ok) throw new Error("Failed to optimize resume");
      return parseWithLogging(api.resumes.optimize.responses[200], await res.json(), "resumes.optimize");
    },
  });
}
