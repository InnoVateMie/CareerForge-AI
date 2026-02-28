import { z } from "zod";
import { insertResumeSchema, insertCoverLetterSchema, resumes, coverLetters } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string()
  })
};

export const api = {
  resumes: {
    list: {
      method: "GET" as const,
      path: "/api/resumes" as const,
      responses: {
        200: z.array(z.custom<typeof resumes.$inferSelect>()),
        401: errorSchemas.unauthorized
      }
    },
    get: {
      method: "GET" as const,
      path: "/api/resumes/:id" as const,
      responses: {
        200: z.custom<typeof resumes.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized
      }
    },
    create: {
      method: "POST" as const,
      path: "/api/resumes" as const,
      input: insertResumeSchema,
      responses: {
        201: z.custom<typeof resumes.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized
      }
    },
    update: {
      method: "PUT" as const,
      path: "/api/resumes/:id" as const,
      input: insertResumeSchema.partial(),
      responses: {
        200: z.custom<typeof resumes.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized
      }
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/resumes/:id" as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized
      }
    },
    generate: {
      method: "POST" as const,
      path: "/api/resumes/generate" as const,
      input: z.object({
        fullName: z.string(),
        email: z.string(),
        phone: z.string(),
        address: z.string(),
        jobTitle: z.string(),
        skills: z.string(),
        hobbies: z.string().optional(),
        workExperience: z.array(z.object({
          company: z.string(),
          role: z.string(),
          start: z.string(),
          end: z.string(),
          description: z.string(),
        })),
        education: z.array(z.object({
          school: z.string(),
          degree: z.string(),
          start: z.string(),
          end: z.string(),
        })),
        certifications: z.array(z.object({
          name: z.string(),
          issuer: z.string(),
          date: z.string(),
        })).optional(),
        targetJobDescription: z.string().optional(),
      }),
      responses: {
        200: z.object({ content: z.string() }),
        500: errorSchemas.internal,
        401: errorSchemas.unauthorized
      }
    },
    optimize: {
      method: "POST" as const,
      path: "/api/resumes/optimize" as const,
      input: z.object({
        existingResume: z.string(),
        targetJobDescription: z.string(),
      }),
      responses: {
        200: z.object({ analysis: z.string(), suggestions: z.string() }),
        500: errorSchemas.internal,
        401: errorSchemas.unauthorized
      }
    }
  },
  coverLetters: {
    list: {
      method: "GET" as const,
      path: "/api/cover-letters" as const,
      responses: {
        200: z.array(z.custom<typeof coverLetters.$inferSelect>()),
        401: errorSchemas.unauthorized
      }
    },
    get: {
      method: "GET" as const,
      path: "/api/cover-letters/:id" as const,
      responses: {
        200: z.custom<typeof coverLetters.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized
      }
    },
    create: {
      method: "POST" as const,
      path: "/api/cover-letters" as const,
      input: insertCoverLetterSchema,
      responses: {
        201: z.custom<typeof coverLetters.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized
      }
    },
    update: {
      method: "PUT" as const,
      path: "/api/cover-letters/:id" as const,
      input: insertCoverLetterSchema.partial(),
      responses: {
        200: z.custom<typeof coverLetters.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized
      }
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/cover-letters/:id" as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized
      }
    },
    generate: {
      method: "POST" as const,
      path: "/api/cover-letters/generate" as const,
      input: z.object({
        companyName: z.string(),
        jobRole: z.string(),
        skills: z.string(),
        experienceSummary: z.string(),
      }),
      responses: {
        200: z.object({ content: z.string() }),
        500: errorSchemas.internal,
        401: errorSchemas.unauthorized
      }
    }
  },
  jobs: {
    fetch: {
      method: "POST" as const,
      path: "/api/jobs/fetch" as const,
      input: z.object({ url: z.string().url() }),
      responses: {
        200: z.object({
          jobTitle: z.string(),
          companyName: z.string(),
          requirements: z.string(),
          description: z.string(),
        }),
        500: errorSchemas.internal,
        401: errorSchemas.unauthorized,
      },
    },
  },
  interview: {
    generateQuestions: {
      method: "POST" as const,
      path: "/api/interview/generate" as const,
      input: z.object({
        resumeContent: z.string(),
        jobDescription: z.string(),
      }),
      responses: {
        200: z.object({
          questions: z.array(z.object({
            question: z.string(),
            context: z.string(),
          })),
        }),
        500: errorSchemas.internal,
        401: errorSchemas.unauthorized,
      },
    },
    evaluateAnswer: {
      method: "POST" as const,
      path: "/api/interview/evaluate" as const,
      input: z.object({
        question: z.string(),
        answer: z.string(),
        context: z.string(),
      }),
      responses: {
        200: z.object({
          feedback: z.string(),
          score: z.number().min(0).max(10),
          improvedAnswer: z.string(),
        }),
        500: errorSchemas.internal,
        401: errorSchemas.unauthorized,
      },
    }
  },
  linkedin: {
    optimizeProfile: {
      method: "POST" as const,
      path: "/api/linkedin/optimize" as const,
      input: z.object({
        profileOrResumeContent: z.string().optional(),
        linkedinUrl: z.string().optional(),
      }),
      responses: {
        200: z.object({
          headline: z.string(),
          summary: z.string(),
          experienceSuggestions: z.array(z.string()),
        }),
        500: errorSchemas.internal,
        401: errorSchemas.unauthorized,
      },
    }
  },
  payments: {
    createStripeIntent: {
      method: "POST" as const,
      path: "/api/payments/stripe/create-intent" as const,
      input: z.object({}),
      responses: {
        200: z.object({ clientSecret: z.string() }),
        500: errorSchemas.internal,
        401: errorSchemas.unauthorized
      }
    },
    verifyStripePayment: {
      method: "POST" as const,
      path: "/api/payments/stripe/verify" as const,
      input: z.object({ paymentIntentId: z.string() }),
      responses: {
        200: z.object({ success: z.boolean() }),
        500: errorSchemas.internal,
        401: errorSchemas.unauthorized
      }
    },
    createPaypalOrder: {
      method: "POST" as const,
      path: "/api/payments/paypal/create-order" as const,
      input: z.object({}),
      responses: {
        200: z.object({ orderID: z.string() }),
        500: errorSchemas.internal,
        401: errorSchemas.unauthorized
      }
    },
    capturePaypalOrder: {
      method: "POST" as const,
      path: "/api/payments/paypal/capture-order" as const,
      input: z.object({ orderID: z.string() }),
      responses: {
        200: z.object({ success: z.boolean() }),
        500: errorSchemas.internal,
        401: errorSchemas.unauthorized
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type ResumeResponse = z.infer<typeof api.resumes.get.responses[200]>;
export type CoverLetterResponse = z.infer<typeof api.coverLetters.get.responses[200]>;
