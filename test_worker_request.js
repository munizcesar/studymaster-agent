const payload = {
  mode: 'academic',
  area: 'Direito',
  subject: 'Direito Constitucional',
  topic: 'Direitos Fundamentais',
  difficulty: 'medium',
  quantity: 10,
  questionType: 'mc',
  alternativas: 5,
  idioma: 'pt-BR',
  sessionMode: 'normal',
  bancaFoco: null,
  banca: null,
};

(async () => {
  const res = await fetch('https://studymaster-worker.cesarmuniz0816.workers.dev', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  console.log('STATUS', res.status);
  console.log(text.slice(0, 2000));
})();
