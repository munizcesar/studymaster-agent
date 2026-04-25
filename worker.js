// StudyMaster AI Worker — Cloudflare Worker + Google Gemini API
// Deploy: wrangler deploy
// Env var necessária: GEMINI_API_KEY

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request, env) {

    // Responde preflight OPTIONS com CORS imediatamente
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    // Verifica se a chave está configurada
    if (!env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({
        error: 'Configuração incompleta',
        userMessage: 'A chave da API não está configurada no servidor. Configure GEMINI_API_KEY nas variáveis do Worker.',
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    try {
      const body = await request.json();
      const { topic, subject, area, mode, difficulty, quantity, questionType, concurso, banca, freeText, editalText } = body;

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
        if (editalText && editalText.length > 0) {
          contextInfo += `\n\nConteúdo programático do edital:\n${editalText.slice(0, 3000)}`;
        }
      } else if (mode === 'academic') {
        contextInfo = `Área: ${area}. Disciplina: ${subject}. Tópico: ${topic || 'Matéria completa'}.`;
      } else if (mode === 'livre' && freeText) {
        contextInfo = `Material de estudo fornecido pelo usuário:\n${freeText.slice(0, 4000)}`;
      } else {
        contextInfo = `Tópico livre: ${topic || subject || area || 'Conhecimentos gerais'}.`;
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

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;

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
        let userMessage = 'Erro ao conectar com a IA. Tente novamente em instantes.';

        if (geminiResponse.status === 429) {
          userMessage = 'Limite de uso da IA atingido. Aguarde alguns instantes e tente novamente.';
        } else if (geminiResponse.status === 400) {
          userMessage = 'Requisição inválida. Verifique as configurações e tente novamente.';
        } else if (geminiResponse.status === 403) {
          userMessage = 'Chave da API inválida ou sem permissão. Entre em contato com o suporte.';
        }

        return new Response(JSON.stringify({ error: 'Gemini API error', details: err, userMessage }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const geminiData = await geminiResponse.json();

      // Verifica se a resposta foi bloqueada por safety
      if (geminiData?.promptFeedback?.blockReason) {
        return new Response(JSON.stringify({
          error: 'Conteúdo bloqueado',
          userMessage: 'O conteúdo foi bloqueado pelo filtro de segurança da IA. Tente um tópico diferente.',
        }), { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';

      let questions;
      try {
        questions = JSON.parse(rawText);
      } catch {
        const match = rawText.match(/\[.*\]/s);
        try {
          questions = match ? JSON.parse(match[0]) : [];
        } catch {
          questions = [];
        }
      }

      if (!Array.isArray(questions) || questions.length === 0) {
        return new Response(JSON.stringify({
          error: 'Resposta vazia',
          userMessage: 'A IA não conseguiu gerar questões para esse conteúdo. Tente ajustar o tópico ou o nível de dificuldade.',
        }), { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ questions }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (err) {
      return new Response(JSON.stringify({
        error: err.message,
        userMessage: 'Ocorreu um erro inesperado. Tente novamente em instantes.',
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
