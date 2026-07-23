const { ulid } = require('ulidx');
const { execSync } = require('child_process');

const D1_DB = "studymaster-editais";

process.env.WRANGLER_SEND_METRICS = "false";
process.env.CI = "true";

function runSQLJSON(query) {
    try {
        const res = execSync(`npx wrangler d1 execute ${D1_DB} --remote --json --command="${query.replace(/\n/g, ' ')}"`, { env: process.env }).toString();
        return JSON.parse(res);
    } catch(e) {
        console.error("SQL Erro:", e.message);
        return null;
    }
}

function runSQL(query) {
    execSync(`npx wrangler d1 execute ${D1_DB} --remote --command="${query.replace(/\n/g, ' ')}"`, { env: process.env });
}

async function discover() {
    console.log("🔍 [CRAWLER VUNESP] Iniciando auditoria de página pública (Piloto)...");
    
    // Contrato de Descoberta (Mock da extração real baseada em regras da Sprint 5)
    // Usando URL real no formato VUNESP
    const discovery = {
        url_fonte: "https://www.vunesp.com.br/PCSP2303",
        fonte_id: "fnt_01vunesp",
        tipo_documento: "edital",
        titulo_detectado: "Edital de Abertura nº 03/2023 - Polícia Civil SP",
        orgao_sugerido: "Polícia Civil do Estado de São Paulo",
        concurso_sugerido: "PC-SP",
        ano_sugerido: 2023,
        data_publicacao: "2023-09-03",
        metadados_sugeridos: {
            banca: "VUNESP",
            scraper_version: "1.0"
        }
    };

    console.log(`🌍 Validando acessibilidade da URL: ${discovery.url_fonte}`);
    let isValid = false;
    try {
        const r = await fetch(discovery.url_fonte, {
            method: 'GET',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        console.log(`➡️  HTTP Status: ${r.status}`);
        if (r.status >= 200 && r.status < 400) {
            isValid = true;
        } else if (r.status === 403) {
            console.log("⚠️ Bloqueio Anti-bot/Cloudflare detectado (HTTP 403). A URL existe e está protegida. Prosseguindo...");
            isValid = true; // URL é real, o worker terá que lidar com a falha
        }
    } catch (e) {
        console.log(`❌ Erro ao acessar URL: ${e.message}`);
    }

    if (!isValid) {
        console.log("🛑 URL não acessível. Descoberta ignorada.");
        return;
    }

    // Identifica/Cria orgao
    let orgaoId = null;
    const orgRes = runSQLJSON(`SELECT id FROM orgaos WHERE nome = '${discovery.orgao_sugerido}'`);
    if (orgRes && orgRes[0].results.length > 0) {
        orgaoId = orgRes[0].results[0].id;
    } else {
        orgaoId = `org_${ulid()}`;
        runSQL(`INSERT INTO orgaos (id, nome, sigla) VALUES ('${orgaoId}', '${discovery.orgao_sugerido}', 'PC-SP')`);
    }

    // Identifica/Cria concurso
    let concursoId = null;
    const concRes = runSQLJSON(`SELECT id FROM concursos WHERE slug = 'pcsp-2026'`);
    if (concRes && concRes[0].results.length > 0) {
        concursoId = concRes[0].results[0].id;
    } else {
        concursoId = `cnc_${ulid()}`;
        runSQL(`INSERT INTO concursos (id, orgao_id, ano, slug, status, data_abertura) 
                VALUES ('${concursoId}', '${orgaoId}', ${discovery.ano_sugerido}, 'pcsp-2026', 'aberto', '${discovery.data_publicacao}')`);
    }

    // IDEMPOTÊNCIA: Checa fonte_id + url_origem
    const dupRes = runSQLJSON(`SELECT id FROM documentos WHERE fonte_id = '${discovery.fonte_id}' AND url_origem = '${discovery.url_fonte}'`);
    if (dupRes && dupRes[0].results.length > 0) {
        console.log(`✅ [IDEMPOTÊNCIA] Edital já descoberto anteriormente (Doc ID: ${dupRes[0].results[0].id}). Nenhuma ação necessária.`);
        return;
    }

    // Cria documento e ingestao
    const docId = `doc_${ulid()}`;
    const ingestId = `ing_${ulid()}`;
    
    console.log(`📝 [D1] Registrando Documento: ${docId}`);
    runSQL(`INSERT INTO documentos (id, concurso_id, fonte_id, tipo, status_documento, url_origem, data_publicacao)
            VALUES ('${docId}', '${concursoId}', '${discovery.fonte_id}', '${discovery.tipo_documento}', 'DESCOBERTO', '${discovery.url_fonte}', '${discovery.data_publicacao}')`);

    console.log(`📝 [D1] Registrando Ingestão: ${ingestId}`);
    runSQL(`INSERT INTO ingestoes (id, documento_id, status, tentativas, versao_pipeline, inicio_processamento, max_tentativas) 
            VALUES ('${ingestId}', '${docId}', 'DESCOBERTO', 0, '5.0.0-crawler', CURRENT_TIMESTAMP, 3)`);

    // Enfileira
    console.log(`📤 [QUEUE] Enviando para studymaster-ingest-queue...`);
    try {
        const qRes = await fetch("https://studymaster-worker.cesarmuniz0816.workers.dev/api/ingest/enqueue", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ingestId,
                docId,
                url: discovery.url_fonte,
                concursoId,
                tipo: discovery.tipo_documento
            })
        });
        const qData = await qRes.json();
        console.log(`✔️ Job enfileirado com sucesso:`, qData);
    } catch(e) {
        console.error("❌ Falha ao enfileirar job:", e.message);
    }
}

discover();
