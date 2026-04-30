/**
 * src/ui/dom.js
 * MANIPULACIÓN DEL DOM
 * Contiene referencias a los elementos HTML y funciones para actualizar la interfaz.
 */

import { state } from "../state.js";
import { getNodeLabel, pad2 } from "../core/utils.js";

// ── Referencias a elementos del DOM ──
export const els = {
  startNodeSel: document.getElementById("start-node"),
  btnPlay: document.getElementById("btn-play"),
  btnStep: document.getElementById("btn-step"),
  btnReset: document.getElementById("btn-reset"),
  btnFit: document.getElementById("btn-fit"),
  btnLayout: document.getElementById("btn-layout"),
  btnImport: document.getElementById("btn-import"),
  fileInput: document.getElementById("file-input"),
  speedSlider: document.getElementById("speed"),
  speedLabel: document.getElementById("speed-label"),
  stepBigNum: document.getElementById("step-big-num"),
  stepBigDen: document.getElementById("step-big-den"),
  stepDesc: document.getElementById("step-desc"),
  progressBar: document.getElementById("progress-bar"),
  queueTitle: document.getElementById("queue-title"),
  queueChips: document.getElementById("queue-chips"),
  visitLog: document.getElementById("visit-log"),
  doneBanner: document.getElementById("done-banner"),
  errorBox: document.getElementById("error-box"),
  treeModal: document.getElementById("tree-modal"),
  treeRootSelect: document.getElementById("tree-root-select"),
  btnTree: document.getElementById("btn-tree"),
  btnApplyTree: document.getElementById("btn-apply-tree"),
  treeModalClose: document.getElementById("tree-modal-close"),
};

// ── Funciones de actualización de UI ──

export function updateButtons() {
  const notStarted = state.steps.length === 0;
  const atEnd = !notStarted && state.currentStep >= state.steps.length - 1;
  const atStart = notStarted || state.currentStep <= 0;

  els.btnStep.disabled = atEnd || notStarted || state.isPlaying;
  els.btnReset.disabled = atStart && !state.isPlaying;

  if (state.isPlaying) {
    els.btnPlay.textContent = "⏸ Pausar";
    els.btnPlay.disabled = false;
  } else if (atEnd) {
    els.btnPlay.textContent = "▶ Iniciar";
    els.btnPlay.disabled = true;
  } else {
    els.btnPlay.textContent =
      state.currentStep > 0 ? "▶ Continuar" : "▶ Iniciar";
    els.btnPlay.disabled = false;
  }
}

function renderProgress(current, total) {
  els.progressBar.innerHTML = "";
  if (total <= 0) return;
  for (let i = 0; i < total; i++) {
    const t = document.createElement("div");
    t.className = "progress-tick" + (i < current ? " filled" : "");
    els.progressBar.appendChild(t);
  }
}

export function renderStepUI(idx) {
  if (!state.steps.length) return;
  const step = state.steps[idx];
  const total = state.steps.length - 1;

  els.stepBigNum.textContent = pad2(idx);
  els.stepBigDen.textContent = `/ ${pad2(total)}`;
  els.stepDesc.textContent = step.description;
  renderProgress(idx, total);

  // Actualizar chips de la cola/pila[cite: 4]
  els.queueTitle.textContent =
    state.currentAlgo === "bfs" ? "Cola (BFS)" : "Pila (DFS)";
  els.queueChips.innerHTML = "";

  if (step.pending.size === 0) {
    els.queueChips.innerHTML = '<span class="chip-empty">vacía</span>';
  } else {
    step.pending.forEach((id) => {
      const chip = document.createElement("span");
      chip.className = "chip chip-pending";
      chip.textContent = getNodeLabel(id, state.graphData);
      els.queueChips.appendChild(chip);
    });
  }

  els.doneBanner.style.display = step.done ? "block" : "none";
}

export function rebuildLog() {
  const visited = [];
  for (let i = 1; i < state.steps.length; i++) {
    const step = state.steps[i];
    if (step.done) continue;
    const node = getNodeLabel(step.current, state.graphData);
    let from = null;
    if (step.activeEdge) {
      const e = state.graphData.edges.find((x) => x.id === step.activeEdge);
      if (e) {
        from = getNodeLabel(
          e.target === step.current ? e.source : e.target,
          state.graphData,
        );
      }
    }
    visited.push({ node, from, isCurrent: i === state.currentStep });
  }

  els.visitLog.innerHTML = "";
  if (visited.length === 0) {
    els.visitLog.innerHTML =
      '<li class="log-empty">Aún no se ha iniciado el recorrido.</li>';
    return;
  }

  visited.forEach((v, idx) => {
    const li = document.createElement("li");
    if (v.isCurrent) li.classList.add("log-current");

    const numSpan = document.createElement("span");
    numSpan.className = "log-num";
    numSpan.textContent = pad2(idx + 1);

    const labelSpan = document.createElement("span");
    if (v.from && v.from !== v.node) {
      labelSpan.appendChild(document.createTextNode(`${v.node} `));

      const arrowSpan = document.createElement("span");
      arrowSpan.className = "log-arrow";
      arrowSpan.textContent = "←";
      labelSpan.appendChild(arrowSpan);

      labelSpan.appendChild(document.createTextNode(` ${v.from}`));
    } else {
      labelSpan.textContent = v.node;
    }

    li.appendChild(numSpan);
    li.appendChild(labelSpan);
    els.visitLog.appendChild(li);
  });

  const cur = els.visitLog.querySelector(".log-current");
  if (cur) cur.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

export function resetUI() {
  els.doneBanner.style.display = "none";
  els.stepBigNum.textContent = "—";
  els.stepBigDen.textContent = "/ —";
  els.stepDesc.innerHTML =
    "Configura el algoritmo y pulsa <strong>Iniciar</strong>";
  els.progressBar.innerHTML = "";
  els.queueChips.innerHTML = '<span class="chip-empty">vacía</span>';
  els.visitLog.innerHTML =
    '<li class="log-empty">Aún no se ha iniciado el recorrido.</li>';
  updateButtons();
}

export function populateStartNode(data) {
  els.startNodeSel.innerHTML = "";
  data.nodes.forEach((n) => {
    const opt = document.createElement("option");
    opt.value = n.id;
    opt.textContent = n.label;
    els.startNodeSel.appendChild(opt);
  });
}

export function showError(msg) {
  els.errorBox.textContent = msg;
  els.errorBox.classList.add("visible");
}

export function clearError() {
  els.errorBox.classList.remove("visible");
}
