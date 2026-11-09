import { describe, it, expect } from 'vitest';
import { splitRectWithHoles, rectToBox } from '../src/core/wall-builder.js';
import { buildTempleSpec, isOutsideTemple } from '../src/core/temple-spec.js';
import { buildPhysicsWorld } from '../src/core/physics-world.js';
import { createEnvironment } from '../src/core/environment.js';
import { createSensors, eyeDirections, FULL_SENSORS } from '../src/core/sensors.js';
import { createRng, fibonacciSphere, rotateByQuat, len, angleBetween } from '../src/core/math.js';

const area = (r) => (r.u1 - r.u0) * (r.v1 - r.v0);

describe('wall-builder', () => {
  it('preserva a área sólida e não cobre os furos', () => {
    const rect = { u0: 0, u1: 10, v0: 0, v1: 5 };
    const holes = [{ u0: 2, u1: 4, v0: 1, v1: 3 }, { u0: 6, u1: 8, v0: 2, v1: 5 }];
    const parts = splitRectWithHoles(rect, holes);
    const solid = parts.reduce((s, r) => s + area(r), 0);
    expect(solid).toBeCloseTo(area(rect) - holes.reduce((s, h) => s + area(h), 0), 6);
    for (const p of parts) {
      for (const h of holes) {
        const overlap = Math.max(0, Math.min(p.u1, h.u1) - Math.max(p.u0, h.u0)) * Math.max(0, Math.min(p.v1, h.v1) - Math.max(p.v0, h.v0));
        expect(overlap).toBeCloseTo(0, 9);
      }
    }
  });

  it('retângulo sem furos vira uma única peça', () => {
    expect(splitRectWithHoles({ u0: 0, u1: 3, v0: 0, v1: 2 }, [])).toHaveLength(1);
  });

  it('converte para caixas nos três eixos', () => {
    const r = { u0: 0, u1: 2, v0: 0, v1: 4 };
    expect(rectToBox('z', 5, 1, r)).toEqual({ center: [1, 2, 5], half: [1, 2, 0.5] });
    expect(rectToBox('x', 5, 1, r)).toEqual({ center: [5, 2, 1], half: [0.5, 2, 1] });
    expect(rectToBox('y', 5, 1, r)).toEqual({ center: [1, 5, 2], half: [1, 0.5, 2] });
  });
});

describe('templo', () => {
  const spec = buildTempleSpec();
  it('tem saídas reais e vidros-armadilha', () => {
    expect(spec.openings.map((o) => o.id).sort()).toEqual(['janela-norte-aberta', 'oculo-teto']);
    expect(spec.glass.length).toBeGreaterThanOrEqual(4);
    expect(spec.solids.filter((s) => s.kind === 'column')).toHaveLength(10);
  });
  it('detecta quando um ponto está fora do templo', () => {
    expect(isOutsideTemple([0, 5, 0])).toBe(false);
    expect(isOutsideTemple([0, 5, -13])).toBe(true);
    expect(isOutsideTemple([0, 14.5, 0])).toBe(true);
  });
});

describe('óptica e sensores', () => {
  const spec = buildTempleSpec();
  const phys = buildPhysicsWorld(spec);
  const env = createEnvironment(phys, spec);
  const glass = spec.glass.find((g) => g.id === 'vitral-sul-centro');
  const origin = [glass.center[0], glass.center[1], 5];

  it('a visão atravessa o vidro, mas o vidro é sólido para o toque', () => {
    expect(env.raycast(origin, [0, 0, 1], 30, false)).toBeNull();
    const touch = env.raycast(origin, [0, 0, 1], 30, true);
    expect(touch.body.userData.kind).toBe('vidro');
  });

  it('o céu na direção do sol é mais claro que uma parede na sombra', () => {
    const wall = env.raycast([0, 3, 0], [-1, 0, 0], 40, false);
    expect(env.skyLuminance(spec.sunDir)).toBeGreaterThan(env.surfaceLuminance(wall));
  });

  it('há corrente de ar rumo às aberturas reais e nenhuma informação de vidro', () => {
    const near = spec.openings[0].center;
    const p = [near[0], near[1] - 1, near[2] + 2];
    const w = env.windAt(p, 0);
    expect(len(w)).toBeGreaterThan(0.1);
  });

  it('a corrente é local: obstáculos entre o ponto e a abertura a bloqueiam', () => {
    // Atrás da iconóstase (x=-7.5, |z|<3) em relação à janela norte, do lado leste.
    const free = len(env.windAt([-11, 8, -8], 0));
    const farEast = len(env.windAt([12, 3, 6], 0));
    expect(free).toBeGreaterThan(0.3);
    expect(farEast).toBeLessThan(free / 2);
  });

  it('o pacote sensorial não carrega rótulos semânticos', () => {
    const sensors = createSensors(FULL_SENSORS, env, createRng(1));
    const pkt = sensors.read({ position: [0, 3, 0], quat: { x: 0, y: 0, z: 0, w: 1 }, velocity: [0, 0, 0], wind: [0, 0, 0] }, 0, [{ normal: [0, 1, 0], impact: 1, kind: 'vidro', id: 'x' }]);
    expect(pkt.rays).toHaveLength(FULL_SENSORS.rays);
    expect(Object.keys(pkt.contacts[0]).sort()).toEqual(['impact', 'normal']);
    const json = JSON.stringify(pkt);
    for (const word of ['vidro', 'janela', 'oculo', 'parede']) expect(json).not.toContain(word);
  });

  it('olhos respeitam o campo de visão', () => {
    const eyes = eyeDirections(28, 55);
    expect(eyes).toHaveLength(28);
    for (const e of eyes) expect(angleBetween(e, [1, 0, 0])).toBeLessThanOrEqual((55 * Math.PI) / 180 + 1e-9);
  });
});

describe('math', () => {
  it('rng é determinístico', () => {
    const a = createRng(7);
    const b = createRng(7);
    expect([a.next(), a.next()]).toEqual([b.next(), b.next()]);
  });
  it('fibonacciSphere gera vetores unitários', () => {
    for (const d of fibonacciSphere(50)) expect(len(d)).toBeCloseTo(1, 9);
  });
  it('rotação por quatérnio de 90° em Y', () => {
    const s = Math.SQRT1_2;
    const r = rotateByQuat([1, 0, 0], { x: 0, y: s, z: 0, w: s });
    expect(r[0]).toBeCloseTo(0, 9);
    expect(r[2]).toBeCloseTo(-1, 9);
  });
});
