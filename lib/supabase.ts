import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 데이터베이스 타입 정의
export type WorkRecord = {
  id: string
  created_at: string
  user_id: string
  date: string
  name: string
  company: string
  location: string
  start_time: string
  end_time: string
  day_hours: number
  night_hours: number
  late_night_hours: number
  extra_amount: number
  memo?: string
}

export type Profile = {
  id: string
  created_at: string
  user_id: string
  name: string
  email: string
  avatar_url?: string
}
