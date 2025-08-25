import { createClient as createServerClient } from '@/lib/supabase/server'
import type { UserFamilyContext } from '@/lib/types'

// Server-side family service for use in server components
export const serverFamilyService = {
  async getUserFamilyContext(): Promise<{ context: UserFamilyContext | null; error: string | null }> {
    try {
      const supabase = createServerClient()
      const { data, error } = await supabase.rpc('get_user_family_context')

      if (error) {
        return { context: null, error: error.message }
      }

      return { context: data[0] || null, error: null }
    } catch (err) {
      return { context: null, error: 'Failed to get family context' }
    }
  }
}