// js/control/tf.js
import { polyAdd, polyScale, polyTrim } from "../math/poly.js";

/**
 * Closed-loop transfer function with plant gain K and unity feedback:
 *   T(s) = (K G(s)) / (1 + K G(s)) = (K N(s)) / (D(s) + K N(s)).
 * @param {number[]} num - N(s) coefficients (descending powers).
 * @param {number[]} den - D(s) coefficients (descending powers).
 * @param {number} K
 * @returns {{num:number[], den:number[]}}
 */
export function tfClosedLoopPlantGain(num, den, K){
  const numCL = polyScale(num, K);
  const denCL = polyAdd(den, polyScale(num, K));
  return { num: polyTrim(numCL), den: polyTrim(denCL) };
}

/**
 * Characteristic polynomial for unity feedback with plant gain K:
 *   D(s) + K N(s) = 0
 * @param {number[]} num
 * @param {number[]} den
 * @param {number} K
 * @returns {number[]}
 */
export function characteristicPoly(num, den, K){
  return polyAdd(den, polyScale(num, K));
}
