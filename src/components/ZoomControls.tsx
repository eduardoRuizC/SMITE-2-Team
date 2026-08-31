export function ZoomControls({ zoom, onChange }: { zoom: number; onChange: (zoom: number) => void }) {
  const update = (value: number) => onChange(Math.min(3, Math.max(1, Math.round(value * 4) / 4)))
  return <div className="zoom-controls" aria-label="Zoom del mapa">
    <button onClick={() => update(zoom - .25)} disabled={zoom <= 1} aria-label="Alejar mapa">−</button>
    <label><span>Zoom</span><input type="range" min="1" max="3" step=".25" value={zoom} onChange={e => update(Number(e.target.value))} aria-label="Nivel de zoom del mapa"/></label>
    <output aria-live="polite">{Math.round(zoom * 100)}%</output>
    <button onClick={() => update(zoom + .25)} disabled={zoom >= 3} aria-label="Acercar mapa">+</button>
  </div>
}
