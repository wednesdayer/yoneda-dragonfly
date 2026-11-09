// Renderização 3D (three.js) do ambiente físico e de sobreposições do estado computacional.
// Apenas lê o estado do episódio; não interfere na simulação.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createDragonflyMesh } from './dragonfly-mesh.js';

const STONE = { parede: 0xcdbd9c, teto: 0xb9aa8c, column: 0xe2d6bd, altar: 0xe9e1cf, iconostase: 0x8a6a45, bloco: 0xa89a80, lustre: 0x5a4a32 };
const MAX_RAYS = 160;
const MARKER = {
  failGeo: new THREE.OctahedronGeometry(0.3),
  failMat: new THREE.MeshBasicMaterial({ color: 0xe66767 }),
  ringGeo: new THREE.TorusGeometry(0.45, 0.04, 6, 20),
  ringMat: new THREE.MeshBasicMaterial({ color: 0xc98500 }),
  ringFailMat: new THREE.MeshBasicMaterial({ color: 0xa05050 }),
};

function solidMesh(s) {
  const geo = s.shape === 'cylinder'
    ? new THREE.CylinderGeometry(s.radius, s.radius * 1.05, s.height, 28)
    : new THREE.BoxGeometry(s.half[0] * 2, s.half[1] * 2, s.half[2] * 2);
  const color = s.kind === 'piso' ? 0x55703f : STONE[s.kind] ?? 0xc0b090;
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.92, metalness: 0 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(...s.center);
  mesh.castShadow = s.kind !== 'piso';
  mesh.receiveShadow = true;
  return mesh;
}

