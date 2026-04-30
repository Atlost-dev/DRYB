# Visualizador de Algoritmos de Recorrido en Grafos

Herramienta educativa interactiva para visualizar paso a paso la ejecución de BFS y DFS sobre grafos arbitrarios. Construida con HTML, CSS y JavaScript vanilla usando Cytoscape.js para la renderización del grafo.

---

## Características

### Algoritmos implementados

- **BFS (Búsqueda en Amplitud)**: Explora nivel por nivel desde el nodo origen. Utiliza una estructura interna de Cola (FIFO).
- **DFS (Búsqueda en Profundidad)**: Va a la mayor profundidad posible antes de retroceder. Utiliza una estructura interna de Pila (LIFO).
- Ambos se implementan de forma iterativa (no recursiva), lo que permite generar y almacenar todos los pasos antes de reproducirlos.

### Visualización y Controles

- Cada paso del algoritmo se aplica como un cambio de estado visual sobre el grafo en tiempo real.
- **▶ Iniciar / ⏸ Pausar** — inicia o pausa la reproducción automática.
- **→ Paso** — avanza manualmente un paso a la vez.
- **↺ Reiniciar** — vuelve al estado inicial sin modificar el grafo.
- **Velocidad** — deslizador con tres niveles: Lenta (1500 ms), Media (750 ms), Rápida (280 ms).

### Importación de grafos

- Admite arrastrar y soltar un archivo directamente sobre el canvas o usar el botón "Importar grafo".
- Extensiones aceptadas: `.json`, `.csv`, `.txt`. Cualquier otro tipo se rechaza con un mensaje de error antes de intentar leer el archivo.
- Guía completa de formatos y ejemplos: [FORMATOS_IMPORTACION.md](FORMATOS_IMPORTACION.md).

---

## Estructura de archivos

El proyecto utiliza ES Modules para separar las responsabilidades lógicas, de interfaz y de renderizado:

```
Algoritmo de Recorrido y Búsqueda/
├── index.html
├── styles.css
└── src/
    ├── main.js
    ├── state.js
    ├── constants.js
    ├── graph/
    ├── core/
    ├── ui/
    └── io/import.js
```

---

## Grafo de ejemplo predeterminado

Al cargar la página se muestra un árbol de 9 nodos sin pesos, diseñado para que la diferencia entre BFS y DFS sea clara.

- **BFS desde A:** `A → B, C, D → E, F, G, H, I` (nivel por nivel).
- **DFS desde A:** `A → B → E → F → C → G → D → H → I` (profundidad primero).

---

## Limitaciones

- **Grafos no dirigidos únicamente.** La lista de adyacencia se construye en ambas direcciones para toda arista, independientemente de cómo esté definida en el JSON.
- **Sin retroceso (backtracking) visual.** El DFS iterativo no anima el "regreso" por las aristas como lo haría una implementación recursiva; solo muestra el avance.
- **Un único nodo de inicio por recorrido.** No se admite BFS/DFS multi-origen.
- **El formato TXT no soporta pesos.** Las aristas importadas desde lista de adyacencia siempre se tratan como no ponderadas.

---

## Mejoras Futuras

### UX/Interfaz

- [ ] **Diseño Responsivo:** el layout se adapta a pantallas chicas.
- [ ] **Caja de Texto para entrada directa:** un `textarea` donde se pueda pegar texto plano y se genere el grafo sin necesidad de crear y subir un archivo.
- [ ] **Editor Visual:** permitir agregar o eliminar nodos y aristas directamente desde el canvas con clics.

### Funcionalidad

- [ ] **Animación de retroceso en DFS.**
- [ ] **Velocidad con valor personalizado.**

### Calidad

- [ ] **Favicon.**

---

## Dependencias

- **Cytoscape.js (v3.29.2)**: Renderización, layouts e interacción del grafo. Cargada vía CDN (`cdnjs.cloudflare.com`). No requiere instalación ni bundler.
