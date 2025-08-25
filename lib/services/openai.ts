import OpenAI from 'openai'
import type { FamilyPreferences, Ingredient, Meal } from '@/lib/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const aiService = {
  // Generate meal suggestions based on family preferences
  async generateMealSuggestions(
    preferences: FamilyPreferences,
    constraints?: {
      maxPrepTime?: number
      maxCookTime?: number
      availableIngredients?: string[]
      cuisine?: string
      mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
    }
  ): Promise<{ suggestions: Partial<Meal>[]; error: string | null }> {
    try {
      const prompt = this.buildMealSuggestionPrompt(preferences, constraints)

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional chef and nutritionist helping families plan meals. Always provide practical, family-friendly recipes with clear instructions and accurate nutritional estimates.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        return { suggestions: [], error: 'No response from AI' }
      }

      // Parse the AI response into meal suggestions
      const suggestions = this.parseAIMealSuggestions(response)
      return { suggestions, error: null }
    } catch (err) {
      console.error('AI service error:', err)
      return { suggestions: [], error: 'Failed to generate meal suggestions' }
    }
  },

  // Generate shopping list from meal plan with AI optimization
  async optimizeShoppingList(
    plannedMeals: { meal: Meal; servings: number }[],
    preferences: FamilyPreferences
  ): Promise<{ optimizedList: { name: string; quantity: string; category: string; notes?: string }[]; error: string | null }> {
    try {
      const prompt = this.buildShoppingListPrompt(plannedMeals, preferences)

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a meal planning assistant that helps optimize shopping lists by consolidating ingredients, suggesting alternatives, and organizing by store sections.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        return { optimizedList: [], error: 'No response from AI' }
      }

      const optimizedList = this.parseAIShoppingList(response)
      return { optimizedList, error: null }
    } catch (err) {
      console.error('Shopping list optimization error:', err)
      return { optimizedList: [], error: 'Failed to optimize shopping list' }
    }
  },

  // Get meal modification suggestions
  async getMealModifications(
    meal: Meal,
    modifications: {
      dietaryRestrictions?: string[]
      servings?: number
      availableIngredients?: string[]
      missingIngredients?: string[]
    }
  ): Promise<{ modifiedMeal: Partial<Meal>; error: string | null }> {
    try {
      const prompt = this.buildModificationPrompt(meal, modifications)

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a culinary expert helping adapt recipes based on dietary restrictions, available ingredients, and serving size changes.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 1500
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        return { modifiedMeal: {}, error: 'No response from AI' }
      }

      const modifiedMeal = this.parseAIMealModification(response, meal)
      return { modifiedMeal, error: null }
    } catch (err) {
      console.error('Meal modification error:', err)
      return { modifiedMeal: {}, error: 'Failed to modify meal' }
    }
  },

  // Build prompts for different AI tasks
  buildMealSuggestionPrompt(preferences: FamilyPreferences, constraints?: any): string {
    let prompt = `Please suggest 3 family-friendly meals based on these preferences:

Household size: ${preferences.household_size} people
Cooking skill level: ${preferences.cooking_skill}
Dietary restrictions: ${preferences.dietary_restrictions.join(', ') || 'None'}
Dislikes: ${preferences.dislikes.join(', ') || 'None'}
Favorite meals: ${preferences.favorite_meals.join(', ') || 'None specified'}`

    if (constraints) {
      if (constraints.maxPrepTime) prompt += `\nMax prep time: ${constraints.maxPrepTime} minutes`
      if (constraints.maxCookTime) prompt += `\nMax cook time: ${constraints.maxCookTime} minutes`
      if (constraints.availableIngredients) prompt += `\nPrefer to use these ingredients: ${constraints.availableIngredients.join(', ')}`
      if (constraints.cuisine) prompt += `\nCuisine preference: ${constraints.cuisine}`
      if (constraints.mealType) prompt += `\nMeal type: ${constraints.mealType}`
    }

    prompt += `\n\nFor each meal, provide in JSON format:
{
  "title": "Meal Name",
  "prep_time": minutes,
  "cook_time": minutes,
  "servings": number,
  "ingredients": [{"name": "ingredient", "amount": "quantity", "category": "produce|protein|dairy|pantry"}],
  "instructions": ["step 1", "step 2", ...],
  "tags": ["tag1", "tag2"],
  "nutrition": {"calories": number, "protein": "Xg", "carbs": "Xg", "fat": "Xg"}
}`

    return prompt
  },

  buildShoppingListPrompt(plannedMeals: { meal: Meal; servings: number }[], preferences: FamilyPreferences): string {
    const mealsList = plannedMeals.map(pm => 
      `${pm.meal.title} (${pm.servings} servings, recipe serves ${pm.meal.servings})`
    ).join('\n')

    const allIngredients = plannedMeals.flatMap(pm => 
      pm.meal.ingredients.map(ing => ({
        ...ing,
        multiplier: pm.servings / pm.meal.servings
      }))
    )

    return `Please create an optimized shopping list for these meals:
${mealsList}

Raw ingredients needed:
${allIngredients.map(ing => `- ${ing.name}: ${ing.amount} (×${ing.multiplier.toFixed(1)})`).join('\n')}

Household size: ${preferences.household_size}
Dietary restrictions: ${preferences.dietary_restrictions.join(', ') || 'None'}

Please:
1. Consolidate duplicate ingredients with proper quantities
2. Organize by store sections (produce, protein, dairy, pantry, frozen, etc.)
3. Suggest bulk buying opportunities
4. Note any dietary-friendly alternatives

Return as JSON array:
[{"name": "item", "quantity": "amount", "category": "section", "notes": "optional notes"}]`
  },

  buildModificationPrompt(meal: Meal, modifications: any): string {
    let prompt = `Please modify this recipe:
Title: ${meal.title}
Original servings: ${meal.servings}
Prep time: ${meal.prep_time} min
Cook time: ${meal.cook_time} min

Ingredients: ${meal.ingredients.map(ing => `${ing.amount} ${ing.name}`).join(', ')}
Instructions: ${meal.instructions.join(' ')}

Modifications needed:`

    if (modifications.dietaryRestrictions?.length) {
      prompt += `\n- Adapt for dietary restrictions: ${modifications.dietaryRestrictions.join(', ')}`
    }
    if (modifications.servings) {
      prompt += `\n- Adjust servings to: ${modifications.servings}`
    }
    if (modifications.availableIngredients?.length) {
      prompt += `\n- Use these available ingredients: ${modifications.availableIngredients.join(', ')}`
    }
    if (modifications.missingIngredients?.length) {
      prompt += `\n- Find substitutes for missing ingredients: ${modifications.missingIngredients.join(', ')}`
    }

    prompt += `\n\nProvide the modified recipe in JSON format with updated ingredients, instructions, and nutritional estimates.`

    return prompt
  },

  // Parse AI responses into structured data
  parseAIMealSuggestions(response: string): Partial<Meal>[] {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\[.*\]/s) || response.match(/\{.*\}/s)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return Array.isArray(parsed) ? parsed : [parsed]
      }
      return []
    } catch (err) {
      console.error('Failed to parse AI meal suggestions:', err)
      return []
    }
  },

  parseAIShoppingList(response: string): { name: string; quantity: string; category: string; notes?: string }[] {
    try {
      const jsonMatch = response.match(/\[.*\]/s)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      return []
    } catch (err) {
      console.error('Failed to parse AI shopping list:', err)
      return []
    }
  },

  parseAIMealModification(response: string, originalMeal: Meal): Partial<Meal> {
    try {
      const jsonMatch = response.match(/\{.*\}/s)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      return originalMeal
    } catch (err) {
      console.error('Failed to parse AI meal modification:', err)
      return originalMeal
    }
  }
}