const queries = [
    { q: 'guarda municipal hortolandia', cat: 'D1-ausente' },
    { q: 'pc sp 2013', cat: 'antigo' },
    { q: 'pc sp 2023', cat: 'D1-presente' },
    { q: 'inss', cat: 'federal' },
    { q: 'inss 2024', cat: 'recente' },
    { q: 'polícia civil 2013', cat: 'com-ano' },
    { q: 'polícia civil', cat: 'amplo' },
    { q: 'polícia militar sp', cat: 'estadual' },
    { q: 'guarda municipal campinas', cat: 'guarda-municipal' },
    { q: 'concurso ribeirão preto', cat: 'cidade' },
    { q: 'trf3', cat: 'sigla' },
    { q: 'tribunal de justiça sp', cat: 'tribunal' },
    { q: 'analista judiciário', cat: 'cargo' },
    { q: 'vunesp', cat: 'banca' },
    { q: 'cebraspe', cat: 'banca' },
    { q: '2023', cat: 'ano-solto' },
    { q: '2024', cat: 'ano-solto' },
    { q: 'xjxjxjxyz_concurso_inventado', cat: 'inexistente' },
    { q: 'puluica sivil saom paulo', cat: 'ortografico' },
    { q: 'concurso publico', cat: 'ampla-demais' }
];

const API = process.env.API_URL || 'https://studymaster-worker.cesarmuniz0816.workers.dev/api/editais/search';

const agregadores = [
    'qconcursos','pciconcursos','grancursosonline','estrategiaconcursos',
    'jcconcursos','acheconcursos','concursosporarea','valeconcursos',
    'concursosnobrasil','direcaoconcursos','folhadirigida','aprovaconcursos',
    'concursoreal','mapadaprova','gabarite','estudegratis','simuladosbr',
    'questoesgratis','adminconcursos','apostilasopcao','editalconcursos',
    'lfg.com.br','cursosparaconcursos'
];

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function runTests() {
    const report = [];
    let totalOK = 0, totalZero = 0, totalLocal = 0, totalDiscovery = 0;
    let totalAgregadorRejected = 0;
    
    for (let idx = 0; idx < queries.length; idx++) {
        const { q, cat } = queries[idx];
        const startMs = Date.now();
        
        try {
            const res = await fetch(API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: q })
            });
            const elapsed = Date.now() - startMs;
            const data = await res.json();
            const results = data.results || [];
            
            if (results.length > 0) {
                const first = results[0];
                const source = first.isDiscovery ? 'DISCOVERY' : 'LOCAL';
                const domain = new URL(first.url || 'https://unknown').hostname;
                const isAgregador = agregadores.some(a => domain.toLowerCase().includes(a));
                
                let isOfficial = false;
                try {
                    isOfficial = domain.match(/\.(gov|jus|leg|mp|edu)\.br$/i) ||
                        ['vunesp','cebraspe','fgv.br','ibfc','institutoaocp','idecan','quadrix','fundatec','institutomais','consulplan','shdias','fcc.org'].some(b => domain.includes(b));
                } catch {};
                
                if (isAgregador) totalAgregadorRejected++;
                if (source === 'LOCAL') totalLocal++;
                if (source === 'DISCOVERY') totalDiscovery++;
                totalOK++;
                
                report.push({
                    idx: idx + 1, q, cat, count: results.length, source, 
                    url: first.url, domain, 
                    oficial: isOfficial ? 'SIM' : 'NÃO',
                    agregador: isAgregador ? 'FALHA' : 'OK',
                    elapsed: elapsed + 'ms'
                });
            } else {
                totalZero++;
                report.push({
                    idx: idx + 1, q, cat, count: 0, source: '-', 
                    url: '-', domain: '-', 
                    oficial: '-', agregador: '-',
                    elapsed: elapsed + 'ms'
                });
            }
        } catch (e) {
            report.push({
                idx: idx + 1, q, cat, count: -1, source: 'ERRO', 
                url: '-', domain: '-', 
                oficial: '-', agregador: '-',
                elapsed: '-'
            });
        }
        
        const last = report[report.length - 1];
        const icon = last.count > 0 ? '✅' : last.count === 0 ? '❌' : '💥';
        console.log(`${icon} [${idx+1}/20] "${q}" → ${last.count} res | ${last.source} | ${last.elapsed}`);
        
        await sleep(3000); 
    }
    
    console.log(`\n${'='.repeat(80)}`);
    console.log(`RELATÓRIO DE REGRESSÃO — LOCALIZADOR UNIVERSAL`);
    console.log(`${'='.repeat(80)}`);
    console.log(`Consultas com resultado:     ${totalOK} (${(totalOK/queries.length*100).toFixed(0)}%)`);
    console.log(`Consultas sem resultado:     ${totalZero} (${(totalZero/queries.length*100).toFixed(0)}%)`);
    console.log(`Resultados LOCAL (D1):       ${totalLocal}`);
    console.log(`Resultados DISCOVERY:        ${totalDiscovery}`);
    console.log(`Agregadores na URL final:    ${totalAgregadorRejected} (deve ser 0)`);
    
    if (totalAgregadorRejected > 0) {
        console.error("FALHA DE REGRESSÃO: Agregadores detectados como URL final.");
        process.exit(1);
    }
}

runTests();
