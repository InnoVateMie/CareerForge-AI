import { supabase } from "./supabase";

/**
 * A wrapper around fetch that automatically adds the Supabase JWT 
 * to the Authorization header if a session exists.
 */
export async function apiFetch(url: string, options: RequestInit = {}) {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    console.log(`[apiFetch] Calling ${url}. Session: ${!!session}, Token length: ${token?.length || 0}`);

    const headers = new Headers(options.headers || {});

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
        console.log(`[apiFetch] Set Authorization header for ${url}`);
    } else {
        console.warn(`[apiFetch] MISSING TOKEN for ${url}. User might not be signed in or session expired.`);
    }

    // Default to JSON content type for POST/PUT if not set
    if ((options.method === 'POST' || options.method === 'PUT') && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const res = await fetch(url, {
        ...options,
        headers,
    });

    if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
    }

    return res;
}
