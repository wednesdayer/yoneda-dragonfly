// Órgãos sensoriais simulados. Esta é a ÚNICA ponte entre o mundo físico e a mente:
// produzem um pacote de números (distâncias, luminâncias, fluxo de ar, contato, propriocepção)
// sem rótulos semânticos. A mente não sabe o que é "vidro", "parede" ou "saída".

import { fibonacciSphere, rotateByQuat, sub } from './math.js';

export const FULL_SENSORS = {
  label: 'visão panorâmica',
  rays: 110,
  fovHalfDeg: 160,
  range: 22,
  distNoise: 0.03,
  lumNoise: 0.03,
  dropout: 0,
  proximityRays: 14,
  proximityRange: 1.6,
  velNoise: 0.04,
  headingNoise: 0.01,
  airNoise: 0.03,
};

export const LIMITED_SENSORS = {
  label: 'percepção limitada',
  rays: 28,
  fovHalfDeg: 55,
  range: 7,
  distNoise: 0.12,
  lumNoise: 0.15,
  dropout: 0.2,
  proximityRays: 6,
  proximityRange: 1.0,
  velNoise: 0.15,
  headingNoise: 0.04,
  airNoise: 0.12,
};

/** Direções fixas no referencial do corpo (+X = frente), restritas ao campo de visão. */
export function eyeDirections(count, fovHalfDeg) {
  const cosLim = Math.cos((fovHalfDeg * Math.PI) / 180);
  const frac = (1 - cosLim) / 2;
  const all = fibonacciSphere(Math.ceil(count / Math.max(frac, 1e-3)));
  return all.filter((d) => d[0] >= cosLim).slice(0, count);
}

function rotY(v, a) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [c * v[0] + s * v[2], v[1], -s * v[0] + c * v[2]];
}

export function createSensors(cfg, env, rng) {
  const eyes = eyeDirections(cfg.rays, cfg.fovHalfDeg);
  const whiskers = cfg.proximityRays >= 14 ? fibonacciSphere(cfg.proximityRays) : eyeDirections(cfg.proximityRays, 70);

  /** Lê todos os sensores. `contacts` vem do corpo (mecanorrecepção). */
  function read(bodyState, t, contacts) {
    const { position: p, quat: q, velocity: v, wind } = bodyState;
    const headingErr = rng.gauss() * cfg.headingNoise;
    const toMind = (d) => rotY(d, headingErr);

    const rays = eyes.map((local) => {
      const dir = rotateByQuat(local, q);
      if (rng.next() < cfg.dropout) return { dir: toMind(dir), dist: null, lum: 0, valid: false, local };
      const hit = env.raycast(p, dir, cfg.range, false);
      const lumTrue = hit ? env.surfaceLuminance(hit) : env.skyLuminance(dir);
      const lum = Math.max(0, lumTrue * (1 + rng.gauss() * cfg.lumNoise));
      const dist = hit ? Math.max(0.05, hit.distance * (1 + rng.gauss() * cfg.distNoise)) : null;
      return { dir: toMind(dir), dist, lum, valid: true, local };
    });

    // Proximidade de curto alcance (óptica): como a visão, não detecta vidro transparente.
    const proximity = whiskers.map((local) => {
      const dir = cfg.proximityRays >= 14 ? local : rotateByQuat(local, q);
      const hit = env.raycast(p, dir, cfg.proximityRange, false);
      return { dir: toMind(dir), dist: hit ? hit.distance : null };
    });

    const noisy = (vec, s) => vec.map((x) => x + rng.gauss() * s);
    const velocity = toMind(noisy(v, cfg.velNoise)); // fluxo óptico → velocidade sobre o solo (referencial-bússola)
    const air = noisy(sub(wind, v), cfg.airNoise); // pelos sensoriais: ar relativo ao corpo

    return {
      t,
      range: cfg.range,
      proxRange: cfg.proximityRange,
      rays,
      proximity,
      velocity,
      air,
      forward: toMind(rotateByQuat([1, 0, 0], q)),
      up: rotateByQuat([0, 1, 0], q),
      contacts: contacts.map((c) => ({ normal: c.normal, impact: c.impact })),
    };
  }

  return { read, eyes, config: cfg };
}

