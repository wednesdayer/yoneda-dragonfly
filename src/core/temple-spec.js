// Descrição declarativa do templo. É a única fonte de verdade sobre a geometria:
// o motor de física e o renderizador são construídos a partir dela.
// A mente da libélula NUNCA lê este arquivo — ela só recebe sinais sensoriais.

import { norm } from './math.js';
import { splitRectWithHoles, rectToBox } from './wall-builder.js';

export const INTERIOR = { x: [-16, 16], y: [0, 12], z: [-10, 10] };
const T = 0.8; // espessura das paredes

// Sol ao sul (+z), um pouco a leste, 40° de elevação.
export const SUN_DIR = norm([0.3, 0.64, 0.7]);

const WALLS = [
  {
    name: 'parede-norte', axis: 'z', at: INTERIOR.z[0] - T / 2,
    rect: { u0: INTERIOR.x[0] - T, u1: INTERIOR.x[1] + T, v0: 0, v1: INTERIOR.y[1] },
    holes: [
      { id: 'janela-norte-aberta', kind: 'open', u0: -13, u1: -9.5, v0: 7, v1: 9.5 },
      { id: 'vidro-norte', kind: 'glass', u0: 8, u1: 11.5, v0: 7, v1: 9.5 },
    ],
  },
  {
    name: 'parede-sul', axis: 'z', at: INTERIOR.z[1] + T / 2,
    rect: { u0: INTERIOR.x[0] - T, u1: INTERIOR.x[1] + T, v0: 0, v1: INTERIOR.y[1] },
    holes: [
      { id: 'vitral-sul-oeste', kind: 'glass', u0: -12, u1: -8.5, v0: 5, v1: 9 },
      { id: 'vitral-sul-centro', kind: 'glass', u0: -1.75, u1: 1.75, v0: 5, v1: 9 },
      { id: 'vitral-sul-leste', kind: 'glass', u0: 8.5, u1: 12, v0: 5, v1: 9 },
    ],
  },
  {
    name: 'parede-leste', axis: 'x', at: INTERIOR.x[1] + T / 2,
    rect: { u0: INTERIOR.z[0], u1: INTERIOR.z[1], v0: 0, v1: INTERIOR.y[1] },
    holes: [{ id: 'vidro-leste', kind: 'glass', u0: -2, u1: 2, v0: 6, v1: 9 }],
  },
  {
    name: 'parede-oeste', axis: 'x', at: INTERIOR.x[0] - T / 2,
    rect: { u0: INTERIOR.z[0], u1: INTERIOR.z[1], v0: 0, v1: INTERIOR.y[1] },
    holes: [],
  },
  {
    name: 'teto', axis: 'y', at: INTERIOR.y[1] + T / 2,
    rect: { u0: INTERIOR.x[0] - T, u1: INTERIOR.x[1] + T, v0: INTERIOR.z[0] - T, v1: INTERIOR.z[1] + T },
    holes: [{ id: 'oculo-teto', kind: 'open', u0: -5, u1: -3, v0: -1, v1: 1 }],
  },
];

const COLUMN_X = [-12, -6, 0, 6, 12];
const COLUMN_Z = [-5.5, 5.5];

function columns() {
  return COLUMN_X.flatMap((x) =>
    COLUMN_Z.map((z) => ({ kind: 'column', center: [x, INTERIOR.y[1] / 2, z], radius: 0.7, height: INTERIOR.y[1] })),
  );
}

const OBSTACLES = [
  { kind: 'altar', center: [11, 0.6, 0], half: [1.5, 0.6, 1] },
  { kind: 'iconostase', center: [-7.5, 2.5, 0], half: [0.25, 2.5, 3] },
  { kind: 'bloco', center: [3, 0.5, -7.5], half: [1, 0.5, 0.75] },
  { kind: 'bloco', center: [-13, 0.75, 7], half: [0.75, 0.75, 0.75] },
  { kind: 'lustre', center: [2, 8.5, 0], half: [1.2, 0.15, 1.2] },
];

function holeCenter(w, h) {
  const box = rectToBox(w.axis, w.at, T, h);
  const outward = w.axis === 'y' ? [0, 1, 0] : w.axis === 'z' ? [0, 0, Math.sign(w.at)] : [Math.sign(w.at), 0, 0];
  return { center: box.center, half: box.half, outward, area: (h.u1 - h.u0) * (h.v1 - h.v0) };
}

/** Constrói a especificação completa (sólidos, vidros, aberturas, luz). */
export function buildTempleSpec() {
  const solids = [];
  const glass = [];
  const openings = [];

  for (const w of WALLS) {
    for (const r of splitRectWithHoles(w.rect, w.holes)) {
      solids.push({ kind: w.axis === 'y' ? 'teto' : 'parede', shape: 'box', ...rectToBox(w.axis, w.at, T, r), wall: w.name });
    }
    for (const h of w.holes) {
      const info = holeCenter(w, h);
      if (h.kind === 'glass') {
        const box = rectToBox(w.axis, w.at, 0.2, h);
        glass.push({ id: h.id, kind: 'vidro', shape: 'box', ...box, outward: info.outward });
      } else {
        openings.push({ id: h.id, ...info });
      }
    }
  }

  // Piso interno + terreno externo (uma única laje).
  solids.push({ kind: 'piso', shape: 'box', center: [0, -0.5, 0], half: [80, 0.5, 80] });
  for (const c of columns()) solids.push({ ...c, shape: 'cylinder' });
  for (const o of OBSTACLES) solids.push({ ...o, shape: 'box' });

  return { interior: INTERIOR, wallThickness: T, sunDir: SUN_DIR, solids, glass, openings };
}

/** Critério físico de fuga: o corpo está fora do volume do templo. */
export function isOutsideTemple(p, margin = 0.6) {
  return (
    p[0] < INTERIOR.x[0] - T - margin ||
    p[0] > INTERIOR.x[1] + T + margin ||
    p[2] < INTERIOR.z[0] - T - margin ||
    p[2] > INTERIOR.z[1] + T + margin ||
    p[1] > INTERIOR.y[1] + T + margin
  );
}

export const ALBEDO = { parede: 0.55, teto: 0.5, piso: 0.45, column: 0.62, altar: 0.7, iconostase: 0.4, bloco: 0.5, lustre: 0.3 };
