const { ulid } = require('ulidx');
const { execSync } = require('child_process');
const fs = require('fs');
const pdfParse = require('pdf-parse');

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

async function discoverAndExtract() {
    console.log("🔍 [CRAWLER CEBRASPE] Iniciando auditoria de página pública (Piloto)...");
    
    // Using a REAL official edital from Cebraspe CDN
    const discovery = {
        url_fonte: "https://cdn.cebraspe.org.br/concursos/pc_ma_26_investigador/arquivos/9EE70E72CE79EB274C5319BEEB5B9B7D8519FF48DA21986A0830B5DB02C4F8B0.pdf",
        fonte_id: "fnt_02cebraspe",
        nome_fonte: "CEBRASPE",
        dominio_fonte: "cebraspe.org.br",
        tipo_documento: "edital",
        titulo_detectado: "Edital Abertura PC MA 2026",
        orgao_sugerido: "Polícia Civil do Maranhão",
        sigla_orgao: "PC-MA",
        concurso_sugerido: "PC-MA Investigador 2026",
        slug_concurso: "pc-ma-investigador",
        ano_sugerido: 2026,
        data_publicacao: new Date().toISOString().split('T')[0]
    };

    // Identifica/Cria fonte
    const fntRes = runSQLJSON(`SELECT id FROM fontes WHERE id = '${discovery.fonte_id}'`);
    if (!fntRes || fntRes[0].results.length === 0) {
        runSQL(`INSERT INTO fontes (id, nome, dominio, nivel_confiabilidade) VALUES ('${discovery.fonte_id}', '${discovery.nome_fonte}', '${discovery.dominio_fonte}', 'OFICIAL')`);
    }

    // IDEMPOTÊNCIA: Checa fonte_id + url_origem
    const dupRes = runSQLJSON(`SELECT id FROM documentos WHERE fonte_id = '${discovery.fonte_id}' AND url_origem = '${discovery.url_fonte}'`);
    if (dupRes && dupRes[0].results.length > 0) {
        console.log(`✅ [IDEMPOTÊNCIA] Edital já descoberto anteriormente (Doc ID: ${dupRes[0].results[0].id}). Nenhuma ação necessária.`);
        return;
    }

    console.log(`🌍 Baixando PDF REAL da fonte oficial: ${discovery.url_fonte}`);
    let pdfBuffer;
    try {
        const r = await fetch(discovery.url_fonte, {
            method: 'GET',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        console.log(`➡️  HTTP Status: ${r.status}`);
        
        if (!r.ok) {
            console.log("🛑 Falha no download do PDF.");
            return;
        }
        
        const ab = await r.arrayBuffer();
        pdfBuffer = Buffer.from(ab);
        console.log(`✅ PDF baixado com sucesso. Tamanho: ${pdfBuffer.length} bytes.`);
    } catch (e) {
        console.log(`❌ Erro ao acessar URL: ${e.message}`);
        return;
    }

    console.log("📄 Extraindo texto real com pdf-parse...");
    let extractedText = "";
    try {
        const data = await pdfParse(pdfBuffer);
        extractedText = data.text;
        console.log(`✅ Texto extraído com sucesso. Caracteres: ${extractedText.length}`);
    } catch (e) {
        console.log(`❌ Erro na extração do PDF: ${e.message}`);
        return;
    }

    // Identifica/Cria orgao
    let orgaoId = `org_${ulid()}`;
    const orgRes = runSQLJSON(`SELECT id FROM orgaos WHERE sigla = '${discovery.sigla_orgao}'`);
    if (orgRes && orgRes[0].results.length > 0) {
        orgaoId = orgRes[0].results[0].id;
    } else {
        runSQL(`INSERT INTO orgaos (id, nome, sigla) VALUES ('${orgaoId}', '${discovery.orgao_sugerido}', '${discovery.sigla_orgao}')`);
    }

    // Identifica/Cria concurso
    let concursoId = `cnc_${ulid()}`;
    const cncRes = runSQLJSON(`SELECT id FROM concursos WHERE slug = '${discovery.slug_concurso}'`);
    if (cncRes && cncRes[0].results.length > 0) {
        concursoId = cncRes[0].results[0].id;
    } else {
        runSQL(`INSERT INTO concursos (id, orgao_id, ano, slug, status, data_abertura) 
                VALUES ('${concursoId}', '${orgaoId}', ${discovery.ano_sugerido}, '${discovery.slug_concurso}', 'aberto', '${discovery.data_publicacao}')`);
    }

    // Cria documento e ingestao
    const docId = `doc_${ulid()}`;
    const ingestId = `ing_${ulid()}`;
    
    console.log(`📝 [D1] Registrando Documento: ${docId}`);
    runSQL(`INSERT INTO documentos (id, concurso_id, fonte_id, tipo, status_documento, url_origem, data_publicacao)
            VALUES ('${docId}', '${concursoId}', '${discovery.fonte_id}', '${discovery.tipo_documento}', 'EXTRAIDO', '${discovery.url_fonte}', '${discovery.data_publicacao}')`);

    console.log(`📝 [D1] Registrando Texto Extraído na nova tabela documentos_textos...`);
    // Escape single quotes in text for SQL
    const safeText = extractedText.replace(/'/g, "''");
    
    // Chunking text to avoid SQLITE_TOOBIG (100KB limit for raw SQL statements in D1)
    const CHUNK_SIZE = 40000;
    for (let i = 0; i < safeText.length; i += CHUNK_SIZE) {
        const textChunk = safeText.substring(i, i + CHUNK_SIZE);
        const sqlFile = `scratch/insert_${docId}_${i}.sql`;
        if (i === 0) {
            fs.writeFileSync(sqlFile, `INSERT INTO documentos_textos (documento_id, texto_extraido) VALUES ('${docId}', '${textChunk}');`);
        } else {
            fs.writeFileSync(sqlFile, `UPDATE documentos_textos SET texto_extraido = texto_extraido || '${textChunk}' WHERE documento_id = '${docId}';`);
        }
        execSync(`npx wrangler d1 execute ${D1_DB} --remote --file ${sqlFile}`, { env: process.env });
    }
    console.log(`✅ Texto persistido com sucesso!`);

    console.log(`📝 [D1] Registrando Ingestão: ${ingestId}`);
    runSQL(`INSERT INTO ingestoes (id, documento_id, status, tentativas, versao_pipeline, inicio_processamento, max_tentativas) 
            VALUES ('${ingestId}', '${docId}', 'EXTRAIDO', 0, '6.0.0-crawler', CURRENT_TIMESTAMP, 3)`);

    // Enfileira - the Worker will now just pick it up from 'EXTRAIDO' and do Chunking
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
                tipo: discovery.tipo_documento,
                status: "EXTRAIDO" // New state hint
            })
        });
        const qData = await qRes.json();
        console.log(`✔️ Job enfileirado com sucesso:`, qData);
    } catch(e) {
        console.error("❌ Falha ao enfileirar job:", e.message);
    }
}

discoverAndExtract();
