// Física ambiental que os sensores amostram: óptica (luz, sombra, céu) e corrente de ar.
// Tudo é calculado a partir do mundo físico — nada aqui é entregue diretamente à mente.

import * as CANNON from 'cannon-es';
import { GROUP } from './physics-world.js';
import { add, scale, dot, sub, len, norm } from './math.js';

const SKY_BASE = 0.5;
const AMBIENT = 0.14;
const SHADOW_CACHE_RES = 0.25;
const WIND_RANGE = 4; // m — escala de decaimento da corrente
const WIND_LEAK = 0.1; // fração que contorna obstáculos

export function createEnvironment(phys, spec, shadowCache = new Map()) {
  const { world } = phys;
  const sun = spec.sunDir;
  const result = new CANNON.RaycastResult();
  const from = new CANNON.Vec3();
  const to = new CANNON.Vec3();

  /** Raio físico. includeGlass=false modela visão (vidro é transparente). */
  function raycast(origin, dir, range, includeGlass) {
    from.set(origin[0], origin[1], origin[2]);
    to.set(origin[0] + dir[0] * range, origin[1] + dir[1] * range, origin[2] + dir[2] * range);
    result.reset();
    const mask = includeGlass ? GROUP.STATIC | GROUP.GLASS : GROUP.STATIC;
    const hit = world.raycastClosest(from, to, { collisionFilterMask: mask, collisionFilterGroup: GROUP.VISION_RAY, skipBackfaces: true }, result);
    if (!hit) return null;
    const p = result.hitPointWorld;
    const n = result.hitNormalWorld;
    return { distance: result.distance, point: [p.x, p.y, p.z], normal: [n.x, n.y, n.z], body: result.body };
  }

  /** Um ponto recebe sol direto? (raio de sombra; o mundo é estático, então cacheamos). */
  function sunlit(point, normal) {
    const key = `${Math.round(point[0] / SHADOW_CACHE_RES)},${Math.round(point[1] / SHADOW_CACHE_RES)},${Math.round(point[2] / SHADOW_CACHE_RES)},${normal.map((x) => Math.round(x)).join('')}`;
    const cached = shadowCache.get(key);
    if (cached !== undefined) return cached;
    const origin = add(point, scale(normal, 0.02));
    const lit = dot(normal, sun) > 0 && raycast(origin, sun, 80, false) === null;
    shadowCache.set(key, lit);
    return lit;
  }

  /** Luminância do céu numa direção (inclui o disco/halo do sol). */
  function skyLuminance(dir) {
    const s = Math.max(0, dot(dir, sun));
    return SKY_BASE + 0.25 * Math.max(0, dir[1]) + 0.9 * s ** 24 + 0.25 * s ** 4;
  }

  /** Radiância refletida por uma superfície (modelo difuso: ambiente + sol direto). */
  function surfaceLuminance(hit) {
    const albedo = hit.body.userData?.albedo ?? 0.5;
    const direct = sunlit(hit.point, hit.normal) ? Math.max(0, dot(hit.normal, sun)) : 0;
    const skyFill = 0.1 * Math.max(0, hit.normal[1]);
    return albedo * (AMBIENT + skyFill + 1.1 * direct);
  }

  /**
   * Corrente de ar: aberturas reais drenam ar para fora (vidros não). É um campo LOCAL:
   * decai com a distância e é bloqueado por obstáculos (paredes, colunas, vidros) entre o
   * ponto e a abertura — atrás de um obstáculo resta só um vazamento difuso fraco.
   * Por isso não funciona como "bússola para a saída" a partir de qualquer lugar.
   */
  function windAt(p, t) {
    let w = [0, 0, 0];
    for (const o of spec.openings) {
      const toO = sub(o.center, p);
      const d = len(toO);
      const beyond = dot(sub(p, o.center), o.outward) > 0;
      const dir = beyond ? o.outward : norm(toO);
      const blocked = !beyond && d > 1 && raycast(p, dir, d - 0.8, true) !== null;
      const strength = ((blocked ? WIND_LEAK : 1) * 0.45 * Math.sqrt(o.area)) / (1 + (d / WIND_RANGE) ** 2);
      w = add(w, scale(dir, strength));
    }
    const turb = 0.06;
    return [
      w[0] + turb * Math.sin(0.7 * t + p[2] * 0.9),
      w[1] + turb * Math.sin(1.1 * t + p[0] * 0.7),
      w[2] + turb * Math.cos(0.9 * t + p[1] * 0.8),
    ];
  }

  return { raycast, sunlit, skyLuminance, surfaceLuminance, windAt };
}
