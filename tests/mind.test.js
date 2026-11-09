import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { softmax, decide, utility } from '../src/mind/decision.js';
import { createLearner } from '../src/mind/learning.js';
import { createSpatialMemory } from '../src/mind/spatial-memory.js';
import { clusterBrightRays, createPerception } from '../src/mind/perception.js';
import { INNATE_WEIGHTS, MIND_PARAMS, FEATURES } from '../src/mind/config.js';
import { createRng, norm } from '../src/core/math.js';

const rays = (...list) => list.map(([dir, dist, lum]) => ({ dir: norm(dir), dist, lum, valid: true }));

function percept(rayList, extra = {}) {
  return {
    t: 0, dt: 0.1, range: 20,
    pose: { position: [0, 0, 0], forward: [1, 0, 0], up: [0, 1, 0], velocity: [0, 0, 0] },
    rays: rayList, openings: [], wind: [0, 0, 0], repulsion: [0, 0, 0],
    ...extra,
  };
}

describe('independência da mente', () => {
  it('módulos da mente só importam utilitários matemáticos do núcleo', () => {
    for (const f of readdirSync('src/mind')) {
      const src = readFileSync(`src/mind/${f}`, 'utf8');
      const imports = [...src.matchAll(/from '([^']+)'/g)].map((m) => m[1]);
      for (const imp of imports) expect(imp === '../core/math.js' || imp.startsWith('./')).toBe(true);
    }
  });
});

describe('decisão', () => {
  it('softmax normaliza e respeita a ordem', () => {
    const p = softmax([1, 2, 3], 0.5);
    expect(p.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 9);
    expect(p[2]).toBeGreaterThan(p[1]);
  });

  it('utilidade é a soma ponderada das características', () => {
    const f = Object.fromEntries(FEATURES.map((k) => [k, 1]));
    expect(utility(f, INNATE_WEIGHTS)).toBeCloseTo(Object.values(INNATE_WEIGHTS).reduce((a, b) => a + b, 0), 9);
  });

  it('evita a direção bloqueada e prefere a luminosa e livre', () => {
    const p = percept(rays([[1, 0, 0], 0.5, 0.2], [[-1, 0, 0], null, 1.2], [[0, 0, 1], 6, 0.2], [[0, 0, -1], 6, 0.2]));
    const counts = { blocked: 0, bright: 0 };
    const rng = createRng(3);
    for (let i = 0; i < 200; i++) {
      const res = decide({ percept: p, memory: null, weights: INNATE_WEIGHTS, heading: null, temperature: 0.3, rng });
      const d = res.alternatives[res.chosenIndex].dir;
      if (d[0] > 0.9) counts.blocked++;
      if (d[0] < -0.9) counts.bright++;
    }
    expect(counts.bright).toBeGreaterThan(counts.blocked);
    expect(counts.blocked).toBe(0);
  });
});

describe('aprendizado', () => {
  it('recompensa positiva reforça as características da escolha', () => {
    const L = createLearner(INNATE_WEIGHTS, MIND_PARAMS, true);
    const zero = Object.fromEntries(FEATURES.map((k) => [k, 0]));
    L.onDecision({ ...zero, corrente: 1 }, zero);
    L.reward(5);
    L.onDecision(zero, zero);
    expect(L.weights().corrente).toBeGreaterThan(INNATE_WEIGHTS.corrente);
  });

  it('desligado, os pesos não mudam', () => {
    const L = createLearner(INNATE_WEIGHTS, MIND_PARAMS, false);
    const zero = Object.fromEntries(FEATURES.map((k) => [k, 0]));
    L.onDecision({ ...zero, luz: 1 }, zero);
    L.reward(-5);
    L.onDecision(zero, zero);
    expect(L.weights()).toEqual(INNATE_WEIGHTS);
  });
});

describe('memória espacial', () => {
  it('marca livre ao longo do raio e ocupado no impacto', () => {
    const M = createSpatialMemory();
    for (let i = 0; i < 5; i++) M.integrateRays([0, 0, 0], rays([[1, 0, 0], 6, 0.3]), 20);
    expect(M.freeDistance([0, 0, 0], [1, 0, 0], 10)).toBeLessThan(7);
    expect(M.freeDistance([0, 0, 0], [-1, 0, 0], 10)).toBe(10);
  });

  it('funde fracassos próximos e penaliza a direção deles', () => {
    const M = createSpatialMemory();
    M.addFailure([5, 0, 0], [1, 0, 0], 1, 1);
    M.addFailure([5.5, 0, 0], [1, 0, 0], 1, 2);
    expect(M.failures()).toHaveLength(1);
    expect(M.failures()[0].count).toBe(2);
    expect(M.failureLoad([0, 0, 0], [1, 0, 0])).toBeGreaterThan(M.failureLoad([0, 0, 0], [-1, 0, 0]));
  });

  it('visitas novas são contadas uma vez por célula', () => {
    const M = createSpatialMemory();
    expect(M.markVisit([0.2, 0.2, 0.2])).toBe(1);
    expect(M.markVisit([0.4, 0.4, 0.4])).toBe(0);
    expect(M.stats().visitedCells).toBe(1);
  });
});

describe('percepção', () => {
  it('agrupa raios brilhantes e mede a fração sem retorno', () => {
    const blobs = clusterBrightRays(rays([[1, 0, 0], null, 1], [[1, 0.1, 0], null, 1], [[0, 0, 1], 3, 0.1]), 0.5);
    expect(blobs).toHaveLength(1);
    expect(blobs[0].depthFrac).toBe(1);
  });

  it('integra a velocidade para estimar a posição', () => {
    const P = createPerception();
    const base = { range: 20, proxRange: 1.5, rays: [], proximity: [], air: [0, 0, 0], forward: [1, 0, 0], up: [0, 1, 0], contacts: [] };
    P.process({ ...base, t: 0, velocity: [1, 0, 0] });
    const out = P.process({ ...base, t: 2, velocity: [1, 0, 0] });
    expect(out.pose.position[0]).toBeCloseTo(2, 9);
  });
});
