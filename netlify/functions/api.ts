import serverless from "serverless-http";
import { createApp } from "../../server/app";

// Initialize handler immediately for better cold start performance
let cachedHandler: ReturnType<typeof serverless> | null = null;

const initHandler = async () => {
    if (!cachedHandler) {
        try {
            const app = await createApp();
            cachedHandler = serverless(app);
        } catch (err) {
            console.error("[api] Failed to initialize app:", err);
            throw err;
        }
    }
    return cachedHandler;
};

// Pre-initialize on module load
const initPromise = initHandler();

export const handler = async (event: any, context: any) => {
    try {
        const handler = await initPromise;
        return await handler(event, context);
    } catch (err: any) {
        console.error("[api] Handler error:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: "Internal Server Error", 
                message: err?.message || "Unknown error",
                stack: process.env.NODE_ENV === "development" ? err?.stack : undefined
            }),
            headers: {
                "Content-Type": "application/json"
            }
        };
    }
};
