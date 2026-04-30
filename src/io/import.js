/**
 * src/io/import.js
 * MÓDULO DE IMPORTACIÓN DE GRAFOS
 * Parsea archivos de grafo en tres formatos y los convierte a la
 * estructura estándar interna: { nodes: [...], edges: [...] }[cite: 1]
 */

/**
 * Lee un archivo y lo parsea según su extensión[cite: 1].
 * @param {File} file
 * @returns {Promise<{nodes: Array, edges: Array}>}
 */
export function parseGraphFile(file) {
  return new Promise((resolve, reject) => {
    const ext = file.name.split(".").pop().toLowerCase();
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target.result;
        let data;

        if (ext === "json") {
          data = _parseJSON(text);
        } else if (ext === "csv") {
          data = _parseCSV(text);
        } else if (ext === "txt") {
          data = _parseAdjList(text);
        } else {
          throw new Error(
            `Formato ".${ext}" no soportado. Usa .json, .csv o .txt`,
          );
        }

        _validateGraph(data);
        resolve(data);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error("Error al leer el archivo."));
    reader.readAsText(file);
  });
}

// ── FUNCIONES PRIVADAS (No exportadas) ──────────────────────────────────────

function _parseJSON(text) {
  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("El archivo no contiene JSON válido.");
  }

  if (raw.elements) {
    const nodes = (raw.elements.nodes || []).map((el) => ({
      id: el.data.id,
      label: el.data.label || el.data.id,
    }));
    const edges = (raw.elements.edges || []).map((el, i) => ({
      id: el.data.id || `e_${el.data.source}_${el.data.target}_${i}`,
      source: el.data.source,
      target: el.data.target,
      weight: el.data.weight ?? null,
    }));
    return { nodes, edges };
  }

  if (Array.isArray(raw.nodes) && Array.isArray(raw.edges)) {
    return {
      nodes: raw.nodes.map((n) => ({ id: n.id, label: n.label || n.id })),
      edges: raw.edges.map((e) => ({
        id: e.id || `e_${e.source}_${e.target}`,
        source: e.source,
        target: e.target,
        weight: e.weight ?? null,
      })),
    };
  }

  if (_looksLikeTreeJSON(raw)) {
    return _parseTreeJSON(raw);
  }

  throw new Error(
    'Formato JSON no reconocido. Se esperan campos "nodes" y "edges", "elements", o estructura de árbol (id/nombre/hijos).',
  );
}

function _looksLikeTreeJSON(raw) {
  if (Array.isArray(raw)) return raw.some(_isTreeNodeLike);
  return _isTreeNodeLike(raw);
}

function _isTreeNodeLike(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return "hijos" in value || "children" in value || "id" in value;
}

function _parseTreeJSON(raw) {
  const roots = Array.isArray(raw) ? raw : [raw];
  const nodes = [];
  const edges = [];
  const seenNodeIds = new Set();
  let autoNodeId = 0;
  let autoEdgeId = 0;

  function ensureNodeId(node) {
    let id = node.id != null ? String(node.id) : "";
    if (!id) id = `n_auto_${autoNodeId++}`;

    if (!seenNodeIds.has(id)) {
      seenNodeIds.add(id);
      const label = node.nombre ?? node.label ?? node.name ?? id;
      nodes.push({ id, label: String(label) });
    }

    return id;
  }

  function walk(node, parentId = null) {
    if (!node || typeof node !== "object" || Array.isArray(node)) return;

    const nodeId = ensureNodeId(node);
    if (parentId != null) {
      edges.push({
        id: `e_tree_${autoEdgeId++}`,
        source: parentId,
        target: nodeId,
        weight: null,
      });
    }

    const children = Array.isArray(node.hijos)
      ? node.hijos
      : Array.isArray(node.children)
        ? node.children
        : [];

    children.forEach((child) => walk(child, nodeId));
  }

  roots.forEach((root) => walk(root));

  return { nodes, edges };
}

