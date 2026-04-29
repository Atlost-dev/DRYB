/**
 * src/state.js
 * ESTADO GLOBAL DEL APLICATIVO
 *
 * Almacena variables que cambian durante el ciclo de vida de la app[cite: 4].
 * Al encapsularlas en un objeto 'state', permitimos que otros módulos
 * muten sus propiedades (ej. state.currentStep++).
 */

export const state = {
  cy: null, // Instancia de Cytoscape.js[cite: 4]
  graphData: null, // Datos del grafo actual (nodos y aristas)[cite: 4]
  steps: [], // Array con todos los pasos generados del algoritmo[cite: 4]
  currentStep: -1, // Índice del paso actual (-1: no iniciado)[cite: 4]
  playTimer: null, // ID del intervalo para reproducción automática[cite: 4]
  isPlaying: false, // Bandera de reproducción en progreso[cite: 4]
  currentAlgo: "bfs", // Algoritmo activo ("bfs" o "dfs")[cite: 4]
};
