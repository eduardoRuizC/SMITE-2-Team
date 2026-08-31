# SMITE 2 Tactical Board

Pizarra táctica interactiva para preparar estrategias de Conquest. Incluye composiciones aliada y enemiga, diez fichas movibles, selector de dioses, marcadores, dibujo vectorial, historial, guardado local e importación/exportación.

## Ejecutar

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev
```

Vite mostrará la URL local (normalmente `http://localhost:5173`).

## Comprobar y compilar

```bash
npm test
npm run build
```

La compilación de producción se genera en `dist/`. Los mapas, iconos de roles y retratos permanecen en sus rutas originales y Vite los sirve como recursos públicos desde la raíz del proyecto.

## Uso

- Arrastra las diez fichas por el mapa o muévelas con las flechas del teclado.
- Pulsa una ficha o una fila lateral para asignar un dios.
- Arrastra un marcador desde la paleta; en pantallas táctiles, púlsalo para crearlo en el centro.
- Selecciona un marcador colocado para editar su etiqueta, color y tamaño, o enviarlo automáticamente a Gold Fury, Fire Giant, cualquier torre, Fénix o Titán.
- El marcador **Objetivo** es una mira transparente que mantiene visible el mapa y puede redimensionarse.
- Abre una ficha para cambiar su tamaño individual entre 36 y 80 px, o usa el control del panel de equipo para redimensionar las cinco fichas simultáneamente.
- Usa los controles `− / +` del mapa para ampliar hasta 300%. El mapa se ajusta a la pantalla sin barras de scroll; con zoom activo, arrastra el fondo, usa la rueda/trackpad o las flechas del teclado para recorrerlo.
- Usa el botón de pantalla completa de la barra superior para dedicar todo el viewport al mapa. Sus controles flotantes permiten mostrar u ocultar independientemente Aliados, Enemigos, Marcadores y Herramientas; `Esc` o **Salir** restauran la interfaz normal.
- Elige lápiz, flecha o borrador en la barra inferior. Los objetos quedan bloqueados mientras dibujas.
- La pizarra se guarda automáticamente en `localStorage`. El menú **Exportar** permite descargar PNG/JSON e importar un JSON validado.

La exportación PNG se renderiza a 1600 × 1600 e incluye mapa, dibujos, fichas, marcadores y etiquetas.

## Documentación

La [documentación técnica](docs/DOCUMENTACION_TECNICA.md) describe las tecnologías utilizadas, la arquitectura, el modelo de estado, los flujos de persistencia y exportación, las pruebas y el despliegue.
