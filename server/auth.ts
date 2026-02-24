import { type Request, type Response, type NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    throw new Error("CRITICAL: SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_URL is missing. Production auth will fail.");
}

const supabase = createClient(supabaseUrl, serviceKey);

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        // Check for cookie-based auth (optional)
        return res.status(401).json({ message: "No authorization header" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ message: "Invalid token" });
        }

        (req as any).user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Auth failed" });
    }
};
