// src/universal-engine.js

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function randChoice(arr) { return arr[randInt(0, arr.length - 1)]; }
export function gcd(x, y) { return y === 0 ? x : gcd(y, x % y); }
export const DIAS_SEMANA = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];

export function tTexto(question, resposta, unidade) {
  return { tipo: "texto", question, resposta: String(resposta), unidade: unidade || "" };
}
export function tMcq(question, correctValue, distractors) {
  const options = shuffle([correctValue, ...distractors]).map(String);
  return { tipo: "mcq", question, options, correctIndex: options.indexOf(String(correctValue)) };
}

/**
 * DiagnosticModule
 * Responsável por analisar a resposta e classificar o erro (distração, conceitual, etc.)
 */
export const DiagnosticModule = {
  analyze(exercicio, valorUsuario, indiceUsuario) {
    let acertou = false;
    let diagnostico = "correto";

    if (exercicio.tipo === "mcq") {
      acertou = indiceUsuario === exercicio.correctIndex;
      if (!acertou) {
        diagnostico = "erro_conceitual_mcq"; 
      }
    } else {
      const a = String(valorUsuario).trim().toLowerCase().replace(",", ".");
      const b = String(exercicio.resposta).trim().toLowerCase().replace(",", ".");
      const na = parseFloat(a), nb = parseFloat(b);
      
      if (!isNaN(na) && !isNaN(nb)) {
        acertou = Math.abs(na - nb) < 0.01;
      } else {
        acertou = (a === b);
      }
      
      if (!acertou) {
        diagnostico = "erro_dissertativo";
      }
    }

    return {
      acertou,
      diagnostico,
      timestamp: Date.now()
    };
  }
};

/**
 * Strategy de Geração Procedural (Exatas)
 */
