// Executor de experimentos comparativos. Usado pelo script Node e pelo Web Worker do navegador.
// Nos cenários com aprendizado, os pesos aprendidos num episódio são herdados pelo seguinte.

import { runEpisode } from '../core/episode.js';
import { SCENARIOS, INNATE_WEIGHTS } from '../mind/config.js';
import { mean, stdev } from '../core/math.js';

export const SCENARIO_ORDER = ['sem-memoria', 'com-memoria', 'com-aprendizado', 'percepcao-limitada'];

/**
 * @param {{episodes:number, maxTime:number, baseSeed:number, scenarios?:string[], onProgress?:Function}} opts
 */
export function runExperiments({ episodes = 8, maxTime = 240, baseSeed = 100, scenarios = SCENARIO_ORDER, onProgress = () => {} }) {
  const total = episodes * scenarios.length;
  let done = 0;
  const results = {};
  for (const id of scenarios) {
    let weights = { ...INNATE_WEIGHTS };
    const runs = [];
    for (let e = 0; e < episodes; e++) {
      const m = runEpisode({ scenarioId: id, seed: baseSeed + e, initialWeights: weights, maxTime });
      runs.push({ ...m, episode: e + 1 });
      if (SCENARIOS[id].learning) weights = m.weights;
      done++;
      onProgress({ done, total, scenario: id, episode: e + 1, last: m });
    }
    results[id] = { runs, summary: summarize(runs, maxTime), finalWeights: weights };
  }
  return { episodes, maxTime, baseSeed, results, scenarios };
}

export function summarize(runs, maxTime) {
  const pick = (k) => runs.map((r) => r[k]);
  const escaped = runs.filter((r) => r.escaped);
  // Tempo até a fuga com censura: quem não escapou conta como maxTime (limite inferior).
  const censored = runs.map((r) => (r.escaped ? r.escapeTime : maxTime));
  const half = Math.ceil(runs.length / 2);
  const firstHalf = censored.slice(0, half);
  const secondHalf = censored.slice(half);
  return {
    n: runs.length,
    successRate: escaped.length / runs.length,
    meanTime: mean(censored),
    sdTime: stdev(censored),
    meanTimeEscaped: escaped.length ? mean(escaped.map((r) => r.escapeTime)) : null,
    meanAttempts: mean(pick('attempts')),
    meanFailed: mean(pick('failedAttempts')),
    meanCollisions: mean(pick('collisions')),
    meanGlass: mean(pick('glassContacts')),
    meanCoverage: mean(pick('coverage')),
    meanPath: mean(pick('pathLength')),
    meanPoseError: mean(pick('poseError')),
    firstHalfTime: mean(firstHalf),
    secondHalfTime: secondHalf.length ? mean(secondHalf) : null,
    routes: escaped.reduce((acc, r) => ({ ...acc, [r.escapeRoute]: (acc[r.escapeRoute] ?? 0) + 1 }), {}),
  };
}

/** Relatório em Markdown para registro do experimento. */
export function toMarkdown(report) {
  const lines = [
    '# Resultados — Libélula no templo',
    '',
    `Episódios por cenário: ${report.episodes} · tempo máximo: ${report.maxTime} s · semente base: ${report.baseSeed}`,
    '',
    '| Cenário | Fugas | Tempo médio* (s) | 1ª metade → 2ª metade (s) | Tentativas | Fracassos | Colisões | Toques no vidro | Cobertura | Erro de pose (m) |',
    '|---|---|---|---|---|---|---|---|---|---|',
  ];
  for (const id of report.scenarios) {
    const s = report.results[id].summary;
    const halves = `${s.firstHalfTime.toFixed(0)} → ${s.secondHalfTime === null ? '—' : s.secondHalfTime.toFixed(0)}`;
    lines.push(
      `| ${SCENARIOS[id].label} | ${(s.successRate * 100).toFixed(0)}% | ${s.meanTime.toFixed(0)} ± ${s.sdTime.toFixed(0)} | ${halves} | ${s.meanAttempts.toFixed(1)} | ${s.meanFailed.toFixed(1)} | ${s.meanCollisions.toFixed(1)} | ${s.meanGlass.toFixed(1)} | ${(s.meanCoverage * 100).toFixed(1)}% | ${s.meanPoseError.toFixed(2)} |`,
    );
  }
  lines.push('', '\\* Tempo com censura: episódios sem fuga contam como o tempo máximo.', '', '## Pesos finais (cenários com aprendizado)', '');
  for (const id of report.scenarios.filter((x) => SCENARIOS[x].learning)) {
    const w = report.results[id].finalWeights;
    lines.push(`- **${SCENARIOS[id].label}**: ${Object.entries(w).map(([k, v]) => `${k} ${v.toFixed(2)}`).join(', ')}`);
  }
  lines.push('', '## Episódios', '', '| Cenário | Ep. | Fuga | Tempo (s) | Rota | Tentativas | Colisões |', '|---|---|---|---|---|---|---|');
  for (const id of report.scenarios) {
    for (const r of report.results[id].runs) {
      lines.push(`| ${SCENARIOS[id].label} | ${r.episode} | ${r.escaped ? 'sim' : 'não'} | ${(r.escaped ? r.escapeTime : r.time).toFixed(1)} | ${r.escapeRoute ?? '—'} | ${r.attempts} | ${r.collisions} |`);
    }
  }
  return lines.join('\n');
}
