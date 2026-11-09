import { describe, it, expect } from 'vitest';
import { createEpisode, runEpisode } from '../src/core/episode.js';
import { summarize, toMarkdown } from '../src/experiments/runner.js';
import { createAgent } from '../src/mind/agent.js';
import { SCENARIOS } from '../src/mind/config.js';
import { createRng } from '../src/core/math.js';

describe('episódio', () => {
  it('é determinístico para a mesma semente', () => {
    const a = runEpisode({ scenarioId: 'com-memoria', seed: 5, maxTime: 15 });
    const b = runEpisode({ scenarioId: 'com-memoria', seed: 5, maxTime: 15 });
    expect(a.pathLength).toBeCloseTo(b.pathLength, 9);
    expect(a.decisions).toBe(b.decisions);
  });

  it('a libélula voa, decide e respeita o limite de velocidade', () => {
    const ep = createEpisode({ scenarioId: 'sem-memoria', seed: 2, maxTime: 20 });
    let maxSpeed = 0;
    while (!ep.isDone()) {
      ep.advance(0.5);
      maxSpeed = Math.max(maxSpeed, ep.body.speed());
    }
    const m = ep.metrics();
    expect(m.decisions).toBeGreaterThan(50);
    expect(m.pathLength).toBeGreaterThan(5);
    expect(maxSpeed).toBeLessThanOrEqual(ep.body.limits.maxSpeed * 1.4 + 1e-6);
  });

  it('decide a 5 Hz mesmo com erro de ponto flutuante no relógio', () => {
    const agent = createAgent({ scenario: SCENARIOS['sem-memoria'], rng: createRng(1) });
    const base = { range: 20, proxRange: 1.5, proximity: [], air: [0, 0, 0], velocity: [0, 0, 0], forward: [1, 0, 0], up: [0, 1, 0], contacts: [] };
    const rays = [{ dir: [1, 0, 0], dist: 5, lum: 0.2, valid: true }];
    for (let k = 0; k < 100; k++) agent.step({ ...base, rays, t: k * 6 * (1 / 60) });
    expect(agent.snapshot().counters.decisions).toBe(50);
  });

  it('cenário sem memória não constrói mapa', () => {
    const ep = createEpisode({ scenarioId: 'sem-memoria', seed: 1, maxTime: 5 });
    ep.advance(5);
    expect(ep.agent.snapshot().memory).toBeNull();
  });

  it('rejeita cenário desconhecido', () => {
    expect(() => createEpisode({ scenarioId: 'x' })).toThrow(/desconhecido/);
  });

  it('resume e exporta resultados', () => {
    const runs = [
      { escaped: true, escapeTime: 10, escapeRoute: 'oculo-teto', attempts: 2, failedAttempts: 1, collisions: 1, glassContacts: 1, coverage: 0.1, pathLength: 20, poseError: 0.1, time: 10 },
      { escaped: false, escapeTime: null, escapeRoute: null, attempts: 4, failedAttempts: 4, collisions: 3, glassContacts: 2, coverage: 0.2, pathLength: 40, poseError: 0.2, time: 60 },
    ];
    const s = summarize(runs, 60);
    expect(s.successRate).toBe(0.5);
    expect(s.meanTime).toBe(35);
    expect(s.routes).toEqual({ 'oculo-teto': 1 });
    const md = toMarkdown({ episodes: 2, maxTime: 60, baseSeed: 1, scenarios: ['com-memoria'], results: { 'com-memoria': { runs: runs.map((r, i) => ({ ...r, episode: i + 1 })), summary: s, finalWeights: {} } } });
    expect(md).toContain('| 2 · Com memória | 50%');
  });
});
