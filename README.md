# Visualizador de Algoritmos de Recorrido en Grafos

Herramienta educativa interactiva para visualizar paso a paso la ejecución de BFS y DFS sobre grafos arbitrarios[cite: 3]. Construida con HTML, CSS y JavaScript vanilla usando Cytoscape.js para la renderización del grafo[cite: 3].

---

## Características

### Algoritmos implementados

- **BFS (Búsqueda en Amplitud)**: Explora nivel por nivel desde el nodo origen[cite: 3]. Utiliza una estructura interna de Cola (FIFO)[cite: 3].
- **DFS (Búsqueda en Profundidad)**: Va a la mayor profundidad posible antes de retroceder[cite: 3]. Utiliza una estructura interna de Pila (LIFO)[cite: 3].
- Ambos se implementan de forma iterativa (no recursiva), lo que permite generar y almacenar todos los pasos antes de reproducirlos[cite: 3].

### Visualización y Controles

- Cada paso del algoritmo se aplica como un cambio de estado visual sobre el grafo en tiempo real[cite: 3].
- **▶ Iniciar / ⏸ Pausar** — inicia o pausa la reproducción automática[cite: 3].
- **→ Paso** — avanza manualmente un paso a la vez[cite: 3].
- **↺ Reiniciar** — vuelve al estado inicial sin modificar el grafo[cite: 3].
- **Velocidad** — deslizador con tres niveles: Lenta (1500 ms), Media (750 ms), Rápida (280 ms)[cite: 3].

### Importación de grafos

- Admite arrastrar y soltar un archivo directamente sobre el canvas o usar el botón "Importar grafo"[cite: 3].
- Extensiones aceptadas: `.json`, `.csv`, `.txt`[cite: 3]. Cualquier otro tipo se rechaza con un mensaje de error antes de intentar leer el archivo[cite: 3].
- Guía completa de formatos y ejemplos: [FORMATOS_IMPORTACION.md](FORMATOS_IMPORTACION.md).

---

## Estructura de archivos

El proyecto utiliza ES Modules para separar las responsabilidades lógicas, de interfaz y de renderizado:

\`\`\`text
Algoritmo de Recorrido y Búsqueda/
├── index.html — Estructura HTML y plantilla de la interfaz principal.
├── styles.css — Estilos, paleta de colores monocromática y layout[cite: 5].
└── src/
├── main.js — Punto de entrada que orquesta el flujo de la aplicación.
├── state.js — Manejo del estado global de la simulación.
├── constants.js — Configuraciones y grafo por defecto.
├── graph/ — Módulos dedicados a la instancia de Cytoscape.js.
├── core/ — Lógica de algoritmos (BFS/DFS) y utilidades matemáticas.
├── ui/ — Manipulación del DOM y registro de eventos del usuario.
└── io/import.js — Parseo y validación de archivos externos[cite: 3].
\`\`\`

---

## Grafo de ejemplo predeterminado

Al cargar la página se muestra un árbol de 9 nodos sin pesos, diseñado para que la diferencia entre BFS y DFS sea clara[cite: 3].

- **BFS desde A:** `A → B, C, D → E, F, G, H, I` (nivel por nivel)[cite: 3].
- **DFS desde A:** `A → B → E → F → C → G → D → H → I` (profundidad primero)[cite: 3].

---

## Limitaciones

- **Grafos no dirigidos únicamente.** La lista de adyacencia se construye en ambas direcciones para toda arista, independientemente de cómo esté definida en el JSON[cite: 3].
- **Sin retroceso (backtracking) visual.** El DFS iterativo no anima el "regreso" por las aristas como lo haría una implementación recursiva; solo muestra el avance[cite: 3].
- **Un único nodo de inicio por recorrido.** No se admite BFS/DFS multi-origen[cite: 3].
- **El formato TXT no soporta pesos.** Las aristas importadas desde lista de adyacencia siempre se tratan como no ponderadas[cite: 3].

---

## Dependencias

- **Cytoscape.js (v3.29.2)**: Renderización, layouts e interacción del grafo[cite: 3]. Cargada vía CDN (`cdnjs.cloudflare.com`)[cite: 3]. No requiere instalación ni bundler[cite: 3].
