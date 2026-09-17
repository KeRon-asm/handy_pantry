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
            return await fetch(url, {
              ...options,
              // Add timeout to prevent hanging
              signal: AbortSignal.timeout(10000),
            })
          } catch (error) {
            console.error("[v0] Supabase fetch error:", error)
            // Rethrow so the real failure (unreachable host, timeout, blocked
            // request) reaches the caller with a usable message. Returning a
            // synthetic 503 here made supabase-js wrap it as an empty
            // AuthRetryableFetchError, which rendered as a blank error to the user.
            throw error
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
