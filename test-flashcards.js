async function testWorker() {
  const url = 'https://studymaster-worker.cesarmuniz0816.workers.dev/';
  
  const text = "O direito administrativo é o ramo do direito público que trata de princípios e regras que disciplinam a função administrativa e que abrange entes, órgãos, agentes e atividades desempenhadas pela Administração Pública na consecução do interesse público. ".repeat(100);

  const payload = {
    mode: 'flashcards',
    freeText: text,
    quantity: '30', // Ask for 30 flashcards!
    userId: 'test-user-123'
  };

  console.log('Sending request to worker:', url);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log('Status HTTP:', res.status);
    const bodyText = await res.text();
    console.log('Response Body:', bodyText);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testWorker();
