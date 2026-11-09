<h1 align="center">Yoneda Dragonfly</h1>

<p align="center"><strong>Libélula no Templo</strong></p>

<p align="center">Uma mente construída, num mundo simulado: definida só pelas relações com o que a cerca, ela tenta sair de um templo cheio de vidros.<br>
<em>A constructed mind in a simulated world: defined only by its relations to what surrounds it, it tries to get out of a glass-filled temple.</em></p>

<p align="center"><a href="#a-tese">Português</a> · <a href="#english">English</a></p>

<p align="center">
  <img alt="Versão" src="https://img.shields.io/badge/vers%C3%A3o-1.0.0-e07a5f?style=for-the-badge">
  <a href="LICENSE"><img alt="Licença MIT" src="https://img.shields.io/badge/licen%C3%A7a-MIT-3f51b5?style=for-the-badge"></a>
  <img alt="Testes" src="https://img.shields.io/badge/testes-31%20passando-2e8b57?style=for-the-badge">
  <img alt="Citações ABNT" src="https://img.shields.io/badge/cita%C3%A7%C3%B5es-ABNT-555555?style=for-the-badge">
</p>

<p align="center">
  <img alt="JavaScript" src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
  <img alt="three.js" src="https://img.shields.io/badge/three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white">
  <img alt="cannon-es" src="https://img.shields.io/badge/f%C3%ADsica-cannon--es-6b4fbb?style=for-the-badge">
  <img alt="Vite" src="https://img.shields.io/badge/vite-646CFF?style=for-the-badge&logo=vite&logoColor=white">
  <img alt="Vitest" src="https://img.shields.io/badge/vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white">
  <img alt="Teoria das categorias" src="https://img.shields.io/badge/teoria-das%20categorias-1f6f8b?style=for-the-badge">
</p>

Uma libélula presa num templo fechado tenta encontrar a saída. Ninguém programa o
caminho dela: o movimento sai da **arquitetura informacional** (percepção, memória,
decisão, aprendizado) rodando sobre um **substrato físico** (corpo rígido no cannon-es),
em interação com o ambiente.

## A tese

O projeto constrói uma mente em vez de supor uma. A mente é definida como um objeto de
uma categoria cujos objetos são estruturas que processam informação (ambiente, sentidos,
corpo, mente) e cujos morfismos são as operações que realizam umas sobre as outras. Ela é
caracterizada só por essas relações, sem nada sobre sua constituição interna: pelo lema
de Yoneda, fica determinada pelas operações que sofre ou pelas que realiza. O que a
separa dos outros objetos é resolver problemas a partir do que o meio informa, usando
outras estruturas (sentidos, corpo) e diretivas herdadas pela evolução (frustração,
persistência); o conjunto de problemas que ela resolve é o seu grau de agência.

O código não simula uma mente: instancia esse objeto. O que é simulado é o mundo em
volta (o templo, a luz, a física), e a "libélula" é a aparência de um sujeito diante de um
problema, não um organismo. A discussão também propõe reenquadrar o livre-arbítrio em
graus de agência e arbítrio condicionado, sem negar a agência: com a mesma semente, a
libélula faz exatamente as mesmas escolhas, e ainda assim explora, erra, aprende e sai.

O argumento completo, com as fontes, as objeções e o que a construção mostra e não
mostra, está em **[docs/DISCUSSAO.md](docs/DISCUSSAO.md)**. Os artigos com licença
aberta estão em [`papers/`](papers/).

## Como rodar

```bash
npm install
npm run dev          # interface em http://localhost:5199
npm test             # testes (vitest)
npm run experiment -- 10 180 100   # lote sem interface: episódios, tempo máx (s), semente base
```

O lote grava `resultados/experimento-<data>.json` e `.md`.

## O ambiente (substrato físico)

`src/core/temple-spec.js` descreve o templo (32 × 12 × 20 m). O motor de física
(`physics-world.js`) e o renderizador são montados a partir dessa descrição.

