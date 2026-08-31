import type { BoardState, Point } from './types'
import { LANDMARKS, getLandmarkPoint, initialBoardState } from './data'

export const STORAGE_KEY = 'smite2-tactical-board:v1'
export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value))

export function eventToNormalized(clientX: number, clientY: number, rect: DOMRect): Point {
  return { x: clamp((clientX - rect.left) / rect.width), y: clamp((clientY - rect.top) / rect.height) }
}

export function isValidBoardState(value: unknown): value is BoardState {
  if (!value || typeof value !== 'object') return false
  const state = value as Partial<BoardState>
  if (state.version !== 1 || typeof state.tacticName !== 'string') return false
  if (!['full', 'fire', 'titan'].includes(state.mapId ?? '')) return false
  if (!Array.isArray(state.tokens) || state.tokens.length !== 10 || !Array.isArray(state.markers) || !Array.isArray(state.strokes)) return false
  if (!Number.isFinite(state.zoom) || state.zoom! < 1 || state.zoom! > 3) return false
  if (!state.drawing || typeof state.drawing !== 'object' || typeof state.drawing.color !== 'string' ||
      !Number.isFinite(state.drawing.width) || !Number.isFinite(state.drawing.opacity)) return false
  const pointValid = (point: unknown) => !!point && typeof point === 'object' && Number.isFinite((point as Point).x) &&
    Number.isFinite((point as Point).y) && (point as Point).x >= 0 && (point as Point).x <= 1 && (point as Point).y >= 0 && (point as Point).y <= 1
  const ids = new Set<string>()
  const tokensValid = state.tokens.every(token => token && typeof token.id === 'string' && !ids.has(token.id) && ids.add(token.id) &&
    ['ally', 'enemy'].includes(token.team) && ['solo', 'jungle', 'mid', 'carry', 'support'].includes(token.role) && pointValid(token) &&
    Number.isFinite(token.size) && token.size >= 32 && token.size <= 96 && (token.god === undefined || typeof token.god === 'string'))
  const markersValid = state.markers.length <= 500 && state.markers.every(marker => marker && typeof marker.id === 'string' &&
    typeof marker.type === 'string' && typeof marker.label === 'string' && marker.label.length <= 48 &&
    ['ally', 'enemy', 'neutral', 'warning'].includes(marker.color) && Number.isFinite(marker.size) && marker.size >= 20 && marker.size <= 120 &&
    (marker.landmarkId === undefined || typeof marker.landmarkId === 'string') && pointValid(marker))
  const strokesValid = state.strokes.length <= 1000 && state.strokes.every(stroke => stroke && typeof stroke.id === 'string' &&
    ['freehand', 'arrow'].includes(stroke.kind) && typeof stroke.color === 'string' && Number.isFinite(stroke.width) &&
    Number.isFinite(stroke.opacity) && stroke.opacity >= 0 && stroke.opacity <= 1 && Array.isArray(stroke.points) &&
    stroke.points.length <= 20000 && stroke.points.every(pointValid))
  return Boolean(tokensValid && markersValid && strokesValid)
}

export function loadState(storage: Pick<Storage, 'getItem'> = localStorage): BoardState {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(STORAGE_KEY) ?? 'null')
    if (parsed && typeof parsed === 'object') {
      const legacy = parsed as Partial<BoardState>
      const mapId = ['full', 'fire', 'titan'].includes(legacy.mapId ?? '') ? legacy.mapId! : 'full'
      const migrated = {
        ...legacy,
        mapId,
        zoom: legacy.zoom ?? 1,
        tokens: Array.isArray(legacy.tokens) ? legacy.tokens.map(token => ({ ...token, size: token.size ?? 48 })) : legacy.tokens,
        markers: Array.isArray(legacy.markers) ? legacy.markers.map(marker => {
          if (marker.landmarkId) return marker
          const landmark = LANDMARKS.find(place => place.label === marker.label ||
            place.label.replace(/ aliada$/, ' aliado').replace(/ enemiga$/, ' enemigo') === marker.label)
          return landmark ? { ...marker, ...getLandmarkPoint(landmark, mapId), landmarkId: landmark.id } : marker
        }) : legacy.markers,
      }
      if (isValidBoardState(migrated)) return migrated
    }
    return initialBoardState()
  } catch { return initialBoardState() }
}

export function saveState(state: BoardState, storage: Pick<Storage, 'setItem'> = localStorage) {
  storage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export interface History<T> { past: T[]; present: T; future: T[] }
export function pushHistory<T>(history: History<T>, next: T, limit = 60): History<T> {
  return { past: [...history.past, history.present].slice(-limit), present: next, future: [] }
}
export function undoHistory<T>(history: History<T>): History<T> {
  if (!history.past.length) return history
  return { past: history.past.slice(0, -1), present: history.past.at(-1)!, future: [history.present, ...history.future] }
}
export function redoHistory<T>(history: History<T>): History<T> {
  if (!history.future.length) return history
  return { past: [...history.past, history.present], present: history.future[0], future: history.future.slice(1) }
}

export const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a'); link.href = url; link.download = fileName; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
