// Painéis textuais/numéricos da instrumentação: estado interno, pesos, pose, sensores, métricas, eventos.

import { FEATURES, FEATURE_LABEL, INNATE_WEIGHTS } from '../mind/config.js';

const $ = (id) => document.getElementById(id);
const f1 = (x) => (Number.isFinite(x) ? x.toFixed(1) : '—');
const f2 = (x) => (Number.isFinite(x) ? x.toFixed(2) : '—');
const vec = (v) => v.map((x) => x.toFixed(1).padStart(5)).join(' ');
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

function kv(rows) {
  return rows.map(([k, v]) => `<span class="k">${esc(k)}</span><span class="v">${esc(v)}</span>`).join('');
}

export function renderGauges(snap) {
  const items = [
    ['frustração', snap.internal.frustration, 4],
    ['curiosidade', snap.internal.curiosity, 1],
    ['confiança na escolha', snap.internal.confidence, 1],
    ['temperatura (exploração)', snap.internal.temperature, 2],
  ];
  $('gauges').innerHTML = items
    .map(([name, v, max]) => `<div class="gauge"><span>${name}</span><span class="mono">${f2(v)}</span><div class="bar"><i style="width:${Math.min(100, (v / max) * 100)}%"></i></div></div>`)
    .join('');
  const mode = $('mode');
  mode.textContent = snap.mode;
  mode.dataset.mode = snap.mode;
}

export function renderWeights(weights) {
  const B = 4;
  const pct = (w) => 50 + (Math.max(-B, Math.min(B, w)) / B) * 50;
  $('weights').innerHTML = FEATURES.map((k) => {
    const w = weights[k];
    const left = Math.min(50, pct(w));
    const width = Math.abs(pct(w) - 50);
    const color = w >= 0 ? 'var(--series-1)' : 'var(--series-2)';
    return `<span class="name">${FEATURE_LABEL[k]}</span>
      <span class="track"><span class="zero"></span><span class="fill" style="left:${left}%;width:${width}%;background:${color}"></span><span class="innate" style="left:${pct(INNATE_WEIGHTS[k])}%"></span></span>
      <span class="val mono">${w >= 0 ? '+' : ''}${w.toFixed(2)}</span>`;
  }).join('');
}

export function renderPose(ep, snap) {
  const truth = ep.body.position();
  const est = snap.poseEstimate.map((x, i) => x + ep.start[i]);
  const err = Math.hypot(...truth.map((x, i) => x - est[i]));
  const v = ep.body.velocity();
  const fwd = ep.body.forward();
  const yaw = ((Math.atan2(fwd[0], -fwd[2]) * 180) / Math.PI + 360) % 360;
  $('pose').innerHTML = kv([
    ['posição real (m)', vec(truth)],
    ['posição estimada (m)', vec(est)],
    ['erro de integração', `${f2(err)} m`],
    ['velocidade', `${f1(Math.hypot(...v))} m/s`],
    ['rumo (bússola)', `${yaw.toFixed(0)}°`],
    ['comando motor', vec(ep.body.command().velocity)],
  ]);
}

export function renderSenses(snap) {
  const p = snap.percept;
  if (!p) return;
  $('senses').innerHTML = kv([
    ['raios válidos', `${p.rays.length}/${p.raysTotal}`],
    ['sem retorno', `${(p.openness * 100).toFixed(0)}%`],
    ['luz média', f2(p.meanLum)],
    ['fontes de luz', String(p.lightSources.length)],
    ['aberturas?', String(p.openings.length)],
    ['obstáculo +próx.', Number.isFinite(p.nearest.dist) ? `${f2(p.nearest.dist)} m` : '—'],
    ['ar sentido', `${f2(Math.hypot(...p.wind))} m/s`],
  ]);
}

export function renderMetrics(ep, snap) {
  const m = ep.metrics();
  const mem = snap.memory?.stats();
  const kinds = Object.entries(m.contactsByKind).map(([k, n]) => `${k} ${n}`).join(', ') || '—';
  $('metrics').innerHTML = kv([
    ['tempo', `${f1(m.time)} s`],
    ['fuga', m.escaped ? `${f1(m.escapeTime)} s · ${m.escapeRoute}` : 'ainda não'],
    ['tentativas de saída', `${m.attempts} (${m.failedAttempts} fracassadas)`],
    ['colisões percebidas', String(m.collisions)],
    ['contatos físicos', kinds],
    ['decisões', String(m.decisions)],
    ['percurso', `${f1(m.pathLength)} m`],
    ['volume visitado (real)', `${(m.coverage * 100).toFixed(1)}%`],
    ['células mapeadas', mem ? `${mem.knownCells} conhecidas · ${mem.visitedCells} visitadas` : 'sem memória'],
    ['marcas de fracasso', mem ? String(mem.failures) : '—'],
    ['recompensa acumulada', snap.learner.enabled ? f1(snap.learner.totalReward) : 'aprendizado desligado'],
  ]);
  $('clock').textContent = `t = ${f1(m.time)} s`;
}

export function renderLog(snap) {
  $('log').innerHTML = [...snap.log]
    .reverse()
    .map((e) => `<li data-kind="${e.kind}"><span class="t">${e.t.toFixed(1)}s</span><span>${esc(e.text)}</span></li>`)
    .join('');
}
