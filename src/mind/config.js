// Parâmetros da arquitetura cognitiva e definição dos cenários experimentais.

/** Características avaliadas em cada alternativa de movimento. */
export const FEATURES = ['livre', 'luz', 'profundidade', 'novidade', 'fracasso', 'corrente', 'persistencia', 'vertical'];

export const FEATURE_LABEL = {
  livre: 'espaço livre',
  luz: 'luminosidade',
  profundidade: 'profundidade (raios sem retorno)',
  novidade: 'novidade',
  fracasso: 'memória de fracasso',
  corrente: 'corrente de ar',
  persistencia: 'persistência',
  vertical: 'custo vertical',
};

/**
 * Predisposições inatas (equivalentes a um "firmware" evolutivo): fototaxia positiva,
 * preferência por espaço livre, curiosidade e aversão a fracassos. Nenhuma delas
 * codifica onde está a saída. A corrente de ar começa com peso zero: só o aprendizado
 * pode descobrir que ela é informativa.
 */
export const INNATE_WEIGHTS = {
  livre: 1.0,
  luz: 1.6,
  profundidade: 1.2,
  novidade: 1.0,
  fracasso: -2.0,
  corrente: 0.0,
  persistencia: 0.7,
  vertical: -0.6,
};

export const MIND_PARAMS = {
  decisionPeriod: 0.2, // s
  temperature: 0.3,
  exploreSpeed: 2.2,
  attemptSpeed: 3.0,
  reflexGain: 1.6,
  attemptMaxTime: 9,
  attemptLightMin: 0.5,
  attemptDepthMin: 0.5,
  backoffTime: 0.5,
  frustrationDecay: 25, // s
  learningRate: 0.03,
  deltaClip: 3,
  priorPull: 0.0015,
  traceDecay: 0.92,
  weightBound: 4,
};

export const SCENARIOS = {
  'sem-memoria': {
    id: 'sem-memoria',
    label: '1 · Sem memória',
    description: 'Percebe o ambiente, mas não guarda experiências: cada instante é vivido como o primeiro.',
    memory: false,
    learning: false,
    sensors: 'full',
  },
  'com-memoria': {
    id: 'com-memoria',
    label: '2 · Com memória',
    description: 'Constrói um mapa espacial e marca fracassos; evita repetir tentativas.',
    memory: true,
    learning: false,
    sensors: 'full',
  },
  'com-aprendizado': {
    id: 'com-aprendizado',
    label: '3 · Com aprendizado',
    description: 'Memória + ajuste dos pesos das preferências por reforço; o aprendizado persiste entre episódios.',
    memory: true,
    learning: true,
    sensors: 'full',
  },
  'percepcao-limitada': {
    id: 'percepcao-limitada',
    label: '4 · Percepção limitada',
    description: 'Mesma mente do cenário 3, mas com poucos sensores, campo estreito, alcance curto, ruído e falhas.',
    memory: true,
    learning: true,
    sensors: 'limited',
  },
};
