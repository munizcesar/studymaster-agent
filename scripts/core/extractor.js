const pdfParse = require('pdf-parse');

/**
 * Downloads a PDF from a given URL and extracts its text.
 * Throws explicit errors on fetch or parsing failures.
 * 
 * @param {string} url - The URL of the PDF to download.
 * @returns {Promise<string>} - The extracted text.
 */
async function downloadAndExtractPDF(url) {
    console.log(`[EXTRACTOR] Baixando PDF REAL da fonte oficial: ${url}`);
    
    let pdfBuffer;
    try {
        const r = await fetch(url, {
            method: 'GET',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        console.log(`[EXTRACTOR] HTTP Status: ${r.status}`);
        
        if (!r.ok) {
            throw new Error(`HTTP Error: ${r.status} ${r.statusText}`);
        }
        
        const ab = await r.arrayBuffer();
        pdfBuffer = Buffer.from(ab);
        console.log(`[EXTRACTOR] PDF baixado com sucesso. Tamanho: ${pdfBuffer.length} bytes.`);
    } catch (e) {
        throw new Error(`[EXTRACTOR] Erro ao acessar URL: ${e.message}`);
    }

    console.log("[EXTRACTOR] Extraindo texto real com pdf-parse...");
    try {
        const data = await pdfParse(pdfBuffer);
        const extractedText = data.text;
        console.log(`[EXTRACTOR] Texto extraído com sucesso. Caracteres: ${extractedText.length}`);
        return extractedText;
    } catch (e) {
        throw new Error(`[EXTRACTOR] Erro na extração do PDF: ${e.message}`);
    }
}

module.exports = {
    downloadAndExtractPDF
};
