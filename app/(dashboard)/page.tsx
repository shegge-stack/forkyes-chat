import { serverFamilyService } from '@/lib/services/family'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

async function getOrCreateFamilyData() {
  const supabase = createClient()
  const { context } = await serverFamilyService.getUserFamilyContext()
  
  // If user doesn't have a family, redirect to onboarding
  if (!context?.family_id) {
    redirect('/onboarding')
  }

  // Get some basic stats
  const [mealRatingsResult, weekPlansResult] = await Promise.all([
    supabase
      .from('meal_ratings')
      .select('id')
      .eq('family_id', context.family_id),
    supabase
      .from('week_plans')
      .select('id, status')
      .eq('family_id', context.family_id)
      .order('week_start', { ascending: false })
      .limit(5)
  ])

  return {
    context,
    stats: {
      ratedMeals: mealRatingsResult.data?.length || 0,
      weekPlans: weekPlansResult.data?.length || 0,
      confirmedPlans: weekPlansResult.data?.filter(p => p.status === 'confirmed').length || 0
    }
  }
}

export default async function DashboardPage() {
  const { context, stats } = await getOrCreateFamilyData()

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-soft-charcoal mb-2">
          Welcome back, {context?.family_name}!
        </h1>
        <p className="text-lg text-soft-charcoal">
          Ready to plan some delicious meals for your family of {context?.household_size}?
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-sage-green">
          <h3 className="text-xl font-semibold text-soft-charcoal mb-2">
            🍽️ Meal Planning
          </h3>
          <p className="text-soft-charcoal mb-4">
            Browse recipes and create weekly meal plans
          </p>
          <a
            href="/dashboard/meals"
            className="inline-block bg-sage-green hover:bg-opacity-90 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Plan Meals
          </a>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-terracotta">
          <h3 className="text-xl font-semibold text-soft-charcoal mb-2">
            🤖 AI Chef Assistant
          </h3>
          <p className="text-soft-charcoal mb-4">
            Get personalized recipe suggestions
          </p>
          <a
            href="/dashboard/chat"
            className="inline-block bg-terracotta hover:bg-opacity-90 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Chat with AI
          </a>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-honey-gold">
          <h3 className="text-xl font-semibold text-soft-charcoal mb-2">
            📋 Shopping Lists
          </h3>
          <p className="text-soft-charcoal mb-4">
            Auto-generated from your meal plans
          </p>
          <a
            href="/dashboard/shopping-list"
            className="inline-block bg-honey-gold hover:bg-opacity-90 text-soft-charcoal px-4 py-2 rounded-md text-sm font-medium"
          >
            View Lists
          </a>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-soft-charcoal mb-4">
            Family Stats
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-sage-green">{stats.ratedMeals}</div>
              <div className="text-sm text-soft-charcoal">Meals Rated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-terracotta">{stats.weekPlans}</div>
              <div className="text-sm text-soft-charcoal">Week Plans</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-honey-gold">{stats.confirmedPlans}</div>
              <div className="text-sm text-soft-charcoal">Confirmed</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-soft-charcoal mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <a
              href="/dashboard/week-plan"
              className="block w-full p-3 bg-sage-green/10 hover:bg-sage-green/20 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">📅</span>
                <div>
                  <div className="font-medium text-soft-charcoal">Plan This Week</div>
                  <div className="text-sm text-soft-charcoal/70">Create or update weekly meal plan</div>
                </div>
              </div>
            </a>
            
            <a
              href="/dashboard/recommendations"
              className="block w-full p-3 bg-terracotta/10 hover:bg-terracotta/20 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">✨</span>
                <div>
                  <div className="font-medium text-soft-charcoal">Get Recommendations</div>
                  <div className="text-sm text-soft-charcoal/70">AI-powered meal suggestions</div>
                </div>
              </div>
            </a>
            
            <a
              href="/dashboard/family"
              className="block w-full p-3 bg-honey-gold/10 hover:bg-honey-gold/20 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">👨‍👩‍👧‍👦</span>
                <div>
                  <div className="font-medium text-soft-charcoal">Family Settings</div>
                  <div className="text-sm text-soft-charcoal/70">Manage preferences and members</div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}