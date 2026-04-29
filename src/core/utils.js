/**
 * src/core/utils.js
 * FUNCIONES AUXILIARES
 * Utilidades puras y genéricas para el manejo de datos del grafo y formateo de texto.
 */

/**
 * Construye una lista de adyacencia a partir de los nodos y aristas[cite: 4].
 * Retorna un objeto: { nodoId: [{node: nodoDestino, edge: aristaId}, ...], ... }[cite: 4]
 * El grafo se trata como no dirigido (ambas direcciones en cada arista)[cite: 4].
 *
 * @param {Object} data - Datos del grafo con nodes y edges[cite: 4]
 * @returns {Object} Lista de adyacencia[cite: 4]
 */
export function buildAdjacency(data) {
  const adj = {};
  data.nodes.forEach((n) => (adj[n.id] = []));
  data.edges.forEach((e) => {
    adj[e.source].push({ node: e.target, edge: e.id });
    adj[e.target].push({ node: e.source, edge: e.id });
  });
  return adj;
}

/**
 * Obtiene la etiqueta legible (ej: "A", "B") de un nodo a partir de su ID[cite: 4].
 * Modificada para recibir graphData como parámetro y no depender de variables globales.
 *
 * @param {String} id - ID interno del nodo[cite: 4]
 * @param {Object} graphData - Objeto con los datos actuales del grafo
 * @returns {String} Etiqueta del nodo o su ID si no existe[cite: 4]
 */
export function getNodeLabel(id, graphData) {
  if (!graphData) return id;
  const n = graphData.nodes.find((n) => n.id === id);
  return n ? n.label : id;
}

/**
 * Formatea un número agregando un cero a la izquierda si es de un solo dígito.
 * Se utiliza principalmente para la visualización de los pasos en la interfaz (ej. "01 / 14").
 *
 * @param {Number|String} n - El número a formatear
 * @returns {String} Número formateado a dos dígitos
 */
export function pad2(n) {
  return String(n).padStart(2, "0");
}
