import { describe, expect, it } from 'vitest'
import { initialBoardState } from './data'
import { eventToNormalized, isValidBoardState, loadState, pushHistory, redoHistory, saveState, STORAGE_KEY, undoHistory } from './utils'

describe('coordenadas normalizadas', () => {
  const rect = { left: 100, top: 50, width: 400, height: 200 } as DOMRect
  it('convierte el centro y limita puntos externos', () => {
    expect(eventToNormalized(300, 150, rect)).toEqual({ x: .5, y: .5 })
    expect(eventToNormalized(0, 500, rect)).toEqual({ x: 0, y: 1 })
  })
})

describe('persistencia', () => {
  it('guarda y recupera un estado válido', () => {
    const data = new Map<string,string>()
    const storage = { getItem: (key:string) => data.get(key) ?? null, setItem: (key:string,value:string) => data.set(key,value) }
    const state = initialBoardState(); state.tacticName = 'Prueba'
    saveState(state, storage); expect(data.has(STORAGE_KEY)).toBe(true); expect(loadState(storage).tacticName).toBe('Prueba')
  })
  it('migra tamaños de ficha y zoom de estados anteriores', () => {
    const legacy = initialBoardState() as unknown as Record<string, unknown>
    delete legacy.zoom
    legacy.tokens = (legacy.tokens as Array<Record<string, unknown>>).map(token => { const copy={...token}; delete copy.size; return copy })
    const storage = { getItem: () => JSON.stringify(legacy) }
    const loaded = loadState(storage)
    expect(loaded.zoom).toBe(1)
    expect(loaded.tokens.every(token => token.size === 48)).toBe(true)
  })
  it('recoloca marcadores automáticos guardados con coordenadas antiguas', () => {
    const legacy = initialBoardState()
    legacy.markers = [{ id: 'old-fire', type: 'objective', label: 'Fire Giant', color: 'warning', size: 68, x: .695, y: .455 }]
    const storage = { getItem: () => JSON.stringify(legacy) }
    const marker = loadState(storage).markers[0]
    expect(marker.landmarkId).toBe('fire-giant')
    expect({ x: marker.x, y: marker.y }).toEqual({ x: .719, y: .496 })
  })
  it('rechaza estados incompletos', () => expect(isValidBoardState({ version: 1 })).toBe(false))
})

describe('historial', () => {
  it('deshace, rehace y limpia el futuro con un cambio nuevo', () => {
    let history = { past: [] as number[], present: 1, future: [] as number[] }
    history = pushHistory(history, 2); history = pushHistory(history, 3)
    history = undoHistory(history); expect(history.present).toBe(2)
    history = redoHistory(history); expect(history.present).toBe(3)
    history = undoHistory(history); history = pushHistory(history, 4)
    expect(history).toEqual({ past: [1, 2], present: 4, future: [] })
  })
})
