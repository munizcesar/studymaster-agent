const path = require('path');
const { runPipeline } = require('./core/pipeline');

async function main() {
    const adapterName = process.argv[2];
    
    if (!adapterName) {
        console.error("❌ Uso: node scripts/run_pipeline.js <nome_da_banca>");
        console.error("Exemplo: node scripts/run_pipeline.js cebraspe");
        process.exit(1);
    }

    const adapterPath = path.join(__dirname, 'adapters', `${adapterName}.adapter.js`);

    let adapter;
    try {
        adapter = require(adapterPath);
    } catch (e) {
        console.error(`❌ Falha ao carregar adaptador para '${adapterName}'.`);
        console.error(`Verifique se o arquivo '${adapterPath}' existe e exporta a função 'discover'.`);
        process.exit(1);
    }

    try {
        await runPipeline(adapter);
        console.log(`\n🎉 [RUNNER] Pipeline finalizado com sucesso para: ${adapterName}`);
    } catch (e) {
        console.error(`\n❌ [RUNNER] Pipeline abortado com erro para: ${adapterName}`);
        console.error(e);
        process.exit(1);
    }
}

main();
