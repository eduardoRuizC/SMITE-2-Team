import { MARKER_TYPES } from '../data'

export function MarkerPalette({ onAdd }: { onAdd: (type: string, x?: number, y?: number) => void }) {
  return <section className="panel marker-panel"><div className="panel-heading compact"><div><p className="eyebrow">Órdenes</p><h2>Marcadores</h2></div><span className="drag-note">Arrastra o pulsa</span></div>
    <div className="marker-grid">{MARKER_TYPES.map(marker => <button key={marker.id} className={`marker-${marker.id}`} draggable
      onDragStart={event => { event.dataTransfer.setData('application/x-tactical-marker', marker.id); event.dataTransfer.effectAllowed = 'copy' }}
      onClick={() => onAdd(marker.id)} aria-label={`Añadir marcador ${marker.label}`}>
      <span>{marker.icon}</span><small>{marker.label}</small>
    </button>)}</div>
  </section>
}
