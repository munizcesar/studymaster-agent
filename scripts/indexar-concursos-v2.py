#!/usr/bin/env python3
"""
StudyMaster - Indexador Concursos v2
Adiciona filtros extras de concursos para Direito Processual Penal, Tributário, Civil, Trabalhista, Legislação Específica e Atualidades.

Matérias originais:
  - Português (concursos_portugues)
  - Direito Constitucional (concursos_direito_constitucional)
  - Direito Administrativo (concursos_direito_administrativo)
  - Raciocínio Lógico (concursos_rlm)
  - Informática (concursos_informatica)
  - Administração Pública (concursos_adm_publica)

Novas matérias extras:
  - Direito Processual Penal (concursos_direito_processual_penal)
  - Direito Tributário (concursos_direito_tributario)
  - Direito Civil (concursos_direito_civil)
  - Direito Trabalhista (concursos_direito_trabalhista)
  - Legislação Específica (concursos_legislacao_especifica)
  - Atualidades (concursos_atualidades)
"""

import argparse
import os
import json
import time
import hashlib
import requests

ACCOUNT_ID = os.environ.get("CLOUDFLARE_ACCOUNT_ID", "")
API_TOKEN  = os.environ.get("CLOUDFLARE_API_TOKEN", "")
INDEX_NAME = "studymaster-knowledge"


def parse_args():
    parser = argparse.ArgumentParser(
        description="Indexar conteúdos de Concursos para Cloudflare Vectorize"
    )
    parser.add_argument(
        "--account-id",
        help="Cloudflare Account ID (ou use CLOUDFLARE_ACCOUNT_ID)"
    )
    parser.add_argument(
        "--api-token",
        help="Cloudflare API Token (ou use CLOUDFLARE_API_TOKEN)"
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=20,
        help="Número de documentos enviados por lote"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Grava os documentos localmente em vez de enviar ao Vectorize"
    )
    parser.add_argument(
        "--output",
        default="data/concursos-dry-run.json",
        help="Arquivo de saída para dry run"
    )
    return parser.parse_args()


def configure_credentials(args):
    global ACCOUNT_ID, API_TOKEN
    ACCOUNT_ID = args.account_id or ACCOUNT_ID
    API_TOKEN = args.api_token or API_TOKEN
    return ACCOUNT_ID, API_TOKEN