function _parseCSV(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length === 0) throw new Error("El archivo CSV está vacío.");

  const sep = lines[0].includes(";") ? ";" : ",";
  const firstCols = lines[0].split(sep).map((c) => c.trim().toLowerCase());
  const HEADER_WORDS = [
    "source",
    "target",
    "from",
    "to",
    "origen",
    "destino",
    "weight",
    "peso",
  ];
  const hasHeader = firstCols.some((c) => HEADER_WORDS.includes(c));
  const dataLines = hasHeader ? lines.slice(1) : lines;

  if (dataLines.length === 0) throw new Error("El CSV no contiene aristas.");

  const nodeMap = new Map();
  const edges = [];

  function getOrCreate(label) {
    if (!nodeMap.has(label)) nodeMap.set(label, `n${nodeMap.size}`);
    return nodeMap.get(label);
  }

  dataLines.forEach((line, i) => {
    const cols = line.split(sep).map((c) => c.trim());
    if (cols.length < 2)
      throw new Error(
        `Línea ${i + 1 + (hasHeader ? 1 : 0)}: se necesitan al menos dos columnas (source, target).`,
      );

    const [srcLabel, tgtLabel, weightStr] = cols;
    if (!srcLabel || !tgtLabel)
      throw new Error(
        `Línea ${i + 1 + (hasHeader ? 1 : 0)}: source o target vacíos.`,
      );

    const weight =
      weightStr !== undefined && weightStr !== ""
        ? parseFloat(weightStr)
        : null;
    if (weightStr && weightStr !== "" && isNaN(weight))
      throw new Error(
        `Línea ${i + 1 + (hasHeader ? 1 : 0)}: peso inválido "${weightStr}".`,
      );

    edges.push({
      id: `e${i}`,
      source: getOrCreate(srcLabel),
      target: getOrCreate(tgtLabel),
      weight,
    });
  });

  const nodes = Array.from(nodeMap.entries()).map(([label, id]) => ({
    id,
    label,
  }));
  return { nodes, edges };
}

function _parseAdjList(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("#"));
  if (lines.length === 0) throw new Error("El archivo TXT está vacío.");

  const colonStyle = lines.some((l) => l.includes(":"));
  const nodeMap = new Map();
  const edgeSet = new Set();
  const edges = [];

  function getOrCreate(label) {
    const key = label.trim();
    if (!key) return null;
    if (!nodeMap.has(key)) nodeMap.set(key, `n${nodeMap.size}`);
    return nodeMap.get(key);
  }

  lines.forEach((line, i) => {
    let nodeLabel, neighborLabels;

    if (colonStyle) {
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1)
        throw new Error(
          `Línea ${i + 1}: falta ":" — usa el formato "Nodo: Vecino1, Vecino2".`,
        );
      nodeLabel = line.slice(0, colonIdx).trim();
      const rest = line.slice(colonIdx + 1).trim();
      neighborLabels = rest
        ? rest
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
    } else {
      const parts = line.split(/\s+/);
      nodeLabel = parts[0];
      neighborLabels = parts.slice(1);
    }

    if (!nodeLabel) throw new Error(`Línea ${i + 1}: nombre de nodo vacío.`);
    const nodeId = getOrCreate(nodeLabel);

    neighborLabels.forEach((nb) => {
      const nbId = getOrCreate(nb);
      if (!nbId) return;
      const key = [nodeId, nbId].sort().join("|");
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push({
          id: `e${edges.length}`,
          source: nodeId,
          target: nbId,
          weight: null,
        });
      }
    });
  });

  if (edges.length === 0)
    throw new Error("No se encontraron aristas en el archivo TXT.");
  const nodes = Array.from(nodeMap.entries()).map(([label, id]) => ({
    id,
    label,
  }));
  return { nodes, edges };
}

function _validateGraph(data) {
  if (!data.nodes || data.nodes.length < 2)
    throw new Error("El grafo debe tener al menos 2 nodos.");
  if (!data.edges || data.edges.length < 1)
    throw new Error("El grafo debe tener al menos 1 arista.");

  const ids = new Set(data.nodes.map((n) => n.id));
  for (const e of data.edges) {
    if (!ids.has(e.source))
      throw new Error(`Arista con nodo origen desconocido: "${e.source}"`);
    if (!ids.has(e.target))
      throw new Error(`Arista con nodo destino desconocido: "${e.target}"`);
  }
}
