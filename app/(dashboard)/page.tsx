import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-sage-green/20 rounded-lg p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-soft-charcoal mb-4">
            Welcome to your ForkYes Dashboard!
          </h1>
          <p className="text-lg text-soft-charcoal mb-8">
            Hello, {user?.user_metadata?.full_name || user?.email}! 
            Ready to plan some amazing meals?
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-sage-green">
              <h3 className="text-xl font-semibold text-soft-charcoal mb-2">
                Meal Planning
              </h3>
              <p className="text-soft-charcoal mb-4">
                Browse and save your favorite recipes
              </p>
              <a
                href="/dashboard/meals"
                className="inline-block bg-sage-green hover:bg-opacity-90 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                View Meals
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-terracotta">
              <h3 className="text-xl font-semibold text-soft-charcoal mb-2">
                AI Chef Assistant
              </h3>
              <p className="text-soft-charcoal mb-4">
                Get personalized recipe suggestions
              </p>
              <a
                href="/dashboard/chat"
                className="inline-block bg-terracotta hover:bg-opacity-90 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Start Chatting
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-honey-gold">
              <h3 className="text-xl font-semibold text-soft-charcoal mb-2">
                Shopping List
              </h3>
              <p className="text-soft-charcoal mb-4">
                Organize your grocery shopping
              </p>
              <a
                href="/dashboard/shopping-list"
                className="inline-block bg-honey-gold hover:bg-opacity-90 text-soft-charcoal px-4 py-2 rounded-md text-sm font-medium"
              >
                Manage List
              </a>
            </div>
          </div>
          
          <div className="mt-12 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-soft-charcoal mb-4">
              Quick Stats
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-sage-green">0</div>
                <div className="text-soft-charcoal">Saved Meals</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-terracotta">0</div>
                <div className="text-soft-charcoal">Shopping Items</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-honey-gold">0</div>
                <div className="text-soft-charcoal">Chat Messages</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}