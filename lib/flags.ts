const FLAGS: Record<string, string> = {
  'Alžírsko': '🇩🇿',
  'Anglie': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Argentina': '🇦🇷',
  'Austrálie': '🇦🇺',
  'Belgie': '🇧🇪',
  'Bosna a Hercegovina': '🇧🇦',
  'Brazílie': '🇧🇷',
  'Chorvatsko': '🇭🇷',
  'Curacao': '🇨🇼',
  'DR Kongo': '🇨🇩',
  'Egypt': '🇪🇬',
  'Ekvádor': '🇪🇨',
  'Francie': '🇫🇷',
  'Ghana': '🇬🇭',
  'Haiti': '🇭🇹',
  'Irák': '🇮🇶',
  'Írán': '🇮🇷',
  'Japonsko': '🇯🇵',
  'Jihoafrická republika': '🇿🇦',
  'Jižní Korea': '🇰🇷',
  'Jordánsko': '🇯🇴',
  'Kanada': '🇨🇦',
  'Kapverdy': '🇨🇻',
  'Katar': '🇶🇦',
  'Kolumbie': '🇨🇴',
  'Maroko': '🇲🇦',
  'Mexiko': '🇲🇽',
  'Německo': '🇩🇪',
  'Nizozemsko': '🇳🇱',
  'Norsko': '🇳🇴',
  'Nový Zéland': '🇳🇿',
  'Panama': '🇵🇦',
  'Paraguay': '🇵🇾',
  'Pobřeží slonoviny': '🇨🇮',
  'Portugalsko': '🇵🇹',
  'Rakousko': '🇦🇹',
  'Saúdská Arábie': '🇸🇦',
  'Senegal': '🇸🇳',
  'Skotsko': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Španělsko': '🇪🇸',
  'Švédsko': '🇸🇪',
  'Švýcarsko': '🇨🇭',
  'Tunisko': '🇹🇳',
  'Turecko': '🇹🇷',
  'Uruguay': '🇺🇾',
  'USA': '🇺🇸',
  'Uzbekistán': '🇺🇿',
  'Česko': '🇨🇿',
}

export function flag(team: string): string {
  return FLAGS[team] ?? ''
}

export function teamWithFlag(team: string): string {
  const f = FLAGS[team]
  return f ? `${f} ${team}` : team
}
