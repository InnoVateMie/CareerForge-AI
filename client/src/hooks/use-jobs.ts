import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { api } from "@shared/routes";
import { z } from "zod";

type JobFetchInput = z.infer<typeof api.jobs.fetch.input>;
type JobFetchResponse = z.infer<typeof api.jobs.fetch.responses[200]>;

export function useFetchJob() {
    return useMutation({
        mutationFn: async (input: JobFetchInput) => {
            const res = await apiRequest("POST", api.jobs.fetch.path, input);
            return (await res.json()) as JobFetchResponse;
        },
    });
}
