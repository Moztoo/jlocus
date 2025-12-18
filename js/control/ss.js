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

  // Pad numerator to length n+1 (b0..bn) aligned to descending powers.
  // Example (n=2): num=[1] => numPad=[0,0,1]  (b0=0,b1=0,b2=1)
  const numPad = Array(n+1).fill(0);
  for(let i=0;i<num.length;i++){
    numPad[(n+1 - num.length) + i] = num[i];
  }

  // Controllable canonical form (a.k.a. companion form)
  // den(s) = s^n + a1 s^{n-1} + ... + an
  // num(s) = b0 s^n + b1 s^{n-1} + ... + bn
  //
  // A has 1s on the superdiagonal and last row [-an, ..., -a2, -a1]
  // B = [0 ... 0 1]^T
  // D = b0
  // C = [bn - an*b0, b_{n-1} - a_{n-1}*b0, ..., b1 - a1*b0]

  const a = den.slice(1);          // [a1..an]
  const b = numPad;               // [b0..bn]
  const D = b[0];

  const A = Array.from({length:n}, () => Array(n).fill(0));
  for(let i=0;i<n-1;i++) A[i][i+1] = 1;
  for(let j=0;j<n;j++) A[n-1][j] = -a[n - 1 - j];

  const B = Array(n).fill(0);
  B[n-1] = 1;

  const C = Array(n).fill(0);
  for(let j=0;j<n;j++){
    // Map j=0..n-1 to (bn..b1) and (an..a1)
    const bj = b[n - j];
    const aj = a[n - 1 - j];
    C[j] = bj - aj*D;
  }

  return {A, B, C, D};
}
