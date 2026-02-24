import { type Request, type Response, type NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
    // Skip auth for OPTIONS (CORS preflight)
    if (req.method === 'OPTIONS') {
        return next();
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Log request details for debugging 401s
    console.log(`[auth] Request: ${req.method} ${req.url}`);
    console.log(`[auth] Headers keys:`, Object.keys(req.headers));

    if (!supabaseUrl || !serviceKey) {
        console.error("[auth] MISSING env vars - url:", !!supabaseUrl, "key:", !!serviceKey);
        return res.status(500).json({
            message: "Server misconfiguration: Supabase keys missing.",
            detail: "Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in Netlify environment variables."
        });
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const authHeader = req.headers.authorization;

    console.log("[auth] auth header present:", !!authHeader);

    if (!authHeader) {
        return res.status(401).json({ message: "No authorization header" });
    }

    const token = authHeader.split(" ")[1];

    try {
        console.log("[auth] calling getUser...");
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            console.error("[auth] getUser failed:", error?.message);
            return res.status(401).json({ message: "Invalid token" });
        }

        console.log("[auth] user authenticated:", user.id);
        (req as any).user = user;
        next();
    } catch (err: any) {
        console.error("[auth] exception:", err?.message);
        return res.status(401).json({ message: "Auth failed" });
    }
};