DOCUMENTOS = [

  # ══════════════════════════════════════════════════════
  # MATÉRIA 1: PORTUGUÊS (namespace: concursos_portugues)
  # ══════════════════════════════════════════════════════

  # Gramática (20 docs)
  {"id":"con-por-01","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Concordância Verbal: O verbo concorda em número e pessoa com o sujeito. Sujeito composto antes do verbo: verbo no plural (João e Maria chegaram). Sujeito composto após o verbo: pode concordar com o mais próximo (Chegou João e Maria). Verbos impessoais (haver, fazer, ser indicando tempo) ficam no singular: Faz dois anos; Havia muitas pessoas. Sujeito coletivo: verbo no singular (O povo decidiu). Sujeito posposto: pode singular ou plural com o 1º núcleo. Pronome relativo 'que': verbo concorda com o antecedente. Pronome relativo 'quem': verbo na 3ª pessoa do singular."},

  {"id":"con-por-02","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Concordância Nominal: O adjetivo concorda em gênero e número com o substantivo. Adjetivo após vários substantivos do mesmo gênero: plural do gênero comum (livro e caderno velhos). Adjetivos de gêneros diferentes: masculino plural (homem e mulher bonitos). Adjetivo antes dos substantivos: concorda com o mais próximo (linda casa e jardim). Palavras invariáveis como adjetivos: bastante (variável — bastantes pessoas), meio (invariável como advérbio — meio cansada; variável como adjetivo — meia hora), menos (sempre invariável), mesmo (variável — eles mesmos), próprio (variável — elas próprias), alerta (invariável — estavam alerta)."},

  {"id":"con-por-03","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Regência Verbal: Verbos transitivos diretos (VTD) não exigem preposição; transitivos indiretos (VTI) exigem preposição. Aspirar (almejar) — a: aspira ao cargo. Assistir (ver) — a: assistiu ao filme. Assistir (ajudar) — direto: assistiu o paciente. Visar (almejar) — a: visa ao sucesso. Visar (assinar) — direto: visou o documento. Obedecer/desobedecer — a: obedeceu às normas. Preferir — direto sem 'do que': prefere café a chá (ERRADO: prefere café do que chá). Pagar/perdoar pessoa — indireto: pagou ao funcionário; perdoou ao filho. Pagar/perdoar coisa — direto: pagou a conta; perdoou o erro."},

  {"id":"con-por-04","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Regência Nominal: Substantivos e adjetivos que exigem preposição específica. Acessível a, ávido de, bacharel em, capaz de, compatível com, desejoso de, dúvida sobre/em, entendido em, favorável a, hábil em, imune a/de, incompatível com, insensível a, necessário a, preferível a, propenso a, respeito a/de/por, responsável por, saudoso de, versado em. Exemplo: O candidato é hábil em redação e acessível a críticas. A norma é compatível com o edital. O servidor é responsável pelos atos praticados."},

  {"id":"con-por-05","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Crase: Fusão de preposição 'a' com artigo definido feminino 'a/as'. Ocorre antes de palavras femininas que admitem artigo: fui à cidade (a + a cidade). PROIBIDA antes de: palavras masculinas (falei a Pedro); verbos (começou a falar); pronomes pessoais (disse a ela); pronomes demonstrativos esta/essa/aquela sem substantivo; palavras no plural sem artigo (a casas). FACULTATIVA antes de: nomes próprios femininos (fui a/à Maria); pronome possessivo feminino (a minha/à minha casa); após preposição (de a/da porta). Locuções femininas sempre com crase: às vezes, à medida que, à toa, à vontade, às pressas."},

  {"id":"con-por-06","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Pronomes Relativos: QUE — substitui pessoa ou coisa, mais versátil (o livro que li; a pessoa que veio). QUEM — substitui apenas pessoa, sempre com preposição quando objeto indireto (a pessoa a quem me refiro; o colega de quem gosto). CUJO/CUJA — indica posse, não admite artigo depois (o autor cujo livro foi premiado — ERRADO: cujo o livro). ONDE — indica lugar (a cidade onde nasci; somente para lugar concreto). O QUAL/A QUAL — usado após preposições longas ou para evitar ambiguidade (a causa pela qual luta; o evento no qual participou). Regência: o verbo da oração relativa determina a preposição do pronome relativo."},

  {"id":"con-por-07","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Pontuação: VÍRGULA: isola vocativo (João, venha); isola aposto explicativo (O Brasil, maior país da América do Sul, ...); isola adjunto adverbial deslocado (No dia seguinte, partiram); separa orações coordenadas (exceto as aditivas com sujeito igual); isola orações adjetivas explicativas; NUNCA separa sujeito do predicado nem verbo do objeto. PONTO E VÍRGULA: separa itens de enumeração complexa; separa orações coordenadas longas. DOIS PONTOS: introduz enumeração, citação, explicação, discurso direto. TRAVESSÃO: indica mudança de interlocutor no diálogo; isola aposto ou adjunto enfático."},

  {"id":"con-por-08","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Colocação Pronominal: PRÓCLISE (antes do verbo): obrigatória com palavras atrativas: advérbios (não, nunca, sempre, já, ainda, talvez), conjunções subordinativas, pronomes indefinidos e relativos, orações exclamativas e optativas. ÊNCLISE (após o verbo): regra geral com verbos no infinitivo, imperativo afirmativo, gerúndio sem 'em'. Início de oração: não se usa próclise com pronome oblíquo — usa-se ênclise (Disse-me a verdade, não: Me disse a verdade). MESÓCLISE (meio do verbo): verbos no futuro do presente ou do pretérito quando não há palavra atrativa (Dir-te-ei; Far-me-ias). Locução verbal: próclise antes do auxiliar ou ênclise/próclise no verbo principal."},

  {"id":"con-por-09","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Vozes Verbais: VOZ ATIVA: sujeito pratica a ação (O juiz assinou o despacho). VOZ PASSIVA ANALÍTICA: sujeito recebe a ação; formada por verbo ser/estar/ficar + particípio do verbo principal, concordando com o sujeito paciente (O despacho foi assinado pelo juiz — agente da passiva introduzido por 'por'). VOZ PASSIVA SINTÉTICA (pronominal): verbo na 3ª pessoa + pronome 'se' (partícula apassivadora) — sujeito paciente concorda com o verbo (Assinaram-se os despachos; Assinou-se o despacho). Transformação ativa→passiva: objeto direto vira sujeito; sujeito ativo vira agente da passiva; verbo recebe auxiliar 'ser' no mesmo tempo."},

  {"id":"con-por-10","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Modos e Tempos Verbais: INDICATIVO (certeza): presente, pretérito perfeito (ação concluída), imperfeito (ação habitual/contínua no passado), mais-que-perfeito (anterior a outra passada), futuro do presente, futuro do pretérito (condicional). SUBJUNTIVO (dúvida/hipótese/desejo): presente (Espero que venha), pretérito imperfeito (Se viesse), futuro (Quando vier). IMPERATIVO AFIRMATIVO: 2ª pessoa do indicativo sem 's' final (tu fala); demais do subjuntivo presente. IMPERATIVO NEGATIVO: todas do subjuntivo presente (não fales, não fale, não falemos). Correlações verbais importantes: se + imperfeito subjuntivo → futuro do pretérito (Se estudasse, passaria)."},

  {"id":"con-por-11","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Coordenação: Orações coordenadas são independentes sintaticamente. ASSINDÉTICAS: justapostas sem conjunção (Entrou, sentou, calou). SINDÉTICAS — tipos: ADITIVAS (e, nem, mas também, não só...mas também): adicionam ideia; ADVERSATIVAS (mas, porém, contudo, entretanto, todavia, no entanto): indicam oposição/contraste; ALTERNATIVAS (ou...ou, ora...ora, seja...seja, quer...quer): indicam alternância ou exclusão; CONCLUSIVAS (portanto, logo, pois posposto, por isso, assim, então): expressam conclusão — o 'pois' conclusivo vem após o verbo; EXPLICATIVAS (pois anteposto, porque, que, porquanto): explicam a oração anterior — 'pois' explicativo vem antes do verbo."},

  {"id":"con-por-12","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Subordinadas Substantivas: Exercem função de substantivo na oração principal. SUBJETIVA: é o sujeito (É necessário que você estude — 'que você estude' é o sujeito). OBJETIVA DIRETA: é o objeto direto sem preposição (Quero que você venha). OBJETIVA INDIRETA: é objeto indireto com preposição (Gosto de que você venha). COMPLETIVA NOMINAL: completa um nome com preposição (Tenho certeza de que acertei). PREDICATIVA: liga-se ao sujeito pelo verbo de ligação (A verdade é que ele mentiu). APOSITIVA: apõe-se a um termo (Só desejo isto: que você seja feliz). Podem ser introduzidas por: conjunções integrantes 'que' e 'se', pronomes e advérbios interrogativos."},

  {"id":"con-por-13","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Subordinadas Adjetivas: Exercem função de adjetivo, modificando um substantivo (antecedente). RESTRITIVA: restringe o sentido do antecedente, sem vírgula — identifica quais (Os candidatos que estudaram passaram). EXPLICATIVA: acrescenta característica acessória a antecedente já determinado, entre vírgulas — generaliza (Os candidatos, que estudaram muito, passaram). Diferença semântica: restritiva pressupõe que nem todos têm a característica; explicativa pressupõe que todos têm. Pronomes relativos usados: que (geral), quem (pessoas com preposição), cujo (posse), onde (lugar), o qual (após preposições longas). A supressão da vírgula muda o sentido."},

  {"id":"con-por-14","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Subordinadas Adverbiais: Exercem função de advérbio. CAUSAL (porque, visto que, já que, como anteposta): exprime causa (Como chegou tarde, perdeu a prova). CONDICIONAL (se, caso, contanto que, desde que): exprime condição (Se estudar, passará). CONCESSIVA (embora, ainda que, mesmo que, apesar de que): exprime concessão, oposição não impeditiva (Embora estudasse, não passou). TEMPORAL (quando, assim que, logo que, enquanto, depois que): exprime tempo. FINAL (para que, a fim de que): exprime finalidade. CONSECUTIVA (de modo que, tanto...que): exprime consequência. COMPARATIVA (como, assim como, mais...do que): exprime comparação. CONFORMATIVA (conforme, segundo, como): exprime conformidade. PROPORCIONAL (à medida que, ao passo que): exprime proporção."},

  {"id":"con-por-15","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Funções Sintáticas — Sujeito e Predicado: SUJEITO SIMPLES: um núcleo (O candidato chegou). COMPOSTO: dois ou mais núcleos (João e Maria chegaram). OCULTO/ELÍPTICO: identificado pela desinência verbal (Estudamos muito). INDETERMINADO: não identificado — verbo na 3ª plural sem sujeito expresso (Roubaram o carro) ou VTI/VL + 'se' (Precisa-se de funcionários). ORACIONAL: uma oração inteira (Que você estude é importante). SUJEITO INEXISTENTE: verbos impessoais (Há muitas pessoas; Faz calor). PREDICADO VERBAL: núcleo é verbo significativo (O aluno estudou). NOMINAL: verbo de ligação + predicativo do sujeito (O aluno é inteligente). VERBO-NOMINAL: dois núcleos, verbal e nominal simultâneos (O aluno chegou cansado)."},

  {"id":"con-por-16","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Complementos Verbais: OBJETO DIRETO (OD): complemento de VTD sem preposição (Comprei o livro). OBJETO INDIRETO (OI): complemento de VTI com preposição (Gostei do livro; Obedeceu à lei). OBJETO DIRETO PREPOSICIONADO: OD precedido de preposição por clareza/eufonia — verbos amar, querer, respeitar com pessoas (Amou muito a seus filhos). OBJETO PLEONÁSTICO: OD ou OI repetido por ênfase por pronome (O livro, eu o li ontem; A ela, não lhe direi nada). Distinção OD/OI: OD responde 'o quê?' ou 'quem?'; OI responde 'a quem?', 'de quem?', 'em quê?' com preposição. Pronomes átonos como objetos: me/te/se/nos/vos = OD ou OI; lhe/lhes = exclusivamente OI."},

  {"id":"con-por-17","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Adjuntos: ADJUNTO ADNOMINAL (AAdN): modifica um substantivo, concordando com ele; pode ser artigo, adjetivo, pronome adjetivo, numeral, locução adjetiva (o novo livro técnico; livros de direito). ADJUNTO ADVERBIAL (AAdV): modifica verbo, adjetivo ou advérbio; indica circunstância; invariável (Estudou muito; Chegou ontem; Trabalha em casa). Diferença AAdN × Complemento Nominal: ambos são introduzidos por preposição após nome, mas o CN completa o sentido do nome regente (necessidade de paz — de paz = CN); o AAdN apenas caracteriza (homem de bem — de bem = AAdN). Teste: CN pode ser substituído por pronome oblíquo; AAdN não."},

  {"id":"con-por-18","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Aposto e Vocativo: APOSTO: termo que explica, resume, especifica ou amplia outro termo da oração. Tipos: EXPLICATIVO — entre vírgulas/parênteses/travessões (O Brasil, maior país da América Latina, ...). ENUMERATIVO — detalha um termo anterior (Comprei dois itens: caneta e lápis). RESUMITIVO — resume enumeração anterior, introduzido por pronome indefinido (Paciência, dedicação, esforço — tudo isso é necessário). ORACIONAL — é uma oração (Só peço uma coisa: que você estude). ESPECIFICATIVO — sem pontuação, restringe o sentido (O rio Amazonas; A cidade de Manaus). VOCATIVO: termo independente que chama ou interpela o interlocutor; sempre isolado por vírgula(s); não é sujeito nem objeto (João, venha aqui! Venha, meu filho!)."},

  {"id":"con-por-19","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Figuras de Linguagem: METÁFORA: comparação implícita sem conectivo (Ele é uma rocha — coragem). METONÍMIA: substituição por relação de contiguidade (Li Machado — autor pela obra; beber um copo — continente pelo conteúdo). ANTÍTESE: oposição de ideias (Amor é fogo que arde sem se ver). PARADOXO: contradição aparente (É ferida que dói e não se sente). HIPÉRBOLE: exagero expressivo (Chorei um rio de lágrimas). EUFEMISMO: suavização (Ele passou dessa para melhor — morreu). IRONIA: sentido oposto ao literal (Que estudante dedicado — do aluno que não estuda). CATACRESE: metáfora desgastada pelo uso (pé da mesa; asa da xícara). SINESTESIA: mistura de sentidos (voz macia; cor gritante). PERSONIFICAÇÃO/PROSOPOPEIA: atribui qualidades humanas a seres inanimados (O vento sussurrou). ELIPSE: omissão de termo subentendido (Na sala, silêncio — verbo omitido). ZEUGMA: elipse de termo já mencionado (Ele foi ao mercado; ela, à farmácia). PLEONASMO LITERÁRIO: redundância expressiva (Subir para cima — pleonasmo vicioso; ver com os próprios olhos — literário). ANÁFORA: repetição de termo(s) no início de frases."},

  {"id":"con-por-20","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Denotação e Conotação: DENOTAÇÃO (sentido denotativo/literal/próprio/dicionarizado): palavra empregada em seu sentido original, objetivo e preciso, sem carga emocional ou subjetiva (A raposa é um animal astuto — raposa = animal). Linguagem técnica, científica e jornalística tendem à denotação. CONOTAÇÃO (sentido conotativo/figurado/metafórico): palavra usada com sentido diferente do original, carregada de subjetividade, emoção ou intenção estilística (Ele é uma raposa — astuto como a raposa). Poesia, publicidade e literatura exploram conotação. Mesma palavra pode ter ambos os sentidos conforme contexto. Em provas de concurso: identificar o sentido em que a palavra está empregada no texto é fundamental para interpretar corretamente."},

  # Interpretação Textual (10 docs)
  {"id":"con-por-21","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Tipos e Gêneros Textuais: TIPOS (sequências prototípicas): NARRAÇÃO (narrador, personagens, enredo, tempo, espaço — verbos de ação no passado); DESCRIÇÃO (retrato estático de seres/cenas — adjetivos, verbos de estado); DISSERTAÇÃO/ARGUMENTAÇÃO (tese, argumentos, conclusão — conectivos lógicos); EXPOSIÇÃO (informação objetiva sem opinião); INJUNÇÃO/INSTRUCIONAL (instruções, ordem — imperativo). GÊNEROS (realizações concretas): conto (narrativo breve), crônica (cotidiano em tom lírico-humorístico), editorial (opinativo do veículo), artigo de opinião (ponto de vista assinado), reportagem (informativo com apuração), notícia (fato atual, objetiva), carta argumentativa, dissertação escolar, bula de remédio (injuntivo). Um texto pode combinar vários tipos."},

  {"id":"con-por-22","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Coesão Textual: Propriedade que garante a ligação entre os elementos do texto. COESÃO REFERENCIAL: relação entre elementos linguísticos que remetem ao mesmo referente. Tipos: ANÁFORA (retoma algo já dito — pronomes, sinônimos, hiperônimos: O presidente discursou. Ele...); CATÁFORA (antecipa algo a ser dito: Digo isso: que virá). Mecanismos: pronomes pessoais, demonstrativos, relativos; sinônimos; hiperônimos (poodle → cão); nominalizações; elipse. COESÃO SEQUENCIAL: articulação entre partes do texto por conectivos e operadores. Tipos: TEMPORAL (então, depois, enquanto); CAUSAL (porque, portanto); CONCESSIVA (embora, apesar de); ADITIVA (além disso, ademais); ADVERSATIVA (no entanto, contudo). Coesão é condição necessária mas não suficiente para a coerência."},

  {"id":"con-por-23","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Coerência Textual: Propriedade semântico-pragmática que garante unidade de sentido ao texto. Princípios: CONTINUIDADE (o texto deve desenvolver o mesmo universo temático); PROGRESSÃO (novas informações devem ser acrescidas — não pode ficar repetindo o mesmo); NÃO-CONTRADIÇÃO (as proposições não podem se contradizer dentro do mesmo plano de leitura — contradições aparentes podem ser conotativas); ARTICULAÇÃO (as partes do texto devem estar logicamente relacionadas entre si). Fatores que constroem coerência: conhecimento de mundo compartilhado, inferências, contexto situacional, intertextualidade, intencionalidade do autor. Texto incoerente ≠ texto mal escrito — incoerência é falha semântica/lógica; falta de coesão é falha formal."},

  {"id":"con-por-24","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Inferência, Pressuposto e Subentendido: INFERÊNCIA: conclusão lógica que o leitor tira a partir das informações do texto e de seu conhecimento de mundo (o texto implica X sem afirmar diretamente). PRESSUPOSTO: informação implícita necessária para que o enunciado faça sentido, marcada por gatilhos linguísticos; não pode ser negada sem tornar o enunciado sem sentido ('Parei de fumar' pressupõe que antes fumava). SUBENTENDIDO: informação inferida pelo contexto pragmático/situacional, sem marca linguística; pode ser negada ('Está frio aqui' pode sugerir 'feche a janela', mas pode ser negado). Distinção em provas: o pressuposto está no texto de modo implícito-necessário; o subentendido depende da intenção comunicativa e do contexto."},

  {"id":"con-por-25","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Estrutura da Argumentação: Texto dissertativo-argumentativo tem estrutura tripartite: INTRODUÇÃO (apresenta o tema e enuncia a tese — posição do autor sobre o tema); DESENVOLVIMENTO (argumentos que sustentam a tese — cada parágrafo desenvolve um argumento, com dados, exemplos, comparações, citações de autoridade, raciocínio lógico); CONCLUSÃO (retoma a tese de forma ampliada ou propõe solução). TESE: afirmação controversa que pode ser defendida ou atacada. ARGUMENTO: razão que sustenta a tese. CONTRA-ARGUMENTO: objeção à tese — texto sofisticado refuta o contra-argumento. Estratégias argumentativas: exemplificação, causa-consequência, comparação, autoridade, dado estatístico, analogia, definição, concessão seguida de refutação."},

  {"id":"con-por-26","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Funções da Linguagem (Jakobson): Seis fatores de comunicação, cada um originando uma função. REFERENCIAL/DENOTATIVA: centrada no contexto/referente — informação objetiva, denotação (textos jornalísticos, científicos). EMOTIVA/EXPRESSIVA: centrada no emissor — exprime sentimentos e emoções (interjeições, exclamações, primeira pessoa). CONATIVA/APELATIVA: centrada no receptor — persuasão, ordem, apelo (imperativo, vocativo; publicidade). FÁTICA: centrada no canal — verifica ou mantém o contato (alô?, tchau, certo?). METALINGUÍSTICA: centrada no código — fala sobre a própria linguagem (dicionário, gramática, texto que comenta outro texto). POÉTICA: centrada na mensagem — valoriza a forma, a sonoridade, a ambiguidade expressiva (poesia, jogos de palavras, publicidade criativa). Em concursos: identificar a função predominante — textos raramente têm função única."},

  {"id":"con-por-27","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Variação Linguística: A língua varia conforme fatores externos e internos. VARIAÇÃO DIALETAL (diatópica): diferenças regionais (sotaque, vocabulário — 'mandioca' vs 'macaxeira' vs 'aipim'). VARIAÇÃO SOCIAL (diastrática): diferenças por grupo social, faixa etária, escolaridade (gíria de jovens; jargão profissional; fala popular vs culta). VARIAÇÃO DE REGISTRO (diafásica): adequação da linguagem à situação comunicativa — formal (serviços públicos, acadêmico) vs informal (conversa cotidiana). VARIAÇÃO HISTÓRICA (diacrônica): mudanças ao longo do tempo (palavras arcaicas, neologismos). NORMA-PADRÃO: variedade de prestígio social codificada em gramáticas e dicionários. Todas as variedades são igualmente válidas do ponto de vista linguístico — o preconceito linguístico é social, não científico."},

  {"id":"con-por-28","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Intertextualidade: Relação entre textos — todo texto dialoga com outros textos. CITAÇÃO: reprodução literal de outro texto, entre aspas com indicação da fonte. ALUSÃO: referência implícita a outro texto, obra ou fato cultural sem citação direta. PARÁFRASE: reescrita do conteúdo de outro texto com palavras diferentes, mantendo o sentido (relação de fidelidade). PARÓDIA: recriação irônica ou crítica de outro texto, invertendo ou subvertendo seu sentido (relação de subversão). PASTICHE: imitação do estilo de outro autor sem intenção crítica. EPÍGRAFE: citação no início de um texto para contextualizar ou dialogar com o tema. INTERDISCURSIVIDADE: diálogo entre discursos e não apenas textos (o discurso jornalístico com o discurso científico). Em provas: identificar a relação intertextual e seu efeito de sentido."},

  {"id":"con-por-29","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Progressão Temática: Forma como a informação avança no texto. TEMA: ponto de partida da oração, informação conhecida (dado). REMA: informação nova acrescentada ao tema. Tipos de progressão: PROGRESSÃO COM TEMA CONSTANTE: o mesmo tema é retomado em diferentes orações com remas novos (Pedro chegou. Pedro sentou. Pedro leu). PROGRESSÃO LINEAR: o rema de uma oração torna-se tema da seguinte (Pedro chegou. Sua chegada surpreendeu a todos). PROGRESSÃO COM TEMAS DERIVADOS: um hipertema se desdobra em subtemas (O Brasil tem três poderes: o Legislativo..., o Executivo..., o Judiciário...). PROGRESSÃO COM REMAS DIVIDIDOS: um rema se subdivide em vários elementos. Textos bem escritos combinam tipos de progressão para manter coerência e evitar repetição excessiva."},

  {"id":"con-por-30","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Conectivos e Articuladores: ADVERSATIVOS (contraste/oposição): mas, porém, contudo, entretanto, todavia, no entanto, ao passo que, não obstante. CONCLUSIVOS (conclusão/consequência): portanto, logo, assim, por isso, por conseguinte, dessa forma, diante disso, em vista disso. ADITIVOS (adição/soma): e, também, além disso, ademais, não só...mas também, outrossim. EXPLICATIVOS (explicação/justificativa): pois (anteposto ao verbo), porque, já que, visto que, uma vez que, porquanto. CONCESSIVOS (concessão): embora, ainda que, mesmo que, apesar de (que), conquanto, por mais que. TEMPORAIS: quando, enquanto, assim que, logo que, depois que, antes que, até que, desde que (temporal). CONDICIONAIS: se, caso, desde que (condicional), contanto que, salvo se, a menos que. CONFORMATIVOS: conforme, segundo, como (conformativo), de acordo com. FINAIS: para que, a fim de que, com o intuito de que."},

  # Semântica e Lexicologia (8 docs)
  {"id":"con-por-31","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Polissemia e Homonímia: POLISSEMIA: uma palavra com vários sentidos relacionados etimologicamente (pé: de pessoa, de mesa, de página — todos derivados de uma mesma origem). HOMONÍMIA: palavras diferentes com a mesma forma por convergência fonética, sem relação de sentido. HOMÓFONAS: mesma pronúncia, grafias diferentes (cessão/sessão/seção; conserto/concerto; acento/assento). HOMÓGRAFAS: mesma grafia, pronúncias diferentes (colher sb. /ô/ vs colher vb. /ê/; jogo sb. /ô/ vs jogo vb. /ô/ — às vezes iguais). HOMÔNIMAS PERFEITAS: mesma pronúncia e grafia (canto — ato de cantar/canto de parede; manga — fruta/parte da camisa). Em provas: identificar se é polissemia (sentidos relacionados) ou homonímia (coincidência formal) exige análise etimológica e contextual."},

  {"id":"con-por-32","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Sinonímia e Antonímia: SINONÍMIA: relação entre palavras de sentido igual ou semelhante. SINÔNIMOS PERFEITOS (raros): intercambiáveis em todos os contextos (léxico/vocabulário em alguns contextos). SINÔNIMOS IMPERFEITOS (comuns): semelhança de sentido com matizes diferentes — comer/alimentar-se/devorar/ingerir têm valores estilísticos e contextuais distintos. Em textos, a sinonímia é recurso de coesão (substituição lexical). ANTONÍMIA: relação de oposição de sentido. Tipos: COMPLEMENTARES (a negação de um afirma o outro — vivo/morto); GRADUAIS/CONTRÁRIOS (admitem graus intermediários — quente/morno/frio); RECÍPROCOS (pressupõem o outro — comprar/vender; dar/receber); CONVERSIVOS (perspectivas opostas do mesmo fato — antes/depois; acima/abaixo). Antonímia pode ser por prefixo (feliz/infeliz, legal/ilegal)."},

  {"id":"con-por-33","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Parônimos e Homônimos Confundidos em Provas: PARÔNIMOS: palavras parecidas na forma mas com sentidos diferentes. Pares frequentes em concursos: EMINENTE (ilustre, notável) × IMINENTE (que está prestes a acontecer); DESCRIÇÃO (relato, enumeração) × DISCRIÇÃO (reserva, prudência); INFLIGIR (impor pena) × INFRINGIR (violar norma); EMERGIR (vir à tona) × IMERGIR (afundar); DEFERIR (conceder, atender) × DIFERIR (ser diferente, adiar); APÓSTROFE (figura de retórica) × APÓSTROFO (sinal gráfico '); RATIFICAR (confirmar) × RETIFICAR (corrigir); TRÁFEGO (trânsito) × TRÁFICO (comércio ilícito); FLAGRANTE (evidente; em ato) × FRAGRANTE (perfumado); MANDADO (ordem judicial) × MANDATO (procuração, poder delegado). Memória: o contexto sintático e semântico define qual parônimo é correto."},

  {"id":"con-por-34","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Formação de Palavras: DERIVAÇÃO: formação a partir de uma palavra-base (primitiva). PREFIXAL: acréscimo de prefixo (des+fazer=desfazer; in+justo=injusto). SUFIXAL: acréscimo de sufixo (pedra+eiro=pedreiro; beleza, bondade). PARASSINTÉTICA: prefixo E sufixo simultaneamente, sem que um dos acréscimos isolados forme palavra existente (em+pobr+ecer=empobrecer — sem 'empobrecer' ou 'pobrecedor' independentes). REGRESSIVA: retirada de sufixo verbal para formar substantivo abstrato (ajudar→ajuda; chorar→choro; amar→amor). IMPRÓPRIA: mudança de classe gramatical sem alteração formal (o jantar/jantar vb.; o olhar/olhar vb.; a saudade — denominação geral). COMPOSIÇÃO: junção de dois ou mais radicais. JUSTAPOSIÇÃO: elementos sem alteração fonética (couve-flor, guarda-roupa, segunda-feira). AGLUTINAÇÃO: elementos com alteração/fusão fonética (planalto=plano+alto; vinagre=vinho+acre; aguardente)."},

  {"id":"con-por-35","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Semântica do Texto: AMBIGUIDADE: palavra ou construção sintática com dois ou mais sentidos possíveis no mesmo contexto — pode ser intencional (efeito estilístico) ou indesejada (erro de redação). Causas: polissemia, pronome de referência dupla, adjunto adverbial mal posicionado (Vi o homem com o binóculo — quem tem o binóculo?). PRESSUPOSIÇÃO: informação implícita necessária para o enunciado fazer sentido, ativada por gatilhos linguísticos específicos (verbos factivos: saber, perceber, lamentar — pressupõem que o complemento é verdadeiro; advérbios como 'ainda', 'já', 'novamente' — 'Ele ainda trabalha' pressupõe que trabalhava antes). SUBENTENDIDO: informação comunicada indiretamente, dependente do contexto pragmático, negável sem contradição. IMPLICATURA: o que é comunicado além do sentido literal, por princípios de cooperação conversacional (Grice: quantidade, qualidade, relação, modo)."},

  {"id":"con-por-36","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Campo Semântico e Campo Lexical: CAMPO SEMÂNTICO: conjunto de palavras que compartilham um traço de significado comum, pertencendo ao mesmo domínio conceitual. Exemplo: campo semântico de 'profissões médicas': médico, enfermeiro, cirurgião, anestesista, pediatra — todas ligadas à área da saúde. CAMPO LEXICAL: conjunto de palavras associadas a um mesmo tema ou referente, independentemente da classe gramatical — inclui termos de diferentes campos semânticos relacionados ao tema. Exemplo: campo lexical de 'escola': professor, aluno, quadro, aprender, ensinar, saber, sala, disciplina, matrícula. Diferença: campo semântico é mais restrito (traço comum de significado); campo lexical é mais amplo (associação temática). Em análise textual: identificar campos semânticos ajuda a entender a isotopia — repetição de traços semânticos que garante coerência temática."},

  {"id":"con-por-37","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Neologismo, Arcaísmo, Estrangeirismo, Jargão e Gíria: NEOLOGISMO: palavra nova criada para nomear realidades novas (selfie, deletar, googlar, startupar) — pode ser criação, derivação ou empréstimo. ARCAÍSMO: palavra ou forma em desuso (vossemecê→você; outrossim; dessarte; mister — necessário). ESTRANGEIRISMO: palavra de língua estrangeira usada no português. ANGLICISMO (do inglês): software, download, marketing, notebook. GALICISMO (do francês): toalete, menu, ballet, garage. HISPANISMO (do espanhol): rancheiro, peonagem. ITALIANISMO: lasanha, pizza, malandro. JARGÃO: vocabulário técnico de um grupo profissional específico, incompreensível para leigos (habeas corpus — jurídico; firmware — tecnologia; distocia — medicina). GÍRIA: variação de grupo social restrito, marcada por época e geração (mano, tá ligado, rolê, bombar). Uso em textos: neologismos e estrangeirismos podem ser recurso estilístico; arcaísmos criam efeito histórico ou irônico."},

  {"id":"con-por-38","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Ortografia e Emprego de Letras: Baseado no VOLP (Vocabulário Ortográfico da Língua Portuguesa). G/J: usa-se G em palavras terminadas em -agem, -igem, -ugem, -gem (viagem, origem, ferrugem); J em palavras de origem tupi/africana e em formas de conjugação (jerimum, jiboia, jogo, sujeito, lisonjear). S/Z: usa-se S em sufixos -oso/-osa, -ês/-esa, -ense, -ismo, -ista, e em palavras derivadas com sufixo -ão→-são (expansão, compreensão); Z em -izar, -izar, -zinho, -zeiro, -ização (civilização, cafezinho). X/CH: usa-se X após ditongo (caixa, feixe, frouxo), após prefixo 'en-' (enxergar, enxoval), palavras de origem indígena (xique-xique); CH em palavras de origem greco-latina (charada, chefe, cheque). SS/Ç: verbos terminados em -ter, -ceder, -ceder formam substantivos em -ssão (conter→contenção×contenssão); verbos em -mitir→-missão (admitir→admissão)."},

  # Literatura (7 docs)
  {"id":"con-por-39","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Trovadorismo e Humanismo: TROVADORISMO (séculos XII-XIV — Portugal): primeira manifestação literária em língua portuguesa. CANTIGAS DE AMOR: eu-lírico masculino, amor cortês, idealização da mulher (senhor), sofrimento pela não-correspondência, influência provençal, tom lamentoso. CANTIGAS DE AMIGO: eu-lírico feminino (voz masculina que finge falar como mulher), saudade do amado, natureza como confidente, paralelismo formal e refrão, origem mais popular. CANTIGAS DE ESCÁRNIO E MALDIZER: sátira social e pessoal — escárnio de forma indireta/irônica; maldizer de forma direta e explícita. HUMANISMO (séculos XV-XVI — Portugal): transição Medieval→Renascimento. GIL VICENTE: fundador do teatro português; autos de moralidade (Auto da Barca do Inferno — crítica social, personagens alegóricos como Parvo, Fidalgo, Sapateiro perante a morte); autos pastoris e farsas. Características: crítica social, personagens tipificados, linguagem popular."},

  {"id":"con-por-40","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Classicismo Português: Século XVI — renascimento dos valores greco-latinos, razão, equilíbrio, universalismo. LUÍS VAZ DE CAMÕES (1524?-1580): maior representante. OS LUSÍADAS (1572): epopeia em 10 cantos, estrofes de oitava-rima (8 versos decassílabos), narra a viagem de Vasco da Gama à Índia como pretexto para exaltar os feitos portugueses. Estrutura: Proposição (canto I, est.1-3), Invocação (às Tágides), Dedicatória (D. Sebastião), Narração, Epílogo. Episódios fundamentais: Inês de Castro (canto III), Adamastor/Cabo das Tormentas (canto V), Ilha dos Amores (canto IX). SONETOS: forma fixa (2 quartetos + 2 tercetos, decassílabos), lirismo amoroso petrarquista e filosofia neoplatônica — 'Amor é fogo que arde sem se ver' (soneto 11). Dualidade camoniana: amor e destino, glória e decadência, razão e emoção."},

  {"id":"con-por-41","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Barroco e Arcadismo: BARROCO BRASILEIRO (1601-1768): CULTISMO (conceptismo formal — jogos de palavras, paradoxos, antíteses, figuras de linguagem) e CONCEPTISMO (jogos de ideias, raciocínio engenhoso, argumentação sutil). GREGÓRIO DE MATOS GUERRA (c.1636-1696): 'Boca do Inferno' — lírica amorosa, satírica (crítica à sociedade baiana: clero, nobreza, burguesia), religiosa (paradoxos entre pecado e arrependimento — 'A Jesus Cristo Nosso Senhor'). PADRE ANTÔNIO VIEIRA (1608-1697): oratória sacra — Sermão da Sexagésima (defesa da pregação jesuítica), Sermão pelo Bom Sucesso das Armas de Portugal (durante invasão holandesa). ARCADISMO BRASILEIRO (1768-1836): reação ao excesso barroco; razão, simplicidade, natureza idealizada (locus amoenus), bucolismo, pseudônimos pastoris. TOMÁS ANTÔNIO GONZAGA: Marília de Dirceu (lirismo amoroso, saudade, prisão por participar da Inconfidência Mineira). CLÁUDIO MANUEL DA COSTA: Vila Rica, Obras. BASÍLIO DA GAMA: O Uraguai (épico anti-jesuítico)."},

  {"id":"con-por-42","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Romantismo Brasileiro: 1836-1881 — subjetivismo, nacionalismo, idealização, sentimentalismo, evasão, medievalismo, religiosidade. 1ª GERAÇÃO (indianista/nacionalista): GONÇALVES DIAS (1823-1864) — poesia indianista (I-Juca-Pirama, Canção do Exílio — 'Minha terra tem palmeiras...'), exaltação do índio e da natureza brasileira. 2ª GERAÇÃO (ultra-romântica/byroniana): ÁLVARES DE AZEVEDO (1831-1852) — 'Lira dos Vinte Anos', dualismo (idealismo×sensualidade), culto da morte, boêmia, ironia; CASIMIRO DE ABREU — infância, saudade; FAGUNDES VARELA. 3ª GERAÇÃO (condoreirismo/social): CASTRO ALVES (1847-1871) — 'Navio Negreiro', 'Vozes d'África' — poesia social e abolicionista, oratória, grandiloquência. PROSA ROMÂNTICA: JOSÉ DE ALENCAR — romances indianistas (Iracema, O Guarani), regionalistas (O Sertanejo), urbanos (Senhora, Lucíola). JOAQUIM MANUEL DE MACEDO — A Moreninha (1º romance brasileiro, 1844)."},

  {"id":"con-por-43","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Realismo, Naturalismo e Parnasianismo: REALISMO BRASILEIRO (1881-1902): objetividade, crítica social, personagem psicológico, narrador onisciente. MACHADO DE ASSIS (1839-1908): maior escritor brasileiro. Fase romântica: Ressurreição, A Mão e a Luva. Fase realista: Memórias Póstumas de Brás Cubas (1881 — marco do Realismo; narrador defunto, ironia, pessimismo); Quincas Borba; Dom Casmurro (ambiguidade: Capitu traiu?); Esaú e Jacó; Memorial de Aires. Contos: Missa do Galo, A Cartomante, O Alienista. NATURALISMO: determinismo, cientificismo, meios inferiores, personagem como produto do meio. ALUÍSIO AZEVEDO — O Cortiço (1890 — naturalismo pleno: coletivo como personagem, determinismo, crítica social); O Mulato (primeiro romance naturalista, 1881). PARNASIANISMO (poesia 1880-1920): culto da forma perfeita, objetividade, mitologia greco-latina, versos metricamente rigorosos. OLAVO BILAC — 'Via Láctea', 'Profissão de Fé' (metapoema — arte como joalheria). RAIMUNDO CORREIA — 'As Pombas'. ALBERTO DE OLIVEIRA."},

  {"id":"con-por-44","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Modernismo Brasileiro: Movimento de ruptura iniciado com a SEMANA DE ARTE MODERNA (11-13/02/1922, São Paulo — Teatro Municipal) com Mário de Andrade, Oswald de Andrade, Anita Malfatti, Heitor Villa-Lobos. 1ª FASE (1922-1930): ruptura, experimentalismo, humor, antropofagia. OSWALD DE ANDRADE — 'Manifesto Pau-Brasil' (poesia de exportação), 'Manifesto Antropófago' (devorar o estrangeiro e recriar); Memórias Sentimentais de João Miramar; Serafim Ponte Grande. MÁRIO DE ANDRADE — Macunaíma (herói sem nenhum caráter, rapsódia modernista, identidade nacional); Pauliceia Desvairada (poesia). 2ª FASE (1930-1945): psicológica, social, regional. CARLOS DRUMMOND DE ANDRADE — 'Alguma Poesia', 'A Flor e a Náusea', 'No Meio do Caminho'; poesia de introspecção e engajamento. GRACILIANO RAMOS — Vidas Secas (seca, opressão, denúncia social); São Bernardo; Angústia. RACHEL DE QUEIROZ — O Quinze. JORGE AMADO — Capitães da Areia. GUIMARÃES ROSA — Grande Sertão: Veredas (linguagem inovadora, sertão-mundo). CLARICE LISPECTOR — A Maçã no Escuro, A Paixão Segundo G.H. (fluxo de consciência). 3ª FASE (pós-1945): Geração de 45 — neoclassicismo formal, João Cabral de Melo Neto."},

  {"id":"con-por-45","area":"Concursos","disciplina":"Portugues","namespace":"concursos_portugues",
   "texto":"Concursos Português — Tendências Contemporâneas: GERAÇÃO DE 45 (pós-1945): reação ao excesso modernista, retorno à forma; JOÃO CABRAL DE MELO NETO — 'Morte e Vida Severina' (teatro épico, seca nordestina, forma rigorosa), 'A Educação pela Pedra'. CONCRETISMO (1956, São Paulo): 'Noigandres' — Augusto de Campos, Haroldo de Campos, Décio Pignatari; poema-objeto, exploração visual-sonora-semântica; 'Manifesto Concretista'. TROPICALISMO (1967-68): Caetano Veloso, Gilberto Gil — mistura de influências nacionais e internacionais, contracultura, ditadura militar. POESIA MARGINAL/GERAÇÃO MIMEÓGRAFO (anos 1970): Leminski, Nicolas Behr, Ana Cristina César, Chacal — circulação alternativa, cotidiano, irreverência. PROSA CONTEMPORÂNEA: Lygia Fagundes Telles, Rubem Fonseca (violência urbana), Ignácio de Loyola Brandão, João Ubaldo Ribeiro, Luiz Ruffato, Raduan Nassar — Lavoura Arcaica. LITERATURA PERIFÉRICA: Ferréz, Paulo Lins — narrativas das margens urbanas."},

  # ══════════════════════════════════════════════════════
  # MATÉRIA 2: DIREITO CONSTITUCIONAL
  # ══════════════════════════════════════════════════════

  {"id":"con-dc-01","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Princípios Fundamentais (Arts. 1°-4° CF/88): Art. 1° — A República Federativa do Brasil é Estado Democrático de Direito com FUNDAMENTOS: I-soberania; II-cidadania; III-dignidade da pessoa humana; IV-valores sociais do trabalho e da livre iniciativa; V-pluralismo político. Parágrafo único: 'Todo poder emana do povo'. Art. 2° — Poderes: Legislativo, Executivo e Judiciário — independentes e harmônicos. Art. 3° — OBJETIVOS FUNDAMENTAIS: I-construir sociedade livre, justa e solidária; II-garantir desenvolvimento nacional; III-erradicar pobreza e marginalização, reduzir desigualdades sociais e regionais; IV-promover bem de todos sem discriminação. Art. 4° — RELAÇÕES INTERNACIONAIS: I-independência nacional; II-prevalência dos direitos humanos; III-autodeterminação dos povos; IV-não-intervenção; V-igualdade entre Estados; VI-defesa da paz; VII-solução pacífica de conflitos; VIII-repúdio ao terrorismo e racismo; IX-cooperação entre povos; X-concessão de asilo político. Parágrafo único: integração latino-americana."},

  {"id":"con-dc-02","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Direitos e Garantias Fundamentais (Art. 5° CF/88): Caput: todos são iguais perante a lei, sem distinção de qualquer natureza, garantindo-se aos brasileiros e estrangeiros residentes a inviolabilidade do direito à VIDA, LIBERDADE, IGUALDADE, SEGURANÇA e PROPRIEDADE. Principais incisos: I-igualdade entre homens e mulheres; II-legalidade (ninguém obrigado a fazer ou deixar de fazer senão em virtude de lei); III-vedação de tortura; IV-liberdade de pensamento, vedado o anonimato; VI-liberdade de consciência e crença; X-inviolabilidade da honra e imagem; XI-inviolabilidade domiciliar; XII-inviolabilidade de comunicações; XIII-liberdade profissional; XIV-acesso à informação; XV-liberdade de locomoção; XVI-liberdade de reunião; XVII-liberdade de associação; XXII-direito de propriedade; XXIII-função social; XXXV-inafastabilidade da jurisdição; XXXVII-vedação de tribunal de exceção; XXXVIII-júri; XXXIX-nullum crimen sine lege; XL-irretroatividade prejudicial; XLII-racismo crime inafiançável; LIII-due process of law; LIV-devido processo legal; LV-contraditório e ampla defesa; LXVIII-habeas corpus; LXIX-mandado de segurança; LXXI-mandado de injunção; LXXII-habeas data."},

  {"id":"con-dc-03","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Direitos Sociais e de Nacionalidade (Arts. 6°-13 CF/88): Art. 6° — DIREITOS SOCIAIS: educação, saúde, alimentação, trabalho, moradia, transporte, lazer, segurança, previdência social, proteção à maternidade e infância, assistência aos desamparados. Arts. 7°-11: direitos dos trabalhadores urbanos e rurais — salário mínimo, FGTS, décimo terceiro, férias remuneradas com 1/3, licença-maternidade 120 dias, licença-paternidade, aviso prévio, proteção do mercado feminino (art.7°, XX), livre associação sindical, greve (art. 9°), representação sindical, participação em colegiados (art. 10). NACIONALIDADE (arts. 12-13): BRASILEIROS NATOS (art.12, I): nascidos no Brasil (jus soli), mesmo que filhos de estrangeiros não a serviço de seu país; nascidos no exterior, filhos de brasileiro(a), registrados em repartição consular; nascidos no exterior, filhos de brasileiro, que venham a residir no Brasil e optem pela nacionalidade. NATURALIZADOS (art.12, II): requisitos em lei ordinária. Diferenças entre natos e naturalizados: cargos privativos de natos (art. 12, §3°): Presidente e VP, Presidente do SF, STF, diplomata de carreira, Ministro da Defesa, membro do Conselho de República."},

  {"id":"con-dc-04","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Organização do Estado (Arts. 18-43 CF/88): Art. 18: organização político-administrativa — União, Estados, Distrito Federal e Municípios, todos AUTÔNOMOS. Art. 20: BENS DA UNIÃO — mar territorial, terrenos de marinha, ilhas oceânicas, recursos naturais da plataforma continental, terras indígenas, lagos e rios em mais de um Estado ou fronteiriços, potencial de energia hidráulica, jazidas. Art. 21: competências EXCLUSIVAS da União (privativas, indelegáveis): emitir moeda, manter relações com Estados estrangeiros, declarar guerra, organizar FA, legislar sobre direito civil, penal, eleitoral, trabalhista (art. 22 — privativas, delegáveis por LC). Art. 23: competências COMUNS (todos os entes). Art. 24: competências CONCORRENTES (União, Estados e DF — não Municípios). Art. 25: Estados — competências residuais (tudo que não for vedado). Art. 29: Municípios — lei orgânica. Arts. 34-36: INTERVENÇÃO FEDERAL nos Estados (hipóteses taxativas: manter integridade nacional, repelir invasão estrangeira, pôr fim a grave comprometimento da ordem pública, reorganizar finanças, etc.)."},

  {"id":"con-dc-05","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Poder Legislativo (Arts. 44-73 CF/88): CONGRESSO NACIONAL: Câmara dos Deputados + Senado Federal. CÂMARA: representantes do povo, eleitos pelo sistema proporcional; mínimo de 8 e máximo de 70 deputados por Estado (art. 45, §1°). SENADO: 3 senadores por Estado e DF, mandato de 8 anos, renovação alternada de 1/3 e 2/3 (art. 46). ATRIBUIÇÕES DO CONGRESSO (art. 48): leis sobre tributação, orçamento, dívida pública, moeda, telecomunicações, etc. ATRIBUIÇÕES EXCLUSIVAS (art. 49): resolver sobre tratados internacionais, autorizar guerras e estados de sítio, sustar atos normativos do Executivo que exorbitem delegação legislativa. PROCESSO LEGISLATIVO (arts. 59-69): espécies normativas: EC, LC, lei ordinária, lei delegada, medida provisória, decreto legislativo, resolução. EMENDA CONSTITUCIONAL: 3/5 de cada Casa em 2 turnos (art. 60, §2°). MEDIDA PROVISÓRIA (art. 62): força de lei, prazo 60 dias prorrogável uma vez — não pode versar sobre matéria penal, eleitoral, etc."},

  {"id":"con-dc-06","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Poder Executivo (Arts. 76-91 CF/88): Art. 76: Poder Executivo exercido pelo Presidente da República, auxiliado pelos Ministros de Estado. Art. 77: eleição do Presidente e VP — sufrágio universal, voto direto e secreto; maioria absoluta (2º turno se ninguém obtiver no 1°). Mandato: 4 anos, permitida uma reeleição. Art. 84: ATRIBUIÇÕES PRIVATIVAS DO PRESIDENTE — sancionar/vetar leis, editar MP, expedir decretos regulamentadores, nomear ministros e ministros do STF (após aprovação do SF), declarar guerra, celebrar tratados. Art. 85: CRIMES DE RESPONSABILIDADE (impeachment) — atos que atentem contra a CF: existência da União, livre exercício do Legislativo, Judiciário, MP e Poderes dos Estados, segurança interna, probidade administrativa, lei orçamentária, cumprimento de leis e decisões judiciais. Art. 86: processo de impeachment: autorização por 2/3 da Câmara; julgamento pelo Senado presidido pelo STF (crimes de responsabilidade) ou pelo próprio STF (crimes comuns). Art. 89: Conselho da República. Art. 91: Conselho de Defesa Nacional."},

  {"id":"con-dc-07","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Poder Judiciário (Arts. 92-135 CF/88): ÓRGÃOS (art. 92): STF, CNJ, STJ, TST, TSE, STM, TRFs e Juízes Federais, TJs e Juízes Estaduais, TRTs e Juízes do Trabalho, TREs e Juízes Eleitorais, Conselhos de Justiça Militar. STF (arts. 101-103): 11 ministros, vitalícios, nomeados pelo Presidente após aprovação do SF; competência originária e recursal (RE — repercussão geral); guarda da CF; ação direta. STJ (arts. 104-105): uniformização da interpretação da lei federal (REsp). TST (arts. 111-116): uniformização da jurisprudência trabalhista. GARANTIAS DA MAGISTRATURA (art. 95): vitaliciedade (após 2 anos de exercício — 1ª instância ou posse para tribunais), inamovibilidade e irredutibilidade de subsídio. VEDAÇÕES: exercício de atividade político-partidária, receber custas, participar de empresa, exercer função ou cargo público exceto magistério. FUNÇÕES ESSENCIAIS À JUSTIÇA (arts. 127-135): Ministério Público (autonomia, promotoria), Advocacia Pública (AGU — art. 131), Defensoria Pública (art. 134), Advocacia (art. 133)."},

  {"id":"con-dc-08","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Estado de Defesa e Estado de Sítio (Arts. 136-141 CF/88): ESTADO DE DEFESA (art. 136): decretado pelo Presidente (ouvido Conselho da República e Conselho de Defesa Nacional) sem aprovação prévia do Congresso — para preservar ou prontamente restabelecer a ordem pública ou a paz social ameaçadas por grave e iminente instabilidade institucional ou calamidades de grandes proporções. Duração: até 30 dias, prorrogável uma vez por igual período. Medidas: restrições ao direito de reunião, sigilo de correspondência, sigilo de comunicação telegráfica e telefônica, ocupação de bens. CONTROLE: Congresso Nacional aprecia no prazo de 10 dias (se não estiver reunido, convocação extraordinária em 5 dias). ESTADO DE SÍTIO (arts. 137-139): decretado pelo Presidente após autorização prévia do Congresso por maioria absoluta. Hipóteses: comoção grave ou ineficácia do estado de defesa (30 dias, prorrogável); guerra ou resposta a agressão estrangeira (sem prazo fixo). Medidas mais graves: suspensão de garantias constitucionais expressamente indicadas no decreto. CESSAR: decreto do próprio Presidente."},

  {"id":"con-dc-09","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Forças Armadas e Segurança Pública (Arts. 142-144 CF/88): Art. 142: Forças Armadas (Marinha, Exército e Aeronáutica) — sob autoridade suprema do Presidente da República; destinam-se à defesa da pátria, garantia dos poderes constitucionais e, por iniciativa de qualquer destes, da lei e da ordem. Membros: militares; proibições: sindicalização, greve, filiação partidária durante serviço ativo. Art. 143: serviço militar obrigatório; mulheres e religiosos dispensados em tempo de paz. Art. 144: SEGURANÇA PÚBLICA — dever do Estado, direito e responsabilidade de todos. ÓRGÃOS: I-Polícia Federal (PF): infrações com repercussão interestadual ou internacional, combate ao tráfico, PF migratória, segurança de autoridades federais, função judicial policial; II-Polícia Rodoviária Federal (PRF): rodovias federais; III-Polícia Ferroviária Federal; IV-Polícias Civis (Estados): investigação, inquérito policial, exceto infrações militares; V-Polícias Militares (Estados) e Bombeiros Militares: policiamento ostensivo, preservação da ordem pública — forças auxiliares e reserva do Exército."},

  {"id":"con-dc-10","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Sistema Tributário Nacional (Arts. 145-169 CF/88): Art. 145: ESPÉCIES TRIBUTÁRIAS que União, Estados, DF e Municípios podem instituir: impostos, taxas (pelo exercício do poder de polícia ou serviços específicos e divisíveis) e contribuições de melhoria (decorrentes de obras públicas). Art. 148: empréstimos compulsórios (apenas União, por LC, calamidade ou guerra; investimento urgente). Art. 149: contribuições especiais (apenas União: sociais, intervenção no domínio econômico, categorias profissionais). PRINCÍPIOS TRIBUTÁRIOS: Legalidade (art. 150, I); Irretroatividade (art. 150, III, a); Anterioridade (art. 150, III, b — não cobrança no mesmo exercício); Anterioridade Nonagesimal (art. 150, III, c — 90 dias antes); Isonomia (art. 150, II); Vedação ao Confisco (art. 150, IV); Não limitação ao tráfego (art. 150, V). EXCEÇÕES: II, IE, IPI, IOF (não observam anterioridade anual); IPI, II, IE, CIDE-combustíveis, ICMS-combustíveis (não observam anterioridade nonagesimal)."},

  {"id":"con-dc-11","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Ordem Econômica e Social (Arts. 170-232 CF/88): Art. 170: ORDEM ECONÔMICA fundada na valorização do trabalho e livre iniciativa, com fins de assegurar existência digna. PRINCÍPIOS: soberania nacional, propriedade privada, função social da propriedade, livre concorrência, defesa do consumidor, meio ambiente, redução das desigualdades, busca do pleno emprego, tratamento favorecido para empresas nacionais de pequeno porte. Art. 173: exploração direta de atividade econômica pelo Estado — apenas quando necessária aos imperativos da segurança nacional ou relevante interesse coletivo. Art. 196: SAÚDE — direito de todos e dever do Estado; SUS — sistema único, descentralizado, com participação comunitária. Art. 205: EDUCAÇÃO — direito de todos, dever do Estado e da família; princípios: igualdade, liberdade, gratuidade no ensino público. Art. 225: MEIO AMBIENTE — direito ao meio ambiente ecologicamente equilibrado, bem de uso comum do povo e essencial à sadia qualidade de vida; dever do Estado e da coletividade defendê-lo e preservá-lo para presentes e futuras gerações."},

  {"id":"con-dc-12","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Controle de Constitucionalidade: DIFUSO (incidental/concreto): qualquer juiz ou tribunal pode declarar inconstitucionalidade de lei no caso concreto — efeitos inter partes e ex tunc (regra). Cláusula de reserva de plenário (art. 97): tribunal só declara inconstitucionalidade por maioria absoluta do pleno ou órgão especial. CONCENTRADO (abstrato — STF): ADI (Ação Direta de Inconstitucionalidade): questiona lei ou ato normativo federal ou estadual em face da CF — efeitos erga omnes e ex tunc; legitimados: art. 103 CF (9 entidades: Presidente, Mesa SF, Mesa CD, PGR, etc.). ADC (Ação Declaratória de Constitucionalidade): presunção de constitucionalidade com efeitos vinculantes. ADPF (Arguição de Descumprimento de Preceito Fundamental): subsidiária; cabe quando não houver outro meio eficaz; preceito fundamental da CF. ADO (Ação Direta de Inconstitucionalidade por Omissão): inconstitucionalidade por inação do legislador. SÚMULA VINCULANTE (art. 103-A): aprovada por 2/3 do STF, efeito vinculante a todos os órgãos do Poder Judiciário e à administração pública."},

  {"id":"con-dc-13","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Direitos Políticos — Art. 14 CF/88: Art. 14: alistamento eleitoral obrigatório dos 18 a 70 anos; facultativo para analfabetos, maiores de 70 e entre 16 e 18. Voto secreto, universal e direto. Plebiscito, referendo e iniciativa popular previstos no caput. Inelegibilidades no art. 14, §9° (detalhadas no art. 16 da LC 64/90 — lei de inelegibilidades)."},

  {"id":"con-dc-14","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Perda e Suspensão de Direitos Políticos — Art. 15 CF/88: Art. 15: perda ou suspensão dos direitos políticos apenas nos casos de: I-cancelamento de naturalização por sentença transitada; II-condenação criminal transitada em julgado enquanto durarem os efeitos; III-recusa de cumprir obrigação a todos imposta; IV-improbidade administrativa. Vedação à cassação de direitos políticos (art. 5°, LVII). Reabilitação conforme lei."},

  {"id":"con-dc-15","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Partidos Políticos — Arts. 17 e 16 CF/88: Art. 17: partidos livre criação, registro TSE, autonomia, programa e estatuto. Vedações: recebimento de recursos financeiros de entidade ou governo estrangeiro; subordinação a governo estrangeiro. Art. 16: organização interna democrática; escolha de candidatos por eleições diretas com voto obrigatório dos filiados. Fidelidade partidária: matéria de lei ordinária (não constitucional)."},

  {"id":"con-dc-16","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Competências Privativas da União — Art. 22 CF/88: Art. 22: competência LEGISLATIVA PRIVATIVA da União (indelegável a Estados): civil, comercial, penal, processual, trabalho, marítimo, aeronáutico, espacial, eleitoral, desapropriação, organização judiciária e MP, nacionalidade, extradição, defesa territorial, segurança nacional, penitenciário, telecomunicações, radiodifusão, matéria financeira, moeda, juros, instituições financeiras, previdência, direito de greve, produção e comércio de armas, sistema monetário."},

  {"id":"con-dc-17","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Competências Comuns — Art. 23 CF/88: Art. 23: competências COMUNS a União, Estados, DF e Municípios (todos podem legislar): cuidar da saúde e assistência pública, proteger documentos, patrimônio e memória, proteger meio ambiente, combater poluição, preservar florestas, fauna e flora, promover melhorias agrícolas, organizar defesa civil, estimular cultura, educação, proteger criança e adolescente, assistência aos desamparados, proteção à saúde dos trabalhadores."},

  {"id":"con-dc-18","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Competências Concorrentes — Art. 24 CF/88: Art. 24: competência CONCORRENTE — União fixa normas GERAIS; Estados e DF legislam suplementarmente. Matérias: direito tributário, financeiro, penitenciário, produção e consumo, florestas, caça, pesca, fauna, direito agrário, organização municipal, registros públicos, jornalismo, responsabilidade por dano ao meio ambiente, proteção ao patrimônio histórico, combate à poluição, produção e consumo de bens e serviços."},

  {"id":"con-dc-19","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Organização dos Estados — Arts. 25-27 CF/88: Art. 25: Estados autônomos, elegem governador e assembleia, organizam-se pela Constituição Estadual. Art. 26: competência residual — tudo que não for vedado. Art. 27: número de deputados proporcional à população, mínimo 24, máximo 70. Eleição de governador e vice no mesmo dia, mandato 4 anos, uma reeleição."},

  {"id":"con-dc-20","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Organização dos Municípios — Arts. 28-31 CF/88: Art. 28: Municípios autônomos, lei orgânica aprovada por 2/3 da Câmara, voto da população. Art. 29: número de vereadores conforme população (mínimo 9, máximo 55). Art. 30: competências municipais: legislar sobre assuntos de interesse local, suplementar legislação federal e estadual, instituir e arrecadar tributos municipais, organizar polícia municipal, etc. Art. 31: fiscalização contábil e financeira pelo TC ou equivalente."},

  {"id":"con-dc-21","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Distrito Federal — Art. 32 CF/88: Art. 32: DF não pode ser dividido em Municípios; competências legislativas reservadas aos Estados e municipais; eleição de governador e vice; lei orgânica votada por 2/3 da CLDF com quórum de aprovação da população. Conteúdo consolidado para provas de concurso público e vestibular, com termos técnicos frequentes em bancas como CESPE, FCC, FGV e Vunesp."},

  {"id":"con-dc-22","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Intervenção Federal — Arts. 34-36 CF/88: Art. 34: hipóteses taxativas de intervenção: manter integridade nacional; repelir invasão; pôr fim a grave comprometimento da ordem pública; reorganizar finanças; prover execução de lei federal; cumprir decisão judicial; proteger Municípios. Art. 35: intervenção em Municípios. Art. 36: decreto com prazo, se possível ouvido Conselho da República."},

  {"id":"con-dc-23","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Atribuições do Senado — Art. 52 CF/88: Art. 52: competências exclusivas do SF: processar e julgar Presidente e ministros do STF por crimes de responsabilidade; aprovar previamente escolha de magistrados e dirigentes; autorizar operações externas; aprovar tratados; aprovar nomeações de chefes de missão; autorizar Estado de Defesa e Sítio; fixar limites nacionalidade; etc."},

  {"id":"con-dc-24","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Atribuições da Câmara — Art. 53 CF/88: Art. 53: competências exclusivas da CD: autorizar processo contra Presidente e Vice; eleger membros do Conselho da República; julgar Secretários de Estado; examinar contas do Presidente; autorizar bem imóvel da União; etc. Conteúdo consolidado para provas de concurso público e vestibular, com termos técnicos frequentes em bancas como CESPE, FCC, FGV e Vunesp."},

  {"id":"con-dc-25","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Perda de Mandato Parlamentar — Art. 55 CF/88: Art. 55: perda de mandato por: decisão do TSE; violação de impedimento (art. 54); excesso de licença; incompatibilidade; condenação criminal transitada; perda ou suspensão de direitos políticos; improbidade; sentença que declare indignidade para cargo público."},

  {"id":"con-dc-26","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Processo Legislativo — Espécies Normativas — Art. 59 CF/88: Art. 59: processo legislativo para elaborar leis: EC, lei complementar, lei ordinária, lei delegada, MP, decreto legislativo, resolução. Hierarquia: CF no topo; LC exige maioria absoluta; LO maioria simples. MP: força de lei, prazo 60 dias prorrogável uma vez."},

  {"id":"con-dc-27","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Emenda Constitucional — Art. 60 CF/88: Art. 60: EC por 3/5 dos membros de cada Casa em dois turnos. VEDAÇÕES (§4°): abolir direitos e garantias; forma federativa; voto direto, secreto, universal e periódico; separação de Poderes; cláusula pétrea. §5°: matérias vedadas a MP."},

  {"id":"con-dc-28","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Comissões Parlamentares de Inquérito — Art. 58 CF/88: Art. 58, §3°: CPI pela maioria absoluta da Câmara ou Senado para apurar fato determinado e prazo certo, com poderes de investigação próprios das autoridades judiciais — podem convocar, tomar depoimento, requisitar documentos; não podem decretar prisão."},

  {"id":"con-dc-29","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Medida Provisória — Art. 62 CF/88: Art. 62: MP editada pelo Presidente em relevância e urgência; vigência 60 dias prorrogável; caducidade se não convertida em lei. Vedações §1°: nacionalidade, direitos políticos, penal, processual, tributária, orçamentária, servidores, organização judiciária, etc."},

  {"id":"con-dc-30","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Sanção e Veto — Arts. 63-66 CF/88: Art. 63: sanção ou veto do Presidente em 15 dias. Veto total ou parcial; Congresso pode derrubar veto por maioria absoluta. Art. 64: lei delegada por LC com normas gerais. Art. 65: decreto legislativo para MP rejeitada ou aprovada."},

  {"id":"con-dc-31","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Tramitação de Projetos — Arts. 67-69 CF/88: Art. 67: iniciativa popular — 1% eleitorado nacional, 0,3% por Estado, mínimo 5 Estados, 0,3% eleitores. Art. 68: urgência. Art. 69: sanção tácita se Presidente não sancionar nem vetar em 15 dias. Conteúdo consolidado para provas de concurso público e vestibular, com termos técnicos frequentes em bancas como CESPE, FCC, FGV e Vunesp."},

  {"id":"con-dc-32","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Vice-Presidente — Arts. 78-81 CF/88: Art. 78: eleição conjunta com Presidente. Art. 79: substituição em impedimento. Art. 80: vacância — eleição em 90 dias. Art. 81: crimes de responsabilidade do Vice. Conteúdo consolidado para provas de concurso público e vestibular, com termos técnicos frequentes em bancas como CESPE, FCC, FGV e Vunesp."},

  {"id":"con-dc-33","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Ministros de Estado — Arts. 82-84 CF/88: Art. 82: Ministros escolhidos pelo Presidente, maiores de 21 anos, brasileiros natos. Art. 84: atribuições privativas do Presidente (sancionar leis, nomear ministros, celebrar tratados, etc.). Conteúdo consolidado para provas de concurso público e vestibular, com termos técnicos frequentes em bancas como CESPE, FCC, FGV e Vunesp."},

  {"id":"con-dc-34","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Conselhos da República e Defesa — Arts. 89-91 CF/88: Art. 89: Conselho da República — Presidente, VP, Presidentes CD e SF, líderes maioria e minoria, Ministro Justiça, 6 brasileiros natos 35 anos. Art. 91: Conselho de Defesa Nacional — consulta em Estado de Defesa, Sítio, intervenção."},

  {"id":"con-dc-35","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Garantias da Magistratura — Arts. 93-95 CF/88: Art. 93: ingresso por concurso público. Art. 94: promoção por antiguidade e merecimento. Art. 95: vitaliciedade após 2 anos (1ª inst.) ou posse (tribunais); inamovibilidade; irredutibilidade de subsídio. Conteúdo consolidado para provas de concurso público e vestibular, com termos técnicos frequentes em bancas como CESPE, FCC, FGV e Vunesp."},

  {"id":"con-dc-36","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Jurisdição Constitucional Comum — Arts. 96-100 CF/88: Arts. 96-100: competências dos tribunais, criação de juízes e varas por lei complementar, quórum para decisões, súmulas vinculantes (art. 103-A), repercussão geral no RE (art. 102, §3°). Conteúdo consolidado para provas de concurso público e vestibular, com termos técnicos frequentes em bancas como CESPE, FCC, FGV e Vunesp."},

  {"id":"con-dc-37","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — STF — Competências — Art. 102 CF/88: Art. 102: STF — guarda da CF; ADI, ADC, ADPF, ADO; controle concentrado; RE com repercussão geral; habeas corpus contra ato de autoridade; mandado de injunção coletivo; conflitos de competência; extradição; revisão criminal. Conteúdo consolidado para provas de concurso público e vestibular, com termos técnicos frequentes em bancas como CESPE, FCC, FGV e Vunesp."},

  {"id":"con-dc-38","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Justiça do Trabalho — Arts. 111-116 CF/88: Arts. 111-116: TST, TRTs, juízes do trabalho; competência para dissídios individuais e coletivos; dissídio coletivo de greve; inquérito para falta grave; execução de contribuições sindicais. Conteúdo consolidado para provas de concurso público e vestibular, com termos técnicos frequentes em bancas como CESPE, FCC, FGV e Vunesp."},

  {"id":"con-dc-39","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Contribuições Sociais e Econômicas — Arts. 148-149 CF/88: Art. 148: empréstimo compulsório (União, LC, calamidade ou guerra). Art. 149: contribuições sociais, intervenção no domínio econômico, interesse de categorias profissionais — competência exclusiva União. Conteúdo consolidado para provas de concurso público e vestibular, com termos técnicos frequentes em bancas como CESPE, FCC, FGV e Vunesp."},

  {"id":"con-dc-40","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Limitações ao Poder de Tributar — Art. 150 CF/88: Art. 150: vedações — tributar rendas de templo, patrimônio partidos, livros, papel, fonogramas, serviços exportação; não usar tributo com efeito de confisco; não instituir diferença tributária por motivo de raça, sexo, etc."},

  {"id":"con-dc-41","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Impostos da União — Arts. 153-154 CF/88: Art. 153: impostos federais — importação, exportação, renda e proventos (IR), produtos industrializados (IPI), operações financeiras (IOF), grandes fortunas (não instituído). Art. 154: impostos dos Estados — transmissão causa mortis, doação, ICMS, IPVA."},

  {"id":"con-dc-42","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Impostos Municipais — Art. 156 CF/88: Art. 156: IPTU (territorial, progressivo), ITBI (transmissão inter vivos imóveis), ISS (serviços de qualquer natureza). Competência municipal exclusiva. Conteúdo consolidado para provas de concurso público e vestibular, com termos técnicos frequentes em bancas como CESPE, FCC, FGV e Vunesp."},

  {"id":"con-dc-43","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — República e Forma de Governo — Arts. 14-16 Direitos Políticos Detalhe: Sistema presidencialista: Presidente chefe de Estado e governo. Federação: autonomia dos entes. Separação de poderes. Sufrágio universal. Pluralismo político. Eleições periódicas a cada 4 anos para executivo e legislativo federal."},

  {"id":"con-dc-44","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Previdência Social — Arts. 194-195 CF/88: Art. 194: previdência social — caráter contributivo e filiação obrigatória, salvo atividade doméstica. Art. 195: financiamento por contribuições sociais de empregador, empresa, trabalhador e receita de concursos de prognósticos."},

  {"id":"con-dc-45","area":"Concursos","disciplina":"Direito Constitucional","namespace":"concursos_direito_constitucional",
   "texto":"Concursos Direito Constitucional — Assistência Social — Art. 203 CF/88: Art. 203: assistência social prestada a quem dela necessitar, independente de contribuição — LOAS (Lei 8.742/93), BPC idoso e pessoa com deficiência, programas de transferência de renda, proteção a crianças e adolescentes em situação de risco."},

  # ══════════════════════════════════════════════════════
  # MATÉRIA EXTRA: DIREITO PENAL
  # ══════════════════════════════════════════════════════

  {"id":"con-dp-01","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Teoria Geral do Crime: crime é fato típico, ilícito e culpável. Tipicidade material e formal, antijuridicidade e culpabilidade. Dolo e culpa, crime doloso e culposo, tentativa, consumação e crime impossível."},
  {"id":"con-dp-02","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Tipicidade: elemento objetivo do crime. Fato típico composto por conduta, resultado naturalístico, nexo causal e tipicidade. Crime comissivo por ação, crime omissivo próprio e impróprio, conduta comissiva e omissiva."},
  {"id":"con-dp-03","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Ilicitude: exclusão da ilicitude por estado de necessidade, legítima defesa, estrito cumprimento do dever legal e exercício regular de direito. Legítima defesa exige reação atual, moderada e proporcional."},
  {"id":"con-dp-04","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Culpabilidade: imputabilidade, potencial consciência da ilicitude e exigibilidade de conduta diversa. Erro de tipo, erro de proibição e inexigibilidade de conduta diversa no crime culposo e doloso."},
  {"id":"con-dp-05","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Dolo e Culpa: dolo direto e eventual; culpa consciente e inconsciente. Crime doloso exige vontade de praticar o resultado ou assumi-lo; culpa exige violação do dever de cuidado com previsibilidade e evitabilidade."},
  {"id":"con-dp-06","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Crime Doloso e Culposo: crime doloso apresenta vontade de agir com resultado proibido; culposo ocorre por imprudência, negligência ou imperícia sem vontade do resultado. Exemplo: homicídio doloso versus culposo na direção veicular."},
  {"id":"con-dp-07","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Consumação e Tentativa: crime consumado ocorre quando todos os elementos do tipo se realizam. Tentativa ocorre quando o agente inicia execução e não se consuma por circunstâncias alheias à vontade do autor (art. 14, II CP)."},
  {"id":"con-dp-08","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Crime Impossível: excludente de punibilidade quando o meio empregado é inepto ou o resultado impossível, conforme art. 17, II CP. Inidoneidade do meio e ilicitude do objeto impedem a consumação."},
  {"id":"con-dp-09","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Concurso de Pessoas: pluralidade de agentes. Autoria e participação assentadas em divisão de tarefas. Concurso material (vários delitos), concurso formal (mesmo delito por várias condutas) e crime continuado (várias condutas em continuidade delitiva)."},
  {"id":"con-dp-10","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Concurso Material, Formal e Crime Continuado: concurso material = vários crimes com várias ações; concurso formal = uma ação que viola várias normas; crime continuado = pluralidade de condutas semelhantes com unidade de desígnio e identidade de vítimas."},
  {"id":"con-dp-11","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Crime Preterdoloso: conduta dolosa seguida de resultado culposo mais grave. Exemplo: lesão corporal grave seguida de morte não planejada. Doloso no primeiro ato, culposo no resultado posterior."},
  {"id":"con-dp-12","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Crime Hediondo: crimes tipificados como hediondos pela Lei 8.072/1990 com regime mais severo, sem anistia, graça ou indulto. Exemplos: homicídio qualificado, latrocínio, extorsão qualificada pela morte."},
  {"id":"con-dp-13","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Homicídio Simples e Qualificado: homicídio simples art. 121 CP, quando mata alguém sem qualificadora. Homicídio qualificado usa meio cruel, motivo torpe, recurso que dificulta defesa ou feminicídio; majorantes podem aumentar pena."},
  {"id":"con-dp-14","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Homicídio Privilegiado e Culposo: homicídio privilegiado tem motivo de relevante valor social ou moral, ou emoção violenta decorrente de injusta provocação. Homicídio culposo por imprudência, negligência ou imperícia, sem intenção de matar."},
  {"id":"con-dp-15","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Lesões Corporais: art. 129 CP define lesão corporal como ofensa à integridade física ou saúde. Lesão leve, grave e gravíssima, com agravantes como incapacidade para as ocupações habituais por mais de 30 dias e perigo de morte."},
  {"id":"con-dp-16","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Crimes Contra o Patrimônio — Furto: art. 155 CP define furto como subtrair coisa alheia móvel para si ou terceiro. Furto qualificado por destruição, abuso de confiança, ou para facilitar outro crime."},
  {"id":"con-dp-17","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Roubo: art. 157 CP descreve roubo como subtração com violência ou grave ameaça. Roubo majorado ocorre com emprego de arma, concurso de pessoas, restrição de liberdade da vítima ou se resulta em lesão corporal."},
  {"id":"con-dp-18","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Extorsão: art. 158 CP — exigir vantagem mediante violência ou grave ameaça. Extorsão indireta e exação mediante violência; majorantes incluem restrição de liberdade e concurso de agentes."},
  {"id":"con-dp-19","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Estelionato: art. 171 CP — obter vantagem ilícita dando à vítima erro mediante fraude. Caracteriza-se por fraude, indução ao erro, prejuízo patrimonial e vontade de obter vantagem indevida."},
  {"id":"con-dp-20","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Apropriação Indébita: art. 168 CP — apropriar-se de coisa alheia móvel de que se tem a posse ou detenção. Difere do furto por início lícito da posse, seguida de desvio patrimonial."},
  {"id":"con-dp-21","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Dano ao Patrimônio: art. 163 CP — destruir, inutilizar ou deteriorar bem alheio. Dano qualificado por emprego de substância inflamável, explosiva ou se resulta em perigo para a vida ou integridade física."},
  {"id":"con-dp-22","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Crimes Contra a Honra: calúnia (art. 138 CP), difamação (art. 139 CP) e injúria (art. 140 CP). Distinção importante entre imputar fato criminoso e ofender a dignidade ou decoro."},
  {"id":"con-dp-23","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Crimes Contra a Fé Pública: crimes de moeda falsa (arts. 289-295 CP), falsificação de documento público ou particular (arts. 297-302 CP), e uso de documento falso. Exigem aparência de autenticidade e finalidade de criação de confiança indevida."},
  {"id":"con-dp-24","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Crimes Contra a Administração Pública: corrupção ativa (art. 333 CP), corrupção passiva (art. 317 CP), peculato (art. 312 CP), concussão (art. 316 CP), prevaricação (art. 319 CP), advocacia administrativa (art. 321 CP)."},
  {"id":"con-dp-25","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Peculato: art. 312 CP — apropriar-se de recurso público por quem o administra. Peculato culposo e mediante erro de outrem, com pena reduzida por colaboração efetiva."},
  {"id":"con-dp-26","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Concussão e Extorsão Mediante Excesso de Exação: concussão (art. 316 CP) exige servidor exigir vantagem indevida; excessos de exação ocorrem quando cobra mais do que o direito, com violência ou grave ameaça."},
  {"id":"con-dp-27","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Prevaricação e Advocacia Administrativa: prevaricação (art. 319 CP) é retardar ou deixar de praticar ato de ofício para satisfazer interesse pessoal; advocacia administrativa (art. 321 CP) é patrocinar interesse privado perante a administração pública, sendo servidor público ou agente a ele equiparado."},
  {"id":"con-dp-28","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Crimes Contra a Administração da Justiça: desobediência (art. 330 CP), desacato (art. 331 CP), denunciação caluniosa (art. 339 CP), falso testemunho (art. 342 CP). Caracteriza-se por ofender a atividade jurisdicional e sua confiança."},
  {"id":"con-dp-29","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Crimes Sexuais: estupro (art. 213 CP), atentado violento ao pudor (art. 214 CP), importunação sexual (art. 215-A CP), exploração sexual de vulnerável (art. 217-A CP). Tipicidade depende de violência, grave ameaça ou vulnerabilidade da vítima."},
  {"id":"con-dp-30","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Tráfico de Drogas: art. 33 da Lei 11.343/2006 define tráfico, associação e uso. Diferenças entre usuário e traficante com base na quantidade, conduta e indícios de comercialização. Pena pode ser aumentada por organização criminosa."},
  {"id":"con-dp-31","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Lavagem de Dinheiro: art. 1º da Lei 9.613/1998 descreve ocultar origem de recursos ilícitos. Operações financeiras, transações em espécie, mercado de câmbio, bens e serviços podem ser usados para dissimular o crime antecedente."},
  {"id":"con-dp-32","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Medidas de Segurança: previstas no art. 96 do CP para inimputáveis e semi-imputáveis que cometerem crime por doença mental ou desenvolvimento incompleto. Internação em hospital de custódia ou tratamento ambulatorial sob guarda."},
  {"id":"con-dp-33","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Prisão em Flagrante e Auto de Prisão: Art. 301 CPP define prisão em flagrante. Tipos: flagrante próprio, impróprio e esperado. Auto de prisão deverá ser lavrado e comunicado à autoridade judicial em 24 horas."},
  {"id":"con-dp-34","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Liberdade Provisória e Medidas Cautelares: prisão preventiva, prisão temporária, fiança, monitoração eletrônica, proibição de contato e de frequentar certos lugares. Requisitos: prova da materialidade e indícios suficientes de autoria, necessidade da medida."},
  {"id":"con-dp-35","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Direitos do Preso: presunção de inocência, comunicação imediata da prisão a autoridade competente, advogado, família e consulado. Visita íntima, médico, assistência jurídica e alimentação digna garantidos pela Constituição e pelo CPP."},
  {"id":"con-dp-36","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Execução Penal e Regimes de Cumprimento: regimes fechado, semiaberto e aberto. Benefícios de progressão de regime, trabalho e estudo, livramento condicional e indulto. Lei de Execução Penal regula direitos dos presos e ressocialização."},
  {"id":"con-dp-37","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Legítima Defesa e Estado de Necessidade: legítima defesa (art. 25 CP) exige defesa atual de injustiça, uso moderado de meios e preservação de direitos. Estado de necessidade (art. 24 CP) justifica sacrifício de bem jurídico menor para salvar direito próprio ou alheio."},
  {"id":"con-dp-38","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Erro de Tipo e Erro de Proibição: erro de tipo vicia o elemento objetivo do tipo penal; erro de proibição pode excluir culpabilidade se o agente não conhece a ilicitude ou acha que age em estrito cumprimento do dever."},
  {"id":"con-dp-39","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Coação Moral Irresistível e Obediência Hierárquica: coação moral irresistível (art. 22 CP) exonera o agente; obediência hierárquica não é causa de exclusão de ilicitude, salvo nas hipóteses do art. 23 do CP (estrito cumprimento do dever legal)."},
  {"id":"con-dp-40","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Resultado Naturalístico e Nexo de Causalidade: o resultado deve ser naturalístico previsto no tipo. Nexo de causalidade exige a conduta como causa necessária e adequada do resultado, admitindo teoria da equivalência dos antecedente."},
  {"id":"con-dp-41","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Ação Penal Pública, Privada e Condicionada: ação penal pública incondicionada (PGR), condicionada à representação ou requisição, e privada (ofendido ou representante). Prazos de prescrição e legitimidade ativa variam conforme o crime."},
  {"id":"con-dp-42","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Prescrição da Ação Penal: prescrição da pretensão punitiva e executória. Regra geral art. 109 CP: pena maior prescreve mais rápido que menor; suspensão condicional do processo não interrompe prescrição, mas pode modificá-la."},
  {"id":"con-dp-43","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Crimes de Perigo Comum e Abstrato: o crime de perigo concreto exige risco efetivo ao bem jurídico; o crime de perigo abstrato pune a simples conduta que, por si só, coloca em risco o bem jurídico, sem necessidade de ocorrência do resultado."},
  {"id":"con-dp-44","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Ameaça e Difamação Eletrônica: art. 147 CP define ameaça; art. 139 define difamação. Na internet, as modalidades digitais configuram crime de forma análoga, com agravantes de divulgação pública e alcance ampliado."},
  {"id":"con-dp-45","area":"Concursos","disciplina":"Direito Penal","namespace":"concursos_direito_penal",
   "texto":"Concursos Direito Penal — Criminalidade Organizada e Organização Criminosa: Lei 12.850/2013 define organização criminosa como associação estruturada e estável para prática de crimes com divisão de tarefas. Investigação e cooperação premiada são instrumentos processuais típicos."},

  # ══════════════════════════════════════════════════════
  # MATÉRIA 3: DIREITO ADMINISTRATIVO
  # ══════════════════════════════════════════════════════

  {"id":"con-da-01","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Princípios LIMPE (Art. 37 CF/88): LEGALIDADE: administração pública só pode fazer o que a lei autoriza (diferente do particular que pode fazer tudo que a lei não proíbe). IMPESSOALIDADE: atos administrativos visam ao interesse público, não ao administrador; os atos são da Administração, não do agente (veda personalismo); vedação à publicidade pessoal de servidor (art. 37, §1°). MORALIDADE: conduta ética, probidade, boa-fé, lealdade — norma jurídica de conduta (não apenas moral comum). PUBLICIDADE: transparência, divulgação dos atos, acesso à informação — atos só produzem efeitos após publicação; exceções: segurança nacional e intimidade. EFICIÊNCIA (EC 19/1998): melhor uso dos recursos, qualidade dos serviços, celeridade, economicidade; inclui avaliação periódica de desempenho. PRINCÍPIOS IMPLÍCITOS: razoabilidade/proporcionalidade, supremacia do interesse público, autotutela (revogar atos inoportunos e anular os ilegais — Súmulas 346 e 473 do STF), continuidade do serviço público, motivação, ampla defesa e contraditório."},

  {"id":"con-da-02","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Atos Administrativos: Manifestação unilateral de vontade da Administração que produz efeitos jurídicos. ELEMENTOS (CFMOF): COMPETÊNCIA (ou sujeito) — quem praticou; FORMA — como foi exteriorizado (escrita, publicação); MOTIVO — pressupostos fáticos e jurídicos; OBJETO — conteúdo do ato; FINALIDADE — resultado visado (sempre interesse público). ATRIBUTOS: PRESUNÇÃO DE LEGITIMIDADE (todos presumem-se legais até prova em contrário — ônus do particular); IMPERATIVIDADE (impõe obrigações independente da vontade do particular); AUTOEXECUTORIEDADE (pode ser executado sem necessidade de autorização judicial). EXTINÇÃO: REVOGAÇÃO — por conveniência e oportunidade, só pela Administração, efeitos ex nunc, apenas atos válidos; ANULAÇÃO — por ilegalidade, pela Administração ou Judiciário, efeitos ex tunc. TIPOS DE ATOS: normativos (decretos, regulamentos), ordinatórios (instruções, circulares), negociais (licença, autorização, permissão, concessão), enunciativos (certidões, atestados, pareceres), punitivos (multa, suspensão, cassação)."},

  {"id":"con-da-03","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Poderes da Administração: PODER HIERÁRQUICO: estruturar e organizar os órgãos internos, distribuindo competências, dando ordens, fiscalizando, revendo atos de inferiores — relação de subordinação; não confundir com tutela/vinculação (entre entes). PODER DISCIPLINAR: aplicar sanções internas a agentes públicos e particulares em vínculo especial (contratados) por infrações funcionais — discricionário (escolha da sanção dentro dos limites legais). PODER REGULAMENTAR: editar atos normativos secundários para fiel execução das leis — regulamentos, instruções normativas, portarias — não podem criar direitos ou obrigações não previstos em lei (princípio da legalidade). PODER DE POLÍCIA: limitar a liberdade e propriedade individuais em benefício do interesse público — taxas pelo exercício; atributos: discricionariedade, autoexecutoriedade, coercibilidade; ciclo: legislação, consentimento, fiscalização, sanção. Distinção PODER VINCULADO × DISCRICIONÁRIO: vinculado — lei determina único comportamento possível; discricionário — lei confere margem de escolha (conveniência e oportunidade) — mérito administrativo, não sindicável pelo Judiciário."},

  {"id":"con-da-04","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Organização Administrativa: CENTRALIZAÇÃO: atividade exercida diretamente pela Administração Direta (entes políticos: União, Estados, DF, Municípios). DESCENTRALIZAÇÃO: transferência de atividade a outra pessoa jurídica — POR SERVIÇO (outorga/legal): criação de entidade da Administração Indireta por lei (autarquia, fundação pública, empresa pública, SEM); POR COLABORAÇÃO (delegação/contratual): particulares prestam serviços públicos (concessão, permissão, autorização). CONCENTRAÇÃO: atividade numa única unidade sem divisão interna. DESCONCENTRAÇÃO: distribuição interna de competências dentro da mesma pessoa jurídica (criação de órgãos). ENTIDADES DA ADMINISTRAÇÃO INDIRETA: AUTARQUIA — pessoa jurídica de direito público, criada por lei, atividades típicas do Estado (INSS, BACEN, ANATEL). FUNDAÇÃO PÚBLICA — pode ser de direito público (criada por lei) ou privado (autorizada por lei). EMPRESA PÚBLICA — capital exclusivamente público, qualquer forma societária (Caixa, Correios). SOCIEDADE DE ECONOMIA MISTA — capital misto, forma obrigatoriamente S.A., controle acionário público (Petrobras, Banco do Brasil). Empresas públicas e SEM: regime híbrido — sujeitas ao direito privado, mas com derrogações publicísticas."},

  {"id":"con-da-05","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Servidores Públicos — Lei 8.112/1990: Regime Jurídico Único dos servidores civis federais. CARGO PÚBLICO: conjunto de atribuições e responsabilidades criado por lei, com denominação própria e vencimento pago pelos cofres públicos. PROVIMENTO (art. 8°): ORIGINÁRIO — nomeação (único forma originária); DERIVADO — promoção, readaptação, reversão, aproveitamento, reintegração, recondução. VACÂNCIA (art. 33): exoneração (a pedido ou de ofício), demissão, promoção, readaptação, aposentadoria, falecimento, posse em outro cargo inacumulável. ESTABILIDADE (art. 41 CF): após 3 anos de efetivo exercício; perda: sentença judicial transitada em julgado, PAD, avaliação periódica insatisfatória (EC 19), insuficiência de desempenho. REMUNERAÇÃO: vencimento (parcela fixa) + vantagens. Vedação ao acúmulo (art. 37, XVI CF): regra geral — proibido; exceções: dois cargos de professor, cargo de professor + técnico ou científico, dois cargos privativos de profissionais de saúde — desde que compatíveis os horários e respeito ao teto constitucional."},

  {"id":"con-da-06","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Licitações: Lei 14.133/2021 (Nova Lei de Licitações) — revogou gradualmente a Lei 8.666/93 e a Lei 10.520/02 (Pregão). MODALIDADES (art. 28): CONCORRÊNCIA — qualquer valor, obras e serviços de engenharia acima de R$3,3 mi e demais acima de R$1,43 mi; CONCURSO — escolha de trabalho técnico, científico ou artístico; LEILÃO — alienação de bens ou concessões; PREGÃO — aquisição de bens e serviços comuns (qualquer valor); DIÁLOGO COMPETITIVO — inovações tecnológicas complexas. CRITÉRIOS DE JULGAMENTO (art. 33): menor preço, maior desconto, melhor técnica ou conteúdo artístico, técnica e preço, maior lance (leilão), maior retorno econômico. DISPENSA (art. 75): casos taxativos — emergência, valor abaixo dos limiares (obras até R$100 mil; outros até R$50 mil). INEXIGIBILIDADE (art. 74): quando inviável a competição — fornecedor exclusivo, serviços técnicos singulares, artistas consagrados. FASES DO PROCESSO (art. 17): preparatória, de divulgação, de apresentação de propostas, de julgamento, de habilitação, recursal, de homologação."},

  {"id":"con-da-07","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Improbidade Administrativa — Lei 8.429/1992 (alterada pela Lei 14.230/2021): ATO DE IMPROBIDADE: ato doloso de agente público que importe enriquecimento ilícito (art. 9°), dano ao erário (art. 10), ou violação aos princípios da administração pública (art. 11). ENRIQUECIMENTO ILÍCITO (art. 9°): auferir vantagem patrimonial indevida. DANO AO ERÁRIO (art. 10°): ação ou omissão dolosa que cause perda patrimonial — inclui lesão em contratos, concessões, uso irregular. VIOLAÇÃO AOS PRINCÍPIOS (art. 11°): ato que viole os deveres de honestidade, imparcialidade, legalidade e lealdade às instituições. SANÇÕES (art. 12): perda dos bens ou valores acrescidos ilicitamente, ressarcimento integral do dano, perda da função pública, suspensão dos direitos políticos (8 a 14 anos para art. 9°; 5 a 12 para art. 10°; 3 a 6 para art. 11°), multa civil e proibição de contratar com o Poder Público. PRESCRIÇÃO (art. 23, redação dada pela Lei 14.230/2021): 8 anos a partir do fato; imprescritível para ressarcimento do erário em caso de condenação (art. 37, §5° CF — questão controversa)."},

  {"id":"con-da-08","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Controle da Administração Pública: CONTROLE INTERNO: exercido pelos próprios órgãos da Administração sobre seus atos — prévio (antes da prática), concomitante (durante) e subsequente (após); inclui auditoria interna. CONTROLE EXTERNO DO CONGRESSO: auxílio do TCU (art. 71 CF) — apreciar contas do Presidente, julgar contas dos administradores de recursos federais, fiscalizar contratos, aplicar sanções. CONTROLE JUDICIAL: judiciário controla a legalidade dos atos (não o mérito); meios: mandado de segurança (direito líquido e certo, art. 5°, LXIX), ação popular (cidadão — ato lesivo ao patrimônio público, art. 5°, LXXIII), ação civil pública (MP e outros legitimados). CONTROLE PARLAMENTAR DIRETO: CPIs (art. 58, §3° CF — poderes investigatórios equiparados ao Judiciário — não podem decretar prisão, mas podem convocar, intimar e requisitar documentos); aprovação de indicações (SF — art. 52). AUTOTUTELA: Administração revê os próprios atos por ilegalidade (anulação) ou conveniência (revogação) — Súmulas 346 e 473 do STF."},

  {"id":"con-da-09","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Processo Administrativo — Lei 9.784/1999: ÂMBITO: Administração Pública Federal Direta e Indireta. PRINCÍPIOS (art. 2°): legalidade, finalidade, motivação, razoabilidade, proporcionalidade, moralidade, ampla defesa, contraditório, segurança jurídica, interesse público, eficiência. DIREITOS DO ADMINISTRADO (art. 3°): ser tratado com respeito, ciência da tramitação, formular alegações e apresentar documentos, fazer-se assistir. DEVERES (art. 4°): expor fatos conforme a verdade, proceder com lealdade. INÍCIO (art. 5°): de ofício ou por provocação de interessado. FASES: instauração, instrução (diligências, provas, pareceres), decisão, recursos. RECURSOS: prazo de 10 dias; 3 instâncias administrativas (regra). PRAZOS (art. 66): 5 dias para os atos, salvo motivo de força maior. MOTIVAÇÃO (art. 50): obrigatória nos atos que: neguem, limitem ou afetem direitos, imponham deveres, apliquem sanções, etc. ANULAÇÃO (art. 54): processo administrativo — 5 anos para anular atos que geraram efeitos favoráveis ao administrado (decadência), salvo má-fé."},

  {"id":"con-da-10","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Responsabilidade Civil do Estado: Art. 37, §6° CF/88: pessoas jurídicas de direito público e de direito privado prestadoras de serviços públicos respondem pelos danos causados por seus agentes a terceiros — RESPONSABILIDADE OBJETIVA (independe de culpa). TEORIA DO RISCO ADMINISTRATIVO: basta o nexo de causalidade entre o ato e o dano (fato, nexo, dano). EXCLUDENTES: culpa exclusiva da vítima, caso fortuito ou força maior, culpa de terceiro. RESPONSABILIDADE POR OMISSÃO: divergência — posição majoritária: SUBJETIVA (exige dolo ou culpa — falta do serviço — faute du service); posição do STF em alguns julgados: objetiva quando há dever específico de agir. AÇÃO REGRESSIVA: o Estado pode cobrar do agente que causou o dano com dolo ou culpa (art. 37, §6°, in fine). RESPONSABILIDADE POR ATOS JUDICIAIS: regra — irresponsabilidade; exceção — erro judiciário e prisão além do tempo fixado (art. 5°, LXXV CF). RESPONSABILIDADE LEGISLATIVA: regra — irresponsabilidade; exceção — lei inconstitucional que cause dano específico e anormal."},

  {"id":"con-da-11","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Bens Públicos e LAI: BENS PÚBLICOS (arts. 98-103 CC/2002): bens do domínio nacional pertencentes às pessoas jurídicas de direito público. CLASSIFICAÇÃO: USO COMUM DO POVO — acesso geral, gratuito (praças, rios, mar territorial); USO ESPECIAL — afetados a serviço ou estabelecimento público (repartições, hospitais públicos, viaturas); DOMINICAIS (dominiais) — sem destinação pública específica, patrimônio disponível (imóveis devolutor, Dívida Ativa). CARACTERÍSTICAS: INALIENABILIDADE RELATIVA — bens de uso comum e especial enquanto afetados; dominicais são alienáveis; IMPRESCRITIBILIDADE — não adquiridos por usucapião (art. 183, §3° e 191, par. único CF; art. 102 CC); IMPENHORABILIDADE — não podem ser objeto de penhora; IMPOSSIBILIDADE DE ONERAÇÃO — não podem ser dados em garantia. LEI 12.527/2011 — LEI DE ACESSO À INFORMAÇÃO (LAI): qualquer pessoa pode solicitar informações públicas sem justificativa; prazo de resposta: 20 dias + 10 de prorrogação; hipóteses de sigilo: ultrassecreta (25 anos), secreta (15 anos), reservada (5 anos); recursos hierárquicos e à CGU."},

  {"id":"con-da-12","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — PAD e Regime Disciplinar (Lei 8.112/90): PROCESSO ADMINISTRATIVO DISCIPLINAR (PAD — arts. 148-182): instrumento para apurar irregularidades praticadas por servidores federais. FASES: INSTAURAÇÃO (portaria — designa comissão de 3 membros estáveis), INQUÉRITO (instrução — citação do indiciado, defesa escrita, relatório da comissão) e JULGAMENTO (pela autoridade competente). SINDICÂNCIA: apuração sumária — prazo de 30 dias prorrogável; pode resultar em arquivamento, punição (advertência ou suspensão até 30 dias) ou instauração de PAD. PENALIDADES (art. 127): advertência, suspensão (até 90 dias), demissão, cassação de aposentadoria ou disponibilidade, destituição de cargo em comissão/função comissionada. DEMISSÃO (art. 132): crimes contra a AP, improbidade, aplicação irregular de verbais, lesão aos cofres públicos, corrupção, abandono de cargo (mais de 30 dias), inassiduidade habitual, violação de deveres. PRESCRIÇÃO (art. 142): 5 anos para demissão, cassação e destituição; 2 anos para suspensão; 180 dias para advertência."},

  {"id":"con-da-13","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Serviço Público — Conceito e Princípios: Serviço público: atividade prestada pela Administração ou por delegatário em favor do cidadão. Princípios: continuidade, modicidade tarifária, adequação, eficiência. Classificação: exclusivo de Estado, delegável, ou atividade econômica em sentido estrito."},

  {"id":"con-da-14","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Agentes Públicos — Classificação: Agentes públicos: pessoas que exercem funções estatais. Espécies: políticos (Presidente, ministros); administrativos estatutários (Lei 8.112/90); temporários (art. 37, IX CF); celetistas (empresas públicas, SEM); delegados (concessionários); colaboradores eventuais."},

  {"id":"con-da-15","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Concurso Público — Art. 37, II CF/88: Art. 37, II: investidura em cargo ou emprego público depende de aprovação prévia em concurso de provas ou provas e títulos. Requisitos: publicidade, isonomia, prazo de validade (2 anos prorrogável), reserva de vagas PcD e negros (Lei 8.112/90 e LC 142/2013)."},

  {"id":"con-da-16","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Terceirização e Terceirização de Atividade-Fim: Lei 13.429/2017 e reforma trabalhista: terceirização de qualquer atividade, inclusive atividade-fim. Responsabilidade subsidiária da Administração (Súmula 331 TST em contratos privados; art. 121 Lei 14.133/21 em contratos públicos)."},

  {"id":"con-da-17","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Contratos Administrativos — Lei 14.133/21: Contrato administrativo: acordo entre Administração e particular para execução de objeto. Cláusulas exorbitantes: alteração unilateral, rescisão unilateral, fiscalização, reequilíbrio econômico-financeiro, prerrogativa da Administração. Formalização obrigatória por escrito."},

  {"id":"con-da-18","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Concessão, Permissão e Autorização: Concessão: delegação por licitação, contrato, usuário paga tarifa (rodovias, energia). Permissão: ato unilateral, precário, serviço público (ônibus). Autorização: ato discricionário, uso privado de bem público (quiosque). Lei 8.987/95 — serviços públicos."},

  {"id":"con-da-19","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Desapropriação Administrativa: Desapropriação: transferência compulsória de propriedade privada para o Estado por utilidade pública ou interesse social, mediante indenização prévia em dinheiro. Procedimento: decreto expropriatório, avaliação, ação judicial se não houver acordo. Arts. 5°, XXIV e 184 CF."},

  {"id":"con-da-20","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Utilidade Pública e Ordem Pública: Utilidade pública: interesse coletivo que justifica limitação à propriedade. Ordem pública: conjunto de normas que preservam a convivência social — poder de polícia. Distinção: utilidade pública frequentemente vinculada à desapropriação; ordem pública ao poder de polícia."},

  {"id":"con-da-21","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Taxas Administrativas — Art. 145, II CF/88: Taxa: tributo vinculado a atividade estatal específica e divisível — poder de polícia (taxa de fiscalização) ou serviço público específico e divisível (taxa de coleta de lixo). Não pode ter fato gerador idêntico ao de imposto."},

  {"id":"con-da-22","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Delegação e Avocação: Delegação: transferência de competência entre órgãos não hierarquicamente subordinados — atos vinculados, vedada a delegação de competência exclusiva. Avocação: exercício temporário de competência de órgão inferior pelo superior — excepcional, motivada."},

  {"id":"con-da-23","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Substituição e Revisão de Atos: Substituição: agente substituto legal exerce competência do titular. Revisão de ofício: Administração reexamina ato ilegal ou inoportuno — autotutela. Decadência administrativa: 5 anos para anular ato favorável (Lei 9.784/99, art. 54)."},

  {"id":"con-da-24","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Sindicabilidade e Controle Judicial do Mérito: Mérito administrativo: conveniência e oportunidade — não controlável pelo Judiciário (art. 5°, XXXV — inafastabilidade limitada à legalidade). Controle judicial: legalidade, competência, forma, motivo, objeto, finalidade."},

  {"id":"con-da-25","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Lei 8.666/93 — Disposições Remanescentes: Lei 8.666/93 revogada em grande parte pela Lei 14.133/21, mas ainda aplicável a contratos anteriores e alguns entes. Princípios: isonomia, legalidade, impessoalidade, moralidade, publicidade, probidade, vinculação ao edital, julgamento objetivo."},

  {"id":"con-da-26","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Pregão Eletrônico — Histórico: Pregão: modalidade para bens e serviços comuns — lances em sessão pública. Lei 10.520/02 incorporada à Lei 14.133/21. Fase de lances; inversão de fases (julgamento antes da habilitação) era marca do pregão. Conteúdo consolidado para provas de concurso público e vestibular, com termos técnicos frequentes em bancas como CESPE, FCC, FGV e Vunesp."},

  {"id":"con-da-27","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Parcerias com OSCIP e OS: Lei 9.790/99 (OSCIP) e Lei 13.019/2014 (MROSC — marco regulatório das organizações da sociedade civil): termos de colaboração e fomento, chamamento público, prestação de contas, comissão de avaliação. Conteúdo consolidado para provas de concurso público e vestibular, com termos técnicos frequentes em bancas como CESPE, FCC, FGV e Vunesp."},

  {"id":"con-da-28","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Consórcios Públicos — Lei 11.107/05: Consórcio público: associação de entes para realização de objetivos de interesse comum — convênio ou contrato de consórcio. Consórcio intermunicipal: associação de municípios. Personalidade jurídica própria quando constituído por lei."},

  {"id":"con-da-29","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Agências Reguladoras: Agências reguladoras: autarquias especiais com autonomia reforçada — ANATEL, ANEEL, ANATEL, ANVISA, ANS. Regulação econômica setorial: tarifas, qualidade, fiscalização de mercados regulados. Mandatos fixos dos diretores. Conteúdo consolidado para provas de concurso público e vestibular, com termos técnicos frequentes em bancas como CESPE, FCC, FGV e Vunesp."},

  {"id":"con-da-30","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Poder Hierárquico vs Poder de Tutela: Hierarquia: relação interna entre órgãos da mesma pessoa jurídica — ordens, fiscalização, revisão. Tutela: controle de entes descentralizados pelo ente político — tutela administrativa sobre autarquias e fundações. Conteúdo consolidado para provas de concurso público e vestibular, com termos técnicos frequentes em bancas como CESPE, FCC, FGV e Vunesp."},

  {"id":"con-da-31","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Agentes Públicos — Responsabilização: Responsabilidade civil (indenizar terceiro), penal (crime funcional — Lei 8.429, CP), administrativa (sanções disciplinares). Teoria do risco administrativo para danos a terceiros; ação regressiva contra agente com dolo ou culpa."},

  {"id":"con-da-32","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Acumulação de Cargos — Art. 37, XVI CF/88: Vedação geral à acumulação remunerada de cargos públicos. Exceções: dois cargos de professor; professor + técnico/científico; dois cargos de saúde — compatibilidade de horários e teto constitucional (art. 37, XI). Conteúdo consolidado para provas de concurso público e vestibular, com termos técnicos frequentes em bancas como CESPE, FCC, FGV e Vunesp."},

  {"id":"con-da-33","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Teto Remuneratório — Art. 37, XI CF/88: Subsídio do Presidente da República como teto para União, Estados, DF e Municípios. EC 41/2003 e EC 47/2005: limites a aposentadorias e pensões no setor público. Vedação de vinculação ou equiparação para efeito de remuneração."},

  {"id":"con-da-34","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Aposentadoria de Servidores — Regras: EC 103/2019: reforma da previdência — idade mínima, tempo de contribuição, pedágio 50% e 100% para regras de transição. Servidor público: RPPS próprio; aposentadoria compulsória aos 75 anos (EC 88/2015). Conteúdo consolidado para provas de concurso público e vestibular, com termos técnicos frequentes em bancas como CESPE, FCC, FGV e Vunesp."},

  {"id":"con-da-35","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Férias e Licenças — Lei 8.112/90: Férias: 30 dias após 12 meses de exercício, acrescidas de 1/3 constitucional. Licenças: capacitação, tratamento de saúde, gestante (120 dias), paternidade, gala, nojo, acidente em serviço, amamentação. Conteúdo consolidado para provas de concurso público e vestibular, com termos técnicos frequentes em bancas como CESPE, FCC, FGV e Vunesp."},

  {"id":"con-da-36","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Progressão e Promoção Funcional: Promoção: mudança de classe ou padrão com mudança de cargo. Progressão: evolução na mesma classe por antiguidade ou merecimento. Avaliação de desempenho como critério (EC 19/98). Conteúdo consolidado para provas de concurso público e vestibular, com termos técnicos frequentes em bancas como CESPE, FCC, FGV e Vunesp."},

  {"id":"con-da-37","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Estágio e Contrato Temporário: Estágio: Lei 11.788/2014 — estudantes, sem vínculo empregatício, bolsa e seguro. Contrato temporário: art. 37, IX CF — excepcional interesse público, prazo determinado, funções de exceção (Lei 8.745/93). Conteúdo consolidado para provas de concurso público e vestibular, com termos técnicos frequentes em bancas como CESPE, FCC, FGV e Vunesp."},

  {"id":"con-da-38","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Domínio Público e Afetação: Afetação: destinação de bem público a finalidade específica de serviço público. Desafetação: retirada da destinação — bem dominical passa a alienável. Bens de uso comum do povo e especiais: inalienáveis enquanto afetados. Conteúdo consolidado para provas de concurso público e vestibular, com termos técnicos frequentes em bancas como CESPE, FCC, FGV e Vunesp."},

  {"id":"con-da-39","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Zoneamento Urbano e Poder de Polícia: Poder de polícia urbanístico: zoneamento, uso do solo, licenças de construção, embargo de obra irregular. Estatuto da Cidade (Lei 10.257/2001): função social da propriedade urbana, IPTU progressivo, desapropriação-sanção. Conteúdo consolidado para provas de concurso público e vestibular, com termos técnicos frequentes em bancas como CESPE, FCC, FGV e Vunesp."},

  {"id":"con-da-40","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Responsabilidade por Omissão Estatal: Teoria da culpa administrativa (faute du service): Estado responde quando omite serviço que deveria prestar (falta de policiamento, fiscalização). STF: em regra subjetiva para omissão; objetiva quando dever legal específico de agir."},

  {"id":"con-da-41","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Prescrição e Decadência Administrativa: Prescrição: perda do direito de punir (disciplinar — 5 anos demissão). Decadência: perda do poder de anular ato favorável — 5 anos (Lei 9.784/99). Improbidade: 8 anos (Lei 8.429/92, art. 23). Conteúdo consolidado para provas de concurso público e vestibular, com termos técnicos frequentes em bancas como CESPE, FCC, FGV e Vunesp."},

  {"id":"con-da-42","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Controle de Constitucionalidade dos Atos Administrativos: Controle difuso: juiz pode declarar inconstitucionalidade de lei aplicada ao caso. Controle concentrado: STF em ADI. Atos administrativos ilegais: anuláveis; atos contra CF: inconstitucionais. Conteúdo consolidado para provas de concurso público e vestibular, com termos técnicos frequentes em bancas como CESPE, FCC, FGV e Vunesp."},

  {"id":"con-da-43","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Mandado de Segurança Administrativo: MS: protege direito líquido e certo contra ato de autoridade. Prazo decadencial: 120 dias da ciência do ato. MS coletivo: partido, sindicato, entidade de classe. Não cabe contra lei em tese. Conteúdo consolidado para provas de concurso público e vestibular, com termos técnicos frequentes em bancas como CESPE, FCC, FGV e Vunesp."},

  {"id":"con-da-44","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Ação Popular e Ação Civil Pública: Ação popular (art. 5°, LXXIII): qualquer cidadão anula ato lesivo ao patrimônio público. ACP (Lei 7.347/85): MP, Defensoria, associações — danos ao meio ambiente, consumidor, patrimônio público. Conteúdo consolidado para provas de concurso público e vestibular, com termos técnicos frequentes em bancas como CESPE, FCC, FGV e Vunesp."},

  {"id":"con-da-45","area":"Concursos","disciplina":"Direito Administrativo","namespace":"concursos_direito_administrativo",
   "texto":"Concursos Direito Administrativo — Lei 9.784/99 — Recursos Administrativos: Recurso hierárquico próprio: 10 dias, decisão em 30 dias. Reexame necessário: quando decisão de autoridade delegada contraria entendimento da lei. Silêncio administrativo: positivo ou negativo conforme matéria. Conteúdo consolidado para provas de concurso público e vestibular, com termos técnicos frequentes em bancas como CESPE, FCC, FGV e Vunesp."},

  # ══════════════════════════════════════════════════════
  # MATÉRIA 4: RACIOCÍNIO LÓGICO (concursos_rlm)
  # ══════════════════════════════════════════════════════

  {"id":"con-rl-01","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocínio Lógico — Proposições e Valor Lógico: PROPOSIÇÃO: sentença declarativa com valor lógico definido (verdadeiro V ou falso F). Não são proposições: exclamações, perguntas, ordens, frases sem sujeito. PROPOSIÇÃO SIMPLES: não contém conectivo lógico (p, q, r...). PROPOSIÇÃO COMPOSTA: formada por proposições simples ligadas por conectivos. NEGAÇÃO (~p ou ¬p): inverte o valor lógico; se p=V então ~p=F e vice-versa. PRINCÍPIOS LÓGICOS: IDENTIDADE (p é p); NÃO-CONTRADIÇÃO (p e ~p não podem ser ambas verdadeiras); TERCEIRO EXCLUÍDO (p ou ~p — não há terceira possibilidade). VALOR LÓGICO: cada proposição tem exatamente um valor (V ou F). Operadores e seus nomes: ~ (negação/não), ^ (conjunção/e), v (disjunção inclusiva/ou), ⊕ (disjunção exclusiva/ou...ou, xor), → (condicional/se...então), ↔ (bicondicional/se e somente se)."},

  {"id":"con-rl-02","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocínio Lógico — Conectivos e Tabelas-Verdade: CONJUNÇÃO (p ^ q): verdadeira apenas quando AMBAS são V; F em todos os outros casos (F^F=F; F^V=F; V^F=F; V^V=V). DISJUNÇÃO INCLUSIVA (p v q): falsa apenas quando AMBAS são F; V nos demais casos (F v F=F; F v V=V; V v F=V; V v V=V). DISJUNÇÃO EXCLUSIVA (p ⊕ q): verdadeira apenas quando os valores são DIFERENTES (F⊕F=F; F⊕V=V; V⊕F=V; V⊕V=F). CONDICIONAL (p → q): falsa apenas quando p=V e q=F; 'se p então q' — p=antecedente, q=consequente (F→F=V; F→V=V; V→F=F; V→V=V). BICONDICIONAL (p ↔ q): verdadeira apenas quando ambas têm o MESMO valor lógico (F↔F=V; F↔V=F; V↔F=F; V↔V=V). Número de linhas da tabela-verdade com n variáveis = 2^n."},

  {"id":"con-rl-03","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocínio Lógico — Tautologia, Contradição e Equivalências: TAUTOLOGIA: proposição sempre verdadeira independente dos valores das variáveis (p v ~p; p → p). CONTRADIÇÃO (antilogia): sempre falsa (p ^ ~p). CONTINGÊNCIA: pode ser V ou F dependendo dos valores. EQUIVALÊNCIAS LÓGICAS FUNDAMENTAIS: De Morgan 1: ~(p ^ q) ≡ ~p v ~q (negação da conjunção = disjunção das negações). De Morgan 2: ~(p v q) ≡ ~p ^ ~q (negação da disjunção = conjunção das negações). CONTRAPOSITIVA: (p → q) ≡ (~q → ~p) — fundamental para questões de provas. DUPLA NEGAÇÃO: ~~p ≡ p. CONDICIONAL: (p → q) ≡ (~p v q) ≡ ~(p ^ ~q). BICONDICIONAL: (p ↔ q) ≡ (p → q) ^ (q → p). Associatividade: (p ^ q) ^ r ≡ p ^ (q ^ r). Comutatividade: p ^ q ≡ q ^ p; p v q ≡ q v p. ABSORÇÃO: p ^ (p v q) ≡ p; p v (p ^ q) ≡ p."},

  {"id":"con-rl-04","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocínio Lógico — Silogismos e Argumentos Válidos: ARGUMENTO: conjunto de proposições em que uma (conclusão) decorre das demais (premissas). ARGUMENTO VÁLIDO: se premissas verdadeiras → conclusão necessariamente verdadeira (forma lógica preserva a verdade). MODUS PONENS (afirmação do antecedente): P1: p→q; P2: p; Conclusão: q — VÁLIDO. MODUS TOLLENS (negação do consequente): P1: p→q; P2: ~q; Conclusão: ~p — VÁLIDO (usa a contrapositiva). SILOGISMO HIPOTÉTICO: P1: p→q; P2: q→r; Conclusão: p→r — VÁLIDO. SILOGISMO DISJUNTIVO: P1: p v q; P2: ~p; Conclusão: q — VÁLIDO. FALÁCIAS FORMAIS (inválidas): Afirmação do consequente (p→q, q, logo p — INVÁLIDO); Negação do antecedente (p→q, ~p, logo ~q — INVÁLIDO). SILOGISMO CATEGÓRICO: três proposições categóricas (todo, algum, nenhum) — premissa maior + menor → conclusão. Exemplo válido: 'Todo homem é mortal; Sócrates é homem; logo, Sócrates é mortal'."},

  {"id":"con-rl-05","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocínio Lógico — Quantificadores e Negação: QUANTIFICADOR UNIVERSAL (∀ — 'todo', 'qualquer', 'cada', 'nenhum'): 'Todo A é B' = ∀x(A(x)→B(x)). 'Nenhum A é B' = ∀x(A(x)→~B(x)). QUANTIFICADOR EXISTENCIAL (∃ — 'algum', 'existe', 'pelo menos um'): 'Algum A é B' = ∃x(A(x)^B(x)). NEGAÇÃO DE QUANTIFICADORES: ~'Todo A é B' = 'Algum A não é B'; ~'Algum A é B' = 'Nenhum A é B' (= 'Todo A não é B'); ~'Nenhum A é B' = 'Algum A é B'; ~'Algum A não é B' = 'Todo A é B'. REGRA MNEMÔNICA: negar o 'todo' → 'algum não'; negar o 'algum' → 'nenhum'. Aplicação em provas: 'Se todo servidor é eficiente' (premissa) → sua negação é 'algum servidor não é eficiente'. Cuidado: 'poucos', 'a maioria', 'muitos' — são quantificadores vagos, não têm negação simples como os universais/existenciais da lógica formal."},

  {"id":"con-rl-06","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocínio Lógico — Teoria dos Conjuntos: NOTAÇÃO: A={elementos}, ∅=conjunto vazio, U=universo. RELAÇÕES: ∈ (pertence), ⊆ (contido ou igual), ⊂ (contido — alguns autores usam como subconjunto próprio). OPERAÇÕES: UNIÃO A∪B: todos os elementos de A ou B (ou ambos); INTERSEÇÃO A∩B: somente os elementos comuns a A e B; COMPLEMENTO Aᶜ ou A': elementos de U que não estão em A; DIFERENÇA A-B (ou A menos B): elementos de A que não estão em B. DIAGRAMAS DE VENN: representação visual. PROBLEMAS COM 2 CONJUNTOS: n(A∪B) = n(A) + n(B) - n(A∩B). PROBLEMAS COM 3 CONJUNTOS: n(A∪B∪C) = n(A)+n(B)+n(C) - n(A∩B) - n(A∩C) - n(B∩C) + n(A∩B∩C). Estratégia de resolução: montar o diagrama de Venn preenchendo do centro (interseção tripla) para fora; usar as condições do problema."},

  {"id":"con-rl-07","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocínio Lógico — Análise Combinatória: PRINCÍPIO MULTIPLICATIVO (REGRA DO PRODUTO): se uma escolha pode ser feita de m maneiras e outra de n maneiras independentemente, o total de escolhas é m×n. PERMUTAÇÃO SIMPLES (Pn): arranjo de todos os elementos de um conjunto, sem repetição, considerando a ordem — Pn = n! (fatorial de n). Exemplo: anagramas de 'AMOR' = 4! = 24. PERMUTAÇÃO COM REPETIÇÃO: quando há elementos repetidos — Pn = n!/(n₁!×n₂!×...); anagramas de 'ARARA' = 5!/(3!×2!) = 10. ARRANJO SIMPLES (An,p): escolha e disposição de p elementos de n (p≤n), com ordem — An,p = n!/(n-p)!. Exemplo: 3 premiações de 10 candidatos = A10,3 = 10×9×8 = 720. COMBINAÇÃO SIMPLES (Cn,p ou C(n,p) ou ₙCₚ): escolha de p elementos de n, sem ordem — Cn,p = n!/(p!×(n-p)!). Exemplo: comissão de 3 de 10 pessoas = C10,3 = 120. Distinção chave: se a ordem importa → arranjo; se não importa → combinação."},

  {"id":"con-rl-08","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocínio Lógico — Probabilidade: ESPAÇO AMOSTRAL (Ω): conjunto de todos os resultados possíveis de um experimento. EVENTO: subconjunto do espaço amostral. PROBABILIDADE CLÁSSICA: P(A) = n(A)/n(Ω) — número de casos favoráveis / total de casos (equiprováveis). Propriedades: 0 ≤ P(A) ≤ 1; P(Ω)=1; P(∅)=0; P(Aᶜ)=1-P(A). ADIÇÃO: P(A∪B) = P(A)+P(B)-P(A∩B); se mutuamente exclusivos (A∩B=∅): P(A∪B)=P(A)+P(B). MULTIPLICAÇÃO: P(A∩B)=P(A)×P(B|A); se INDEPENDENTES: P(A∩B)=P(A)×P(B). PROBABILIDADE CONDICIONAL: P(B|A) = P(A∩B)/P(A) — probabilidade de B dado que A ocorreu. EVENTOS INDEPENDENTES: P(B|A)=P(B) — ocorrência de A não afeta probabilidade de B. Exemplos clássicos: lançamento de dado (Ω={1,2,3,4,5,6}), moeda (Ω={cara, coroa}), baralho (52 cartas)."},

  {"id":"con-rl-09","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocínio Lógico — Sequências Numéricas e PA/PG: PROGRESSÃO ARITMÉTICA (PA): cada termo obtido somando a razão r ao anterior. Termo geral: an = a1 + (n-1)×r. Soma dos n primeiros termos: Sn = n×(a1+an)/2 = n×(2a1+(n-1)r)/2. Média aritmética: a termo central = (a1+an)/2. PROGRESSÃO GEOMÉTRICA (PG): cada termo obtido multiplicando pelo razão q ao anterior (q≠0). Termo geral: an = a1×q^(n-1). Soma dos n primeiros termos (q≠1): Sn = a1×(q^n - 1)/(q-1). INTERPOLAÇÃO ARITMÉTICA: inserir k meios aritméticos entre a1 e an → razão r=(an-a1)/(k+1). INTERPOLAÇÃO GEOMÉTRICA: inserir k meios geométricos → razão q=(an/a1)^(1/(k+1)). SEQUÊNCIAS MISTAS: alternar regras (ex: +2, ×3, +2, ×3...) ou combinações. FIBONACCI: cada termo é a soma dos dois anteriores (1, 1, 2, 3, 5, 8, 13, 21...). QUADRADOS PERFEITOS: 1, 4, 9, 16, 25, 36... (diferenças: 3, 5, 7, 9...)."},

  {"id":"con-rl-10","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocínio Lógico — Lógica Situacional e Tabelas: Problemas que apresentam um cenário com dicas e restrições, exigindo raciocínio dedutivo sistemático. ESTRATÉGIA: 1) Listar todas as variáveis e possibilidades; 2) Criar uma tabela cruzando pessoas × características; 3) Inserir as certezas diretas das dicas; 4) Usar eliminação: se A é X, então B não é X; 5) Usar contrapositiva e equivalências para extrair novas conclusões; 6) Verificar consistência de cada hipótese. TIPOS DE PISTAS: pista direta ('A é azul'), pista de exclusão ('B não é azul'), pista relacional ('A está à direita de B'), pista condicional ('se A for azul, então B é verde'). LÓGICA DE POSIÇÃO: em problemas de fila ou ordem, usar restrições de adjacência e posição relativa. Em provas de concurso: a maioria dos problemas tem solução única — se encontrar ambiguidade, rever as deduções. Anotar todas as conclusões intermediárias e nunca assumir informação não dada."},

  {"id":"con-rl-11","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocínio Lógico — Geometria e Raciocínio Espacial: FIGURAS PLANAS: triângulo (soma ângulos internos = 180°), quadriláteros (soma = 360°), polígono convexo n lados (soma = (n-2)×180°). POLIEDROS DE EULER: V - A + F = 2 (vértices - arestas + faces = 2); ex: cubo: V=8, A=12, F=6 → 8-12+6=2. PLANIFICAÇÃO (DESENVOLVIMENTO): forma 2D obtida ao 'abrir' um sólido; cubo tem 11 planificações distintas. ROTAÇÃO E REFLEXÃO: identificar imagem de figura após rotação de 90°, 180°, 270° ou reflexão em eixo. CONTAGEM EM FIGURAS: contar triângulos ou quadriláteros em figuras compostas — estratégia: contar por tamanho (pequenos, médios, grandes) e somar. FIGURAS ANÁLOGAS: identificar padrão em série de figuras e determinar o próximo elemento — analisar cor, forma, quantidade, posição dos elementos. DOBRAMENTO DE PAPEL: determinar resultado de dobras e cortes — rastrear o trajeto de cada corte."},

  {"id":"con-rl-12","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocínio Lógico — Problemas de Porcentagem e Regra de Três: PORCENTAGEM: p% de x = (p/100)×x. AUMENTO DE p%: novo valor = x×(1+p/100). DESCONTO DE p%: novo valor = x×(1-p/100). AUMENTOS SUCESSIVOS: aplicar em cadeia (não somar as porcentagens diretamente): aumento de 10% e depois 20% ≠ 30%; = 1,1×1,2=1,32 → aumento real de 32%. JUROS SIMPLES: J = C×i×t; M = C×(1+i×t). JUROS COMPOSTOS: M = C×(1+i)^t. REGRA DE TRÊS SIMPLES DIRETA: grandezas diretamente proporcionais (se uma aumenta, outra aumenta): a/b = c/d. REGRA DE TRÊS SIMPLES INVERSA: grandezas inversamente proporcionais (se uma aumenta, outra diminui): a×b = c×d. REGRA DE TRÊS COMPOSTA: mais de duas grandezas — montar proporção, identificar relação de cada par (direta ou inversa), aplicar corretamente. MÉDIA ARITMÉTICA SIMPLES: (a1+a2+...+an)/n. MÉDIA PONDERADA: Σ(ai×pi)/Σpi."},

  {"id":"con-rl-13","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocinio Logico — Diagramas de Venn — Tres Conjuntos: Problemas com tres categorias exigem diagrama de Venn com oito regioes. Formula de inclusao-exclusao: n(A∪B∪C)=n(A)+n(B)+n(C)-n(A∩B)-n(A∩C)-n(B∩C)+n(A∩B∩C). Estrategia: preencher interseccao tripla primeiro, depois pares, depois regioes exclusivas. Questoes tipicas: esportes, idiomas, profissoes. Quando informado 'apenas A e B', nao inclui quem tambem pertence a C."},

  {"id":"con-rl-14","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocinio Logico — Logica de Predicados — Quantificadores: Predicados expressam propriedades: P(x)='x e par'. Quantificador universal ∀x P(x): todos satisfazem. Existencial ∃x P(x): pelo menos um. Negacao: ~∀x P(x) ≡ ∃x ~P(x); ~∃x P(x) ≡ ∀x ~P(x). Em provas, traduzir frases: 'Nem todo servidor e eficiente' = ∃x (servidor(x) ∧ ~eficiente(x)). Cuidado com ordem dos quantificadores: ∀x ∃y difere de ∃y ∀x."},

  {"id":"con-rl-15","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocinio Logico — Tabelas-Verdade — Proposicoes Compostas: Com n variaveis atomicas ha 2^n linhas. Construir colunas auxiliares para subformulas. Classificar: tautologia (sempre V), contradicao (sempre F), contingencia (ambos). Testar equivalencia comparando colunas finais. Conectivos de Scheffer: NAND (p|q = ~(p∧q)) e NOR sao funcionalmente completos. Em questoes CESPE, verificar se proposicao composta e equivalente a forma simplificada via De Morgan e contrapositiva."},

  {"id":"con-rl-16","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocinio Logico — Equivalencias Logicas Avancadas: Distribuicao: p∧(q∨r)≡(p∧q)∨(p∧r); p∨(q∧r)≡(p∨q)∧(p∨r). Absorcao: p∧(p∨q)≡p. Idempotencia: p∧p≡p. Comutatividade e associatividade permitem reordenar. p→q≡~p∨q≡~q→~p. p↔q≡(p→q)∧(q→p). Negação de condicional: ~(p→q)≡p∧~q. Resolver questoes substituindo conectivos por equivalentes mais simples antes da tabela-verdade."},

  {"id":"con-rl-17","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocinio Logico — Argumentos Dedutivos e Validade: Argumento valido: impossivel premissas verdadeiras e conclusao falsa. Invalido: existe linha da tabela com premissas V e conclusao F. Silogismo categorico: premissa maior (todo A e B), premissa menor (C e A), conclusao (C e B). Figuras e modos validos (Barbara, Celarent). Reducao ao absurdo: assumir negacao da tese e derivar contradicao. Enunciados condicionais encadeados exigem transitividade e contrapositiva."},

  {"id":"con-rl-18","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocinio Logico — Falacias Informais: Falacia ad hominem: ataca pessoa, nao argumento. Espantalho: distorce tese oponente. Falso dilema: apresenta apenas duas opcoes. Generalizacao apressada: amostra insuficiente. Post hoc: confunde correlacao com causalidade. Apelo a autoridade irrelevante. Peticao de principio: conclusao nas premissas. Equivocacao: termo com dois sentidos. Em provas, identificar falacia pelo padrao do raciocinio, nao pelo conteudo factual da conclusao."},

  {"id":"con-rl-19","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocinio Logico — Raciocinio Analogico e Indutivo: Analogia: inferir propriedade de B porque A e B compartilham tracos e A possui a propriedade — forca depende do numero e relevancia dos tracos comuns. Inducao: generalizar a partir de casos observados — conclusao provavel, nao necessaria. Inducao completa: todos os casos verificados. Inducao por enumeracao: amostra representativa. Diferenca da deducao: validade logica versus plausibilidade. Questoes pedem avaliar se analogia e pertinente ou falaciosa."},

  {"id":"con-rl-20","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocinio Logico — Metodo da Eliminacao e Hipoteses: Em problemas logicos, listar possibilidades e eliminar contraditorias. Se apenas uma hipotese sobrevive, e a solucao. Para 'verdadeiro e mentiroso', testar cada personagem como mentiroso. Backtracking: assumir valor, derivar consequencias, retroceder se inconsistencia. Tabela de compatibilidade cruza entidades x atributos. Anotar certezas absolutas antes de inferencias condicionais. Evitar circularidade: nao usar conclusao como premissa."},

  {"id":"con-rl-21","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocinio Logico — Principio da Casa dos Pombos: Se n objetos sao distribuidos em m recipientes com n>m, pelo menos um recipiente contem mais de um objeto. Generalizacao: n objetos, m recipientes, pelo menos um tem ceil(n/m) objetos. Aplicacoes: aniversarios (23 pessoas, probabilidade de coincidencia), provas de existencia em combinatoria. Exemplo: 13 cartas de 4 naipes, pelo menos 4 do mesmo naipe. Em concursos, identificar 'objetos' e 'recipientes' no enunciado."},

  {"id":"con-rl-22","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocinio Logico — Permutacao Circular: Arranjar n elementos em circulo: (n-1)! permutacoes, pois rotacoes equivalentes sao identicas. Colar um elemento fixa referencia. Com repeticoes: (n-1)!/(k1!×k2!×...). Pulseiras (simetria reflexiva): dividir por 2 se n>2. Exemplo: 5 pessoas em mesa redonda = 4!=24. Com restricao de adjacencia, fixar elementos restritos e permutar os demais. Diferenca de permutacao linear n! e circular (n-1)!."},

  {"id":"con-rl-23","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocinio Logico — Combinacao com Repeticao: Escolher k elementos de n tipos, repeticao permitida, ordem irrelevante: CR(n,k)=C(n+k-1,k). Modelo 'estrelas e barras': k estrelas, n-1 barras. Exemplo: 10 doces de 3 sabores = CR(3,10)=C(12,10)=66. Distribuir objetos identicos em grupos distintos. Diferenca de combinacao simples C(n,k) que exige elementos distintos sem repeticao. Problemas de composicao de numeros inteiros positivos usam a mesma logica combinatoria."},

  {"id":"con-rl-24","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocinio Logico — Arranjo com Repeticao: Escolher e ordenar k elementos de n opcoes, repeticao permitida: AR(n,k)=n^k. Exemplo: senhas de 4 digitos com 0-9: 10^4=10000. Placas, PINs, codigos. Diferenca de arranjo simples A(n,k)=n!/(n-k)! sem repeticao. Com restricao (primeiro digito nao zero): ajustar base: 9×10^3. Contagem de funcoes de conjunto finito para conjunto finito: n^m quando dominio tem m e contradominio n elementos."},

  {"id":"con-rl-25","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocinio Logico — Probabilidade Condicional Avancada: P(A|B)=P(A∩B)/P(B), P(B)>0. Eventos independentes: P(A∩B)=P(A)P(B) e P(A|B)=P(A). Lei da probabilidade total: P(A)=ΣP(A|Bi)P(Bi) para particao {Bi}. Probabilidade de uniao para eventos nao exclusivos: P(A∪B)=P(A)+P(B)-P(A∩B). Problemas de urnas com e sem reposicao alteram espaco amostral. Arvore de probabilidades organiza cenarios sequenciais."},

  {"id":"con-rl-26","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocinio Logico — Teorema de Bayes — Aplicacao: P(A|B)=P(B|A)P(A)/P(B). Util para inverter condicionais: teste medico com sensibilidade e especificidade. Exemplo: doenca 1%, teste 99% sensivel e 95% especifico — resultado positivo nao implica 99% de doenca; calcular P(D|+) via Bayes. Base rate neglect e erro comum. Em provas, montar tabela ou formula com hipoteses mutuamente exclusivas e exaustivas."},

  {"id":"con-rl-27","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocinio Logico — Estatistica Descritiva — Medidas: Media aritmetica: soma/n. Mediana: valor central em amostra ordenada; par: media dos dois centrais. Moda: valor mais frequente. Media ponderada: Σ(xi×pi)/Σpi. Media geometrica para taxas compostas. Relacao: media≥mediana≥moda em distribuicoes assimétricas positivas. Amostra versus populacao: media amostral x̄ estima μ. Questoes pedem interpretacao de graficos (histograma, boxplot) e escolha da medida adequada."},

  {"id":"con-rl-28","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocinio Logico — Desvio Padrao e Variancia: Variancia amostral: s²=Σ(xi-x̄)²/(n-1). Desvio padrao s=√s² mede dispersao na mesma unidade dos dados. Coeficiente de variacao CV=s/x̄×100% compara dispersao relativa. Regra empirica normal: ~68% em ±1σ, ~95% em ±2σ. Outliers distorcem media mas afetam menos mediana. Em provas de RL, calcular desvio de conjuntos pequenos ou interpretar afirmacoes sobre concentracao de dados."},

  {"id":"con-rl-29","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocinio Logico — Matrizes Logicas e Sudoku: Grade n×n com restricoes de linha, coluna e regiao. Logica: preencher celulas unicas por eliminacao. Sudoku 9×9: cada linha, coluna e bloco 3×3 contem 1-9 sem repeticao. Tecnicas: candidatos, naked singles, hidden pairs. Matrizes de adiacencia em grafos representam relacoes. Operacoes booleanas em matrizes usadas em circuitos. Problemas combinam restricoes exclusivas e inclusivas."},

  {"id":"con-rl-30","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocinio Logico — Sequencias Figurativas e Padroes: Identificar transformacao entre figuras: rotacao (90°, 180°), reflexao (espelho horizontal/vertical), adicao/remocao de elementos, mudanca de cor ou contagem. Series alternam duas regras (+1 elemento, rotacao). Simetria e completamento de padrao. Cubos desdobrados: faces opostas nunca se tocam na planificacao. Contagem de triangulos/quadrilateros em figuras compostas: metodo sistematico por tamanho."},

  {"id":"con-rl-31","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocinio Logico — Problemas de Filas e Ordem: Fila linear: posicao de frente e tras somam n+1 se n pessoas. Insercao/remocao altera numeracao. Fila circular: posicoes mod n. Problemas de ranking: A a frente de B, C entre D e E — montar cadeia de desigualdades. Ordenacao parcial versus total. Eventos simultaneos em filas duplas. Questoes de elevador: andares percorridos versus paradas. Diagrama de linha do tempo resolve conflitos de ordem."},

  {"id":"con-rl-32","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocinio Logico — Calendario e Contagem de Dias: Ano bissexto: divisivel por 4, exceto seculares nao divisiveis por 400. Fevereiro 29 dias em bissexto. Zeller ou tabela: dia da semana de data qualquer. Intervalo entre datas: contar dias completos. Mesmo dia da semana avanca 1 (ano comum) ou 2 (apos fev bissexto). Problema: se 1/jan e segunda, qual dia 31/dez? Trabalhar modulo 7. Seculos afetam padrao de bissextos."},

  {"id":"con-rl-33","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocinio Logico — Relogios — Angulos e Coincidencias: Minuto: 360°/60=6° por minuto. Hora: 360°/12=30° por hora, mais 0,5° por minuto. Angulo entre ponteiros: |30H-5,5M| (H horas, M minutos). Coincidencia: ponteiros juntos quando 30H=5,5M → M=60H/11. Aproximadamente 55 minutos entre coincidencias consecutivas. Relogio atrasado/adiantado: calcular diferenca de taxas. Relogio quebrado marca hora certa duas vezes ao dia se atraso constante."},

  {"id":"con-rl-34","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocinio Logico — Orientacao Espacial e Rotacao: Rosa dos ventos: N, NE, E, SE, S, SO, O, NO — 45° entre adjacentes. Giro horario 90°: N→L, L→S, S→O, O→N. Mapas: frente conforme direcao de movimento. Labirintos: manter mao direita na parede. Diferenca entre rotacao de objeto e mudanca de observador. Coordenadas: primeiro quadrante x>0,y>0. Questoes de deslocamento resultante: soma vetorial de passos N/S/L/O."},

  {"id":"con-rl-35","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocinio Logico — Cubos — Faces Pintadas: Cubo n×n×n dividido em cubinhos unitarios. Faces pintadas: cubos com 3 faces pintadas=8 vertices (sempre). Com 2 faces: arestas internas (n-2)×12. Com 1 face: centros das faces (n-2)²×6. Sem pintura: (n-2)³ internos. Para n=3: 8 com 3 faces, 12 com 2, 6 com 1, 1 sem. Generalizar antes de calcular. Variante: cortes parciais ou cores diferentes por face."},

  {"id":"con-rl-36","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocinio Logico — Dobramento de Papel e Simetria: Dobra simetrica duplica camadas. Corte atravessa todas as camadas sobrepostas. Desdobrar revela padrao simetrico. Numero de furos = furos por camada × camadas (se alinhados). Dobras em angulo 45° criam simetria diagonal. Problemas pedem figura final apos sequencia dobra-corte-desdobra. Rastrear posicao de canto no papel dobrado. Origami modular combina multiplas unidades."},

  {"id":"con-rl-37","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocinio Logico — Teoria de Grafos — Caminhos: Grafo G=(V,A): vertices e arestas. Caminho: sequencia de arestas conectadas. Ciclo: caminho fechado sem repetir arestas. Grafo euleriano: existe ciclo usando cada aresta uma vez — todos vertices grau par (Euler). Hamiltoniano: ciclo visitando cada vertice uma vez — NP-completo. Arvore com n vertices tem n-1 arestas. Matriz de adjacencia A[i][j]=1 se aresta. BFS encontra caminho minimo em grafo nao ponderado."},

  {"id":"con-rl-38","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocinio Logico — Codificacao e Cifras: Cifra de Cesar: deslocamento fixo no alfabeto (ROT13: +13). Substituicao monoalfabetica: permutacao de letras. Codigo binario ASCII: A=65, a=97. Morse: pontos e tracos. Decodificar: identificar padrao de frequencia (E mais comum em portugues). Numero de permutacoes de alfabeto 26! Para questoes, aplicar operacao inversa. Cifra por transposicao: reordenar colunas. Base64 codifica bytes, nao e criptografia."},

  {"id":"con-rl-39","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocinio Logico — Proporcao, Escala e Regra de Tres: Proporcao a/b=c/d → a×d=b×c. Escala 1:50000: 1 cm mapa = 500 m real. Regra de tres composta: identificar grandezas direta/inversamente proporcionais. Velocidade media: S= V×T. Misturas: alcool e agua, concentracao final. Porcentagem sucessiva nao soma linearmente. Razao a:b:c normalizar dividindo por MDC. Proporcionalidade direta: y=kx; inversa: y=k/x."},

  {"id":"con-rl-40","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocinio Logico — MDC e MMC — Aplicacoes: MDC(a,b): maior divisor comum — algoritmo de Euclides: MDC(a,b)=MDC(b,a mod b). MMC(a,b)=a×b/MDC(a,b). Problemas de encontro: eventos periodicos a e b dias — coincidem em MMC dias. Pisos quadrados: lado minimo = MMC dos lados dados. Frações equivalentes: denominador comum = MMC. MDC simplifica razoes. Decomposicao em primos acelera calculo. N numeros: MDC e MMC iterativos."},

  {"id":"con-rl-41","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocinio Logico — Raciocinio Matematico Verbal: Traduzir enunciado para equacao: 'A tem o dobro de B' → A=2B. 'Soma das idades' → A+B+C=S. Problemas de idade: montar equacao no presente e no passo/futuro. Caixas e envelopes: cuidado com variavel errada. Trabalho conjunto: 1/t1+1/t2=1/total. Velocidade relativa: mesmo sentido subtrai, oposto soma. Tabela organiza incognitas. Verificar resposta nas condicoes originais."},

  {"id":"con-rl-42","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocinio Logico — Jogos e Teoria dos Jogos Basica: Jogo de Nim: pilhas de objetos, retirar quantidade fixa — posicoes vencedoras por XOR (nim-sum). Jogo da velha: empate com jogo otimo. Dominos em tabuleiro 2×n: inducao. Estrategia: simetria, primeiro jogador forca vitoria ou empate. Minimax em arvore de jogadas. Problemas 'quem ganha se ambos jogam perfeitamente' exigem analise retroativa. Paridade (par/impar) resolve muitos jogos combinatorios."},

  {"id":"con-rl-43","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocinio Logico — Cavaleiros e Mentiroso (Knights and Knaves): Cavaleiro sempre verdade; patolino sempre mente. A diz 'B e patolino': se A cavaleiro, B patolino; se A patolino, B cavaleiro. Enunciados sobre si mesmos: 'Eu sou patolino' e sempre falso, logo quem diz e patolino. Perguntas que forcam resposta unica: 'Se eu perguntar ao outro caminho, ele diria que e seguro?' Testar cada combinacao possivel em poucas pessoas."},

  {"id":"con-rl-44","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocinio Logico — Interpretacao de Tabelas e Graficos: Grafico de barras: comparar categorias. Linha: evolucao temporal. Pizza: proporcao do todo (soma 100%). Histograma: frequencia por intervalo. Eixo truncado distorce percepcao. Taxa de variacao ≠ valor absoluto. Media movel suaviza tendencia. Ler legenda, unidades e escala. Extrair maximo, minimo, media aproximada de grafico. Tabela de contingencia cruza duas variaveis categoricas."},

  {"id":"con-rl-45","area":"Concursos","disciplina":"Raciocinio Logico","namespace":"concursos_rlm",
   "texto":"Concursos Raciocinio Logico — Principio Multiplicativo e Aditivo: Aditivo: caminhos mutuamente exclusivos — soma. Multiplicativo: etapas sequenciais independentes — produto. Exemplo: 3 camisas e 4 calcas = 12 combinacoes. Com restricao, subtrair casos invalidos. Inclusao-exclusao para uniao de conjuntos sobrepostos. Problemas de rota em grid: caminhos de (0,0) a (m,n) sem retroceder = C(m+n,n). Contagem complementar: total menos indesejados."},

  # ══════════════════════════════════════════════════════
  # MATÉRIA 5: INFORMÁTICA (concursos_informatica)
  # ══════════════════════════════════════════════════════

  {"id":"con-inf-01","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informática — Hardware: PROCESSADOR (CPU): componente que executa instruções — clock (velocidade em GHz), núcleos (cores), cache (L1 rápido/pequeno, L2 médio, L3 grande/compartilhado). MEMÓRIA RAM: volátil, armazenamento temporário dos dados em uso — quanto maior, mais programas simultâneos; tipos: DDR4, DDR5. ROM: não volátil, contém BIOS/UEFI. MEMÓRIA CACHE: extremamente rápida, entre CPU e RAM, reduz latência de acesso. HD (Hard Disk): magnético, não volátil, maior capacidade, mais lento; partes: prato, cabeçote de leitura/escrita, controladora. SSD (Solid State Drive): não volátil, memória flash NAND, mais rápido e resistente que HD, sem partes móveis. PEN DRIVE: memória flash portátil, interface USB. DISPOSITIVOS DE ENTRADA: teclado, mouse, scanner, webcam, microfone, touch screen. DISPOSITIVOS DE SAÍDA: monitor (LCD, LED, OLED), impressora (jato de tinta, laser), caixas de som, projetor. BARRAMENTO: caminho de comunicação entre componentes — barramento de dados, endereço e controle."},

  {"id":"con-inf-02","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informática — Windows 10/11: INTERFACE: Área de Trabalho (desktop), Barra de Tarefas, Menu Iniciar, Bandeja do Sistema (clock, som, rede). GERENCIADOR DE ARQUIVOS (Explorador/File Explorer): criar, copiar (Ctrl+C), recortar (Ctrl+X), colar (Ctrl+V), excluir (Del → Lixeira; Shift+Del → exclusão permanente), renomear (F2). ATALHOS ESSENCIAIS: Win+D (mostrar área de trabalho), Win+L (bloquear tela), Win+R (executar), Win+E (abrir Explorer), Alt+F4 (fechar janela/desligar), Ctrl+Alt+Del (segurança do Windows), Alt+Tab (alternar janelas), Print Screen (captura de tela inteira), Win+Print Screen (salva captura), Ctrl+Z (desfazer), Ctrl+Y (refazer), F5 (atualizar). PAINEL DE CONTROLE vs CONFIGURAÇÕES: Configurações (moderno, Win+I) substituindo gradualmente o Painel de Controle (clássico). GERENCIADOR DE TAREFAS: Ctrl+Shift+Esc; abas: processos, desempenho, usuários, detalhes, serviços. UAC: Controle de Conta de Usuário — confirmação de elevação de privilégio. FORMATOS COMUNS: NTFS (padrão Windows — suporta permissões, compressão, grandes arquivos), FAT32 (compatível, limite 4GB por arquivo), exFAT (pen drives, sem limite)."},

  {"id":"con-inf-03","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informática — LibreOffice Writer: Processador de texto gratuito e de código aberto (alternativa ao Microsoft Word). FORMATAÇÃO: negrito (Ctrl+B), itálico (Ctrl+I), sublinhado (Ctrl+U), tamanho de fonte, cor, alinhamento (esq Ctrl+L, centro Ctrl+E, dir Ctrl+R, justificado Ctrl+J). ESTILOS: formatação consistente — Estilo de Parágrafo (Título 1, Título 2, Corpo de Texto), Estilo de Caractere. MALA DIRETA (mailing): combina documento-modelo com banco de dados para gerar cópias personalizadas — Ferramentas > Mala Direta. CONTROLE DE ALTERAÇÕES: Editar > Controlar Alterações — registra modificações de diferentes usuários; aceitar ou rejeitar individualmente. ÍNDICE AUTOMÁTICO: inserido após criação de estilos de título — Inserir > Índice de Conteúdo. SEÇÕES: divide o documento em partes com formatação independente. FORMATOS DE ARQUIVO: ODT (nativo), DOC/DOCX (compatível com Word), PDF (exportar). LOCALIZAR E SUBSTITUIR: Ctrl+H. VERIFICAÇÃO ORTOGRÁFICA: F7. WORDCOUNT: palavras e caracteres — Ferramentas > Contagem de Palavras."},

  {"id":"con-inf-04","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informática — LibreOffice Calc: Planilha eletrônica. ESTRUTURA: células (endereço coluna+linha: A1, B2), planilhas (abas), pasta de trabalho. FÓRMULAS (iniciam com =): SOMA(A1:A10), MÉDIA(B1:B10), MÍNIMO(C1:C5), MÁXIMO(D1:D5). SE(condição;valor_se_V;valor_se_F): =SE(A1>7;'Aprovado';'Reprovado'). CONT.SE(intervalo;critério): conta células que atendem critério. SOMASE(intervalo;critério;intervalo_soma): soma valores com condição. PROCV(valor_procurado;tabela;num_coluna;0_para_exato): busca vertical em tabela — 0 ou FALSO para correspondência exata. REFERÊNCIAS: A1 (relativa — ajusta ao copiar); $A$1 (absoluta — fixa linha e coluna); $A1 ou A$1 (mistas). FORMATAÇÃO CONDICIONAL: destaque automático baseado em regra — Formatar > Formatação Condicional. TABELA DINÂMICA (Tabela Piloto): Dados > Tabela Dinâmica — análise multidimensional. GRÁFICOS: selecionar dados > Inserir > Gráfico — tipos: barras, colunas, linhas, pizza, dispersão. ATALHOS: Ctrl+Home (célula A1), Ctrl+End (última célula com dado), F4 (alternar referência absoluta/relativa)."},

  {"id":"con-inf-05","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informática — Internet, Navegadores e Protocolos: NAVEGADORES: Chrome, Firefox, Edge, Safari. ATALHOS COMUNS: Ctrl+T (nova aba), Ctrl+W (fechar aba), Ctrl+L (barra de endereço), Ctrl+R ou F5 (recarregar), Ctrl+Shift+Delete (limpar dados de navegação), Ctrl+D (favoritar), Ctrl+H (histórico), Ctrl+J (downloads), F12 (DevTools/Ferramentas do Desenvolvedor). NAVEGAÇÃO PRIVADA/ANÔNIMA: não salva histórico, cookies ou formulários na sessão — Ctrl+Shift+N (Chrome/Edge), Ctrl+Shift+P (Firefox). COOKIES: pequenos arquivos armazenados pelo navegador para manter sessões e preferências — podem ser de sessão (temporários) ou persistentes. URL (Uniform Resource Locator): protocolo://domínio:porta/caminho?parâmetros. HTTPS: HTTP com camada de segurança SSL/TLS (cadeado verde/cinza na barra de endereço). PHISHING: página falsa que imita site legítimo para roubar credenciais — verificar URL, certificado, remetente."},

  {"id":"con-inf-06","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informática — Protocolos de Internet e Portas Padrão: HTTP (80): Hypertext Transfer Protocol — transferência de páginas web, sem criptografia. HTTPS (443): HTTP Secure — com criptografia TLS/SSL. FTP (21 controle, 20 dados): File Transfer Protocol — transferência de arquivos. SSH (22): Secure Shell — acesso remoto seguro ao terminal. TELNET (23): acesso remoto sem criptografia (obsoleto, substituído pelo SSH). SMTP (25 ou 587): Simple Mail Transfer Protocol — envio de e-mail. POP3 (110 / 995 com SSL): Post Office Protocol — recebimento de e-mail, baixa as mensagens do servidor e remove (por padrão). IMAP (143 / 993 com SSL): Internet Message Access Protocol — acesso ao e-mail no servidor, sincronização em múltiplos dispositivos (mantém no servidor). DNS (53): Domain Name System — traduz nomes de domínio em endereços IP. DHCP (67/68): Dynamic Host Configuration Protocol — atribui automaticamente endereços IP aos dispositivos da rede. RDP (3389): Remote Desktop Protocol — acesso remoto à área de trabalho do Windows."},

  {"id":"con-inf-07","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informática — Modelo OSI e TCP/IP: MODELO OSI (7 camadas — da mais baixa para a mais alta): CAMADA 1 — FÍSICA: transmissão de bits; meio físico (cabo, fibra, Wi-Fi); hubs, repetidores. CAMADA 2 — ENLACE DE DADOS: frames, endereçamento MAC, detecção de erros (CRC); switches e bridges. CAMADA 3 — REDE: roteamento, endereçamento IP, pacotes; roteadores. CAMADA 4 — TRANSPORTE: segmentos, controle de fluxo; TCP (orientado a conexão, confiável) e UDP (sem conexão, mais rápido). CAMADA 5 — SESSÃO: estabelecimento e gerenciamento de sessões. CAMADA 6 — APRESENTAÇÃO: formatação, criptografia, compressão dos dados. CAMADA 7 — APLICAÇÃO: interface com o usuário; HTTP, FTP, SMTP, DNS. MODELO TCP/IP (4 camadas): Acesso à Rede (1+2 do OSI), Internet (3), Transporte (4), Aplicação (5+6+7). TCP vs UDP: TCP — handshake 3 vias (SYN, SYN-ACK, ACK), confiável, ordenado, controle de congestionamento; UDP — sem conexão, mais rápido, usado em streaming e games."},

  {"id":"con-inf-08","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informática — Endereçamento IP e Sub-redes: IPv4: 32 bits, notação decimal com pontos (ex: 192.168.1.1); 4 grupos de 0 a 255. CLASSES (histórico): A (0-127), B (128-191), C (192-223), D (multicast), E (reservado). CIDR (Classless Inter-Domain Routing): máscara de sub-rede em notação /n (ex: /24 = 255.255.255.0). ENDEREÇOS ESPECIAIS: 127.0.0.1 (loopback/localhost); 0.0.0.0 (indeterminado); 255.255.255.255 (broadcast universal). ENDEREÇOS PRIVADOS (RFC 1918): 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 — não roteáveis na internet. NAT: Network Address Translation — traduz endereços privados para públicos. SUB-REDE /24: 256 endereços totais, 254 utilizáveis (host 1 = rede, último = broadcast). IPv6: 128 bits, notação hexadecimal com dois-pontos; soluciona escassez de IPv4; endereço de loopback: ::1."},

  {"id":"con-inf-09","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informática — Segurança da Informação — Ameaças e Proteções: MALWARE (softwares maliciosos): VÍRUS — precisa de hospedeiro (arquivo), replica-se ao ser executado; WORM — auto-replicante, não precisa de hospedeiro, propaga pela rede; TROJAN (cavalo de Troia) — se disfarça de software legítimo; RANSOMWARE — criptografa dados e exige resgate; SPYWARE — coleta informações sem consentimento; ADWARE — exibe anúncios indesejados; ROOTKIT — oculta sua presença no sistema; KEYLOGGER — registra teclas digitadas. ENGENHARIA SOCIAL: manipulação psicológica para obter informações — phishing (e-mail falso), spear phishing (direcionado), vishing (telefone), smishing (SMS). PROTEÇÕES: ANTIVÍRUS — detecta e remove malware (baseado em assinatura + heurística + comportamento); FIREWALL — filtra tráfego de rede (entrada/saída); BACKUP — cópia de segurança (3-2-1: 3 cópias, 2 mídias diferentes, 1 fora do local); ATUALIZAÇÃO DO SISTEMA — corrige vulnerabilidades (patches). AUTENTICAÇÃO MULTIFATOR (MFA): algo que você sabe (senha) + tem (token, SMS) + é (biometria)."},

  {"id":"con-inf-10","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informática — Criptografia e Banco de Dados: CRIPTOGRAFIA SIMÉTRICA: mesma chave para cifrar e decifrar — rápida, problema de distribuição da chave; algoritmos: AES (padrão atual, 128/192/256 bits), DES (obsoleto, 56 bits), 3DES. CRIPTOGRAFIA ASSIMÉTRICA: par de chaves (pública + privada) — pública cifra, privada decifra (ou vice-versa para assinatura); algoritmos: RSA, ECC; usada em SSL/TLS, certificados digitais. HASH (resumo criptográfico): função unidirecional, tamanho fixo; MD5 (128 bits — inseguro), SHA-1 (160 bits — inseguro), SHA-256 e SHA-512 (seguros), bcrypt (com salt, para senhas). BANCO DE DADOS RELACIONAL: tabelas, registros, campos. SQL: SELECT (consultar), INSERT (inserir), UPDATE (atualizar), DELETE (excluir). CHAVE PRIMÁRIA (PK): identifica unicamente cada registro. CHAVE ESTRANGEIRA (FK): referencia PK de outra tabela. JOIN: combina dados de tabelas (INNER JOIN — somente correspondentes; LEFT JOIN — todos da esquerda + correspondentes da direita). ÍNDICE: estrutura que acelera consultas. ACID: Atomicidade, Consistência, Isolamento, Durabilidade — propriedades das transações."},

  {"id":"con-inf-11","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informática — Cloud Computing e E-mail: CLOUD COMPUTING: computação em nuvem — recursos sob demanda pela internet. MODELOS DE SERVIÇO: IaaS (Infraestrutura como Serviço — VMs, armazenamento: AWS EC2, Azure VMs); PaaS (Plataforma como Serviço — ambiente de desenvolvimento: Heroku, Google App Engine); SaaS (Software como Serviço — aplicação pronta: Gmail, Office 365, Salesforce); FaaS/Serverless (funções como serviço — AWS Lambda, Cloudflare Workers). MODELOS DE IMPLANTAÇÃO: Pública (recursos compartilhados, gerenciados pelo provedor), Privada (dedicada à organização), Híbrida (combinação), Multi-cloud (múltiplos provedores). PRINCIPAIS PROVEDORES: AWS (Amazon Web Services), Microsoft Azure, Google Cloud Platform (GCP). E-MAIL SEGURO: verificar remetente (domínio, não apenas nome exibido); não clicar em links suspeitos; verificar HTTPS antes de inserir dados; S/MIME e PGP: criptografia e assinatura digital de e-mails; SPF, DKIM, DMARC: mecanismos de autenticação de domínio de e-mail contra spoofing."},

  {"id":"con-inf-12","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informática — OWASP Top 10 e Conceitos de Segurança Web: OWASP (Open Web Application Security Project) — lista das 10 vulnerabilidades web mais críticas. INJEÇÃO (SQL Injection): inserção de código malicioso em entradas — ex: ' OR '1'='1; mitigação: prepared statements, validação de entrada. XSS (Cross-Site Scripting): injeção de scripts no navegador da vítima — tipo refletido (na URL), armazenado (no banco), DOM-based; mitigação: sanitização, Content Security Policy. CSRF (Cross-Site Request Forgery): forçar ação não intencional em site autenticado; mitigação: tokens CSRF, SameSite cookies. IDOR (Insecure Direct Object Reference): acesso direto a objetos sem verificação de autorização (ex: trocar id=1 por id=2 na URL). BROKEN AUTHENTICATION: falhas em sessão — senhas fracas, sem MFA, tokens previsíveis. EXPOSIÇÃO DE DADOS SENSÍVEIS: dados pessoais/financeiros sem criptografia adequada. SSRF (Server-Side Request Forgery): servidor faz requisição maliciosa a serviços internos. DESSERIALIZAÇÃO INSEGURA: execução de código ao desserializar dados não confiáveis. COMPONENTES VULNERÁVEIS: uso de bibliotecas com vulnerabilidades conhecidas (CVEs). LOG E MONITORAMENTO INSUFICIENTES: impossibilita detecção de ataques."},

  {"id":"con-inf-13","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informatica — LibreOffice Impress — Apresentacoes: Impress cria slides para apresentacoes. Layouts mestre garantem padrao visual. Inserir texto, imagens, tabelas, graficos e videos. Transicoes entre slides e animacoes de objetos. Modo apresentacao: F5 inicia do slide atual, Shift+F5 do primeiro. Exportar PDF, ODP nativo, PPT compativel. Notas do apresentador em slide separado. Estilos de slide reutilizaveis. Atalhos: Ctrl+M novo slide, Ctrl+D duplicar. Assistente de imagem e galeria de midia integrada."},

  {"id":"con-inf-14","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informatica — E-mail Corporativo — Outlook e Webmail: Protocolos: SMTP envia, IMAP sincroniza multiplos dispositivos, POP3 baixa e remove do servidor por padrao. Campos: Para, Cc (copia visivel), Cco (oculta). Anexo: limite de tamanho tipico 25 MB. Phishing: remetente falsificado, links maliciosos, urgencia artificial. Assinatura digital e criptografia S/MIME. Regras de filtro organizam caixa de entrada. Responder a todos inclui todos destinatarios originais. SPF, DKIM e DMARC autenticam dominio remetente contra spoofing."},

  {"id":"con-inf-15","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informatica — Computacao em Nuvem — SaaS e Gov.br: SaaS: software pronto via navegador (Gmail, Office 365). IaaS: infraestrutura virtualizada (EC2, Azure VM). PaaS: ambiente de desenvolvimento (App Engine). Nuvem publica compartilhada; privada dedicada; hibrida combina. Elasticidade escala recursos sob demanda. gov.br: portal unificado de servicos publicos federais com login unico. Assinatura eletronica gov.br integrada. Dados em nuvem exigem conformidade LGPD e politicas de residencia."},

  {"id":"con-inf-16","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informatica — Criptografia Aplicada — TLS e Certificados: HTTPS usa TLS sobre HTTP: confidencialidade, integridade, autenticacao do servidor. Certificado digital X.509 emitido por Autoridade Certificadora (CA). Cadeia de confianca: raiz → intermediaria → servidor. ICP-Brasil: infraestrutura de chaves publicas brasileira para assinatura legal. Chave simetrica AES para bulk; RSA/ECC para troca de chaves. Hash SHA-256 garante integridade. HSTS forca HTTPS. Certificado expirado ou autoassinado gera alerta no navegador."},

  {"id":"con-inf-17","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informatica — Banco de Dados — PostgreSQL: PostgreSQL: SGBD relacional open source. Tipos avancados: JSONB, arrays, UUID, geometricos. DDL: CREATE TABLE, ALTER, DROP. Constraints: PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK, NOT NULL. Indices B-tree, GIN para JSONB. Transacoes ACID. JOINs: INNER, LEFT, RIGHT, FULL. Window functions: ROW_NUMBER, RANK. EXPLAIN ANALYZE mostra plano de execucao. Extensao PostGIS para dados geoespaciais. Replica streaming para alta disponibilidade."},

  {"id":"con-inf-18","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informatica — Normalizacao de Banco de Dados: 1FN: valores atomicos, sem grupos repetitivos. 2FN: 1FN + atributos nao-chave dependem da chave inteira (eliminar dependencia parcial). 3FN: 2FN + nenhum atributo nao-chave depende de outro nao-chave (eliminar dependencia transitiva). BCNF: toda determinante e chave candidata. Desnormalizacao controlada para performance em data warehouse. Anomalias: insercao, atualizacao, exclusao. Modelo entidade-relacionamento precede normalizacao logica."},

  {"id":"con-inf-19","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informatica — Redes Sem Fio — Wi-Fi e Seguranca: IEEE 802.11: Wi-Fi. Bandas 2,4 GHz (alcance, interferencia) e 5 GHz (velocidade). WPA3 substitui WPA2 com SAE resistente a forca bruta. SSID oculto nao e seguranca real. WPS vulneravel — desabilitar. Rogue AP imita rede legitima. 802.1X autenticacao enterprise com RADIUS. Canais sobrepostos em 2,4 GHz: usar 1, 6, 11. Mesh Wi-Fi estende cobertura. QoS prioriza trafego VoIP e video."},

  {"id":"con-inf-20","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informatica — IPv6 — Enderecamento e Transicao: IPv6: 128 bits, notacao hexadecimal com dois-pontos, compressao :: para zeros consecutivos. Tipos: unicast global (2000::/3), link-local (fe80::/10), loopback ::1. ICMPv6 substitui ARP (Neighbor Discovery). SLAAC autoconfiguracao sem DHCP. Dual stack executa IPv4 e IPv6 simultaneamente. NAT64/DNS64 traduzem para legado IPv4. IPSec integrado nativamente. Header simplificado versus IPv4. Multicast obrigatorio, broadcast inexistente."},

  {"id":"con-inf-21","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informatica — VPN e Acesso Remoto Seguro: VPN cria tunel criptografado sobre internet publica. Site-to-site conecta filiais; remote access conecta usuario individual. Protocolos: IPsec, OpenVPN, WireGuard (moderno, leve). SSL VPN via navegador. Split tunnel: trafego corporativo pela VPN, resto direto. Kill switch bloqueia internet se VPN cai. MFA obrigatorio em acesso remoto. RDP (3389) exposto e vetor de ataque — usar VPN antes. Zero Trust nao confia na rede perimetral."},

  {"id":"con-inf-22","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informatica — IDS, IPS e SIEM: IDS (Intrusion Detection System): detecta anomalias e alerta — modo passivo. IPS (Prevention): bloqueia trafego malicioso inline. Assinatura versus deteccao comportamental/heuristica. SIEM agrega logs de firewalls, servidores, endpoints — correlaciona eventos. SOC monitora alertas 24/7. Falso positivo versus falso negativo. Honeypot atrai atacantes para analise. NetFlow analisa metadados de trafego. Resposta a incidentes: conter, erradicar, recuperar, licoes aprendidas."},

  {"id":"con-inf-23","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informatica — OWASP — Broken Access Control (A01): Controle de acesso quebrado: usuario acessa recurso sem autorizacao. IDOR: trocar ID na URL (/api/user/123 → /api/user/124). Escalação de privilegio horizontal e vertical. CORS mal configurado expoe APIs. Forca bruta em endpoints sem rate limit. Mitigacao: RBAC, ABAC, verificar autorizacao server-side em cada requisicao, negar por padrao, testes de penetracao regulares. Nunca confiar apenas em ocultacao de URL ou parametros obscuros."},

  {"id":"con-inf-24","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informatica — OWASP — Cryptographic Failures (A02): Falhas criptograficas: dados sensiveis sem criptografia em transito ou repouso. Algoritmos obsoletos MD5, SHA-1, DES, RC4. Chaves hardcoded no codigo. TLS desabilitado ou versao antiga (SSLv3, TLS 1.0). Senhas em texto claro ou hash sem salt. Mitigacao: AES-256, TLS 1.3, bcrypt/Argon2 para senhas, rotacao de chaves, HSM para chaves criticas. Classificar dados sensiveis e aplicar criptografia proporcional ao risco."},

  {"id":"con-inf-25","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informatica — OWASP — Injection Detalhado (A03): Injection: SQL, NoSQL, OS command, LDAP. SQLi: concatenar input em query — ' OR 1=1--. Tipos: in-band, blind boolean, blind time-based, out-of-band. Prepared statements (parametrizacao) previne SQLi. XSS e injection em contexto HTML. Command injection via campos que invocam shell. Validacao whitelist preferivel a blacklist. ORM nao elimina risco se queries raw mal usadas. Escapar output conforme contexto (HTML, JS, SQL). WAF camada adicional, nao substituto."},

  {"id":"con-inf-26","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informatica — LGPD — Bases Legais e Direitos: Lei 13.709/2018: dados pessoais exigem base legal. Bases: consentimento, execucao de contrato, obrigacao legal, protecao da vida, tutela da saude, interesse legitimo, protecao do credito, funcao publica. Dados sensiveis (saude, biometria, origem racial) exigem base especifica reforcada. Direitos do titular: confirmacao, acesso, correcao, anonimizacao, portabilidade, eliminacao, revogacao consentimento. ANPD fiscaliza. DPO encarregado obrigatorio. Incidente de seguranca: comunicar ANPD e titulares quando risco relev"},

  {"id":"con-inf-27","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informatica — LibreOffice Base e Acesso a Dados: Base integra HSQLDB embutido ou conecta MySQL, PostgreSQL, ODBC. Formularios vinculados a tabelas para CRUD. Consultas SQL visual ou manual. Relatorios formatados para impressao. Relacionamentos entre tabelas com integridade referencial. Exportar para Calc para analise. Macro Basic automatiza tarefas. Diferenca de Calc (planilha) e Base (SGBD relacional). Conexao JDBC para bancos remotos. Backup regular de arquivo ODB."},

  {"id":"con-inf-28","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informatica — Power BI e Visualizacao de Dados: Power BI: business intelligence Microsoft. Importar de Excel, SQL, APIs. Modelo: tabelas, relacionamentos, medidas DAX. Visualizacoes: barras, linhas, mapas, KPIs. Dashboard interativo com filtros slicers. Refresh agendado em Power BI Service. DAX: CALCULATE, SUMX, RELATED. Row Level Security restringe dados por usuario. Alternativas: Google Looker Studio, Tableau, Metabase open source. ETL com Power Query transforma dados antes do modelo."},

  {"id":"con-inf-29","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informatica — Inteligencia Artificial Generativa: LLMs geram texto; difusao gera imagens (Stable Diffusion, DALL-E). RAG combina busca vetorial com LLM para respostas fundamentadas. Embeddings representam texto em vetores densos. Prompt engineering: instrucoes claras, exemplos few-shot, chain-of-thought. Alucinacao: modelo inventa fatos — mitigar com RAG e validacao. Fine-tuning adapta modelo a dominio. Tokens limitam contexto. API OpenAI, Anthropic, modelos open source Llama. Etica: vies, copyright, deepfakes."},

  {"id":"con-inf-30","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informatica — Resposta a Incidentes de Ransomware: Ransomware criptografa arquivos e exige resgate em criptomoeda. Vetores: phishing, RDP exposto, vulnerabilidades nao corrigidas. Contencao: isolar maquina infectada da rede. Nao pagar ransome preferencialmente — sem garantia de recuperacao. Backup offline 3-2-1 essencial. Restaurar de backup limpo apos erradicacao. Forense identifica vetor de entrada. Segmentacao de rede limita propagacao lateral. EDR detecta comportamento suspeito. Plano de continuidade testado periodicamente."},

  {"id":"con-inf-31","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informatica — Linux — Comandos Essenciais: Shell bash: ls lista, cd muda diretorio, pwd mostra caminho, cp copia, mv move/renomeia, rm remove, mkdir cria pasta. Permissoes: chmod, chown. Usuario root versus comum, sudo eleva privilegio. grep busca texto, find localiza arquivos, pipe | redireciona saida. systemctl gerencia servicos. apt/yum instalam pacotes. Logs em /var/log. SSH acesso remoto seguro porta 22. Editor nano/vim. Processos: ps, top, kill."},

  {"id":"con-inf-32","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informatica — Formatos de Arquivo e Interoperabilidade: ODF (OpenDocument): ODT texto, ODS planilha, ODP apresentacao — padrao ISO open source. Office Open XML: DOCX, XLSX, PPTX (Microsoft). PDF/A para arquivamento de longo prazo. CSV texto separado por virgula, encoding UTF-8. JSON estrutura dados web; XML markup extensivel. Markdown sintaxe leve para documentacao. ZIP comprime multiplos arquivos. Base64 codifica binario em texto. MIME type identifica formato em HTTP."},

  {"id":"con-inf-33","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informatica — Git — Controle de Versao Basico: Git distribui historico localmente. git init, clone, add, commit, push, pull. Branch isola desenvolvimento; merge integra. Conflito quando mesma linha editada. git log historico; git diff diferencas. .gitignore exclui arquivos. GitHub/GitLab hospedam remotos. Pull request revisa codigo antes merge. Rebase reescreve historico linear. Tag marca versoes (v1.0). Stash guarda mudancas temporarias. Commit atomico com mensagem descritiva."},

  {"id":"con-inf-34","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informatica — APIs REST e Integracao: REST: arquitetura stateless sobre HTTP. Recursos identificados por URL. Verbos: GET le, POST cria, PUT substitui, PATCH atualiza parcial, DELETE remove. Status: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Error. JSON corpo padrao. Headers: Authorization Bearer token, Content-Type. OpenAPI/Swagger documenta. Rate limiting protege API. Versionamento /v1/. CORS controla origens no browser."},

  {"id":"con-inf-35","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informatica — JSON e XML — Estruturas de Dados: JSON: pares chave-valor, arrays, tipos string/number/boolean/null. Leve, nativo JavaScript. JSON.parse e JSON.stringify. XML: tags aninhadas, atributos, schema XSD valida estrutura. Namespaces evitam colisao. XPath consulta XML. SOAP usa XML sobre HTTP (legado). JSON predominante em APIs modernas. YAML alternativa legivel para config (Docker, CI). Validacao JSON Schema define contrato de dados."},

  {"id":"con-inf-36","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informatica — Automacao RPA e Produtividade: RPA (Robotic Process Automation): bots simulam acoes humanas em sistemas. UiPath, Automation Anywhere, Blue Prism. Casos: digitacao repetitiva, extracao de dados, conciliacao. Diferenca de macros: RPA cruza multiplos aplicativos. Regras de negocio codificadas. Monitoramento de excecoes. Combinar com OCR para documentos escaneados. Limitacoes: sistemas legados sem API, manutencao quando UI muda. Hyperautomation integra RPA, IA e BPM."},

  {"id":"con-inf-37","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informatica — IoT — Internet das Coisas: IoT conecta sensores e atuadores a internet. Protocolos leves: MQTT pub/sub, CoAP REST-like. Edge computing processa localmente reduzindo latencia. Seguranca critica: dispositivos com senha padrao, firmware desatualizado. Botnet Mirai explorou cameras. Segmentacao VLAN isola IoT. Smart cities: iluminacao, transito, lixo. Industria 4.0: manutencao preditiva. Wearables monitoram saude. IPv6 escala enderecos para bilhoes de dispositivos."},

  {"id":"con-inf-38","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informatica — Acessibilidade Digital — e-MAG/WCAG: WCAG 2.1: Perceivable, Operable, Understandable, Robust. Nivel A, AA (obrigatorio gov.br), AAA. Alt text em imagens. Contraste minimo 4.5:1. Navegacao por teclado. Legendas em video. ARIA labels para leitores de tela. e-MAG adapta WCAG ao contexto brasileiro. Lei Brasileira de Inclusao (13.146/2015) exige acessibilidade. Testar com NVDA, VoiceOver. Formularios com labels associados. Nao depender apenas de cor para informacao."},

  {"id":"con-inf-39","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informatica — Microsoft Teams e Videoconferencia: Teams integra chat, reuniao, arquivos SharePoint. Zoom focado em videoconferencia. Compartilhamento de tela e quadro branco. Gravacao na nuvem. Breakout rooms para subgrupos. MFA protege conta. Egress bandwidth minimo 1,5 Mbps. Etiqueta: mutar microfone, camera em ambiente profissional. Teams vs Meet vs Zoom: licenciamento e integracao ecossistema. WebRTC base tecnologica browser. Phishing via convite falso de reuniao."},

  {"id":"con-inf-40","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informatica — Google Workspace — Docs e Drive: Google Docs colaborativo em tempo real. Drive armazena 15 GB gratis. Compartilhamento: visualizador, comentarista, editor. Sheets equivalente Calc. Forms cria formularios. Gmail, Calendar integrados. Versao offline via extensao Chrome. DLP empresarial controla vazamento. Diferenca de LibreOffice local versus nuvem Google. Exportar DOCX, PDF. Apps Script automatiza tarefas JavaScript. SSO SAML enterprise."},

  {"id":"con-inf-41","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informatica — Backup, DR e Continuidade: Backup full, incremental (desde ultimo full), diferencial (desde ultimo full acumulado). Regra 3-2-1: 3 copias, 2 midias, 1 offsite. RTO: tempo maximo para restaurar. RPO: perda de dados toleravel. DR site secundario ativo-passivo ou ativo-ativo. Teste de restore valida backup — backup sem restore testado e incompleto. Snapshot instantaneo VM. Criptografar backup em repouso. Air gap protege contra ransomware."},

  {"id":"con-inf-42","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informatica — Virtualizacao e Containers: Hypervisor Tipo 1 (bare metal: VMware ESXi, Hyper-V) e Tipo 2 (sobre SO: VirtualBox). VM simula hardware completo. Container compartilha kernel do host — mais leve. Docker: imagem imutavel, container instancia, Dockerfile build, docker-compose orquestra multiplos. Kubernetes (K8s) orquestra containers em cluster — pod, deployment, service. Namespace isola recursos. VM versus container: isolamento versus densidade. OCI padroniza imagens."},

  {"id":"con-inf-43","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informatica — NoSQL — MongoDB e Redis: MongoDB documento JSON-like (BSON). Collections e documents. Queries flexiveis, schema dinamico. Indices simples e compostos. Aggregation pipeline. Redis chave-valor in-memory. Estruturas: strings, hashes, lists, sets, sorted sets. Cache, session store, pub/sub, filas. TTL expira chaves. Persistencia RDB snapshots e AOF log. CAP theorem: consistencia, disponibilidade, tolerancia a particao — escolher dois. MongoDB escala horizontal sharding."},

  {"id":"con-inf-44","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informatica — Assinatura Digital ICP-Brasil: Certificado digital A1 (arquivo software, 1 ano) e A3 (token/cartao, ate 3 anos). Assinatura tem mesma validade juridica de manuscrita (MP 2.200-2/2001). ICP-Brasil hierarquia: AC-Raiz ITI → AC → AR emitem certificados. e-CPF, e-CNPJ, e-Notariado, e-Proc. Verificar cadeia e validade no verificador ITI. Carimbo do tempo comprova existencia em data. DocuSign e similares fora ICP tem valor contratual, nao equivalencia legal plena em todos atos."},

  {"id":"con-inf-45","area":"Concursos","disciplina":"Informatica","namespace":"concursos_informatica",
   "texto":"Concursos Informatica — Zero Trust — Seguranca Perimetral: Zero Trust: nunca confiar, sempre verificar. Identidade como perimetro. MFA obrigatorio. Microsegmentacao limita movimento lateral. Least privilege acesso minimo necessario. Verificacao continua dispositivo e contexto. SDP Software Defined Perimeter oculta recursos. NIST SP 800-207 define arquitetura. Implementacao: IAM forte, logging, analytics comportamental."},

  # ══════════════════════════════════════════════════════
  # MATÉRIA 6: ADMINISTRAÇÃO PÚBLICA (concursos_adm_publica)
  # ══════════════════════════════════════════════════════

  {"id":"con-ap-01","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administração Pública — Conceitos Fundamentais e PODC: ADMINISTRAÇÃO: processo de planejar, organizar, dirigir e controlar o uso de recursos para atingir objetivos organizacionais. EFICIÊNCIA: fazer certo as coisas — relação entre recursos utilizados e resultados obtidos (produtividade, sem desperdício). EFICÁCIA: fazer as coisas certas — atingir os objetivos propostos (independente dos recursos). EFETIVIDADE: impacto real e duradouro das ações sobre o público-alvo — vai além da eficácia, mede a mudança social. FUNÇÕES ADMINISTRATIVAS (PODC): PLANEJAMENTO — definir objetivos e caminhos para alcançá-los; estratégico (longo prazo, toda org), tático (médio prazo, departamento), operacional (curto prazo, tarefas). ORGANIZAÇÃO — estruturar recursos e atribuir responsabilidades; departamentalização, hierarquia. DIREÇÃO (liderança) — motivar, liderar, comunicar, coordenar pessoas para execução. CONTROLE — monitorar e avaliar resultados, comparar com planejado, corrigir desvios; tipos: prévio, concomitante, posterior. CHEFIA vs LIDERANÇA: chefia — autoridade formal; liderança — influência e motivação."},

  {"id":"con-ap-02","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administração Pública — Evolução Histórica no Brasil: MODELO PATRIMONIALISTA (antes de 1930): não distinção entre esfera pública e privada — Estado como extensão do governante; nepotismo, corrupção, clientelismo estrutural. MODELO BUROCRÁTICO (a partir de 1937 — Vargas/DASP): reação ao patrimonialismo; características weberianas — formalismo, impessoalidade, hierarquia, especialização, mérito (concurso público); DASP (Departamento Administrativo do Serviço Público, 1938) — primeiro esforço de profissionalização. Problema: rigidez, ineficiência, auto-referência. REFORMA GERENCIAL (1995 — Bresser-Pereira — PDRAE): reação à burocracia excessiva; inspirada no New Public Management; conceitos: agências executivas, OS, OSCIP, contrato de gestão, avaliação por resultados, foco no cidadão-cliente, descentralização, eficiência. EC 19/1998: introduz princípio da eficiência na CF (art. 37); avaliação periódica de desempenho; teto remuneratório. Governo DIGITAL (pós-2016): transformação digital dos serviços públicos; Decreto 10.332/2020 — Estratégia de Governo Digital; plataforma gov.br; desburocratização."},

  {"id":"con-ap-03","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administração Pública — Estrutura Organizacional: TIPOS DE ESTRUTURA: LINEAR (ou militar): unidade de comando, linha direta de autoridade, simples mas rígida; FUNCIONAL: especialização por função, múltiplos chefes por função — viola unidade de comando; LINHA-STAFF (linear com assessoria): combina linha direta com órgãos de assessoria (staff) especializados — mais comum nas organizações; MATRICIAL: combina departamentalização funcional e por projeto simultaneamente — funcionários reportam a dois chefes; flexível mas geradora de conflitos; REDE: organizações virtuais interligadas, alta flexibilidade. DEPARTAMENTALIZAÇÃO: divisão interna da organização. Tipos: FUNCIONAL (por função: RH, finanças, produção — especialização); POR PRODUTO/SERVIÇO (cada produto tem sua estrutura completa); POR CLIENTE (foco no tipo de cliente); POR TERRITÓRIO/GEOGRÁFICA (regiões); POR PROCESSO (fluxo de trabalho); MISTA (combinação). AMPLITUDE DE CONTROLE: número de subordinados por gestor — amplitude larga → estrutura achatada; estreita → estrutura alta/piramidal."},

  {"id":"con-ap-04","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administração Pública — Planejamento Estratégico e BSC: MISSÃO: razão de existir da organização — por que existimos, o que fazemos, para quem. VISÃO: estado futuro desejado — onde queremos chegar. VALORES: princípios que norteiam o comportamento organizacional. ANÁLISE SWOT (FOFA em português): Strengths (Forças — internas, positivas), Weaknesses (Fraquezas — internas, negativas), Opportunities (Oportunidades — externas, positivas), Threats (Ameaças — externas, negativas); forças e fraquezas = análise interna; oportunidades e ameaças = análise externa (PEST: político, econômico, social, tecnológico). OBJETIVOS SMART: Specific (específico), Measurable (mensurável), Achievable (atingível), Relevant (relevante), Time-bound (com prazo). BSC (BALANCED SCORECARD — Kaplan e Norton): 4 perspectivas equilibradas: FINANCEIRA (resultado econômico), CLIENTES (satisfação e valor), PROCESSOS INTERNOS (excelência operacional), APRENDIZADO E CRESCIMENTO (capital humano e inovação) — na AP: substitui 'financeira' por perspectiva social/cidadão."},

  {"id":"con-ap-05","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administração Pública — Liderança e Motivação: TEORIAS DE CONTEÚDO (O QUÊ motiva): MASLOW — hierarquia de necessidades em pirâmide: fisiológicas→segurança→sociais/amor→estima→autorrealização; as inferiores devem ser satisfeitas antes das superiores. HERZBERG — dois fatores: HIGIÊNICOS (extrínsecos — salário, supervisão, condições — evitam insatisfação mas não motivam) e MOTIVACIONAIS (intrínsecos — realização, reconhecimento, crescimento — geram satisfação). McCLELLAND — três necessidades aprendidas: realização, afiliação e poder. TEORIAS DE PROCESSO (COMO motiva): VROOM — expectância: motivação = valência × instrumentalidade × expectância (V×I×E). ADAMS — equidade: compara sua relação esforço/recompensa com a dos outros — injustiça percebida desmotiva. TEORIAS DE LIDERANÇA: ESTILOS (Lewin): autocrático (centraliza decisão), democrático (participativo) e laissez-faire (delegação total). SITUACIONAL (Hersey e Blanchard): liderança adapta-se ao nível de maturidade do subordinado (M1-M4 → E1 determinar; E2 persuadir; E3 compartilhar; E4 delegar). McGregor — Teoria X (ser humano evita trabalho, precisa de controle) vs Y (trabalho natural, potencial de autorrealização)."},

  {"id":"con-ap-06","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administração Pública — Gestão de Processos e BPM: PROCESSO: conjunto de atividades interrelacionadas que transformam insumos em produtos/serviços com valor para o cliente. BPM (Business Process Management): abordagem de gestão focada em processos — identificar, modelar, executar, monitorar e otimizar processos de negócio. MAPEAMENTO DE PROCESSOS: FLUXOGRAMA — representação gráfica sequencial; BPMN (Business Process Model and Notation) — notação padrão internacional para modelagem. TIPOS DE ATIVIDADES: manual (humana), automatizada (sistema), tarefa de usuário. GATEWAYS (desvios): exclusivo (XOR — apenas um caminho), paralelo (AND — todos os caminhos), inclusivo (OR — um ou mais). MELHORIA CONTÍNUA: CICLO PDCA (Plan-Do-Check-Act / Deming): planejar, executar, verificar, agir corretivamente — ciclo de melhoria incremental. KAIZEN: filosofia japonesa de melhoria contínua, pequenas melhorias diárias. LEAN (Manufatura Enxuta): eliminar desperdícios (7 desperdícios: superprodução, espera, transporte, processamento desnecessário, estoque, movimentação, defeitos). SEIS SIGMA: redução de defeitos a 3,4 por milhão — DMAIC (Define, Measure, Analyze, Improve, Control)."},

  {"id":"con-ap-07","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administração Pública — Orçamento Público: CICLO ORÇAMENTÁRIO: planejamento → elaboração → aprovação → execução → controle e avaliação. INSTRUMENTOS (art. 165 CF/88): PPA (Plano Plurianual — 4 anos, diretrizes, objetivos e metas — elaborado no 1° ano de governo para os 3 anos seguintes + 1° do próximo); LDO (Lei de Diretrizes Orçamentárias — anual, metas fiscais, prioridades para a LOA, avaliação do PPA — vigência exercício seguinte); LOA (Lei Orçamentária Anual — orçamento do exercício, estimativa de receitas e fixação de despesas — fiscal, seguridade social e investimentos das estatais). PRINCÍPIOS ORÇAMENTÁRIOS: unidade, universalidade, anualidade, exclusividade, não-vinculação da receita (impostos), equilíbrio, legalidade, publicidade. EXECUÇÃO: EMPENHO (reserva do crédito — nota de empenho), LIQUIDAÇÃO (verificação do direito do credor), PAGAMENTO (ordem bancária). RECEITA: previsão e arrecadação; classificada como corrente (impostos, taxas, contribuições) ou capital (operações de crédito, alienações). EMENDAS PARLAMENTARES (EC 105/2019 e EC 126/2022): individuais (impositivas — 1,2% da RCL), de bancada estadual, de comissão."},

  {"id":"con-ap-08","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administração Pública — Ética no Serviço Público: DECRETO 1.171/1994 — Código de Ética Profissional do Servidor Público Civil Federal: PRINCÍPIOS: dignidade, decoro, zelo, eficácia, consciência dos princípios morais. DEVERES DO SERVIDOR: lealdade às instituições, probidade, cortesia, assiduidade, eficiência. VEDAÇÕES: usar cargo para pressão, receber vantagens indevidas, descumprir normas, deixar de atender ao público. COMISSÃO DE ÉTICA: composição de 3 servidores estáveis em cada órgão — apura infrações éticas. PENA: censura — não afeta promoção ou progressão funcional. LEI 12.813/2013 — CONFLITO DE INTERESSES: situação onde interesses pessoais do agente público podem influenciar o exercício de função pública. QUARENTENA: agentes de alto escalão — prazo de 6 meses (até 1 ano em alguns casos) para exercer atividade no setor privado relacionada com a função. CÓDIGO DE CONDUTA DO GOVERNO FEDERAL (Dec. 6.029/2007): sistema de gestão da ética — CGU centraliza. NEPOTISMO: vedado pelo STF (Súmula Vinculante n° 13, 2008) — proibida nomeação de cônjuge, companheiro ou parente até 3° grau para cargos em comissão."},

  {"id":"con-ap-09","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administração Pública — Gestão de Pessoas e Competências: GESTÃO POR COMPETÊNCIAS: identificar, desenvolver e avaliar as competências necessárias para atingir os objetivos organizacionais. COMPETÊNCIA: capacidade de mobilizar saberes para agir com performance em determinado contexto. CHA: CONHECIMENTO (saber — conceitos, teorias, informações), HABILIDADE (saber fazer — aplicação prática), ATITUDE (querer fazer — disposição, motivação, valores). COMPETÊNCIAS INDIVIDUAIS: específicas do cargo; competências organizacionais: diferenciam a organização no mercado. MAPEAMENTO: identificar gap entre as competências existentes e as requeridas. RECRUTAMENTO (encontrar candidatos): interno (promoção, remanejamento — vantagem: motivação; desvantagem: conflito) ou externo (novos talentos — vantagem: sangue novo; desvantagem: custo). SELEÇÃO: identificar o candidato mais aderente ao perfil — técnicas: análise de currículo, provas de conhecimento, testes psicológicos, entrevistas, dinâmicas de grupo. AVALIAÇÃO DE DESEMPENHO: mensurar resultados — por competências, por objetivos (APO), 360 graus (múltiplas fontes: chefe, pares, subordinados, autoavaliação). TREINAMENTO: suprir gap de capacidade atual; DESENVOLVIMENTO: preparar para funções futuras. TRILHAS DE APRENDIZAGEM: percurso individualizado de desenvolvimento."},

  {"id":"con-ap-10","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administração Pública — Nova Lei de Licitações (Lei 14.133/2021): Substituiu a Lei 8.666/93, a Lei 10.520/02 (Pregão) e a Lei 12.462/11 (RDC). FASE PREPARATÓRIA (interna): planejamento da contratação, estudo técnico preliminar, avaliação de riscos (gerenciamento de riscos), definição do objeto, elaboração do edital. FASE EXTERNA (publicação até homologação): divulgação do edital (prazo mínimo para propostas: 8 a 60 dias conforme modalidade), sessão de abertura das propostas, julgamento, habilitação (regra geral: posterior ao julgamento — inversão de fases do pregão agora generalizada), recursos, homologação. REGISTRO DE PREÇOS (art. 82): contratação de fornecimentos, obras ou serviços frequentes — ata de registro de preços — possibilidade de adesão por não participantes (caroneiros, com limitações). CONTRATO ADMINISTRATIVO (arts. 89 a 154): cláusulas exorbitantes — alteração unilateral, rescisão unilateral, fiscalização, aplicação de penalidades; reequilíbrio econômico-financeiro. PENALIDADES (art. 156): advertência, multa, impedimento de licitar (até 3 anos), declaração de inidoneidade (3 a 6 anos)."},

  {"id":"con-ap-11","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administração Pública — Controle Interno, TCU e CGU: CONTROLE INTERNO (arts. 70-74 CF/88): cada Poder tem sistema próprio de controle interno — fiscalizar a execução orçamentária e financeira, comprovar a legalidade dos atos, avaliar os resultados, apoiar o controle externo. SISTEMA DE CONTROLE INTERNO DO PODER EXECUTIVO FEDERAL: CGU (Controladoria-Geral da União) — órgão central; realiza auditorias, correição, ouvidoria, transparência, prevenção e combate à corrupção. TCU (Tribunal de Contas da União — art. 71 CF): controle externo do Executivo, auxiliando o Congresso; 9 ministros; competências: apreciar contas do Presidente (emite parecer prévio — Congresso julga), JULGAR contas dos demais administradores de recursos federais, fiscalizar contratos, aplicar sanções (multa, inabilitação, declaração de inidoneidade), sustar atos ilegais. OUVIDORIA: canal de comunicação entre cidadão e administração — reclamações, denúncias, sugestões; obrigatória nos órgãos federais. TRANSPARÊNCIA: Lei 12.527/11 (LAI) e Portal da Transparência (gastos federais públicos); princípio da publicidade como regra, sigilo como exceção."},

  {"id":"con-ap-12","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administracao Publica — Governo Digital — EGD e Decreto 10.332/2020: Estrategia de Governo Digital 2020-2022 e continuidade em politicas posteriores. Principios: centrado no cidadao, participativo, integrado, inovador. gov.br login unico. Assinatura eletronica gov.br. Carteira de documentos digitais. Desburocratizacao e simplificacao de servicos. Interoperabilidade via Plataforma de Cidadania Digital. Avaliacao de maturidade digital. Transformacao digital exige mudanca cultural, nao apenas tecnologica."},

  {"id":"con-ap-13","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administracao Publica — Plataforma gov.br — Servicos Publicos Digitais: Portal gov.br centraliza servicos federais. Niveis prata e ouro de conta aumentam confiabilidade. Integracao CPf, INSS, Receita, Justica. Notificacoes push de prazos. API gov.br para integracao interorgaos. Acessibilidade WCAG AA obrigatoria. Metricas de uso e satisfacao NPS. Reducao filas presenciais. Identidade digital como infraestrutura critica. Continuidade exige plano de contingencia e redundancia."},

  {"id":"con-ap-14","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administracao Publica — Transparencia Ativa e Dados Abertos: Lei 12.527/2011 LAI: acesso a informacao publica e regra. Decreto 8.777/2016 politica de dados abertos. Portal dados.gov.br conjuntos machine-readable. Transparencia ativa: publicar sem solicitacao. Classificacao sigilo: ultrassecreta 25 anos, secreta 15, reservada 5. CGU e Controladoria monitoram compliance. Reutilizacao por sociedade civil e imprensa. Formato CSV, JSON, API REST preferidos."},

  {"id":"con-ap-15","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administracao Publica — Parcerias Publico-Privadas — Lei 11.079/2004: PPP: contrato administrativo com remuneracao vinculada desempenho. Modelos: patrocinada (tarifa + contraprestacao publica) e administrativa (tarifa insuficiente). Projeto de lei autorizativo previo. Analise de viabilidade e value for money. Reparticao objetiva de riscos. Garantias publicas limitadas. Unidade PPP no orgao. Duracao tipica 20-30 anos. Concessao patrocinada versus PPP — criterios de escolha."},

  {"id":"con-ap-16","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administracao Publica — Concessoes e Permissoes de Servicos Publicos: Lei 8.987/95 servicos publicos. Concessao: licitacao, contrato, tarifa ao usuario. Permissao: ato unilateral precario. Autorizacao: uso privativo bem publico. Reversao bens ao termino. Fiscalizacao agencia reguladora. Equilibrio economico-financeiro. Extincao: encampação, caducidade, rescisao, anulacao. ANTT rodovias, ANEEL energia. Qualidade regulada por indicadores e penalidades."},

  {"id":"con-ap-17","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administracao Publica — Terceiro Setor — MROSC Lei 13.019/2014: Marco Regulatorio Organizacoes Sociedade Civil. Termos colaboracao e fomento substituem convenio generico. Chamamento publico obrigatorio. Comissao avaliacao e parecer juridico. Plano de trabalho, metas, cronograma. Prestacao contas rigorosa. Proibicao caixa dois. OSCIP Lei 9.790/99 regime especial. Parceria nao gera vinculo empregaticio. Transparencia portal parcerias."},

  {"id":"con-ap-18","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administracao Publica — Avaliacao de Politicas Publicas: Ciclo: diagnostico, desenho, implementacao, avaliacao, ajuste. Tipos: ex ante (viabilidade), processo (implementacao fiel), resultado (impacto), ex post (custo-beneficio). Contrafactual e grupos controle quando possivel. Indicadores SMART. Evidencias para decisao baseada em dados. Comissao Nacional Avaliacao. Randomized controlled trials em programas sociais. Limitacoes: atribuicao causal, externalidades."},

  {"id":"con-ap-19","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administracao Publica — Indicadores e Metas no Setor Publico: IDG, IDHM, IPEA indicadores sociais. ODS Agenda 2030 metas globais. OKRs adaptados: Objective + Key Results trimestrais. KPI operacionais versus estrategicos. Benchmarking entre orgaos. Painel publico resultados. Meta fiscal LRF. Desempenho versus conformidade. Leading versus lagging indicators. Dashboard Power BI governamental. Alertas desvio meta automaticos."},

  {"id":"con-ap-20","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administracao Publica — Gestao por Resultados — GRP: GRP foca outcomes, nao apenas outputs. Contrato gestao entre entes. Metas quantificadas. Monitoramento continuo. Vinculacao orcamento desempenho ODD. Chile e Nova Zelandia referencias. Brasil experiencia MPOG. Avaliacao desempenho orgao. Consequencias manageriais. Diferenca gestao por processos burocraticos. Transparencia resultados ao cidadao."},

  {"id":"con-ap-21","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administracao Publica — Metodologias Ageis na Administracao Publica: Scrum: product owner, scrum master, sprints 2-4 semanas. Kanban fluxo continuo WIP limit. SAFe escala agile enterprise. Lean startup MVP testar hipoteses. Aplicacao: TI gov, reformulacao servicos. Barreiras: procurement tradicional, cultura hierarquica. Laboratorios inovacao gov (DIL, Enap). Design sprint Google Ventures 5 dias. Retrospectiva melhoria continua."},

  {"id":"con-ap-22","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administracao Publica — Design Thinking e Jornada do Cidadao: Empatia, definicao, ideacao, prototipacao, teste. Personas e mapa jornada identificam pain points. Servico publico centrado usuario. Prototipo baixa fidelidade antes desenvolvimento caro. Co-criacao com usuarios reais. NPS e CES medem experiencia. Simplificacao formularios. Unificacao pontos contato omnichannel. Gov.br reduz jornadas multiplas senhas."},

  {"id":"con-ap-23","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administracao Publica — Atendimento ao Cidadao e Ouvidoria: Ouvidoria canal direito peticao art 5 CF. Lei 13.460/2017 Carta Servicos prazos qualidade. Ouvidoria-Geral Uniao modelo. Manifestacao: reclamacao, sugestao, elogio, denuncia. SLA resposta tipico 30 dias. Ouvidor independente. Pesquisa satisfacao pos-atendimento. Integracao Consumidor.gov.br. Escuta ativa e feedback loop para gestor."},

  {"id":"con-ap-24","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administracao Publica — Compras Publicas Sustentaveis: Decreto 7.746/2012 sustentabilidade licitacoes. Criterio sustentabilidade fase julgamento. Especificacoes tecnicas ambientais. Logistica reversa. Fornecedores certificacao ISO 14001. Economia circular. PNAE agricultura familiar. Inclusao ME EPP LC 123. PNCP portal unico compras. Rastreabilidade cadeia. Reducao desperdicio alimentar orgaos publicos."},

  {"id":"con-ap-25","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administracao Publica — Pregao Eletronico — Lei 14.133/2021: Pregao modalidade preferencial bens servicos comuns. Sessao publica lances tempo real. Inversao fases: proposta antes habilitacao permitida. Microempresa desconto 5% empate. Negociacao preco com primeiro colocado. Impugnacao edital 3 dias uteis. Recursos administrativos. Sistema Compras.gov.br. Dispensa valor inferior limiar. Impugnacao e saneamento edital."},

  {"id":"con-ap-26","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administracao Publica — Fiscalizacao e Gestao de Contratos: Gestor e fiscal contrato Lei 14.133 art 117. Fiscal acompanha execucao, registra ocorrencias, comunica gestor. TAC termo ajustamento conduta. Glosa pagamento inadimplemento. Reequilibrio economico-financeiro art 124. Extincao rescisao unilateral. Garantia contratual 5% comum. Documentacao fotografica obra. Relatorio fiscalizacao periodico obrigatorio."},

  {"id":"con-ap-27","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administracao Publica — Gestao de Riscos na Administracao Publica: ISO 31000 gestao riscos. Matriz probabilidade x impacto. Riscos estrategicos, operacionais, conformidade, financeiros. Mapa calor visual. Planos mitigacao e contingencia. Comite riscos alta administracao. Continuidade negocios BCP. Risco licitatorio: sobrepreco, direcionamento. Auditoria interna valida controles. Appetite risco define tolerancia."},

  {"id":"con-ap-28","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administracao Publica — Continuidade de Negocios e Resiliencia: Plano continuidade negocios PCN identifica processos criticos. RTO RPO definidos. Site backup alternativo. Simulacao anual obrigatoria boas praticas. Crise cibernetica ransomware gov. Comunicacao crise pre-aprovada. Cadeia sucessao decisores. Armazenamento documentos essenciais offsite. ENAP guias resiliencia AP. Pandemia COVID teste continuidade."},

  {"id":"con-ap-29","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administracao Publica — Gestao Documental e Arquivo Publico: Lei 8.159/1991 Arquivo Nacional. Tabela temporalidade elimina ou guarda permanente. Digitalizacao validade legal MP 2.200-2. Guarda intermediaria e permanente. Procedencia respeitar origem documento. Eliminação com comissao permanente avaliacao. e-ARQ Brasil modelo arquivistico digital. LAI acesso documentos arquivados. Metadados Dublin Core."},

  {"id":"con-ap-30","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administracao Publica — LGPD na Administracao Publica: Orgao publico trata dados base legal especifica art 7 LGPD. Encarregado DPO obrigatorio. RIPD relatorio impacto alto risco. Compartilhamento dados entre orgaos com convenio. Portal transparencia versus dado pessoal. Anonimizacao estatisticas. Seguranca informacao ISO 27001. Incidente comunicar ANPD. Privacy by design servicos digitais."},

  {"id":"con-ap-31","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administracao Publica — Compliance e Integridade Publica: Programa integridade empresas e orgaos. Lei 12.846/2013 anticorrupcao empresas. Due diligence terceiros. Canal denuncias confidencial. Codigo etica. Treinamento anual servidores. Conflito interesses declaracao patrimonial. CGU avaliacao riscos corrupcao. Matriz responsabilizacao Dec 9.203/2017. Whistleblower protecao."},

  {"id":"con-ap-32","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administracao Publica — PNCP — Portal Nacional Contratacoes Publicas: Lei 14.133 integra PNCP centralizando editais contratos atas. Transparencia tempo real. API aberta dados. Alertas licitacoes empresas. Reducao cartel informacao assimétrica. Obrigatoriedade publicacao 24h. Historico contratacao fornecedor. Integracao Tribunais Contas. Facilita ME participar licitacao. Dados abertos formato estruturado."},

  {"id":"con-ap-33","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administracao Publica — Execucao Orcamentaria — SIAFI e SICONFI: SIAFI Sistema Integrado Admin Financeira Federal. Empenho tipos ordinario estimativo global. Liquidacao conferencia nota fiscal. Pagamento ordem bancaria. Restos a pagar processados nao processados. SICONFI padroniza contabilidade publica NBCASP. Conta unica Tesouro. Cronograma desembolso mensal. Bloqueio contingenciamento corte gastos."},

  {"id":"con-ap-34","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administracao Publica — Credito Adicional e Suplementacao: Credito adicional suplementar, especial, extraordinario. Lei autorizativa e decreto executivo. Fonte anulacao parcial ou excesso arrecadacao. Superavit financeiro. Operacoes credito internas externas. QO Quadro Detalhamento Despesa. LOA limita credito adicional 2% despesas correntes regra geral. Urgencia imprevisivel extraordinario."},

  {"id":"con-ap-35","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administracao Publica — Restos a Pagar e Despesas de Exercicios Anteriores: RP processados: empenhado liquidado nao pago 31/dez. Nao processados: empenhado nao liquidado. Inscricao automatica. Pagamento RP exercicio seguinte prioridade. Cancelamento prescricao ou insubsistencia. DEA regulariza passivo oculto. Impacto metas fiscais. Transparencia relatorio gestao fiscal. Controle TCU inadimplencia cronica."},

  {"id":"con-ap-36","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administracao Publica — LRF — Lei de Responsabilidade Fiscal Detalhada: Lei Complementar 101/2000. Limites despesa pessoal 50% RCL uniao 60% estados 60% municipios. Divida consolidada limites 60% RCL estados 120% municipios. Transparencia RREO bimestral RGF quadrimestral. Alerta fiscal trigger remedios. Proibicao aumento despesa sem fonte. Renuncia receita exige compensacao. Situacao fiscal calamidade publica flexibiliza metas temporariamente."},

  {"id":"con-ap-37","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administracao Publica — RREO e RGF — Relatorios Fiscais: RREO Relatorio Resumido Execucao Orcamentaria bimestral. Demonstra receita despesa meta fiscal. RGF Relatorio Gestao Fiscal quadrimestral. Comparativo limites LRF pessoal divida. Publicacao portal transparencia 30 dias. STN Secretaria Tesouro consolidacao. Alerta amarelo vermelho violacao limite. Credibilidade investidores depende transparencia fiscal."},

  {"id":"con-ap-38","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administracao Publica — Metas Fiscais e Arcabouco Fiscal: LDO anexo metas fiscais trienio. Primario, nominal, divida/PIB. Novo arcabouco fiscal LC 200/2023 substitui teto gastos. Meta superavit primario progressiva. Trigger mecanismo ajuste descumprimento. Fundo estabilizacao receitas. Exclusoes investimentos estruturantes. Conselho monitoramento. Credibilidade ancora expectativas. Comparacao meta realizado RREO."},

  {"id":"con-ap-39","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administracao Publica — Innovacao Publica e Laboratorios Gov: DIL Departamento Inovacao Lideranca Enap. Labs problemas complexos multidisciplinar. Hackathon gov dados abertos. Sandbox regulatorio fintech healthtech. GovTech startups solucoes publicas. Premio Innovare boas praticas. Fail fast aprendizado. Escalabilidade piloto bem sucedido. Barreiras juridicas inovacao — analise juridica upfront."},

  {"id":"con-ap-40","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administracao Publica — Competencias do Servidor Publico Federal: Lei 8.112/90 e EC 103/2019. Provimento concurso titulo formacao. Estagio probatorio 36 meses. Avaliacao desempenho influencia promocao. Capacitacao 80h anuais. Teletrabalho regulamentado. Licencas capacitacao interesse adm. Plano carreira especialidade. Remuneracao subsídio versus vencimento. Acumulacao vedada excecoes constitucionais."},

  {"id":"con-ap-41","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administracao Publica — Democracia Participativa e Conselhos Gestao: Conselhos municipais saude educacao assistencia paritarios. Conferencias nacionais setoriais. Orcamento participativo Porto Alegre modelo. Audiencias publicas obrigatorias. Consulta popular plebiscito referendo. Participacao digital plataformas Delibera Brasil. Conselho Nacional Politicas Publicas. Controle social complementa TCU. Legitimidade decisoes coletivas."},

  {"id":"con-ap-42","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administracao Publica — Federalismo e Cooperacao Federativa: Art 25-32 CF autonomia entes. SUS SNUC politicas cooperadas. Conselho Federativo Republica CF art 91 paragrafo unico. Comites intergestores Bipartite Tripartite. Fundo participacao FPE FPM. Guerra fiscal ICMS reducao. Pacto federativo reforma tributaria. Condicionalidades transferencias. Art 23 competencias comuns saude meio ambiente."},

  {"id":"con-ap-43","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administracao Publica — Politicas de Equidade e Inclusao: Politicas afirmativas cotas universidades. Reserva vagas PcD negros concursos. Igualdade racial PNPI. Mulheres STEM lideranca. LGBT+ nao discriminacao Dec 8.727/2016. Idoso Estatuto 10.741/2003. Acessibilidade urbano transporte. Interseccionalidade vulnerabilidades multiplas. Indicadores desigualdade Gini regional."},

  {"id":"con-ap-44","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administracao Publica — Gestao Ambiental na Administracao Publica: Politica Nacional Meio Ambiente Lei 6.938/1981. Licenciamento ambiental IBAMA estados. Supressao vegetacao compensacao. Concessao florestal. Compras verdes. Eficiencia energetica edificios publicos. Plano Logistica Sustentavel. Residuos solidos PNRS. Mudanca clima PNMC metas reducao GEE. Fiscalizacao multa embargo obra irregular."},

  {"id":"con-ap-45","area":"Concursos","disciplina":"Administracao Publica","namespace":"concursos_adm_publica",
   "texto":"Concursos Administracao Publica — Seguranca Publica e Politicas Integradas: SUSP Sistema Unico Seguranca Publica Lei 13.675/2018. Integracao PM PC PF inteligencia. PNUISP plano nacional. FUNDEB seguranca nao se aplica. Violencia domestica Maria da Penha 11.340/2006. Desarmamento Estatuto Desarmamento. Cameras corporais accountability. Drogas politica publica saude versus criminalizacao debate. Indicadores criminalidade Anuario BSP."},

  # ══════════════════════════════════════════════════════
  # MATÉRIA 7: DIREITO PROCESSUAL PENAL (concursos_direito_processual_penal)
  # ══════════════════════════════════════════════════════

  {"id":"con-dpp-01","area":"Concursos","disciplina":"Direito Processual Penal","namespace":"concursos_direito_processual_penal",
   "texto":"Concursos Direito Processual Penal — Ação Penal Pública e Privada: ação penal pública incondicionada pelo MP, pública condicionada à representação e privada pelo ofendido. Prazo de prescrição depende da pena aplicada. Conceito de incondicionada e condicionada, legitimação ativa e natureza da ação penal."},
  {"id":"con-dpp-02","area":"Concursos","disciplina":"Direito Processual Penal","namespace":"concursos_direito_processual_penal",
   "texto":"Concursos Direito Processual Penal — Prisão em Flagrante e Liberdade Provisória: flagrante próprio, impróprio e esperado. Auto de prisão em flagrante deve ser comunicado à autoridade competente em 24 horas. Liberdade provisória sem fiança, com fiança e com medidas cautelares diversas da prisão (art. 319 CPP)."},
  {"id":"con-dpp-03","area":"Concursos","disciplina":"Direito Processual Penal","namespace":"concursos_direito_processual_penal",
   "texto":"Concursos Direito Processual Penal — Inquérito Policial: finalidade de apurar autoria e materialidade. Oficiais de polícia judiciária, autoridade policial, prazo de 10 dias para preso e 30 dias para não preso. Reclamação por ilegalidade e arquivamento. Indisponibilidade da prova e sigilo do inquérito."},
  {"id":"con-dpp-04","area":"Concursos","disciplina":"Direito Processual Penal","namespace":"concursos_direito_processual_penal",
   "texto":"Concursos Direito Processual Penal — Provas e Nulidades: princípio do contraditório e ampla defesa. Provas ilícitas são inadmissíveis, salvo derivadas de prova lícita (teoria dos frutos da árvore envenenada). Nulidades absolutas e relativas. Exceção da verdade em crime hediondo não afasta nulidade de prova ilícita."},
  {"id":"con-dpp-05","area":"Concursos","disciplina":"Direito Processual Penal","namespace":"concursos_direito_processual_penal",
   "texto":"Concursos Direito Processual Penal — Recursos: apelação, embargos de declaração, recurso em sentido estrito, recurso especial e extraordinário. Prazo em dias úteis. Juiz natural, preclusão, publicação da sentença e início do prazo recursal. Recursos têm efeito devolutivo e, em alguns casos, suspensivo."},

  # ══════════════════════════════════════════════════════
  # MATÉRIA 8: DIREITO PROCESSUAL CIVIL (concursos_direito_processual_civil)
  # ══════════════════════════════════════════════════════

  {"id":"con-dpc-01","area":"Concursos","disciplina":"Direito Processual Civil","namespace":"concursos_direito_processual_civil",
   "texto":"Concursos Direito Processual Civil — Jurisdição e Ação: jurisdição é função do Estado de dizer o direito. Ação é o meio para suscitar o processo e obter tutela jurisdicional. Litisconsórcio, intervenção de terceiros e competência material, territorial e funcional."},
  {"id":"con-dpc-02","area":"Concursos","disciplina":"Direito Processual Civil","namespace":"concursos_direito_processual_civil",
   "texto":"Concursos Direito Processual Civil — Processo de Conhecimento: fases de postulatória, ordinatória, instrução e decisória. Petição inicial, resposta, audiência de conciliação e instrução. Produção de provas, depoimento pessoal, documentos e perícias."},
  {"id":"con-dpc-03","area":"Concursos","disciplina":"Direito Processual Civil","namespace":"concursos_direito_processual_civil",
   "texto":"Concursos Direito Processual Civil — Tutelas Provisórias: tutela de urgência e da evidência. Requisitos da tutela antecipada: probabilidade do direito e perigo de dano ou risco ao resultado útil do processo. Tutela cautelar e efeitos de provisório."},
  {"id":"con-dpc-04","area":"Concursos","disciplina":"Direito Processual Civil","namespace":"concursos_direito_processual_civil",
   "texto":"Concursos Direito Processual Civil — Recursos: apelação, agravo de instrumento, embargos de declaração, recurso especial e recurso extraordinário. Prazos, preclusão, juízo de admissibilidade e efeitos devolutivo e suspensivo."},
  {"id":"con-dpc-05","area":"Concursos","disciplina":"Direito Processual Civil","namespace":"concursos_direito_processual_civil",
   "texto":"Concursos Direito Processual Civil — Execução Civil: cumprimento de sentença, execução por quantia certa, medidas coercitivas e bloqueios eletrônicos. Embargos à execução, impugnação ao cumprimento, suspensão e extinção da execução."},

  # ══════════════════════════════════════════════════════
  # MATÉRIA 9: DIREITO TRIBUTÁRIO (concursos_direito_tributario)
  # ══════════════════════════════════════════════════════

  {"id":"con-dtr-01","area":"Concursos","disciplina":"Direito Tributario","namespace":"concursos_direito_tributario",
   "texto":"Concursos Direito Tributario — Sistema Tributário Nacional: tributos se dividem em impostos, taxas, contribuições de melhoria, contribuições especiais e empréstimos compulsórios. União, estados, DF e municípios têm competências tributárias definidas pela CF/88. Princípios da legalidade e da anterioridade tributária."},
  {"id":"con-dtr-02","area":"Concursos","disciplina":"Direito Tributario","namespace":"concursos_direito_tributario",
   "texto":"Concursos Direito Tributario — Princípios Tributários: legalidade, anterioridade, anterioridade nonagesimal, isonomia, vedação ao confisco, capacidade contributiva, non-reatividade. Princípio da vedação ao confisco impede tributos que possam aniquilar a base tributável."},
  {"id":"con-dtr-03","area":"Concursos","disciplina":"Direito Tributario","namespace":"concursos_direito_tributario",
   "texto":"Concursos Direito Tributario — Lançamento Tributário: lançamento por homologação, de ofício e por declaração. Crédito tributário nasce da ocorrência do fato gerador e da definição da base de cálculo. Notificação do lançamento e possibilidade de impugnação administrativa."},
  {"id":"con-dtr-04","area":"Concursos","disciplina":"Direito Tributario","namespace":"concursos_direito_tributario",
   "texto":"Concursos Direito Tributario — Execução Fiscal: inscrição em dívida ativa, Certidão de Dívida Ativa (CDA) como título executivo. Execução fiscal ajuizada pela União, estados, DF e municípios para cobrança de créditos tributários. Suspensão e extinção do crédito tributário."},
  {"id":"con-dtr-05","area":"Concursos","disciplina":"Direito Tributario","namespace":"concursos_direito_tributario",
   "texto":"Concursos Direito Tributario — Crimes contra a Ordem Tributária: Lei 8.137/90 e Lei 10.522/02. Sonegação fiscal, fraude à fiscalização, emissão de documento falso, omissão de declaração. Penas de reclusão e multa. Autoridade policial competente e ação penal pública."},

  # ══════════════════════════════════════════════════════
  # MATÉRIA 9: DIREITO CIVIL (concursos_direito_civil)
  # ══════════════════════════════════════════════════════

  {"id":"con-dtc-01","area":"Concursos","disciplina":"Direito Civil","namespace":"concursos_direito_civil",
   "texto":"Concursos Direito Civil — Parte Geral: personalidade jurídica, capacidade, domicílio, bens e fatos jurídicos. Negócios jurídicos: elementos, condições e forma. Vícios de consentimento: erro, dolo, coação, estado de perigo e lesão."},
  {"id":"con-dtc-02","area":"Concursos","disciplina":"Direito Civil","namespace":"concursos_direito_civil",
   "texto":"Concursos Direito Civil — Obrigações e Contratos: classificação das obrigações (de dar, fazer, não fazer, solidária, divisível, indivisível). Contratos: livre negociação, boa-fé objetiva, cláusulas abusivas, execução específica, resolução e indenização por inadimplência."},
  {"id":"con-dtc-03","area":"Concursos","disciplina":"Direito Civil","namespace":"concursos_direito_civil",
   "texto":"Concursos Direito Civil — Responsabilidade Civil: responsabilidade subjetiva por culpa e objetiva por risco. Elementos: conduta, dano, nexo causal e culpa. Indenização por danos materiais, morais e estéticos. Excludentes: estado de necessidade, estrito cumprimento de dever legal, legítima defesa."},
  {"id":"con-dtc-04","area":"Concursos","disciplina":"Direito Civil","namespace":"concursos_direito_civil",
   "texto":"Concursos Direito Civil — Direitos Reais: posse, propriedade, usufruto, uso, habitação, servidões e condomínio. Aquisição da propriedade: contrato e registro. Ação de usucapião, proteção possessória e meio de tutela da propriedade."},
  {"id":"con-dtc-05","area":"Concursos","disciplina":"Direito Civil","namespace":"concursos_direito_civil",
   "texto":"Concursos Direito Civil — Família e Sucessões: casamento, união estável, regime de bens, filiação, guarda e alimentos. Sucessão legítima e testamentária, herdeiros necessários, inventário e partilha. Direito de representação e colação."},

  # ══════════════════════════════════════════════════════
  # MATÉRIA 10: DIREITO TRABALHISTA (concursos_direito_trabalhista)
  # ══════════════════════════════════════════════════════

  {"id":"con-dtt-01","area":"Concursos","disciplina":"Direito Trabalhista","namespace":"concursos_direito_trabalhista",
   "texto":"Concursos Direito Trabalhista — Contrato de Trabalho: relação entre empregado e empregador, subordinação, onerosidade, pessoalidade e continuidade. Tipos de contrato: prazo indeterminado, determinado, intermitente, teletrabalho, trabalho temporário."},
  {"id":"con-dtt-02","area":"Concursos","disciplina":"Direito Trabalhista","namespace":"concursos_direito_trabalhista",
   "texto":"Concursos Direito Trabalhista — Jornada e Remuneração: jornada normal de 8 horas/44 horas semanais, horas extras, adicional noturno, descanso semanal remunerado, férias, FGTS. Remuneração inclui salário, adicionais, comissões e gratificações."},
  {"id":"con-dtt-03","area":"Concursos","disciplina":"Direito Trabalhista","namespace":"concursos_direito_trabalhista",
   "texto":"Concursos Direito Trabalhista — Direitos Trabalhistas: seguro-desemprego, licença-maternidade/paternidade, 13° salário, férias, estabilidade provisória, aposentadoria especial e convenções coletivas. Pressupostos de representação sindical."},
  {"id":"con-dtt-04","area":"Concursos","disciplina":"Direito Trabalhista","namespace":"concursos_direito_trabalhista",
   "texto":"Concursos Direito Trabalhista — Rescisão e Verbas Rescisórias: modalidade de rescisão, aviso prévio, saldo de salário, férias proporcionais, 13° proporcional, multa do FGTS e levantamento de contas. Homologação e prazos para pagamento."},
  {"id":"con-dtt-05","area":"Concursos","disciplina":"Direito Trabalhista","namespace":"concursos_direito_trabalhista",
   "texto":"Concursos Direito Trabalhista — Justiça do Trabalho: competência da JT, reclamação trabalhista, audiência inicial, conciliação, instrução e julgamento. Recursos trabalhistas comuns: embargos, recurso ordinário e recurso de revista."},

  # ══════════════════════════════════════════════════════
  # MATÉRIA 11: LEGISLAÇÃO ESPECÍFICA (concursos_legislacao_especifica)
  # ══════════════════════════════════════════════════════

  {"id":"con-lesp-01","area":"Concursos","disciplina":"Legislacao Especifica","namespace":"concursos_legislacao_especifica",
   "texto":"Concursos Legislacao Especifica — Lei de Improbidade Administrativa: Lei 8.429/92 define atos de improbidade que enriquecem o agente, causam prejuízo ao patrimônio público ou atentam contra princípios da administração pública. Sanções incluem perda da função pública, suspensão dos direitos políticos e multa."},
  {"id":"con-lesp-02","area":"Concursos","disciplina":"Legislacao Especifica","namespace":"concursos_legislacao_especifica",
   "texto":"Concursos Legislacao Especifica — Lei de Acesso à Informação: Lei 12.527/11 regulamenta o direito de acesso a informações públicas. Usuário pode solicitar dados sem justificar. Prazos de resposta de até 20 dias, prorrogáveis por mais 10 dias por motivo justificado."},
  {"id":"con-lesp-03","area":"Concursos","disciplina":"Legislacao Especifica","namespace":"concursos_legislacao_especifica",
   "texto":"Concursos Legislacao Especifica — Estatuto dos Servidores Públicos: Lei 8.112/90 trata do regime jurídico dos servidores civis federais: provimento, vacância, remuneração, direitos, deveres, regime disciplinar, aposentadoria e punições. Concurso público é regra para investidura."},
  {"id":"con-lesp-04","area":"Concursos","disciplina":"Legislacao Especifica","namespace":"concursos_legislacao_especifica",
   "texto":"Concursos Legislacao Especifica — Lei de Licitações e Contratos: Lei 14.133/21 disciplina licitações e contratos da administração pública, com princípios de isonomia, seleção da proposta mais vantajosa, publicidade e sustentabilidade. Modalidades e fases, regra do pregão, contratação direta em casos excepcionais."},
  {"id":"con-lesp-05","area":"Concursos","disciplina":"Legislacao Especifica","namespace":"concursos_legislacao_especifica",
   "texto":"Concursos Legislacao Especifica — Lei de Proteção de Dados e Transparência: LGPD e LAI no setor público. Dados pessoais no âmbito público exigem base legal, segurança e controle de acesso. Transparência ativa e dados abertos devem respeitar sigilo e privacidade."},
  {"id":"con-lesp-06","area":"Concursos","disciplina":"Legislacao Especifica","namespace":"concursos_legislacao_especifica",
   "texto":"Concursos Legislacao Especifica — Lei de Responsabilidade Fiscal: limites de gasto público, dívida consolidada, despesas com pessoal e transparência fiscal. Relatórios RREO e RGF, metas fiscais e processo de ajuste em caso de descumprimento."},
  {"id":"con-lesp-07","area":"Concursos","disciplina":"Legislacao Especifica","namespace":"concursos_legislacao_especifica",
   "texto":"Concursos Legislacao Especifica — Lei Anticorrupção: Lei 12.846/2013 responsabiliza pessoas jurídicas por atos lesivos à administração pública. Programa de integridade, due diligence, penalidades, acordo de leniência e colaboração premiada empresarial."},
  {"id":"con-lesp-08","area":"Concursos","disciplina":"Legislacao Especifica","namespace":"concursos_legislacao_especifica",
   "texto":"Concursos Legislacao Especifica — LGPD no Setor Público: tratamento de dados pessoais por órgãos públicos, bases legais específicas, titular e encarregado de proteção de dados, proteção de dados sensíveis e compartilhamento interinstitucional."},
  {"id":"con-lesp-09","area":"Concursos","disciplina":"Legislacao Especifica","namespace":"concursos_legislacao_especifica",
   "texto":"Concursos Legislacao Especifica — Contratações Públicas Sustentáveis: Lei 14.133/21 e diretrizes de sustentabilidade. Critérios de julgamento, preferências para micro e pequenas empresas, compras governamentais sustentáveis e responsabilidade socioambiental nas licitações."},
  {"id":"con-lesp-10","area":"Concursos","disciplina":"Legislacao Especifica","namespace":"concursos_legislacao_especifica",
   "texto":"Concursos Legislacao Especifica — Controle Interno e Externo: papel do TCU, CGU e controlador interno. Auditoria, fiscalização de contas, tomada de contas especial e processo de prestação de contas com base no artigo 70 da CF."},

  # ══════════════════════════════════════════════════════
  # MATÉRIA 12: ATUALIDADES (concursos_atualidades)
  # ══════════════════════════════════════════════════════

  {"id":"con-atu-01","area":"Concursos","disciplina":"Atualidades","namespace":"concursos_atualidades",
   "texto":"Concursos Atualidades — Economia Brasileira: inflação, juros, crescimento do PIB, desemprego e políticas fiscais. Programas de governo que impactam contas públicas, reforma tributária e controle de gastos."},
  {"id":"con-atu-02","area":"Concursos","disciplina":"Atualidades","namespace":"concursos_atualidades",
   "texto":"Concursos Atualidades — Governo Digital: Estratégia de Governo Digital, transformação digital dos serviços públicos, gov.br, plataformas de identidade digital, interoperabilidade e inovação no setor público."},
  {"id":"con-atu-03","area":"Concursos","disciplina":"Atualidades","namespace":"concursos_atualidades",
   "texto":"Concursos Atualidades — Sustentabilidade e Meio Ambiente: políticas públicas de mudança climática, transição energética, leis ambientais brasileiras e agendas internacionais de desenvolvimento sustentável."},
  {"id":"con-atu-04","area":"Concursos","disciplina":"Atualidades","namespace":"concursos_atualidades",
   "texto":"Concursos Atualidades — Segurança Pública e Direitos Sociais: políticas públicas de segurança, prevenção à violência, direitos humanos, políticas de assistência social e impacto de programas sociais em concursos públicos."},
  {"id":"con-atu-05","area":"Concursos","disciplina":"Atualidades","namespace":"concursos_atualidades",
   "texto":"Concursos Atualidades — Políticas Públicas e Reforma Administrativa: reformas recentes, governança pública, administração de crises e legislações em desenvolvimento que afetam concursos e a gestão pública."},
  {"id":"con-atu-06","area":"Concursos","disciplina":"Atualidades","namespace":"concursos_atualidades",
   "texto":"Concursos Atualidades — Geopolítica e Conflitos Internacionais: tensões globais, acordos comerciais, blocos políticos, crises humanitárias e impacto econômico de conflitos entre grandes potências."},
  {"id":"con-atu-07","area":"Concursos","disciplina":"Atualidades","namespace":"concursos_atualidades",
   "texto":"Concursos Atualidades — Eleições e Democracia: eleições recentes no Brasil e no mundo, mecanismos de voto, institucionalidade democrática, controle social e desafios à estabilidade política."},
  {"id":"con-atu-08","area":"Concursos","disciplina":"Atualidades","namespace":"concursos_atualidades",
   "texto":"Concursos Atualidades — Transição Energética e Clima: metas do Acordo de Paris, energias renováveis, política de carbono, adaptação às mudanças climáticas e políticas brasileiras de mitigação ambiental."},
  {"id":"con-atu-09","area":"Concursos","disciplina":"Atualidades","namespace":"concursos_atualidades",
   "texto":"Concursos Atualidades — Governo Digital e Cibersegurança: estratégias digitais no setor público, proteção de dados, segurança cibernética, ataques a infraestruturas críticas e políticas de resiliência nacional."},
  {"id":"con-atu-10","area":"Concursos","disciplina":"Atualidades","namespace":"concursos_atualidades",
   "texto":"Concursos Atualidades — Direitos Digitais e Privacidade: regulação sobre privacidade na internet, desinformação, liberdade de expressão, neutralidade de rede e proteção de dados pessoais em plataformas digitais."},
]

