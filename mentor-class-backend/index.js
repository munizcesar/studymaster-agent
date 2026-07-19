// index.js (Cloudflare Worker - Mentor Class Backend)

const MENTOR_SYSTEM_PROMPT = `
ROLE: Você é o Mentor Tático de alta performance da plataforma Mentor Class.
MISSÃO: Mapear falhas, cobrar foco e esclarecer dúvidas estritamente baseadas no Edital e nas metas do dia.
TOM DE VOZ: Direto, analítico e encorajador. Use frases curtas. 

REGRAS:
1. Nunca invente regras de concurso ou leis.
2. Se a dúvida técnica do aluno não puder ser resolvida com certeza absoluta, responda: "Isso foge ao nosso material de base seguro. Consulte a documentação oficial."
3. Lembre o aluno do tempo restante até a prova se ele demonstrar desmotivação.
`;

const DEVORADOR_EDITAIS_PROMPT = `
Você é o analisador de dados da plataforma Mentor Class. Sua função é ler o texto de um edital e gerar um "Raio-X" rápido e instigante.
REGRAS:
1. NÃO liste os tópicos das disciplinas.
2. Identifique a disciplina com o maior peso.
3. Retorne EXCLUSIVAMENTE um objeto JSON válido no seguinte formato:
{
  "total_disciplinas": X,
  "estimativa_topicos": Y,
  "disciplina_critica": "Nome",
  "diagnostico_curto": "Seu diagnóstico aqui"
}
`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

function handleOptions(request) {
  if (
    request.headers.get("Origin") !== null &&
    request.headers.get("Access-Control-Request-Method") !== null &&
    request.headers.get("Access-Control-Request-Headers") !== null
  ) {
    return new Response(null, { headers: corsHeaders });
  } else {
    return new Response(null, { headers: { Allow: "POST, OPTIONS" } });
  }
}

export default {
  async fetch(request, env) {
    // 1. Middleware de CORS (Segurança Frontend-Backend)
    if (request.method === "OPTIONS") {
      return handleOptions(request);
    }

    // Bloqueia qualquer tentativa que não seja POST
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), { 
        status: 405, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    const url = new URL(request.url);

    // 2. Roteamento blindado com try/catch
    try {
      if (url.pathname === "/api/parse-edital") {
        return await handleParseEdital(request, env);
      } else if (url.pathname === "/api/gerar-sessao") {
        return await handleGerarSessao(request, env);
      } else {
        return new Response(JSON.stringify({ error: "Endpoint Not Found" }), { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }
    } catch (error) {
      console.error("[CRITICAL ERROR]:", error);
      return new Response(JSON.stringify({ error: error.message || "Falha interna no motor da IA." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }
};

async function handleParseEdital(request, env) {
  const { texto } = await request.json();
  if (!texto || texto.length < 50) {
    throw new Error("Texto do edital insuficiente ou ausente na camada de backend.");
  }

  // Chamada apontada para a API do Groq
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: env.MODEL_PARSER, // ex: llama3-8b-8192 (Rápido e barato)
      messages: [
        { role: "system", content: DEVORADOR_EDITAIS_PROMPT },
        { role: "user", content: `TEXTO DO EDITAL:\n${texto}` }
      ],
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) throw new Error("A API do Groq rejeitou a requisição no /parse-edital");

  const data = await response.json();
  const jsonContent = data.choices[0].message.content;

  return new Response(jsonContent, {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

async function handleGerarSessao(request, env) {
  const { editalData, nivel, foco } = await request.json();

  const prompt = `Gere 3 questões desafiadoras com foco em ${foco} para um aluno de nível ${nivel}, embasadas estritamente nas disciplinas:${JSON.stringify(editalData.disciplinas)}. 
  Retorne APENAS um array JSON puro (sem marcação \`\`\`) contendo objetos com: id, disciplina, enunciado, alternativas (array de 4 strings), correta (letra), comentarioMentor (adotando a persona do Mentor Tático).`;

  // Chamada apontada para a API do Groq
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: env.MODEL_MENTOR, // ex: llama3-70b-8192 (Raciocínio complexo)
      messages: [
        { role: "system", content: MENTOR_SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ]
    })
  });

  if (!response.ok) throw new Error("A API do Groq rejeitou a requisição no /gerar-sessao");

  const data = await response.json();
  let questoesJson = data.choices[0].message.content.trim();
  
  // Sanitização de segurança caso a IA retorne markdown
  if (questoesJson.startsWith("\`\`\`json")) {
    questoesJson = questoesJson.replace(/^\`\`\`json\n|\n\`\`\`$/g, '');
  }

  return new Response(JSON.stringify({ status: "success", questoes: JSON.parse(questoesJson) }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
