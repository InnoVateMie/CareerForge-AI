import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";

export async function createApp() {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // Logging middleware
    app.use((req, res, next) => {
        const start = Date.now();
        console.log(`${new Date().toLocaleTimeString()} [express] incoming: ${req.method} ${req.url} (path: ${req.path})`);
        res.on("finish", () => {
            const duration = Date.now() - start;
            console.log(`${new Date().toLocaleTimeString()} [express] ${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
        });
        next();
    });

    // Netlify Path Normalization Middleware
    // This handles the case where Netlify calls the function with the full /.netlify/functions/api/ path
    app.use((req, res, next) => {
        const netlifyPrefix = "/.netlify/functions/api";
        if (req.url.startsWith(netlifyPrefix)) {
            const oldUrl = req.url;
            req.url = req.url.replace(netlifyPrefix, "/api");
            if (req.url === "") req.url = "/";
            console.log(`[normalize] ${oldUrl} -> ${req.url}`);
        }
        next();
    });

    // Diagnostic route (Root)
    app.get("/api", (req, res) => {
        res.json({
            status: "alive",
            message: "CareerForge-AI API is running.",
            path: req.path,
            url: req.url,
            env: process.env.NODE_ENV
        });
    });

    app.get("/api/debug/db", async (req, res) => {
        try {
            console.log("[debug] Testing DB connection...");
            const { pool } = await import("./db");
            const result = await pool.query("SELECT NOW()");
            res.json({ status: "ok", time: result.rows[0].now, env: process.env.NODE_ENV });
        } catch (err: any) {
            console.error("[debug] DB test failed:", err.message);
            res.status(500).json({ status: "error", message: err.message, detail: err.message });
        }
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

