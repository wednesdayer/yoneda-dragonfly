// C. PROCESSAMENTO E TOMADA DE DECISÃO — gera alternativas de movimento, descreve cada uma
// por características (vindas da percepção atual e, se houver, da memória), atribui utilidade
// com os pesos internos e escolhe estocasticamente (softmax) sob informação incompleta.

import { FEATURES } from './config.js';
import { fibonacciSphere, angleBetween, dot, norm, sub, len } from '../core/math.js';

const BASE_DIRECTIONS = fibonacciSphere(48).filter((d) => Math.abs(d[1]) < 0.9);
const PERCEPT_CONE = (18 * Math.PI) / 180;
const MAX_CLEAR = 8;
const MIN_SAFE = 1.2;
const LUM_SCALE = 1.1;

/** O que a percepção atual diz sobre uma direção (ou null se ela está fora do campo de visão). */
function perceivedAlong(percept, dir) {
  let free = Infinity;
  let lum = 0;
  let escapes = 0;
  let n = 0;
  for (const r of percept.rays) {
    if (angleBetween(r.dir, dir) > PERCEPT_CONE) continue;
    n++;
    const d = r.dist === null ? percept.range : r.dist;
    if (d < free) free = d;
    if (r.lum > lum) lum = r.lum;
    if (r.dist === null) escapes++;
  }
  return n ? { free, lum, depth: escapes / n } : null;
}

/** Vetor de características de uma alternativa. */
export function describeAlternative(dir, ctx) {
  const { percept, memory, heading } = ctx;
  const pos = percept.pose.position;
  const seen = perceivedAlong(percept, dir);
  const recalled = memory ? memory.rememberedOpening(pos, dir) : null;

  let free;
  if (seen) free = seen.free;
  else if (memory) free = memory.freeDistance(pos, dir, MAX_CLEAR);
  else free = MAX_CLEAR * 0.35; // desconhecido e sem memória: incerteza

  const lum = seen ? seen.lum : recalled ? recalled.cand.lum * 0.85 : 0;
  const depth = seen ? seen.depth : recalled ? 0.8 : 0;
  const windMag = len(percept.wind);

  const f = {
    livre: Math.min(free, MAX_CLEAR) / MAX_CLEAR,
    luz: Math.min(lum / LUM_SCALE, 1.5),
    profundidade: depth,
    novidade: memory ? memory.novelty(pos, dir) : 0,
    fracasso: memory ? memory.failureLoad(pos, dir) : 0,
    corrente: windMag > 1e-6 ? dot(norm(percept.wind), dir) * Math.min(1, windMag / 0.25) : 0,
    persistencia: heading ? dot(heading, dir) : 0,
    vertical: Math.abs(dir[1]),
  };
  return { dir, f, free, source: seen ? 'percepção' : recalled ? 'memória' : memory ? 'mapa' : 'incerto', recalled };
}

export function utility(f, weights) {
  return FEATURES.reduce((s, k) => s + weights[k] * f[k], 0);
}

export function softmax(values, temperature) {
  const m = Math.max(...values);
  const ex = values.map((v) => Math.exp((v - m) / Math.max(temperature, 1e-3)));
  const z = ex.reduce((a, b) => a + b, 0);
  return ex.map((e) => e / z);
}

function sample(probs, rng) {
  let r = rng.next();
  for (let i = 0; i < probs.length; i++) {
    r -= probs[i];
    if (r <= 0) return i;
  }
  return probs.length - 1;
}

/** Direções candidatas: amostra esférica + direções a candidatos lembrados + alvo atual. */
function candidateDirections(ctx) {
  const pos = ctx.percept.pose.position;
  const extra = [];
  if (ctx.memory) for (const c of ctx.memory.candidates()) extra.push(norm(sub(c.pos, pos)));
  for (const o of ctx.percept.openings) extra.push(o.dir);
  if (ctx.attemptTarget) extra.push(norm(sub(ctx.attemptTarget, pos)));
  return [...BASE_DIRECTIONS, ...extra.filter((d) => len(d) > 0.5)];
}

/**
 * Avalia alternativas e escolhe uma.
 * @returns {{alternatives: object[], chosenIndex: number, expectedF: object}}
 */
export function decide(ctx) {
  const alternatives = candidateDirections(ctx).map((dir) => {
    const alt = describeAlternative(dir, ctx);
    const penalty = alt.free < MIN_SAFE ? 4 : 0; // restrição física: não voar contra o que se vê
    return { ...alt, u: utility(alt.f, ctx.weights) - penalty };
  });
  const probs = softmax(alternatives.map((a) => a.u), ctx.temperature);
  const withP = alternatives.map((a, i) => ({ ...a, p: probs[i] }));
  const chosenIndex = sample(probs, ctx.rng);
  const expectedF = Object.fromEntries(FEATURES.map((k) => [k, withP.reduce((s, a) => s + a.p * a.f[k], 0)]));
  return { alternatives: withP, chosenIndex, expectedF };
}

/** Explicação legível da escolha: maiores contribuições positivas e negativas. */
export function explain(alt, weights, labels) {
  const contrib = FEATURES.map((k) => ({ k, c: weights[k] * alt.f[k] })).sort((a, b) => b.c - a.c);
  const pos = contrib.filter((x) => x.c > 0.05).slice(0, 2).map((x) => labels[x.k]);
  const neg = contrib.filter((x) => x.c < -0.15).map((x) => labels[x.k]);
  const parts = [];
  if (pos.length) parts.push(`atraída por ${pos.join(' + ')}`);
  if (neg.length) parts.push(`apesar de ${neg.slice(-1)[0]}`);
  return parts.join(', ') || 'sem preferência clara';
}
