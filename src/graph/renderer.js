/**
 * src/graph/renderer.js
 * RENDERIZADOR DEL GRAFO
 * Maneja el ciclo de vida de la instancia de Cytoscape.js y la actualización visual.
 */

import { state } from "../state.js";
import { cyStyles } from "./styles.js";
import { populateStartNode } from "../ui/dom.js";
import { resetTraversal } from "../ui/events.js";

/**
 * Crea o recrea la instancia de Cytoscape con los datos del grafo[cite: 4].
 * @param {Object} data - Datos del grafo (nodes y edges)[cite: 4]
 */
export function renderGraph(data) {
  // Guardamos los datos en el estado global
  state.graphData = data;

  // Destruimos la instancia anterior si existe para evitar fugas de memoria[cite: 4]
  if (state.cy) {
    state.cy.destroy();
    state.cy = null;
  }

  // Preparamos los elementos con su estado inicial[cite: 4]
  const elements = [];
  data.nodes.forEach((n) => {
    elements.push({ data: { id: n.id, label: n.label, state: "unvisited" } });
  });
  data.edges.forEach((e) => {
    elements.push({
      data: {
        id: e.id,
        source: e.source,
        target: e.target,
        weight: e.weight,
        label: e.weight != null ? String(e.weight) : "",
        estate: "default",
      },
    });
  });

  // Mostramos el contenedor ocultando el "empty state"[cite: 4]
  document.getElementById("empty-state").style.display = "none";
  document.getElementById("cy").style.display = "block";
  document.getElementById("toolbar").style.display = "flex";

  // Inicializamos Cytoscape guardándolo en el estado global[cite: 4]
  state.cy = window.cytoscape({
    container: document.getElementById("cy"),
    elements,
    userZoomingEnabled: false, // El zoom manual lo manejaremos con Ctrl+Wheel[cite: 4]
    style: cyStyles,
    layout: {
      name: "cose",
      animate: true,
      animationDuration: 600,
      nodeRepulsion: 14000,
      nodeOverlap: 40,
      idealEdgeLength: 150,
      edgeElasticity: 100,
      gravity: 30,
      numIter: 1000,
      coolingFactor: 0.95,
      minTemp: 1.0,
      padding: 80,
      randomize: true,
    },
  });

  // Efecto hover: atenuar los nodos que no son vecinos[cite: 4]
  state.cy.on("mouseover", "node", (e) => {
    const node = e.target;
    state.cy
      .elements()
      .not(node.neighborhood().add(node))
      .style("opacity", 0.2);
  });
  state.cy.on("mouseout", "node", () =>
    state.cy.elements().style("opacity", 1),
  );

  // Actualizamos la interfaz
  populateStartNode(data);
  resetTraversal();
}

/**
 * Actualiza los estilos visuales de Cytoscape según el estado del paso actual[cite: 4].
 * @param {Object} step - Objeto paso con estados e información[cite: 4]
 */
export function applyStep(step) {
  if (!state.cy) return;

  // cy.batch optimiza el rendimiento agrupando los cambios del DOM[cite: 4]
  state.cy.batch(() => {
    state.cy.nodes().forEach((node) => {
      const id = node.id();
      if (id === step.current) {
        node.data("state", "current");
      } else if (step.visited.has(id)) {
        node.data("state", "visited");
      } else if (step.pending.has(id)) {
        node.data("state", "pending");
      } else {
        node.data("state", "unvisited");
      }
    });

    state.cy.edges().forEach((edge) => {
      const id = edge.id();
      if (step.treeEdges.has(id)) {
        edge.data("estate", "tree");
      } else if (id === step.activeEdge) {
        edge.data("estate", "active");
      } else {
        edge.data("estate", "default");
      }
    });
  });
}
