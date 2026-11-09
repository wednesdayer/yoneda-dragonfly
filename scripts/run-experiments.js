// Executa os quatro cenários sem renderização e grava resultados em ./resultados.
// Uso: npm run experiment -- [episodios] [tempoMax] [sementeBase]

import { mkdirSync, writeFileSync } from 'node:fs';
import { runExperiments, toMarkdown } from '../src/experiments/runner.js';

const [episodes = 8, maxTime = 240, baseSeed = 100] = process.argv.slice(2).map(Number);
const started = Date.now();

const report = runExperiments({
  episodes,
  maxTime,
  baseSeed,
  onProgress: ({ done, total, scenario, episode, last }) => {
    const outcome = last.escaped ? `fugiu em ${last.escapeTime.toFixed(1)} s por ${last.escapeRoute}` : 'não fugiu';
    process.stdout.write(`[${done}/${total}] ${scenario} ep ${episode}: ${outcome} (tentativas ${last.attempts}, colisões ${last.collisions})\n`);
  },
});

mkdirSync('resultados', { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
writeFileSync(`resultados/experimento-${stamp}.json`, JSON.stringify(report, null, 2));
writeFileSync(`resultados/experimento-${stamp}.md`, toMarkdown(report));
process.stdout.write(`\n${toMarkdown(report).split('\n## Episódios')[0]}\n\nConcluído em ${((Date.now() - started) / 1000).toFixed(0)} s → resultados/experimento-${stamp}.md\n`);
