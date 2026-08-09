import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function useUserCount() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    let active = true
    supabase
      .from('app_stats')
      .select('users_count')
      .eq('id', 1)
      .single()
      .then(({ data, error }) => {
        if (active && !error && data) setCount(data.users_count)
      })
    return () => {
      active = false
    }
  }, [])

  return count
}
