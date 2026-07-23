const { ulid } = require('ulidx');
const fs = require('fs');
const db = require('./db');
const { downloadAndExtractPDF } = require('./extractor');

/**
 * Runs the ingestion pipeline using a specific source adapter.
 * 
 * @param {Object} adapter - The adapter for the specific source.
 */
async function runPipeline(adapter) {
    console.log(`[PIPELINE] Iniciando pipeline para o adaptador...`);

    // The adapter must have a generator 'discover'
    if (!adapter.discover || typeof adapter.discover !== 'function') {
        throw new Error("[PIPELINE] Adaptador inválido: método 'discover' não encontrado.");
    }

    try {
        for await (const discovery of adapter.discover()) {
            console.log(`\n[PIPELINE] Processando descoberta: ${discovery.titulo_detectado} (${discovery.url_fonte})`);
            
            // Identifica/Cria fonte
            const fntRes = db.runSQLJSON(`SELECT id FROM fontes WHERE id = '${discovery.fonte_id}'`);
            if (!fntRes || fntRes[0].results.length === 0) {
                db.runSQL(`INSERT INTO fontes (id, nome, dominio, nivel_confiabilidade) VALUES ('${discovery.fonte_id}', '${discovery.nome_fonte}', '${discovery.dominio_fonte}', 'OFICIAL')`);
            }

            // IDEMPOTÊNCIA: Checa fonte_id + url_origem
            const dupRes = db.runSQLJSON(`SELECT id FROM documentos WHERE fonte_id = '${discovery.fonte_id}' AND url_origem = '${discovery.url_fonte}'`);
            if (dupRes && dupRes[0].results.length > 0) {
                console.log(`✅ [IDEMPOTÊNCIA] Edital já descoberto anteriormente (Doc ID: ${dupRes[0].results[0].id}). Pulando...`);
                continue;
            }

            let extractedText = discovery.texto_extraido;

            // Extração: usa extractor.js se o adapter não forneceu o texto
            if (!extractedText) {
                try {
                    extractedText = await downloadAndExtractPDF(discovery.url_fonte);
                } catch (e) {
                    console.log(`🛑 [PIPELINE] Falha na extração. O documento não será concluído com sucesso. Erro: ${e.message}`);
                    continue;
                }
            } else {
                console.log(`✅ [PIPELINE] Texto extraído fornecido pelo adaptador. Caracteres: ${extractedText.length}`);
            }

            // Identifica/Cria orgao
            let orgaoId = `org_${ulid()}`;
            const orgRes = db.runSQLJSON(`SELECT id FROM orgaos WHERE sigla = '${discovery.sigla_orgao}'`);
            if (orgRes && orgRes[0].results.length > 0) {
                orgaoId = orgRes[0].results[0].id;
            } else {
                db.runSQL(`INSERT INTO orgaos (id, nome, sigla) VALUES ('${orgaoId}', '${discovery.orgao_sugerido}', '${discovery.sigla_orgao}')`);
            }

            // Identifica/Cria concurso
            let concursoId = `cnc_${ulid()}`;
            const cncRes = db.runSQLJSON(`SELECT id FROM concursos WHERE slug = '${discovery.slug_concurso}'`);
            if (cncRes && cncRes[0].results.length > 0) {
                concursoId = cncRes[0].results[0].id;
            } else {
                db.runSQL(`INSERT INTO concursos (id, orgao_id, ano, slug, status, data_abertura) VALUES ('${concursoId}', '${orgaoId}', ${discovery.ano_sugerido}, '${discovery.slug_concurso}', 'aberto', '${discovery.data_publicacao}')`);
            }

            // Cria documento e ingestao
            const docId = `doc_${ulid()}`;
            const ingestId = `ing_${ulid()}`;
            
            console.log(`📝 [D1] Registrando Documento: ${docId}`);
            db.runSQL(`INSERT INTO documentos (id, concurso_id, fonte_id, tipo, status_documento, url_origem, data_publicacao) VALUES ('${docId}', '${concursoId}', '${discovery.fonte_id}', '${discovery.tipo_documento}', 'EXTRAIDO', '${discovery.url_fonte}', '${discovery.data_publicacao}')`);

            console.log(`📝 [D1] Registrando Texto Extraído na nova tabela documentos_textos...`);
            // Escape single quotes in text for SQL
            const safeText = extractedText.replace(/'/g, "''");
            
            // Chunking text to avoid SQLITE_TOOBIG (100KB limit for raw SQL statements in D1)
            const CHUNK_SIZE = 40000;
            // Usamos um arquivo único por documento para evitar muitas operações separadas se possível, ou rodamos por chunk.
            const scratchDir = 'scratch';
            if (!fs.existsSync(scratchDir)){
                fs.mkdirSync(scratchDir);
            }

            for (let i = 0; i < safeText.length; i += CHUNK_SIZE) {
                const textChunk = safeText.substring(i, i + CHUNK_SIZE);
                const sqlFile = `${scratchDir}/insert_${docId}_${i}.sql`;
                if (i === 0) {
                    fs.writeFileSync(sqlFile, `INSERT INTO documentos_textos (documento_id, texto_extraido) VALUES ('${docId}', '${textChunk}');`);
                } else {
                    fs.writeFileSync(sqlFile, `UPDATE documentos_textos SET texto_extraido = texto_extraido || '${textChunk}' WHERE documento_id = '${docId}';`);
                }
                db.runSQLFile(sqlFile);
            }
            console.log(`✅ [D1] Texto persistido com sucesso!`);

            console.log(`📝 [D1] Registrando Ingestão: ${ingestId}`);
            db.runSQL(`INSERT INTO ingestoes (id, documento_id, status, tentativas, versao_pipeline, inicio_processamento, max_tentativas) VALUES ('${ingestId}', '${docId}', 'EXTRAIDO', 0, '7.0.0-multi-source', CURRENT_TIMESTAMP, 3)`);

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
                        status: "EXTRAIDO"
                    })
                });
                const qData = await qRes.json();
                console.log(`✔️ [QUEUE] Job enfileirado com sucesso:`, qData);
            } catch(e) {
                console.error("❌ [QUEUE] Falha ao enfileirar job:", e.message);
            }
        }
    } catch (error) {
        console.error(`🛑 [PIPELINE] Erro crítico no pipeline:`, error);
        throw error;
    }
}

module.exports = {
    runPipeline
};
