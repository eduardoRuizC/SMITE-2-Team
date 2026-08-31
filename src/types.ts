export type Team = 'ally' | 'enemy'
export type Role = 'solo' | 'jungle' | 'mid' | 'carry' | 'support'
export type MapId = 'full' | 'fire' | 'titan'
export type ToolMode = 'select' | 'pen' | 'arrow' | 'eraser'
export type MarkerColor = 'ally' | 'enemy' | 'neutral' | 'warning'

export interface Point { x: number; y: number }
export interface PlayerTokenState extends Point {
  id: string
  team: Team
  role: Role
  god?: string
  size: number
}
export interface MarkerState extends Point {
  id: string
  type: string
  label: string
  color: MarkerColor
  size: number
  landmarkId?: string
}
export interface Stroke {
  id: string
  kind: 'freehand' | 'arrow'
  points: Point[]
  color: string
  width: number
  opacity: number
}
export interface BoardState {
  version: 1
  tacticName: string
  mapId: MapId
  tokens: PlayerTokenState[]
  markers: MarkerState[]
  strokes: Stroke[]
  zoom: number
  drawing: { color: string; width: number; opacity: number }
}
export interface God { name: string; src: string; objectPosition?: string }
export interface Landmark extends Point {
  id: string
  label: string
  group: 'objective' | 'tower' | 'phoenix' | 'titan'
  positions?: Partial<Record<MapId, Point>>
}
