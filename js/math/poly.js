// js/math/poly.js
import { c, cAdd, cMul } from "./complex.js";

/**
 * Remove leading ~0 coefficients.
 * @param {number[]} p - Polynomial coefficients in descending powers.
 * @returns {number[]}
 */
export function polyTrim(p){
  let i = 0;
  while(i < p.length - 1 && Math.abs(p[i]) < 1e-14) i++;
  return p.slice(i);
}

/**
 * Scale a polynomial by k.
 * @param {number[]} p
 * @param {number} k
 * @returns {number[]}
 */
export function polyScale(p, k){ return p.map(v => v*k); }

/**
 * Add two polynomials (descending powers).
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number[]}
 */
export function polyAdd(a,b){
  a = a.slice(); b = b.slice();
  const n = Math.max(a.length, b.length);
  const r = Array(n).fill(0);
  for(let i=0;i<n;i++){
    const ia = a.length - n + i;
    const ib = b.length - n + i;
    r[i] = (ia>=0?a[ia]:0) + (ib>=0?b[ib]:0);
  }
  return polyTrim(r);
}

/**
 * Evaluate polynomial p(z) for complex z.
 * @param {number[]} p - Descending powers.
 * @param {{re:number,im:number}} z
 * @returns {{re:number,im:number}}
 */
export function polyEval(p, z){
  let acc = c(0,0);
  for(const coef of p){
    acc = cAdd(cMul(acc, z), c(coef, 0));
  }
  return acc;
}

/**
 * Convert polynomial coefficients to a LaTeX string in s.
 * @param {number[]} p
 * @returns {string}
 */
export function polyToLatex(p){
  p = polyTrim(p);
  const n = p.length - 1;
  const terms = [];
  for(let i=0;i<p.length;i++){
    const a = p[i];
    const pow = n - i;
    if(Math.abs(a) < 1e-14) continue;

    const sign = a < 0 ? "-" : "+";
    const abs = Math.abs(a);

    let coefStr = "";
    if(pow === 0) coefStr = abs.toString();
    else if(Math.abs(abs - 1) < 1e-14) coefStr = "";
    else coefStr = abs.toString();

    let varStr = "";
    if(pow === 0) varStr = "";
    else if(pow === 1) varStr = "s";
    else varStr = `s^{${pow}}`;

    const core = `${coefStr}${varStr}` || "0";
    terms.push({sign, core});
  }
  if(terms.length === 0) return "0";

  let out = (terms[0].sign === "-" ? "-" : "") + terms[0].core;
  for(let k=1;k<terms.length;k++){
    out += ` ${terms[k].sign} ${terms[k].core}`;
  }
  return out;
}

/**
 * Parse an array-like string: "[1,2,3]" or "1,2,3".
 * @param {string} s
 * @returns {number[]}
 * @throws {Error} if any coefficient is not a finite number.
 */
export function parseArrayLike(s){
  const t = s.trim();
  let body = t;
  if(t.startsWith("[") && t.endsWith("]")) body = t.slice(1,-1);
  if(body.trim() === "") return [];
  const parts = body.split(",").map(x => x.trim()).filter(Boolean);
  const arr = parts.map(x => Number(x));
  if(arr.some(v => !Number.isFinite(v))) throw new Error("Invalid coefficients.");
  return arr;
}
