import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uloxgowjyidbwrvbspjc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsb3hnb3dqeWlkYndydmJzcGpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjgyMDcsImV4cCI6MjA3MjA0NDIwN30.ORHHlsjswfpVURcosJZTofCA0AnlmxCehGTld1Z7rYw'
export const supabase = createClient(supabaseUrl, supabaseAnonKey) 