# Grech Arcade — Game Design Document

## Concepto

Side-scroller arcade de plataformas ambientado en un gimnasio de gimnasia artística. Estética pixel art moderno (estilo Shovel Knight) con paleta luminosa y audio chiptune moderno.

Creado para **Charlie, 8 años, gimnasta artística del equipo Grech**.

---

## Niveles

4 niveles secuenciales (selección libre tras completar):

1. **Suelo** — Desbloquea: lateral + voltereta atrás
2. **Barra de equilibrio** — Desbloquea: spagat + equilibrio sobre una pierna
3. **Barras asimétricas** — Desbloquea: rondada + puente
4. **Salto de potro** — Desbloquea: paloma

Cada nivel dividido en dos secciones: la primera enseña el movimiento nuevo en entorno fácil, la segunda exige dominarlo.

Al final de cada nivel: **barra de precisión para clavar la recepción**. Centro perfecto = bonus máximo.

---

## Mecánica

- Avanzar de izquierda a derecha superando obstáculos
- Recoger coleccionables por el camino
- Timer generoso (bonus por tiempo restante, no castigo)
- Scroll libre (Charlie controla el ritmo)
- 3 vidas clásicas + vidas extra por puntuación

---

## Controles

Solo teclado.

| Tecla | Acción |
|---|---|
| Flechas izq/der | Correr |
| Espacio | Saltar |
| Flecha abajo | Agacharse |
| Z | Acción especial (contextual) |

La tecla Z ejecuta el movimiento especial adecuado según el contexto (posición, estado, entorno).

---

## Movimientos

### Básicos (siempre disponibles)
- **Correr** — desplazamiento horizontal
- **Saltar** — superar obstáculos
- **Agacharse** — esquivar obstáculos altos

### Especiales (desbloqueo progresivo)
1. **Lateral (rueda lateral)** — desplazamiento rápido con esquiva
2. **Voltereta hacia atrás** — salto alto para obstáculos altos o plataformas elevadas
3. **Spagat** — agacharse al máximo para pasar bajo obstáculos muy bajos
4. **Equilibrio sobre una pierna** — para zonas estrechas (barra de equilibrio)
5. **Rondada** — impulso con combo de salto
6. **Puente** — esquivar obstáculos aéreos
7. **Paloma (salto en extensión)** — salto largo horizontal

---

## Obstáculos

### Fijos
- Colchonetas apiladas
- Plintos mal colocados
- Bancos suecos cruzados
- Quitamiedos (colchonetas gordas) bloqueando paso
- Espalderas que se interponen
- Trampolines que te lanzan donde no quieres

### Móviles
- **Compañeras gimnastas** practicando (haciendo laterales, volteretas)
- **Carritos con material** cruzando la pantalla

---

## Coleccionables

### Puntos
- Medallas de oro (valor alto)
- Medallas de plata (valor medio)
- Medallas de bronce (valor bajo)
- Copas
- Trofeos

### Power-ups (efecto temporal)
- **Magnesio** — agarre perfecto en barras/espalderas durante X segundos
- **Agua** — recuperar tiempo en el timer

### Cosméticos (desbloqueables permanentes)
- **Mallas** — diferentes diseños, colores, brillos
- **Sudaderas del equipo** — variaciones
- **Peinados** — diferentes estilos y colores

---

## Personaje

- Nombre: Charlie
- Look inicial: pantalón corto, camiseta, coleta simple
- Personalizable: malla + sudadera + pelo
- Se desbloquean cosméticos al avanzar en el juego
- Diseño base parecido a Charlie real

---

## Estética

### Visual
- **Pixel art moderno** estilo Shovel Knight
- Paleta de colores luminosa y alegre
- Gimnasio reconocible: suelo claro, paredes, aparatos reales

### Audio
- **Chiptune moderno** (chip sounds con composición rica)
- 6 temas musicales:
  - Menú / pantalla título
  - Nivel 1 (Suelo)
  - Nivel 2 (Barra de equilibrio)
  - Nivel 3 (Barras asimétricas)
  - Nivel 4 (Salto de potro)
  - Game over
- Efectos de sonido: saltar, recoger, fallar, desbloquear, timer bajo, clavar recepción

---

## Flujo de pantallas

1. **Pantalla título** — Logo "Grech Arcade", "PRESS START" parpadeando
2. **Personalización** — Elegir pelo/ropa con lo desbloqueado
3. **Selección de nivel** — 4 niveles, bloqueados hasta completar el anterior (libres tras completar)
4. **Juego** — El nivel
5. **Recepción** — Barra de precisión para clavar
6. **Pantalla puntuación** — Puntos, medallas, tiempo bonus, desbloqueos
7. **Game over** — Puntuación final, "¿OTRA VEZ?"

---

## Sistemas

### Guardado
- LocalStorage automático del navegador
- Persiste: niveles completados, cosméticos desbloqueados, high scores

### High Scores
- Tabla top 10 con iniciales (3 letras estilo arcade clásico)
- Local (solo en su navegador)

---

## Tecnología

- HTML + CSS + JavaScript
- Sin frameworks externos
- Ejecutable abriendo un archivo HTML en el navegador
