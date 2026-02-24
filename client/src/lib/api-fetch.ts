import { supabase } from "./supabase";

/**
 * A wrapper around fetch that automatically adds the Supabase JWT 
 * to the Authorization header if a session exists.
 */
export async function apiFetch(url: string, options: RequestInit = {}) {
    const { data: { session } } = await supabase.auth.getSession();
    console.log(`[apiFetch] Request to ${url}, session present: ${!!session}, token present: ${!!session?.access_token}`);

    const headers = new Headers(options.headers || {});

    if (session?.access_token) {
        headers.set("Authorization", `Bearer ${session.access_token}`);
    } else {
        console.warn(`[apiFetch] No access token found for request to ${url}`);
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
