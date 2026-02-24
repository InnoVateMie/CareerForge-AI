import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";

export async function createApp() {
    const app = express();

    app.use(cors({
        origin: true, // Allow all origins for simplicity in troubleshooting
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }));

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // Logging middleware
    app.use((req, res, next) => {
        const start = Date.now();
        console.log(`[express] incoming: ${req.method} ${req.url} (path: ${req.path}, orig: ${req.originalUrl})`);
        res.on("finish", () => {
            const duration = Date.now() - start;
            console.log(`[express] ${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
        });
        next();
    });

    // Netlify Path Normalization Middleware
    app.use((req, res, next) => {
        const netlifyPrefix = "/.netlify/functions/api";
        if (req.url.startsWith(netlifyPrefix)) {
            const oldUrl = req.url;
            req.url = req.url.replace(netlifyPrefix, "/api");
            if (req.url === "") req.url = "/";
            console.log(`[normalize] ${oldUrl} -> ${req.url}`);
        } else if (req.path.startsWith("/api/api/")) {
            // Handle accidental double prefixing
            req.url = req.url.replace("/api/api/", "/api/");
            console.log(`[normalize] Double prefix fix: ${req.url}`);
        }
        next();
    });

    // Diagnostic route (Root)
    const aliveHandler = (req: Request, res: Response) => {
        res.json({
            status: "alive",
            message: "CareerForge-AI API is running.",
            path: req.path,
            url: req.url,
            originalUrl: req.originalUrl,
            env: process.env.NODE_ENV
        });
    };
    app.get("/api", aliveHandler);
    app.get("/api/health", aliveHandler);
    app.get("/api/", aliveHandler);

    app.get("/api/debug/full", async (req, res) => {
        const report: any = {
            version: "DR-006-LIST-MODELS", // Listing all IDs
            timestamp: new Date().toISOString(),
            env: {
                HAS_DB_URL: !!process.env.DATABASE_URL,
                HAS_GEMINI_KEY: !!process.env.GOOGLE_GEMINI_API_KEY,
                GEMINI_KEY_PREFIX: process.env.GOOGLE_GEMINI_API_KEY?.substring(0, 4),
                KEY_LENGTH: process.env.GOOGLE_GEMINI_API_KEY?.length
            },
            tests: {}
        };

        // Test DB
        try {
            const { pool } = await import("./db");
            const start = Date.now();
            await pool.query("SELECT 1");
            report.tests.db = { ok: true, duration: Date.now() - start };
        } catch (err: any) {
            report.tests.db = { ok: false, error: err.message };
        }

        // Test AI with Raw REST (The Ultimate Proof)
        try {
            const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
            if (!apiKey || apiKey === "missing") {
                report.tests.ai_rest = { ok: false, error: "Key missing" };
            } else {
                const restUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
                const start = Date.now();
                const response = await fetch(restUrl);
                const data: any = await response.json();

                report.tests.ai_rest = {
                    ok: response.ok,
                    status: response.status,
                    available_models: data.models ? data.models.map((m: any) => m.name) : [],
                    raw_error: response.ok ? null : data.error
                };
            }
        } catch (err: any) {
            report.tests.ai_rest = { ok: false, error: err.message };
        }

        res.json(report);
    });

    // Register all main business routes (they already start with /api)
    await registerRoutes(app);

    // 404 Fallback - MUST come after all routes
    app.use((req, res) => {
        console.warn(`${new Date().toLocaleTimeString()} [express] 404 NOT FOUND: ${req.method} ${req.url}`);
        res.status(404).json({
            message: `Route ${req.method} ${req.url} not found`,
            path: req.path,
            suggestion: "If this is an API call, it should start with /api"
        });
    });

    // Global error handler
    app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        console.error("Internal Server Error:", err);
        if (!res.headersSent) {
            res.status(status).json({ message });
        } else {
            next(err);
        }
    });

    return app;
}

