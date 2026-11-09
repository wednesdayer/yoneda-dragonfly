// Visualizações do processamento: rosa de alternativas (vista de cima) e campo visual (retina).

export function drawPolar(canvas, snap) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const c = W / 2;
  const R = c - 14;
  ctx.clearRect(0, 0, W, W);
  ctx.strokeStyle = '#33332f';
  ctx.lineWidth = 1;
  for (const r of [R / 3, (2 * R) / 3, R]) {
    ctx.beginPath();
    ctx.arc(c, c, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = '#8d8c84';
  ctx.font = '10px system-ui';
  ctx.fillText('N', c - 3, 10);
  const d = snap.lastDecision;
  if (!d) return;
  const alts = d.alternatives;
  const maxP = Math.max(...alts.map((a) => a.p));
  const uMin = Math.min(...alts.map((a) => a.u));
  const uMax = Math.max(...alts.map((a) => a.u));
  alts.forEach((a, i) => {
    const h = Math.hypot(a.dir[0], a.dir[2]) || 1;
    const len = R * (0.12 + 0.88 * (a.p / maxP));
    const t = (a.u - uMin) / Math.max(uMax - uMin, 1e-6);
    ctx.strokeStyle = i === d.chosenIndex ? '#ffffff' : `rgba(57,135,229,${0.15 + 0.75 * t})`;
    ctx.lineWidth = i === d.chosenIndex ? 3 : 2;
    ctx.beginPath();
    ctx.moveTo(c, c);
    ctx.lineTo(c + (a.dir[0] / h) * len, c + (a.dir[2] / h) * len);
    ctx.stroke();
    if (a.source === 'memória') {
      ctx.fillStyle = '#c98500';
      ctx.beginPath();
      ctx.arc(c + (a.dir[0] / h) * len, c + (a.dir[2] / h) * len, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

export function altsTable(snap) {
  const d = snap.lastDecision;
  if (!d) return '';
  const rows = d.alternatives
    .map((a, i) => ({ a, i }))
    .sort((x, y) => y.a.p - x.a.p)
    .slice(0, 5)
    .map(({ a, i }) => {
      const az = ((Math.atan2(a.dir[0], -a.dir[2]) * 180) / Math.PI + 360) % 360;
      const el = (Math.asin(a.dir[1]) * 180) / Math.PI;
      return `${i === d.chosenIndex ? '▶' : ' '} ${az.toFixed(0).padStart(3)}° ${el >= 0 ? '+' : ''}${el.toFixed(0).padStart(2)}°  U=${a.u.toFixed(2).padStart(5)}  p=${a.p.toFixed(2)}  ${a.source}`;
    });
  return [`${d.alternatives.length} alternativas · motivo:`, `  ${d.reason}`, ...rows].join('\n');
}

export function drawRetina(canvas, packet) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  ctx.fillStyle = '#161615';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#33332f';
  ctx.beginPath();
  ctx.moveTo(W / 2, 0);
  ctx.lineTo(W / 2, H);
  ctx.moveTo(0, H / 2);
  ctx.lineTo(W, H / 2);
  ctx.stroke();
  ctx.fillStyle = '#8d8c84';
  ctx.font = '9px system-ui';
  ctx.fillText('frente', W / 2 + 3, 10);
  if (!packet) return;
  for (const r of packet.rays) {
    if (!r.local) continue;
    const az = Math.atan2(r.local[2], r.local[0]);
    const el = Math.asin(Math.max(-1, Math.min(1, r.local[1])));
    const x = W / 2 + (az / Math.PI) * (W / 2);
    const y = H / 2 - (el / (Math.PI / 2)) * (H / 2);
    if (!r.valid) {
      ctx.strokeStyle = '#e66767';
      ctx.beginPath();
      ctx.moveTo(x - 3, y - 3);
      ctx.lineTo(x + 3, y + 3);
      ctx.moveTo(x + 3, y - 3);
      ctx.lineTo(x - 3, y + 3);
      ctx.stroke();
      continue;
    }
    const l = Math.min(r.lum / 1.3, 1);
    const g = Math.round(40 + 215 * l);
    ctx.fillStyle = `rgb(${g},${Math.round(g * 0.92)},${Math.round(g * 0.6)})`;
    ctx.beginPath();
    ctx.arc(x, y, 3.2, 0, Math.PI * 2);
    ctx.fill();
    if (r.dist === null) {
      ctx.strokeStyle = '#7fd8ff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}
