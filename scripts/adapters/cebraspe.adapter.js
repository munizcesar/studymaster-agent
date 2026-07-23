/**
 * Adapter for CEBRASPE
 */

async function* discover() {
    console.log("[ADAPTER CEBRASPE] Iniciando descoberta na fonte oficial...");

    // Simulando a descoberta real da página do concurso.
    // Em um cenário completo, faríamos o crawling do HTML do cebraspe.org.br aqui.
    // Como escopo do piloto (Sprint 7), validaremos o pipeline com o mesmo edital 
    // real usado na Sprint 6, mas operando via arquitetura de adapter.
    
    const discoveryResult = {
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
        data_publicacao: new Date().toISOString().split('T')[0],
        texto_extraido: null // Deixa o pipeline cuidar do downloadAndExtractPDF
    };

    yield discoveryResult;
}

module.exports = {
    discover
};
