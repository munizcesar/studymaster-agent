const WORKER_URL = 'https://studymaster-worker.cesarmuniz0816.workers.dev/api/editais/search';

async function test(query) {
  const body = { query, limit: 10 };
  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  const data = await res.json();
  console.log(`\n=== Query: "${query}" ===`);
  if (!data.success) {
    console.error("Error:", data.error);
    return;
  }
  
  console.log(`Results: ${data.results.length}`);
  data.results.forEach((r, i) => {
    console.log(`  [${i+1}] ID: ${r.id} | Órgão: ${r.orgao} | Cargo: ${r.cargo} | Banca: ${r.banca} | Ano: ${r.ano || r.data_prova}`);
  });
}

async function main() {
  const queries = [
    'pc sp 2023',
    'pc sp 2013',
    'inss',
    'guarda municipal campinas',
    'polícia federal',
    'xjxjxjxyz'
  ];
  
  for (const q of queries) {
    await test(q);
  }
}

main();
