import { ulid } from 'ulidx';

export class IngestionPipeline {
  constructor(env) {
    this.env = env;
  }

  async transition(db, eventId, novoEstado, erro = null) {
    try {
      let setParts = `status = '${novoEstado}'`;
      if (erro) setParts += `, erro = '${erro.toString().slice(0, 500).replace(/'/g, "''")}' `;
      if (['COMPLETED', 'DUPLICATED', 'REJECTED_VALIDATION', 'FAILED_PERMANENT'].includes(novoEstado)) {
        setParts += `, fim_processamento = CURRENT_TIMESTAMP`;
      }
      const dummyDocId = `doc_01edital`;
      await db.prepare(`
        INSERT INTO ingestoes (id, documento_id, status, inicio_processamento) 
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET ${setParts}
      `).bind(eventId, dummyDocId, novoEstado).run();
    } catch (e) {
      console.error(`Transition error for ${eventId}:`, e);
    }
  }

  async processDiscoveryQueue(msg) {
    const data = msg.body;
    await this.transition(this.env.DB_EDITAIS, data.eventId, 'RESOLVING_OFFICIAL');
    try {
      let officialUrl = data.discoveredUrl;
      try {
        const head = await fetch(data.discoveredUrl, { method: 'HEAD', redirect: 'follow' });
        officialUrl = head.url;
      } catch (e) { /* ignore */ }

      const nextPayload = { ...data, officialUrl };
      await this.env.FETCH_QUEUE.send(nextPayload);
      msg.ack();
    } catch (err) {
      console.error('PIPELINE ERROR:', err);
      await this.transition(this.env.DB_EDITAIS, data.eventId, 'FAILED_PERMANENT', err);
      msg.retry();
    }
  }

  async processFetchQueue(msg) {
    const data = msg.body;
    await this.transition(this.env.DB_EDITAIS, data.eventId, 'FETCHING_PDF');
    try {
      const resp = await fetch(data.officialUrl);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const buffer = await resp.arrayBuffer();

      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const existing = await this.env.DB_EDITAIS.prepare(`SELECT id FROM documentos WHERE hash_arquivo = ?`).bind(hashHex).first();
      if (existing) {
        await this.transition(this.env.DB_EDITAIS, data.eventId, 'DUPLICATED', 'Hash already exists');
        return msg.ack();
      }

      const documentId = 'doc_' + ulid().toLowerCase();
      const r2PdfKey = `editais/${new Date().getUTCFullYear()}/${documentId}.pdf`;
      if (this.env.PDF_STORAGE) {
        await this.env.PDF_STORAGE.put(r2PdfKey, buffer, { httpMetadata: { contentType: 'application/pdf' } });
      }

      await this.transition(this.env.DB_EDITAIS, data.eventId, 'STORED_R2');
      await this.env.EXTRACTION_QUEUE.send({ ...data, documentId, r2PdfKey, hashArquivo: hashHex });
      msg.ack();
    } catch (err) {
      console.error('PIPELINE ERROR:', err);
      await this.transition(this.env.DB_EDITAIS, data.eventId, 'FAILED_PERMANENT', err);
      msg.retry();
    }
  }

  async processExtractionQueue(msg) {
    const data = msg.body;
    await this.transition(this.env.DB_EDITAIS, data.eventId, 'EXTRACTING_TEXT');
    try {
      let texto = "Mock text extracted from PDF. Órgão: Polícia Civil de São Paulo. Cargo: Investigador. Banca: Vunesp. Ano: 2026. Salário: R$ 5000,00.";
      
      const extractorUrl = this.env.PDF_EXTRACTOR_URL || 'https://mock.pdf.extractor';
      if (extractorUrl !== 'https://mock.pdf.extractor') {
         const pdfData = await this.env.PDF_STORAGE.get(data.r2PdfKey);
         if (pdfData) {
            const extResp = await fetch(extractorUrl, { method: 'POST', body: await pdfData.arrayBuffer() });
            if (extResp.ok) texto = await extResp.text();
         }
      }

      const r2TextKey = data.r2PdfKey.replace('.pdf', '.txt');
      if (this.env.PDF_STORAGE) {
        await this.env.PDF_STORAGE.put(r2TextKey, texto, { httpMetadata: { contentType: 'text/plain' } });
      }

      await this.transition(this.env.DB_EDITAIS, data.eventId, 'TEXT_EXTRACTED');
      await this.env.METADATA_QUEUE.send({ ...data, r2TextKey, textoBruto: texto });
      msg.ack();
    } catch (err) {
      console.error('PIPELINE ERROR:', err);
      await this.transition(this.env.DB_EDITAIS, data.eventId, 'FAILED_PERMANENT', err);
      msg.retry();
    }
  }

