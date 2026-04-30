/**
 * src/io/import.js
 * MÓDULO DE IMPORTACIÓN DE GRAFOS
 * Parsea archivos de grafo en tres formatos y los convierte a la
 * estructura estándar interna: { nodes: [...], edges: [...] }[cite: 1]
 */

// Límites defensivos contra archivos maliciosos o accidentalmente enormes.
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_NODES = 5000;
const MAX_EDGES = 20000;

/**
 * Lee un archivo y lo parsea según su extensión[cite: 1].
 * @param {File} file
 * @returns {Promise<{nodes: Array, edges: Array}>}
 */
export function parseGraphFile(file) {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_FILE_BYTES) {
      reject(
        new Error(
          `Archivo demasiado grande (${(file.size / 1024 / 1024).toFixed(1)} MB). Máximo permitido: 5 MB.`,
        ),
      );
      return;
    }

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

// IDs reservados que rompen el uso de objetos como diccionarios (ej. en buildAdjacency).
const FORBIDDEN_IDS = new Set(["__proto__", "constructor", "prototype"]);

function _safeId(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "object") return null;
  const str = String(value).trim();
  if (!str) return null;
  if (FORBIDDEN_IDS.has(str)) {
    throw new Error(`ID de nodo no permitido: "${str}".`);
  }
  return str;
}

function _safeLabel(value, fallback) {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "object") return fallback;
  return String(value);
}

function _safeWeight(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) {
    throw new Error(`Peso de arista inválido: "${value}".`);
  }
  return n;
}

function _parseJSON(text) {
  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("El archivo no contiene JSON válido.");
  }

  if (raw.elements) {
    const nodes = (raw.elements.nodes || []).map((el) => {
      const id = _safeId(el?.data?.id);
      if (!id) throw new Error("Nodo sin ID válido en elements.nodes.");
      return { id, label: _safeLabel(el.data.label, id) };
    });
    const edges = (raw.elements.edges || []).map((el, i) => {
      const source = _safeId(el?.data?.source);
      const target = _safeId(el?.data?.target);
      if (!source || !target)
        throw new Error(`Arista ${i}: source o target inválidos.`);
      return {
        id: _safeId(el.data.id) || `e_${source}_${target}_${i}`,
        source,
        target,
        weight: _safeWeight(el.data.weight),
      };
    });
    return { nodes, edges };
  }

  if (Array.isArray(raw.nodes) && Array.isArray(raw.edges)) {
    const nodes = raw.nodes.map((n) => {
      const id = _safeId(n?.id);
      if (!id) throw new Error("Nodo sin ID válido en nodes.");
      return { id, label: _safeLabel(n.label, id) };
    });
    const edges = raw.edges.map((e, i) => {
      const source = _safeId(e?.source);
      const target = _safeId(e?.target);
      if (!source || !target)
        throw new Error(`Arista ${i}: source o target inválidos.`);
      return {
        id: _safeId(e.id) || `e_${source}_${target}`,
        source,
        target,
        weight: _safeWeight(e.weight),
      };
    });
    return { nodes, edges };
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
    let id = node.id != null ? _safeId(node.id) : null;
    if (!id) id = `n_auto_${autoNodeId++}`;

    if (!seenNodeIds.has(id)) {
      seenNodeIds.add(id);
      const rawLabel = node.nombre ?? node.label ?? node.name ?? id;
      nodes.push({ id, label: _safeLabel(rawLabel, id) });
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

    let weight;
    try {
      weight = _safeWeight(weightStr);
    } catch {
      throw new Error(
        `Línea ${i + 1 + (hasHeader ? 1 : 0)}: peso inválido "${weightStr}".`,
      );
    }

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

  if (data.nodes.length > MAX_NODES)
    throw new Error(
      `Demasiados nodos (${data.nodes.length}). Máximo permitido: ${MAX_NODES}.`,
    );
  if (data.edges.length > MAX_EDGES)
    throw new Error(
      `Demasiadas aristas (${data.edges.length}). Máximo permitido: ${MAX_EDGES}.`,
    );

  const ids = new Set();
  for (const n of data.nodes) {
    if (typeof n.id !== "string" || !n.id)
      throw new Error("Nodo con ID inválido (no es cadena).");
    if (ids.has(n.id)) throw new Error(`ID de nodo duplicado: "${n.id}".`);
    ids.add(n.id);
  }

  for (const e of data.edges) {
    if (!ids.has(e.source))
      throw new Error(`Arista con nodo origen desconocido: "${e.source}"`);
    if (!ids.has(e.target))
      throw new Error(`Arista con nodo destino desconocido: "${e.target}"`);
  }
}
