import { flag } from './flags'

export default function TeamName({
  team,
  flagSize = '1.5em',
  className,
}: {
  team: string
  flagSize?: string
  className?: string
}) {
  const f = flag(team)
  if (!f) return <span className={className}>{team}</span>
  return (
    <span className={className} style={{ whiteSpace: 'nowrap' }}>
      <span style={{ fontSize: flagSize, lineHeight: 1, verticalAlign: 'middle' }}>{f}</span>
      {' '}
      <span style={{ verticalAlign: 'middle' }}>{team}</span>
    </span>
  )
}
