import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Přístup odepřen.' }, { status: 403 })
  }

  const { data: tips } = await supabase
    .from('tips')
    .select(`
      profiles(display_name),
      matches(home_team, away_team, kickoff_at, stage, group_name),
      home_score,
      away_score,
      is_joker,
      points
    `)
    .order('matches(kickoff_at)', { ascending: true })

  if (!tips) return NextResponse.json({ error: 'Chyba při načítání.' }, { status: 500 })

  const rows = [
    ['Hráč', 'Zápas', 'Fáze', 'Skupina', 'Kickoff', 'Tip domácí', 'Tip hosté', 'Žolík', 'Body'],
  ]

  for (const t of tips) {
    const profile = t.profiles as unknown as { display_name: string } | null
    const match = t.matches as unknown as {
      home_team: string; away_team: string; kickoff_at: string; stage: string; group_name: string | null
    } | null
    rows.push([
      profile?.display_name ?? '',
      match ? `${match.home_team} - ${match.away_team}` : '',
      match?.stage ?? '',
      match?.group_name ?? '',
      match ? new Date(match.kickoff_at).toLocaleString('cs-CZ', { timeZone: 'Europe/Prague' }) : '',
      String(t.home_score ?? ''),
      String(t.away_score ?? ''),
      t.is_joker ? 'ANO' : 'NE',
      String(t.points ?? ''),
    ])
  }

  const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';')).join('\n')
  const bom = '﻿' // BOM pro správné zobrazení diakritiky v Excelu

  return new NextResponse(bom + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="tipy-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
