// js/main.js
import { parseArrayLike } from "./math/poly.js";
import { tfClosedLoopPlantGain } from "./control/tf.js";
import { setStatus, renderLatex, renderBlockDiagram } from "./ui/render.js";
import { plotRootLocus, updateMovingPolesOnly, plotTimeResponse, plotBode, plotPlaceholder } from "./ui/plots.js";

/**
 * Wire UI events and orchestrate computations + plotting.
 * This file is intentionally "thin": math/control logic lives in modules.
 */

// DOM references
const elNum = document.getElementById("numIn");
const elDen = document.getElementById("denIn");
const elK = document.getElementById("kSlider");
const elKVal = document.getElementById("kVal");
const elStatus = document.getElementById("status");
const elLatex = document.getElementById("latexOut");
const elBlock = document.getElementById("blockDiagram");
const elInputType = document.getElementById("inputType");
const elTFinal = document.getElementById("tFinal");

const DIV_RLOC = "plotRloc";
const DIV_TIME = "plotTime";
const DIV_BODE = "plotBode";
const DIV_4 = "plot4";

let rafPending = false;

/**
 * Read and validate user inputs (num/den/K/tFinal).
 * @returns {{num:number[], den:number[], K:number, tFinal:number, inputKind:"step"|"impulse"|"ramp"}}
 */
function readInputs(){
  const num = parseArrayLike(elNum.value);
  const den = parseArrayLike(elDen.value);
  if(num.length === 0 || den.length === 0) throw new Error("num and den cannot be empty.");
  if(den.length < 2) throw new Error("Denominator must be at least first order.");

  const K = Number(elK.value);
  if(!Number.isFinite(K)) throw new Error("K must be a number.");

  const tFinal = Number(elTFinal.value);
  if(!Number.isFinite(tFinal) || tFinal <= 0) throw new Error("Final time must be a positive number.");

  const inputKind = elInputType.value;
  return { num, den, K, tFinal, inputKind };
}

/**
 * Full refresh: LaTeX + diagram + all plots.
 */
function updateAll(){
  try{
    const {num, den, K, tFinal, inputKind} = readInputs();

    renderLatex(elLatex, num, den, K);
    renderBlockDiagram(elBlock, K);

    const {num: numCL, den: denCL} = tfClosedLoopPlantGain(num, den, K);

    // Root locus uses open-loop num/den; moving poles uses current K
    plotRootLocus(DIV_RLOC, num, den, Math.max(1, Number(elK.max)), K);

    plotTimeResponse(DIV_TIME, numCL, denCL, inputKind, tFinal);
    plotBode(DIV_BODE, numCL, denCL);
    plotPlaceholder(DIV_4);

    setStatus(elStatus, "Updated ✔");
  }catch(err){
    setStatus(elStatus, err.message || String(err), true);
  }
}

/**
 * Update only the moving poles markers on the root locus plot (real-time drag).
 */
function updatePolesRealtime(){
  try{
    const {num, den, K} = readInputs();
    updateMovingPolesOnly(DIV_RLOC, num, den, K);
  }catch(_){
    // Quiet during drag; full update will surface errors.
  }
}

// Slider: live update (throttled) + value pill
elK.addEventListener("input", () => {
  elKVal.textContent = Number(elK.value).toFixed(1);

  if(rafPending) return;
  rafPending = true;
  requestAnimationFrame(() => {
    rafPending = false;
    updatePolesRealtime();
  });
});

// When user releases slider, update everything (time response & bode depend on K)
elK.addEventListener("change", updateAll);

// Buttons
document.getElementById("updateBtn").addEventListener("click", updateAll);
document.getElementById("resetBtn").addEventListener("click", () => {
  elNum.value = "[1]";
  elDen.value = "[1, 2, 1]";
  elK.value = "1";
  elKVal.textContent = "1.0";
  elInputType.value = "step";
  elTFinal.value = "10";
  updateAll();
});

// Initial render
plotPlaceholder(DIV_4);
setTimeout(updateAll, 30);
