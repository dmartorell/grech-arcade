# Grech Arcade — Arquitectura Técnica

## Stack Tecnológico

| Componente | Tecnología |
|---|---|
| Lenguaje | TypeScript |
| Build | Bun build → bundle único (`dist/main.js`) |
| Servidor local | `bun serve` |
| Linting + Formatting | Biome |
| Testing | `bun test` (API compatible con Jest) |
| Renderizado | Canvas 2D (`imageSmoothingEnabled = false`) |
| Audio | Web Audio API (**implementación diferida al final**) |
| Editor de niveles | Tiled → exportación JSON |

---

## Resolución y Escala

- **Resolución interna:** 400×225 px
- **Tamaño de sprites:** 32×32 px
- **Escalado:** múltiplo entero al tamaño de la ventana (x2, x3, x4)
- **Pixel art nítido:** `imageSmoothingEnabled = false` en el canvas

---

## Estructura del Proyecto

```
grech-arcade/
├── index.html
├── biome.json
├── tsconfig.json
├── package.json
├── src/
│   ├── main.ts              ← entry point
│   ├── engine/
│   │   ├── game.ts          ← game loop, estado global
│   │   ├── input.ts         ← teclado
│   │   ├── renderer.ts      ← canvas, cámara, escala
│   │   ├── physics.ts       ← gravedad, colisiones
│   │   ├── audio.ts         ← Web Audio API (stub inicial)
│   │   └── scene-manager.ts ← gestión de escenas
│   ├── entities/
│   │   ├── player.ts        ← Charlie
│   │   ├── obstacle.ts      ← obstáculos fijos y móviles
│   │   └── collectible.ts   ← medallas, power-ups, cosméticos
│   ├── scenes/
│   │   ├── title.ts         ← pantalla título
│   │   ├── customize.ts     ← personalización
│   │   ├── level-select.ts  ← selección de nivel
│   │   ├── level.ts         ← juego
│   │   ├── reception.ts     ← barra de precisión
│   │   ├── score.ts         ← pantalla puntuación
│   │   └── game-over.ts     ← game over
│   ├── levels/
│   │   └── loader.ts        ← carga y parseo de JSON de Tiled
│   └── utils/
│       ├── sprite.ts        ← carga y animación de sprite sheets
│       └── storage.ts       ← LocalStorage
├── dist/                     ← JS compilado (generado)
│   └── main.js
├── assets/
│   ├── sprites/
│   ├── tiles/
│   ├── audio/
│   └── ui/
├── levels/                   ← archivos JSON exportados de Tiled
└── css/
    └── style.css
```

---

## Game Loop

**Timestep fijo a 60 UPS** con renderizado variable.

```
Lógica:  60 updates/segundo (siempre, independiente de FPS)
Render:  requestAnimationFrame (lo que dé el navegador)
```

La lógica avanza en pasos fijos para garantizar colisiones deterministas y saltos consistentes. Si el PC va lento, se saltan frames de render pero la física no se descuadra.

---

## Sistema de Escenas

Cada escena implementa la interfaz:

```ts
interface Scene {
  enter(): void     // al entrar (cargar recursos, reset estado)
  update(): void    // lógica por frame
  render(): void    // dibujar
  exit(): void      // limpieza al salir
}
```

El `SceneManager` gestiona transiciones:

```ts
sceneManager.switchTo('title')  // exit() actual → enter() nueva
```

**7 escenas:** title → customize → level-select → level → reception → score → game-over

---

## Sistema de Colisiones

**AABB + Tile-based:**

- **Terrain tiles:** el mapa es una cuadrícula. Colisiones por posición en el grid (suelo, plataformas, paredes).
- **Entidades móviles:** obstáculos, coleccionables y Charlie usan cajas AABB.
- **Hitbox reducido:** Charlie tiene hitbox de ~20×28 dentro de su sprite de 32×32 para que las colisiones se sientan justas.

---

## Física del Personaje

| Aspecto | Comportamiento |
|---|---|
| Gravedad | Arcade — caída más rápida que la subida |
| Salto | Variable — pulsación corta = bajo, mantenido = alto |
| Control aéreo | Total — puede cambiar dirección en el aire |
| Coyote time | 5-6 frames de margen para saltar tras salir de plataforma |
| Input buffering | Pulsación de salto justo antes de aterrizar se ejecuta al tocar suelo |

