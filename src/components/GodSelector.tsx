import { useEffect, useMemo, useRef, useState } from 'react'
import { GODS, ROLE_IMAGES, ROLE_LABELS, TEAM_LABELS } from '../data'
import type { PlayerTokenState } from '../types'
import { Icon } from './Icon'

export function GodSelector({ token, onSelect, onResize, onClose }: { token: PlayerTokenState; onSelect: (god?: string) => void; onResize: (size: number) => void; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const dialogRef = useRef<HTMLDivElement>(null)
  const gods = useMemo(() => GODS.filter(g => g.name.toLocaleLowerCase('es').includes(query.toLocaleLowerCase('es'))), [query])
  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', close); dialogRef.current?.querySelector<HTMLInputElement>('input')?.focus()
    return () => window.removeEventListener('keydown', close)
  }, [onClose])
  return <div className="modal-backdrop" onPointerDown={e => e.target === e.currentTarget && onClose()}>
    <div className="god-modal" role="dialog" aria-modal="true" aria-labelledby="god-modal-title" ref={dialogRef}>
      <header><div><p className="eyebrow">{TEAM_LABELS[token.team]} · {ROLE_LABELS[token.role]}</p><h2 id="god-modal-title">Elegir dios</h2></div><button className="icon-button" onClick={onClose} aria-label="Cerrar selector"><Icon name="close" /></button></header>
      <div className="search-box"><Icon name="search" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar entre los dioses…" aria-label="Buscar dios" /></div>
      <button className="clear-god" onClick={() => { onSelect(); onClose() }}><img src={ROLE_IMAGES[token.role]} alt=""/><span><strong>Usar icono de rol</strong><small>Quitar dios seleccionado</small></span><Icon name="chevron"/></button>
      <label className="token-size-control"><span>Tamaño de la ficha</span><input type="range" min="36" max="80" step="2" value={token.size} onChange={e => onResize(Number(e.target.value))} aria-label="Tamaño de la ficha"/><output>{token.size}px</output></label>
      <div className="god-grid" aria-live="polite">{gods.map(god => <button key={god.name} className={token.god === god.name ? 'selected' : ''} onClick={() => { onSelect(god.name); onClose() }} aria-label={`Asignar ${god.name}`}><img src={god.src} alt="" style={{ objectPosition: god.objectPosition }}/><span>{god.name}</span></button>)}</div>
      {!gods.length && <p className="empty-state">No hay dioses que coincidan con “{query}”.</p>}
    </div>
  </div>
}
