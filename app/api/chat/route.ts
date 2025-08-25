import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { serverFamilyService } from '@/lib/services/family'
import { aiService } from '@/lib/services/openai'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, type = 'general', constraints = {} } = await request.json()

    // Get family context
    const { context } = await serverFamilyService.getUserFamilyContext()
    
    if (!context?.family_id) {
      return NextResponse.json({ error: 'No family context found' }, { status: 400 })
    }

    // Get family preferences
    const { data: preferences } = await supabase
      .from('family_preferences')
      .select('*')
      .eq('family_id', context.family_id)
      .single()

    if (!preferences) {
      return NextResponse.json({ error: 'Family preferences not found' }, { status: 400 })
    }

    let response;

    switch (type) {
      case 'meal_suggestions':
        const { suggestions, error: suggestionError } = await aiService.generateMealSuggestions(
          preferences,
          constraints
        )
        
        if (suggestionError) {
          return NextResponse.json({ error: suggestionError }, { status: 500 })
        }
        
        response = {
          type: 'meal_suggestions',
          suggestions: suggestions,
          message: 'Here are some meal suggestions based on your family preferences:'
        }
        break

      case 'shopping_list':
        if (!constraints.plannedMeals) {
          return NextResponse.json({ error: 'Planned meals required for shopping list' }, { status: 400 })
        }
        
        const { optimizedList, error: listError } = await aiService.optimizeShoppingList(
          constraints.plannedMeals,
          preferences
        )
        
        if (listError) {
          return NextResponse.json({ error: listError }, { status: 500 })
        }
        
        response = {
          type: 'shopping_list',
          shopping_list: optimizedList,
          message: 'Here\'s your optimized shopping list:'
        }
        break

      case 'meal_modification':
        if (!constraints.meal) {
          return NextResponse.json({ error: 'Meal data required for modification' }, { status: 400 })
        }
        
        const { modifiedMeal, error: modError } = await aiService.getMealModifications(
          constraints.meal,
          constraints.modifications || {}
        )
        
        if (modError) {
          return NextResponse.json({ error: modError }, { status: 500 })
        }
        
        response = {
          type: 'meal_modification',
          modified_meal: modifiedMeal,
          message: 'Here\'s your modified recipe:'
        }
        break

      default:
        // General chat - could be enhanced with more context
        response = {
          type: 'general',
          message: `Thanks for your message: "${message}". I'm ForkYes AI, your meal planning assistant! I can help you with meal suggestions, recipe modifications, and shopping lists. What would you like to explore?`
        }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}