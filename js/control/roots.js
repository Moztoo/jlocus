// js/control/roots.js
import { c, cSub, cDiv, cAbs } from "../math/complex.js";
import { polyTrim, polyEval } from "../math/poly.js";

/**
 * Compute polynomial roots using Durand–Kerner method.
 * Practical for small/moderate orders; returns complex roots.
 * @param {number[]} p - Polynomial coefficients (descending powers).
 * @returns {{re:number,im:number}[]}
 */
export function polyRootsDurandKerner(p){
  p = polyTrim(p);
  const n = p.length - 1;
  if(n <= 0) return [];

  // Normalize to monic
  const a0 = p[0];
  const q = p.map(v => v / a0);

  // Seed points on a circle
  const R = 1 + Math.max(...q.slice(1).map(x => Math.abs(x)));
  let roots = [];
  for(let k=0;k<n;k++){
    const ang = 2*Math.PI*k/n;
    roots.push(c(R*Math.cos(ang), R*Math.sin(ang)));
  }

  const maxIt = 200;
  const eps = 1e-10;

  for(let it=0; it<maxIt; it++){
    let maxDelta = 0;
    const next = [];
    for(let i=0;i<n;i++){
      let denom = c(1,0);
      for(let j=0;j<n;j++){
        if(i === j) continue;
        denom = { re: denom.re*(roots[i].re - roots[j].re) - denom.im*(roots[i].im - roots[j].im),
                  im: denom.re*(roots[i].im - roots[j].im) + denom.im*(roots[i].re - roots[j].re) };
      }
      const f = polyEval(q, roots[i]);
      const delta = cDiv(f, denom);
      const zi = cSub(roots[i], delta);
      maxDelta = Math.max(maxDelta, cAbs(cSub(zi, roots[i])));
      next.push(zi);
    }
    roots = next;
    if(maxDelta < eps) break;
  }
  return roots;
}
