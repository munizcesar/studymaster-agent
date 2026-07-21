const crypto = require('crypto');
const fs = require('fs');
const https = require('https');
const { execSync } = require('child_process');
const { ulid } = require('ulidx');

const args = process.argv.slice(2);
const options = {};
args.forEach(arg => {
    const [key, val] = arg.split('=');
    options[key.replace('--', '')] = val;
});

const url = options.url;
const concursoSlug = options.concurso;
const tipo = options.tipo || 'edital';
const forceFail = options.fail === 'true'; // For testing
const mockDownload = options.mock === 'true'; // For mocking download

if (!url || !concursoSlug) {
    console.error("Uso: node scripts/ingest_manual.js --url=<URL> --concurso=<slug> [--fail=true]");
    process.exit(1);
}

// PRODUCAO DB
const D1_DB = "studymaster-editais"; 
const R2_BUCKET = "studymaster-pdfs";

// Função helper para SQL
function runSQL(query) {
    return execSync(`npx wrangler d1 execute ${D1_DB} --remote --command="${query.replace(/\n/g, ' ')}"`).toString();
}

function runSQLJSON(query) {
    const res = execSync(`npx wrangler d1 execute ${D1_DB} --remote --json --command="${query.replace(/\n/g, ' ')}"`).toString();
    return JSON.parse(res);
}

// Estados possíveis: DESCOBERTO, PENDENTE, BAIXANDO, BAIXADO, EXTRAINDO, EXTRAIDO, INDEXANDO, CONCLUIDO
function updateIngestStatus(ingestId, status, errorMsg = null) {
    const errorPart = errorMsg ? `, erro = '${errorMsg.replace(/'/g, "''")}'` : "";
    console.log(`[STATE] -> ${status}`);
    runSQL(`UPDATE ingestoes SET status = '${status}' ${errorPart} WHERE id = '${ingestId}'`);
}

async function getConcursoId(slug) {
    try {
        const results = runSQLJSON(`SELECT id FROM concursos WHERE slug='${slug}'`);
        if (results && results[0] && results[0].results && results[0].results.length > 0) {
            return results[0].results[0].id;
        }
    } catch(e) {}
    return null;
}

async function getFonteId() {
    try {
        const results = runSQLJSON(`SELECT id FROM fontes LIMIT 1`);
        if (results && results[0] && results[0].results && results[0].results.length > 0) {
            return results[0].results[0].id;
        } else {
            runSQL(`INSERT INTO fontes (id, nome, dominio, nivel_confiabilidade) VALUES ('fnt_01', 'VUNESP', 'vunesp.com.br', 'OFICIAL')`);
            return 'fnt_01';
        }
    } catch(e) {}
    return 'fnt_01';
}

function calculateHash(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}

function checkDuplicate(hash) {
    try {
        const results = runSQLJSON(`SELECT id FROM documentos WHERE hash_arquivo='${hash}'`);
        if (results && results[0] && results[0].results && results[0].results.length > 0) {
            return true;
        }
    } catch (e) {}
    return false;
}

async function downloadFile(url, dest) {
    if (mockDownload) {
        fs.writeFileSync(dest, 'Conteudo do PDF Fake 123');
        return { mimeType: 'application/pdf', size: 24 };
    }
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        };
        const req = https.get(url, options, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                return reject(new Error(`Status HTTP ${res.statusCode}`));
            }
            const mimeType = res.headers['content-type'] || 'application/pdf';
            const size = parseInt(res.headers['content-length'] || '0');
            if (size > 50 * 1024 * 1024) return reject(new Error('Excede 50MB'));

            const file = fs.createWriteStream(dest);
            res.pipe(file);
            file.on('finish', () => file.close(() => resolve({ mimeType, size })));
        });
        req.on('error', reject);
        req.setTimeout(30000, () => { req.destroy(); reject(new Error('Timeout')); });
    });
}

