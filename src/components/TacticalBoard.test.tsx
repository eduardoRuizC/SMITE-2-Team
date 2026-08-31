import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TacticalBoard } from './TacticalBoard'

const exportMocks = vi.hoisted(() => ({ png: vi.fn<(state: unknown, area?: unknown) => Promise<void>>(() => Promise.resolve()), json: vi.fn() }))
vi.mock('../exportBoard', async importOriginal => {
  const original = await importOriginal<typeof import('../exportBoard')>()
  return { ...original, exportBoardPng: exportMocks.png, exportBoardJson: exportMocks.json }
})

describe('flujo principal de la pizarra', () => {
  beforeEach(() => { localStorage.clear(); exportMocks.png.mockClear(); exportMocks.json.mockClear() })

  it('muestra diez fichas y permite asignar un dios, cambiar mapa y crear un marcador', () => {
    render(<TacticalBoard />)
    expect(screen.getAllByRole('button', { name: /^(Aliado|Enemigo) ·/ })).toHaveLength(10)

    fireEvent.click(screen.getByRole('button', { name: 'Editar Aliado Solo' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Buscar dios' }), { target: { value: 'Zeus' } })
    fireEvent.click(screen.getByRole('button', { name: 'Asignar Zeus' }))
    expect(screen.getByRole('button', { name: 'Aliado · Solo · Zeus' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Editar Aliado Solo' }))
    fireEvent.change(screen.getByRole('slider', { name: 'Tamaño de la ficha' }), { target: { value: '70' } })
    expect(screen.getByRole('button', { name: 'Aliado · Solo · Zeus' }).style.width).toBe('70px')
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar selector' }))

    fireEvent.change(screen.getByRole('slider', { name: 'Tamaño de todas las fichas aliadas' }), { target: { value: '64' } })
    expect(screen.getAllByRole('button', { name: /^Aliado ·/ }).every(token => token.style.width === '64px')).toBe(true)
    expect(screen.getAllByRole('button', { name: /^Enemigo ·/ }).every(token => token.style.width === '48px')).toBe(true)

    fireEvent.change(screen.getByRole('combobox', { name: 'Seleccionar vista del mapa' }), { target: { value: 'fire' } })
    expect(screen.getByAltText('Vista táctica: Fire Giant')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Añadir marcador Atacar' }))
    expect(screen.getByRole('button', { name: 'Atacar' })).toBeTruthy()
    expect(screen.getByLabelText('Editar marcador')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Añadir marcador Objetivo' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Colocar marcador en ubicación del mapa' }), { target: { value: 'fire-giant' } })
    const objective = screen.getByRole('button', { name: 'Objetivo, Fire Giant' })
    expect(objective.style.left).toBe('72.6%')
    expect(objective.style.top).toBe('49.7%')

    fireEvent.change(screen.getByRole('combobox', { name: 'Seleccionar vista del mapa' }), { target: { value: 'full' } })
    expect(objective.style.left).toBe('71.9%')
    expect(objective.style.top).toBe('49.6%')

    fireEvent.click(screen.getByRole('button', { name: 'Acercar mapa' }))
    expect((screen.getByRole('slider', { name: 'Nivel de zoom del mapa' }) as HTMLInputElement).value).toBe('1.25')
  })

  it('activa el modo pantalla completa y permite alternar sus menús', () => {
    render(<TacticalBoard />)
    fireEvent.click(screen.getByRole('button', { name: 'Abrir mapa a pantalla completa' }))
    const controls = screen.getByRole('toolbar', { name: 'Menús de pantalla completa' })
    const allyToggle = within(controls).getByRole('button', { name: /Aliados/ })
    fireEvent.click(allyToggle)
    expect(allyToggle.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByLabelText('Menú aliado')).toBeTruthy()

    const markerToggle = within(controls).getByRole('button', { name: /Marcadores/ })
    fireEvent.click(markerToggle)
    expect(screen.getByLabelText('Menús enemigos y marcadores')).toBeTruthy()

    fireEvent.click(within(controls).getByRole('button', { name: 'Salir de pantalla completa' }))
    expect(screen.queryByRole('toolbar', { name: 'Menús de pantalla completa' })).toBeNull()
  })

  it('mantiene visible el color seleccionado en la paleta de dibujo', () => {
    render(<TacticalBoard />)
    const yellow = screen.getByRole('button', { name: 'Color #ffc93d' }) as HTMLButtonElement

    fireEvent.click(yellow)

    expect(yellow.getAttribute('aria-pressed')).toBe('true')
    expect(yellow.style.backgroundColor).toBe('rgb(255, 201, 61)')
  })

  it('pregunta qué área exportar cuando el mapa tiene zoom', () => {
    render(<TacticalBoard />)
    fireEvent.click(screen.getByRole('button', { name: 'Acercar mapa' }))
    fireEvent.click(screen.getByText('Imagen PNG'))

    expect(screen.getByRole('dialog', { name: '¿Qué parte del mapa quieres exportar?' })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Todo el mapa/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Solo lo visible/ })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('dialog', { name: '¿Qué parte del mapa quieres exportar?' })).toBeNull()

    fireEvent.click(screen.getByText('Imagen PNG'))
    fireEvent.click(screen.getByRole('button', { name: /Solo lo visible/ }))
    expect(exportMocks.png).toHaveBeenCalledOnce()
    expect(exportMocks.png.mock.calls[0][1]).toEqual({ x: 0, y: 0, width: .8, height: .8 })
  })
})
