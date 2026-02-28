import serverless from "serverless-http";
import { createApp } from "../server/app";

// Cache the handler for better performance
let cachedHandler: ReturnType<typeof serverless> | null = null;
let initError: Error | null = null;

const initHandler = async () => {
    if (cachedHandler) return cachedHandler;
    if (initError) throw initError;
    
    try {
        console.log("[api] Initializing app...");
        const app = await createApp();
        cachedHandler = serverless(app);
        console.log("[api] App initialized successfully");
        return cachedHandler;
    } catch (err) {
        console.error("[api] Failed to initialize app:", err);
        initError = err as Error;
        throw err;
    }
};

// Pre-initialize
const initPromise = initHandler().catch(() => null);

export const handler = async (event: any, context: any) => {
    // Log all requests
    console.log("[api] Request:", event.httpMethod, event.path);
    
    try {
        // Wait for initialization
        await initPromise;
        
        if (!cachedHandler) {
            throw initError || new Error("Handler not initialized");
        }
        
        // Process the request
        const result = await cachedHandler(event, context) as any;
        console.log("[api] Response:", result?.statusCode);
        return result;
        
    } catch (err: any) {
        console.error("[api] Error:", err);
        
        // Return detailed error for debugging
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Internal Server Error",
                message: err?.message || "Unknown error",
                stack: err?.stack,
                env: {
                    hasDatabaseUrl: !!process.env.DATABASE_URL,
                    hasGeminiKey: !!process.env.GOOGLE_GEMINI_API_KEY,
                    nodeEnv: process.env.NODE_ENV
                }
            }),
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        };
    }
};
