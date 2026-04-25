// StudyMaster AI Worker — Cloudflare Worker + Google Gemini API
// Deploy: wrangler deploy
// Env var necessária: GEMINI_API_KEY

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const body = await request.json();
      const { topic, subject, area, mode, difficulty, quantity, questionType, concurso, banca } = body;

      const difficultyMap = {
        easy: 'fácil (nível iniciante, conceitos básicos)',
        medium: 'médio (nível intermediário, aplicação de conceitos)',
        hard: 'difícil (nível avançado, análise e interpretação)',
        extreme: 'extremo (nível especialista, questões de prova real de alto nível)',
      };

      const typeMap = {
        mc: 'múltipla escolha com 4 alternativas (A, B, C, D)',
        vf: 'verdadeiro ou falso',
        mix: 'misto (múltipla escolha e verdadeiro/falso)',
      };

      const diffLabel = difficultyMap[difficulty] || 'médio';
      const typeLabel = typeMap[questionType] || 'múltipla escolha com 4 alternativas (A, B, C, D)';

      let contextInfo = '';
      if (mode === 'concurso' && concurso) {
        contextInfo = `Concurso: ${concurso}. Banca: ${banca || 'CESPE/CEBRASPE'}. As questões devem seguir o estilo e padrão dessa banca.`;
      } else if (mode === 'academic') {
        contextInfo = `Área: ${area}. Disciplina: ${subject}. Tópico: ${topic}.`;
      } else {
        contextInfo = `Tópico livre: ${topic || subject || area}.`;
      }

      const prompt = `Você é um professor especialista em concursos públicos e ensino superior brasileiro.

Gere exatamente ${quantity} questões de ${typeLabel} sobre o seguinte conteúdo:
${contextInfo}

Nível de dificuldade: ${diffLabel}.

Regras obrigatórias:
1. Retorne APENAS um JSON válido, sem markdown, sem texto antes ou depois.
2. O JSON deve ser um array de objetos com esta estrutura exata:
[
  {
    "id": 1,
    "statement": "Enunciado completo da questão aqui.",
    "options": [
      { "key": "A", "text": "Texto da alternativa A" },
      { "key": "B", "text": "Texto da alternativa B" },
      { "key": "C", "text": "Texto da alternativa C" },
      { "key": "D", "text": "Texto da alternativa D" }
    ],
    "correctAnswer": "A",
    "explanation": "Explicação detalhada do porquê a alternativa A está correta e as demais estão erradas."
  }
]
3. Para questões de verdadeiro/falso, use apenas 2 opções: A (Verdadeiro) e B (Falso).
4. As questões devem ser tecnicamente corretas, sem ambiguidades.
5. As explicações devem ser didáticas e claras.
6. Varie a posição da alternativa correta entre as questões.
7. Escreva tudo em português do Brasil.`;

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`;

      const geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!geminiResponse.ok) {
        const err = await geminiResponse.text();
        return new Response(JSON.stringify({ error: 'Gemini API error', details: err }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const geminiData = await geminiResponse.json();
      const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';

      let questions;
      try {
        questions = JSON.parse(rawText);
      } catch {
        // tenta extrair JSON do texto
        const match = rawText.match(/\[.*\]/s);
        questions = match ? JSON.parse(match[0]) : [];
      }

      return new Response(JSON.stringify({ questions }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
