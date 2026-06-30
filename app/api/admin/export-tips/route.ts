import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admins'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Přístup odepřen.' }, { status: 403 })
  }

  // Admin RLS policy dovoluje číst všechny tipy
  const { data: tips, error: tipsError } = await supabase
    .from('tips')
    .select(`
      profiles(display_name),
      matches(home_team, away_team, kickoff_at, stage, group_name),
      home_score,
      away_score,
      is_joker,
      points
    `)

  if (tipsError) return NextResponse.json({ error: tipsError.message }, { status: 500 })
  if (!tips) return NextResponse.json({ error: 'Chyba při načítání.' }, { status: 500 })

  // Seřaď podle kickoff_at
  tips.sort((a, b) => {
    const ma = a.matches as unknown as { kickoff_at: string } | null
    const mb = b.matches as unknown as { kickoff_at: string } | null
    return (ma?.kickoff_at ?? '').localeCompare(mb?.kickoff_at ?? '')
  })

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
