import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sgitanoyrwzuoirewqmj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnaXRhbm95cnd6dW9pcmV3cW1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NDAwMDMsImV4cCI6MjA4OTMxNjAwM30.GuGlURUBK0SF0ogj8_urmhJPrl0RtEe2TmCx6mLF-54'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
