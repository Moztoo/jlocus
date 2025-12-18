// js/control/rootlocus.js
import { cAbs, cSub } from "../math/complex.js";
import { polyAdd, polyScale, polyTrim } from "../math/poly.js";
import { polyRootsDurandKerner } from "./roots.js";

/**
 * Compute root locus branches by sweeping K in [0, Kmax].
 * Uses a greedy matching step-to-step to keep branches continuous.
 * @param {number[]} num - N(s)
 * @param {number[]} den - D(s)
 * @param {number} [Kmax=100]
 * @param {number} [nK=140]
 * @returns {{Ks:number[], branches:{re:number,im:number}[][]}}
 */
export function rootLocus(num, den, Kmax=100, nK=140){
  den = polyTrim(den);
  const n = den.length - 1;
  const Ks = [];
  const branches = []; // branches[b][k] = root

  for(let i=0;i<nK;i++){
    const Ki = Kmax * i/(nK - 1);
    Ks.push(Ki);

    const charPoly = polyAdd(den, polyScale(num, Ki));
    const roots = polyRootsDurandKerner(charPoly);

    if(i === 0){
      const sorted = roots.slice().sort((a,b)=>a.re - b.re);
      for(let r=0;r<sorted.length;r++) branches.push([sorted[r]]);
    }else{
      const prev = branches.map(b => b[b.length - 1]);
      const unused = roots.slice();

      for(let bi=0; bi<prev.length; bi++){
        let bestJ = 0, bestD = Infinity;
        for(let j=0;j<unused.length;j++){
          const d = cAbs(cSub(unused[j], prev[bi]));
          if(d < bestD){ bestD = d; bestJ = j; }
        }
        branches[bi].push(unused[bestJ]);
        unused.splice(bestJ, 1);
      }
    }
  }

  return {Ks, branches};
}
