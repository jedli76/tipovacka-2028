import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TipsForm from './TipsForm'

export default async function TipsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .order('kickoff_at', { ascending: true })

  const { data: myTips } = await supabase
    .from('tips')
    .select('*')
    .eq('user_id', user.id)

  const tipsMap = Object.fromEntries((myTips ?? []).map(t => [t.match_id, t]))

  // Zjistíme, zda uživatel už použil žolíka
  const jokerUsed = (myTips ?? []).some(t => t.is_joker)

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚽</span>
            <span className="font-bold text-white">Tipovačka EURO 2028</span>
          </div>
          <a href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
            ← Dashboard
          </a>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Moje tipy</h1>
          <p className="text-gray-400 text-sm mt-1">
            Tipy lze měnit až do výkopu zápasu. Žolík zdvojnásobuje body — použít lze jen jednou.
          </p>
        </div>

        {!matches || matches.length === 0 ? (
          <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
            <p className="text-gray-400">Zatím nejsou zadány žádné zápasy.</p>
          </div>
        ) : (
          <TipsForm
            matches={matches}
            tipsMap={tipsMap}
            jokerUsed={jokerUsed}
            userId={user.id}
          />
        )}
      </main>
    </div>
  )
}
