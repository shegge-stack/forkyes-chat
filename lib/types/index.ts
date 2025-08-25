// Database Types
export interface Family {
  id: string
  name: string
  created_at: string
}

export interface User {
  id: string
  email: string
  family_id: string | null
  role: 'admin' | 'member' | 'child'
  created_at: string
}

export interface FamilyPreferences {
  id: string
  family_id: string
  dietary_restrictions: string[]
  household_size: number
  cooking_skill: 'beginner' | 'intermediate' | 'advanced' | 'professional'
  dislikes: string[]
  favorite_meals: string[]
  created_at: string
  updated_at: string
}

export interface Ingredient {
  name: string
  amount: string
  category?: string
  optional?: boolean
}

export interface NutritionInfo {
  calories?: number
  protein?: string
  carbs?: string
  fat?: string
  fiber?: string
  sodium?: string
}

export interface Meal {
  id: string
  title: string
  prep_time: number
  cook_time: number
  servings: number
  ingredients: Ingredient[]
  instructions: string[]
  tags: string[]
  nutrition: NutritionInfo
  image_url?: string
  source_url?: string
  rating_avg: number
  rating_count: number
  created_at: string
  updated_at: string
}

export interface PlannedMeal {
  day: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  meal_id: string
  servings: number
  notes?: string
}

export interface ShoppingListItem {
  name: string
  quantity: string
  category: string
  checked: boolean
}

export interface WeekPlan {
  id: string
  family_id: string
  week_start: string
  status: 'draft' | 'confirmed'
  meals: PlannedMeal[]
  shopping_list: ShoppingListItem[]
  created_at: string
  updated_at: string
}

export interface MealRating {
  id: string
  family_id: string
  meal_id: string
  rating: number
  notes?: string
  would_make_again: boolean
  kid_approved?: boolean
  created_at: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

// API Response Types
export interface UserFamilyContext {
  user_id: string
  family_id: string | null
  family_name: string | null
  user_role: string
  household_size: number | null
}

export interface RecommendedMeal {
  meal_id: string
  title: string
  prep_time: number
  cook_time: number
  servings: number
  tags: string[]
  rating_avg: number
  matches_preferences: boolean
}