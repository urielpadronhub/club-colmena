import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://axfvkozvcctfjirhgpwo.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

// Usar service role key para operaciones del backend
export const supabase = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Cliente público para operaciones del frontend
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
export const supabasePublic = supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
