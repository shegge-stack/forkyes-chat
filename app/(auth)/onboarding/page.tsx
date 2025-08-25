'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function OnboardingPage() {
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([])
  const [cuisinePreferences, setCuisinePreferences] = useState<string[]>([])
  const [cookingExperience, setCookingExperience] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 
    'Keto', 'Paleo', 'Low-Carb', 'Halal', 'Kosher'
  ]

  const cuisineOptions = [
    'Italian', 'Mexican', 'Asian', 'Mediterranean', 'American', 
    'Indian', 'French', 'Thai', 'Japanese', 'Chinese'
  ]

  const toggleDietary = (option: string) => {
    setDietaryRestrictions(prev => 
      prev.includes(option) 
        ? prev.filter(item => item !== option)
        : [...prev, option]
    )
  }

  const toggleCuisine = (option: string) => {
    setCuisinePreferences(prev => 
      prev.includes(option) 
        ? prev.filter(item => item !== option)
        : [...prev, option]
    )
  }

  const handleComplete = async () => {
    setLoading(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          dietary_restrictions: dietaryRestrictions,
          cuisine_preferences: cuisinePreferences,
          cooking_experience: cookingExperience,
        })

      if (!error) {
        router.push('/dashboard')
      }
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-warm-cream py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-soft-charcoal mb-2">
            Welcome to ForkYes!
          </h1>
          <p className="text-lg text-soft-charcoal mb-8">
            Let's personalize your meal planning experience
          </p>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-soft-charcoal mb-4">
              Dietary Restrictions & Preferences
            </h2>
            <div className="flex flex-wrap gap-2">
              {dietaryOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => toggleDietary(option)}
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
              Favorite Cuisines
            </h2>
            <div className="flex flex-wrap gap-2">
              {cuisineOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => toggleCuisine(option)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    cuisinePreferences.includes(option)
                      ? 'bg-terracotta text-white'
                      : 'bg-gray-200 text-soft-charcoal hover:bg-terracotta hover:text-white'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-soft-charcoal mb-4">
              Cooking Experience
            </h2>
            <div className="space-y-2">
              {['Beginner', 'Intermediate', 'Advanced', 'Professional'].map((level) => (
                <label key={level} className="flex items-center">
                  <input
                    type="radio"
                    name="experience"
                    value={level}
                    checked={cookingExperience === level}
                    onChange={(e) => setCookingExperience(e.target.value)}
                    className="mr-3 text-sage-green focus:ring-sage-green"
                  />
                  <span className="text-soft-charcoal">{level}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleComplete}
              disabled={loading}
              className="px-8 py-3 bg-honey-gold text-soft-charcoal font-semibold rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-honey-gold focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Setting up...' : 'Complete Setup'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}