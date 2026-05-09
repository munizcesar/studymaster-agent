
async function testWorker() {
  const WORKER_URL = 'https://studymaster-worker.cesarmuniz0816.workers.dev';
  
  const payload = {
    mode: 'concursos',
    filter: 'direito_constitucional',
    area: null,
    subject: null,
    topic: null,
    concurso: undefined,
    banca: 'auto',
    bancaFoco: null,
    freeText: '',
    editalText: '',
    youtubeUrl: '',
    difficulty: 'medium',
    quantity: 1,
    questionType: 'mc',
    alternativas: 4,
    idioma: 'pt-BR',
    sessionMode: 'normal'
  };

  try {
    const res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    console.log(`Status: ${res.status}`);
    const text = await res.text();
    console.log(`Response: ${text}`);
  } catch (err) {
    console.error('Error:', err);
  }
}

testWorker();
