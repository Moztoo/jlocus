// js/control/bode.js
import { c, cDiv, cAbs, cArg } from "../math/complex.js";
import { polyEval } from "../math/poly.js";

/**
 * Compute Bode magnitude (dB) and phase (deg) by evaluating H(jω).
 * Assumes σ = 0, i.e., s = jω.
 * @param {number[]} num - Numerator coefficients (descending powers).
 * @param {number[]} den - Denominator coefficients (descending powers).
 * @param {number} [wMin=1e-2]
 * @param {number} [wMax=1e2]
 * @param {number} [nPts=250]
 * @returns {{w:number[], magDb:number[], phaseDeg:number[]}}
 */
export function bode(num, den, wMin=1e-2, wMax=1e2, nPts=250){
  const w = [];
  const magDb = [];
  const phaseDeg = [];
  const logMin = Math.log10(wMin), logMax = Math.log10(wMax);

  for(let i=0;i<nPts;i++){
    const lw = logMin + (logMax - logMin) * i/(nPts - 1);
    const wi = Math.pow(10, lw);
    const s = c(0, wi); // jω

    const N = polyEval(num, s);
    const D = polyEval(den, s);
    const H = cDiv(N, D);

    const m = cAbs(H);
    const ph = cArg(H);
    w.push(wi);
    magDb.push(20*Math.log10(Math.max(m, 1e-16)));
    phaseDeg.push(ph * 180/Math.PI);
  }
  return {w, magDb, phaseDeg};
}
