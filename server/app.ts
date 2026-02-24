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

    // Netlify path rewriting middleware
    // Rewrites /.netlify/functions/api/foo to /api/foo
    app.use((req, res, next) => {
        if (req.url.startsWith("/.netlify/functions/api")) {
            const oldUrl = req.url;
            req.url = req.url.replace("/.netlify/functions/api", "/api");
            console.log(`[rewrite] ${oldUrl} -> ${req.url}`);
        }
        next();
    });

    await registerRoutes(app);

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

