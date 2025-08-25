import { createClient } from '@/lib/supabase/client'
import type { Meal, MealRating, RecommendedMeal, WeekPlan, PlannedMeal } from '@/lib/types'

const supabase = createClient()

export const mealService = {
  // Get recommended meals based on family preferences
  async getRecommendedMeals(excludeRated: boolean = false, limit: number = 10): Promise<{ meals: RecommendedMeal[]; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('get_recommended_meals', {
        exclude_rated: excludeRated,
        limit_count: limit
      })

      if (error) {
        return { meals: [], error: error.message }
      }

      return { meals: data || [], error: null }
    } catch (err) {
      return { meals: [], error: 'Failed to get recommended meals' }
    }
  },

  // Search meals by query
  async searchMeals(query: string, tags?: string[], maxPrepTime?: number): Promise<{ meals: Meal[]; error: string | null }> {
    try {
      let queryBuilder = supabase
        .from('meals')
        .select('*')
        .or(`title.ilike.%${query}%, tags.cs.{${query}}`)

      if (tags && tags.length > 0) {
        queryBuilder = queryBuilder.overlaps('tags', tags)
      }

      if (maxPrepTime) {
        queryBuilder = queryBuilder.lte('prep_time', maxPrepTime)
      }

      const { data, error } = await queryBuilder.order('rating_avg', { ascending: false })

      if (error) {
        return { meals: [], error: error.message }
      }

      return { meals: data || [], error: null }
    } catch (err) {
      return { meals: [], error: 'Failed to search meals' }
    }
  },

  // Get a single meal by ID
  async getMeal(mealId: string): Promise<{ meal: Meal | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('id', mealId)
        .single()

      if (error) {
        return { meal: null, error: error.message }
      }

      return { meal: data, error: null }
    } catch (err) {
      return { meal: null, error: 'Failed to get meal' }
    }
  },

  // Rate a meal
  async rateMeal(familyId: string, mealId: string, rating: number, notes?: string, wouldMakeAgain: boolean = true, kidApproved?: boolean): Promise<{ rating: MealRating | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('meal_ratings')
        .upsert({
          family_id: familyId,
          meal_id: mealId,
          rating,
          notes,
          would_make_again: wouldMakeAgain,
          kid_approved: kidApproved
        })
        .select()
        .single()

      if (error) {
        return { rating: null, error: error.message }
      }

      return { rating: data, error: null }
    } catch (err) {
      return { rating: null, error: 'Failed to rate meal' }
    }
  },

  // Get family's meal ratings
  async getFamilyRatings(familyId: string): Promise<{ ratings: MealRating[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('meal_ratings')
        .select('*')
        .eq('family_id', familyId)
        .order('created_at', { ascending: false })

      if (error) {
        return { ratings: [], error: error.message }
      }

      return { ratings: data || [], error: null }
    } catch (err) {
      return { ratings: [], error: 'Failed to get family ratings' }
    }
  }
}

export const weekPlanService = {
  // Get week plan for family
  async getWeekPlan(familyId: string, weekStart: string): Promise<{ plan: WeekPlan | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('week_plans')
        .select('*')
        .eq('family_id', familyId)
        .eq('week_start', weekStart)
        .single()

      if (error && error.code !== 'PGRST116') { // Not found error
        return { plan: null, error: error.message }
      }

      return { plan: data, error: null }
    } catch (err) {
      return { plan: null, error: 'Failed to get week plan' }
    }
  },

  // Create or update week plan
  async saveWeekPlan(familyId: string, weekStart: string, meals: PlannedMeal[], status: 'draft' | 'confirmed' = 'draft'): Promise<{ plan: WeekPlan | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('week_plans')
        .upsert({
          family_id: familyId,
          week_start: weekStart,
          meals,
          status
        })
        .select()
        .single()

      if (error) {
        return { plan: null, error: error.message }
      }

      return { plan: data, error: null }
    } catch (err) {
      return { plan: null, error: 'Failed to save week plan' }
    }
  },

  // Generate shopping list from week plan
  async generateShoppingList(planId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('generate_shopping_list_from_plan', {
        plan_id: planId
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (err) {
      return { success: false, error: 'Failed to generate shopping list' }
    }
  },

  // Get family's week plans (recent)
  async getFamilyWeekPlans(familyId: string, limit: number = 8): Promise<{ plans: WeekPlan[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('week_plans')
        .select('*')
        .eq('family_id', familyId)
        .order('week_start', { ascending: false })
        .limit(limit)

      if (error) {
        return { plans: [], error: error.message }
      }

      return { plans: data || [], error: null }
    } catch (err) {
      return { plans: [], error: 'Failed to get week plans' }
    }
  }
}