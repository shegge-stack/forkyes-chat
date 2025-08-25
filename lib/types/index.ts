export interface User {
  id: string
  email: string
  user_metadata: {
    full_name?: string
  }
}

export interface Meal {
  id: string
  user_id: string
  title: string
  description: string
  ingredients: string[]
  instructions: string[]
  prep_time: number
  cook_time: number
  servings: number
  tags: string[]
  created_at: string
  updated_at: string
}

export interface ShoppingListItem {
  id: string
  user_id: string
  name: string
  quantity: string
  checked: boolean
  category?: string
  created_at: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}