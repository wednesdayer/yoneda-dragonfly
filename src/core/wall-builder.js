// Decompõe um retângulo com furos (aberturas/vidros) em retângulos sólidos.
// Usado para construir paredes e teto a partir de uma descrição declarativa.

const EPS = 1e-6;

function subtractIntervals(lo, hi, cuts) {
  const sorted = [...cuts].sort((a, b) => a[0] - b[0]);
  const out = [];
  let cur = lo;
  for (const [a, b] of sorted) {
    if (b <= cur + EPS) continue;
    if (a > cur + EPS) out.push([cur, Math.min(a, hi)]);
    cur = Math.max(cur, b);
    if (cur >= hi - EPS) break;
  }
  if (cur < hi - EPS) out.push([cur, hi]);
  return out.filter(([a, b]) => b - a > EPS);
}

/**
 * @param {{u0:number,u1:number,v0:number,v1:number}} rect
 * @param {{u0:number,u1:number,v0:number,v1:number}[]} holes
 * @returns {{u0:number,u1:number,v0:number,v1:number}[]} retângulos sólidos sem sobreposição
 */
export function splitRectWithHoles(rect, holes) {
  const clipped = holes
    .map((h) => ({
      u0: Math.max(h.u0, rect.u0),
      u1: Math.min(h.u1, rect.u1),
      v0: Math.max(h.v0, rect.v0),
      v1: Math.min(h.v1, rect.v1),
    }))
    .filter((h) => h.u1 - h.u0 > EPS && h.v1 - h.v0 > EPS);

  const breaks = [...new Set([rect.u0, rect.u1, ...clipped.flatMap((h) => [h.u0, h.u1])])].sort(
    (a, b) => a - b,
  );

  const strips = [];
  for (let i = 0; i < breaks.length - 1; i++) {
    const ua = breaks[i];
    const ub = breaks[i + 1];
    if (ub - ua <= EPS) continue;
    const mid = (ua + ub) / 2;
    const cuts = clipped.filter((h) => h.u0 < mid && h.u1 > mid).map((h) => [h.v0, h.v1]);
    strips.push({ ua, ub, segs: subtractIntervals(rect.v0, rect.v1, cuts) });
  }

  // Funde faixas vizinhas com os mesmos segmentos (menos corpos físicos).
  const merged = [];
  for (const s of strips) {
    const last = merged[merged.length - 1];
    const same =
      last &&
      Math.abs(last.ub - s.ua) < EPS &&
      last.segs.length === s.segs.length &&
      last.segs.every((g, k) => Math.abs(g[0] - s.segs[k][0]) < EPS && Math.abs(g[1] - s.segs[k][1]) < EPS);
    if (same) merged[merged.length - 1] = { ...last, ub: s.ub };
    else merged.push(s);
  }

  return merged.flatMap((s) => s.segs.map(([v0, v1]) => ({ u0: s.ua, u1: s.ub, v0, v1 })));
}

/**
 * Converte um retângulo (u,v) de uma parede em uma caixa 3D {center, half}.
 * axis: 'x' => parede perpendicular a X (u=z, v=y); 'z' => perpendicular a Z (u=x, v=y);
 * 'y' => laje horizontal (u=x, v=z).
 */
export function rectToBox(axis, at, thickness, r) {
  const cu = (r.u0 + r.u1) / 2;
  const cv = (r.v0 + r.v1) / 2;
  const hu = (r.u1 - r.u0) / 2;
  const hv = (r.v1 - r.v0) / 2;
  const ht = thickness / 2;
  if (axis === 'z') return { center: [cu, cv, at], half: [hu, hv, ht] };
  if (axis === 'x') return { center: [at, cv, cu], half: [ht, hv, hu] };
  return { center: [cu, at, cv], half: [hu, ht, hv] };
}
