import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-warm-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-center min-h-screen py-12">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-soft-charcoal mb-4">
              <span className="text-sage-green">Fork</span>Yes
            </h1>
            <p className="text-xl text-soft-charcoal mb-8 max-w-2xl mx-auto">
              Your AI-powered meal planning companion. Discover recipes, plan meals, 
              and streamline your cooking journey with intelligent assistance.
            </p>
            
            <div className="space-x-4">
              <a
                href="/signup"
                className="inline-block bg-sage-green hover:bg-opacity-90 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
              >
                Get Started
              </a>
              <a
                href="/login"
                className="inline-block bg-transparent hover:bg-sage-green hover:text-white text-sage-green border-2 border-sage-green px-8 py-3 rounded-lg text-lg font-medium transition-colors"
              >
                Sign In
              </a>
            </div>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-sage-green rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🍳</span>
              </div>
              <h3 className="text-xl font-semibold text-soft-charcoal mb-2">
                AI Recipe Suggestions
              </h3>
              <p className="text-soft-charcoal">
                Get personalized recipe recommendations based on your preferences and dietary needs.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-terracotta rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold text-soft-charcoal mb-2">
                Smart Meal Planning
              </h3>
              <p className="text-soft-charcoal">
                Plan your weekly meals effortlessly with our intelligent scheduling system.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-honey-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛒</span>
              </div>
              <h3 className="text-xl font-semibold text-soft-charcoal mb-2">
                Automated Shopping Lists
              </h3>
              <p className="text-soft-charcoal">
                Generate shopping lists automatically from your meal plans and recipes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}