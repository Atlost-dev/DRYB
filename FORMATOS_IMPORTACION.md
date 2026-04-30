# Formatos de importacion aceptados

Este proyecto permite importar grafos en archivos `.json`, `.csv` y `.txt`.

El resultado interno siempre se convierte a esta estructura:

```json
{
  "nodes": [{ "id": "n0", "label": "A" }],
  "edges": [{ "id": "e0", "source": "n0", "target": "n1", "weight": null }]
}
```

## 1) JSON

Se aceptan **3 variantes**.

### 1.1 Formato propio (`nodes` + `edges`)

```json
{
  "nodes": [
    { "id": "n0", "label": "A" },
    { "id": "n1", "label": "B" },
    { "id": "n2", "label": "C" }
  ],
  "edges": [
    { "id": "e0", "source": "n0", "target": "n1", "weight": 5 },
    { "id": "e1", "source": "n0", "target": "n2" }
  ]
}
```

Notas:

- `label` es opcional en nodos (si falta, se usa `id`).
- `id` en aristas es opcional (si falta, se genera).
- `weight` en aristas es opcional.

### 1.2 Formato Cytoscape (`elements.nodes` + `elements.edges`)

```json
{
  "elements": {
    "nodes": [
      { "data": { "id": "n0", "label": "A" } },
      { "data": { "id": "n1", "label": "B" } }
    ],
    "edges": [{ "data": { "source": "n0", "target": "n1", "weight": 3 } }]
  }
}
```

Notas:

- `data.id` en aristas puede faltar (se genera automáticamente).
- `data.label` en nodos puede faltar (se usa `id`).

### 1.3 Formato arbol (`id`/`nombre`/`hijos`)

Tambien se acepta arbol jerarquico (o bosque) y se transforma a nodos/aristas padre-hijo.

```json
{
  "id": 1,
  "nombre": "Raiz",
  "hijos": [
    {
      "id": 2,
      "nombre": "Nodo A",
      "hijos": [{ "id": 4, "nombre": "Nodo A1" }]
    },
    {
      "id": 3,
      "nombre": "Nodo B"
    }
  ]
}
```

Tambien funciona con `children` en lugar de `hijos`, y con arreglo de raices:

```json
[
  { "id": "r1", "nombre": "Raiz 1", "hijos": [] },
  { "id": "r2", "nombre": "Raiz 2", "children": [] }
]
```

Notas:

- Si falta `id`, se genera uno automatico.
- Para etiqueta se usa este orden: `nombre`, `label`, `name`, `id`.

## 2) CSV

Formato: lista de aristas por linea.

- Separador: `,` o `;`.
- Cabecera opcional (se detecta automaticamente).
- Columnas minimas: `source,target`.
- Tercera columna opcional: `weight`.

### 2.1 Ejemplo sin cabecera

```csv
A,B
A,C
B,D
```

### 2.2 Ejemplo con cabecera y peso

```csv
source,target,weight
A,B,5
A,C,3
B,D,2
```

Notas:

- En CSV, `A`, `B`, etc. se usan como etiquetas (`label`).
- Los `id` internos de nodos y aristas se generan automaticamente.

## 3) TXT (lista de adyacencia)

Se aceptan 2 estilos:

### 3.1 Estilo con dos puntos

```txt
A: B, C, D
B: E, F
C: G
```

### 3.2 Estilo por espacios

```txt
A B C D
B E F
C G
```

Notas:

- Lineas que empiezan con `#` se ignoran como comentarios.
- No se soportan pesos en `.txt`.
- Aristas duplicadas se eliminan automaticamente.

## Validaciones minimas

Tras parsear, el grafo debe cumplir:

- Al menos 2 nodos.
- Al menos 1 arista.
- Todas las aristas deben referenciar nodos existentes.

Si no cumple, se muestra un error de validacion.
