// js/control/ss.js
import { polyTrim } from "../math/poly.js";

/**
 * Convert a transfer function to controllable canonical state-space.
 * Supports proper TFs (direct term allowed).
 *
 * den: [1, a1, ..., an] (normalized inside)
 * num: [b0, b1, ..., bm] (padded)
 *
 * @param {number[]} num - Numerator coefficients (descending powers).
 * @param {number[]} den - Denominator coefficients (descending powers).
 * @returns {{A:number[][], B:number[], C:number[], D:number}}
 */
export function tfToStateSpace(num, den){
  den = polyTrim(den);
  num = polyTrim(num);

  const n = den.length - 1;
  if(n <= 0) throw new Error("Denominator order must be >= 1.");

  // Normalize so den[0] = 1
  const d0 = den[0];
  den = den.map(v => v / d0);
  num = num.map(v => v / d0);

  // Pad numerator to length n+1
  const numPad = Array(n+1).fill(0);
  for(let i=0;i<num.length;i++){
    numPad[(n+1 - num.length) + i] = num[i];
  }

  // Direct term D and strictly proper remainder
  const D = numPad[0];
  const b = numPad.map((v,i) => v - D*den[i]);

  // Companion A
  const A = Array.from({length:n}, () => Array(n).fill(0));
  for(let i=0;i<n-1;i++) A[i][i+1] = 1;
  for(let j=0;j<n;j++) A[n-1][j] = -den[j+1];

  // B
  const B = Array(n).fill(0); B[n-1] = 1;

  // C corresponds to b[1..n]
  const C = Array(n).fill(0);
  for(let j=0;j<n;j++) C[j] = b[j+1];

  return {A,B,C,D};
}
