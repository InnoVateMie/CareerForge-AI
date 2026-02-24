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

    // Netlify path rewriting middleware - MUST BE AT THE TOP
    // Rewrites /.netlify/functions/api/foo to /api/foo
    app.use((req, res, next) => {
        const netlifyPrefix = "/.netlify/functions/api";
        if (req.url.startsWith(netlifyPrefix)) {
            const oldUrl = req.url;
            // If it's exactly the prefix, map to /api
            if (req.url === netlifyPrefix) {
                req.url = "/api";
            } else {
                req.url = req.url.replace(netlifyPrefix, "/api");
            }
            console.log(`[rewrite] ${oldUrl} -> ${req.url}`);
        }
        next();
    });

    // Diagnostic route
    app.get("/", (req, res) => {
        res.json({
            status: "alive",
            message: "CareerForge-AI API is running.",
            path: req.path,
            url: req.url,
            env: process.env.NODE_ENV
        });
    });

    app.get("/api", (req, res) => {
        res.json({ message: "API endpoint base. Try /api/resumes" });
    });

    app.get("/api/debug/db", async (req, res) => {
        try {
            console.log("[debug] Testing DB connection...");
            const { pool } = await import("./db");
            const result = await pool.query("SELECT NOW()");
            res.json({ status: "ok", time: result.rows[0].now, env: process.env.NODE_ENV });
        } catch (err: any) {
            console.error("[debug] DB test failed:", err.message);
            res.status(500).json({ status: "error", message: err.message, stack: err.stack });
        }
    });

    await registerRoutes(app);

    // 404 Fallback
    app.use((req, res) => {
        console.warn(`${new Date().toLocaleTimeString()} [express] 404 NOT FOUND: ${req.method} ${req.url}`);
        res.status(404).json({
            message: `Route ${req.method} ${req.url} not found`,
            path: req.path
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

