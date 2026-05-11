import { createBrowserClient } from "@supabase/ssr"

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (client) return client

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("[v0] Missing Supabase environment variables")
      throw new Error("Missing Supabase configuration")
    }

    client = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
      global: {
        fetch: async (url, options = {}) => {
          try {
            const response = await fetch(url, {
              ...options,
              // Add timeout to prevent hanging
              signal: AbortSignal.timeout(10000),
            })
            return response
          } catch (error) {
            console.error("[v0] Supabase fetch error:", error)
            // Return a failed response instead of throwing to prevent cascading errors
            return new Response(JSON.stringify({ error: "Network error" }), {
              status: 503,
              headers: { "Content-Type": "application/json" },
            })
          }
        },
      },
    })

    return client
  } catch (error) {
    console.error("[v0] Failed to create Supabase client:", error)
    throw error
  }
}