---

## Movimientos Especiales (Tecla Z)

Activación contextual por estado del personaje:

| Combinación | Movimiento |
|---|---|
| Z + aire | Paloma |
| Z + abajo + quieto | Puente |
| Z + abajo + corriendo | Spagat |
| Z + quieto | Voltereta atrás |
| Z + corriendo | Lateral |
| Z + zona barra | Equilibrio |
| Z + corriendo → salto (combo) | Rondada |

El sistema evalúa el estado actual (aire/suelo, corriendo/quieto, dirección pulsada, zona especial) y ejecuta el único movimiento posible para esa combinación.

---

## Cámara

**Dead zone + lerp suave + clamp en bordes:**

- Charlie se mueve libre dentro de una zona central sin que la cámara reaccione.
- Al acercarse al borde de la dead zone, la cámara le sigue con interpolación suave.
- La cámara no muestra más allá de los bordes del nivel.

---

## Diseño de Niveles (Tiled)

Cada nivel tiene 4 capas:

| Capa | Contenido | Colisiona |
|---|---|---|
| **Background** | Decoración de fondo | No |
| **Terrain** | Suelo, plataformas, paredes | Sí |
| **Objects** | Obstáculos, coleccionables, spawn, triggers | Según tipo |
| **Foreground** | Decoración delante del personaje | No |

Los obstáculos móviles se definen como objetos con propiedades: tipo, dirección, velocidad, rango de movimiento.

---

## Barra de Recepción

**Barra oscilante con zona menguante** al final de cada nivel:

```
Nivel 1:  [-------|███████|-------]  zona grande
Nivel 4:  [-----------|█|---------]  zona pequeña
                       ↑
                   indicador
```

Tres resultados: **perfecto** (centro exacto), **bien** (dentro de zona), **fallo** (fuera). Bonus de puntuación según precisión.

---

## Sistema de Guardado

LocalStorage con objeto JSON único bajo la clave `grech-arcade`:

```ts
interface SaveData {
  levelsCompleted: boolean[]
  unlockedCosmetics: string[]
  equippedCosmetics: {
    outfit: string
    hair: string
  }
  highScores: {
    initials: string
    score: number
  }[]
}
```

Guardado al completar nivel o cambiar cosmético.

---

## Personaje Base: Charlie

| Rasgo | Pixel art (32×32) |
|---|---|
| Complexión | Sprite esbelto, ~8px ancho × 28px alto |
| Pelo | Castaño/rubio dorado (`#C4944A`), coleta con bounce en animaciones |
| Piernas | Proporción ~40% del cuerpo (más largas que el estándar chibi) |
| Look inicial | Pantalón corto, camiseta, coleta simple |

La coleta con bounce al correr y saltar es el rasgo visual más identificable.

---

## Assets (Sprites con IA)

- **Personaje y animaciones:** sprite sheets generados con IA, limpieza manual si es necesario
- **Tiles y fondos:** IA + ajuste manual
- **UI y coleccionables:** IA
- **Plan B:** si la consistencia entre frames falla, usar pack base de itch.io y recolorear

El sistema de sprites debe tolerar imperfecciones menores (tamaños ligeramente variables, centrado no exacto).

---

## Estrategia de Testing

| Qué | Cómo | Prioridad |
|---|---|---|
| Lógica de sistemas (colisiones, movimientos Z, guardado, puntuación, desbloqueos) | `bun test` — tests unitarios | Alta |
| Física/matemáticas (gravedad, salto, coyote time, cámara) | `bun test` — tests unitarios | Alta |
| Game feel, animaciones, visual | Playtesting manual | Media |
| Balance y diversión de niveles | Playtesting con Charlie | Alta (no automatizable) |

Tests para la lógica de negocio. Playtesting para todo lo demás. Sin obsesión por cobertura.

---

## Audio (Diferido)

> **Nota:** el sistema de audio se diseña en la arquitectura pero no se implementa hasta el final del desarrollo. El módulo `audio.ts` existirá como stub con la interfaz definida.

- Web Audio API para música y efectos
- Soporte de múltiples sonidos simultáneos
- Formatos: `.ogg` (música) + `.mp3` (fallback Safari) + `.wav` (efectos)
- 6 temas musicales + efectos de sonido según GDD
