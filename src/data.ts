import type { BoardState, God, Landmark, MapId, MarkerColor, Point, Role, Team } from './types'
import mapFull from '../Map.png'
import mapFire from '../Map_fire_giant.webp'
import mapTitan from '../Map_titan.webp'
import roleSolo from '../roles/SOLO.png'
import roleJungle from '../roles/JUNGLE.png'
import roleMid from '../roles/MID.png'
import roleCarry from '../roles/CARRY.png'
import roleSupport from '../roles/SUPPORT.png'

export const ROLE_LABELS: Record<Role, string> = {
  solo: 'Solo', jungle: 'Jungla', mid: 'Medio', carry: 'Carry', support: 'Support',
}
export const TEAM_LABELS: Record<Team, string> = { ally: 'Aliado', enemy: 'Enemigo' }
export const ROLE_IMAGES: Record<Role, string> = {
  solo: roleSolo, jungle: roleJungle, mid: roleMid, carry: roleCarry, support: roleSupport,
}
export const MAPS: { id: MapId; label: string; src: string }[] = [
  { id: 'full', label: 'Mapa completo', src: mapFull },
  { id: 'fire', label: 'Fire Giant', src: mapFire },
  { id: 'titan', label: 'Titán', src: mapTitan },
]

const portraitFiles = import.meta.glob('/gods/*.jpg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
export const GODS: God[] = Object.entries(portraitFiles).map(([path, src]) => {
  const raw = path.split('/').pop()!.replace(/\.jpg$/i, '')
  const name = raw.toLocaleLowerCase('es').replace(/(^|\s)\p{L}/gu, (letter) => letter.toLocaleUpperCase('es'))
  return { name, src, objectPosition: '50% 20%' }
}).sort((a, b) => a.name.localeCompare(b.name, 'es'))

export const MARKER_TYPES = [
  { id: 'objective', label: 'Objetivo', icon: '○' },
  { id: 'attack', label: 'Atacar', icon: '⚔' }, { id: 'defend', label: 'Defender', icon: '◆' },
  { id: 'ambush', label: 'Emboscada', icon: '⌁' }, { id: 'rotate', label: 'Rotación', icon: '↻' },
  { id: 'regroup', label: 'Reagruparse', icon: '◎' }, { id: 'retreat', label: 'Retirada', icon: '↩' },
  { id: 'danger', label: 'Peligro', icon: '!' }, { id: 'ward', label: 'Visión / Ward', icon: '◉' },
  { id: 'fire-giant', label: 'Fire Giant', icon: '♨' }, { id: 'gold-fury', label: 'Gold Fury', icon: '✦' },
  { id: 'tower', label: 'Torre', icon: '♜' }, { id: 'phoenix', label: 'Fénix', icon: '♨' },
  { id: 'titan', label: 'Titán', icon: '♛' },
] as const
export const MARKER_COLORS: Record<MarkerColor, string> = {
  ally: '#28a9ff', enemy: '#ff5b45', neutral: '#e9d5a0', warning: '#ffc93d',
}

export const LANDMARKS: Landmark[] = [
  { id: 'gold-fury', label: 'Gold Fury', group: 'objective', x: .312, y: .5 },
  { id: 'fire-giant', label: 'Fire Giant', group: 'objective', x: .719, y: .496, positions: { fire: { x: .726, y: .497 } } },
  { id: 'ally-titan', label: 'Titán aliado', group: 'titan', x: .498, y: .957, positions: { titan: { x: .498, y: .949 } } },
  { id: 'enemy-titan', label: 'Titán enemigo', group: 'titan', x: .5, y: .05, positions: { titan: { x: .498, y: .115 } } },
  { id: 'ally-phoenix-left', label: 'Fénix izquierdo aliado', group: 'phoenix', x: .387, y: .871 },
  { id: 'ally-phoenix-mid', label: 'Fénix central aliado', group: 'phoenix', x: .498, y: .834 },
  { id: 'ally-phoenix-right', label: 'Fénix derecho aliado', group: 'phoenix', x: .605, y: .869 },
  { id: 'enemy-phoenix-left', label: 'Fénix izquierdo enemigo', group: 'phoenix', x: .382, y: .133 },
  { id: 'enemy-phoenix-mid', label: 'Fénix central enemigo', group: 'phoenix', x: .491, y: .174 },
  { id: 'enemy-phoenix-right', label: 'Fénix derecho enemigo', group: 'phoenix', x: .604, y: .129 },
  { id: 'ally-tower-left-outer', label: 'Torre izquierda exterior aliada', group: 'tower', x: .155, y: .647 },
  { id: 'ally-tower-left-inner', label: 'Torre izquierda interior aliada', group: 'tower', x: .308, y: .742 },
  { id: 'ally-tower-mid-outer', label: 'Torre central exterior aliada', group: 'tower', x: .475, y: .581 },
  { id: 'ally-tower-mid-inner', label: 'Torre central interior aliada', group: 'tower', x: .501, y: .701 },
  { id: 'ally-tower-right-outer', label: 'Torre derecha exterior aliada', group: 'tower', x: .842, y: .621 },
  { id: 'ally-tower-right-inner', label: 'Torre derecha interior aliada', group: 'tower', x: .697, y: .745 },
  { id: 'enemy-tower-left-outer', label: 'Torre izquierda exterior enemiga', group: 'tower', x: .154, y: .342 },
  { id: 'enemy-tower-left-inner', label: 'Torre izquierda interior enemiga', group: 'tower', x: .308, y: .253 },
  { id: 'enemy-tower-mid-outer', label: 'Torre central exterior enemiga', group: 'tower', x: .482, y: .406 },
  { id: 'enemy-tower-mid-inner', label: 'Torre central interior enemiga', group: 'tower', x: .499, y: .29 },
  { id: 'enemy-tower-right-outer', label: 'Torre derecha exterior enemiga', group: 'tower', x: .841, y: .369 },
  { id: 'enemy-tower-right-inner', label: 'Torre derecha interior enemiga', group: 'tower', x: .695, y: .247 },
]
export const getLandmarkPoint = (landmark: Landmark, mapId: MapId): Point => landmark.positions?.[mapId] ?? { x: landmark.x, y: landmark.y }

const ROLES = Object.keys(ROLE_LABELS) as Role[]
const positions: Record<Team, Point[]> = {
  ally: [{ x: .38, y: .9 }, { x: .44, y: .84 }, { x: .5, y: .89 }, { x: .56, y: .84 }, { x: .62, y: .9 }],
  enemy: [{ x: .62, y: .1 }, { x: .56, y: .16 }, { x: .5, y: .11 }, { x: .44, y: .16 }, { x: .38, y: .1 }],
}
export function initialBoardState(): BoardState {
  const tokens = (['ally', 'enemy'] as Team[]).flatMap(team => ROLES.map((role, index) => ({
    id: `${team}-${role}`, team, role, size: 48, ...positions[team][index],
  })))
  return {
    version: 1, tacticName: 'Nueva estrategia', mapId: 'full', tokens, markers: [], strokes: [], zoom: 1,
    drawing: { color: '#28a9ff', width: 4, opacity: .9 },
  }
}