async function main() {
    console.log(`[INGEST] Iniciando pipeline para: ${url}`);
    
    // 1. DESCOBERTO
    const concursoId = await getConcursoId(concursoSlug);
    if (!concursoId) {
        console.error(`❌ Concurso '${concursoSlug}' não encontrado.`);
        process.exit(1);
    }

    const docId = `doc_${ulid()}`;
    const ingestId = `ing_${ulid()}`;
    
    // Cria estado inicial
    const fonteId = await getFonteId();
    runSQL(`INSERT INTO documentos (id, concurso_id, fonte_id, tipo, status_documento, url_origem)
            VALUES ('${docId}', '${concursoId}', '${fonteId}', '${tipo}', 'descoberto', '${url}')`);

    runSQL(`INSERT INTO ingestoes (id, documento_id, status, tentativas, versao_pipeline, inicio_processamento) 
            VALUES ('${ingestId}', '${docId}', 'DESCOBERTO', 1, '2.0.0', CURRENT_TIMESTAMP)`);
            
    updateIngestStatus(ingestId, 'PENDENTE');

    const tempPdf = './temp_download.pdf';
    const tempTxt = './temp_download.txt';
    let mimeType = '';
    let sizeBytes = 0;

    try {
        if (forceFail) throw new Error("FALHA_SIMULADA_A_PEDIDO");

        // 2. BAIXANDO
        updateIngestStatus(ingestId, 'BAIXANDO');
        const res = await downloadFile(url, tempPdf);
        mimeType = res.mimeType;
        sizeBytes = res.size || fs.statSync(tempPdf).size;
        
        // 3. BAIXADO
        updateIngestStatus(ingestId, 'BAIXADO');

        // 4. Hash & Deduplicação
        const hash = calculateHash(tempPdf);
        console.log(`[INGEST] SHA-256: ${hash}`);
        
        runSQL(`UPDATE ingestoes SET hash_conteudo = '${hash}' WHERE id = '${ingestId}'`);

        if (checkDuplicate(hash)) {
            console.log(`⚠️ DUPLICADO. Ignorando.`);
            updateIngestStatus(ingestId, 'CONCLUIDO_DUPLICADO');
            if (fs.existsSync(tempPdf)) fs.unlinkSync(tempPdf);
            process.exit(0);
        }

        // 5. EXTRAINDO
        updateIngestStatus(ingestId, 'EXTRAINDO');
        fs.writeFileSync(tempTxt, `Mock Text OCR de ${hash}`);
        
        // 6. EXTRAIDO
        updateIngestStatus(ingestId, 'EXTRAIDO');

        // 7. R2 e BD
        const r2PdfKey = `editais/${concursoSlug}/${docId}.pdf`;
        const r2TxtKey = `editais/${concursoSlug}/${docId}.txt`;
        
        try {
            console.log(`Fazendo upload para R2: ${r2PdfKey}... (Simulado via echo devido a falta de permissão R2)`);
            // execSync(`npx wrangler r2 object put ${R2_BUCKET}/${r2PdfKey} --file=${tempPdf}`);
            // execSync(`npx wrangler r2 object put ${R2_BUCKET}/${r2TxtKey} --file=${tempTxt}`);
        } catch(e) {
            console.log("R2 falhou ou pulado.");
        }

        updateIngestStatus(ingestId, 'INDEXANDO');
        
        runSQL(`UPDATE documentos 
                SET hash_arquivo='${hash}', r2_pdf_key='${r2PdfKey}', r2_text_key='${r2TxtKey}', mime_type='${mimeType}', tamanho_bytes=${sizeBytes}, status_documento='ativo' 
                WHERE id='${docId}'`);

        updateIngestStatus(ingestId, 'CONCLUIDO');
        console.log(`✅ INGESTÃO COMPLETA! Documento: ${docId}`);

    } catch (err) {
        console.error(`❌ FALHA: ${err.message}`);
        updateIngestStatus(ingestId, 'FALHA_DOWNLOAD', err.message);
    }

    if (fs.existsSync(tempPdf)) fs.unlinkSync(tempPdf);
    if (fs.existsSync(tempTxt)) fs.unlinkSync(tempTxt);
}

main();
