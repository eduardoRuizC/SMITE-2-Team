import { Icon } from './Icon'

export interface FocusMenus { ally: boolean; enemy: boolean; markers: boolean; drawing: boolean }

export function FocusControls({ menus, canUndo, canRedo, onToggle, onUndo, onRedo, onExit }: { menus: FocusMenus; canUndo: boolean; canRedo: boolean; onToggle: (menu: keyof FocusMenus) => void; onUndo: () => void; onRedo: () => void; onExit: () => void }) {
  return <div className="focus-controls" role="toolbar" aria-label="Menús de pantalla completa">
    <button className={menus.ally ? 'active ally' : ''} onClick={() => onToggle('ally')} aria-expanded={menus.ally}><span className="focus-team-letter">A</span><span>Aliados</span></button>
    <button className={menus.enemy ? 'active enemy' : ''} onClick={() => onToggle('enemy')} aria-expanded={menus.enemy}><span className="focus-team-letter">E</span><span>Enemigos</span></button>
    <button className={menus.markers ? 'active' : ''} onClick={() => onToggle('markers')} aria-expanded={menus.markers}><span className="focus-marker-glyph">◇</span><span>Marcadores</span></button>
    <button className={menus.drawing ? 'active' : ''} onClick={() => onToggle('drawing')} aria-expanded={menus.drawing}><Icon name="pen" size={16}/><span>Dibujo</span></button>
    <span className="focus-controls-divider"/>
    <button className="focus-icon-button" onClick={onUndo} disabled={!canUndo} aria-label="Deshacer"><Icon name="undo" size={17}/></button>
    <button className="focus-icon-button" onClick={onRedo} disabled={!canRedo} aria-label="Rehacer"><Icon name="redo" size={17}/></button>
    <span className="focus-controls-divider"/>
    <button className="focus-exit-button" onClick={onExit} aria-label="Salir de pantalla completa"><Icon name="compress" size={17}/><span>Salir</span></button>
  </div>
}