const GERADORES = {
  /* ---------- Módulo 1 ---------- */
  t1_1: () => randChoice([
    () => { const a = randInt(-20, -1), b = randInt(1, 20); return tTexto(`Quanto é ${a} + ${b}?`, a + b); },
    () => { const a = randInt(-15, -1), b = randInt(-15, -1); return tTexto(`Quanto é ${a} + ${b}?`, a + b); },
    () => { const a = randInt(-10, 10), b = randInt(1, 15); return tTexto(`Quanto é ${a} - ${b}?`, a - b); },
  ])(),
  t1_2: () => randChoice([
    () => {
      const n = randInt(1000, 9999), digs = String(n).split("").reverse();
      const posNomes = ["unidades", "dezenas", "centenas", "milhares"];
      const pos = randInt(0, 3);
      return tTexto(`No número ${n}, qual é o algarismo das ${posNomes[pos]}?`, digs[pos]);
    },
    () => { const n = randInt(2, 9); return tTexto(`Quantas dezenas há no número ${n}0?`, n); },
  ])(),
  t1_3: () => randChoice([
    () => { const a = randInt(2, 9), b = randInt(2, 9), c = randInt(2, 9); return tTexto(`Quanto é ${a} + ${b} × ${c}?`, a + b * c); },
    () => { const b = randInt(2, 9), c = randInt(2, 9), a = b * c + randInt(1, 9); return tTexto(`Quanto é ${a} - ${b} × ${c}?`, a - b * c); },
    () => { const q = randInt(2, 12), d = randInt(2, 9); return tTexto(`Quanto é ${q * d} ÷ ${d}?`, q); },
  ])(),
  t1_4: () => {
    let p = randInt(2, 9), q = randInt(2, 9);
    while (gcd(p, q) !== 1) { p = randInt(2, 9); q = randInt(2, 9); }
    const k = randInt(2, 6);
    return tTexto(`Simplifique a fração ${p * k}/${q * k} para a forma mais simples (escreva como a/b):`, `${p}/${q}`);
  },
  t1_5: () => randChoice([
    () => { const a = randInt(2, 12); return tTexto(`Quanto é ${a}²?`, a * a); },
    () => { const a = randInt(2, 10); return tTexto(`Quanto é √${a * a}?`, a); },
    () => { const a = randInt(2, 5); return tTexto(`Quanto é ${a}³?`, a * a * a); },
  ])(),
  t1_6: () => randChoice([
    () => {
      const a = randInt(4, 12), b = randInt(4, 12), isMmc = Math.random() > 0.5, g = gcd(a, b), val = isMmc ? (a * b) / g : g;
      return tTexto(`Qual é o ${isMmc ? "MMC" : "MDC"} entre ${a} e ${b}?`, val);
    },
    () => {
      const a = randInt(3, 8), b = randInt(3, 8), g = gcd(a, b);
      return tTexto(`Dois ônibus saem juntos de manhã. Um retorna a cada ${a} min, outro a cada ${b} min. Depois de quantos minutos eles saem juntos de novo? (dica: MMC)`, (a * b) / g);
    },
  ])(),
  t1_7: () => randChoice([
    () => tMcq("Qual desses números é irracional?", "√2", ["0,5", "3/4", "-7", "10"]),
    () => tMcq("Qual desses números é um número inteiro, mas não natural?", "-4", ["2", "0,5", "1/2", "0"]),
    () => tMcq("Qual desses é um número racional?", "0,75", ["π", "√3", "√5", "√7"]),
  ])(),
  t1_8: () => randChoice([
    () => { const d = randInt(3, 9), a = randInt(1, d - 1), b = randInt(1, d - 1); return tTexto(`Quanto é ${a}/${d} + ${b}/${d}? (escreva como a/b, sem simplificar)`, `${a + b}/${d}`); },
    () => { const d = randInt(3, 6), a = randInt(2, d); return tTexto(`Uma pizza foi dividida em ${d} pedaços iguais. Se você comeu ${a} pedaços, que fração da pizza você comeu? (escreva a/b)`, `${a}/${d}`); },
  ])(),
  t1_9: () => randChoice([
    () => { const a = randInt(10, 99) / 10, b = randInt(10, 99) / 10; return tTexto(`Quanto é ${a.toFixed(1)} + ${b.toFixed(1)}?`, (Math.round((a + b) * 10) / 10).toFixed(1)); },
    () => { const a = randInt(20, 99) / 10, b = randInt(10, 90) / 10; return tTexto(`Quanto é ${a.toFixed(1)} - ${b.toFixed(1)}?`, (Math.round((a - b) * 10) / 10).toFixed(1)); },
  ])(),
  t1_10: () => randChoice([
    () => { const a = randInt(20, 80), b = randInt(2, 15), c = randInt(2, 15); return tTexto(`Uma loja tinha ${a} produtos em estoque. Vendeu ${b} e recebeu mais ${c} de um fornecedor. Com quantos produtos ficou?`, a - b + c); },
    () => { const a = randInt(3, 9), b = randInt(2, 8); return tTexto(`Cada caixa tem ${a} unidades. Quantas unidades há em ${b} caixas?`, a * b); },
  ])(),

  /* ---------- Módulo 2 ---------- */
  t2_1: () => randChoice([
    () => { const cm = randInt(2, 9) * 100; return tTexto(`Quantos metros tem ${cm} cm?`, cm / 100); },
    () => { const kg = randInt(2, 9); return tTexto(`Quantos gramas tem ${kg} kg?`, kg * 1000); },
    () => { const l = randInt(2, 9); return tTexto(`Quantos mililitros tem ${l} litros?`, l * 1000); },
  ])(),
  t2_2: () => randChoice([
    () => { const h = randInt(1, 5); return tTexto(`Quantos minutos tem ${h} hora${h > 1 ? "s" : ""}?`, h * 60); },
    () => { const min = randInt(20, 90); const hInicio = randInt(8, 16), mInicio = randChoice([0, 15, 30, 45]);
      const totalIni = hInicio * 60 + mInicio, totalFim = totalIni + min;
      const hf = Math.floor(totalFim / 60) % 24, mf = totalFim % 60;
      return tTexto(`Uma prova começa às ${String(hInicio).padStart(2, "0")}h${String(mInicio).padStart(2, "0")} e dura ${min} minutos. A que horas ela termina? (formato HH:MM)`, `${String(hf).padStart(2, "0")}:${String(mf).padStart(2, "0")}`);
    },
  ])(),
  t2_3: () => { const k = randInt(2, 6), a = randInt(2, 5), b = randInt(2, 5); return tTexto(`A razão entre dois números é ${a}:${b}. Se o primeiro número é ${a * k}, qual é o segundo?`, b * k); },
  t2_4: () => randChoice([
    () => { const p1 = randInt(2, 6), d1 = randInt(6, 20), p2 = randInt(2, 6); const total = p1 * d1;
      return tTexto(`${p1} pedreiros constroem um muro em ${d1} dias. Trabalhando na mesma proporção, quantos dias levariam ${p2} pedreiros? (grandezas inversamente proporcionais)`, total / p2);
    },
    () => { const h1 = randInt(2, 6), q1 = randInt(2, 10); const h2 = randInt(2, 6);
      return tTexto(`${h1} máquinas produzem ${q1 * h1} peças por hora. Quantas peças ${h2} máquinas produzem no mesmo tempo? (proporcionais direto)`, q1 * h2);
    },
  ])(),
  t2_5: () => { const l = randInt(2, 8), preco = randInt(3, 8), l2 = randInt(2, 15); return tTexto(`Se ${l} litros de combustível custam R$ ${preco * l} para abastecer uma viatura, quanto custam ${l2} litros (mesmo preço por litro)?`, preco * l2); },
  t2_6: () => randChoice([
    () => tMcq("Uma tabela mostra ocorrências atendidas por dia: dia 1→2, dia 2→4, dia 3→6. Qual regra representa essa relação (x = dia, y = ocorrências)?", "y = 2x", ["y = x + 1", "y = x²", "y = 3x", "y = x/2"]),
    () => tMcq("Num gráfico de barras comparando rondas por bairro, a barra mais alta representa:", "O bairro com mais rondas", ["O bairro com menos rondas", "A média de rondas", "O total de bairros", "O bairro mais antigo"]),
  ])(),
  t2_7: () => randChoice([
    () => { const base = randInt(2, 20) * 10, pct = [5, 10, 15, 20, 25, 40, 50][randInt(0, 6)]; return tTexto(`Quanto é ${pct}% de ${base}?`, (base * pct) / 100); },
    () => { const preco = randInt(10, 40) * 10, pct = [10, 20, 30][randInt(0, 2)]; return tTexto(`Um produto de R$ ${preco} teve um desconto de ${pct}%. Qual o preço final?`, preco - (preco * pct) / 100); },
  ])(),
  t2_8: () => { const c = randInt(2, 10) * 100, i = [2, 5, 10][randInt(0, 2)], t = randInt(2, 6); return tTexto(`Um capital de R$ ${c} rende juros simples de ${i}% ao mês, durante ${t} meses. Qual o valor dos juros (J = C × i × t)?`, (c * i * t) / 100); },
  t2_9: () => { const a = randInt(2, 5) * 50, b = randInt(1, 4) * 20; return tTexto(`Você pagou uma compra de R$ ${a - b} com uma nota de R$ ${a}. Quanto de troco você recebe?`, b); },

  /* ---------- Módulo 3 ---------- */
  t3_1: () => { const x = randInt(2, 10), a = randInt(2, 6), b = randInt(1, 10); return tTexto(`Se x = ${x}, quanto vale ${a}x + ${b}?`, a * x + b); },
  t3_2: () => { const x = randInt(2, 12), a = randInt(2, 9), b = randInt(1, 20), c = a * x + b; return tTexto(`Resolva: ${a}x + ${b} = ${c}. Qual o valor de x?`, x); },
  t3_3: () => { const a = randInt(2, 6), b = randInt(1, 15), lim = randInt(5, 30); const c = a * lim + b + randInt(1, a);
    return tTexto(`Qual o menor número inteiro que satisfaz ${a}x + ${b} > ${c}? `, Math.floor((c - b) / a) + 1);
  },
  t3_4: () => { const r1 = randInt(1, 6), r2 = randInt(1, 6), b = -(r1 + r2), c = r1 * r2; return tTexto(`Uma das raízes de x² ${b >= 0 ? "+" : "-"} ${Math.abs(b)}x + ${c} = 0 é:`, r1); },
  t3_5: () => { const x = randInt(2, 10) * 2, d = randChoice([2, 4]), b = randInt(1, 10); return tTexto(`Resolva: x/${d} + ${b} = ${x / d + b}. Qual o valor de x?`, x); },
  t3_6: () => { const x = randInt(1, 8), y = randInt(1, 8); const s = x + y, dif = x - y;
    return tTexto(`Num sistema, x + y = ${s} e x - y = ${dif}. Qual o valor de x?`, x);
  },
  t3_7: () => randChoice([
    () => tTexto("Quanto vale i² (unidade imaginária)?", "-1"),
    () => { const a = randInt(1, 6), b = randInt(1, 6), c = randInt(1, 6), d = randInt(1, 6); return tTexto(`Some os números complexos: (${a} + ${b}i) + (${c} + ${d}i). Qual a parte real do resultado?`, a + c); },
  ])(),

  /* ---------- Módulo 4 ---------- */
  t4_1: () => { const a = randInt(2, 6), b = randInt(1, 10), x = randInt(1, 8); return tTexto(`Se f(x) = ${a}x + ${b}, qual o valor de f(${x})?`, a * x + b); },
  t4_2: () => { const a = randInt(2, 6), b = randInt(1, 12); return tTexto(`Na função f(x) = ${a}x - ${b}, para qual valor de x temos f(x) = 0?`, b / a); },
  t4_3: () => { const r1 = randInt(1, 5), r2 = randInt(1, 5), b = -(r1 + r2), c = r1 * r2; return tTexto(`Na função f(x) = x² ${b >= 0 ? "+" : "-"} ${Math.abs(b)}x + ${c}, uma das raízes (onde f(x)=0) é:`, r1); },
  t4_4: () => { const base = randChoice([2, 3]), exp = randInt(2, 4); return tTexto(`Resolva: ${base}^x = ${Math.pow(base, exp)}. Qual o valor de x?`, exp); },
  t4_5: () => { const base = randChoice([2, 3]), exp = randInt(2, 4); return tTexto(`Quanto é log₍${base}₎(${Math.pow(base, exp)})?`, exp); },
  t4_6: () => randChoice([
    () => { const a1 = randInt(1, 10), r = randInt(2, 6), n = randInt(4, 10); return tTexto(`Numa PA com primeiro termo ${a1} e razão ${r}, qual é o ${n}º termo? (an = a1 + (n-1)×r)`, a1 + (n - 1) * r); },
    () => { const a1 = randInt(1, 5), q = randInt(2, 3), n = randInt(3, 5); return tTexto(`Numa PG com primeiro termo ${a1} e razão ${q}, qual é o ${n}º termo? (an = a1 × q^(n-1))`, a1 * Math.pow(q, n - 1)); },
  ])(),
  t4_7: () => randChoice([
    () => { const n = randInt(3, 5); const fat = (k) => (k <= 1 ? 1 : k * fat(k - 1)); return tTexto(`De quantas formas diferentes ${n} guardas podem ser posicionados em ${n} pontos de ronda distintos? (permutação)`, fat(n)); },
    () => { const n = randInt(2, 4); return tTexto(`Uma base tem ${n} viaturas e 2 turnos possíveis para cada uma. Quantas combinações de viatura+turno existem?`, n * 2); },
  ])(),
  t4_8: () => randChoice([
    () => tTexto("Qual a probabilidade de tirar um número par em um dado de 6 faces? (escreva como fração a/b)", "1/2"),
    () => tTexto("Numa urna com 4 bolas vermelhas e 4 azuis, qual a probabilidade de tirar uma bola vermelha? (fração a/b)", "1/2"),
    () => tTexto("Ao lançar uma moeda, qual a probabilidade de dar cara? (fração a/b)", "1/2"),
  ])(),
  t4_9: () => { const vals = Array.from({ length: 4 }, () => randInt(2, 10)); const soma = vals.reduce((a, b) => a + b, 0);
    return tTexto(`Qual a média dos números: ${vals.join(", ")}?`, (soma / vals.length).toFixed(1));
  },

  /* ---------- Módulo 5 ---------- */
  t5_1: () => randChoice([
    () => { const b = randInt(3, 12), h = randInt(2, 10); return tTexto(`Qual a área de um retângulo com base ${b} e altura ${h}?`, b * h); },
    () => { const b = randInt(3, 12), h = randInt(2, 10); return tTexto(`Qual a área de um triângulo com base ${b} e altura ${h}? (área = base×altura/2)`, (b * h) / 2); },
    () => tTexto("Qual a soma dos ângulos internos de qualquer triângulo?", "180"),
  ])(),
  t5_2: () => randChoice([
    () => { const a = randInt(2, 8); return tTexto(`Qual o volume de um cubo com aresta ${a}?`, a * a * a); },
    () => { const a = randInt(2, 8), b = randInt(2, 8), c = randInt(2, 8); return tTexto(`Qual o volume de um paralelepípedo de dimensões ${a} × ${b} × ${c}?`, a * b * c); },
  ])(),
  t5_3: () => { const [dx, dy, dist] = randChoice([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17]]);
    const x1 = randInt(0, 5), y1 = randInt(0, 5);
    return tTexto(`Qual a distância entre os pontos (${x1}, ${y1}) e (${x1 + dx}, ${y1 + dy})?`, dist);
  },
  t5_4: () => { const k = randInt(2, 5), a = randInt(2, 6), b = randInt(2, 6); return tTexto(`Pelo Teorema de Tales, se ${a}/${b} = x/${b * k}, qual o valor de x?`, a * k); },
  t5_5: () => { const [c1, c2, hip] = randChoice([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]]);
    return randChoice([
      () => tTexto(`Num triângulo retângulo, os catetos medem ${c1} e ${c2}. Qual a medida da hipotenusa?`, hip),
      () => tTexto(`Num triângulo retângulo, a hipotenusa mede ${hip} e um dos catetos mede ${c1}. Qual a medida do outro cateto?`, c2),
    ])();
  },
  t5_6: () => tMcq("Num triângulo retângulo, qual razão trigonométrica é cateto oposto sobre hipotenusa?", "Seno", ["Cosseno", "Tangente", "Secante", "Cotangente"]),
  t5_7: () => randChoice([
    () => tMcq("Quanto vale sen(30°)?", "1/2", ["√2/2", "√3/2", "1", "0"]),
    () => tMcq("Quanto vale cos(60°)?", "1/2", ["√2/2", "√3/2", "0", "1"]),
    () => tMcq("Quanto vale sen(90°)?", "1", ["0", "1/2", "√2/2", "√3/2"]),
    () => tMcq("Quanto vale tan(45°)?", "1", ["0", "1/2", "√3", "√3/3"]),
  ])(),

  /* ---------- Módulo 6 — Raciocínio Lógico ---------- */
  t6_1: () => randChoice([
    () => { const start = randInt(2, 9), step = randInt(2, 6); const seq = [start, start + step, start + 2 * step, start + 3 * step]; return tTexto(`Qual o próximo número: ${seq.join(", ")}, ...?`, start + 4 * step); },
    () => { const start = randInt(1, 4), razao = 2; const seq = [start, start * razao, start * razao ** 2, start * razao ** 3]; return tTexto(`Qual o próximo número: ${seq.join(", ")}, ...? (cada termo dobra)`, start * razao ** 4); },
    () => { const letras = "ABCDEFGHIJ"; const startIdx = randInt(0, 3), step = randInt(1, 2); const seq = [0, 1, 2, 3].map(i => letras[startIdx + i * step]); return tTexto(`Qual a próxima letra: ${seq.join(", ")}, ...?`, letras[startIdx + 4 * step]); },
  ])(),
  t6_2: () => randChoice([
    () => { const diaIdx = randInt(0, 6), n = randInt(3, 20); return tTexto(`Se hoje é ${DIAS_SEMANA[diaIdx]}, que dia da semana será daqui a ${n} dias?`, DIAS_SEMANA[(diaIdx + n) % 7]); },
    () => { const a = randInt(4, 10), b = randInt(1, a - 1); return tTexto(`Você anda ${a} passos para frente e depois ${b} passos para trás. A quantos passos do início você está?`, a - b); },
  ])(),
  t6_3: () => { const pools = [
      { itens: ["Cachorro", "Gato", "Cavalo", "Vaca", "Cadeira"], odd: "Cadeira" },
      { itens: ["Maçã", "Banana", "Laranja", "Uva", "Sapato"], odd: "Sapato" },
      { itens: ["Círculo", "Quadrado", "Triângulo", "Retângulo", "Sorriso"], odd: "Sorriso" },
      { itens: ["Segunda", "Terça", "Quarta", "Sexta", "Março"], odd: "Março" },
    ]; const p = randChoice(pools); return tMcq(`Qual desses elementos não pertence ao grupo? ${p.itens.join(", ")}`, p.odd, p.itens.filter(i => i !== p.odd));
  },
  t6_4: () => { const pool = [
      { q: "Um dado tem faces opostas somando 7. Se uma face mostra 3, qual é a face oposta?", certa: "4", d: ["5", "2", "6", "1"] },
      { q: "Um dado comum (1 a 6) tem quantos pontos no total somando todas as faces?", certa: "21", d: ["20", "18", "24", "15"] },
      { q: 'Com 2 palitos de fósforo formando um "X", quantos triângulos você enxerga?', certa: "0", d: ["1", "2", "4", "3"] },
    ]; const p = randChoice(pool); return tMcq(p.q, p.certa, p.d);
  },
  t6_5: () => { const triplas = [["cães", "mamíferos", "animais"], ["servidores", "trabalhadores", "pessoas"], ["rosas", "flores", "plantas"], ["quadrados", "retângulos", "polígonos"]];
    const [A, B, C] = randChoice(triplas);
    return tMcq(`Todo ${A} é ${B}. Todo ${B} é ${C}. Logo, pode-se concluir que:`, `Todo ${A} é ${C}`, [`Nenhum ${A} é ${C}`, `Nenhum ${B} é ${A}`, `Alguns ${C} não são ${B}`, `Não é possível concluir nada`]);
  },
  t6_6: () => { const nomes = shuffle(["Ana", "Bruno", "Carla", "Diego", "Elis"]);
    return tMcq(`${nomes[0]} é mais alto que ${nomes[1]}, e ${nomes[1]} é mais alto que ${nomes[2]}. Quem é o mais alto?`, nomes[0], [nomes[1], nomes[2], nomes[3], nomes[4]]);
  },
  t6_7: () => randChoice([
    () => { const nomes = shuffle(["Ana", "Bruno", "Carla", "Diego", "Elis"]); return tMcq(`${nomes[0]} está posicionado à esquerda de ${nomes[1]}, e ${nomes[1]} está à esquerda de ${nomes[2]}. Quem está mais à esquerda?`, nomes[0], [nomes[1], nomes[2], nomes[3], nomes[4]]); },
    () => {
      const [p1, p2, p3] = shuffle(["Ana", "Bruno", "Carla", "Diego"]).slice(0, 3);
      const enunciado = `As viaturas de ${p1}, ${p2} e ${p3} são, não necessariamente nesta ordem, uma moto, um carro e uma van. Uma delas é branca, outra é preta e outra é cinza. A viatura de ${p1} é branca; a viatura de ${p3} é a van; a viatura de ${p2} não é a van e não é a moto. Qual viatura é preta?`;
      return tMcq(enunciado, `A viatura de ${p2} (o carro)`, [`A viatura de ${p1} (a moto)`, `A viatura de ${p3} (a van)`, `Nenhuma das viaturas é preta`]);
    },
  ])(),
  t6_8: () => {
    const escolha = randInt(0, 2);
    if (escolha === 0) return GERADORES.t6_1();
    if (escolha === 1) { const a = randInt(10, 40), b = randInt(2, 9); return tTexto(`Uma viatura fez ${a} atendimentos na semana, sendo que ${b} foram encaminhados a outro órgão. Quantos atendimentos foram resolvidos diretamente?`, a - b); }
    return tMcq("Se todo guarda municipal usa farda e Marcos usa farda, o que podemos concluir com certeza?", "Não é possível concluir que Marcos é guarda municipal (a farda sozinha não garante)", ["Marcos é guarda municipal", "Marcos não é guarda municipal", "Marcos trabalha na prefeitura", "Marcos é policial"]);
  },
};

