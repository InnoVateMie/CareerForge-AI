import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { api } from "@shared/routes";
import { z } from "zod";

type GenerateParams = z.infer<typeof api.interview.generateQuestions.input>;
type GenerateResult = z.infer<typeof api.interview.generateQuestions.responses[200]>;

type EvaluateParams = z.infer<typeof api.interview.evaluateAnswer.input>;
type EvaluateResult = z.infer<typeof api.interview.evaluateAnswer.responses[200]>;

export function useInterview() {
    const generateMutation = useMutation({
        mutationFn: async (params: GenerateParams) => {
            const res = await apiRequest("POST", api.interview.generateQuestions.path, params);
            return (await res.json()) as GenerateResult;
        },
    });

    const evaluateMutation = useMutation({
        mutationFn: async (params: EvaluateParams) => {
            const res = await apiRequest("POST", api.interview.evaluateAnswer.path, params);
            return (await res.json()) as EvaluateResult;
        },
    });

    return { generateMutation, evaluateMutation };
}
