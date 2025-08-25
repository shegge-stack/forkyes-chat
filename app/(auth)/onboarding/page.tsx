'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { familyService } from '@/lib/services/family'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [familyName, setFamilyName] = useState('')
  const [householdSize, setHouseholdSize] = useState(2)
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([])
  const [cookingSkill, setCookingSkill] = useState<'beginner' | 'intermediate' | 'advanced' | 'professional'>('beginner')
  const [dislikes, setDislikes] = useState<string[]>([])
  const [favoriteMeals, setFavoriteMeals] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 
    'Keto', 'Paleo', 'Low-Carb', 'Nut-Free', 'Halal', 'Kosher'
  ]

  const commonDislikes = [
    'Mushrooms', 'Seafood', 'Spicy Food', 'Onions', 'Cilantro',
    'Tomatoes', 'Cheese', 'Eggs', 'Beans', 'Brussels Sprouts'
  ]

  const mealSuggestions = [
    'Pasta', 'Pizza', 'Tacos', 'Stir Fry', 'Grilled Chicken', 
    'Salads', 'Soup', 'Sandwiches', 'Rice Bowls', 'Casseroles'
  ]

  const toggleArray = (array: string[], setArray: (arr: string[]) => void, item: string) => {
    setArray(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    )
  }

  const handleComplete = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Create family and make user admin
      const { family, error: familyError } = await familyService.createFamily(familyName)
      
      if (familyError || !family) {
        setError(familyError || 'Failed to create family')
        setLoading(false)
        return
      }

      // Set family preferences
      const { error: prefsError } = await familyService.updateFamilyPreferences(family.id, {
        dietary_restrictions: dietaryRestrictions,
        household_size: householdSize,
        cooking_skill: cookingSkill,
        dislikes,
        favorite_meals: favoriteMeals
      })

      if (prefsError) {
        setError(prefsError)
        setLoading(false)
        return
      }

      router.push('/dashboard')
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }
    
    setLoading(false)
  }

  const nextStep = () => setStep(prev => prev + 1)
  const prevStep = () => setStep(prev => prev - 1)

  return (
    <div className="min-h-screen bg-warm-cream py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-soft-charcoal mb-2">
            Welcome to ForkYes!
          </h1>
          <p className="text-lg text-soft-charcoal">
            Let's set up your family's meal planning experience
          </p>
          <div className="mt-4">
            <div className="flex justify-center space-x-2">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i <= step ? 'bg-sage-green' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-soft-charcoal mt-2">
              Step {step} of 3
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-soft-charcoal mb-4">
                Family Setup
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-soft-charcoal mb-2">
                    Family Name
                  </label>
                  <input
                    type="text"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sage-green"
                    placeholder="The Smith Family"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-soft-charcoal mb-2">
                    Household Size
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={householdSize}
                    onChange={(e) => setHouseholdSize(parseInt(e.target.value) || 2)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sage-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-soft-charcoal mb-2">
                    Cooking Skill Level
                  </label>
                  <div className="space-y-2">
                    {(['beginner', 'intermediate', 'advanced', 'professional'] as const).map((level) => (
                      <label key={level} className="flex items-center">
                        <input
                          type="radio"
                          name="cookingSkill"
                          value={level}
                          checked={cookingSkill === level}
                          onChange={(e) => setCookingSkill(e.target.value as any)}
                          className="mr-3 text-sage-green focus:ring-sage-green"
                        />
                        <span className="text-soft-charcoal capitalize">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <button
                onClick={nextStep}
                disabled={!familyName.trim()}
                className="px-8 py-3 bg-sage-green text-white font-semibold rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-sage-green focus:ring-offset-2 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-soft-charcoal mb-4">
                Dietary Restrictions
              </h2>
              <div className="flex flex-wrap gap-2">
                {dietaryOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => toggleArray(dietaryRestrictions, setDietaryRestrictions, option)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      dietaryRestrictions.includes(option)
                        ? 'bg-sage-green text-white'
                        : 'bg-gray-200 text-soft-charcoal hover:bg-sage-green hover:text-white'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-soft-charcoal mb-4">
                Foods to Avoid
              </h2>
              <div className="flex flex-wrap gap-2">
                {commonDislikes.map((option) => (
                  <button
                    key={option}
                    onClick={() => toggleArray(dislikes, setDislikes, option)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      dislikes.includes(option)
                        ? 'bg-terracotta text-white'
                        : 'bg-gray-200 text-soft-charcoal hover:bg-terracotta hover:text-white'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="px-8 py-3 bg-gray-300 text-soft-charcoal font-semibold rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className="px-8 py-3 bg-sage-green text-white font-semibold rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-sage-green focus:ring-offset-2"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-soft-charcoal mb-4">
                Favorite Meals
              </h2>
              <p className="text-sm text-soft-charcoal mb-4">
                Select meals your family loves to help us recommend similar dishes
              </p>
              <div className="flex flex-wrap gap-2">
                {mealSuggestions.map((option) => (
                  <button
                    key={option}
                    onClick={() => toggleArray(favoriteMeals, setFavoriteMeals, option)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      favoriteMeals.includes(option)
                        ? 'bg-honey-gold text-soft-charcoal'
                        : 'bg-gray-200 text-soft-charcoal hover:bg-honey-gold hover:text-soft-charcoal'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="px-8 py-3 bg-gray-300 text-soft-charcoal font-semibold rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                disabled={loading}
                className="px-8 py-3 bg-honey-gold text-soft-charcoal font-semibold rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-honey-gold focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Setting up your family...' : 'Complete Setup'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}