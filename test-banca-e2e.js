/**
 * test-banca-e2e.js
 *
 * Teste E2E que gera questoes com diferentes bancas e valida:
 * - Modo LIVRE (fluxo generico/fallback)
 * - Modo CONCURSO (fluxo RAG com multiplos filtros)
 *
 * Compara as questoes geradas em ambos os modos para verificar se o RAG
 * produz questoes mais contextualizadas, com explicacoes mais completas
 * e menor propensão a alucinacoes.
 *
 * Filtros RAG testados (14 filtros, todos os disponiveis no CONCURSOS_CONFIG):
 *   - concursos.portugues                 (Portugues)
 *   - concursos.direito_constitucional    (Direito Constitucional)
 *   - concursos.direito_administrativo     (Direito Administrativo)
 *   - concursos.direito_penal             (Direito Penal)
 *   - concursos.direito_processual_civil  (Direito Processual Civil)
 *   - concursos.direito_processual_penal  (Direito Processual Penal)
 *   - concursos.direito_civil             (Direito Civil)
 *   - concursos.direito_trabalhista       (Direito Trabalhista)
 *   - concursos.direito_tributario        (Direito Tributario)
 *   - concursos.legislacao_especifica     (Legislacao Especifica)
 *   - concursos.administracao_publica     (Administracao Publica)
 *   - concursos.atualidades               (Atualidades)
 *   - concursos.informatica               (Informatica)
 *   - concursos.raciocinio_logico         (Raciocinio Logico)
 *
 * ATENCAO: valida o worker DEPLOYADO. As correcoes no worker.js
 * (getBancaAltKeys, buildExampleOptions, exemploOptions no fluxo generico)
 * precisam estar deployadas para os testes passarem.
 *
 * Uso: node test-banca-e2e.js [WORKER_URL] [--filter=<nome>] [--banca=<nome>]
 * Ex:  node test-banca-e2e.js                                            (todos filtros x todas bancas)
 * Ex:  node test-banca-e2e.js --filter=penal                             (apenas Dir. Penal)
 * Ex:  node test-banca-e2e.js --banca=cespe                              (apenas CESPE, todos filtros)
 * Ex:  node test-banca-e2e.js --filter=penal --banca=cespe               (Dir. Penal + CESPE)
 * Ex:  node test-banca-e2e.js http://localhost:8787 --filter=civil       (filtro local)
 */

function parseCLIArgs() {
  const args = process.argv.slice(2);
  const result = { workerUrl: 'https://studymaster-worker.cesarmuniz0816.workers.dev', filterName: null, bancaName: null };
  for (const arg of args) {
    if (arg.startsWith('--filter=')) {
      result.filterName = arg.replace('--filter=', '').trim();
    } else if (arg.startsWith('--banca=')) {
      result.bancaName = arg.replace('--banca=', '').trim();
    } else if (!arg.startsWith('--')) {
      result.workerUrl = arg;
    }
  }
  return result;
}

const CLI = parseCLIArgs();
const WORKER_URL = CLI.workerUrl;

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    console.log('  ✅', msg);
    passed++;
  } else {
    console.log('  ❌', msg);
    failed++;
  }
}

function assertEq(actual, expected, msg) {
  if (actual === expected) {
    console.log('  ✅', msg, `(${actual})`);
    passed++;
  } else {
    console.log('  ❌', msg, `— esperado ${expected}, recebido ${actual}`);
    failed++;
  }
}

function assertIncludes(arr, item, msg) {
  if (arr.includes(item)) {
    console.log('  ✅', msg, `(contém ${item})`);
    passed++;
  } else {
    console.log('  ❌', msg, `— array [${arr.join(',')}] não contém ${item}`);
    failed++;
  }
}

/**
 * Gera e retorna uma questao do worker
 * @param {string} modeLabel - Rotulo para exibicao
 * @param {object} payload - Payload do worker
 * @returns {object|null} { question: q, bancaLabel, expectedOpts, expectedKeys, isRag, filterLabel } ou null
 */
