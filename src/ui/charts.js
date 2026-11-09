// Gráficos SVG da comparação entre cenários (barras e curvas por episódio), com tooltip.

export const SERIES_COLORS = ['var(--series-1)', 'var(--series-2)', 'var(--series-3)', 'var(--series-4)'];
const NS = 'http://www.w3.org/2000/svg';

function el(tag, attrs = {}, text) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (text !== undefined) node.textContent = text;
  return node;
}

function attachTooltip(node, html) {
  const tip = document.getElementById('tooltip');
  node.addEventListener('mousemove', (e) => {
    tip.innerHTML = html;
    tip.classList.remove('hidden');
    tip.style.left = `${e.clientX + 12}px`;
    tip.style.top = `${e.clientY + 12}px`;
  });
  node.addEventListener('mouseleave', () => tip.classList.add('hidden'));
}

function niceMax(v) {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  return [1, 2, 2.5, 5, 10].map((m) => m * p).find((m) => m >= v);
}

/** Barras verticais, uma por cenário, com rótulo de valor direto. */
export function barChart({ labels, values, errors, format, unit = '' }) {
  const W = 260;
  const H = 170;
  const pad = { l: 34, r: 8, t: 14, b: 26 };
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', role: 'img' });
  const max = niceMax(Math.max(...values.map((v, i) => v + (errors?.[i] ?? 0))));
  const y = (v) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  for (const g of [0, 0.5, 1]) {
    svg.append(el('line', { x1: pad.l, x2: W - pad.r, y1: y(max * g), y2: y(max * g), stroke: '#33332f', 'stroke-width': 1 }));
    svg.append(el('text', { x: pad.l - 4, y: y(max * g) + 3, 'text-anchor': 'end', fill: '#8d8c84', 'font-size': 9 }, format(max * g)));
  }
  const bw = (W - pad.l - pad.r) / values.length;
  values.forEach((v, i) => {
    const x = pad.l + i * bw + bw * 0.2;
    const w = bw * 0.6;
    const top = y(v);
    const bottom = y(0);
    const h = Math.max(bottom - top, 0.5);
    const r = Math.min(4, h, w / 2);
    const path = `M${x},${bottom} V${top + r} Q${x},${top} ${x + r},${top} H${x + w - r} Q${x + w},${top} ${x + w},${top + r} V${bottom} Z`;
    svg.append(el('path', { d: path, fill: SERIES_COLORS[i] }));
    if (errors) {
      const e = errors[i];
      const cx = x + w / 2;
      svg.append(el('line', { x1: cx, x2: cx, y1: y(Math.min(max, v + e)), y2: y(Math.max(0, v - e)), stroke: '#c3c2b7', 'stroke-width': 1 }));
    }
    const labelY = errors ? y(Math.min(max, v + errors[i])) : top;
    svg.append(el('text', { x: x + w / 2 + (errors ? 9 : 0), y: labelY - 4, 'text-anchor': errors ? 'start' : 'middle', fill: '#ffffff', 'font-size': 10 }, format(v)));
    svg.append(el('text', { x: x + w / 2, y: H - 10, 'text-anchor': 'middle', fill: '#c3c2b7', 'font-size': 9 }, String(i + 1)));
    const hit = el('rect', { x: pad.l + i * bw, y: pad.t, width: bw, height: H - pad.t - pad.b, fill: 'transparent' });
    attachTooltip(hit, `<b>${labels[i]}</b><br>${format(v)}${unit}${errors ? ` ± ${format(errors[i])}` : ''}`);
    svg.append(hit);
  });
  return svg;
}

/** Curvas: tempo até a fuga por episódio, uma série por cenário. */
export function lineChart({ labels, series, maxTime }) {
  const W = 1040;
  const H = 260;
  const pad = { l: 38, r: 12, t: 12, b: 28 };
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', role: 'img' });
  const n = Math.max(...series.map((s) => s.length));
  const x = (i) => pad.l + (n <= 1 ? 0 : (i / (n - 1)) * (W - pad.l - pad.r));
  const y = (v) => pad.t + (1 - v / maxTime) * (H - pad.t - pad.b);
  for (const g of [0, 0.25, 0.5, 0.75, 1]) {
    svg.append(el('line', { x1: pad.l, x2: W - pad.r, y1: y(maxTime * g), y2: y(maxTime * g), stroke: '#33332f' }));
    svg.append(el('text', { x: pad.l - 4, y: y(maxTime * g) + 3, 'text-anchor': 'end', fill: '#8d8c84', 'font-size': 9 }, `${Math.round(maxTime * g)}`));
  }
  for (let i = 0; i < n; i++) svg.append(el('text', { x: x(i), y: H - 10, 'text-anchor': 'middle', fill: '#8d8c84', 'font-size': 9 }, String(i + 1)));
  svg.append(el('text', { x: W - pad.r, y: H - 1, 'text-anchor': 'end', fill: '#8d8c84', 'font-size': 9 }, 'episódio'));
  series.forEach((s, k) => {
    const pts = s.map((r, i) => `${x(i)},${y(r.value)}`).join(' ');
    svg.append(el('polyline', { points: pts, fill: 'none', stroke: SERIES_COLORS[k], 'stroke-width': 2, 'stroke-linejoin': 'round' }));
    s.forEach((r, i) => {
      const dot = el('circle', { cx: x(i), cy: y(r.value), r: 4, fill: r.escaped ? SERIES_COLORS[k] : 'var(--surface-1)', stroke: SERIES_COLORS[k], 'stroke-width': 2 });
      svg.append(dot);
      const hit = el('circle', { cx: x(i), cy: y(r.value), r: 9, fill: 'transparent' });
      attachTooltip(hit, `<b>${labels[k]}</b> · ep. ${i + 1}<br>${r.escaped ? `fugiu em ${r.value.toFixed(1)} s` : `não fugiu (${maxTime} s)`}<br>tentativas ${r.attempts} · colisões ${r.collisions}`);
      svg.append(hit);
    });
  });
  return svg;
}
