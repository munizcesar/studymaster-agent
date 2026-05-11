// URL do Worker do StudyMaster - Concursos API
// Endpoint: https://studymaster-worker.cesarmuniz0816.workers.dev/api/questions
const WORKER_URL = 'https://studymaster-worker.cesarmuniz0816.workers.dev/api/questions';

async function main() {
  const body = {
    mode: 'concursos',
    quantity: 3,
    difficulty: 'medio',
    filter: {
      content: {
        discipline: 'direito_constitucional',
      },
      exam: {
        examBoard: 'cespe',
      },
      examMetadata: {
        yearFrom: 2018,
        yearTo: 2024,
      },
    },
  };

  try {
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('Status:', response.status);

    const data = await response.json();
    console.dir(data, { depth: null });

    console.log('Success:', data.success);
    console.log('Error:', data.error);
    console.log('Quality protocol:', data.metadata?.qualityProtocol);
    console.log('Approved:', data.metadata?.questionsApproved);
    console.log('Rejected:', data.metadata?.questionsRejected);
  } catch (error) {
    console.error('Request failed:', error);
  }
}

main();
