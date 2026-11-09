// D. AGÊNCIA — integra percepção, memória, decisão e aprendizado num ciclo
// percepção → estado interno → decisão → comando motor. Independe do motor de física:
// recebe apenas pacotes sensoriais e devolve uma velocidade desejada.

import { createPerception } from './perception.js';
import { createSpatialMemory } from './spatial-memory.js';
import { decide, explain } from './decision.js';
import { createLearner, REWARD } from './learning.js';
import { INNATE_WEIGHTS, MIND_PARAMS, FEATURE_LABEL } from './config.js';
import { add, scale, sub, norm, len, clampLen, angleBetween, clamp } from '../core/math.js';

const MODE = { EXPLORE: 'EXPLORAR', ATTEMPT: 'TENTATIVA DE SAÍDA', BACKOFF: 'RECUO', FREE: 'LIVRE' };
const LOG_SIZE = 14;

export function createAgent({ scenario, rng, initialWeights = INNATE_WEIGHTS, params = MIND_PARAMS }) {
  const perception = createPerception();
  const memory = scenario.memory ? createSpatialMemory() : null;
  const learner = createLearner(initialWeights, params, scenario.learning);

  let mode = MODE.EXPLORE;
  let heading = [1, 0, 0];
  let lastDecisionT = -Infinity;
  let lastContactT = -Infinity;
  let backoff = null;
  let attempt = null;
  let frustration = 0;
  let lastPercept = null;
  let lastDecision = null;
  let log = [];
  const counters = { decisions: 0, attempts: 0, failedAttempts: 0, collisions: 0 };
  const trail = [];

  const temperature = () => clamp(params.temperature * (1 + 1.5 * frustration), 0.05, 2);
  const pushLog = (entry) => {
    log = [...log.slice(-(LOG_SIZE - 1)), entry];
  };

  function failAttempt(p, why) {
    counters.failedAttempts++;
    frustration += 0.35;
    learner.reward(REWARD.failedAttempt, 'tentativa fracassada');
    if (memory) {
      memory.addFailure(p.pose.position, attempt.dir, attempt.lum, p.t);
      memory.recordCandidateFailure(attempt.target);
    }
    pushLog({ t: p.t, kind: 'falha', text: `Tentativa #${attempt.n} fracassou (${why})` });
    attempt = null;
  }

  function handleContact(p) {
    if (!p.contact || p.contact.impact < 0.1 || p.t - lastContactT < 0.3) return;
    lastContactT = p.t;
    counters.collisions++;
    frustration += 0.12;
    learner.reward(REWARD.collision, 'colisão');
    if (memory) memory.markContact(p.pose.position, p.contact.normal);
    if (attempt) failAttempt(p, 'barreira invisível ao tocar');
    const jitter = [rng.gauss() * 0.4, rng.gauss() * 0.3, rng.gauss() * 0.4];
    backoff = { until: p.t + params.backoffTime, dir: norm(add(p.contact.normal, jitter)) };
    mode = MODE.BACKOFF;
  }

  function checkAttempt(p) {
    if (!attempt) return;
    const pos = p.pose.position;
    if (p.t - attempt.start > params.attemptMaxTime) return failAttempt(p, 'tempo esgotado');
    if (len(sub(attempt.target, pos)) < 0.9) {
      if (attempt.extended) return failAttempt(p, 'nenhuma passagem encontrada');
      attempt = { ...attempt, target: add(attempt.target, scale(attempt.dir, 2.5)), extended: true };
    }
  }

  function startAttempt(p, alt) {
    const pos = p.pose.position;
    const match = p.openings.reduce((best, o) => (!best || angleBetween(o.dir, alt.dir) < angleBetween(best.dir, alt.dir) ? o : best), null);
    const distEst = alt.recalled ? alt.recalled.dist : match ? match.distEstimate : p.range * 0.5;
    counters.attempts++;
    attempt = { n: counters.attempts, start: p.t, dir: alt.dir, lum: alt.f.luz, target: add(pos, scale(alt.dir, distEst + 0.8)), extended: false };
    pushLog({ t: p.t, kind: 'tentativa', text: `Tentativa #${attempt.n}: rumo a abertura luminosa a ~${distEst.toFixed(1)} m` });
  }

  function makeDecision(p) {
    const ctx = { percept: p, memory, weights: learner.weights(), heading, attemptTarget: attempt?.target, temperature: temperature(), rng };
    const res = decide(ctx);
    let idx = res.chosenIndex;
    if (attempt) {
      // Compromisso com a tentativa: segue o alvo enquanto o caminho parece livre.
      const toTarget = norm(sub(attempt.target, p.pose.position));
      const tIdx = res.alternatives.findIndex((a) => angleBetween(a.dir, toTarget) < 1e-3);
      if (tIdx >= 0 && res.alternatives[tIdx].free > 1.2) idx = tIdx;
    }
    const chosen = res.alternatives[idx];
    learner.onDecision(chosen.f, res.expectedF);
    counters.decisions++;
    heading = chosen.dir;

    const exitLike = chosen.f.luz * 1.1 >= params.attemptLightMin && chosen.f.profundidade >= params.attemptDepthMin;
    if (!attempt && exitLike) startAttempt(p, chosen);
    mode = attempt ? MODE.ATTEMPT : MODE.EXPLORE;

    const reason = explain(chosen, learner.weights(), FEATURE_LABEL);
    lastDecision = { t: p.t, alternatives: res.alternatives, chosenIndex: idx, reason };
    if (counters.decisions % 5 === 0 || exitLike) pushLog({ t: p.t, kind: 'decisão', text: `${mode}: ${reason} (p=${chosen.p.toFixed(2)})` });
  }

  function motorCommand(p) {
    if (mode === MODE.BACKOFF) return { velocity: scale(backoff.dir, 2) };
    const speed = attempt ? params.attemptSpeed : params.exploreSpeed;
    const reflex = scale(p.repulsion, params.reflexGain * (attempt ? 0.6 : 1));
    return { velocity: clampLen(add(scale(heading, speed), reflex), 4.5) };
  }

  /** Um ciclo cognitivo completo. */
  function step(packet) {
    const p = perception.process(packet);
    if (!lastPercept) heading = p.pose.forward;
    lastPercept = p;
    frustration *= Math.exp(-p.dt / params.frustrationDecay);

    if (memory) {
      memory.integrateRays(p.pose.position, p.rays, p.range);
      const fresh = memory.markVisit(p.pose.position);
      if (fresh) learner.reward(REWARD.newCell * fresh);
      memory.updateCandidates(p.pose.position, p.openings, p.t);
    }
    if (trail.length === 0 || len(sub(trail[trail.length - 1], p.pose.position)) > 0.3) trail.push(p.pose.position);

    handleContact(p);
    checkAttempt(p);
    if (mode === MODE.BACKOFF && p.t >= backoff.until) mode = attempt ? MODE.ATTEMPT : MODE.EXPLORE;
    if (mode !== MODE.BACKOFF && p.t - lastDecisionT >= params.decisionPeriod - 1e-6) {
      lastDecisionT = p.t;
      makeDecision(p);
    }
    return motorCommand(p);
  }

  /** Após sair, a libélula percebe céu aberto ao redor: recompensa intrínseca. */
  function terminal(packet) {
    const p = perception.process(packet);
    lastPercept = p;
    // Céu aberto = raios voltados para cima sem retorno (independe de onde está a parede).
    const upward = p.rays.filter((r) => r.dir[1] > 0.2);
    const sky = upward.length ? upward.filter((r) => r.dist === null).length / upward.length : p.openness;
    const perceivedFree = Math.max(sky, p.openness) > 0.5;
    if (perceivedFree) learner.terminal(REWARD.escape);
    mode = MODE.FREE;
    pushLog({ t: p.t, kind: 'fuga', text: perceivedFree ? `Céu aberto percebido (${(sky * 100).toFixed(0)}% do alto livre)` : 'Fora do templo, mas ainda sem perceber céu aberto' });
  }

  function snapshot() {
    const alts = lastDecision?.alternatives ?? [];
    const curiosity = alts.length ? alts.reduce((s, a) => s + a.f.novidade, 0) / alts.length : 0;
    const chosen = lastDecision ? alts[lastDecision.chosenIndex] : null;
    return {
      scenario,
      mode,
      internal: { frustration, curiosity, confidence: chosen?.p ?? 0, temperature: temperature() },
      weights: learner.weights(),
      learner: learner.state(),
      counters: { ...counters },
      lastDecision,
      attempt,
      log,
      percept: lastPercept,
      poseEstimate: lastPercept?.pose.position ?? [0, 0, 0],
      heading,
      trail,
      memory,
    };
  }

  return { step, terminal, snapshot, weights: () => learner.weights() };
}
