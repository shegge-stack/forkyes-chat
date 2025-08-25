import { createClient } from '@/lib/supabase/server'
import { serverFamilyService } from '@/lib/services/family-server'

export default async function DebugPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  let userRecord = null
  let familyContext = null
  let error = null

  if (user) {
    try {
      // Try to get user record
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      userRecord = userData

      // Try to get family context
      const { context } = await serverFamilyService.getUserFamilyContext()
      familyContext = context
    } catch (err: any) {
      error = err.message
    }
  }

  return (
    <div className="min-h-screen bg-warm-cream p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-soft-charcoal mb-8">Auth Debug Info</h1>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Auth User</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">User Record</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(userRecord, null, 2)}
            </pre>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Family Context</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(familyContext, null, 2)}
            </pre>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Error</h2>
              <pre className="text-sm">{error}</pre>
            </div>
          )}

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-x-4">
              <a 
                href="/onboarding" 
                className="bg-sage-green text-white px-4 py-2 rounded hover:bg-opacity-90"
              >
                Go to Onboarding
              </a>
              <a 
                href="/dashboard" 
                className="bg-terracotta text-white px-4 py-2 rounded hover:bg-opacity-90"
              >
                Go to Dashboard
              </a>
              <a 
                href="/login" 
                className="bg-soft-charcoal text-white px-4 py-2 rounded hover:bg-opacity-90"
              >
                Go to Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}