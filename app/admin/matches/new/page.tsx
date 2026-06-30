import { isAdmin } from '@/lib/admins'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MatchForm from '../MatchForm'

export default async function NewMatchPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <span className="font-bold text-white">Nový zápas</span>
          <a href="/admin" className="text-sm text-gray-400 hover:text-white">← Zpět</a>
        </div>
      </nav>
      <main className="max-w-2xl mx-auto p-4 py-8">
        <MatchForm />
      </main>
    </div>
  )
}
