import { createClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'
import type { Family, User, FamilyPreferences, UserFamilyContext } from '@/lib/types'

const supabase = createClient()

export const familyService = {
  // Create a new family and make the current user the admin
  async createFamily(familyName: string): Promise<{ family: Family; error: null } | { family: null; error: string }> {
    try {
      // First ensure user record exists
      const { error: ensureError } = await supabase.rpc('ensure_user_record')
      
      if (ensureError) {
        console.warn('Failed to ensure user record:', ensureError)
        // Continue anyway, as the user might already exist
      }

      const { data, error } = await supabase.rpc('create_family_with_admin', {
        family_name: familyName
      })

      if (error) {
        return { family: null, error: error.message }
      }

      // Fetch the created family
      const { data: family, error: familyError } = await supabase
        .from('families')
        .select('*')
        .eq('id', data)
        .single()

      if (familyError) {
        return { family: null, error: familyError.message }
      }

      return { family, error: null }
    } catch (err) {
      console.error('Create family error:', err)
      return { family: null, error: 'Failed to create family' }
    }
  },

  // Join an existing family
  async joinFamily(familyId: string, role: 'member' | 'child' = 'member'): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('join_family', {
        invite_family_id: familyId,
        user_role: role
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (err) {
      return { success: false, error: 'Failed to join family' }
    }
  },

  // Get current user's family context
  async getUserFamilyContext(): Promise<{ context: UserFamilyContext | null; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('get_user_family_context')

      if (error) {
        return { context: null, error: error.message }
      }

      return { context: data[0] || null, error: null }
    } catch (err) {
      return { context: null, error: 'Failed to get family context' }
    }
  },

  // Get family members
  async getFamilyMembers(familyId: string): Promise<{ members: User[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('family_id', familyId)

      if (error) {
        return { members: [], error: error.message }
      }

      return { members: data || [], error: null }
    } catch (err) {
      return { members: [], error: 'Failed to get family members' }
    }
  },

  // Update family preferences
  async updateFamilyPreferences(familyId: string, preferences: Partial<Omit<FamilyPreferences, 'id' | 'family_id' | 'created_at' | 'updated_at'>>): Promise<{ preferences: FamilyPreferences | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('family_preferences')
        .upsert({
          family_id: familyId,
          ...preferences
        })
        .select()
        .single()

      if (error) {
        return { preferences: null, error: error.message }
      }

      return { preferences: data, error: null }
    } catch (err) {
      return { preferences: null, error: 'Failed to update preferences' }
    }
  },

  // Get family preferences
  async getFamilyPreferences(familyId: string): Promise<{ preferences: FamilyPreferences | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('family_preferences')
        .select('*')
        .eq('family_id', familyId)
        .single()

      if (error) {
        return { preferences: null, error: error.message }
      }

      return { preferences: data, error: null }
    } catch (err) {
      return { preferences: null, error: 'Failed to get preferences' }
    }
  },

  // Update user role (admin only)
  async updateUserRole(userId: string, role: 'admin' | 'member' | 'child'): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role })
        .eq('id', userId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (err) {
      return { success: false, error: 'Failed to update user role' }
    }
  }
}

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