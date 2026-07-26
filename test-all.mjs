async function runTests() {
  const queries = [
    'pc sp',
    'pcsp',
    'escrivão',
    'vunesp',
    '2023',
    'guarda municipal',
    'consulta_xyz_inexistente'
  ];

  for (const q of queries) {
    try {
      const res = await fetch('https://studymaster-worker.cesarmuniz0816.workers.dev/api/editais/search', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({query: q})
      });
      const data = await res.json();
      console.log(`\n=== QUERY: "${q}" ===`);
      console.log(`Results length: ${data.results?.length}`);
      
      if (data.results && data.results.length > 0) {
        // Just print the first 2 results to inspect their structure
        console.log("Sample results (first 2):");
        data.results.slice(0, 2).forEach(r => {
          console.log(`  - ID: ${r.id}`);
          console.log(`    Órgão: ${r.orgao}`);
          console.log(`    Cargo: ${r.cargo}`);
          console.log(`    Banca: ${r.banca}`);
          console.log(`    URL: ${r.url}`);
          console.log(`    Source: ${r.source}`);
        });
      }
    } catch (e) {
      console.error(`Error querying "${q}":`, e.message);
    }
  }
}

runTests();
