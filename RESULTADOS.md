# Resultados de referência

Gerado com `npm run experiment -- 10 180 100` (10 episódios por cenário, limite de 180 s,
sementes 100–109). Os dados brutos estão em `resultados/`.

## Interpretação

- **A memória reduz a repetição de erros.** As tentativas fracassadas caem de 56 para 33
  e os toques no vidro de 52 para 27. Sem memória, a libélula volta ao mesmo vitral
  ensolarado sem parar, como um inseto real numa janela.
- **O aprendizado muda a estratégia.** Com aprendizado, ela escapou nos 10 episódios, em
  73 s em média, contra 60% e 127 s só com memória. Os pesos aprendidos passam de um
  episódio ao seguinte. Ela passa a dar peso à **corrente de ar**, que começou em zero,
  e reduz a aversão cega a fracassos, que se tornava excessiva.
- **Perceber mal limita o que a mente consegue fazer.** Com a mesma mente do cenário 3,
  mas sensores pobres, a taxa de fuga cai para 30%. Com alcance de 7 m, um "raio sem
  retorno" deixa de indicar abertura, e o erro de pose quadruplica (1,27 m). Há uma
  melhora entre a 1ª e a 2ª metade dos episódios (180 → 138 s), mas sem evidência
  confiável o aprendizado também pode fixar pesos espúrios. No exemplo, a "memória de
  fracasso" chegou perto de zero.
- **Variabilidade.** Os desvios são grandes (±35 a ±63 s). O comportamento é estocástico
  e depende do ponto de partida. Para conclusões fortes, rode mais episódios
  (`npm run experiment -- 30`).

Episódios por cenário: 10 · tempo máximo: 180 s · semente base: 100

| Cenário | Fugas | Tempo médio* (s) | 1ª metade → 2ª metade (s) | Tentativas | Fracassos | Colisões | Toques no vidro | Cobertura | Erro de pose (m) |
|---|---|---|---|---|---|---|---|---|---|
| 1 · Sem memória | 40% | 136 ± 63 | 106 → 166 | 56.9 | 56.2 | 50.2 | 52.5 | 2.0% | 0.32 |
| 2 · Com memória | 60% | 127 ± 53 | 139 → 115 | 33.7 | 32.9 | 26.0 | 27.2 | 2.6% | 0.46 |
| 3 · Com aprendizado | 100% | 73 ± 34 | 79 → 68 | 20.0 | 19.0 | 13.9 | 14.8 | 1.8% | 0.34 |
| 4 · Percepção limitada | 30% | 159 ± 40 | 180 → 138 | 28.9 | 27.9 | 4.4 | 4.4 | 4.5% | 1.27 |

\* Tempo com censura: episódios sem fuga contam como o tempo máximo.

## Pesos finais (cenários com aprendizado)

- **3 · Com aprendizado**: livre 1.66, luz 2.36, profundidade 1.67, novidade 0.91, fracasso -1.04, corrente 0.88, persistencia 1.60, vertical -0.49
- **4 · Percepção limitada**: livre 1.05, luz 1.91, profundidade 1.86, novidade 0.81, fracasso 0.17, corrente 0.18, persistencia 1.47, vertical -0.89

## Episódios

| Cenário | Ep. | Fuga | Tempo (s) | Rota | Tentativas | Colisões |
|---|---|---|---|---|---|---|
| 1 · Sem memória | 1 | sim | 112.6 | oculo-teto | 36 | 26 |
| 1 · Sem memória | 2 | sim | 35.8 | oculo-teto | 6 | 0 |
| 1 · Sem memória | 3 | não | 180.0 | — | 83 | 78 |
| 1 · Sem memória | 4 | sim | 22.1 | oculo-teto | 3 | 0 |
| 1 · Sem memória | 5 | não | 180.0 | — | 55 | 44 |
| 1 · Sem memória | 6 | não | 180.0 | — | 55 | 43 |
| 1 · Sem memória | 7 | sim | 109.5 | oculo-teto | 65 | 61 |
| 1 · Sem memória | 8 | não | 180.0 | — | 81 | 74 |
| 1 · Sem memória | 9 | não | 180.0 | — | 108 | 104 |
| 1 · Sem memória | 10 | não | 180.0 | — | 77 | 72 |
| 2 · Com memória | 1 | sim | 52.6 | oculo-teto | 15 | 11 |
| 2 · Com memória | 2 | não | 180.0 | — | 44 | 38 |
| 2 · Com memória | 3 | não | 180.0 | — | 59 | 50 |
| 2 · Com memória | 4 | não | 180.0 | — | 52 | 42 |
| 2 · Com memória | 5 | sim | 100.5 | janela-norte-aberta | 25 | 17 |
| 2 · Com memória | 6 | não | 180.0 | — | 48 | 40 |
| 2 · Com memória | 7 | sim | 93.5 | janela-norte-aberta | 16 | 6 |
| 2 · Com memória | 8 | sim | 98.8 | oculo-teto | 21 | 12 |
| 2 · Com memória | 9 | sim | 54.0 | janela-norte-aberta | 13 | 8 |
| 2 · Com memória | 10 | sim | 146.3 | oculo-teto | 44 | 36 |
| 3 · Com aprendizado | 1 | sim | 51.8 | oculo-teto | 11 | 6 |
| 3 · Com aprendizado | 2 | sim | 83.8 | janela-norte-aberta | 22 | 15 |
| 3 · Com aprendizado | 3 | sim | 142.9 | janela-norte-aberta | 38 | 30 |
| 3 · Com aprendizado | 4 | sim | 46.5 | oculo-teto | 11 | 5 |
| 3 · Com aprendizado | 5 | sim | 67.6 | oculo-teto | 14 | 7 |
| 3 · Com aprendizado | 6 | sim | 88.3 | janela-norte-aberta | 27 | 21 |
| 3 · Com aprendizado | 7 | sim | 36.3 | oculo-teto | 11 | 8 |
| 3 · Com aprendizado | 8 | sim | 43.3 | oculo-teto | 11 | 5 |
| 3 · Com aprendizado | 9 | sim | 57.8 | oculo-teto | 16 | 12 |
| 3 · Com aprendizado | 10 | sim | 114.9 | janela-norte-aberta | 39 | 30 |
| 4 · Percepção limitada | 1 | não | 180.0 | — | 33 | 9 |
| 4 · Percepção limitada | 2 | não | 180.0 | — | 29 | 2 |
| 4 · Percepção limitada | 3 | não | 180.0 | — | 33 | 8 |
| 4 · Percepção limitada | 4 | não | 180.0 | — | 30 | 0 |
| 4 · Percepção limitada | 5 | não | 180.0 | — | 28 | 2 |
| 4 · Percepção limitada | 6 | sim | 79.5 | janela-norte-aberta | 18 | 3 |
| 4 · Percepção limitada | 7 | sim | 89.3 | janela-norte-aberta | 19 | 0 |
| 4 · Percepção limitada | 8 | não | 180.0 | — | 35 | 7 |
| 4 · Percepção limitada | 9 | sim | 160.9 | oculo-teto | 32 | 6 |
| 4 · Percepção limitada | 10 | não | 180.0 | — | 32 | 7 |