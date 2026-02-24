import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { apiFetch } from "./api-fetch";

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  return apiFetch(url, {
    method,
    body: data ? JSON.stringify(data) : undefined,
  });
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }) => {
      try {
        const res = await apiFetch(queryKey.join("/") as string);
        return await res.json();
      } catch (err: any) {
        if (unauthorizedBehavior === "returnNull" && err.message.startsWith("401")) {
          return null;
        }
        throw err;
      }
    };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
