// js/math/complex.js

/**
 * Create a complex number.
 * @param {number} re - Real part.
 * @param {number} [im=0] - Imaginary part.
 * @returns {{re:number, im:number}}
 */
export function c(re, im = 0){ return { re, im }; }

/**
 * Complex addition.
 * @param {{re:number,im:number}} a
 * @param {{re:number,im:number}} b
 * @returns {{re:number, im:number}}
 */
export function cAdd(a,b){ return c(a.re + b.re, a.im + b.im); }

/**
 * Complex subtraction.
 * @param {{re:number,im:number}} a
 * @param {{re:number,im:number}} b
 * @returns {{re:number, im:number}}
 */
export function cSub(a,b){ return c(a.re - b.re, a.im - b.im); }

/**
 * Complex multiplication.
 * @param {{re:number,im:number}} a
 * @param {{re:number,im:number}} b
 * @returns {{re:number, im:number}}
 */
export function cMul(a,b){ return c(a.re*b.re - a.im*b.im, a.re*b.im + a.im*b.re); }

/**
 * Complex division.
 * @param {{re:number,im:number}} a
 * @param {{re:number,im:number}} b
 * @returns {{re:number, im:number}}
 */
export function cDiv(a,b){
  const d = b.re*b.re + b.im*b.im;
  return c((a.re*b.re + a.im*b.im)/d, (a.im*b.re - a.re*b.im)/d);
}

/**
 * Complex magnitude.
 * @param {{re:number,im:number}} a
 * @returns {number}
 */
export function cAbs(a){ return Math.hypot(a.re, a.im); }

/**
 * Complex argument (angle) in radians.
 * @param {{re:number,im:number}} a
 * @returns {number}
 */
export function cArg(a){ return Math.atan2(a.im, a.re); }
