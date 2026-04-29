/**
 * src/ui/events.js
 * CONTROLADOR DE EVENTOS Y REPRODUCCIÓN
 * Conecta las interacciones del usuario con la lógica de la aplicación y el DOM.
 */

import { state } from "../state.js";
import { SPEED_MAP, SPEED_NAMES } from "../constants.js";
import { generateSteps } from "../core/algorithms.js";
import { applyStep, renderGraph } from "../graph/renderer.js";
import {
  els,
  updateButtons,
  renderStepUI,
  rebuildLog,
  resetUI,
  showError,
  clearError,
} from "./dom.js";

// Importamos la función global expuesta en import.js (asumiendo que sigue siendo un script regular en el HTML)[cite: 2, 4]
// Si import.js también lo pasas a ES Modules, puedes importarlo directamente aquí:
// import { parseGraphFile } from '../io/import.js';

// ── Control de Simulación ──

function renderCurrentStep() {
  renderStepUI(state.currentStep);
  applyStep(state.steps[state.currentStep]);
  updateButtons();
}

export function initTraversal() {
  const startId = els.startNodeSel.value;
  if (!startId || !state.graphData) return;
  state.steps = generateSteps(state.currentAlgo, startId, state.graphData);
  state.currentStep = 0;
  els.visitLog.innerHTML = "";
  els.doneBanner.style.display = "none";
  renderCurrentStep();
  rebuildLog();
}

export function resetTraversal() {
  stopPlay();
  state.steps = [];
  state.currentStep = -1;
  resetUI();

  if (state.cy) {
    state.cy.batch(() => {
      state.cy.nodes().forEach((n) => n.data("state", "unvisited"));
      state.cy.edges().forEach((e) => e.data("estate", "default"));
    });
  }
}

function advance() {
  if (state.currentStep < state.steps.length - 1) {
    state.currentStep++;
    renderCurrentStep();
    rebuildLog();
  }
  if (state.currentStep >= state.steps.length - 1) {
    stopPlay();
  }
}

function startPlay() {
  if (state.currentStep >= state.steps.length - 1) return;
  if (state.currentStep < 0) initTraversal();
  state.isPlaying = true;
  updateButtons();
  const delay = SPEED_MAP[els.speedSlider.value] || 750;
  state.playTimer = setInterval(advance, delay);
}

function stopPlay() {
  state.isPlaying = false;
  clearInterval(state.playTimer);
  state.playTimer = null;
  updateButtons();
}

// ── Registro de Event Listeners ──

export function setupEventListeners() {
  // Cambio de algoritmo[cite: 4]
  document.querySelectorAll(".algo-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (state.isPlaying) return;
      document
        .querySelectorAll(".algo-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.currentAlgo = btn.dataset.algo;
      resetTraversal();
    });
  });

  els.startNodeSel.addEventListener("change", () => {
    if (!state.isPlaying) resetTraversal();
  });

  els.speedSlider.addEventListener("input", () => {
    els.speedLabel.textContent = SPEED_NAMES[els.speedSlider.value];
    if (state.isPlaying) {
      stopPlay();
      startPlay();
    }
  });

  // Botones de reproducción[cite: 4]
  els.btnPlay.addEventListener("click", () => {
    state.isPlaying ? stopPlay() : startPlay();
  });

  els.btnStep.addEventListener("click", () => {
    state.currentStep < 0 ? initTraversal() : advance();
  });

  els.btnReset.addEventListener("click", resetTraversal);

  // Herramientas del Grafo[cite: 4]
  els.btnFit.addEventListener(
    "click",
    () => state.cy && state.cy.fit(undefined, 50),
  );

  els.btnLayout.addEventListener("click", () => {
    if (!state.cy) return;
    state.cy
      .layout({
        name: "cose",
        animate: true,
        animationDuration: 600,
        nodeRepulsion: 14000,
        idealEdgeLength: 150,
        padding: 80,
        randomize: true,
      })
      .run();
  });

  // Modal de Árbol[cite: 4]
  els.btnTree.addEventListener("click", () => {
    if (!state.cy) return;
    els.treeRootSelect.innerHTML = "";
    state.graphData.nodes.forEach((n) => {
      const opt = document.createElement("option");
      opt.value = n.id;
      opt.textContent = n.label;
      els.treeRootSelect.appendChild(opt);
    });
    if (els.startNodeSel.value)
      els.treeRootSelect.value = els.startNodeSel.value;
    els.treeModal.classList.add("open");
  });

  const closeTreeModal = () => els.treeModal.classList.remove("open");
  els.treeModalClose.addEventListener("click", closeTreeModal);
  els.treeModal.addEventListener("click", (e) => {
    if (e.target === els.treeModal) closeTreeModal();
  });

  els.btnApplyTree.addEventListener("click", () => {
    if (!state.cy) return;
    const root = els.treeRootSelect.value;
    state.cy
      .layout({
        name: "breadthfirst",
        directed: false,
        roots: `#${root}`,
        animate: true,
        animationDuration: 500,
        spacingFactor: 1.4,
        padding: 60,
      })
      .run();
    closeTreeModal();
  });

  // Manejo de Importación de Archivos (Drag & Drop y botón)[cite: 4]
  const handleFile = (file) => {
    if (!file) return;
    clearError();
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["json", "csv", "txt"].includes(ext)) {
      showError(
        `Tipo de archivo no soportado (.${ext}). Usa .json, .csv o .txt`,
      );
      if (els.fileInput) els.fileInput.value = "";
      return;
    }
    // Llama a parseGraphFile (de import.js)
    if (typeof window.parseGraphFile === "function") {
      window
        .parseGraphFile(file)
        .then((data) => {
          renderGraph(data); // resetTraversal ya se llama internamente al renderizar
        })
        .catch((err) => showError(err.message));
    } else {
      showError("El módulo de importación no está cargado.");
    }
    if (els.fileInput) els.fileInput.value = "";
  };

  els.btnImport.addEventListener("click", () => els.fileInput.click());
  els.fileInput.addEventListener("change", () =>
    handleFile(els.fileInput.files[0]),
  );

  const graphArea = document.querySelector(".graph-area");
  graphArea.addEventListener("dragover", (ev) => ev.preventDefault());
  graphArea.addEventListener("drop", (ev) => {
    ev.preventDefault();
    handleFile(ev.dataTransfer.files[0]);
  });
}
