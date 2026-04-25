// StudyMaster AI Worker — Cloudflare Worker + Groq API
// Deploy: wrangler deploy
// Env var necessária: GROQ_API_KEY

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

function extractQuestions(parsed) {
  if (Array.isArray(parsed)) return parsed;
  // Tenta encontrar um array em qualquer chave do objeto
  for (const key of Object.keys(parsed)) {
    if (Array.isArray(parsed[key])) return parsed[key];
  }
  return [];
}

export default {
  async fetch(request, env) {

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    if (!env.GROQ_API_KEY) {
      return new Response(JSON.stringify({
        error: 'Configuração incompleta',
        userMessage: 'A chave da API não está configurada no servidor. Configure GROQ_API_KEY nas variáveis do Worker.',
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

Você DEVE retornar um objeto JSON com a chave "questions" contendo um array de questões.
Estrutura obrigatória:
{
  "questions": [
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
}

Regras:
1. Para questões de verdadeiro/falso, use apenas 2 opções: A (Verdadeiro) e B (Falso).
2. As questões devem ser tecnicamente corretas, sem ambiguidades.
3. As explicações devem ser didáticas e claras.
4. Varie a posição da alternativa correta entre as questões.
5. Escreva tudo em português do Brasil.`;

      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'Você é um gerador de questões acadêmicas. Retorne APENAS JSON válido com a chave "questions" contendo o array de questões.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 8192,
          response_format: { type: 'json_object' },
        }),
      });

      if (!groqResponse.ok) {
        const err = await groqResponse.text();
        let userMessage = 'Erro ao conectar com a IA. Tente novamente em instantes.';
        if (groqResponse.status === 429) userMessage = 'Limite de uso da IA atingido. Aguarde alguns instantes e tente novamente.';
        else if (groqResponse.status === 400) userMessage = 'Requisição inválida. Verifique as configurações e tente novamente.';
        else if (groqResponse.status === 401) userMessage = 'Chave da API inválida. Verifique o GROQ_API_KEY nas configurações do Worker.';

        return new Response(JSON.stringify({ error: 'Groq API error', details: err, userMessage }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const groqData = await groqResponse.json();
      const rawText = groqData?.choices?.[0]?.message?.content || '{}';

      let questions = [];
      try {
        const parsed = JSON.parse(rawText);
        questions = extractQuestions(parsed);
      } catch {
        const match = rawText.match(/\[.*\]/s);
        try { questions = match ? JSON.parse(match[0]) : []; } catch { questions = []; }
      }

      if (!Array.isArray(questions) || questions.length === 0) {
        return new Response(JSON.stringify({
          error: 'Resposta vazia',
          rawText,
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
