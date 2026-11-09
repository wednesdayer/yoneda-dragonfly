// B. MEMÓRIA — mapa espacial construído progressivamente no referencial da própria libélula.
// Grade 3D de ocupação probabilística (log-odds), visitas, luz observada,
// marcas de tentativas fracassadas e candidatos a saída.

import { add, scale, sub, len, norm, cross, angleBetween, clamp } from '../core/math.js';

const DIM = { x: 96, y: 40, z: 96 };
const ORIGIN = [-48, -16, -48]; // canto da grade, relativo ao ponto de partida
const CELL = 1;
const L_FREE = -0.35;
const L_OCC = 0.9;
const L_TOUCH = 2.5;
const L_MIN = -4;
const L_MAX = 4;
const CANDIDATE_MERGE = 4;
const FAILURE_MERGE = 2;

export function createSpatialMemory() {
  const n = DIM.x * DIM.y * DIM.z;
  const logOdds = new Float32Array(n);
  const visits = new Uint16Array(n);
  const light = new Float32Array(n);
  let failures = [];
  let candidates = [];
  let visitedCells = 0;
  let knownCells = 0;

  const cellOf = (p) => [
    Math.floor((p[0] - ORIGIN[0]) / CELL),
    Math.floor((p[1] - ORIGIN[1]) / CELL),
    Math.floor((p[2] - ORIGIN[2]) / CELL),
  ];
  const inside = (c) => c[0] >= 0 && c[1] >= 0 && c[2] >= 0 && c[0] < DIM.x && c[1] < DIM.y && c[2] < DIM.z;
  const idx = (c) => (c[1] * DIM.z + c[2]) * DIM.x + c[0];
  const sameCell = (a, b) => a && b && a[0] === b[0] && a[1] === b[1] && a[2] === b[2];

  function bump(c, delta) {
    if (!inside(c)) return;
    const i = idx(c);
    const before = logOdds[i];
    logOdds[i] = clamp(before + delta, L_MIN, L_MAX);
    if (Math.abs(before) < 0.5 && Math.abs(logOdds[i]) >= 0.5) knownCells++;
  }

  /** Percorre células ao longo de um raio (amostragem a meio passo). */
  function walk(from, dir, maxD, fn) {
    const step = CELL * 0.5;
    let last = null;
    for (let d = 0; d <= maxD; d += step) {
      const c = cellOf(add(from, scale(dir, d)));
      if (sameCell(c, last)) continue;
      last = c;
      if (!inside(c) || fn(c, d) === false) return;
    }
  }

  /** Atualiza ocupação: livre ao longo do raio, ocupado no ponto atingido. */
  function integrateRays(pos, rays, range) {
    for (const r of rays) {
      const reach = r.dist === null ? range : r.dist;
      const endCell = r.dist === null ? null : cellOf(add(pos, scale(r.dir, r.dist + 0.05)));
      walk(pos, r.dir, reach - 0.3, (c) => {
        if (sameCell(c, endCell)) return false;
        bump(c, L_FREE);
        return true;
      });
      if (endCell && inside(endCell)) {
        bump(endCell, L_OCC);
        const i = idx(endCell);
        light[i] = Math.max(light[i] * 0.9, r.lum);
      }
    }
  }

  function markVisit(pos) {
    const c = cellOf(pos);
    if (!inside(c)) return 0;
    const i = idx(c);
    const fresh = visits[i] === 0;
    if (visits[i] < 65535) visits[i]++;
    if (fresh) visitedCells++;
    return fresh ? 1 : 0;
  }

  /** Evidência mecânica (colisão) é muito mais forte que a visual. */
  function markContact(pos, normal) {
    bump(cellOf(sub(pos, scale(normal, 0.6))), L_TOUCH);
  }

  function addFailure(pos, dir, lum, t) {
    const near = failures.find((f) => len(sub(f.pos, pos)) < FAILURE_MERGE);
    failures = near
      ? failures.map((f) => (f === near ? { ...f, count: f.count + 1, t } : f))
      : [...failures, { pos, dir, lum, t, count: 1 }];
  }

  /**
   * Procura, ao longo de um raio sem retorno, o ponto em que ele atravessa uma superfície
   * já mapeada (células livres no eixo, ocupadas ao redor) — a "moldura" da abertura.
   */
  function apertureAlong(pos, dir, maxD) {
    const ref = Math.abs(dir[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
    const u = norm(cross(dir, ref));
    const v = cross(dir, u);
    const offsets = [1.3, 2.2].flatMap((k) => [scale(u, k), scale(u, -k), scale(v, k), scale(v, -k)]);
    for (let d = 1.5; d <= maxD; d += 0.5) {
      const p = add(pos, scale(dir, d));
      if (occProb(cellOf(p)) > 0.55) return null; // o próprio eixo está bloqueado no mapa
      const framed = offsets.filter((o) => occProb(cellOf(add(p, o))) > 0.7).length;
      if (framed >= 2) return d;
    }
    return null;
  }

  function updateCandidates(pos, openings, t) {
    for (const o of openings) {
      const d = apertureAlong(pos, o.dir, Math.min(o.distEstimate * 1.6 + 2, 30));
      if (d === null) continue;
      const anchor = add(pos, scale(o.dir, d + 0.3));
      const near = candidates.find((c) => len(sub(c.pos, anchor)) < CANDIDATE_MERGE);
      if (near) {
        const k = 1 / (near.seen + 1);
        candidates = candidates.map((c) =>
          c === near
            ? { ...c, pos: add(scale(c.pos, 1 - k), scale(anchor, k)), lum: Math.max(c.lum * 0.98, o.lum), seen: Math.min(c.seen + 1, 30), lastSeen: t }
            : c,
        );
      } else {
        candidates = [...candidates, { id: candidates.length + 1, pos: anchor, lum: o.lum, seen: 1, failures: 0, lastSeen: t }];
      }
    }
  }

  function recordCandidateFailure(anchor) {
    const near = candidates.find((c) => len(sub(c.pos, anchor)) < CANDIDATE_MERGE * 1.5);
    if (near) candidates = candidates.map((c) => (c === near ? { ...c, failures: c.failures + 1 } : c));
  }

  const occProb = (c) => (inside(c) ? 1 / (1 + Math.exp(-logOdds[idx(c)])) : 0.5);
  const isKnown = (c) => inside(c) && Math.abs(logOdds[idx(c)]) >= 0.5;

  /** Distância livre esperada ao longo de uma direção, segundo o mapa. */
  function freeDistance(pos, dir, maxD) {
    let free = maxD;
    walk(add(pos, scale(dir, 0.6)), dir, maxD, (c, d) => {
      if (occProb(c) > 0.62) {
        free = d + 0.6;
        return false;
      }
      return true;
    });
    return free;
  }

  /** Quão pouco explorada é a região nessa direção (curiosidade). */
  function novelty(pos, dir) {
    let score = 0;
    let count = 0;
    for (const d of [2, 4, 7]) {
      const c = cellOf(add(pos, scale(dir, d)));
      if (!inside(c)) continue;
      score += (1 / (1 + visits[idx(c)] * 0.5)) * (isKnown(c) ? 0.6 : 1);
      count++;
    }
    return count ? score / count : 0;
  }

  /** Quanto essa direção aponta para lugares onde já houve fracasso. */
  function failureLoad(pos, dir) {
    let load = 0;
    for (const f of failures) {
      const to = sub(f.pos, pos);
      const d = len(to);
      if (d < 0.3) {
        load += f.count;
        continue;
      }
      load += (f.count * Math.exp(-((angleBetween(to, dir) / 0.45) ** 2))) / (1 + d / 8);
    }
    for (const c of candidates) {
      if (!c.failures) continue;
      const to = sub(c.pos, pos);
      load += (c.failures * Math.exp(-((angleBetween(to, dir) / 0.4) ** 2))) / (1 + len(to) / 8);
    }
    return Math.min(load, 3);
  }

  /** Lembrança de candidatos a saída numa direção (permite escolher fora do campo de visão). */
  function rememberedOpening(pos, dir) {
    let best = null;
    for (const c of candidates) {
      const to = sub(c.pos, pos);
      const ang = angleBetween(to, dir);
      if (ang > 0.35) continue;
      const score = c.lum * Math.exp(-((ang / 0.25) ** 2));
      if (!best || score > best.score) best = { score, cand: c, dist: len(to) };
    }
    return best;
  }

  /** Fatia horizontal do mapa para o painel (agregada numa faixa de altura). */
  function slice(yCenter, band = 2) {
    const size = DIM.x * DIM.z;
    const out = {
      w: DIM.x, h: DIM.z, origin: ORIGIN, cell: CELL,
      occ: new Float32Array(size), vis: new Uint16Array(size), known: new Uint8Array(size), light: new Float32Array(size),
    };
    const cy = cellOf([0, yCenter, 0])[1];
    for (let y = Math.max(0, cy - band); y <= Math.min(DIM.y - 1, cy + band); y++) {
      for (let z = 0; z < DIM.z; z++) {
        for (let x = 0; x < DIM.x; x++) {
          const i = (y * DIM.z + z) * DIM.x + x;
          const j = z * DIM.x + x;
          const p = 1 / (1 + Math.exp(-logOdds[i]));
          if (p > out.occ[j]) out.occ[j] = p;
          if (Math.abs(logOdds[i]) >= 0.5) out.known[j] = 1;
          if (visits[i] > out.vis[j]) out.vis[j] = visits[i];
          if (light[i] > out.light[j]) out.light[j] = light[i];
        }
      }
    }
    return out;
  }

  /** Células com crença de ocupação alta (visualização 3D do mapa mental). */
  function occupiedCells(limit = 6000) {
    const pts = [];
    for (let i = 0; i < n && pts.length < limit; i++) {
      if (logOdds[i] > 1.2) {
        const x = i % DIM.x;
        const z = Math.floor(i / DIM.x) % DIM.z;
        const y = Math.floor(i / (DIM.x * DIM.z));
        pts.push([ORIGIN[0] + (x + 0.5) * CELL, ORIGIN[1] + (y + 0.5) * CELL, ORIGIN[2] + (z + 0.5) * CELL, logOdds[i]]);
      }
    }
    return pts;
  }

  return {
    integrateRays,
    markVisit,
    markContact,
    addFailure,
    updateCandidates,
    recordCandidateFailure,
    freeDistance,
    novelty,
    failureLoad,
    rememberedOpening,
    slice,
    occupiedCells,
    failures: () => failures,
    candidates: () => candidates,
    stats: () => ({ visitedCells, knownCells, failures: failures.length, candidates: candidates.length }),
  };
}
