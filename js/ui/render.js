// js/ui/render.js
import { polyToLatex } from "../math/poly.js";

/**
 * Update the status box (info or error).
 * @param {HTMLElement} elStatus
 * @param {string} msg
 * @param {boolean} [isErr=false]
 */
export function setStatus(elStatus, msg, isErr=false){
  elStatus.textContent = msg;
  elStatus.classList.toggle("err", !!isErr);
}

/**
 * Render transfer function math using KaTeX auto-render.
 * Model: plant gain K with unity feedback:
 *   G(s)=N/D,  T(s)=K N / (D + K N)
 * @param {HTMLElement} elLatex
 * @param {number[]} num
 * @param {number[]} den
 * @param {number} K
 */
export function renderLatex(elLatex, num, den, K){
  const N = polyToLatex(num);
  const D = polyToLatex(den);

  const latex = String.raw`
  \[
    G(s)=\frac{${N}}{${D}}
    \quad,\quad
    T(s)=\frac{K\,G(s)}{1+K\,G(s)}=\frac{K\left(${N}\right)}{${D} + K\left(${N}\right)}
  \]
  `;
  elLatex.innerHTML = latex;

  // KaTeX auto-render is loaded globally via CDN.
  window.renderMathInElement(elLatex, {
    delimiters: [
      {left: "\\[", right: "\\]", display: true},
      {left: "\\(", right: "\\)", display: false},
    ]
  });
}

/**
 * Render an SVG block diagram (K before G(s), unity feedback).
 * @param {HTMLElement} elBlock
 * @param {number} K
 */
export function renderBlockDiagram(elBlock, K){
  const svg = `
  <svg viewBox="0 0 820 210" width="100%" height="170" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
        <path d="M0,0 L10,3 L0,6 Z" fill="rgba(231,238,247,.9)"/>
      </marker>
    </defs>

    <rect x="0" y="0" width="820" height="210" rx="18" fill="rgba(255,255,255,.02)" stroke="rgba(30,42,58,1)"/>

    <text x="36" y="105" fill="rgba(231,238,247,.9)" font-size="14">r</text>
    <line x1="48" y1="100" x2="165" y2="100" stroke="rgba(231,238,247,.85)" stroke-width="2" marker-end="url(#arrow)"/>

    <circle cx="200" cy="100" r="22" fill="rgba(15,22,32,1)" stroke="rgba(30,42,58,1)" stroke-width="2"/>
    <text x="193" y="106" fill="rgba(231,238,247,.9)" font-size="18">Σ</text>
    <text x="190" y="78" fill="rgba(92,255,177,.9)" font-size="14">+</text>
    <text x="190" y="133" fill="rgba(255,107,107,.9)" font-size="14">−</text>

    <line x1="222" y1="100" x2="290" y2="100" stroke="rgba(231,238,247,.85)" stroke-width="2" marker-end="url(#arrow)"/>
    <rect x="300" y="70" width="120" height="60" rx="14" fill="rgba(12,18,26,1)" stroke="rgba(30,42,58,1)" stroke-width="2"/>
    <text x="360" y="107" fill="rgba(231,238,247,.9)" font-size="14" text-anchor="middle">K = ${Number(K).toFixed(2)}</text>

    <line x1="420" y1="100" x2="450" y2="100" stroke="rgba(231,238,247,.85)" stroke-width="2" marker-end="url(#arrow)"/>
    <rect x="460" y="70" width="160" height="60" rx="14" fill="rgba(12,18,26,1)" stroke="rgba(30,42,58,1)" stroke-width="2"/>
    <text x="540" y="107" fill="rgba(231,238,247,.9)" font-size="14" text-anchor="middle">G(s)</text>

    <line x1="620" y1="100" x2="720" y2="100" stroke="rgba(231,238,247,.85)" stroke-width="2" marker-end="url(#arrow)"/>
    <text x="735" y="105" fill="rgba(231,238,247,.9)" font-size="14">y</text>

    <line x1="680" y1="100" x2="680" y2="165" stroke="rgba(231,238,247,.55)" stroke-width="2"/>
    <line x1="680" y1="165" x2="222" y2="165" stroke="rgba(231,238,247,.55)" stroke-width="2"/>
    <line x1="222" y1="165" x2="222" y2="122" stroke="rgba(231,238,247,.55)" stroke-width="2" marker-end="url(#arrow)"/>

    <text x="455" y="182" fill="rgba(157,176,198,1)" font-size="12" text-anchor="middle">unity feedback</text>
  </svg>
  `;
  elBlock.innerHTML = svg;
}
