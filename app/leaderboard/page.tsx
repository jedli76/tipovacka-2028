import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import LeaderboardClient from './LeaderboardClient'

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: leaderboard } = await supabase
    .from('leaderboard')
    .select('*, profiles(display_name)')
    .order('total_points', { ascending: false })

  if (!leaderboard) return null

  // Compute stable ranks (shared rank for tied points)
  const entries = leaderboard.map(entry => {
    const rank = leaderboard.findIndex(e => e.total_points === entry.total_points) + 1
    return {
      user_id: entry.user_id as string,
      total_points: entry.total_points as number,
      tips_count: entry.tips_count as number,
      correct_results: entry.correct_results as number,
      display_name: (entry.profiles as { display_name: string })?.display_name ?? '–',
      rank,
    }
  })

  return (
    <div className="min-h-screen" style={{ background: '#0a0e1a', color: '#e2e8f0' }}>
      <nav style={{ background: '#111827', borderBottom: '1px solid #1f2d45' }} className="px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚽</span>
            <span className="font-bold text-white">Tipovačka MS 2026</span>
          </div>
          <Link href="/dashboard" className="text-sm hover:text-white transition-colors" style={{ color: '#64748b' }}>
            ← Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto p-4 py-8">
        <h1 className="text-2xl font-black text-white mb-2">Žebříček</h1>
        <p className="text-sm mb-6" style={{ color: '#64748b' }}>
          {entries.length} hráčů · klikni na jméno pro detail tipů
        </p>

        {entries.length === 0 ? (
          <div className="text-center py-12" style={{ color: '#64748b' }}>Zatím nikdo nezadal tipy.</div>
        ) : (
          <LeaderboardClient entries={entries} currentUserId={user?.id ?? null} />
        )}
      </main>
    </div>
  )
}
