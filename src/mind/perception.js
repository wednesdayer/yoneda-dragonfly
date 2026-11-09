// A. PERCEPÇÃO — transforma o pacote sensorial bruto em representações úteis:
// obstáculos, superfícies, fontes de luz, aberturas candidatas e estimativa de pose.
// Funciona só com números vindos dos sensores; a mente desconhece a geometria real.

import { add, scale, norm, angleBetween } from '../core/math.js';

const BLOB_ANGLE = (22 * Math.PI) / 180;
const NEIGHBOR_ANGLE = (35 * Math.PI) / 180;

/** Agrupa raios brilhantes em "manchas de luz" por proximidade angular. */
export function clusterBrightRays(rays, threshold) {
  const bright = rays.filter((r) => r.valid && r.lum >= threshold);
  const blobs = [];
  for (const r of bright) {
    const blob = blobs.find((b) => angleBetween(b.seedDir, r.dir) < BLOB_ANGLE);
    if (blob) blob.members.push(r);
    else blobs.push({ seedDir: r.dir, members: [r] });
  }
  return blobs.map(({ members }) => {
    const wsum = members.reduce((s, m) => s + m.lum, 0);
    const dir = norm(members.reduce((acc, m) => add(acc, scale(m.dir, m.lum)), [0, 0, 0]));
    const escapes = members.filter((m) => m.dist === null).length;
    return {
      dir,
      lum: wsum / members.length,
      peak: Math.max(...members.map((m) => m.lum)),
      size: members.length,
      depthFrac: escapes / members.length,
    };
  });
}

/**
 * Estima a distância até uma abertura pela profundidade das superfícies ao redor dela:
 * estimativa grosseira (mediana); a memória espacial a refina procurando a moldura no mapa.
 */
function estimateOpeningDistance(blob, rays, range) {
  const around = rays
    .filter((r) => r.valid && r.dist !== null && angleBetween(r.dir, blob.dir) < NEIGHBOR_ANGLE)
    .map((r) => r.dist)
    .sort((a, b) => a - b);
  if (!around.length) return range * 0.6;
  return around[Math.floor(around.length * 0.5)];
}

export function createPerception(opts = {}) {
  let posEst = [0, 0, 0]; // integração de trajeto: origem = onde a libélula "acordou"
  let lastT = null;

  function process(packet) {
    const dt = lastT === null ? 0 : packet.t - lastT;
    lastT = packet.t;
    posEst = add(posEst, scale(packet.velocity, dt));

    const valid = packet.rays.filter((r) => r.valid);
    const returns = valid.filter((r) => r.dist !== null);
    const escapes = valid.length - returns.length;
    const meanLum = valid.length ? valid.reduce((s, r) => s + r.lum, 0) / valid.length : 0;
    const threshold = Math.max(0.42, meanLum * 1.5);

    const lightSources = clusterBrightRays(valid, threshold).map((b) => ({
      ...b,
      distEstimate: estimateOpeningDistance(b, valid, packet.range),
    }));
    const openings = lightSources.filter((b) => b.depthFrac >= 0.5 && b.size >= 2);

    let nearest = { dist: Infinity, dir: null };
    let repulsion = [0, 0, 0];
    for (const pr of packet.proximity) {
      if (pr.dist === null) continue;
      if (pr.dist < nearest.dist) nearest = { dist: pr.dist, dir: pr.dir };
      const k = 1 / Math.max(pr.dist, 0.08) - 1 / packet.proxRange;
      repulsion = add(repulsion, scale(pr.dir, -k));
    }
    for (const r of returns) {
      if (r.dist < 2.0) repulsion = add(repulsion, scale(r.dir, -0.25 * (1 / r.dist - 0.5)));
    }

    const contact = packet.contacts.length
      ? {
          impact: Math.max(...packet.contacts.map((c) => c.impact)),
          normal: norm(packet.contacts.reduce((a, c) => add(a, c.normal), [0, 0, 0])),
        }
      : null;

    return {
      t: packet.t,
      dt,
      range: packet.range,
      pose: { position: posEst, forward: packet.forward, up: packet.up, velocity: packet.velocity },
      rays: valid,
      obstacles: returns.map((r) => ({ point: add(posEst, scale(r.dir, r.dist)), dir: r.dir, dist: r.dist, lum: r.lum })),
      lightSources,
      openings,
      openness: valid.length ? escapes / valid.length : 0,
      meanLum,
      nearest,
      repulsion,
      wind: add(packet.air, packet.velocity),
      contact,
      raysTotal: packet.rays.length,
    };
  }

  return {
    process,
    position: () => posEst,
    reset() {
      posEst = [0, 0, 0];
      lastT = null;
    },
    opts,
  };
}

