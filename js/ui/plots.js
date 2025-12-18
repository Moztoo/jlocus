// js/ui/plots.js
import { parseArrayLike, polyAdd, polyScale, polyTrim } from "../math/poly.js";
import { polyRootsDurandKerner } from "../control/roots.js";
import { rootLocus } from "../control/rootlocus.js";
import { tfToStateSpace } from "../control/ss.js";
import { simulateSS } from "../control/sim.js";
import { bode } from "../control/bode.js";
import { tfClosedLoopPlantGain, characteristicPoly } from "../control/tf.js";

/** Internal: whether the static root locus plot is ready for incremental updates. */
let rlStaticReady = false;
/** Internal: Plotly trace index for the moving-poles markers. */
let movingPolesTraceIndex = -1;

/**
 * Plot the root locus, and add a live-updating marker set for poles at the current K.
 * Also biases the x-axis to show mostly the left half-plane (negative → near 0).
 * @param {string} divId
 * @param {number[]} num
 * @param {number[]} den
 * @param {number} Kmax
 * @param {number} currentK
 */
export function plotRootLocus(divId, num, den, Kmax, currentK){
  rlStaticReady = false;
  movingPolesTraceIndex = -1;

  const rl = rootLocus(num, den, Kmax, 160);
  const traces = [];

  // Branches
  for(const br of rl.branches){
    traces.push({
      x: br.map(z => z.re),
      y: br.map(z => z.im),
      mode: "lines",
      name: "branch",
      hoverinfo: "skip",
      line: {width: 2}
    });
  }

  // Open-loop poles and zeros (of G(s))
  const polesOL = polyRootsDurandKerner(den);
  const zerosOL = polyRootsDurandKerner(num);

  traces.push({
    x: polesOL.map(z=>z.re),
    y: polesOL.map(z=>z.im),
    mode: "markers",
    name: "poles (open-loop)",
    marker: {symbol:"x", size: 10}
  });

  traces.push({
    x: zerosOL.map(z=>z.re),
    y: zerosOL.map(z=>z.im),
    mode: "markers",
    name: "zeros (open-loop)",
    marker: {symbol:"circle-open", size: 10}
  });

  // Moving poles at current K (characteristic D + K N)
  const charNow = characteristicPoly(num, den, currentK);
  const polesNow = polyRootsDurandKerner(charNow);

  movingPolesTraceIndex = traces.length;
  traces.push({
    x: polesNow.map(z=>z.re),
    y: polesNow.map(z=>z.im),
    mode: "markers",
    name: "poles (current K)",
    marker: {size: 9}
  });

  // X-axis range biased to the left
  const allRe = polesOL.concat(zerosOL).map(z => z.re);
  const minRe = Math.min(...allRe, -1);
  const span = Math.max(1, Math.abs(minRe));
  const xmin = minRe - 0.15*span;
  const xmax = 0.05*span;

  const layout = {
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    margin: {l:45,r:10,t:10,b:40},
    xaxis: {
      title:"Re(s)",
      gridcolor:"rgba(30,42,58,.8)",
      zerolinecolor:"rgba(30,42,58,.9)",
      range: [xmin, xmax]
    },
    yaxis: {
      title:"Im(s)",
      gridcolor:"rgba(30,42,58,.8)",
      zerolinecolor:"rgba(30,42,58,.9)",
      scaleanchor:"x",
      scaleratio: 1
    },
    legend: {orientation:"h", y:-0.18, font:{size:11}},
  };

  return window.Plotly.newPlot(divId, traces, layout, {displayModeBar:false, responsive:true})
    .then(() => { rlStaticReady = true; });
}

/**
 * Incrementally update only the moving-poles markers on the root locus plot.
 * Call this on slider drag for real-time feedback.
 * @param {string} divId
 * @param {number[]} num
 * @param {number[]} den
 * @param {number} currentK
 */
