/**
 * src/main.js
 * PUNTO DE ENTRADA PRINCIPAL
 * Inicialización de la aplicación conectando la interfaz, el estado global y el renderizador del grafo.
 */

// 1. Importaciones de módulos
import { DEFAULT_GRAPH } from "./constants.js";
import { renderGraph } from "./graph/renderer.js";
import { setupEventListeners } from "./ui/events.js";
import { updateButtons } from "./ui/dom.js";

document.addEventListener("DOMContentLoaded", () => {
  // 2. Inicializar los event listeners de la interfaz
  // (Esto registrará los clics en botones, el modal, el drag & drop, etc.)
  setupEventListeners();

  // 3. Configurar el estado inicial de los botones (habilitar/deshabilitar)
  updateButtons();

  // 4. Renderizar el grafo predeterminado al cargar la aplicación
  // Internamente, renderGraph() actualizará el estado y reseteará el recorrido
  renderGraph(DEFAULT_GRAPH);

  // 5. Configurar el comportamiento inicial aislado (ej. ocultar el hint de zoom)
  const cyEl = document.getElementById("cy");
  const zoomHint = document.getElementById("zoom-hint");

  if (cyEl && zoomHint) {
    cyEl.addEventListener(
      "wheel",
      (e) => {
        if (e.ctrlKey || e.metaKey) {
          zoomHint.classList.add("hidden");
        }
      },
      { passive: true },
    );
  }
});
