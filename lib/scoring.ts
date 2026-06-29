export function calculateMatchPoints(
  tipHome: number,
  tipAway: number,
  resultHome: number,
  resultAway: number,
  isJoker: boolean = false
): number {
  let points = 0

  if (tipHome === resultHome && tipAway === resultAway) {
    points = 25
  } else {
    const tipWinner = Math.sign(tipHome - tipAway)
    const resultWinner = Math.sign(resultHome - resultAway)

    if (tipWinner === resultWinner) {
      const diff = Math.abs(tipHome - resultHome) + Math.abs(tipAway - resultAway)
      const base = tipWinner === 0 ? 18 : 15
      points = Math.max(0, base - diff)
    }
  }

  return isJoker ? points * 2 : points
}
