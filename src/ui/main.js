// Ponto de entrada da interface: laço de simulação em tempo real + instrumentação.

import { createEpisode } from '../core/episode.js';
import { SCENARIOS, INNATE_WEIGHTS } from '../mind/config.js';
import { FULL_SENSORS, LIMITED_SENSORS } from '../core/sensors.js';
import { createScene } from './scene.js';
import { createMindMap, MAP_LEGEND } from './mind-map.js';
import { drawPolar, drawRetina, altsTable } from './cognition-views.js';
import { renderGauges, renderWeights, renderPose, renderSenses, renderMetrics, renderLog } from './panels.js';
import { setupCompare } from './compare.js';

const $ = (id) => document.getElementById(id);
const MAX_FRAME_SIM = 0.5; // s de simulação por quadro, no máximo

const state = {
  scenarioId: 'com-aprendizado',
  seed: 1,
  speed: 1,
  running: true,
  episodeNo: 1,
  carried: {}, // pesos aprendidos herdados, por cenário
  ep: null,
  scene: null,
  finishedShown: false,
  autoNextTimer: null,
};

function fillScenarioSelect() {
  $('scenario').innerHTML = Object.values(SCENARIOS)
    .map((s) => `<option value="${s.id}" ${s.id === state.scenarioId ? 'selected' : ''}>${s.label}</option>`)
    .join('');
  $('map-legend').innerHTML = MAP_LEGEND.map(([c, l]) => `<span><i style="background:${c}"></i>${l}</span>`).join('');
}

function startEpisode({ inherit }) {
  const sc = SCENARIOS[state.scenarioId];
  clearTimeout(state.autoNextTimer);
  state.autoNextTimer = null;
  const weights = inherit && sc.learning && state.carried[sc.id] ? state.carried[sc.id] : INNATE_WEIGHTS;
  if (!inherit) {
    state.episodeNo = 1;
    delete state.carried[sc.id];
  }
  state.ep = createEpisode({ scenarioId: sc.id, seed: state.seed, initialWeights: weights, maxTime: 600 });
  state.finishedShown = false;
  $('banner').classList.add('hidden');
  $('hud-scenario').textContent = `${sc.label} · episódio ${state.episodeNo} · semente ${state.seed}`;
  $('hud-desc').textContent = sc.description;
  if (!state.scene) state.scene = createScene($('scene'), state.ep.spec);
  state.scene.updateSlow(state.ep);
}

function nextEpisode() {
  const sc = SCENARIOS[state.scenarioId];
  if (sc.learning) state.carried[sc.id] = state.ep.agent.weights();
  state.episodeNo++;
  state.seed++;
  $('seed').value = state.seed;
  startEpisode({ inherit: true });
}

function onFinished() {
  if (state.finishedShown) return;
  state.finishedShown = true;
  const m = state.ep.metrics();
  const b = $('banner');
  b.innerHTML = m.escaped
    ? `Saiu em <b>${m.escapeTime.toFixed(1)} s</b> por <b>${m.escapeRoute}</b><br><span class="muted">${m.attempts} tentativas · ${m.collisions} colisões</span>`
    : `Tempo esgotado sem fuga<br><span class="muted">${m.attempts} tentativas · ${m.collisions} colisões</span>`;
  b.classList.remove('hidden');
  if ($('auto-next').checked) {
    const finished = state.ep;
    // Só avança se o episódio terminado ainda for o atual (o usuário pode ter trocado/reiniciado).
    state.autoNextTimer = setTimeout(() => state.ep === finished && nextEpisode(), 1500);
  }
}

function bindControls() {
  $('scenario').addEventListener('change', (e) => {
    state.scenarioId = e.target.value;
    startEpisode({ inherit: false });
  });
  $('seed').addEventListener('change', (e) => {
    state.seed = Math.max(1, Math.floor(+e.target.value) || 1);
    startEpisode({ inherit: false });
  });
  $('speed').addEventListener('change', (e) => (state.speed = +e.target.value));
  $('btn-play').addEventListener('click', () => {
    state.running = !state.running;
    $('btn-play').textContent = state.running ? 'Pausar' : 'Continuar';
  });
  $('btn-reset').addEventListener('click', () => startEpisode({ inherit: false }));
  $('btn-next').addEventListener('click', nextEpisode);
  setupCompare({
    onOpen: () => {
      state.running = false;
      $('btn-play').textContent = 'Continuar';
    },
  });
}

const toggles = () => ({
  rays: $('t-rays').checked,
  mind: $('t-mind').checked,
  trail: $('t-trail').checked,
  wind: $('t-wind').checked,
  roof: $('t-roof').checked,
  follow: $('t-follow').checked,
});

function main() {
  fillScenarioSelect();
  bindControls();
  startEpisode({ inherit: false });
  const map = createMindMap($('map'));
  let last = performance.now();
  let acc = { panels: 0, map: 0, slow: 0 };

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    const ep = state.ep;
    if (state.running && !ep.isDone()) ep.advance(Math.min(dt * state.speed, MAX_FRAME_SIM));
    if (ep.isDone()) onFinished();
    state.scene.update(ep, toggles());

    acc = { panels: acc.panels + dt, map: acc.map + dt, slow: acc.slow + dt };
    const snap = ep.agent.snapshot();
    if (acc.panels > 0.12) {
      acc.panels = 0;
      renderGauges(snap);
      renderPose(ep, snap);
      renderSenses(snap);
      renderMetrics(ep, snap);
      renderWeights(snap.weights);
      renderLog(snap);
      drawPolar($('polar'), snap);
      $('alts').textContent = altsTable(snap);
      drawRetina($('retina'), ep.lastPacket());
      $('hud-status').textContent = `${snap.mode} · ${snap.lastDecision?.reason ?? ''}`;
    }
    if (acc.map > 0.3) {
      acc.map = 0;
      const fov = (SCENARIOS[state.scenarioId].sensors === 'limited' ? LIMITED_SENSORS : FULL_SENSORS).fovHalfDeg;
      map.draw(snap, ep, fov);
    }
    if (acc.slow > 1) {
      acc.slow = 0;
      state.scene.updateSlow(ep);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

main();
