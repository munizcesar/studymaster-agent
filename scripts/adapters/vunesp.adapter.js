/**
 * Adapter for VUNESP
 * STATUS: Bloqueado por WAF (Akamai Bot Manager)
 * 
 * Este adaptador segue o contrato da arquitetura multi-fonte,
 * porém não será ativado em produção até que o bloqueio seja
 * tratado adequadamente (sem uso de hacks ou workarounds artificiais).
 */

async function* discover() {
    console.log("[ADAPTER VUNESP] Iniciando descoberta na fonte oficial (Em Hold)...");

    // Simulando a descoberta de um edital VUNESP
    const discoveryResult = {
        url_fonte: "https://documento.vunesp.com.br/documento.stream", // URL protegida
        fonte_id: "fnt_01vunesp",
        nome_fonte: "VUNESP",
        dominio_fonte: "vunesp.com.br",
        tipo_documento: "edital",
        titulo_detectado: "Edital Vunesp Piloto",
        orgao_sugerido: "Órgão Vunesp",
        sigla_orgao: "ORG-VUNESP",
        concurso_sugerido: "Concurso Vunesp Piloto",
        slug_concurso: "concurso-vunesp-piloto",
        ano_sugerido: new Date().getFullYear(),
        data_publicacao: new Date().toISOString().split('T')[0],
        texto_extraido: null // Bloqueado pelo WAF, o extractor iria falhar com 403
    };

    yield discoveryResult;
}

module.exports = {
    discover
};
