// Corpo físico da libélula: massa, inércia, 6 graus de liberdade e um sistema motor
// (equivalente aos gânglios torácicos) que converte comandos em forças e torques limitados.

import * as CANNON from 'cannon-es';
import { GROUP } from './physics-world.js';
import { clampLen, scale, sub, len, norm, cross, dot, rotateByQuat } from './math.js';

export const BODY_LIMITS = {
  mass: 0.0008, // kg (~0,8 g)
  radius: 0.12, // m — envelope de colisão (corpo + asas)
  maxSpeed: 4.5, // m/s
  maxAccel: 9, // m/s² além da compensação da gravidade
  maxAngAccel: 40, // rad/s²
  velGain: 4, // ganho do controlador de velocidade (1/s)
  dragCoef: 1.6, // arrasto aerodinâmico linear (1/s)
  wingNoise: 0.6, // turbulência do batimento (m/s²)
};

export function createDragonflyBody(phys, env, start, rng, limits = BODY_LIMITS) {
  const { world, materials } = phys;
  const body = new CANNON.Body({ mass: limits.mass, material: materials.chitin, linearDamping: 0.02, angularDamping: 0.6 });
  body.addShape(new CANNON.Sphere(limits.radius));
  body.position.set(...start);
  body.collisionFilterGroup = GROUP.AGENT;
  body.collisionFilterMask = GROUP.STATIC | GROUP.GLASS;
  // Corpo alongado: inércia maior em guinada/arfagem do que em rolagem.
  const m = limits.mass;
  body.inertia.set(m * 0.002, m * 0.006, m * 0.006);
  body.invInertia.set(1 / body.inertia.x, 1 / body.inertia.y, 1 / body.inertia.z);
  body.updateInertiaWorld(true);
  world.addBody(body);

  const contacts = [];
  body.addEventListener('collide', (e) => {
    const c = e.contact;
    const n = c.bi === body ? c.ni.clone().negate() : c.ni.clone();
    const impact = Math.abs(c.getImpactVelocityAlongNormal());
    contacts.push({ normal: [n.x, n.y, n.z], impact, kind: e.body.userData?.kind ?? '?', id: e.body.userData?.id });
  });

  let command = { velocity: [0, 0, 0] };
  let lastWind = [0, 0, 0];

  const position = () => [body.position.x, body.position.y, body.position.z];
  const velocity = () => [body.velocity.x, body.velocity.y, body.velocity.z];
  const quat = () => ({ x: body.quaternion.x, y: body.quaternion.y, z: body.quaternion.z, w: body.quaternion.w });
  const forward = () => rotateByQuat([1, 0, 0], quat());

  /** Comando motor vindo da mente (velocidade desejada no referencial-bússola). */
  function setCommand(cmd) {
    command = { velocity: clampLen(cmd.velocity, limits.maxSpeed) };
  }

  function applyTranslation(t) {
    const v = velocity();
    const wind = env.windAt(position(), t);
    lastWind = wind;
    const aCtrl = clampLen(scale(sub(command.velocity, v), limits.velGain), limits.maxAccel);
    const aNoise = [rng.gauss(), rng.gauss(), rng.gauss()].map((x) => x * limits.wingNoise);
    const aDrag = scale(sub(wind, v), limits.dragCoef);
    const lift = [0, 9.82, 0];
    const a = [0, 1, 2].map((i) => aCtrl[i] + aNoise[i] + aDrag[i] + lift[i]);
    body.applyForce(new CANNON.Vec3(...scale(a, limits.mass)));
  }

  function applyRotation() {
    // Alinha o eixo do corpo à direção de voo e mantém o dorso para cima (com inclinação nas curvas).
    const v = command.velocity;
    const horiz = [v[0], 0.35 * v[1], v[2]];
    const desiredFwd = len(horiz) > 0.2 ? norm(horiz) : forward();
    const f = forward();
    const up = rotateByQuat([0, 1, 0], quat());
    const yawErr = cross(f, desiredFwd);
    const rollErr = cross(up, [0, 1, 0]);
    const w = body.angularVelocity;
    const kp = 30;
    const kd = 9;
    const alpha = [0, 1, 2].map((i) => kp * (yawErr[i] + 0.6 * rollErr[i]) - kd * [w.x, w.y, w.z][i]);
    const a = clampLen(alpha, limits.maxAngAccel);
    const I = limits.mass * 0.006;
    body.applyTorque(new CANNON.Vec3(...scale(a, I)));
    if (dot(f, desiredFwd) < -0.95) body.applyTorque(new CANNON.Vec3(0, I * limits.maxAngAccel * 0.5, 0));
  }

  function prePhysics(t) {
    applyTranslation(t);
    applyRotation();
  }

  function drainContacts() {
    return contacts.splice(0, contacts.length);
  }

  return {
    body,
    limits,
    position,
    velocity,
    quat,
    forward,
    setCommand,
    prePhysics,
    drainContacts,
    lastWind: () => lastWind,
    command: () => command,
    speed: () => len(velocity()),
    clampSpeed() {
      const v = velocity();
      const s = len(v);
      const max = limits.maxSpeed * 1.4;
      if (s > max) body.velocity.scale(max / s, body.velocity);
    },
  };
}
