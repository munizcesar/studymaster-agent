/**
 * scripts/sprint4_gates.js
 * Executa todos os Gates da Sprint 4 em sequência.
 * Uso: node scripts/sprint4_gates.js
 */

const { execSync } = require('child_process');
const { ulid } = require('ulidx');

const WORKER_URL = 'https://studymaster-worker.cesarmuniz0816.workers.dev';
const D1_DB = 'studymaster-editais';
const REAL_URL = 'https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf';
const BAD_URL = 'https://httpstat.us/500'; // sempre retorna 500

function d1Query(sql) {
  const res = execSync(
    `npx wrangler d1 execute ${D1_DB} --remote --json --command="${sql.replace(/\n/g, ' ').replace(/"/g, '\\"')}"`
  ).toString();
  return JSON.parse(res);
}

function d1Exec(sql) {
  return execSync(
    `npx wrangler d1 execute ${D1_DB} --remote --command="${sql.replace(/\n/g, ' ').replace(/"/g, '\\"')}"`
  ).toString();
}

async function httpPost(path, body) {
  const r = await fetch(`${WORKER_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return r.json();
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function getIngest(ingestId) {
  const rows = d1Query(`SELECT * FROM ingestoes WHERE id='${ingestId}'`);
  return rows[0]?.results?.[0] || null;
}

async function getEvents(ingestId) {
  const rows = d1Query(`SELECT * FROM ingestao_eventos WHERE ingestao_id='${ingestId}' ORDER BY criado_em`);
  return rows[0]?.results || [];
}

async function setupJob(label, url = REAL_URL, maxTentativas = 3) {
  const concursoRows = d1Query(`SELECT id FROM concursos WHERE slug='policia-civil-sp-2023'`);
  const concursoId = concursoRows[0]?.results?.[0]?.id;
  const fonteRows = d1Query(`SELECT id FROM fontes LIMIT 1`);
  const fonteId = fonteRows[0]?.results?.[0]?.id;

  const docId = `doc_${ulid()}`;
  const ingestId = `ing_${ulid()}`;

  d1Exec(`INSERT INTO documentos (id, concurso_id, fonte_id, tipo, status_documento, url_origem)
          VALUES ('${docId}', '${concursoId}', '${fonteId}', 'edital', 'descoberto', '${url}')`);
  d1Exec(`INSERT INTO ingestoes (id, documento_id, status, tentativas, max_tentativas, versao_pipeline, inicio_processamento)
          VALUES ('${ingestId}', '${docId}', 'DESCOBERTO', 0, ${maxTentativas}, '4.0.0', CURRENT_TIMESTAMP)`);

  console.log(`  [SETUP ${label}] docId=${docId} ingestId=${ingestId}`);
  return { docId, ingestId, concursoId };
}

async function enqueue(ingestId, docId, concursoId, url = REAL_URL) {
  return httpPost('/api/ingest/enqueue', { ingestId, docId, url, concursoId });
}

// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n═══════════════ SPRINT 4 — GATE TESTS ═══════════════\n');

  // ─── GATE 7: REGRESSÃO (executar primeiro, não depende de queue) ───────────
  console.log('[ GATE 7 ] Busca existente não regrediu...');
  const [r1, r2, r3] = await Promise.all([
    httpPost('/api/editais/search', { query: 'pcsp' }),
    httpPost('/api/editais/search', { query: 'polícia civil' }),
    httpPost('/api/editais/search', { query: 'escrivão' })
  ]);
  const gate7 = r1.success && r1.results?.length > 0 &&
                r2.success &&
                r3.success && r3.results?.length > 0;
  console.log(`  pcsp: ${r1.results?.length} resultado(s)`);
  console.log(`  polícia civil: ${r2.results?.length} resultado(s)`);
  console.log(`  escrivão: ${r3.results?.length} resultado(s)`);
  console.log(`  GATE 7: ${gate7 ? '✅ PASSOU' : '❌ FALHOU'}\n`);

  // ─── GATE 1: SUCESSO ──────────────────────────────────────────────────────
  console.log('[ GATE 1 ] Job válido → CONCLUIDO...');
  const g1 = await setupJob('G1');
  const enqR1 = await enqueue(g1.ingestId, g1.docId, g1.concursoId, REAL_URL);
  console.log(`  Enqueue: ${JSON.stringify(enqR1)}`);
  console.log('  Aguardando consumer processar (30s)...');
  await sleep(30000);
  const g1State = await getIngest(g1.ingestId);
  const g1Events = await getEvents(g1.ingestId);
  console.log(`  Status final: ${g1State?.status}`);
  console.log(`  Eventos: ${g1Events.map(e => e.novo_estado).join(' → ')}`);
  const gate1 = g1State?.status === 'CONCLUIDO' || g1State?.status === 'CONCLUIDO_DUPLICADO';
  console.log(`  GATE 1: ${gate1 ? '✅ PASSOU' : '❌ FALHOU (Status: ' + g1State?.status + ')'}\n`);

  // ─── GATE 4: IDEMPOTÊNCIA ─────────────────────────────────────────────────
  console.log('[ GATE 4 ] Mesmo ingestId enfileirado 2x → um único processamento...');
  const g4 = await setupJob('G4');
  await enqueue(g4.ingestId, g4.docId, g4.concursoId, REAL_URL);
  await enqueue(g4.ingestId, g4.docId, g4.concursoId, REAL_URL); // duplicado
  console.log('  Aguardando (35s)...');
  await sleep(35000);
  const g4State = await getIngest(g4.ingestId);
  const g4Events = await getEvents(g4.ingestId);
  // Idempotência: lock atômico impede dois processamentos; eventos não devem ter BAIXANDO duplicado
  const baixandoCount = g4Events.filter(e => e.novo_estado === 'BAIXANDO').length;
  const gate4 = baixandoCount <= 1;
  console.log(`  Status: ${g4State?.status}`);
  console.log(`  Transições BAIXANDO: ${baixandoCount} (esperado: ≤1)`);
  console.log(`  GATE 4: ${gate4 ? '✅ PASSOU' : '❌ FALHOU'}\n`);

  // ─── GATE 3: DLQ (max_tentativas = 1, URL que falha) ─────────────────────
  console.log('[ GATE 3 ] Falha permanente → max_tentativas → FALHA_PERMANENTE...');
  const g3 = await setupJob('G3', BAD_URL, 1); // max 1 tentativa
  await enqueue(g3.ingestId, g3.docId, g3.concursoId, BAD_URL);
  console.log('  Aguardando (45s para retry + DLQ)...');
  await sleep(45000);
  const g3State = await getIngest(g3.ingestId);
  const g3Events = await getEvents(g3.ingestId);
  const gate3 = g3State?.status === 'FALHA_PERMANENTE' && g3State?.dlq_at !== null;
  console.log(`  Status: ${g3State?.status}`);
  console.log(`  dlq_at: ${g3State?.dlq_at}`);
  console.log(`  tentativas: ${g3State?.tentativas}`);
  console.log(`  Eventos: ${g3Events.map(e => e.novo_estado).join(' → ')}`);
  console.log(`  GATE 3: ${gate3 ? '✅ PASSOU' : '❌ FALHOU'}\n`);

  // ─── GATE 8: RECUPERAÇÃO DE STALE LOCK ───────────────────────────────────
  console.log('[ GATE 8 ] Stale lock antigo → novo consumer recupera job...');
  const g8 = await setupJob('G8');
  // Simular stale lock: inserir processando_desde no passado (6 min atrás)
  const staleTime = new Date(Date.now() - 6 * 60 * 1000).toISOString();
  d1Exec(`UPDATE ingestoes SET status='BAIXANDO', processando_desde='${staleTime}' WHERE id='${g8.ingestId}'`);
  d1Exec(`UPDATE ingestoes SET tentativas=0 WHERE id='${g8.ingestId}'`);
  // Enfileirar — o consumer deve detectar lock stale e adquirir
  await enqueue(g8.ingestId, g8.docId, g8.concursoId, REAL_URL);
  console.log('  Aguardando (30s)...');
  await sleep(30000);
  const g8State = await getIngest(g8.ingestId);
  const gate8 = ['CONCLUIDO','CONCLUIDO_DUPLICADO','FALHA_DOWNLOAD','FALHA_EXTRACAO'].includes(g8State?.status);
  console.log(`  Status após recuperação: ${g8State?.status}`);
  console.log(`  GATE 8: ${gate8 ? '✅ PASSOU (lock stale foi recuperado)' : '❌ FALHOU (status ainda: ' + g8State?.status + ')'}\n`);

  // ─── GATE 6: OBSERVABILIDADE ──────────────────────────────────────────────
  console.log('[ GATE 6 ] Auditoria de transições em ingestao_eventos...');
  const evG1 = await getEvents(g1.ingestId);
  const evG3 = await getEvents(g3.ingestId);
  const gate6 = evG1.length > 0 && evG3.length > 0 &&
    evG1.every(e => e.novo_estado && e.ingestao_id && e.criado_em);
  console.log(`  GATE 1 eventos: [${evG1.map(e => e.novo_estado).join(', ')}]`);
  console.log(`  GATE 3 eventos: [${evG3.map(e => e.novo_estado).join(', ')}]`);
  console.log(`  GATE 6: ${gate6 ? '✅ PASSOU' : '❌ FALHOU'}\n`);

  // ─── GATE 9: R2 ──────────────────────────────────────────────────────────
  console.log('[ GATE 9 ] Estado real do R2...');
  console.log('  BLOQUEIO: wrangler r2 bucket list retorna [code: 10042] Please enable R2 through the Cloudflare Dashboard');
  console.log('  Bucket studymaster-pdfs: NÃO EXISTE');
  console.log('  Binding PDF_STORAGE: COMENTADO em wrangler.toml');
  console.log('  Nenhum upload R2 foi realizado. r2_pdf_key é reservado no D1 mas não existe fisicamente.');
  console.log('  GATE 9: ⚠️ BLOQUEIO DE INFRAESTRUTURA REGISTRADO (sem simulação)\n');

  // ─── RESUMO ───────────────────────────────────────────────────────────────
  console.log('═══════════════ RESUMO DOS GATES ═══════════════');
  console.log(`GATE 1 (Sucesso):        ${gate1 ? '✅' : '❌'}`);
  console.log(`GATE 3 (DLQ):            ${gate3 ? '✅' : '❌'}`);
  console.log(`GATE 4 (Idempotência):   ${gate4 ? '✅' : '❌'}`);
  console.log(`GATE 5 (Concorrência):   ⚠️  Coberto pelo lock atômico (verificado em G4 - ${baixandoCount} BAIXANDO)`);
  console.log(`GATE 6 (Auditoria):      ${gate6 ? '✅' : '❌'}`);
  console.log(`GATE 7 (Regressão):      ${gate7 ? '✅' : '❌'}`);
  console.log(`GATE 8 (Stale lock):     ${gate8 ? '✅' : '❌'}`);
  console.log(`GATE 9 (R2):             ⚠️  BLOQUEIO 10042`);
  console.log('════════════════════════════════════════════════\n');
}

main().catch(console.error);
