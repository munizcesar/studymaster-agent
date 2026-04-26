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
      const {
        topic, subject, area, mode,
        difficulty, quantity, questionType,
        concurso, banca, bancaFoco,
        freeText, editalText,
        alternativas, idioma, sessionMode,
      } = body;

      // ─── Mapeamentos ───────────────────────────────────────────────────
      const difficultyMap = {
        easy:    'fácil (nível iniciante, conceitos básicos e definições diretas)',
        medium:  'médio (nível intermediário, aplicação de conceitos e raciocínio)',
        hard:    'difícil (nível avançado, análise crítica e interpretação profunda)',
        extreme: 'extremo (nível especialista, questões de prova real de alto nível, pegadinhas técnicas)',
      };

      // Número de alternativas (padrão 5 se não informado)
      const numAlts = parseInt(alternativas) === 4 ? 4 : 5;
      const altKeys = ['A', 'B', 'C', 'D', 'E'].slice(0, numAlts);
      const altKeysStr = altKeys.join(', ');

      // Tipo de questão com alternativas dinâmicas
      const typeMap = {
        mc:  `múltipla escolha com ${numAlts} alternativas (${altKeysStr})`,
        vf:  'verdadeiro ou falso (use apenas A para Verdadeiro e B para Falso)',
        mix: `misto: combine múltipla escolha (${numAlts} alternativas: ${altKeysStr}) com questões de verdadeiro/falso`,
      };

      // Idioma
      const idiomaMap = {
        'pt-BR': 'português do Brasil',
        'en':    'English',
        'es':    'español',
      };
      const idiomaLabel = idiomaMap[idioma] || 'português do Brasil';
      const isPortugues = !idioma || idioma === 'pt-BR';

      // Banca efetiva: bancaFoco manual tem prioridade sobre a inferida do concurso
      const bancaEfetiva = (bancaFoco && bancaFoco !== 'auto') ? bancaFoco : (banca || null);

      // Modo de sessão
      const sessionMap = {
        normal:   null,
        concurso: 'Modo Simulado: as questões devem simular fielmente uma prova oficial real, com linguagem formal e rigor técnico.',
        revisao:  'Modo Revisão Rápida: priorize enunciados objetivos e curtos, focando nos pontos mais cobrados do tema.',
      };
      const sessionInstruction = sessionMap[sessionMode] || null;

      // Instrução de banca
      let bancaInstruction = '';
      if (bancaEfetiva && bancaEfetiva !== 'A definir') {
        const bancaStyles = {
          'CEBRASPE':     'Estilo CEBRASPE/CESPE: enunciados longos e contextualizados, assertivas únicas (Certo/Errado quando V/F), negativas com "não", "exceto", "é incorreto afirmar". Use pegadinhas sutis nas alternativas erradas.',
          'CEBRASPE/CESPE': 'Estilo CEBRASPE/CESPE: enunciados longos e contextualizados, assertivas únicas, negativas com "não", "exceto", "é incorreto afirmar". Use pegadinhas sutis nas alternativas erradas.',
          'FCC':          'Estilo FCC: questões diretas e objetivas, enunciados médios, foco em literalidade da lei e doutrina. Alternativas bem delimitadas.',
          'VUNESP':       'Estilo VUNESP: enunciados claros e bem redigidos, foco em interpretação de texto e aplicação prática. Alternativas plausíveis.',
          'FGV':          'Estilo FGV: enunciados elaborados com casos práticos e situações problemáticas, linguagem jurídica/técnica refinada. Exige raciocínio aplicado.',
          'CESGRANRIO':   'Estilo CESGRANRIO: questões bem estruturadas, foco em conceitos teóricos e aplicados, linguagem neutra e técnica. Muito usada em bancos.',
          'IDECAN':       'Estilo IDECAN: questões objetivas, moderadamente extensas, foco em lei seca e doutrina básica.',
          'IBFC':         'Estilo IBFC: questões de nível médio-alto, enunciados diretos, alterna entre teoria e prática.',
          'AOCP':         'Estilo AOCP: questões claras e objetivas, foco em conhecimentos teóricos, boa distribuição de dificuldade.',
          'FEPESE':       'Estilo FEPESE: questões objetivas e bem organizadas, foco no Sul do Brasil, mistura lei seca e aplicação.',
          'INEP/MEC':     'Estilo INEP/MEC (Revalida/ENADE): questões clínicas ou de caso aplicado, enunciados com cenário prático, exige raciocínio clínico e científico.',
          'FAMERP/VUNESP':'Estilo FAMERP/VUNESP (Residência Médica): casos clínicos completos, questões de conduta médica, diagnóstico diferencial.',
          'FUNDEP':       'Estilo FUNDEP: questões equilibradas entre teoria e prática, linguagem acadêmica e profissional.',
          'FUNDATEC':     'Estilo FUNDATEC: questões objetivas com foco regional (Sul do Brasil), lei seca e aplicação.',
        };
        const style = bancaStyles[bancaEfetiva] || `Banca: ${bancaEfetiva}. Siga o estilo e rigor típico dessa banca organizadora.`;
        bancaInstruction = `\n\nEstilo de banca: ${style}`;
      }

      // Contexto do conteúdo
      const diffLabel = difficultyMap[difficulty] || 'médio';
      const typeLabel = typeMap[questionType] || typeMap['mc'];

      let contextInfo = '';
      if (mode === 'concurso' && concurso) {
        contextInfo = `Concurso: ${concurso}.${bancaEfetiva ? ` Banca: ${bancaEfetiva}.` : ''} As questões devem seguir o estilo e padrão desse concurso.`;
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

      // ─── Montagem do prompt dinâmico ─────────────────────────────────────────
      // Monta o exemplo de alternativas dinamicamente
      const exampleOptions = altKeys.map(k => `{ "key": "${k}", "text": "Texto da alternativa ${k}" }`).join(',\n        ');

      const prompt = `Você é um professor especialista em concursos públicos e ensino superior brasileiro.

Gere exatamente ${quantity} questões de ${typeLabel} sobre o seguinte conteúdo:
${contextInfo}${bancaInstruction}${sessionInstruction ? `\n\n${sessionInstruction}` : ''}

Nível de dificuldade: ${diffLabel}.
Idioma das questões: ${idiomaLabel}. Escreva enunciados, alternativas e explicações inteiramente em ${idiomaLabel}.

Você DEVE retornar um objeto JSON com a chave "questions" contendo um array de questões.
Estrutura obrigatória:
{
  "questions": [
    {
      "id": 1,
      "statement": "Enunciado completo da questão aqui.",
      "options": [
        ${exampleOptions}
      ],
      "correctAnswer": "${altKeys[0]}",
      "explanation": "Explicação detalhada do porquê a alternativa ${altKeys[0]} está correta e as demais estão erradas."
    }
  ]
}

Regras obrigatórias:
1. Cada questão de múltipla escolha deve ter exatamente ${numAlts} alternativas (${altKeysStr}).
2. Para questões de verdadeiro/falso, use APENAS 2 opções: A (Verdadeiro) e B (Falso).
3. As questões devem ser tecnicamente corretas, sem ambiguidades.
4. As explicações devem ser didáticas, claras e em ${idiomaLabel}.
5. Varie a posição da alternativa correta entre as questões (não concentre sempre em A ou B).
6. Não repita enunciados nem alternativas semelhantes entre as questões.
7. Gere exatamente ${quantity} questões — nem mais, nem menos.`;

      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `Você é um gerador de questões acadêmicas de alta qualidade. Retorne APENAS JSON válido com a chave "questions" contendo o array de questões. Cada questão de múltipla escolha deve ter exatamente ${numAlts} alternativas. Não inclua nenhum texto fora do JSON.`,
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.72,
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
