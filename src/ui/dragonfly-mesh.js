// Modelo visual da libélula (ampliado 6× para ficar visível no templo).
// As asas batem apenas visualmente; a física usa o corpo rígido do cannon-es.

import * as THREE from 'three';

const VISUAL_SCALE = 6;

export function createDragonflyMesh() {
  const group = new THREE.Group();
  const body = new THREE.Group();
  group.add(body);
  const chitin = new THREE.MeshStandardMaterial({ color: 0x1f8f8a, roughness: 0.35, metalness: 0.4 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1e3c8c, roughness: 0.2, metalness: 0.3 });

  const abdomen = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.11, 8), chitin);
  abdomen.rotation.z = Math.PI / 2;
  abdomen.position.x = -0.065;
  const thorax = new THREE.Mesh(new THREE.SphereGeometry(0.017, 12, 10), chitin);
  thorax.scale.set(1.4, 1, 1);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.013, 12, 10), chitin);
  head.position.x = 0.026;
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.009, 10, 8), eyeMat);
  const eyeR = eyeL.clone();
  eyeL.position.set(0.03, 0.004, 0.008);
  eyeR.position.set(0.03, 0.004, -0.008);
  body.add(abdomen, thorax, head, eyeL, eyeR);

  const wingMat = new THREE.MeshStandardMaterial({ color: 0xd8f0ff, transparent: true, opacity: 0.45, side: THREE.DoubleSide, roughness: 0.1, depthWrite: false });
  const wingGeo = new THREE.PlaneGeometry(0.018, 0.075);
  wingGeo.translate(0, 0.0375, 0);
  const wings = [];
  for (const [x, side] of [[0.006, 1], [0.006, -1], [-0.01, 1], [-0.01, -1]]) {
    const pivot = new THREE.Group();
    pivot.position.set(x, 0.01, 0);
    const wing = new THREE.Mesh(wingGeo, wingMat);
    wing.rotation.x = side * Math.PI / 2;
    pivot.add(wing);
    body.add(pivot);
    wings.push({ pivot, side, phase: x > 0 ? 0 : Math.PI * 0.6 });
  }

  group.scale.setScalar(VISUAL_SCALE);
  group.traverse((o) => { o.castShadow = true; });

  function update(p, q, t, resting) {
    group.position.set(p[0], p[1], p[2]);
    group.quaternion.set(q.x, q.y, q.z, q.w);
    const freq = resting ? 6 : 28;
    for (const w of wings) w.pivot.rotation.x = w.side * 0.55 * Math.sin(t * freq + w.phase);
  }

  return { group, update };
}