# ─── Funções de indexação (mesma lógica do indexar-tecnologia.py) ─────────────

def gerar_embedding(texto: str) -> list:
    account = os.environ.get("CLOUDFLARE_ACCOUNT_ID", ACCOUNT_ID)
    token   = os.environ.get("CLOUDFLARE_API_TOKEN", API_TOKEN)
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    url = f"https://api.cloudflare.com/client/v4/accounts/{account}/ai/run/@cf/baai/bge-m3"
    res = requests.post(url, headers=headers, json={"text": [texto[:512]]}, timeout=20)
    res.raise_for_status()
    data = res.json()
    if data.get("success") and data["result"].get("data"):
        return data["result"]["data"][0]
    raise RuntimeError(f"Resposta inesperada: {data}")


def upsert_vetores(vetores: list) -> dict:
    account = os.environ.get("CLOUDFLARE_ACCOUNT_ID", ACCOUNT_ID)
    token   = os.environ.get("CLOUDFLARE_API_TOKEN", API_TOKEN)
    url = f"https://api.cloudflare.com/client/v4/accounts/{account}/vectorize/v2/indexes/{INDEX_NAME}/upsert"
    ndjson = "\n".join(json.dumps(v, ensure_ascii=False) for v in vetores)
    res = requests.post(
        url,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/x-ndjson"},
        data=ndjson.encode("utf-8"),
        timeout=60,
    )
    if not res.ok:
        print(f"  ERRO Upsert HTTP {res.status_code}: {res.text[:300]}")
    res.raise_for_status()
    return res.json()


