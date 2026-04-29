/**
 * src/constants.js
 * DATOS ESTÁTICOS Y CONFIGURACIÓN
 */

// Mapeo de velocidades: nivel -> milisegundos entre pasos[cite: 4]
export const SPEED_MAP = { 1: 1500, 2: 750, 3: 280 };
export const SPEED_NAMES = { 1: "Lenta", 2: "Media", 3: "Rápida" };

/**
 * Árbol de 9 nodos sin pesos — ideal para apreciar la diferencia entre
 * BFS y DFS[cite: 4].
 */
export const DEFAULT_GRAPH = {
  nodes: [
    { id: "n0", label: "A" },
    { id: "n1", label: "B" },
    { id: "n2", label: "C" },
    { id: "n3", label: "D" },
    { id: "n4", label: "E" },
    { id: "n5", label: "F" },
    { id: "n6", label: "G" },
    { id: "n7", label: "H" },
    { id: "n8", label: "I" },
  ],
  edges: [
    { id: "e0", source: "n0", target: "n1" },
    { id: "e1", source: "n0", target: "n2" },
    { id: "e2", source: "n0", target: "n3" },
    { id: "e3", source: "n1", target: "n4" },
    { id: "e4", source: "n1", target: "n5" },
    { id: "e5", source: "n2", target: "n6" },
    { id: "e6", source: "n3", target: "n7" },
    { id: "e7", source: "n3", target: "n8" },
  ],
};
