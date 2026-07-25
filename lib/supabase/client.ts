import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pwqhlpitljrxehhoxyxi.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3cWhscGl0bGpyeGVoaG94eXhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4NTMwODAsImV4cCI6MjEwMDQyOTA4MH0.rG1M0u4M_YIFFswgTPvNLVadyXy0XpCDTdkoPzVCPhk";

let clientInstance: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (clientInstance) return clientInstance

  clientInstance = createBrowserClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  )

  return clientInstance
}