| Elemento | Papel no experimento |
|---|---|
| Paredes, piso, teto, 10 colunas, iconóstase, altar, blocos, lustre | obstáculos físicos (colisão) |
| **Janela norte aberta** (alta, lado oeste) | saída real, só luz do céu (sem sol direto) |
| **Óculo no teto** (2 × 2 m) | saída real, pequena e difícil de achar |
| **3 vitrais ao sul + vidro a leste + vidro ao norte** | armadilhas: deixam a luz passar (inclusive o sol direto), mas bloqueiam o corpo |
| Sol ao sul, 40° de elevação | as superfícies mais brilhantes são justamente os vidros |
| Corrente de ar | campo local: as aberturas reais puxam o ar para fora (decai em ~4 m e é bloqueado por obstáculos); os vidros não |

A óptica (`environment.js`) é calculada com raios no mundo físico: luminância do céu
(com halo do sol), reflexão difusa nas superfícies e sombras (raio até o sol). Os
vidros são transparentes para a visão e sólidos para o corpo, como uma janela real
para um inseto.

## O corpo

`dragonfly-body.js`: corpo rígido de 0,8 g com inércia própria e 6 graus de liberdade,
sob gravidade, arrasto aerodinâmico, vento e turbulência do batimento das asas. Um
controlador motor (equivalente aos gânglios torácicos) transforma o comando
"velocidade desejada" em força e torque **limitados** (velocidade máx. 4,5 m/s,
aceleração máx. 9 m/s², aceleração angular máx. 40 rad/s²). Colisões quicam de verdade.

## A mente (software independente da física)

`src/mind/` não importa nada do motor de física. O teste
`tests/mind.test.js › independência da mente` garante isso. A mente recebe só o pacote
de `sensors.js`: distâncias e luminâncias de raios visuais, proximidade, velocidade
(fluxo óptico), ar relativo ao corpo e impactos. **Não há rótulos**: a mente não sabe
o que é vidro, parede ou saída. Outro teste confirma que o pacote não contém essas
palavras.

| Módulo | Arquivo | O que faz |
|---|---|---|
| A. Percepção | `perception.js` | detecta obstáculos e superfícies, agrupa raios brilhantes em fontes de luz, marca como "abertura candidata" uma mancha cujos raios não retornam, estima a pose por integração de trajeto (a deriva aparece no painel) |
| B. Memória | `spatial-memory.js` | grade 3D de ocupação probabilística (log-odds) no referencial da própria libélula, contagem de visitas, luz vista, marcas de fracasso, candidatos a saída (localizados procurando a "moldura" da abertura no mapa) |
| C. Decisão | `decision.js` | cerca de 50 alternativas de direção; cada uma é descrita por 8 características (espaço livre, luz, profundidade, novidade, carga de fracasso, corrente de ar, persistência, custo vertical), vindas da percepção, da memória ou da incerteza; utilidade = pesos · características; escolha estocástica por softmax |
| Aprendizado | `learning.js` | gradiente de política (REINFORCE) com traço de elegibilidade: colisões e fracassos punem, células novas e a fuga recompensam; um prior fraco puxa os pesos de volta às predisposições inatas |
| D. Agência | `agent.js` | ciclo a 10 Hz: perceber → atualizar estado interno (frustração, curiosidade, confiança, temperatura) → decidir (5 Hz) → comando motor; modos EXPLORAR / TENTATIVA DE SAÍDA / RECUO |

**O que é inato e o que não é.** A libélula nasce com predisposições (fototaxia
positiva, preferência por espaço livre, curiosidade, aversão a fracasso). Nenhuma delas
diz onde fica a saída. O peso da **corrente de ar começa em zero**: só o aprendizado
pode descobrir que ela importa. A "tentativa de saída" é um compromisso de curto prazo
(memória de trabalho) com uma mancha luminosa profunda. Termina em fracasso quando há
colisão, quando o tempo esgota ou quando a passagem não existe. A fuga é detectada
fisicamente pelo experimentador. A mente só "sabe" que saiu porque passa a perceber
céu aberto ao redor, e isso gera a recompensa intrínseca.

