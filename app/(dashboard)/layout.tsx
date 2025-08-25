import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-warm-cream">
      <nav className="bg-white shadow-sm border-b border-sage-green/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-sage-green">ForkYes</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-8">
                <a
                  href="/dashboard"
                  className="text-soft-charcoal hover:text-sage-green px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </a>
                <a
                  href="/dashboard/meals"
                  className="text-soft-charcoal hover:text-sage-green px-3 py-2 rounded-md text-sm font-medium"
                >
                  Meals
                </a>
                <a
                  href="/dashboard/chat"
                  className="text-soft-charcoal hover:text-sage-green px-3 py-2 rounded-md text-sm font-medium"
                >
                  AI Chat
                </a>
                <a
                  href="/dashboard/shopping-list"
                  className="text-soft-charcoal hover:text-sage-green px-3 py-2 rounded-md text-sm font-medium"
                >
                  Shopping List
                </a>
              </nav>
              
              <div className="flex items-center">
                <span className="text-sm text-soft-charcoal mr-4">
                  {user.user_metadata?.full_name || user.email}
                </span>
                <form action="/api/auth/signout" method="post">
                  <button
                    type="submit"
                    className="bg-sage-green hover:bg-opacity-90 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}