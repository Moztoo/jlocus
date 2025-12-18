// js/control/sim.js

/**
 * Multiply matrix A by vector x.
 * @param {number[][]} A
 * @param {number[]} x
 * @returns {number[]}
 */
export function matVec(A, x){
  const y = Array(A.length).fill(0);
  for(let i=0;i<A.length;i++){
    let s=0;
    for(let j=0;j<x.length;j++) s += A[i][j]*x[j];
    y[i]=s;
  }
  return y;
}

/**
 * Vector addition.
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number[]}
 */
export function vecAdd(a,b){ return a.map((v,i)=>v + b[i]); }

/**
 * Scale a vector.
 * @param {number[]} a
 * @param {number} k
 * @returns {number[]}
 */
export function vecScale(a,k){ return a.map(v => v*k); }

/**
 * Dot product.
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number}
 */
export function dot(a,b){ return a.reduce((s,v,i)=>s + v*b[i], 0); }

/**
 * One Runge–Kutta 4 integrator step for x' = f(x,t).
 * @param {(x:number[], t:number)=>number[]} f
 * @param {number[]} x
 * @param {number} t
 * @param {number} h
 * @returns {number[]}
 */
export function rk4Step(f, x, t, h){
  const k1 = f(x, t);
  const k2 = f(vecAdd(x, vecScale(k1, h/2)), t + h/2);
  const k3 = f(vecAdd(x, vecScale(k2, h/2)), t + h/2);
  const k4 = f(vecAdd(x, vecScale(k3, h)), t + h);

  const incr = vecScale(
    vecAdd(vecAdd(k1, vecScale(k2,2)), vecAdd(vecScale(k3,2), k4)),
    h/6
  );
  return vecAdd(x, incr);
}

/**
 * Simulate a continuous-time state-space model with simple inputs.
 * Impulse is approximated via x(0+) = x(0-) + B (unit area).
 * @param {{A:number[][],B:number[],C:number[],D:number}} ss
 * @param {"step"|"impulse"|"ramp"} inputKind
 * @param {number} tFinal
 * @param {number} [dt=0.002]
 * @returns {{tArr:number[], yArr:number[]}}
 */
export function simulateSS(ss, inputKind, tFinal, dt=0.002){
  const {A,B,C,D} = ss;
  const n = A.length;
  let x = Array(n).fill(0);

  const tArr = [];
  const yArr = [];

  /** Input u(t). */
  function u(t){
    if(inputKind === "step") return 1;
    if(inputKind === "ramp") return t;
    if(inputKind === "impulse") return 0;
    return 1;
  }

  // Impulse approximation: x(0+) = x + B
  if(inputKind === "impulse"){
    x = vecAdd(x, B);
  }

  /** Dynamics function xdot = A x + B u(t). */
  const f = (x, t) => vecAdd(matVec(A, x), vecScale(B, u(t)));

  const steps = Math.max(2, Math.floor(tFinal / dt));
  for(let k=0;k<=steps;k++){
    const t = k * dt;
    const y = dot(C, x) + D * u(t);
    tArr.push(t);
    yArr.push(y);
    x = rk4Step(f, x, t, dt);
  }

  return {tArr, yArr};
}