## Cenários

1. **Sem memória**: percebe, mas não guarda nada; cada instante é o primeiro.
2. **Com memória**: mapa espacial e marcas de fracasso; pesos fixos.
3. **Com aprendizado**: memória + pesos ajustados por reforço; o que aprendeu passa
   de um episódio ao seguinte.
4. **Percepção limitada**: a mesma mente do cenário 3, mas com 28 raios em vez de 110,
   campo de ±55° em vez de quase 360°, alcance de 7 m em vez de 22 m, ruído alto, 20%
   de falhas de sensor e odometria pior.

## Instrumentação (interface)

- Cena 3D: raios visuais coloridos por luminância (ciano = sem retorno), trajetória real
  (branca) × estimada (azul tracejada), mapa mental 3D (células que ela acredita
  ocupadas, ✦ vermelho = fracasso, anéis = candidatos), alvo da tentativa, setas da
  corrente de ar, teto removível, câmera que segue a libélula.
- Painel: modo e estado interno, mapa espacial (fatia da memória dela na altura atual,
  com campo de visão), rosa das alternativas avaliadas (comprimento = probabilidade),
  campo visual (retina), pesos atuais × inatos, pose real × estimada, métricas
  (tentativas, colisões por tipo, cobertura, tempo de fuga) e registro de decisões com
  a justificativa de cada escolha.
- **Comparar cenários**: roda o lote num Web Worker, mostra gráficos, tabela e as
  conclusões automáticas, e exporta JSON e Markdown.
- **Próximo episódio** / **encadear**: nos cenários com aprendizado, o novo episódio herda
  os pesos, e dá para ver o comportamento mudar ao vivo.

## Resultados de referência

Veja `RESULTADOS.md` (gerado com `npm run experiment`).

## Limitações conhecidas

- A aerodinâmica é simplificada: há força de sustentação que compensa a gravidade, mas
  as asas não são modeladas. O modelo 3D é ampliado 6× só na tela.
- A visão é feita por raios (de 28 a 110 amostras), não por imagem. A luz tem um único
  rebote difuso, sem iluminação global.
- A integração de trajeto não tem correção: o mapa mental acumula deriva, e isso é
  intencional e fica visível no painel.
- Com percepção limitada, "raio sem retorno" deixa de indicar abertura (qualquer coisa a
  mais de 7 m some), e o desempenho cai bastante. É um resultado do experimento, não um
  defeito.

---

## English

A dragonfly trapped in a closed temple tries to find a way out. Nobody scripts its path:
movement comes from an information-processing architecture (perception, spatial memory,
softmax decision over feature utilities, REINFORCE learning) running on a rigid-body
physics substrate (cannon-es). The mind module never imports the physics engine and
receives only label-free sensor packets; it does not know what glass, a wall or an exit
is. Innate preferences play the role of evolutionary directives, and the weight given to
airflow starts at zero, so only learning can discover that it matters.

Across four scenarios (10 episodes each), the escape rate goes from 40% without memory to
60% with memory and 100% with memory and learning; the same mind with poor senses drops to
30%. The [discussion](docs/DISCUSSAO.md) (in Portuguese, with an English summary at the
top) constructs the mind as an object of a category of information-processing structures,
defined only by its morphisms to and from them; by the Yoneda lemma, that determines it up
to isomorphism. What makes it a mind is that it solves problems posed by its environment;
the set of problems it solves is its degree of agency. The code is not a simulation of a
mind but an instance of that definition: the world is simulated, the mind is constructed.
The discussion also reframes free will as conditioned agency in degrees, and lists the
main objections.

```bash
npm install
npm run dev          # UI at http://localhost:5199
npm test
npm run experiment -- 10 180 100
```

License: [MIT](LICENSE). Third-party papers in `papers/` keep their own licenses.
