// Simple health check endpoint that doesn't require full app initialization
export const handler = async (event: any, context: any) => {
    // Log environment info for debugging
    console.log("[api] Function invoked", {
        path: event.path,
        httpMethod: event.httpMethod,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasGeminiKey: !!process.env.GOOGLE_GEMINI_API_KEY,
        nodeEnv: process.env.NODE_ENV
    });

    // Health check endpoint
    if (event.path === "/api" || event.path === "/api/" || event.path === "/api/health") {
        return {
            statusCode: 200,
            body: JSON.stringify({
                status: "alive",
                message: "CareerForge-AI API is running (diagnostic mode)",
                env: {
                    hasDatabaseUrl: !!process.env.DATABASE_URL,
                    hasGeminiKey: !!process.env.GOOGLE_GEMINI_API_KEY,
                    nodeEnv: process.env.NODE_ENV
                }
            }),
            headers: { "Content-Type": "application/json" }
        };
    }

    // For all other routes, return diagnostic info
    return {
        statusCode: 503,
        body: JSON.stringify({
            error: "Service Temporarily Unavailable",
            message: "API is in diagnostic mode. Full service coming soon.",
            path: event.path,
            env: {
                hasDatabaseUrl: !!process.env.DATABASE_URL,
                hasGeminiKey: !!process.env.GOOGLE_GEMINI_API_KEY
            }
        }),
        headers: { "Content-Type": "application/json" }
    };
};