const GERADORES_ADAPTATIVOS = {
  t3_2: (dificuldade) => {
    if (dificuldade === "facil") {
      const x = randInt(2, 6), a = randInt(2, 5), b = randInt(1, 10), c = a * x + b;
      return tTexto(`Resolva: ${a}x + ${b} = ${c}. Qual o valor de x?`, x);
    }
    if (dificuldade === "dificil") {
      const x = randInt(2, 10), a = randInt(5, 9), d = randInt(1, a - 1), b = randInt(1, 15);
      const e = (a - d) * x + b;
      return tTexto(`Resolva: ${a}x + ${b} = ${d}x + ${e}. Qual o valor de x?`, x);
    }
    const x = randInt(2, 12), a = randInt(2, 9), b = randInt(1, 20), c = a * x + b;
    return tTexto(`Resolva: ${a}x + ${b} = ${c}. Qual o valor de x?`, x);
  },
};

const METODOS = {
  t1_1: "Sinais diferentes: subtraia o menor do maior e use o sinal do número com maior valor absoluto.",
  t1_2: "Cada posição do número (unidade, dezena, centena...) vale 10 vezes a posição à direita dela.",
  t1_3: "Resolva multiplicação e divisão antes de soma e subtração (ordem das operações).",
  t1_4: "Divida numerador e denominador pelo maior divisor comum entre eles até não dar mais pra simplificar.",
  t1_5: "Potência: multiplique o número por ele mesmo o número de vezes do expoente. Raiz: ache o número que, multiplicado por si mesmo, dá o valor de dentro.",
  t1_6: "MMC: liste múltiplos dos dois números e pegue o menor em comum. MDC: liste divisores e pegue o maior em comum.",
  t1_7: "Racional é toda fração ou decimal exato/periódico; irracional não pode ser escrito como fração exata (ex: raízes não exatas, π).",
  t1_8: "Frações com o mesmo denominador: some ou subtraia só os numeradores e mantenha o denominador.",
  t1_9: "Alinhe a vírgula antes de somar ou subtrair números decimais.",
  t1_10: "Leia o problema em partes: identifique o que já existe e o que muda (ganha/perde), na ordem em que acontece.",
  t2_1: "Escala de unidades: km>hm>dam>m>dm>cm>mm — cada degrau multiplica ou divide por 10.",
  t2_2: "1 hora = 60 minutos, 1 minuto = 60 segundos — converta tudo pra mesma unidade antes de somar.",
  t2_3: "Razão a:b significa que os valores crescem na mesma proporção — monte uma fração e multiplique em cruz.",
  t2_4: "Direta: quando um aumenta, o outro aumenta junto. Inversa: quando um aumenta, o outro diminui (multiplique em vez de dividir).",
  t2_5: "Regra de três: monte as duas grandezas em colunas, multiplique em cruz e isole o valor desconhecido.",
  t2_6: "Observe o padrão entre os valores — normalmente é uma multiplicação simples do x pra achar o y.",
  t2_7: "Porcentagem: multiplique o valor pela porcentagem e divida por 100.",
  t2_8: "Juros simples: J = Capital × taxa × tempo (taxa em % dividida por 100).",
  t2_9: "Some os valores das notas/moedas e subtraia do total pago pra achar o troco.",
  t3_1: "Substitua o valor de x na expressão e resolva seguindo a ordem das operações.",
  t3_2: "Isole o x: passe os números pro outro lado invertendo a operação (quem soma, subtrai; quem multiplica, divide).",
  t3_3: "Resolva como equação normal — só inverta o sinal da desigualdade se multiplicar ou dividir por número negativo.",
  t3_4: "Fatore a equação: procure dois números que somados dão -b e multiplicados dão c (ou use Bhaskara).",
  t3_5: "Elimine o denominador multiplicando os dois lados pelo mesmo número antes de isolar o x.",
  t3_6: "Some ou subtraia as duas equações pra eliminar uma variável e descobrir a outra primeiro.",
  t3_7: "i² = -1. Some as partes reais entre si e as partes imaginárias entre si.",
  t4_1: "Domínio é o que pode entrar (x); imagem é o que sai (y) depois de aplicar a função.",
  t4_2: "Substitua o x na fórmula pra achar f(x); pra achar a raiz, iguale f(x) a zero.",
  t4_3: "Pra achar as raízes de uma função do 2º grau, iguale a expressão a zero e resolva como equação.",
  t4_4: "Reescreva os dois lados como potências da mesma base e compare os expoentes.",
  t4_5: "log_b(x) = y significa: b elevado a y é igual a x.",
  t4_6: "PA: some a razão a cada termo. PG: multiplique pela razão a cada termo.",
  t4_7: "Permutação: multiplique todos os números de 1 até a quantidade de itens (fatorial).",
  t4_8: "Probabilidade = casos favoráveis dividido pelo total de casos possíveis.",
  t4_9: "Média: some todos os valores e divida pela quantidade de valores.",
  t5_1: "Área do retângulo = base × altura. Área do triângulo = (base × altura) ÷ 2.",
  t5_2: "Volume do cubo = aresta³. Volume do paralelepípedo = comprimento × largura × altura.",
  t5_3: "Distância entre dois pontos: use Pitágoras com as diferenças de x e de y como catetos.",
  t5_4: "Tales: lados correspondentes de retas paralelas são proporcionais — monte uma fração igual a outra.",
  t5_5: "a² + b² = c², onde c é sempre a hipotenusa (o lado oposto ao ângulo reto).",
  t5_6: "Seno = oposto/hipotenusa, Cosseno = adjacente/hipotenusa, Tangente = oposto/adjacente.",
  t5_7: "Decore os valores notáveis: 30°, 45° e 60° têm senos e cossenos fixos que caem direto na prova.",
  t6_1: "Compare cada termo com o anterior: some, multiplique ou observe letras/posições até achar o padrão que se repete.",
  t6_2: "Organize a informação na ordem em que ela acontece (dias, passos, posições) antes de calcular o resultado final.",
  t6_3: "Procure a categoria comum entre a maioria dos itens — quem não pertence a essa categoria é o intruso.",
  t6_4: "Leia com calma e visualize o objeto (dado, palito) mentalmente antes de responder — é interpretação, não fórmula.",
  t6_5: "Em silogismos: se A está contido em B, e B está contido em C, então A está contido em C.",
  t6_6: "Monte uma ordem (ex: dos nomes) com base nas comparações — vá encaixando cada informação na fila.",
  t6_7: "Anote as certezas primeiro (o que já sabemos) e use-as pra eliminar as opções impossíveis uma a uma.",
  t6_8: "Identifique se a questão pede cálculo, sequência ou dedução — e aplique o método daquele tipo específico.",
};

