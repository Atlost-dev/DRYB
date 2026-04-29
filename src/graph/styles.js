/**
 * src/graph/styles.js
 * ESTILOS DE CYTOSCAPE
 * Define la apariencia visual de los nodos y aristas en sus diferentes estados[cite: 4].
 */

export const cyStyles = [
  {
    selector: "node",
    style: {
      shape: "ellipse",
      "background-color": "#a78bfa",
      label: "data(label)",
      color: "#0a0a0a",
      "font-size": "12px",
      "font-weight": "700",
      "font-family": "Raleway, system-ui, sans-serif",
      "text-valign": "center",
      "text-halign": "center",
      width: 44,
      height: 44,
      "border-width": 0,
      "transition-property": "background-color, width, height",
      "transition-duration": "0.25s",
    },
  },
  {
    selector: 'node[state="current"]',
    style: { "background-color": "#10b981", color: "#0a0a0a" },
  },
  {
    selector: 'node[state="pending"]',
    style: { "background-color": "#f59e0b", color: "#0a0a0a" },
  },
  {
    selector: 'node[state="visited"]',
    style: { "background-color": "#6b7280", color: "#ffffff" },
  },
  {
    selector: "edge",
    style: {
      width: 1.5,
      "line-color": "#2a2a2a",
      label: "data(label)",
      color: "#a8a8a8",
      "font-size": "10px",
      "font-family": "Raleway, system-ui, sans-serif",
      "font-weight": "500",
      "text-background-color": "#0a0a0a",
      "text-background-opacity": 1,
      "text-background-padding": "3px",
      "curve-style": "bezier",
      "transition-property": "line-color, width",
      "transition-duration": "0.25s",
    },
  },
  {
    selector: 'edge[estate="tree"]',
    style: { "line-color": "#6b7280", width: 2, "line-style": "solid" },
  },
  {
    selector: 'edge[estate="active"]',
    style: { "line-color": "#10b981", width: 2.5 },
  },
];
