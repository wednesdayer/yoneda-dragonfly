// Aprendizado por reforço (gradiente de política com traço de elegibilidade).
// Ajusta os pesos das preferências conforme as consequências das escolhas:
// colisões e tentativas frustradas punem, descobrir espaço novo e escapar recompensam.

import { FEATURES, INNATE_WEIGHTS } from './config.js';
import { clamp } from '../core/math.js';

export const REWARD = {
  collision: -0.5,
  failedAttempt: -1.5,
  newCell: 0.05,
  perDecision: -0.02,
  escape: 10,
};

export function createLearner(initialWeights, params, enabled) {
  let weights = { ...initialWeights };
  let trace = Object.fromEntries(FEATURES.map((k) => [k, 0]));
  let pending = 0;
  let baseline = 0;
  let totalReward = 0;
  let updates = 0;
  const history = [];

  function reward(r, reason) {
    pending += r;
    totalReward += r;
    if (reason && Math.abs(r) >= 0.5) history.push({ r, reason });
    if (history.length > 40) history.shift();
  }

  /** Aplica a recompensa acumulada às escolhas recentes e registra a nova escolha. */
  function onDecision(chosenF, expectedF) {
    const r = pending + REWARD.perDecision;
    pending = 0;
    if (enabled) {
      const delta = clamp(r - baseline, -params.deltaClip, params.deltaClip);
      baseline += 0.05 * (r - baseline);
      weights = Object.fromEntries(
        FEATURES.map((k) => {
          // Gradiente da política + atração fraca às predisposições inatas (prior): sem evidência
          // consistente, os pesos não derivam para "superstições".
          const grad = params.learningRate * delta * trace[k];
          const prior = params.priorPull * (INNATE_WEIGHTS[k] - weights[k]);
          return [k, clamp(weights[k] + grad + prior, -params.weightBound, params.weightBound)];
        }),
      );
      updates++;
    }
    trace = Object.fromEntries(FEATURES.map((k) => [k, params.traceDecay * trace[k] + (chosenF[k] - expectedF[k])]));
  }

  /** Recompensa terminal (fuga percebida) propagada pelo traço. */
  function terminal(r) {
    reward(r, 'fuga percebida');
    onDecision(Object.fromEntries(FEATURES.map((k) => [k, 0])), Object.fromEntries(FEATURES.map((k) => [k, 0])));
  }

  return {
    reward,
    onDecision,
    terminal,
    weights: () => weights,
    state: () => ({ enabled, baseline, totalReward, updates, recent: history.slice(-6) }),
  };
}