export function createScene(container, spec) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x8fb6dc);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 400);
  camera.position.set(26, 30, 34);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 4, 0);
  controls.enableDamping = true;

  // Luz: sol (direcional, com sombras) + céu (hemisférica).
  const sunPos = new THREE.Vector3(...spec.sunDir).multiplyScalar(70);
  const sun = new THREE.DirectionalLight(0xfff1d6, 3.2);
  sun.position.copy(sunPos);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 10, far: 160 });
  sun.shadow.bias = -0.0005;
  scene.add(sun, new THREE.HemisphereLight(0xbcd6f0, 0x6b5a40, 1.1));
  const sunDisk = new THREE.Mesh(new THREE.SphereGeometry(3, 24, 16), new THREE.MeshBasicMaterial({ color: 0xfff6cf }));
  sunDisk.position.copy(new THREE.Vector3(...spec.sunDir).multiplyScalar(150));
  scene.add(sunDisk);

  const roofMeshes = [];
  for (const s of spec.solids) {
    const m = solidMesh(s);
    scene.add(m);
    if (s.kind === 'teto') roofMeshes.push(m);
  }
  const marble = new THREE.Mesh(
    new THREE.PlaneGeometry(spec.interior.x[1] - spec.interior.x[0], spec.interior.z[1] - spec.interior.z[0]),
    new THREE.MeshStandardMaterial({ color: 0xbfb39b, roughness: 0.6 }),
  );
  marble.rotation.x = -Math.PI / 2;
  marble.position.y = 0.01;
  marble.receiveShadow = true;
  scene.add(marble);

  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xcfe9ff, transparent: true, opacity: 0.22, roughness: 0.05, metalness: 0, depthWrite: false });
  for (const g of spec.glass) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(g.half[0] * 2, g.half[1] * 2, g.half[2] * 2), glassMat);
    mesh.position.set(...g.center);
    scene.add(mesh);
  }

  const dragonfly = createDragonflyMesh();
  scene.add(dragonfly.group);

  // Raios sensoriais.
  const rayGeo = new THREE.BufferGeometry();
  rayGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX_RAYS * 6), 3));
  rayGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(MAX_RAYS * 6), 3));
  const rays = new THREE.LineSegments(rayGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.55 }));
  rays.frustumCulled = false;
  scene.add(rays);

  // Trajetórias: verdade física (branca) e estimativa interna (azul).
  const mkLine = (color, dashed) => {
    const mat = dashed ? new THREE.LineDashedMaterial({ color, dashSize: 0.4, gapSize: 0.25 }) : new THREE.LineBasicMaterial({ color });
    const line = new THREE.Line(new THREE.BufferGeometry(), mat);
    line.frustumCulled = false;
    scene.add(line);
    return line;
  };
  const trueTrail = mkLine(0xf5f5f0, false);
  const estTrail = mkLine(0x3987e5, true);

  // Mapa mental 3D: células com crença de ocupação + marcas de fracasso e candidatos.
  const mindGroup = new THREE.Group();
  scene.add(mindGroup);
  const cellMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), new THREE.MeshBasicMaterial({ color: 0x3987e5, transparent: true, opacity: 0.16, depthWrite: false }), 6000);
  cellMesh.count = 0;
  mindGroup.add(cellMesh);
  const markers = new THREE.Group();
  mindGroup.add(markers);
  const target = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.06, 8, 24), new THREE.MeshBasicMaterial({ color: 0xffc94d }));
  scene.add(target);

  let windGroup = null;

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / Math.max(h, 1);
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(container);
  resize();

  const toVec = (a) => new THREE.Vector3(a[0], a[1], a[2]);

  function updateRays(packet, origin) {
    const pos = rayGeo.attributes.position.array;
    const col = rayGeo.attributes.color.array;
    const n = packet ? Math.min(packet.rays.length, MAX_RAYS) : 0;
    for (let i = 0; i < n; i++) {
      const r = packet.rays[i];
      const d = r.valid ? r.dist ?? packet.range : 0.3;
      const o = i * 6;
      pos.set([origin[0], origin[1], origin[2], origin[0] + r.dir[0] * d, origin[1] + r.dir[1] * d, origin[2] + r.dir[2] * d], o);
      const l = Math.min(r.lum, 1.4) / 1.4;
      const c = !r.valid ? [0.5, 0.15, 0.15] : r.dist === null ? [0.35 + 0.6 * l, 0.85, 1] : [0.25 + 0.75 * l, 0.22 + 0.68 * l, 0.15 + 0.2 * l];
      col.set([...c, ...c], o);
    }
    rayGeo.setDrawRange(0, n * 2);
    rayGeo.attributes.position.needsUpdate = true;
    rayGeo.attributes.color.needsUpdate = true;
  }

  function setLine(line, pts) {
    line.geometry.dispose();
    line.geometry = new THREE.BufferGeometry().setFromPoints(pts.map(toVec));
    if (line.material.isLineDashedMaterial) line.computeLineDistances();
  }

  function updateMind(snap, start) {
    const memory = snap.memory;
    const m = new THREE.Matrix4();
    const cells = memory ? memory.occupiedCells() : [];
    cells.forEach((c, i) => {
      m.makeTranslation(c[0] + start[0], c[1] + start[1], c[2] + start[2]);
      cellMesh.setMatrixAt(i, m);
    });
    cellMesh.count = cells.length;
    cellMesh.instanceMatrix.needsUpdate = true;

    markers.clear(); // geometrias e materiais são compartilhados: nada a liberar
    if (!memory) return;
    for (const f of memory.failures()) {
      const s = new THREE.Mesh(MARKER.failGeo, MARKER.failMat);
      s.scale.setScalar(1 + 0.27 * Math.min(f.count, 6));
      s.position.set(f.pos[0] + start[0], f.pos[1] + start[1], f.pos[2] + start[2]);
      markers.add(s);
    }
    for (const c of memory.candidates()) {
      const ring = new THREE.Mesh(MARKER.ringGeo, c.failures ? MARKER.ringFailMat : MARKER.ringMat);
      ring.position.set(c.pos[0] + start[0], c.pos[1] + start[1], c.pos[2] + start[2]);
      ring.lookAt(camera.position);
      markers.add(ring);
    }
  }

  function update(ep, opts) {
    const p = ep.body.position();
    const q = ep.body.quat();
    dragonfly.update(p, q, performance.now() / 1000, ep.isDone());
    rays.visible = opts.rays;
    if (opts.rays) updateRays(ep.lastPacket(), p);
    trueTrail.visible = estTrail.visible = opts.trail;
    if (opts.wind && !windGroup) {
      windGroup = buildWindArrows(spec, ep.env.windAt);
      scene.add(windGroup);
    }
    if (windGroup) windGroup.visible = opts.wind;
    mindGroup.visible = opts.mind;
    for (const r of roofMeshes) r.material.colorWrite = r.material.depthWrite = opts.roof;
    const snap = ep.agent.snapshot();
    target.visible = !!snap.attempt;
    if (snap.attempt) {
      target.position.set(...snap.attempt.target.map((x, i) => x + ep.start[i]));
      target.lookAt(camera.position);
    }
    if (opts.follow) controls.target.lerp(toVec(p), 0.08);
    controls.update();
    renderer.render(scene, camera);
  }

  function updateSlow(ep) {
    setLine(trueTrail, [...ep.truthTrail, ep.body.position()]);
    const snap = ep.agent.snapshot();
    setLine(estTrail, snap.trail.map((pt) => pt.map((x, i) => x + ep.start[i])));
    updateMind(snap, ep.start);
  }

  return { update, updateSlow, resize };
}

/** Setas amostradas do campo de vento físico real (o mesmo que o corpo sente). */
function buildWindArrows(spec, windAt) {
  const group = new THREE.Group();
  const { x, z } = spec.interior;
  for (const y of [3, 8]) {
    for (let px = x[0] + 1; px < x[1]; px += 2.5) {
      for (let pz = z[0] + 1; pz < z[1]; pz += 2.5) {
        const w = windAt([px, y, pz], 0);
        const mag = Math.hypot(...w);
        if (mag < 0.09) continue;
        group.add(new THREE.ArrowHelper(new THREE.Vector3(...w).normalize(), new THREE.Vector3(px, y, pz), 0.3 + mag * 4, 0x7fd8ff, 0.22, 0.13));
      }
    }
  }
  return group;
}
