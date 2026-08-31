import { GODS, ROLE_IMAGES, ROLE_LABELS, TEAM_LABELS } from '../data'
import type { PlayerTokenState, Team } from '../types'

export function TeamPanel({ team, tokens, onSelect, onResizeTeam }: { team: Team; tokens: PlayerTokenState[]; onSelect: (token: PlayerTokenState) => void; onResizeTeam: (size: number) => void }) {
  const averageSize = Math.round((tokens.reduce((total, token) => total + token.size, 0) / tokens.length) / 2) * 2
  const uniformSize = tokens.every(token => token.size === tokens[0]?.size)
  const teamPlural = team === 'ally' ? 'aliadas' : 'enemigas'
  return <section className={`panel team-panel ${team}`} aria-labelledby={`${team}-title`}>
    <div className="panel-heading"><div className="team-mark">{team === 'ally' ? 'A' : 'E'}</div><div><p className="eyebrow">Composición</p><h2 id={`${team}-title`}>{team === 'ally' ? 'Aliados' : 'Enemigos'}</h2></div><span className="team-count">5 / 5</span></div>
    <div className="roster">{tokens.map(token => {
      const god = GODS.find(g => g.name === token.god)
      return <button key={token.id} className="roster-row" onClick={() => onSelect(token)} aria-label={`Editar ${TEAM_LABELS[team]} ${ROLE_LABELS[token.role]}`}>
        <span className="roster-avatar"><img src={god?.src ?? ROLE_IMAGES[token.role]} alt="" style={god ? { objectPosition: god.objectPosition } : undefined}/></span>
        <span><small>{ROLE_LABELS[token.role]}</small><strong>{token.god ?? 'Sin asignar'}</strong></span><span className="edit-hint">Editar</span>
      </button>
    })}</div>
    <label className="team-size-control"><span><small>Tamaño del equipo</small><strong>{uniformSize ? `${tokens[0]?.size}px` : `Mixto · ${averageSize}px`}</strong></span><input type="range" min="36" max="80" step="2" value={averageSize} onChange={event => onResizeTeam(Number(event.target.value))} aria-label={`Tamaño de todas las fichas ${teamPlural}`}/></label>
  </section>
}
