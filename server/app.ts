import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";

export async function createApp() {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // Logging middleware
    app.use((req, res, next) => {
        const start = Date.now();
        res.on("finish", () => {
            const duration = Date.now() - start;
            if (req.path.startsWith("/api")) {
                console.log(`${new Date().toLocaleTimeString()} [express] ${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
            }
        });
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

