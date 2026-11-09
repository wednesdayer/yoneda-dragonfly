// Mapa espacial da libélula visto de cima — é o conteúdo da memória dela, no referencial dela.
// Sobreposições do experimentador (verdade física) aparecem tracejadas para comparação.

const COLORS = {
  bg: '#161615',
  unknown: [22, 22, 21],
  free: [66, 66, 61],
  occ: [226, 222, 208],
  visit: [57, 135, 229],
  light: [201, 133, 0],
  est: '#3987e5',
  truth: 'rgba(245,245,240,0.55)',
  fail: '#e66767',
  cand: '#c98500',
  heading: '#ffffff',
  fov: 'rgba(255,255,255,0.07)',
};

export const MAP_LEGEND = [
  ['rgb(22,22,21)', 'desconhecido'],
  ['rgb(66,66,61)', 'livre (crença)'],
  ['rgb(226,222,208)', 'ocupado (crença)'],
  ['rgb(57,135,229)', 'visitado'],
  [COLORS.fail, 'fracasso'],
  [COLORS.cand, 'candidato a saída'],
  [COLORS.truth, 'trajetória real'],
];

const VIEW = 40; // metros visíveis

export function createMindMap(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const img = ctx.createImageData(W, W);
  let center = [-8, 0];

  const toPx = (x, z) => [((x - center[0]) / VIEW + 0.5) * W, ((z - center[1]) / VIEW + 0.5) * W];

  function drawGrid(sl) {
    const data = img.data;
    const scale = VIEW / W;
    for (let py = 0; py < W; py++) {
      const z = center[1] + (py / W - 0.5) * VIEW;
      const cz = Math.floor((z - sl.origin[2]) / sl.cell);
      for (let px = 0; px < W; px++) {
        const x = center[0] + (px * scale - VIEW / 2);
        const cx = Math.floor((x - sl.origin[0]) / sl.cell);
        let c = COLORS.unknown;
        if (cx >= 0 && cz >= 0 && cx < sl.w && cz < sl.h) {
          const j = cz * sl.w + cx;
          if (sl.known[j]) {
            const p = sl.occ[j];
            if (p > 0.6) c = mix(COLORS.free, COLORS.occ, Math.min(1, (p - 0.6) / 0.35));
            else c = COLORS.free;
            if (sl.light[j] > 0.45 && p > 0.6) c = mix(c, COLORS.light, Math.min(1, (sl.light[j] - 0.45) * 1.5));
          }
          if (sl.vis[j]) c = mix(c, COLORS.visit, Math.min(0.75, 0.25 + sl.vis[j] / 60));
        }
        const k = (py * W + px) * 4;
        data[k] = c[0];
        data[k + 1] = c[1];
        data[k + 2] = c[2];
        data[k + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  function polyline(pts, color, dashed) {
    if (pts.length < 2) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    if (dashed) ctx.setLineDash([4, 3]);
    ctx.beginPath();
    pts.forEach((p, i) => {
      const [x, y] = toPx(p[0], p[2]);
      if (i) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    });
    ctx.stroke();
    ctx.restore();
  }

  function drawPerceptOnly(snap) {
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, W, W);
    ctx.fillStyle = 'rgba(226,222,208,0.8)';
    for (const o of snap.percept?.obstacles ?? []) {
      const [x, y] = toPx(o.point[0], o.point[2]);
      ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
    }
    ctx.fillStyle = '#8d8c84';
    ctx.font = '12px system-ui';
    ctx.fillText('Sem memória de longo prazo: só o que é percebido agora.', 10, W - 12);
  }

  function draw(snap, ep, fovHalfDeg) {
    const pos = snap.poseEstimate;
    center = [center[0] + (pos[0] - center[0]) * 0.05, center[1] + (pos[2] - center[1]) * 0.05];
    if (snap.memory) drawGrid(snap.memory.slice(pos[1], 2));
    else drawPerceptOnly(snap);

    // Campo de visão (projeção horizontal).
    const f = snap.percept?.pose.forward ?? [1, 0, 0];
    const yaw = Math.atan2(f[2], f[0]);
    const half = Math.min((fovHalfDeg * Math.PI) / 180, Math.PI);
    const [ox, oy] = toPx(pos[0], pos[2]);
    ctx.fillStyle = COLORS.fov;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.arc(ox, oy, (snap.percept?.range ?? 10) / VIEW * W, yaw - half, yaw + half);
    ctx.closePath();
    ctx.fill();

    polyline(ep.truthTrail.map((p) => p.map((x, i) => x - ep.start[i])), COLORS.truth, true);
    polyline(snap.trail, COLORS.est, false);

    if (snap.memory) {
      for (const c of snap.memory.candidates()) {
        const [x, y] = toPx(c.pos[0], c.pos[2]);
        ctx.strokeStyle = COLORS.cand;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.stroke();
        if (c.failures) {
          ctx.fillStyle = COLORS.fail;
          ctx.font = 'bold 10px system-ui';
          ctx.fillText(`✕${c.failures}`, x + 7, y - 5);
        }
      }
      ctx.strokeStyle = COLORS.fail;
      ctx.lineWidth = 2;
      for (const fl of snap.memory.failures()) {
        const [x, y] = toPx(fl.pos[0], fl.pos[2]);
        const s = 3 + Math.min(fl.count, 6);
        ctx.beginPath();
        ctx.moveTo(x - s, y - s);
        ctx.lineTo(x + s, y + s);
        ctx.moveTo(x + s, y - s);
        ctx.lineTo(x - s, y + s);
        ctx.stroke();
      }
    }
    if (snap.attempt) {
      const [x, y] = toPx(snap.attempt.target[0], snap.attempt.target[2]);
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = '#ffd27a';
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    // Libélula e rumo escolhido.
    const h = snap.heading;
    ctx.strokeStyle = COLORS.heading;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + h[0] * 18, oy + h[2] * 18);
    ctx.stroke();
    ctx.fillStyle = COLORS.heading;
    ctx.beginPath();
    ctx.arc(ox, oy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8d8c84';
    ctx.font = '11px system-ui';
    ctx.fillText(`fatia em y≈${pos[1].toFixed(0)} m (±2) · ${VIEW} m de lado · N ↑`, 8, 14);
  }

  return { draw };
}

function mix(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}