export function updateMovingPolesOnly(divId, num, den, currentK){
  if(!rlStaticReady || movingPolesTraceIndex < 0) return;

  const charNow = characteristicPoly(num, den, currentK);
  const polesNow = polyRootsDurandKerner(charNow);

  window.Plotly.restyle(divId, {
    x: [polesNow.map(z=>z.re)],
    y: [polesNow.map(z=>z.im)]
  }, [movingPolesTraceIndex]);
}

/**
 * Plot the time response for the closed-loop transfer function.
 * Input types: impulse/step/ramp.
 * @param {string} divId
 * @param {number[]} numCL
 * @param {number[]} denCL
 * @param {"step"|"impulse"|"ramp"} inputKind
 * @param {number} tFinal
 */
export function plotTimeResponse(divId, numCL, denCL, inputKind, tFinal){
  const ss = tfToStateSpace(numCL, denCL);
  const tf = Math.max(0.2, Number(tFinal));
  const dt = Math.min(0.01, tf/3000);
  const sim = simulateSS(ss, inputKind, tf, dt);

  const trace = {
    x: sim.tArr,
    y: sim.yArr,
    mode: "lines",
    name: "y(t)",
    line: {width: 2}
  };
  const layout = {
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    margin: {l:45,r:10,t:10,b:40},
    xaxis: {title:"t (s)", gridcolor:"rgba(30,42,58,.8)"},
    yaxis: {title:"y(t)", gridcolor:"rgba(30,42,58,.8)"},
    showlegend: false
  };
  window.Plotly.newPlot(divId, [trace], layout, {displayModeBar:false, responsive:true});
}

/**
 * Plot a 2-panel Bode diagram (magnitude & phase) for a given transfer function.
 * @param {string} divId
 * @param {number[]} num
 * @param {number[]} den
 */
export function plotBode(divId, num, den){
  const bd = bode(num, den, 1e-2, 1e2, 260);

  const t1 = { x: bd.w, y: bd.magDb, mode:"lines", name:"|T(jω)| (dB)", line:{width:2}, xaxis:"x", yaxis:"y" };
  const t2 = { x: bd.w, y: bd.phaseDeg, mode:"lines", name:"∠T(jω) (deg)", line:{width:2}, xaxis:"x2", yaxis:"y2" };

  const layout = {
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    margin: {l:55,r:10,t:10,b:35},
    legend: {orientation:"h", y:-0.25, font:{size:11}},
    grid: {rows:2, columns:1, pattern:"independent", roworder:"top to bottom"},
    xaxis:  {type:"log", title:"ω (rad/s)", gridcolor:"rgba(30,42,58,.8)"},
    yaxis:  {title:"Magnitude (dB)", gridcolor:"rgba(30,42,58,.8)"},
    xaxis2: {type:"log", title:"ω (rad/s)", gridcolor:"rgba(30,42,58,.8)"},
    yaxis2: {title:"Phase (deg)", gridcolor:"rgba(30,42,58,.8)"}
  };

  window.Plotly.newPlot(divId, [t1,t2], layout, {displayModeBar:false, responsive:true});
}

/**
 * Plot a placeholder chart (Plot 4).
 * @param {string} divId
 */
export function plotPlaceholder(divId){
  const trace = { x:[0,1,2,3], y:[0,0,0,0], mode:"lines", hoverinfo:"skip" };
  const layout = {
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    margin: {l:45,r:10,t:10,b:40},
    xaxis: {gridcolor:"rgba(30,42,58,.8)"},
    yaxis: {gridcolor:"rgba(30,42,58,.8)"},
    annotations: [{
      text: "Placeholder (Plot 4)",
      x: 0.5, y: 0.5, xref:"paper", yref:"paper",
      showarrow:false,
      font:{size:14, color:"rgba(157,176,198,1)"}
    }],
    showlegend:false
  };
  window.Plotly.newPlot(divId, [trace], layout, {displayModeBar:false, responsive:true});
}
