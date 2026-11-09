// Um episódio experimental: monta o substrato físico, o corpo, os sensores e a mente,
// e executa o laço físico (60 Hz) com ciclos cognitivos a 10 Hz.
// Também é o "experimentador": mede métricas com acesso à verdade física,
// que a mente nunca recebe.

import { buildTempleSpec, isOutsideTemple, INTERIOR } from './temple-spec.js';
import { buildPhysicsWorld } from './physics-world.js';
import { createEnvironment } from './environment.js';
import { createDragonflyBody } from './dragonfly-body.js';
import { createSensors, FULL_SENSORS, LIMITED_SENSORS } from './sensors.js';
import { createAgent } from '../mind/agent.js';
import { SCENARIOS, INNATE_WEIGHTS } from '../mind/config.js';
import { createRng, sub, len } from './math.js';

export const PHYSICS_DT = 1 / 60;
export const SENSE_EVERY = 6; // 10 Hz
export const DEFAULT_MAX_TIME = 240;
const EXIT_GRACE = 1.0; // s de voo fora do templo antes da percepção terminal

const SPEC = buildTempleSpec();
const SHARED_SHADOW_CACHE = new Map();

function spawnPoint(rng) {
  return [8 + rng.range(-2, 2), 3.5 + rng.range(-1, 1), rng.range(-3, 3)];
}

function interiorCellKey(p) {
  const inside = p[0] > INTERIOR.x[0] && p[0] < INTERIOR.x[1] && p[1] > INTERIOR.y[0] && p[1] < INTERIOR.y[1] && p[2] > INTERIOR.z[0] && p[2] < INTERIOR.z[1];
  return inside ? `${Math.floor(p[0])},${Math.floor(p[1])},${Math.floor(p[2])}` : null;
}
const INTERIOR_CELLS = (INTERIOR.x[1] - INTERIOR.x[0]) * (INTERIOR.y[1] - INTERIOR.y[0]) * (INTERIOR.z[1] - INTERIOR.z[0]);

export function createEpisode({ scenarioId, seed = 1, initialWeights = INNATE_WEIGHTS, maxTime = DEFAULT_MAX_TIME }) {
  const scenario = SCENARIOS[scenarioId];
  if (!scenario) throw new Error(`Cenário desconhecido: ${scenarioId}`);
  const rng = createRng(seed);
  const phys = buildPhysicsWorld(SPEC);
  const env = createEnvironment(phys, SPEC, SHARED_SHADOW_CACHE);
  const start = spawnPoint(rng);
  const body = createDragonflyBody(phys, env, start, createRng(seed * 7 + 3));
  const yaw = rng.range(0, Math.PI * 2);
  body.body.quaternion.setFromAxisAngle({ x: 0, y: 1, z: 0 }, yaw);
  const sensors = createSensors(scenario.sensors === 'limited' ? LIMITED_SENSORS : FULL_SENSORS, env, createRng(seed * 13 + 5));
  const agent = createAgent({ scenario, rng: createRng(seed * 31 + 11), initialWeights });

  let steps = 0;
  let t = 0;
  let done = false;
  let escaped = false;
  let escapeTime = null;
  let escapeRoute = null;
  let pathLength = 0;
  let lastPos = start;
  let lastPacket = null;
  const visitedTrue = new Set();
  const contactsByKind = {};
  const truthTrail = [start];
  let pendingContacts = [];

  const bodyState = () => ({ position: body.position(), quat: body.quat(), velocity: body.velocity(), wind: body.lastWind() });

  function nearestOpening(p) {
    return SPEC.openings.reduce((best, o) => (!best || len(sub(o.center, p)) < len(sub(best.center, p)) ? o : best), null)?.id;
  }

  function stepOnce() {
    if (done) return;
    if (steps % SENSE_EVERY === 0) {
      lastPacket = sensors.read(bodyState(), t, pendingContacts);
      pendingContacts = [];
      body.setCommand(agent.step(lastPacket));
    }
    body.prePhysics(t);
    phys.world.step(PHYSICS_DT);
    body.clampSpeed();
    for (const c of body.drainContacts()) {
      contactsByKind[c.kind] = (contactsByKind[c.kind] ?? 0) + 1;
      pendingContacts.push(c);
    }
    steps++;
    t = steps * PHYSICS_DT;

    const p = body.position();
    pathLength += len(sub(p, lastPos));
    lastPos = p;
    const key = interiorCellKey(p);
    if (key) visitedTrue.add(key);
    if (steps % 15 === 0) truthTrail.push(p);

    if (!escaped && isOutsideTemple(p)) {
      escaped = true;
      escapeTime = t;
      escapeRoute = nearestOpening(p);
    }
    if (escaped && t >= escapeTime + EXIT_GRACE) {
      // Depois de alguns ciclos voando lá fora, a libélula percebe o céu aberto.
      agent.terminal(sensors.read(bodyState(), t, []));
      done = true;
    } else if (!escaped && (t >= maxTime || !Number.isFinite(p[0]))) {
      done = true;
    }
  }

  /** Avança `seconds` de tempo simulado. */
  let carry = 0;
  function advance(seconds) {
    carry += seconds;
    while (carry >= PHYSICS_DT - 1e-9 && !done) {
      stepOnce();
      carry -= PHYSICS_DT;
    }
  }

  function metrics() {
    const snap = agent.snapshot();
    const truePos = body.position();
    const estPos = snap.poseEstimate.map((x, i) => x + start[i]);
    return {
      scenario: scenarioId,
      seed,
      time: t,
      escaped,
      escapeTime,
      escapeRoute,
      attempts: snap.counters.attempts,
      failedAttempts: snap.counters.failedAttempts,
      collisions: snap.counters.collisions,
      contactsByKind: { ...contactsByKind },
      glassContacts: contactsByKind.vidro ?? 0,
      decisions: snap.counters.decisions,
      pathLength,
      coverage: visitedTrue.size / INTERIOR_CELLS,
      poseError: len(sub(truePos, estPos)),
      weights: { ...agent.weights() },
    };
  }

  return {
    spec: SPEC,
    scenario,
    start,
    body,
    sensors,
    agent,
    env,
    advance,
    stepOnce,
    metrics,
    truthTrail,
    lastPacket: () => lastPacket,
    isDone: () => done,
    time: () => t,
  };
}

/** Executa um episódio inteiro sem renderização (experimentos em lote). */
export function runEpisode(opts) {
  const ep = createEpisode(opts);
  while (!ep.isDone()) ep.advance(5);
  return ep.metrics();
}
