// Test script for Coach RedBot with new system prompt
// Run with: node test-redbot-prompt.js

const fs = require('fs');
const path = require('path');

// Read the current COACH_REDBOT_SYSTEM_PROMPT from src/redbot.js
const srcPath = path.join(__dirname, 'src/redbot.js');
const src = fs.readFileSync(srcPath, 'utf8');
const match = src.match(/const COACH_REDBOT_SYSTEM_PROMPT = `([\s\S]*?)`;/);
if (!match) {
  console.error('ERROR: COACH_REDBOT_SYSTEM_PROMPT not found');
  process.exit(1);
}
const systemPrompt = match[1];
console.log('=== PROMPT SENDED ===');
console.log(systemPrompt);
console.log('\n=== PROMPT LENGTH:', systemPrompt.length, 'chars ===\n');

const payload = {
  mode: 'redbot',
  systemPrompt: systemPrompt,
  message: `Colei minha redação aqui para você corrigir:

A saúde pública no Brasil enfrenta desafios significativos. O Sistema Único de Saúde (SUS) foi criado pela Constituição de 1988 e garante acesso universal à saúde. No entanto, falta investimento e a população sofre com filas enormes nos hospitais públicos.

Primeiramente, é importante destacar que a saúde é um direito de todos, conforme previsto na Constituição. Porém, na prática, o que se vê é um sistema sobrecarregado. As filas para cirurgias eletivas podem levar anos.

Além disso, a falta de médicos nas regiões mais remotas do país agrava ainda mais a situação. Muitos profissionais preferem trabalhar na rede privada onde os salários são melhores.

Portanto, precisamos de mais investimento em saúde pública para garantir que todos tenham acesso a tratamentos de qualidade.`,
  type: 'essay',
  history: [],
  studentData: '',
  timestamp: Date.now()
};

console.log('=== SENDING REQUEST TO WORKER ===');
console.log('Payload size:', JSON.stringify(payload).length, 'bytes\n');

const https = require('https');

const data = JSON.stringify(payload);
const url = new URL('https://studymaster-worker.cesarmuniz0816.workers.dev');

const options = {
  hostname: url.hostname,
  port: 443,
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  console.log('HTTP Status:', res.statusCode);
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    console.log('\n=== WORKER RESPONSE ===');
    try {
      const parsed = JSON.parse(body);
      console.log(JSON.stringify(parsed, null, 2));
    } catch {
      console.log(body);
    }
  });
});

req.on('error', (error) => {
  console.error('ERROR:', error.message);
});

req.write(data);
req.end();
