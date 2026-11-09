// Tela de comparação entre cenários: executa o lote num Web Worker e apresenta os resultados.

import { SCENARIOS, FEATURE_LABEL } from '../mind/config.js';
import { toMarkdown } from '../experiments/runner.js';
import { barChart, lineChart, SERIES_COLORS } from './charts.js';

const $ = (id) => document.getElementById(id);

function download(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function legend(ids) {
  return `<div class="legend">${ids.map((id, i) => `<span><i style="background:${SERIES_COLORS[i]}"></i>${SCENARIOS[id].label}</span>`).join('')}</div>`;
}

function card(title, sub, node) {
  const div = document.createElement('div');
  div.className = 'chart-card';
  div.innerHTML = `<h3>${title}</h3><p>${sub}</p>`;
  div.append(node);
  return div;
}

function findings(report) {
  const ids = report.scenarios;
  const s = Object.fromEntries(ids.map((id) => [id, report.results[id].summary]));
  const best = ids.reduce((a, b) => (s[a].meanTime <= s[b].meanTime ? a : b));
  const out = [`Menor tempo médio até a fuga: <b>${SCENARIOS[best].label}</b> (${s[best].meanTime.toFixed(0)} s).`];
  if (s['sem-memoria'] && s['com-memoria']) {
    out.push(`Memória: tentativas fracassadas ${s['sem-memoria'].meanFailed.toFixed(1)} → ${s['com-memoria'].meanFailed.toFixed(1)}; toques no vidro ${s['sem-memoria'].meanGlass.toFixed(1)} → ${s['com-memoria'].meanGlass.toFixed(1)}.`);
  }
  for (const id of ids.filter((x) => SCENARIOS[x].learning)) {
    const w = report.results[id].finalWeights;
    const top = Object.entries(w).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, 3).map(([k, v]) => `${FEATURE_LABEL[k]} ${v >= 0 ? '+' : ''}${v.toFixed(2)}`);
    const halves = s[id].secondHalfTime === null ? '' : ` Tempo médio na 1ª metade dos episódios ${s[id].firstHalfTime.toFixed(0)} s → 2ª metade ${s[id].secondHalfTime.toFixed(0)} s.`;
    out.push(`${SCENARIOS[id].label}: pesos mais fortes ao final — ${top.join(', ')}.${halves}`);
  }
  return `<ul class="findings">${out.map((x) => `<li>${x}</li>`).join('')}</ul>`;
}

function render(report) {
  const ids = report.scenarios;
  const labels = ids.map((id) => SCENARIOS[id].label);
  const S = ids.map((id) => report.results[id].summary);
  const out = $('cmp-output');
  out.innerHTML = legend(ids) + findings(report);

  const grid = document.createElement('div');
  grid.className = 'chart-grid';
  const int = (v) => v.toFixed(0);
  const one = (v) => v.toFixed(1);
  grid.append(
    card('Tempo até a fuga', 'média ± desvio; sem fuga conta como o tempo máximo', barChart({ labels, values: S.map((s) => s.meanTime), errors: S.map((s) => s.sdTime), format: int, unit: ' s' })),
    card('Taxa de fuga', '% de episódios em que a libélula saiu', barChart({ labels, values: S.map((s) => s.successRate * 100), format: int, unit: '%' })),
    card('Tentativas fracassadas', 'média por episódio', barChart({ labels, values: S.map((s) => s.meanFailed), format: one })),
    card('Toques no vidro', 'contatos físicos com vidraças, média por episódio', barChart({ labels, values: S.map((s) => s.meanGlass), format: one })),
  );
  out.append(grid);

  const series = ids.map((id) => report.results[id].runs.map((r) => ({ value: r.escaped ? r.escapeTime : report.maxTime, escaped: r.escaped, attempts: r.attempts, collisions: r.collisions })));
  out.append(card('Tempo até a fuga por episódio', 'ponto vazio = não fugiu; nos cenários 3 e 4 os pesos aprendidos passam de um episódio ao seguinte', lineChart({ labels, series, maxTime: report.maxTime })));

  const rows = ids.map((id, i) => {
    const s = S[i];
    return `<tr><td><span class="swatch" style="background:${SERIES_COLORS[i]}"></span>${labels[i]}</td><td>${(s.successRate * 100).toFixed(0)}%</td><td>${s.meanTime.toFixed(0)} ± ${s.sdTime.toFixed(0)}</td><td>${s.meanAttempts.toFixed(1)}</td><td>${s.meanCollisions.toFixed(1)}</td><td>${(s.meanCoverage * 100).toFixed(1)}%</td><td>${s.meanPoseError.toFixed(2)}</td><td>${Object.entries(s.routes).map(([k, v]) => `${k}: ${v}`).join(', ') || '—'}</td></tr>`;
  });
  const table = document.createElement('div');
  table.className = 'chart-card';
  table.innerHTML = `<h3>Tabela</h3><table class="results"><thead><tr><th>Cenário</th><th>Fugas</th><th>Tempo (s)</th><th>Tentativas</th><th>Colisões</th><th>Cobertura</th><th>Erro pose (m)</th><th>Rotas de fuga</th></tr></thead><tbody>${rows.join('')}</tbody></table>`;
  out.append(table);
}

export function setupCompare({ onOpen }) {
  let worker = null;
  let lastReport = null;
  const modal = $('compare');
  $('btn-compare').addEventListener('click', () => {
    modal.classList.remove('hidden');
    onOpen?.();
  });
  $('compare-close').addEventListener('click', () => modal.classList.add('hidden'));
  modal.addEventListener('click', (e) => e.target === modal && modal.classList.add('hidden'));

  $('cmp-run').addEventListener('click', () => {
    worker?.terminate();
    const episodes = Math.max(2, Math.min(40, +$('cmp-episodes').value || 8));
    const maxTime = Math.max(30, Math.min(600, +$('cmp-maxtime').value || 180));
    const baseSeed = Math.max(1, +$('cmp-seed').value || 100);
    const prog = $('cmp-progress');
    prog.classList.remove('hidden');
    $('cmp-run').disabled = true;
    $('cmp-output').innerHTML = '<p class="muted">Executando episódios sem renderização…</p>';
    worker = new Worker(new URL('../experiments/worker.js', import.meta.url), { type: 'module' });
    worker.onmessage = ({ data }) => {
      if (data.type === 'progress') {
        prog.querySelector('div').style.width = `${(data.done / data.total) * 100}%`;
        prog.querySelector('span').textContent = `${data.done}/${data.total} · ${SCENARIOS[data.scenario].label} · episódio ${data.episode}`;
      } else if (data.type === 'done') {
        lastReport = data.report;
        render(lastReport);
        $('cmp-run').disabled = false;
        $('cmp-json').disabled = $('cmp-md').disabled = false;
        worker.terminate();
      } else {
        $('cmp-output').innerHTML = `<p style="color:var(--bad)">Falha no experimento: ${data.message}</p>`;
        $('cmp-run').disabled = false;
      }
    };
    worker.onerror = (err) => {
      $('cmp-output').innerHTML = `<p style="color:var(--bad)">Erro no worker: ${err.message}</p>`;
      $('cmp-run').disabled = false;
    };
    worker.postMessage({ episodes, maxTime, baseSeed });
  });

  $('cmp-json').addEventListener('click', () => lastReport && download('experimento-libelula.json', JSON.stringify(lastReport, null, 2), 'application/json'));
  $('cmp-md').addEventListener('click', () => lastReport && download('experimento-libelula.md', toMarkdown(lastReport), 'text/markdown'));
}
