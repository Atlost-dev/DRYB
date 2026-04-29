/**
 * src/core/algorithms.js
 * LÓGICA DE RECORRIDO DE GRAFOS
 * Genera el arreglo de pasos (steps) para visualizar BFS y DFS.
 */

// Importamos funciones auxiliares que irán en utils.js
import { buildAdjacency, getNodeLabel } from "./utils.js";

/**
 * Genera un array de pasos que documentan la ejecución del algoritmo seleccionado[cite: 4].
 *
 * @param {String} algo - Algoritmo: "bfs" (cola) o "dfs" (pila)[cite: 4]
 * @param {String} startId - ID del nodo inicial[cite: 4]
 * @param {Object} graphData - Los datos actuales del grafo (nodos y aristas)
 * @returns {Array} Array de pasos documentando la ejecución[cite: 4]
 */
export function generateSteps(algo, startId, graphData) {
  // Construimos la lista de adyacencia usando la utilidad[cite: 4]
  const adj = buildAdjacency(graphData);
  const steps = [];

  if (algo === "bfs") {
    const visited = new Set();
    const inQueue = new Set([startId]);
    const queue = [{ id: startId, from: null, fromEdge: null }];
    const treeEdges = new Set();

    steps.push({
      description: `Iniciando BFS desde ${getNodeLabel(startId, graphData)}`,
      current: null,
      pending: new Set(inQueue),
      visited: new Set(visited),
      treeEdges: new Set(treeEdges),
      activeEdge: null,
    });

    while (queue.length > 0) {
      const { id, from, fromEdge } = queue.shift();
      inQueue.delete(id);
      visited.add(id);
      if (fromEdge) treeEdges.add(fromEdge);

      for (const { node: nb, edge } of adj[id]) {
        if (!visited.has(nb) && !inQueue.has(nb)) {
          inQueue.add(nb);
          queue.push({ id: nb, from: id, fromEdge: edge });
        }
      }

      steps.push({
        description: `Visitando ${getNodeLabel(id, graphData)}${from ? ` ← ${getNodeLabel(from, graphData)}` : ""}`,
        current: id,
        pending: new Set(inQueue),
        visited: new Set(visited),
        treeEdges: new Set(treeEdges),
        activeEdge: fromEdge,
      });
    }
  } else {
    // DFS iterativo[cite: 4]
    const visited = new Set();
    const stack = [{ id: startId, from: null, fromEdge: null }];
    const inStack = new Set([startId]);
    const treeEdges = new Set();

    steps.push({
      description: `Iniciando DFS desde ${getNodeLabel(startId, graphData)}`,
      current: null,
      pending: new Set(inStack),
      visited: new Set(visited),
      treeEdges: new Set(treeEdges),
      activeEdge: null,
    });

    while (stack.length > 0) {
      const { id, from, fromEdge } = stack.pop();
      if (visited.has(id)) continue;

      inStack.delete(id);
      visited.add(id);
      if (fromEdge) treeEdges.add(fromEdge);

      // Empujar vecinos no visitados en reversa para que el primer vecino se visite primero[cite: 4]
      const neighbors = [...adj[id]].reverse();
      for (const { node: nb, edge } of neighbors) {
        if (!visited.has(nb)) {
          inStack.add(nb);
          stack.push({ id: nb, from: id, fromEdge: edge });
        }
      }

      steps.push({
        description: `Visitando ${getNodeLabel(id, graphData)}${from ? ` ← ${getNodeLabel(from, graphData)}` : ""}`,
        current: id,
        pending: new Set(
          stack.filter((s) => !visited.has(s.id)).map((s) => s.id),
        ),
        visited: new Set(visited),
        treeEdges: new Set(treeEdges),
        activeEdge: fromEdge,
      });
    }
  }

  // Paso final: indicar completitud del recorrido[cite: 4]
  const last = steps[steps.length - 1];
  const totalVisited = last.visited.size;
  const totalNodes = graphData.nodes.length;
  const unreachable = totalNodes - totalVisited;

  steps.push({
    description:
      unreachable > 0
        ? `Completado · ${totalVisited} visitados, ${unreachable} inaccesible${unreachable > 1 ? "s" : ""}`
        : `Completado · ${totalVisited} nodo${totalVisited !== 1 ? "s" : ""} visitado${totalVisited !== 1 ? "s" : ""}`,
    current: null,
    pending: new Set(),
    visited: new Set(last.visited),
    treeEdges: new Set(last.treeEdges),
    activeEdge: null,
    done: true,
  });

  return steps;
}
