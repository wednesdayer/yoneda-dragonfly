# Discussão: a mente definida de fora

## Summary (English)

This document constructs a mind instead of hypothesising one. A mind is taken to be an object of a category whose objects are information-processing structures (environment, senses, body, mind) and whose morphisms are the operations they perform on one another. The mind is defined by those morphisms and nothing else, following the categorical view that an object is fully determined by its mapping properties, with nothing assumed about its inner constitution. Within that construction, the Yoneda lemma is a theorem rather than a supporting analogy: the mind is determined, up to isomorphism, by the operations it undergoes or the operations it performs. What singles out a mind among the other objects is a criterion stated in the same language: it solves problems, posed by its environment, using information that reaches it through other structures and directives inherited from evolution; the set of problems it solves is its degree of agency. The code in this repository is not a simulation of a mind but an inhabitant of that definition, in the sense of propositions as types: the temple and the physics are simulated, the mind is instantiated. The document then reframes free will. A concept shaped by theology and by absolute presuppositions is replaced by conditioned agency in degrees, without denying agency itself. Objections are discussed: absent qualia, direct perception of other minds, the relativity of any categorical definition to the chosen category, and the risk that a problem-solving criterion is too generous. All citations follow Brazilian ABNT rules, with page numbers.

---

Este trabalho tem como finalidade construir uma definição de mente e apresentar o código deste repositório como uma instância dela, percorrendo primeiro a origem do problema e a definição proposta, para em sequência fundamentá-la na teoria das categorias e, por fim, discutir as suas consequências para o conceito de livre-arbítrio e as objeções que ela enfrenta. As citações seguem o sistema autor-data da ABNT NBR 10520:2023, com a página indicada sempre que o documento é paginado; nos verbetes da Stanford Encyclopedia of Philosophy, que não têm páginas, indica-se a seção, e nas obras clássicas, a parte, a proposição ou o parágrafo. As referências completas, no formato da NBR 6023:2018, estão na [seção 10](#10-referências), e os documentos consultados, com link e hash SHA-256, na [seção 9](#9-documentos-consultados).

**Sumário**

1. [Uma libélula num templo](#1-uma-libélula-num-templo)
2. [Uma definição de mente](#2-uma-definição-de-mente)
3. [Por que de fora](#3-por-que-de-fora)
4. [A construção categorial](#4-a-construção-categorial)
5. [Construção, não simulação](#5-construção-não-simulação)
6. [O que a construção mostra](#6-o-que-a-construção-mostra)
7. [Arbítrio condicionado e graus de agência](#7-arbítrio-condicionado-e-graus-de-agência)
8. [Objeções e limites](#8-objeções-e-limites)
9. [Documentos consultados](#9-documentos-consultados)
10. [Referências](#10-referências)

---

## 1. Uma libélula num templo

O problema surge de uma observação: uma libélula, presa dentro de um templo, tentando encontrar a saída, e o fato de acompanhar seus movimentos de fora tornar evidente algo que não aparece quando se pensa a mente a partir da própria experiência, isso é: havia ali um sistema recebendo informação do ambiente, avaliando alternativas a partir de preferências que não escolheu, errando, guardando algo do erro e agindo de novo.

A estrutura do processo estava à vista, e nenhuma parte dela exigia supor que a libélula fosse livre para fazer qualquer outra coisa, uma vez que tudo o que ela fazia podia ser explicado pelo que recebia do meio, pelo que trazia consigo e pelo que ia aprendendo no caminho.

Tendo isso em vista, chego à formulação que orienta o projeto: a mente é, funcionalmente, um software, uma estrutura que processa informação a fim de produzir agência e capacidade de resolver problemas, sendo invisível e, ao mesmo tempo, localizada num hardware. Não se trata de dizer que somos ciborgues, mas de reconhecer que somos estruturas processadoras de informação, e que informação e estrutura são o que move a natureza, do átomo aos processos de pensamento mais elaborados.

A mesma observação traz consigo uma tese de método, a de que as tentativas de explicar a mente a partir de dentro falham, uma vez que não é possível reconhecer a estrutura da mente sem sair dela e olhá-la de fora.

Este repositório leva as duas teses a sério de um modo específico, não formulando uma hipótese sobre a mente para depois testá-la contra dados, mas construindo um objeto que satisfaz uma definição de mente e colocando-o diante de um problema. A "libélula" do código é, portanto, a aparência de um sujeito dentro desse problema, e não uma libélula enquanto ser biológico.

## 2. Uma definição de mente

A primeira formulação que ocorre - "um software com algum grau de agência que visa resolver problemas" - é fraca, visto que diz o que a mente faz, mas não diz com que recursos o faz, nem por que esse seria o modo adequado de defini-la.

A definição que proponho parte de uma perspectiva mais ampla: Se o universo é composto de estruturas que processam informação, do mundo subatômico ao multicelular, então a mente é uma estrutura processadora de informação que se serve de outras estruturas processadoras de informação existentes em substratos físicos, como o sistema nervoso e os órgãos dos sentidos, assim como de diretivas instintivas herdadas pela evolução, como a frustração e a persistência, para resolver problemas a partir das informações dadas pelo meio. Se um sistema consegue resolver problemas a partir das informações que o meio lhe dá, então ele tem mente, o que equivale a dizer que a mente se dá pela possibilidade de realizar operações sobre o meio em que está inserida e de sofrer operações dele.

Essa definição é estipulada, e não descoberta, coisa que muda o modo como ela deve ser lida: Uma definição não é verdadeira nem falsa, mas adequada ou inadequada, fecunda ou estéril, e o que dela se deduz vale por necessidade. É por isso que se fala aqui em construção, uma vez que a mente é tomada como um objeto matemático definido por suas relações, e a pergunta "existem mentes assim ?" se responde exibindo uma, como se faz com qualquer objeto matemático (seção 5).

A definição guarda parentesco com o funcionalismo, doutrina segundo a qual o que faz de algo um estado mental não é sua constituição interna, mas o papel que desempenha no sistema cognitivo, isso é, suas relações causais com estímulos sensoriais, com outros estados mentais e com o comportamento ([Levin, 2023](https://plato.stanford.edu/entries/functionalism/), seção 1), assim como com a tese da realizabilidade múltipla, segundo a qual o mesmo estado mental pode ser realizado por estados físicos de tipos diferentes ([Levin, 2023](https://plato.stanford.edu/entries/functionalism/), seção 1). A formulação "a mente é o software do cérebro" tem, inclusive, nome na literatura, sendo chamada de funcionalismo computacional ([Piccinini, 2025](https://plato.stanford.edu/entries/computation-physicalsystems/), seção 3.2).

Já a definição aqui proposta acrescenta dois elementos a esse quadro: A mente não apenas processa informação, mas também usa outras estruturas processadoras, em vez de ser o único processador do sistema, e é definida pela relação com o meio, e não só pelas relações entre seus próprios estados.

A tese de fundo, de que a natureza é feita de estruturas que processam informação, tem formulações conhecidas. Wheeler ([1999](http://cqi.inf.usi.ch/qic/wheeler.pdf), p. 309) aponta que toda grandeza física deriva seu significado último de bits, resumindo a ideia na expressão "*it from bit*" e concluindo que tudo o que é físico tem origem na teoria da informação ([Wheeler, 1999](http://cqi.inf.usi.ch/qic/wheeler.pdf), p. 311), ao passo que o pancomputacionalismo vai além e afirma que todos os sistemas físicos computam, inclusive rochas e furacões ([Piccinini, 2025](https://plato.stanford.edu/entries/computation-physicalsystems/), seção 3).

Essas posições enfrentam objeções sérias, discutidas na seção 8, mas a definição não depende da versão forte delas, uma vez que basta que a mente seja uma estrutura processadora entre outras.

## 3. Por que de fora

A tese de método é a de que a mente não pode ser definida isoladamente, nem reconhecida a partir de dentro, e três linhas de argumento a sustentam.

A primeira é empírica e diz respeito à introspecção. Nisbett e Wilson ([1977](https://doi.org/10.1037/0033-295X.84.3.231), p. 231) apontam, a partir de uma revisão de estudos, que há pouco ou nenhum acesso introspectivo direto aos processos cognitivos de ordem superior, e concluem que a precisão dos relatos subjetivos é tão baixa que qualquer acesso que exista não basta para produzir relatos corretos ou confiáveis ([Nisbett; Wilson, 1977](https://doi.org/10.1037/0033-295X.84.3.231), p. 233). O critério que propõem para dizer que alguém tem consciência de um processo, inclusive, mede a introspecção contra a observação de fora, visto que exige que o relato da pessoa supere em precisão o de observadores que recebem apenas uma descrição do estímulo e da resposta ([Nisbett; Wilson, 1977](https://doi.org/10.1037/0033-295X.84.3.231), p. 251). Schwitzgebel ([2008](https://doi.org/10.1215/00318108-2007-037), p. 247, 259) estende o diagnóstico à experiência consciente corrente, sobre a qual seríamos ignorantes e propensos ao erro de modo maciço e generalizado.

Os dois trabalhos, entretanto, têm ressalvas que convém manter: Nisbett e Wilson ([1977](https://doi.org/10.1037/0033-295X.84.3.231), p. 246, 256) não afirmam que as pessoas nunca acertam sobre os próprios processos, e reconhecem que o acesso privado ao conteúdo às vezes supera o de um observador, assim como Schwitzgebel ([2008](https://doi.org/10.1215/00318108-2007-037), p. 246) considera a introspecção necessária à compreensão científica da mente, embora pouco confiável. A tese aqui defendida é compatível com essas ressalvas, uma vez que não se trata de descartar o que a mente sabe de si, mas de afirmar que a estrutura da mente - o padrão de operações que ela realiza e sofre - só se torna reconhecível de fora.

A segunda linha é o problema das outras mentes. No caso alheio, todo acesso ao que o outro pensa ou sente é indireto, mediado pelo comportamento ([Avramides, 2023](https://plato.stanford.edu/entries/other-minds/), seção 1), e as soluções clássicas trabalham justamente sobre esse acesso indireto, seja pelo argumento por analogia, que Mill formulou a partir dos atos e sinais exteriores que, no próprio caso, se sabem causados por sentimentos ([Avramides, 2023](https://plato.stanford.edu/entries/other-minds/), seção 1.1), seja pela inferência à melhor explicação, que trata os estados mentais alheios como a melhor explicação do comportamento observado ([Avramides, 2023](https://plato.stanford.edu/entries/other-minds/), seção 1.2).

Em ambos os casos, provar que existe uma mente fora de nós se faz por vias funcionais, e por conta disso a definição relacional não empobrece uma suposta definição "verdadeira" feita por dentro: Ela descreve a única forma pela qual qualquer atribuição de mente a outro efetivamente acontece.

A terceira linha diz respeito aos limites das explicações organicistas. Chalmers ([1995](https://consc.net/papers/facing.html), seção 2) separa os problemas "fáceis" da consciência, aqueles que cedem aos métodos da ciência cognitiva e se explicam por mecanismos computacionais ou neurais, do problema "difícil", que persiste mesmo quando o desempenho de todas as funções relevantes está explicado ([Chalmers, 1995](https://consc.net/papers/facing.html), seção 3), apontando que entre as funções e a experiência há uma lacuna explicativa (Levine, 1983 apud [Chalmers, 1995](https://consc.net/papers/facing.html), seção 3). O debate segue aberto, uma vez que a questão de qual resposta ao argumento do conhecimento terá sucesso continua entre as mais vivas da filosofia da mente ([Stoljar, 2026](https://plato.stanford.edu/entries/physicalism/), seção 5.1), e num levantamento de 2020 entre filósofos, 22% aceitavam ou se inclinavam ao dualismo, 51% ao materialismo e 8% ao panpsiquismo ([Robinson; Weir, 2025](https://plato.stanford.edu/entries/dualism/), seção 1).

Uma explicação organicista da mente, por mais completa que seja, deixa abertas as questões do problema mente-corpo, e a definição aqui construída não as resolve, nem pretende resolver, escolhendo antes o terreno em que é possível dizer algo preciso.

## 4. A construção categorial

### 4.1 O objeto e seus morfismos

A teoria das categorias oferece a linguagem em que essa escolha se torna exata. Uma categoria é composta de objetos e de morfismos entre eles, com uma operação de composição, e seus objetos não são considerados independentemente dos morfismos, visto que ficam inteiramente determinados por suas propriedades de mapeamento, sem que nada mais se suponha sobre sua constituição interna ([Reck; Schiemer, 2025](https://plato.stanford.edu/archives/fall2025/entries/structuralism-mathematics/), seção 4.3).

Marquis ([2019](https://plato.stanford.edu/archives/spr2026/entries/category-theory/), seção 3) aponta dois traços do ponto de vista categorial: Um objeto existe numa categoria ambiente e depende dela, sendo caracterizado pelos morfismos que chegam a ele ou saem dele, e objetos são sempre caracterizados a menos de isomorfismo. Para objetos com uma propriedade universal, a natureza dos elementos que os constituem é irrelevante, importando apenas o modo como o objeto se relaciona com os demais, pelos morfismos que entram e pelos que saem ([Marquis, 2019](https://plato.stanford.edu/archives/spr2026/entries/category-theory/), seção 1.3).

Awodey ([2014](https://doi.org/10.1093/philmat/nkt030), p. 4) dá a formulação mais próxima da tese deste trabalho, apontando que numa categoria uma estrutura é determinada externamente, por assim dizer, pelos seus mapeamentos de e para outros objetos do mesmo tipo, e não internamente, pelas relações e operações entre seus elementos.

É exatamente o que a tese de método pedia: Definir a mente de fora não é uma limitação a ser superada por uma descrição interna melhor, mas a forma pela qual objetos são definidos nesse quadro.

A construção adotada é a seguinte. Os objetos da categoria são estruturas processadoras de informação - o ambiente, os órgãos dos sentidos, o corpo, a mente e quaisquer outras estruturas que participem do problema -, coisa que mantém a coerência com a tese de fundo, uma vez que a mente não é tomada como algo de natureza diferente, mas como um objeto entre outros do mesmo tipo. Os morfismos, por sua vez, são as operações que essas estruturas realizam umas sobre as outras, de modo que os morfismos que chegam à mente M são o que ela sofre (o ambiente agindo através dos sentidos, as diretivas herdadas fixando seu ponto de partida), e os que saem de M são o que ela realiza (comandos ao corpo e, através dele, alterações no ambiente).

Tendo essa construção em vista, a afirmação de que a mente se serve de outras estruturas ganha sentido preciso como composição, uma vez que a mente age sobre o ambiente por um caminho que passa pelo corpo e é afetada por ele por um caminho que passa pelos sentidos.

### 4.2 O lema de Yoneda como teorema

Com a mente definida como objeto, o lema de Yoneda deixa de ser analogia e passa a ser teorema sobre a definição. Riehl ([2016](https://emilyriehl.github.io/files/context-v1.pdf), p. xiii) o coloca como talvez o resultado mais importante da teoria das categorias e aponta que, por ele, todo objeto fica caracterizado por suas propriedades universais, sendo que o enunciado formal estabelece uma correspondência bijetiva entre as transformações naturais do functor representável de um objeto para qualquer functor F e os elementos de F aplicado ao objeto ([Riehl, 2016](https://emilyriehl.github.io/files/context-v1.pdf), p. 57), com a consequência de que as relações entre functores representáveis espelham exatamente as relações entre os objetos que os representam ([Riehl, 2016](https://emilyriehl.github.io/files/context-v1.pdf), p. 60). Fong e Spivak ([2018](https://arxiv.org/abs/1803.05316), p. 20) traduzem a versão para pré-ordens de forma direta: Conhecer um elemento é o mesmo que conhecer sua teia de relações com os demais.

Aplicado à construção, o lema diz que a mente M fica determinada, a menos de isomorfismo, pelo conjunto de morfismos que chegam a ela, tomados sobre todos os objetos da categoria, e também, separadamente, pelo conjunto dos que saem dela.

Basta, portanto, um dos dois lados - o que a mente sofre já a determina, e o que ela realiza também -, de modo que a formulação "realizar e sofrer operações" diz mais do que o teorema exige, e o que isso mostra é que a mente se manifesta nas duas direções, ainda que cada uma baste para identificá-la. Uma mente isolada, sem morfismos, seria um objeto do qual nada se poderia dizer, e é esse o conteúdo formal da afirmação de que a mente não pode ser definida isoladamente.

### 4.3 Em série e em paralelo

A mente emite e recebe operações concomitantemente, em paralelo, entre estruturas diferentes, e uma categoria simples só compõe morfismos em série, de modo que, para compor em paralelo, ela precisa ser monoidal. Coecke, Fritz e Spekkens ([2016](https://doi.org/10.1016/j.ic.2016.02.008), p. 9) apontam que as teorias de processos são categorias monoidais simétricas em que os objetos são tipos de sistemas, os morfismos são processos, a execução em série é a composição e a composição em paralelo é o produto tensorial, assim como Fong e Spivak ([2018](https://arxiv.org/abs/1803.05316), p. 43-44, 135) mostram como essa estrutura permite combinar relações não apenas em série, mas também em paralelo, com caixas de várias entradas e saídas tipadas.

Perceber a luz, perceber a corrente de ar e lembrar fracassos, tudo ao mesmo tempo, é, nesse sentido, um produto tensorial de processos.

Já que a escolha da mente é estocástica, a categoria adequada é uma categoria de Markov, isso é: uma categoria monoidal simétrica em que cada objeto tem operações de cópia e descarte ([Fritz, 2020](https://doi.org/10.1016/j.aim.2020.107239), p. 10), e cujos morfismos se interpretam como núcleos de Markov, que associam a cada entrada uma distribuição de probabilidade sobre as saídas ([Fritz, 2020](https://doi.org/10.1016/j.aim.2020.107239), p. 10).

### 4.4 Interface, sistema aberto, ida e volta

A mente é um sistema aberto, e a literatura categorial tem linguagem própria para isso. Fong e Spivak ([2018](https://arxiv.org/abs/1803.05316), p. 182-183) tratam circuitos como sistemas abertos, cada um com uma interface que o expõe ao resto do mundo, mostrando que a interconexão é modelada por colimites, e no capítulo sobre comportamento apontam que o comportamento possível do todo, em qualquer ambiente, é determinado pelos comportamentos possíveis de cada componente no seu ambiente local e pelo modo preciso como interagem ([Fong; Spivak, 2018](https://arxiv.org/abs/1803.05316), p. 221), dando o exemplo de uma cadeia sensor, controlador e motor em que cada componente é pensado pela relação que mantém, ao longo do tempo, entre os valores que mudam nas suas portas ([Fong; Spivak, 2018](https://arxiv.org/abs/1803.05316), p. 222).

Niu e Spivak ([2024](https://arxiv.org/abs/2312.00990), p. 85) chamam de interface aquilo que codifica como alguém de fora interage com uma máquina, salientando que esse alguém não observa nem altera os estados diretamente, apenas interage pela interface, que deve capturar tudo o que um observador externo poderia perceber do sistema ([Niu; Spivak, 2024](https://arxiv.org/abs/2312.00990), p. 91). Smithe ([2023](https://doi.org/10.5287/ora-kzjqyop2d), p. 117), numa tese sobre o cérebro bayesiano em linguagem categorial, coloca a fronteira entre sistema e ambiente como sendo "habitada" pelo sistema, visto que o sistema se incorpora na sua interface de interação e a informação flui através dela.

A mente, além disso, aprende com o que faz, e a cibernética categorial oferece a estrutura para isso. Capucci et al. ([2022](https://doi.org/10.4204/EPTCS.372.17), p. 235) apontam que uma óptica parametrizada descreve sistemas abertos com fluxo de informação nos dois sentidos, com um controle na ida e um objetivo na volta, de modo que os agentes agem no mundo numa direção e recebem retorno na outra ([Capucci et al., 2022](https://doi.org/10.4204/EPTCS.372.17), p. 240), um estado interno transporta informação entre as duas, fazendo o papel de memória ([Capucci et al., 2022](https://doi.org/10.4204/EPTCS.372.17), p. 241), e os agentes usam o retorno para atualizar os parâmetros que fornecem, fechando o ciclo ([Capucci et al., 2022](https://doi.org/10.4204/EPTCS.372.17), p. 243). Fong, Spivak e Tuyéras ([2019](https://doi.org/10.1109/LICS.2019.8785665), p. 3) definem um aprendiz por parâmetros, implementação, atualização e requisição, e mostram que aprendizes se compõem ([Fong; Spivak; Tuyéras, 2019](https://doi.org/10.1109/LICS.2019.8785665), p. 6).

As diretivas herdadas pela evolução encontram aqui seu lugar, sendo os parâmetros iniciais, aquilo com que a mente começa antes de qualquer experiência.

Por fim, a teoria das coálgebras dá a contrapartida dinâmica da caracterização de fora: Rutten ([2000](https://doi.org/10.1016/S0304-3975(00)00056-6), p. 5) trata "coálgebra" e "sistema" como sinônimos, e mostra que dois estados são equivalentes por bissimulação se, e somente se, têm a mesma imagem na coálgebra final, imagem que pode ser lida como o comportamento observável do estado ([Rutten, 2000](https://doi.org/10.1016/S0304-3975(00)00056-6), p. 42).

### 4.5 O critério: resolver problemas

Os sentidos e o corpo também têm morfismos que chegam e que saem, e por isso ser objeto não basta para ser mente, sendo a resolução de problemas o critério que a distingue, critério que pode ser dito na mesma linguagem.

Um problema é um par formado por um ambiente E e um conjunto G de estados-objetivo de E, e um objeto M resolve o problema quando a composição dos sentidos, de M e do corpo com o ambiente leva E a um estado de G com probabilidade ao menos p, usando a informação que chega a M pelos sentidos. Um objeto é mente quando resolve algum problema desse modo, e o grau de agência de M é o conjunto dos problemas que ela resolve, ordenado por inclusão, isso é: uma mente tem mais agência que outra quando resolve todos os problemas que a outra resolve e mais algum.

Memória e aprendizado, nesse quadro, não são acréscimos de natureza diferente, mas estrutura adicional que amplia esse conjunto, e é justamente isso que os cenários da simulação medem (seção 6).

Essa formulação aproxima a definição de uma caracterização naturalista de agência que a literatura já conhece. Barandiaran, Di Paolo e Rohde ([2009](https://doi.org/10.1177/1059712309343819), p. 367) exigem que um agente defina sua própria individualidade, seja fonte ativa de atividade no seu ambiente e regule essa atividade segundo normas, apontando que a normatividade, componente essencial da agência, pode estar presente de modo mais forte ou mais fraco, como grau de realização funcional ([Barandiaran; Di Paolo; Rohde, 2009](https://doi.org/10.1177/1059712309343819), p. 372), e apresentando sua definição como mínima, aberta a condições adicionais que deem conta de tipos mais complexos de agência ([Barandiaran; Di Paolo; Rohde, 2009](https://doi.org/10.1177/1059712309343819), p. 378).

## 5. Construção, não simulação

O código deste repositório não simula uma mente, mas instancia o objeto definido acima. O que é simulado é o mundo ao redor - o templo, a luz e a física -, que serve de cenário para o problema, ao passo que a mente, no sentido da definição, não está sendo imitada, uma vez que processa informação de fato, recebe operações dos sentidos, realiza operações sobre o corpo e resolve o problema que o meio lhe apresenta.

A distinção tem fundamento preciso na matemática construtiva, na qual a expressão "existe" significa "podemos construir" ([Bridges; Palmgren; Ishihara, 2022](https://plato.stanford.edu/archives/fall2022/entries/mathematics-constructive/), introdução), e provar que existe um x com a propriedade P exige construir o objeto e provar que P vale para ele ([Bridges; Palmgren; Ishihara, 2022](https://plato.stanford.edu/archives/fall2022/entries/mathematics-constructive/), seção 2). Na teoria dos tipos, a mesma ideia toma a forma da correspondência entre proposições e tipos, segundo a qual cada proposição pode ser representada como o tipo das suas provas, e cada tipo determina a proposição de que ele é habitado ([Bridges; Palmgren; Ishihara, 2022](https://plato.stanford.edu/archives/fall2022/entries/mathematics-constructive/), seção 3.4). Wadler ([2015](https://doi.org/10.1145/2699407), p. 1) resume a correspondência apontando que a cada prova de uma proposição corresponde um programa do tipo correspondente, e vice-versa, e que as regras que introduzem um tipo correspondem aos modos de construir um valor dele ([Wadler, 2015](https://doi.org/10.1145/2699407), p. 3), assim como Coecke, Fritz e Spekkens ([2016](https://doi.org/10.1016/j.ic.2016.02.008), p. 7) fazem uma observação do mesmo tipo sobre teorias de processos, apontando que a diferença entre uma categoria monoidal simétrica e uma teoria de recursos não é matemática, mas de interpretação.

Nesse vocabulário, o código é um habitante do tipo "mente", a construção que mostra que a definição não é vazia, e isso determina o que significa testar a tese.

Uma definição estipulada não se testa como hipótese, contra dados; o que a construção testa são três coisas: (1) que a definição é satisfeita por algum objeto, (2) que ela discrimina graus, gerando diferenças mensuráveis entre objetos que a satisfazem, e (3) que suas consequências se verificam no objeto construído. É também por isso que dados empíricos sobre libélulas podem enriquecer o cenário, mas não são necessários para a tese, uma vez que, se o objetivo fosse reproduzir um inseto, o projeto seria a simulação de um ser biológico, e não a construção de uma mente.

Duas ressalvas delimitam o alcance da construção. O código não está tipado contra uma especificação formal da definição, e os testes automatizados verificam apenas algumas das suas propriedades, de modo que chamá-lo de habitante do tipo é, por enquanto, uma leitura informal, que só uma especificação formal da definição tornaria exata. Já a segunda ressalva é a de que a construção mostra que a definição é habitada, e não que um organismo particular, como a libélula do templo real, caia sob ela, sendo esse passo - a aplicação da definição ao mundo - empírico, feito como sempre se fez com outras mentes: Observando de fora o padrão de operações que o organismo realiza e sofre.

## 6. O que a construção mostra

Cada elemento da definição tem um correspondente no código, e alguns deles são verificados por testes.

A fronteira entre a mente e o mundo é explícita, visto que o módulo `src/core/sensors.js` é a única ponte entre o mundo simulado e a mente, entregando um pacote de números (distâncias, luminâncias, fluxo de ar, contato e propriocepção) sem rótulos, de modo que a mente não sabe o que é vidro, parede ou saída. O teste `tests/mind.test.js › independência da mente` verifica que nenhum arquivo de `src/mind/` importa o motor de física, o que, em termos da seção 4, significa que a mente só se relaciona com o mundo pelos morfismos que passam pelos sentidos e pelo corpo, isso é: pela interface de que falam Niu e Spivak, e nada além dela.

As estruturas de que a mente se serve estão separadas dela. A percepção agrupa raios em fontes de luz e marca aberturas candidatas, a memória espacial mantém um mapa de ocupação no referencial da própria libélula, e o corpo (`src/core/dragonfly-body.js`) transforma o comando de velocidade em força e torque limitados. Já as diretivas herdadas estão em `src/mind/config.js` como pesos iniciais - fototaxia positiva, preferência por espaço livre, curiosidade e aversão a fracassos -, sendo que nenhuma delas codifica onde fica a saída e o peso da corrente de ar começa em zero, assim como a frustração cresce com colisões e tentativas fracassadas e eleva a temperatura da escolha, tornando a libélula mais exploratória quando a estratégia atual falha.

A decisão é uma escolha estocástica do tipo softmax sobre preferências, a parametrização de política que Sutton e Barto ([2018](http://incompleteideas.net/book/RLbook2020.pdf), p. 322) chamam de softmax nas preferências de ação, e o aprendizado é um gradiente de política do tipo REINFORCE ([Williams, 1992](https://doi.org/10.1007/BF00992696), p. 234; [Sutton; Barto, 2018](http://incompleteideas.net/book/RLbook2020.pdf), p. 327-330), com traço de elegibilidade e uma atração fraca de volta aos pesos iniciais, o que reproduz a estrutura de ida e volta da seção 4.4: Decidir é a ida, e atualizar os pesos pela recompensa é a volta.

Os quatro cenários de `RESULTADOS.md`, com dez episódios cada, mostram as três coisas que a construção deveria mostrar. A definição é satisfeita, uma vez que, com memória e aprendizado, a libélula resolveu o problema em todos os episódios; ela discrimina graus, uma vez que a taxa de fuga foi de 40% sem memória, 60% com memória e 100% com memória e aprendizado, e o tempo médio de fuga caiu de 136 para 73 segundos entre o primeiro e o terceiro cenários; e suas consequências se verificam, visto que o aprendizado fez o peso da corrente de ar passar de 0 para 0,88, ampliando o conjunto de problemas resolvidos por meio de uma relação com o meio que a mente não tinha no início.

O quarto cenário compõe a mesma mente do terceiro com sentidos piores, e a taxa de fuga cai para 30%, sendo esta a consequência mais direta da definição relacional: Mudando os morfismos que chegam à mente, muda o que ela consegue resolver, sem que nada nela tenha mudado.

## 7. Arbítrio condicionado e graus de agência

A definição usa "agência" de propósito, para não falar em livre-arbítrio, e a proposta aqui não é negar a agência, mas reenquadrar um problema que o conceito de livre-arbítrio coloca mal, uma vez que está atravessado por crenças religiosas, senso comum e pressupostos absolutos.

O peso teológico na formação do conceito é bem documentado. Grande parte da obra filosófica ocidental sobre livre-arbítrio foi escrita dentro de um quadro teológico abrangente ([O'Connor; Franklin, 2022](https://plato.stanford.edu/entries/freewill/), seção 4.1), e Tornau ([2024](https://plato.stanford.edu/entries/augustine/), seção 7.4) aponta que já se afirmou que Agostinho "descobriu" a vontade, e que para ele fazia pouco sentido falar em livre-arbítrio sem referência à graça. O debate sobre a presciência divina, por sua vez, girou em torno do fatalismo teológico, a tese de que o conhecimento infalível do futuro torna os atos humanos necessários e, portanto, não livres, problema que só existe para quem sustenta ao mesmo tempo uma divindade onisciente e um livre-arbítrio libertário ([Hunt; Zagzebski, 2026](https://plato.stanford.edu/entries/free-will-foreknowledge/), introdução).

O pressuposto absoluto também foi apontado há muito tempo. Espinosa observou que os homens se julgam livres porque têm consciência de suas volições e desejos e ignoram as causas que os dispuseram a desejar ([Espinosa, 2003](https://www.gutenberg.org/ebooks/3800), parte I, apêndice), afirmando que na mente não há vontade absoluta ou livre, mas que ela é determinada a querer isto ou aquilo por uma causa, também determinada por outra, e assim ao infinito ([Espinosa, 2003](https://www.gutenberg.org/ebooks/3800), parte II, proposição 48). Nietzsche, por sua vez, chamou a *causa sui* da melhor autocontradição já concebida, identificando o desejo de liberdade da vontade no sentido metafísico superlativo com o desejo de ser exatamente essa *causa sui* ([Nietzsche, 2003](https://www.gutenberg.org/ebooks/4363), § 21), e Galen Strawson deu ao argumento sua forma contemporânea, apontando que a autodeterminação verdadeira é impossível, uma vez que exigiria completar uma série infinita de escolhas de princípios de escolha, e que cada um é, de início, como é em razão da hereditariedade e da experiência precoce (Strawson, 2011 apud [Caruso, 2018](https://plato.stanford.edu/entries/skepticism-moral-responsibility/), seção 2.3).

Defendo que toda agência é condicionada perante algo. Uma escolha livre de qualquer condicionamento exigiria um agente que não precisasse aprender com o mundo para escolher bem, isso é, um agente onisciente, ao passo que qualquer agente que precisa aprender escolhe condicionado pelo que sabe, pelo que herdou e pelo que o meio lhe informa, coisa que torna o "livre" de livre-arbítrio um termo nebuloso, mas não torna a agência ilusória.

Nietzsche ([2003](https://www.gutenberg.org/ebooks/4363), § 21) é explícito nesse ponto, pedindo que se tire da cabeça também a "vontade não livre", que chama de mitologia, e dizendo que na vida real só se trata de vontades fortes e fracas. Espinosa concebia a autodeterminação humana como algo que admite graus ([O'Connor; Franklin, 2022](https://plato.stanford.edu/entries/freewill/), seção 1.2), e entre os compatibilistas há quem gradue a liberdade pela responsividade a razões, distinguindo agentes insensíveis às considerações racionais apropriadas de agentes responsivos a alguma gama delas ([McKenna; Coates, 2024](https://plato.stanford.edu/entries/compatibilism/), seção 4.4). Barandiaran, Di Paolo e Rohde ([2009](https://doi.org/10.1177/1059712309343819), p. 376), por fim, definem o agente como uma organização autônoma capaz de regular adaptativamente seu acoplamento com o ambiente segundo normas dadas por suas próprias condições de viabilidade, tratando essa capacidade como gradual.

O reenquadramento proposto troca, portanto, uma pergunta binária - "o agente é livre ou não ?" -, que depende de pressupostos absolutos, por uma pergunta de grau: Que conjunto de problemas este agente resolve, condicionado pelo que recebe do meio, pelo que herdou e pelo que aprendeu ?

A construção torna a pergunta concreta. O teste `tests/episode.test.js › é determinístico para a mesma semente` verifica que dois episódios com a mesma semente produzem exatamente o mesmo percurso e o mesmo número de decisões, isso é: dada a mesma história, a libélula não escolheria de outro modo, e ainda assim ela explora, erra, aprende e resolve o problema, aparecendo o grau dessa agência nos números da seção 6. O que a construção mostra é que a agência, nesse sentido, não depende de nada parecido com o livre-arbítrio libertário, o que não se deve entender como prova de que nenhuma mente o tenha, mas sim como demonstração de que o conceito não é necessário para descrever o que uma mente faz.

## 8. Objeções e limites

A objeção mais conhecida a qualquer definição funcional é a dos *qualia* ausentes, segundo a qual poderia haver criaturas funcionalmente equivalentes a seres humanos normais cujos estados mentais não tivessem caráter qualitativo algum ([Levin, 2023](https://plato.stanford.edu/entries/functionalism/), seção 5.5.1). A definição aqui construída herda essa objeção e a assume como limite, visto que trata da mente enquanto estrutura que resolve problemas e não pretende responder ao problema difícil da consciência descrito na seção 3, ainda que nem esse problema escape à linguagem categorial, visto que Northoff, Tsuchiya e Saigo ([2019](https://doi.org/10.1101/674242), p. 6) propõem formular o próprio domínio fenomenal como uma categoria, com os conteúdos de consciência como objetos e as relações vividas entre eles como morfismos.

A segunda objeção vai contra a premissa de que outras mentes só são acessíveis indiretamente, uma vez que defensores da percepção direta sustentam que nosso conhecimento de outras mentes é tão direto e imediato quanto o das coisas físicas ([Avramides, 2023](https://plato.stanford.edu/entries/other-minds/), seção 1.4). A tese de método sobrevive a essa objeção numa forma mais fraca, pois mesmo que o acesso a outras mentes seja perceptivo, o que se percebe é o que a mente faz, e isso continua sendo caracterização de fora.

A terceira objeção é interna à própria abordagem estrutural e precisa ser levada a sério, uma vez que atinge o centro da construção. Awodey ([2014](https://doi.org/10.1093/philmat/nkt030), p. 4) aponta que o isomorfismo é sempre relativo a uma categoria dada, que fixa o que conta como mapeamento que preserva estrutura, de modo que a definição de mente é relativa à categoria escolhida, e se a categoria não tiver os morfismos certos, ela pode identificar estruturas que deveriam ser distintas.

A escolha da categoria é, portanto, onde mora a substância filosófica da construção, e é ela que precisa ser defendida em cada aplicação.

Há também o chamado problema da identidade do estruturalismo, o de que em certas estruturas objetos distintos são estruturalmente indiscerníveis ([Reck; Schiemer, 2025](https://plato.stanford.edu/archives/fall2025/entries/structuralism-mathematics/), seção 2.1), assim como a observação de Awodey ([2014](https://doi.org/10.1093/philmat/nkt030), p. 2) de que objetos matemáticos, por serem frequentemente construídos a partir de outros, carregam alguma estrutura residual da construção, o que, no caso deste repositório, significa que o código tem propriedades, como a linguagem em que foi escrito, que não fazem parte da mente definida e não devem ser confundidas com ela.

A quarta objeção atinge a tese de fundo. Piccinini ([2025](https://plato.stanford.edu/entries/computation-physicalsystems/), seção 3.3) aponta que, se todo processo físico é uma computação, a teoria computacional da cognição perde boa parte de sua força explicativa, e que há pouca evidência empírica positiva para o pancomputacionalismo ontológico ([Piccinini, 2025](https://plato.stanford.edu/entries/computation-physicalsystems/), seção 3.4), sendo que o próprio Wheeler rejeitava a ideia de que o mundo seja uma máquina gigante regida por leis físicas preestabelecidas ([Wheeler, 1999](http://cqi.inf.usi.ch/qic/wheeler.pdf), p. 309).

A definição resiste a essa objeção apenas em parte, visto que o que distingue a mente das demais estruturas não é processar informação, mas usar outras estruturas para resolver problemas a partir do que o meio informa. O critério é, ainda assim, generoso, visto que um termostato, que usa um sensor para manter uma temperatura, passaria por ele num grau mínimo, e a saída é aceitar a consequência e tratar a mente como questão de grau, que é justamente o que a seção 4.5 faz.

A ênfase no acoplamento com o meio aproxima a definição da tese da mente estendida, cujo princípio de paridade conta como cognitiva qualquer parte do mundo que funcione como um processo que, feito dentro da cabeça, reconheceríamos sem hesitar como cognitivo ([Clark; Chalmers, 1998](https://doi.org/10.1093/analys/58.1.7), seção 2). Essa aproximação está sujeita, entretanto, à chamada falácia do acoplamento-constituição, segundo a qual da observação de que um processo está causalmente acoplado a um processo cognitivo não se segue que ele seja parte desse processo ([Shapiro; Spaulding, 2021](https://plato.stanford.edu/entries/embodied-cognition/), seção 5.1), e a definição evita o passo criticado, uma vez que não afirma que o meio é parte da mente, mas apenas que a mente não pode ser caracterizada sem os morfismos que a ligam a ele.

Há, por fim, limites do cenário que não atingem a definição, mas que convém registrar. A diretiva inata de fototaxia positiva é uma simplificação, uma vez que Fabian et al. ([2024](https://doi.org/10.1038/s41467-024-44785-3), p. 1) mostraram que insetos voadores não se dirigem diretamente a fontes de luz artificial, mas voltam o dorso para elas, resposta conservada numa história evolutiva em que a parte mais brilhante do campo visual era o céu e que pode prender o inseto perto de uma fonte artificial, achado que, não dificilmente, serve como bom exemplo da própria definição: Uma diretiva herdada que falha fora do contexto em que evoluiu. A aerodinâmica, além disso, é simplificada e a visão é feita por raios, como descreve o README.

## 9. Documentos consultados

Todos os documentos foram obtidos em 9 de novembro de 2026. Os que têm licença aberta estão em [`papers/`](../papers/), com os hashes em [`papers/SHA256SUMS`](../papers/SHA256SUMS); os demais não são redistribuídos e estão listados com link, tamanho e hash para conferência.

| Citação | Link | Tamanho (bytes) | SHA-256 | Licença |
|---|---|---|---|---|
| Awodey (2014), preprint do autor | https://www.andrew.cmu.edu/user/awodey/preprints/siu.pdf | 207.329 | `4cd723c029a14ebfb06fb6c23428e0fc628e71a752136fcfe923231eccd3b429` | não declarada |
| Barandiaran, Di Paolo e Rohde (2009) | https://xabier.barandiaran.net/wp-content/uploads/2022/12/barandiaran_dipaolo_rohde_-_2009_-_defining_agency_-_adbeh_pub.pdf | 324.787 | `7549d596aab54dbd00d130f1376c0457bc10c846843958665999a6f0d4b2d5ad` | © ISAB/SAGE |
| Capucci et al. (2022) | https://arxiv.org/abs/2105.06332 | 189.452 | `9dad6a087398adf23d38fad154eec784ccb74177ead977ee6c7095934dd3a549` | arXiv, não exclusiva |
| Coecke, Fritz e Spekkens (2016), arXiv 1409.5531v3 | https://arxiv.org/abs/1409.5531 | 584.655 | `e4650c41eab931402ef2ad9effe81315d26cd4ddf3cc7ba6b4802eb364685a19` | arXiv, não exclusiva |
| Fabian et al. (2024) | https://doi.org/10.1038/s41467-024-44785-3 | 4.808.082 | `add3617d5f6cb891ea2c1a49468b2a61735fc31111c183ed6c62d9dfe004ebff` | CC BY 4.0, em `papers/` |
| Fong e Spivak (2018) | https://arxiv.org/abs/1803.05316 | 3.032.448 | `f764f23020ee5ca45faa68b4e50257a7b5a69cb5e6baede696d2394baca33ce8` | CC BY 4.0, em `papers/` |
| Fong, Spivak e Tuyéras (2019), arXiv 1711.10455v3 | https://arxiv.org/abs/1711.10455 | 269.845 | `1c5fe132e696e4a6b2d8e9ca8c45ca1c30a65c501e8f45a234548f05e14abb13` | arXiv, não exclusiva |
| Fritz (2020), arXiv 1908.07021v8 | https://arxiv.org/abs/1908.07021 | 1.040.967 | `99ee420f2e620a1e40e23d7dd8b3608c01f9f07bb32850703d33b9e03d48cb4e` | arXiv, não exclusiva |
| Niu e Spivak (2024) | https://arxiv.org/abs/2312.00990 | 3.400.150 | `02d87ffacc1a54b5cbff1d7b93aa96018afcbda0caa62af0e321bbf4be01c6a5` | CC BY 4.0, em `papers/` |
| Nisbett e Wilson (1977) | https://doi.org/10.1037/0033-295X.84.3.231 | 2.738.691 | `0c31f5f1da2c3f253981d873813fb1060dfccee34f533bc5a43ebcffc13536eb` | © APA |
| Northoff, Tsuchiya e Saigo (2019), preprint | https://doi.org/10.1101/674242 | 968.661 | `3280a2b76a6c89aec1533ba686996b3ef7103a32df4be37c4a054f24a7bfde6f` | todos os direitos reservados |
| Phillips e Wilson (2010) | https://doi.org/10.1371/journal.pcbi.1000858 | 368.850 | `02c1ae897d043ffc79bc2d3761691d7458eec76cd0011412e9d717a391719a64` | CC BY, em `papers/` |
| Riehl (2016) | https://emilyriehl.github.io/files/context-v1.pdf | 1.471.006 | `c283ee0d0d2aea83a5309d8d5c3a759d81ebc12dd57532c7417b15969e8a1272` | cedido pela Dover à autora |
| Rutten (2000) | https://ir.cwi.nl/pub/48/0048D.pdf | 14.603.002 | `1098f3b66faaa74b4e9835c2b8b397a9ddec45f4e92bde7e66c5f0f000cbc2df` | © Elsevier |
| Schwitzgebel (2008) | https://faculty.ucr.edu/~eschwitz/SchwitzPapers/Naive1.pdf | 153.319 | `1ee9b42b20856429bed4c68b7e461e8cba35bd20c95dcc9b28a2eaccb404d3f1` | © Cornell University |
| Smithe (2023), arXiv 2212.12538v3 | https://doi.org/10.5287/ora-kzjqyop2d | 3.061.946 | `06bc8eb4657b353b500c856805f0f92158546d152f98478332155408d7bfc2d5` | CC BY-SA 4.0, em `papers/` |
| Sutton e Barto (2018), revisão de 2020 | http://incompleteideas.net/book/RLbook2020.pdf | 73.129.769 | `2dd0d71d9ee883fbeb99f9b888c65ac3255fae2512203d11b18e838befffe9a6` | CC BY-NC-ND 2.0 |
| Wadler (2015), versão do autor | https://homepages.inf.ed.ac.uk/wadler/papers/propositions-as-types/propositions-as-types.pdf | 261.454 | `6316909c6a34ed1d7ce7bbf3bd191abaf738489ec73f517c9f579a9079c4be83` | não declarada |
| Wheeler (1999) | http://cqi.inf.usi.ch/qic/wheeler.pdf | 9.986.674 | `1653d02c4dc309d837dbfa3ecdd7e9ccaadbb40d5fb151c9873217ccc0971af4` | direitos do autor |
| Williams (1992) | https://doi.org/10.1007/BF00992696 | 1.573.051 | `f033dd17e83c246e1ba908b01772a8dc79df51c6451ced1eb5292edc833ee4d3` | © Kluwer |

Também consultamos, em HTML, a versão dos autores de Clark e Chalmers (1998) e de Chalmers (1995), os textos de Espinosa e Nietzsche no Project Gutenberg e os verbetes da Stanford Encyclopedia of Philosophy listados nas referências. As páginas de Awodey (2014), Coecke, Fritz e Spekkens (2016), Fong, Spivak e Tuyéras (2019), Fritz (2020), Smithe (2023) e Wadler (2015) são as das versões consultadas, indicadas na tabela, e podem diferir das versões publicadas. Northoff, Tsuchiya e Saigo foram lidos no preprint do bioRxiv. Não obtivemos versão aberta legítima de Awodey (1996), que apresentou primeiro a ideia de estrutura determinada externamente, de Levine (1983), citado por Chalmers, de Strawson (1994), cujo argumento citamos por Caruso, nem de Tsuchiya, Taguchi e Saigo (2016).

## 10. Referências

AVRAMIDES, A. Other minds. *In*: ZALTA, E. N.; NODELMAN, U. (ed.). **The Stanford Encyclopedia of Philosophy**. Stanford: Metaphysics Research Lab, 2023. Primeira publicação em 2019. Disponível em: https://plato.stanford.edu/entries/other-minds/. Acesso em: 9 nov. 2026.

AWODEY, S. Structuralism, invariance, and univalence. **Philosophia Mathematica**, v. 22, n. 1, p. 1-11, 2014. DOI: https://doi.org/10.1093/philmat/nkt030. Versão consultada: preprint do autor, 4 mar. 2014, disponível em: https://www.andrew.cmu.edu/user/awodey/preprints/siu.pdf. Acesso em: 9 nov. 2026.

BARANDIARAN, X. E.; DI PAOLO, E.; ROHDE, M. Defining agency: individuality, normativity, asymmetry, and spatio-temporality in action. **Adaptive Behavior**, v. 17, n. 5, p. 367-386, 2009. DOI: https://doi.org/10.1177/1059712309343819.

BRIDGES, D.; PALMGREN, E.; ISHIHARA, H. Constructive mathematics. *In*: ZALTA, E. N.; NODELMAN, U. (ed.). **The Stanford Encyclopedia of Philosophy**. Fall 2022 ed. Stanford: Metaphysics Research Lab, 2022. Disponível em: https://plato.stanford.edu/archives/fall2022/entries/mathematics-constructive/. Acesso em: 9 nov. 2026.

CAPUCCI, M.; GAVRANOVIĆ, B.; HEDGES, J.; RISCHEL, E. F. Towards foundations of categorical cybernetics. **Electronic Proceedings in Theoretical Computer Science**, v. 372, p. 235-248, 2022. DOI: https://doi.org/10.4204/EPTCS.372.17.

CARUSO, G. Skepticism about moral responsibility. *In*: ZALTA, E. N.; NODELMAN, U. (ed.). **The Stanford Encyclopedia of Philosophy**. Stanford: Metaphysics Research Lab, 2018. Disponível em: https://plato.stanford.edu/entries/skepticism-moral-responsibility/. Acesso em: 9 nov. 2026.

CHALMERS, D. J. Facing up to the problem of consciousness. **Journal of Consciousness Studies**, v. 2, n. 3, p. 200-219, 1995. Versão do autor disponível em: https://consc.net/papers/facing.html. Acesso em: 9 nov. 2026.

CLARK, A.; CHALMERS, D. The extended mind. **Analysis**, v. 58, n. 1, p. 7-19, 1998. DOI: https://doi.org/10.1093/analys/58.1.7.

COECKE, B.; FRITZ, T.; SPEKKENS, R. W. A mathematical theory of resources. **Information and Computation**, v. 250, p. 59-86, 2016. DOI: https://doi.org/10.1016/j.ic.2016.02.008. Versão consultada: arXiv:1409.5531v3.

ESPINOSA, B. de. **Ethics**. Tradução de R. H. M. Elwes. [*S. l.*]: Project Gutenberg, 2003. E-book n. 3800. Obra publicada originalmente em 1677. Disponível em: https://www.gutenberg.org/ebooks/3800. Acesso em: 9 nov. 2026.

FABIAN, S. T. et al. Why flying insects gather at artificial light. **Nature Communications**, v. 15, art. 689, 2024. DOI: https://doi.org/10.1038/s41467-024-44785-3.

FONG, B.; SPIVAK, D. I. **Seven sketches in compositionality**: an invitation to applied category theory. arXiv:1803.05316v3, 2018. Disponível em: https://arxiv.org/abs/1803.05316. Acesso em: 9 nov. 2026.

FONG, B.; SPIVAK, D. I.; TUYÉRAS, R. Backprop as functor: a compositional perspective on supervised learning. *In*: ANNUAL ACM/IEEE SYMPOSIUM ON LOGIC IN COMPUTER SCIENCE, 34., 2019, Vancouver. **Proceedings** [...]. [*S. l.*]: IEEE, 2019. p. 1-13. DOI: https://doi.org/10.1109/LICS.2019.8785665. Versão consultada: arXiv:1711.10455v3.

FRITZ, T. A synthetic approach to Markov kernels, conditional independence and theorems on sufficient statistics. **Advances in Mathematics**, v. 370, art. 107239, 2020. DOI: https://doi.org/10.1016/j.aim.2020.107239. Versão consultada: arXiv:1908.07021v8.

HUNT, D.; ZAGZEBSKI, L. Foreknowledge and free will. *In*: ZALTA, E. N.; NODELMAN, U. (ed.). **The Stanford Encyclopedia of Philosophy**. Stanford: Metaphysics Research Lab, 2026. Primeira publicação em 2004. Disponível em: https://plato.stanford.edu/entries/free-will-foreknowledge/. Acesso em: 9 nov. 2026.

LEVIN, J. Functionalism. *In*: ZALTA, E. N.; NODELMAN, U. (ed.). **The Stanford Encyclopedia of Philosophy**. Stanford: Metaphysics Research Lab, 2023. Primeira publicação em 2004. Disponível em: https://plato.stanford.edu/entries/functionalism/. Acesso em: 9 nov. 2026.

MARQUIS, J.-P. Category theory. *In*: ZALTA, E. N.; NODELMAN, U. (ed.). **The Stanford Encyclopedia of Philosophy**. Spring 2026 ed. Stanford: Metaphysics Research Lab, 2019. Disponível em: https://plato.stanford.edu/archives/spr2026/entries/category-theory/. Acesso em: 9 nov. 2026.

MCKENNA, M.; COATES, D. J. Compatibilism. *In*: ZALTA, E. N.; NODELMAN, U. (ed.). **The Stanford Encyclopedia of Philosophy**. Stanford: Metaphysics Research Lab, 2024. Primeira publicação em 2004. Disponível em: https://plato.stanford.edu/entries/compatibilism/. Acesso em: 9 nov. 2026.

NIETZSCHE, F. **Beyond good and evil**. Tradução de Helen Zimmern. [*S. l.*]: Project Gutenberg, 2003. E-book n. 4363. Obra publicada originalmente em 1886. Disponível em: https://www.gutenberg.org/ebooks/4363. Acesso em: 9 nov. 2026.

NISBETT, R. E.; WILSON, T. D. Telling more than we can know: verbal reports on mental processes. **Psychological Review**, v. 84, n. 3, p. 231-259, 1977. DOI: https://doi.org/10.1037/0033-295X.84.3.231.

NIU, N.; SPIVAK, D. I. **Polynomial functors**: a mathematical theory of interaction. arXiv:2312.00990v2, 2024. Disponível em: https://arxiv.org/abs/2312.00990. Acesso em: 9 nov. 2026.

NORTHOFF, G.; TSUCHIYA, N.; SAIGO, H. **Mathematics and the brain**: a category theoretical approach to go beyond the neural correlates of consciousness. bioRxiv, 20 jun. 2019. Preprint. DOI: https://doi.org/10.1101/674242. Publicado em: **Entropy**, v. 21, n. 12, art. 1234, 2019. DOI: https://doi.org/10.3390/e21121234.

O'CONNOR, T.; FRANKLIN, C. Free will. *In*: ZALTA, E. N.; NODELMAN, U. (ed.). **The Stanford Encyclopedia of Philosophy**. Stanford: Metaphysics Research Lab, 2022. Primeira publicação em 2002. Disponível em: https://plato.stanford.edu/entries/freewill/. Acesso em: 9 nov. 2026.

PICCININI, G. Computation in physical systems. *In*: ZALTA, E. N.; NODELMAN, U. (ed.). **The Stanford Encyclopedia of Philosophy**. Stanford: Metaphysics Research Lab, 2025. Primeira publicação em 2010. Disponível em: https://plato.stanford.edu/entries/computation-physicalsystems/. Acesso em: 9 nov. 2026.

RECK, E.; SCHIEMER, G. Structuralism in the philosophy of mathematics. *In*: ZALTA, E. N.; NODELMAN, U. (ed.). **The Stanford Encyclopedia of Philosophy**. Fall 2025 ed. Stanford: Metaphysics Research Lab, 2025. Disponível em: https://plato.stanford.edu/archives/fall2025/entries/structuralism-mathematics/. Acesso em: 9 nov. 2026.

RIEHL, E. **Category theory in context**. Mineola, NY: Dover Publications, 2016. Disponível em: https://emilyriehl.github.io/files/context-v1.pdf. Acesso em: 9 nov. 2026.

ROBINSON, H.; WEIR, R. Dualism. *In*: ZALTA, E. N.; NODELMAN, U. (ed.). **The Stanford Encyclopedia of Philosophy**. Stanford: Metaphysics Research Lab, 2025. Primeira publicação em 2003. Disponível em: https://plato.stanford.edu/entries/dualism/. Acesso em: 9 nov. 2026.

RUTTEN, J. J. M. M. Universal coalgebra: a theory of systems. **Theoretical Computer Science**, v. 249, n. 1, p. 3-80, 2000. DOI: https://doi.org/10.1016/S0304-3975(00)00056-6.

SCHWITZGEBEL, E. The unreliability of naive introspection. **Philosophical Review**, v. 117, n. 2, p. 245-273, 2008. DOI: https://doi.org/10.1215/00318108-2007-037.

SHAPIRO, L.; SPAULDING, S. Embodied cognition. *In*: ZALTA, E. N.; NODELMAN, U. (ed.). **The Stanford Encyclopedia of Philosophy**. Stanford: Metaphysics Research Lab, 2021. Disponível em: https://plato.stanford.edu/entries/embodied-cognition/. Acesso em: 9 nov. 2026.

SMITHE, T. S. C. **Mathematical foundations for a compositional account of the Bayesian brain**. 2023. Tese (Doutorado em Filosofia) – University of Oxford, Oxford, 2023. DOI: https://doi.org/10.5287/ora-kzjqyop2d. Versão consultada: arXiv:2212.12538v3.

STOLJAR, D. Physicalism. *In*: ZALTA, E. N.; NODELMAN, U. (ed.). **The Stanford Encyclopedia of Philosophy**. Stanford: Metaphysics Research Lab, 2026. Primeira publicação em 2001. Disponível em: https://plato.stanford.edu/entries/physicalism/. Acesso em: 9 nov. 2026.

SUTTON, R. S.; BARTO, A. G. **Reinforcement learning**: an introduction. 2. ed. Cambridge, MA: MIT Press, 2018. Disponível em: http://incompleteideas.net/book/RLbook2020.pdf. Acesso em: 9 nov. 2026.

TORNAU, C. Augustine of Hippo. *In*: ZALTA, E. N.; NODELMAN, U. (ed.). **The Stanford Encyclopedia of Philosophy**. Stanford: Metaphysics Research Lab, 2024. Primeira publicação em 2019. Disponível em: https://plato.stanford.edu/entries/augustine/. Acesso em: 9 nov. 2026.

WADLER, P. Propositions as types. **Communications of the ACM**, v. 58, n. 12, p. 75-84, 2015. DOI: https://doi.org/10.1145/2699407. Versão consultada: versão do autor, disponível em: https://homepages.inf.ed.ac.uk/wadler/papers/propositions-as-types/propositions-as-types.pdf. Acesso em: 9 nov. 2026.

WHEELER, J. A. Information, physics, quantum: the search for links. *In*: HEY, A. J. G. (ed.). **Feynman and computation**. Reading, MA: Perseus Books, 1999. p. 309-336. Disponível em: http://cqi.inf.usi.ch/qic/wheeler.pdf. Acesso em: 9 nov. 2026.

WILLIAMS, R. J. Simple statistical gradient-following algorithms for connectionist reinforcement learning. **Machine Learning**, v. 8, p. 229-256, 1992. DOI: https://doi.org/10.1007/BF00992696.