export const ProceduralStrategy = {
  getQuestion(topicoId, dificuldade = null) {
    if (dificuldade && GERADORES_ADAPTATIVOS[topicoId]) {
      const q = GERADORES_ADAPTATIVOS[topicoId](dificuldade);
      q.explicacao = METODOS[topicoId] || null;
      return q;
    }
    const gerador = GERADORES[topicoId];
    if (gerador) {
      const q = gerador();
      q.explicacao = METODOS[topicoId] || null;
      return q;
    }
    
    // fallback
    const a = randInt(3, 9), b = randInt(3, 9);
    const q = tTexto(`Quanto é ${a} + ${b}?`, a + b);
    q.explicacao = "Operação de soma.";
    return q;
  },
  
  getMetodo(topicoId) {
    return METODOS[topicoId] || null;
  }
};


/**
 * Strategy de Geração Baseada em Conteúdo (Material Livre/IA)
 */
export const ContentGeneratorStrategy = {
  async generatePackage(materiaTexto, quantidade = 6) {
    const prompt = `Você é um elaborador de materiais de estudo para concursos públicos.
Com base SOMENTE no conteúdo de estudo abaixo, elabore um pacote completo.

O retorno deve ser APENAS um JSON válido, sem markdown, sem bloco de código, sem texto antes ou depois. Use EXATAMENTE este formato:
{"titulo":"Nome curto do material (máx 4 palavras)","resumo":["Ponto principal 1", "Ponto principal 2", "Ponto principal 3"],"flashcards":[{"frente":"Pergunta direta do flashcard","verso":"Resposta curta e direta"}],"questoes":[{"tipo":"texto ou mcq","pergunta":"enunciado","resposta":"(obrigatório se tipo for texto)","opcoes":["(obrigatório se tipo for mcq)"],"indiceCorreto":0,"explicacao":"explicação de por que está correto"}]}

- "resumo": crie 4 a 6 bullet points consolidando o conhecimento do texto.
- "flashcards": crie pelo menos 4 cartas (frente: pergunta, verso: resposta/conceito).
- "questoes": crie ${quantidade} questões (pode ser "texto" ou "mcq"). Para mcq forneça 5 alternativas.

Conteúdo de estudo:
"""
${materiaTexto}
"""`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": "SEU_API_KEY", "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }],
      }),
    }).catch(err => {
      console.warn("API request failed, using fallback data.");
      return { ok: false };
    });

    if (!response.ok) {
      await new Promise(r => setTimeout(r, 1500));
      return {
        titulo: "Material Gerado (Demo)",
        resumo: ["Resumo automático 1", "Resumo automático 2"],
        flashcards: [{ frente: "Q1?", verso: "R1" }],
        pool: Array(quantidade).fill(0).map((_, i) => ({
          tipo: "mcq",
          question: `Questão gerada ${i+1} (fallback).`,
          options: ["A", "B", "C", "D", "E"],
          correctIndex: 0,
          explicacao: "Explicação padrão da IA."
        }))
      };
    }

    const data = await response.json();
    const textoResposta = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
    const limpo = textoResposta.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(limpo);

    const pool = (parsed.questoes || []).map(q => {
      if (q.tipo === "mcq" && Array.isArray(q.opcoes) && q.opcoes.length >= 2) {
        return { tipo: "mcq", question: q.pergunta, options: q.opcoes, correctIndex: q.indiceCorreto || 0, explicacao: q.explicacao || "" };
      }
      return { tipo: "texto", question: q.pergunta, resposta: String(q.resposta ?? ""), explicacao: q.explicacao || "" };
    }).filter(q => q.question);

    return { 
      titulo: parsed.titulo || "Material Livre", 
      resumo: parsed.resumo || [], 
      flashcards: parsed.flashcards || [], 
      pool 
    };
  }
};