  async processMetadataQueue(msg) {
    const data = msg.body;
    await this.transition(this.env.DB_EDITAIS, data.eventId, 'VALIDATING_METADATA');
    try {
      let metadata = {};
      try {
        if (this.env.AI) {
           const prompt = `Extract metadata from this text as JSON. REQUIRED exact keys: "orgao", "cargo", "banca", "ano". Return ONLY valid JSON.\nText:\n${data.textoBruto.substring(0, 3000)}`;
           const aiResponse = await this.env.AI.run('@cf/meta/llama-3.1-8b-instruct', { messages: [{role:'user', content:prompt}] });
           
           let jsonStr = aiResponse.response;
           const match = jsonStr.match(/\{[\s\S]*\}/);
           if (match) jsonStr = match[0];
           
           metadata = JSON.parse(jsonStr);
        }
      } catch (e) {
          console.error("LLM Parse Error:", e);
          metadata = {};
      }

      if (!metadata.orgao || !metadata.cargo || metadata.orgao.includes("Mock")) {
         await this.transition(this.env.DB_EDITAIS, data.eventId, 'REJECTED_VALIDATION', 'Identity Ambiguous');
         return msg.ack();
      }

      const sigO = metadata.orgao.toLowerCase().replace(/[^a-z0-9]/g, '');
      const sigC = metadata.cargo.toLowerCase().replace(/[^a-z0-9]/g, '');
      const sigA = String(metadata.ano);
      
      let concursoId = null;
      const existingRows = await this.env.DB_EDITAIS.prepare(`
        SELECT c.id, o.nome, crg.nome as cnome
        FROM concursos c
        JOIN orgaos o ON c.orgao_id = o.id
        LEFT JOIN cargos crg ON crg.concurso_id = c.id
      `).all();

      for (const row of (existingRows.results || [])) {
         const ro = (row.nome || '').toLowerCase().replace(/[^a-z0-9]/g, '');
         const rc = (row.cnome || '').toLowerCase().replace(/[^a-z0-9]/g, '');
         if (ro === sigO && rc === sigC) {
             concursoId = row.id;
             break;
         }
      }

      if (!concursoId) {
         const resultO = await this.env.DB_EDITAIS.prepare(`INSERT INTO orgaos (nome, sigla) VALUES (?, ?) RETURNING id`)
            .bind(metadata.orgao, metadata.orgao.substring(0,5).toUpperCase()).first();
         
         const resultC = await this.env.DB_EDITAIS.prepare(`INSERT INTO concursos (orgao_id, slug, ano, data_abertura) VALUES (?, ?, ?, ?) RETURNING id`)
            .bind(resultO.id, `${sigO}-${sigC}-${sigA}`, metadata.ano, new Date().toISOString()).first();
         
         concursoId = resultC.id;
         await this.env.DB_EDITAIS.prepare(`INSERT INTO cargos (concurso_id, nome) VALUES (?, ?)`).bind(concursoId, metadata.cargo).run();
      }

      await this.env.DB_EDITAIS.prepare(`
        INSERT INTO documentos (id, concurso_id, fonte_id, tipo, status_documento, hash_arquivo, url_origem, data_publicacao)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        data.documentId, 
        concursoId, 
        'fnt_00discovery', // Mock fonte_id for now as we don't have sources table properly linked
        'Edital', 
        'ATIVO', 
        data.hashArquivo || 'no_hash', 
        data.officialUrl || 'no_url',
        new Date().toISOString()
      ).run();

      await this.transition(this.env.DB_EDITAIS, data.eventId, 'INDEXING');

      if (this.env.AI && this.env.VECTORIZE_EDITAIS) {
         const emb = await this.env.AI.run('@cf/baai/bge-base-en-v1.5', { text: [data.textoBruto.substring(0, 1000)] });
         if (emb && emb.data && emb.data[0]) {
             await this.env.VECTORIZE_EDITAIS.insert([{
                 id: data.documentId + "_chunk_0",
                 values: emb.data[0],
                 metadata: {
                     concurso_id: String(concursoId),
                     orgao: metadata.orgao,
                     cargo: metadata.cargo,
                     banca: metadata.banca,
                     ano: metadata.ano,
                     url: data.officialUrl || 'no_url'
                 }
             }]);
         }
      }

      await this.transition(this.env.DB_EDITAIS, data.eventId, 'COMPLETED');
      msg.ack();
    } catch (err) {
      console.error('PIPELINE ERROR:', err);
      await this.transition(this.env.DB_EDITAIS, data.eventId, 'FAILED_PERMANENT', err);
      msg.retry();
    }
  }
}
