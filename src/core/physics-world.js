// Substrato físico: mundo do cannon-es construído a partir da especificação do templo.

import * as CANNON from 'cannon-es';
import { ALBEDO } from './temple-spec.js';

export const GROUP = { STATIC: 1, GLASS: 2, AGENT: 4, VISION_RAY: 8, TOUCH_RAY: 16 };

function makeShape(s) {
  if (s.shape === 'cylinder') return new CANNON.Cylinder(s.radius, s.radius, s.height, 16);
  return new CANNON.Box(new CANNON.Vec3(...s.half));
}

function addStatic(world, s, group, material) {
  const body = new CANNON.Body({ mass: 0, type: CANNON.Body.STATIC, material });
  body.addShape(makeShape(s));
  body.position.set(...s.center);
  body.collisionFilterGroup = group;
  body.collisionFilterMask = -1;
  body.userData = { kind: s.kind, id: s.id ?? s.wall ?? s.kind, albedo: ALBEDO[s.kind] ?? 0.5 };
  world.addBody(body);
  return body;
}

export function buildPhysicsWorld(spec) {
  const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });
  world.broadphase = new CANNON.SAPBroadphase(world);
  world.allowSleep = false;

  const stone = new CANNON.Material('pedra');
  const chitin = new CANNON.Material('quitina');
  world.addContactMaterial(new CANNON.ContactMaterial(stone, chitin, { friction: 0.15, restitution: 0.35 }));

  const statics = spec.solids.map((s) => addStatic(world, s, GROUP.STATIC, stone));
  const glass = spec.glass.map((g) => addStatic(world, g, GROUP.GLASS, stone));

  return { world, statics, glass, materials: { stone, chitin } };
}