async function fetchQuestion(modeLabel, payload, bancaLabel, expectedOpts, expectedKeys, isRag, filterLabel) {
  console.log(`  [${modeLabel}] ${bancaLabel}${filterLabel ? ' [' + filterLabel + ']' : ''}...`);

  try {
    const resp = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await resp.json();

    if (!data.success) {
      console.log('    Status:', resp.status, '| Error:', data.error || data.message || 'N/A');
      return null;
    }

    const questions = data.questions || [];
    if (questions.length === 0) {
      console.log('    ⚠ Nenhuma questao retornada');
      return null;
    }

    const q = questions[0];
    console.log('    Status:', resp.status, '| Options:', (q.options || []).length, '| Sources:', q._sources);

    return {
      question: q,
      bancaLabel,
      expectedOpts,
      expectedKeys,
      isRag,
      modeLabel,
      filterLabel: filterLabel || null
    };
  } catch (err) {
    console.log('    ERRO de rede:', err.message);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════

function validateQuestion(result) {
  if (!result) return;
  const q = result.question;
  const { bancaLabel, expectedOpts, expectedKeys, isRag } = result;
  const opts = q.options || [];
  const keys = opts.map(o => o.key);
  const correctAnswer = q.correctAnswer;

  // 1. Numero de alternativas
  assertEq(opts.length, expectedOpts, `${bancaLabel}: ${expectedOpts} alternativas`);

  // 2. Chaves bidirecionais
  assertEq(keys.length, expectedKeys.length, `${bancaLabel}: ${expectedKeys.length} chaves`);
  keys.forEach((k) => {
    assert(expectedKeys.includes(k),
      `${bancaLabel}: key "${k}" esta no conjunto [${expectedKeys.join(',')}]`);
  });
  expectedKeys.forEach((ek) => {
    assert(keys.includes(ek),
      `${bancaLabel}: chave esperada "${ek}" aparece na resposta`);
  });

  // 3. correctAnswer valido
  assertIncludes(keys, correctAnswer,
    `${bancaLabel}: correctAnswer (${correctAnswer}) esta entre as opcoes`);

  // 4. Texto das opcoes
  opts.forEach((o, i) => {
    assert(o.text && o.text.trim().length > 0,
      `${bancaLabel}: option[${i}] tem texto nao vazio`);
  });

  // 5. Statement
  assert(q.statement && q.statement.trim().length >= 10,
    `${bancaLabel}: statement tem tamanho minimo`);

  // 6. Explanation
  assert(q.explanation && q.explanation.trim().length >= 10,
    `${bancaLabel}: explanation tem tamanho minimo`);

  // 7. Metadata RAG
  if (isRag) {
    assert(q._sources !== undefined, `${bancaLabel}: _sources definido`);
    assert(q._antiHallucination !== undefined, `${bancaLabel}: _antiHallucination definido`);
  }
}

// ═══════════════════════════════════════════════════════════════
// HALLUCINATION DETECTION
// ═══════════════════════════════════════════════════════════════

/**
 * Detecta indicadores de possivel alucinacao em texto gerado.
 *
 * Cada padrao e categorizado por severidade:
 *   HIGH   — indica alta probabilidade de alucinacao (vaga autoridade, afirmacoes absolutas)
 *   MEDIUM — indica possivel falta de fundamentacao (termos vagos, generalizacoes)
 *   LOW    — indicador suave de ambiguedade
 *
 * Retorna: { total, high, medium, low, items: [{ severity, pattern, category }] }
 */
function detectHallucinationIndicators(text) {
  if (!text || typeof text !== 'string') {
    return { total: 0, high: 0, medium: 0, low: 0, items: [] };
  }

  const clean = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Cada entrada: [ regex, severity, category ]
  const patterns = [
    // ── HIGH SEVERITY ──────────────────────────────────────
    [/(?:\bsegundo\s+a\s+doutrina\b|\bde\s+acordo\s+com\s+a\s+doutrina\b|\ba\s+doutrina\s+entende\b|\bpara\s+a\s+doutrina\b|\bconforme\s+a\s+doutrina\b)/g,   'HIGH', 'referencia doutrinaria vaga'],
    [/(?:\bsegundo\s+a\s+jurisprudencia\b|\bos\s+tribunais\s+entendem\b|\bentendimento\s+jurisprudencial\b|\bentendimento\s+dos\s+tribunais\b|\bjurisprudencia\s+consolidada\b)/g, 'HIGH', 'referencia jurisprudencial vaga'],
    [/(?:\bnao\s+ha\s+dividas\b|\be\s+incontroverso\b|\be\s+pacifico\b|\babsolutamente\s+certo\b)/g,                                                         'HIGH', 'afirmacao absoluta sem fonte'],
    [/(?:\bestudos\s+indicam\b|\bpesquisas\s+apontam\b|\bespecialistas\s+afirmam\b|\bestudos\s+mostram\b)/g,                                                'HIGH', 'autoridade vaga nao identificada'],
    [/(?:\btalvez\b|\bprovavelmente\b|\bpossivelmente\b)/g,                                                                                                  'HIGH', 'linguagem de especulacao (hedging)'],

    // ── MEDIUM SEVERITY ────────────────────────────────────
    [/(?:\bgeralmente\b|\bnormalmente\b|\bcomumente\b|\bfrequentemente\b)/g,                                                                                  'MEDIUM', 'frequencia vaga'],
    [/(?:\bem\s+todos\s+os\s+casos\b|\bem\s+qualquer\s+hipotese\b|\bem\s+nenhum\s+caso\b)/g,                                                                  'MEDIUM', 'generalizacao absoluta'],
    [/(?:\bcomo\s+sabemos\b|\bcomo\s+e\s+sabido\b|\bcomo\s+todos\s+sabem\b)/g,                                                                                 'MEDIUM', 'conhecimento presumido sem fonte'],
    [/(?:\bsegundo\s+\w+\s+\w+\s+(?:apud|citado|mencionado)\b|\bconforme\s+\w+\s+apud\b)/g,                                                                   'MEDIUM', 'citacao indireta sem verificacao'],

    // ── LOW SEVERITY ──────────────────────────────────────
    [/(?:\bpode\s+ser\s+considerado\b|\bpode\s+ser\s+entendido\b)/g,                                                                                          'LOW', 'linguagem ambigua'],
  ];

  const items = [];

  for (const [regex, severity, category] of patterns) {
    let match;
    regex.lastIndex = 0;
    while ((match = regex.exec(clean)) !== null) {
      items.push({
        severity,
        category,
        match: match[0].trim()
      });
    }
  }

  const high = items.filter(i => i.severity === 'HIGH').length;
  const medium = items.filter(i => i.severity === 'MEDIUM').length;
  const low = items.filter(i => i.severity === 'LOW').length;

  return { total: items.length, high, medium, low, items };
}

// ═══════════════════════════════════════════════════════════════
// TEXT QUALITY ANALYSIS
// ═══════════════════════════════════════════════════════════════

function analyzeTextQuality(text) {
  const clean = (text && typeof text === 'string') ? text.trim() : '';
  const words = clean.split(/\s+/).filter(Boolean);
  const sentences = clean.split(/[.!?]+/).filter(s => s.trim().length > 0);
  // Termos que indicam especificidade
  const specificPattern = /(artigo|parágrafo|inciso|lei|constituição|código|decreto|súmula|enunciado|princípio|teoria|doutrina|jurisprudência|súmula vinculante|adct|emenda constitucional|resolução|portaria|instrução normativa|medida provisória|lei complementar|lei ordinária|decreto-lei)/gi;
  const specificTerms = (clean.match(specificPattern) || []).length;
  const hallucination = detectHallucinationIndicators(clean);
  return {
    length: clean.length,
    words: words.length,
    sentences: sentences.length,
    specificTerms,
    hallucination
  };
}

// ═══════════════════════════════════════════════════════════════
// COMPARISON
// ═══════════════════════════════════════════════════════════════

function displayHallucinationStats(h, prefix) {
  if (h.total === 0) {
    console.log(`    ${prefix} Sem indicadores de alucinacao detectados ✅`);
    return h;
  }

  const severityLabel = h.high > 0 ? '🔥' : h.medium > 0 ? '⚠️' : 'ℹ️';
  console.log(`    ${prefix} ${severityLabel} ${h.total} indicador(es) (HIGH=${h.high}, MEDIUM=${h.medium}, LOW=${h.low})`);

  // Agrupar por categoria
  const byCategory = {};
  h.items.forEach(item => {
    if (!byCategory[item.category]) byCategory[item.category] = { count: 0, severity: item.severity, examples: [] };
    byCategory[item.category].count++;
    if (byCategory[item.category].examples.length < 2) {
      byCategory[item.category].examples.push(item.match);
    }
  });

  Object.entries(byCategory).forEach(([cat, info]) => {
    const sevIcon = info.severity === 'HIGH' ? '🔴' : info.severity === 'MEDIUM' ? '🟡' : '🟢';
    const exStr = info.examples.length > 0 ? ` (ex: "${info.examples.join('", "')}")` : '';
    console.log(`    ${prefix}   ${sevIcon} ${cat} x${info.count}${exStr}`);
  });

  return h;
}

/**
 * Compara LIVRE vs CONCURSO para uma banca, mostrando resultados de todos os filtros.
 * @param {object} livre - Resultado LIVRE para a banca
 * @param {object[]} concursoResults - Array de resultados CONCURSO (um por filtro)
 */
function compareResults(livre, concursoResults) {
  if (!livre) return;
  const label = livre.bancaLabel;
  const qL = livre.question;
  const optsL = qL.options || [];

  console.log(`\n  ════════════════════════════════════════`);
  console.log(`  Comparacao: ${label}`);
  console.log(`  ════════════════════════════════════════`);

  // Analisa LIVRE uma vez
  const stL = analyzeTextQuality(qL.statement);
  const exL = analyzeTextQuality(qL.explanation);
  const avgOptLenL = optsL.reduce((s, o) => s + (o.text || '').length, 0) / Math.max(optsL.length, 1);

  console.log(`\n  📄 LIVRE (fallback, sem RAG):`);
  console.log(`    Statement:    ${stL.length} chars, ${stL.specificTerms} termos especificos`);
  console.log(`    Explanation:  ${exL.length} chars`);
  console.log(`    Avg option:   ${avgOptLenL.toFixed(0)} chars`);
  console.log(`    Alucinacoes:  ${stL.hallucination.total + exL.hallucination.total} (${stL.hallucination.high + exL.hallucination.high} HIGH, ${stL.hallucination.medium + exL.hallucination.medium} MEDIUM)`);

  for (const concurso of concursoResults) {
    if (!concurso) {
      console.log(`\n  ⚠ [sem dados] CONCURSO indisponivel`);
      continue;
    }

    const qC = concurso.question;
    const optsC = qC.options || [];
    const filterLabel = concurso.filterLabel || 'desconhecido';

    const stC = analyzeTextQuality(qC.statement);
    const exC = analyzeTextQuality(qC.explanation);
    const avgOptLenC = optsC.reduce((s, o) => s + (o.text || '').length, 0) / Math.max(optsC.length, 1);

    console.log(`\n  ── RAG: ${filterLabel} ──`);
    console.log(`    Statement:    ${stC.length} chars, ${stC.specificTerms} termos especificos ${stC.length > stL.length ? '📈 +' + (stC.length - stL.length) : '📉 ' + (stC.length - stL.length)}`);
    console.log(`    Explanation:  ${exC.length} chars ${exC.length > exL.length * 0.8 ? '✅ adequado' : '⚠️ curto'}`);
    console.log(`    Avg option:   ${avgOptLenC.toFixed(0)} chars`);
    console.log(`    Alucinacoes:  ${stC.hallucination.total + exC.hallucination.total} (${stC.hallucination.high + exC.hallucination.high} HIGH, ${stC.hallucination.medium + exC.hallucination.medium} MEDIUM)`);

    // Termos especificos
    if (stC.specificTerms > stL.specificTerms) {
      console.log(`    📈 RAG adicionou +${stC.specificTerms - stL.specificTerms} termos especificos`);
    }

    // Alucinacoes
    const totalH_L = stL.hallucination.total + exL.hallucination.total;
    const totalH_C = stC.hallucination.total + exC.hallucination.total;
    const aluDiff = totalH_L - totalH_C;
    if (aluDiff > 0) {
      console.log(`    ✅ RAG tem -${aluDiff} indicadores de alucinacao que LIVRE`);
    } else if (aluDiff < 0) {
      console.log(`    ⚠ RAG tem +${Math.abs(aluDiff)} indicadores de alucinacao que LIVRE`);
    } else {
      console.log(`    ℹ️ Mesma quantidade de indicadores de alucinacao`);
    }

    // Detalhamento alucinacao STATEMENT
    console.log(`    🔍 Statement alucinacao:`);
    displayHallucinationStats(stC.hallucination, '      ');

    // Detalhamento alucinacao EXPLANATION
    console.log(`    🔍 Explanation alucinacao:`);
    displayHallucinationStats(exC.hallucination, '      ');

    // Metadados RAG
    const sources = qC._sources;
    const antiH = qC._antiHallucination;
    if (sources !== undefined && sources > 0) {
      console.log(`    📚 ${sources} fontes RAG`);
    } else if (sources !== undefined && sources === 0) {
      console.log(`    ℹ️ Fallback (RAG insuficiente)`);
    }
    if (antiH === 'verified') {
      console.log(`    🛡️ Anti-alucinacao: verified`);
    } else if (antiH === 'warning') {
      console.log(`    ⚠ Anti-alucinacao: warning`);
    }

    // Statement
    console.log(`    📝 Statement CONCURSO:`);
    console.log(`      ${(qC.statement || '').substring(0, 300)}`);
  }

  // Statements na integra (LIVRE)
  console.log(`\n  📝 Statement LIVRE (completo):`);
  console.log(`    ${(qL.statement || '').substring(0, 500)}`);
  console.log(`  📖 Explanation LIVRE (inicio):`);
  console.log(`    ${(qL.explanation || '').substring(0, 300)}...`);
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const scenarios = [
  { banca: 'cespe',  label: 'CESPE / Cebraspe', opts: 2, keys: ['C', 'E'] },
  { banca: 'ibfc',   label: 'IBFC',              opts: 4, keys: ['A', 'B', 'C', 'D'] },
  { banca: 'fcc',    label: 'FCC',               opts: 5, keys: ['A', 'B', 'C', 'D', 'E'] },
  { banca: 'fgv',    label: 'FGV',               opts: 5, keys: ['A', 'B', 'C', 'D', 'E'] },
  { banca: 'vunesp', label: 'VUNESP',            opts: 5, keys: ['A', 'B', 'C', 'D', 'E'] },
];

const filterScenarios = [
  // ── Linguagens ──
  { filter: 'concursos.portugues',              label: 'Português' },

  // ── Direito ──
  { filter: 'concursos.direito_constitucional',  label: 'Dir. Constitucional' },
  { filter: 'concursos.direito_administrativo',  label: 'Dir. Administrativo' },
  { filter: 'concursos.direito_penal',          label: 'Dir. Penal' },
  { filter: 'concursos.direito_processual_civil',label: 'Dir. Proc. Civil' },
  { filter: 'concursos.direito_processual_penal',label: 'Dir. Proc. Penal' },
  { filter: 'concursos.direito_civil',          label: 'Dir. Civil' },
  { filter: 'concursos.direito_trabalhista',    label: 'Dir. Trabalhista' },
  { filter: 'concursos.direito_tributario',     label: 'Dir. Tributário' },
  { filter: 'concursos.legislacao_especifica',  label: 'Leg. Específica' },

  // ── Gerais ──
  { filter: 'concursos.administracao_publica',  label: 'Adm. Pública' },
  { filter: 'concursos.atualidades',            label: 'Atualidades' },
  { filter: 'concursos.informatica',            label: 'Informática' },
  { filter: 'concursos.raciocinio_logico',      label: 'Raciocínio Lógico' },
];

const livrePayload = (banca) => ({
  mode: 'livre',
  freeText: 'A Constituição Federal de 1988 estabelece os direitos e garantias fundamentais. O artigo 5º trata dos direitos individuais e coletivos.',
  difficulty: 'medium',
  quantity: 1,
  questionType: 'mcq',
  idioma: 'pt-BR',
  banca: banca,
  bancaFoco: banca
});

const concursoPayload = (filter) => (banca) => ({
  mode: 'concurso',
  filter: filter,
  difficulty: 'medium',
  quantity: 1,
  questionType: 'mcq',
  idioma: 'pt-BR',
  banca: banca,
  bancaFoco: banca
});

// ═══════════════════════════════════════════════════════════════
// SUMMARY HELPERS
// ═══════════════════════════════════════════════════════════════

function calcAvg(array, getter) {
  return array.reduce((s, r) => s + getter(r), 0) / Math.max(array.length, 1);
}

function printFilterSummary(filterLabel, filterKey, results) {
  console.log(`\n  ── ${filterLabel} (${filterKey}) ──`);
  console.log(`    Questoes:         ${results.length}`);

  const ragSources = results.filter(r => r.question._sources > 0).length;
  const verified = results.filter(r => r.question._antiHallucination === 'verified').length;
  const warnings = results.filter(r => r.question._antiHallucination === 'warning').length;

  console.log(`    Fontes RAG:       ${ragSources}/${results.length}`);
  console.log(`    Anti-alucinacao:  ${verified} verified, ${warnings} warnings`);

  const avgSt = calcAvg(results, r => (r.question.statement || '').length);
  const avgEx = calcAvg(results, r => (r.question.explanation || '').length);
  const avgTerm = calcAvg(results, r => analyzeTextQuality(r.question.statement).specificTerms);

  console.log(`    Statement medio:  ${avgSt.toFixed(0)} chars`);
  console.log(`    Explanation medio:${avgEx.toFixed(0)} chars`);
  console.log(`    Termos especificos medio: ${avgTerm.toFixed(1)}`);

  // Hallucination
  const hStTotal = results.reduce((s, r) => s + analyzeTextQuality(r.question.statement).hallucination.total, 0);
  const hExTotal = results.reduce((s, r) => s + analyzeTextQuality(r.question.explanation).hallucination.total, 0);
  const hTotal = hStTotal + hExTotal;
  const hHigh = results.reduce((s, r) => s +
    analyzeTextQuality(r.question.statement).hallucination.high +
    analyzeTextQuality(r.question.explanation).hallucination.high, 0);
  const hMed = results.reduce((s, r) => s +
    analyzeTextQuality(r.question.statement).hallucination.medium +
    analyzeTextQuality(r.question.explanation).hallucination.medium, 0);

  console.log(`    Indicadores alucinacao: ${hTotal} (${hHigh} HIGH, ${hMed} MEDIUM, ${hTotal > 0 ? (hTotal / results.length).toFixed(1) + '/questao' : '0/questao'})`);
}

/**
 * Busca um filtro em filterScenarios por correspondencia parcial.
 * Procura no filter key (apos "concursos.") e no label.
 * Ex: matchFilter("penal") encontra "concursos.direito_penal"
 */
function matchFilter(name) {
  if (!name) return null;
  const search = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // 1. Tenta match exato no filter key
  let match = filterScenarios.find(f => f.filter === `concursos.${search}`);
  if (match) return match;
  // 2. Tenta match parcial no filter key (apos "concursos.")
  match = filterScenarios.find(f => f.filter.replace('concursos.', '').includes(search));
  if (match) return match;
  // 3. Tenta match parcial no label
  const safeLabel = search.replace(/[^a-z0-9]/g, '');
  match = filterScenarios.find(f => {
    const fl = f.label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
    return fl.includes(safeLabel);
  });
  if (match) return match;
  return null;
}

/**
 * Busca uma banca em scenarios por correspondencia parcial.
 * Procura no banca key e no label.
 * Ex: matchBanca("cespe") encontra o cenario do CESPE
 */
function matchBanca(name) {
  if (!name) return null;
  const search = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // 1. Tenta match exato no banca key
  let match = scenarios.find(s => s.banca === search);
  if (match) return match;
  // 2. Tenta match parcial no banca key
  match = scenarios.find(s => s.banca.includes(search));
  if (match) return match;
  // 3. Tenta match parcial no label
  const safeLabel = search.replace(/[^a-z0-9]/g, '');
  match = scenarios.find(s => {
    const sl = s.label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
    return sl.includes(safeLabel);
  });
  if (match) return match;
  return null;
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════
async function main() {
  // Aplica filtro CLI e banca CLI se especificados
  let activeFilters = filterScenarios;
  let activeBancas = scenarios;

  if (CLI.filterName) {
    const matched = matchFilter(CLI.filterName);
    if (matched) {
      activeFilters = [matched];
      console.log(`🔍 Modo filtro unico: "${matched.label}" (${matched.filter})`);
    } else {
      console.log(`❌ Filtro "${CLI.filterName}" nao encontrado.`);
      console.log(`   Filtros disponiveis:\n     ${filterScenarios.map(f => `${f.filter.split('.')[1]} (${f.label})`).join('\n     ')}`);
      process.exit(1);
    }
  }

  if (CLI.bancaName) {
    const matched = matchBanca(CLI.bancaName);
    if (matched) {
      activeBancas = [matched];
      console.log(`🔍 Modo banca unica: "${matched.label}" (${matched.banca})`);
    } else {
      console.log(`❌ Banca "${CLI.bancaName}" nao encontrada.`);
      console.log(`   Bancas disponiveis:\n     ${scenarios.map(s => `${s.banca} (${s.label})`).join('\n     ')}`);
      process.exit(1);
    }
  }

  if (CLI.filterName || CLI.bancaName) console.log();

  console.log('══════════════════════════════════════════════════════');
  console.log('  E2E: Validacao de Alternativas por Banca x Filtro');
  console.log('══════════════════════════════════════════════════════');
  console.log('Worker URL:', WORKER_URL);
  console.log('Data:', new Date().toISOString());
  console.log('Filtros RAG:', activeFilters.map(f => f.label).join(', '));
  console.log('Bancas:', activeBancas.map(s => s.label).join(', '));
  console.log();

  // ── TEST SUITE 1: Coletar questoes ──
  console.log('═══════ Coletando questoes ═══════\n');

  const livreResults = [];
  const concursoResults = []; // Array de arrays: concursoResults[bancaIdx][filterIdx] = result

  // LIVRE: 1 chamada por banca
  for (const s of activeBancas) {
    const r = await fetchQuestion('LIVRE', livrePayload(s.banca), s.label, s.opts, s.keys, false);
    if (r) livreResults.push(r);
  }

  console.log();

  // CONCURSO: N chamadas por banca (1 por filtro)
  for (const s of activeBancas) {
    const bancaResults = [];
    for (const f of activeFilters) {
      const r = await fetchQuestion('CONCURSO', concursoPayload(f.filter)(s.banca), s.label, s.opts, s.keys, true, f.label);
      if (r) bancaResults.push(r);
    }
    if (bancaResults.length > 0) concursoResults.push(bancaResults);
  }

  // ── TEST SUITE 2: Validar estrutura das questoes ──
  console.log('\n═══════ Validando estrutura ═══════\n');

  for (const r of livreResults) {
    validateQuestion(r);
  }
  for (const bancaArr of concursoResults) {
    for (const r of bancaArr) {
      validateQuestion(r);
    }
  }

  // ── TEST SUITE 3: Comparar LIVRE vs CONCURSO ──
  console.log('\n══════════════════════════════════════════════════════');
  console.log('  COMPARACAO: LIVRE (fallback) vs CONCURSO (RAG)');
  console.log('══════════════════════════════════════════════════════\n');

  for (const livre of livreResults) {
    const concursoArr = concursoResults.find(arr =>
        arr.length > 0 && arr[0].bancaLabel === livre.bancaLabel
    ) || [];
    compareResults(livre, concursoArr);
    console.log();
  }

  // ── TEST SUITE 4: Resumo consolidado ──
  console.log('\n══════════════════════════════════════════════════════');
  console.log('  RESUMO COMPARATIVO POR FILTRO');
  console.log('══════════════════════════════════════════════════════\n');

  console.log(`  Total questoes LIVRE:  ${livreResults.length}`);
  console.log(`  Total questoes CONCURSO: ${concursoResults.reduce((s, a) => s + a.length, 0)}`);
  console.log();

  // LIVRE baseline
  console.log('  ── LIVRE (baseline, sem RAG) ──');
  const avgStL = calcAvg(livreResults, r => (r.question.statement || '').length);
  const avgExL = calcAvg(livreResults, r => (r.question.explanation || '').length);
  const avgTermL = calcAvg(livreResults, r => analyzeTextQuality(r.question.statement).specificTerms);
  const hLTotal = livreResults.reduce((s, r) => s +
    analyzeTextQuality(r.question.statement).hallucination.total +
    analyzeTextQuality(r.question.explanation).hallucination.total, 0);
  const hLHigh = livreResults.reduce((s, r) => s +
    analyzeTextQuality(r.question.statement).hallucination.high +
    analyzeTextQuality(r.question.explanation).hallucination.high, 0);
  console.log(`    Statement medio:     ${avgStL.toFixed(0)} chars`);
  console.log(`    Explanation medio:   ${avgExL.toFixed(0)} chars`);
  console.log(`    Termos especificos:  ${avgTermL.toFixed(1)}`);
  console.log(`    Indicadores aluc.:   ${hLTotal} (${hLHigh} HIGH)`);

  // CONCURSO: agrupar por filtro
  const concursoByFilter = {};
  for (const bancaArr of concursoResults) {
    for (const r of bancaArr) {
      const key = r.filterLabel || 'desconhecido';
      if (!concursoByFilter[key]) concursoByFilter[key] = [];
      concursoByFilter[key].push(r);
    }
  }

  for (const f of activeFilters) {
    const results = concursoByFilter[f.label] || [];
    if (results.length > 0) {
      printFilterSummary(f.label, f.filter, results);

      // Diferenca vs LIVRE
      const avgStC = calcAvg(results, r => (r.question.statement || '').length);
      const avgExC = calcAvg(results, r => (r.question.explanation || '').length);
      const avgTermC = calcAvg(results, r => analyzeTextQuality(r.question.statement).specificTerms);

      console.log(`    vs LIVRE:`);
      console.log(`      Statement:     ${avgStC > avgStL ? '📈 +' + (avgStC - avgStL).toFixed(0) : '📉 ' + (avgStC - avgStL).toFixed(0)} chars`);
      console.log(`      Explanation:   ${avgExC > avgExL ? '📈 +' + (avgExC - avgExL).toFixed(0) : '📉 ' + (avgExC - avgExL).toFixed(0)} chars`);
      console.log(`      Termos espec.: ${avgTermC > avgTermL ? '📈 +' + (avgTermC - avgTermL).toFixed(1) : '📉 ' + (avgTermC - avgTermL).toFixed(1)}`);
    } else {
      console.log(`\n  ── ${f.label} (${f.filter}) ──`);
      console.log('    ⚠ Sem dados');
    }
  }

  // ── Summary ──
  const total = passed + failed;
  console.log('\n══════════════════════════════════════════════════════');
  console.log(`  Resultado: ${passed}/${total} passed`);
  if (failed > 0) {
    console.log(`             ${failed}/${total} FAILED ❌`);
    process.exit(1);
  } else {
    console.log('  TODOS OS TESTES PASSARAM ✅');
  }
  console.log('══════════════════════════════════════════════════════');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
