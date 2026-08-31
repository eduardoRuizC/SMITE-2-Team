import { useEffect, useRef } from 'react'
import { Icon } from './Icon'

export function ImageExportDialog({ onChoose, onClose }: { onChoose: (scope: 'full' | 'visible') => void; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', closeOnEscape)
    dialogRef.current?.querySelector<HTMLButtonElement>('button')?.focus()
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  return <div className="modal-backdrop" onPointerDown={event => event.target === event.currentTarget && onClose()}>
    <div className="export-image-modal" role="dialog" aria-modal="true" aria-labelledby="export-image-title" aria-describedby="export-image-description" ref={dialogRef}>
      <p className="eyebrow">Zoom activo</p>
      <h2 id="export-image-title">¿Qué parte del mapa quieres exportar?</h2>
      <p id="export-image-description">Elige si el PNG debe incluir el mapa entero o únicamente el área que ves ahora.</p>
      <div className="export-image-actions">
        <button onClick={() => onChoose('full')}><Icon name="image"/><span><strong>Todo el mapa</strong><small>Incluye la estrategia completa</small></span></button>
        <button onClick={() => onChoose('visible')}><Icon name="zoom"/><span><strong>Solo lo visible</strong><small>Respeta el zoom y el encuadre actual</small></span></button>
      </div>
      <button className="export-image-cancel" onClick={onClose}>Cancelar</button>
    </div>
  </div>
}