def salvar_dry_run(documentos: list, output_path: str):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(documentos, f, indent=2, ensure_ascii=False)
    print(f"Dry run salvo em: {output_path}")


def main():
    args = parse_args()
    configure_credentials(args)
    account = os.environ.get("CLOUDFLARE_ACCOUNT_ID", ACCOUNT_ID)
    token   = os.environ.get("CLOUDFLARE_API_TOKEN", API_TOKEN)

    if not args.dry_run and (not account or not token):
        print("ERRO: Configure as variáveis de ambiente ou passe as credenciais via argumentos:")
        print('   $env:CLOUDFLARE_ACCOUNT_ID="seu_id"')
        print('   $env:CLOUDFLARE_API_TOKEN="seu_token"')
        print('   python scripts/indexar-concursos-v2.py --account-id seu_id --api-token seu_token')
        return

    print("StudyMaster - Indexador Concursos v2")
    print(f"Total de documentos: {len(DOCUMENTOS)}")
    print(f"Batch size: {args.batch_size}")
    print(f"Dry run: {args.dry_run}")

    if args.dry_run and (not account or not token):
        print("Modo dry run sem credenciais: gravando apenas metadados locais")
        output_docs = [
            {
                "id": f"{item['id']}-{hashlib.md5(item['texto'].encode()).hexdigest()[:8]}",
                "namespace": item.get("namespace", "concursos_geral"),
                "metadata": {
                    "text": item["texto"][:1000],
                    "area": item["area"],
                    "disciplina": item["disciplina"],
                    "namespace": item.get("namespace", "concursos_geral"),
                    "fonte": f"Conteúdo Programático Concursos — {item['disciplina']}",
                },
            }
            for item in DOCUMENTOS
        ]
        salvar_dry_run(output_docs, args.output)
        print(f"\nDry run completo: {len(output_docs)} documentos preparados (sem embeddings)")
        return

    if not args.dry_run:
        print("Testando API Cloudflare...")
        try:
            emb = gerar_embedding("teste concursos")
            print(f"  OK API - {len(emb)} dims\n")
        except Exception as e:
            print(f"  ERRO: {e}")
            return

    batch, total, BATCH_SIZE = [], 0, args.batch_size
    for i, item in enumerate(DOCUMENTOS):
        chunk_id = f"{item['id']}-{hashlib.md5(item['texto'].encode()).hexdigest()[:8]}"
        try:
            emb = gerar_embedding(item["texto"])
        except Exception as e:
            print(f"  AVISO Embedding {item['id']} falhou: {e}")
            time.sleep(3)
            continue

        batch.append({
            "id": chunk_id,
            "values": emb,
            "namespace": item.get("namespace", "concursos_geral"),
            "metadata": {
                "text": item["texto"][:1000],
                "area": item["area"],
                "disciplina": item["disciplina"],
                "namespace": item.get("namespace", "concursos_geral"),
                "fonte": f"Conteúdo Programático Concursos — {item['disciplina']}",
            }
        })

        if len(batch) >= BATCH_SIZE or i == len(DOCUMENTOS) - 1:
            if args.dry_run:
                total += len(batch)
            else:
                try:
                    upsert_vetores(batch)
                    total += len(batch)
                    print(f"  OK {total}/{len(DOCUMENTOS)} documentos indexados")
                except Exception as e:
                    print(f"  ERRO Upsert: {e}")
            batch = []
            time.sleep(1.5)

    if args.dry_run:
        output_docs = [
            {
                "id": f"{item['id']}-{hashlib.md5(item['texto'].encode()).hexdigest()[:8]}",
                "namespace": item.get("namespace", "concursos_geral"),
                "metadata": {
                    "text": item["texto"][:1000],
                    "area": item["area"],
                    "disciplina": item["disciplina"],
                    "namespace": item.get("namespace", "concursos_geral"),
                    "fonte": f"Conteúdo Programático Concursos — {item['disciplina']}",
                },
            }
            for item in DOCUMENTOS
        ]
        salvar_dry_run(output_docs, args.output)
        print(f"\nDry run completo: {total} documentos preparados")
    else:
        print(f"\nOK Concursos v2 indexado: {total} documentos no Vectorize")
        print("Matérias: Português, Dir. Constitucional, Dir. Administrativo, RL, Informática, Adm. Pública, Direito Processual Penal, Direito Tributário, Direito Civil, Direito Trabalhista, Legislação Específica, Atualidades")


if __name__ == "__main__":
    main()