export const MentorTelemetryAdapter = {
  dispatch(topicoId, result) {
    // Despacha evento de janela que o Mentor Global irá escutar
    if (typeof window !== "undefined") {
      const event = new CustomEvent("mentor-telemetry", { detail: { topicoId, result } });
      window.dispatchEvent(event);
    }
    console.log("[MentorTelemetry] Enviado para o Mentor:", { topicoId, result });
  }
};

/**
 * UniversalEngineController
 * Orquestra as requisições de questões e centraliza a telemetria com o Mentor.
 */
export const UniversalEngineController = {
  getQuestion(topico, dificuldade = null) {
    if (topico.custom && topico.pool && topico.pool.length > 0) {
      return topico.pool[randInt(0, topico.pool.length - 1)];
    }
    return ProceduralStrategy.getQuestion(topico.id, dificuldade);
  },

  submitAnswer(topicoId, exercicio, valorUsuario, indiceUsuario) {
    const result = DiagnosticModule.analyze(exercicio, valorUsuario, indiceUsuario);
    if (topicoId) {
      MentorTelemetryAdapter.dispatch(topicoId, result);
    }
    return result;
  },
  
  async generateTopicContent(materiaTexto, quantidade) {
     return await ContentGeneratorStrategy.generatePackage(materiaTexto, quantidade);
  }
};

// Funções legadas mapeadas para o Controller para não quebrar compatibilidade imediata
export function validar(exercicio, valorUsuario, indiceUsuario, topicoId = null) {
  // Retorna o objeto completo { acertou, diagnostico, timestamp }
  return UniversalEngineController.submitAnswer(topicoId, exercicio, valorUsuario, indiceUsuario);
}

export function gerarExercicioPara(topico, dificuldade) {
  return UniversalEngineController.getQuestion(topico, dificuldade);
}

export function metodoDoTopico(topico, exercicio) {
  return (exercicio && exercicio.explicacao) || ProceduralStrategy.getMetodo(topico.id) || null;
}

export async function gerarExerciciosDaIA(materiaTexto, quantidade = 6) {
  return await UniversalEngineController.generateTopicContent(materiaTexto, quantidade);
}
