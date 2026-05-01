#!/usr/bin/env python3
"""
StudyMaster — Pipeline de Indexação Concursos Gerais no Cloudflare Vectorize

Cobre matérias comuns a todos os concursos públicos brasileiros:
  - Língua Portuguesa
  - Raciocínio Lógico
  - Informática
  - Administração Pública
  - Contabilidade Pública e Orçamento
  - Direito Administrativo (complemento ao Vade Mecum)
  - Atualidades

Uso:
  1. Configure CLOUDFLARE_ACCOUNT_ID e CLOUDFLARE_API_TOKEN
  2. Execute: python scripts/indexar-concursos.py
"""

import os
import json
import time
import hashlib
import requests

ACCOUNT_ID = os.environ.get("CLOUDFLARE_ACCOUNT_ID", "")
API_TOKEN  = os.environ.get("CLOUDFLARE_API_TOKEN", "")
INDEX_NAME = "studymaster-knowledge"

CONTEUDOS_CONCURSOS = [

  # ─ LÍNGUA PORTUGUESA ──────────────────────────────────────────────
  {"id": "conc-por-01", "area": "Concursos — Matérias Comuns", "disciplina": "Português",
   "texto": "Concursos Português — Interpretação de Texto: ideias principal e secundárias, inferência, pressupostos, implicações, ambiguidade, coerência textual, gêneros textuais (dissertativo, narrativo, descritivo, injuntivo), tipologia textual, funções da linguagem (referencial, emotiva, conativa, fática, metalinguística, poética). Banca CEBRASPE, FCC, FGV."},
  {"id": "conc-por-02", "area": "Concursos — Matérias Comuns", "disciplina": "Português",
   "texto": "Concursos Português — Gramática: classes de palavras (substantivo, adjetivo, pronome, verbo, advérbio, preposição, conjunção, interjeicão), concordância nominal e verbal (casos especiais), regência verbal e nominal, crase (regras e exceções), pontuação, ortografia oficial (Acordo Ortográfico 2009). Banca CEBRASPE, FCC."},
  {"id": "conc-por-03", "area": "Concursos — Matérias Comuns", "disciplina": "Português",
   "texto": "Concursos Português — Sintáxis: sujeito (simples, composto, indeterminado, oculto), predicado (verbal, nominal, verbo-nominal), complementos verbais (objeto direto e indireto), adjunto adnominal e adverbial, aposto, vocativo, orações subordinadas (substantivas, adjetivas, adverbiais), orações coordenadas. Estilo CEBRASPE: assertivas de certo/errado."},
  {"id": "conc-por-04", "area": "Concursos — Matérias Comuns", "disciplina": "Português",
   "texto": "Concursos Português — Coesão e Coesão: elementos de coesão (referência, substituição, elipse, conector, junção), sinônimos e antônimos, polissemia, figuras de linguagem (metáfora, metonimia, ironia, eufemismo, hiperbole, antitese, paradoxo), varição linguística (dialetal, social, histórica, estilística). Concursos federais e estaduais."},

  # ─ RACIOCÍNIO LÓGICO ──────────────────────────────────────────────
  {"id": "conc-log-01", "area": "Concursos — Matérias Comuns", "disciplina": "Raciocínio Lógico",
   "texto": "Concursos Raciocínio Lógico — Lógica Proposicional: proposições simples e compostas, conectivos lógicos (negação, conjunção, disjunção, condicional, bicondicional), tabela verdade, tautologia, contradição, contingência, equivalência lógica, Leis de De Morgan, negação do condicional. CEBRASPE e CESPE."},
  {"id": "conc-log-02", "area": "Concursos — Matérias Comuns", "disciplina": "Raciocínio Lógico",
   "texto": "Concursos Raciocínio Lógico — Conjuntos e Contagem: teoria dos conjuntos (união, interseção, diferença, complementar, diagrama de Venn), princípio fundamental da contagem, fatorial, permutação simples e circular, combinação, arranjo, probabilidade (clássica e condicional), distribuição binomial. Concursos federais."},
  {"id": "conc-log-03", "area": "Concursos — Matérias Comuns", "disciplina": "Raciocínio Lógico",
   "texto": "Concursos Raciocínio Lógico — Sequências e Séries: progressões aritméticas (PA) e geométricas (PG), sequências com padrões numéricos e alfanuméricos, raciocínio analítico (problem. de lógica dedutiva, silogismos, inferência), lógica de predicados, quantificadores (todo, algum, nenhum), negação de quantificadores."},
  {"id": "conc-log-04", "area": "Concursos — Matérias Comuns", "disciplina": "Raciocínio Lógico",
   "texto": "Concursos Raciocínio Lógico — Matemática Básica para Concursos: porcentagem e juros (simples e compostos), razão e proporção, regra de três (simples e composta), média aritmética e ponderada, mediana, moda, interpretação de gráficos e tabelas, grandezas proporcionais e inversamente proporcionais. FCC, VUNESP, CESGRANRIO."},

  # ─ INFORMÁTICA ───────────────────────────────────────────────────
  {"id": "conc-inf-01", "area": "Concursos — Matérias Comuns", "disciplina": "Informática",
   "texto": "Concursos Informática — Windows e Sistemas Operacionais: Windows 10/11 (área de trabalho, painel de controle, gerenciador de tarefas, explorer, atalhos de teclado), Linux (comandos básicos: ls, cd, cp, mv, rm, chmod, grep, find), conceitos de SO (processo, memória virtual, sistema de arquivos FAT32, NTFS, ext4). CEBRASPE."},
  {"id": "conc-inf-02", "area": "Concursos — Matérias Comuns", "disciplina": "Informática",
   "texto": "Concursos Informática — Office e LibreOffice: Word/Writer (formatação, estilos, mala direta, controle de alterações), Excel/Calc (fórmulas: SOMA, MÉDIA, SE, PROCV, CONT.SE, tabela dinâmica, gráficos), PowerPoint/Impress (animações, transições, modos de exibição), Outlook (configuração de conta, regras, atalhos). FCC, VUNESP."},
  {"id": "conc-inf-03", "area": "Concursos — Matérias Comuns", "disciplina": "Informática",
   "texto": "Concursos Informática — Internet e Segurança: protocolos (HTTP, HTTPS, FTP, SMTP, POP3, IMAP, DNS, DHCP, TCP/IP), navegadores (Chrome, Firefox, Edge: abas, favoritos, histórico, cookies, cache), segurança da informação (antivírus, firewall, phishing, ransomware, engenharia social, criptografia, certificado digital, assinatura digital, LGPD aplicada à TI). CEBRASPE."},
  {"id": "conc-inf-04", "area": "Concursos — Matérias Comuns", "disciplina": "Informática",
   "texto": "Concursos Informática — Redes e Hardware: topologias de rede (estrela, barramento, anel), equipamentos (roteador, switch, hub, modem, repetidor), tipos de rede (LAN, WAN, MAN, VPN), Wi-Fi (802.11), backup (completo, incremental, diferencial), cloud computing (IaaS, PaaS, SaaS), virtualização, hardware (CPU, RAM, HD, SSD, GPU, placa-mãe). Concursos TI."},

  # ─ ADMINISTRAÇÃO PÚBLICA ─────────────────────────────────────────
  {"id": "conc-adm-01", "area": "Concursos — Matérias Comuns", "disciplina": "Administração Pública",
   "texto": "Concursos Administração Pública — Princípios e Organização: princípios da administração pública (LIMPE: Legalidade, Impessoalidade, Moralidade, Publicidade, Eficiência — art. 37 CF/88), administração direta e indireta (autarquias, fundações, empresas públicas, sociedades de economia mista), desâcentralização e desconcentração, hierarquia e supervisão."},
  {"id": "conc-adm-02", "area": "Concursos — Matérias Comuns", "disciplina": "Administração Pública",
   "texto": "Concursos Administração Pública — Gestão e Planejamento: planejamento estratégico (missão, visão, valores, análise SWOT), administração por objetivos (APO), gestão de processos (BPM), gestão da qualidade (ISO 9001, PDCA, 5S, Seis Sigma), gestão por competências, inovação no setor público, governo eletrônico (e-gov)."},
  {"id": "conc-adm-03", "area": "Concursos — Matérias Comuns", "disciplina": "Administração Pública",
   "texto": "Concursos Administração Pública — Recursos Humanos e Servidor Público: Lei 8.112/90 (provimento, vacancia, direitos, deveres, responsabilidades, processo administrativo disciplinar — PAD, penas disciplinares: advertência, suspensão, demissão, cassacão), estágio probatório, estabilidade, avaliação de desempenho, remuneração, férias, licenças."},

  # ─ ORÇAMENTO E FINANÇAS PÚBLICAS ───────────────────────────────
  {"id": "conc-orc-01", "area": "Concursos — Matérias Comuns", "disciplina": "Orçamento Público",
   "texto": "Concursos Orçamento Público — PPA, LDO e LOA: Plano Plurianual (PPA — 4 anos, metas e objetivos), Lei de Diretrizes Orçamentárias (LDO — metas fiscais, princípios), Lei Orçamentária Anual (LOA — orçamento fiscal, seguridade, investimentos estatais), princípios orçamentários (unidade, universalidade, anualidade, exclusividade, equilíbrio), Lei de Responsabilidade Fiscal — LRF (Lei Complementar 101/2000)."},
  {"id": "conc-orc-02", "area": "Concursos — Matérias Comuns", "disciplina": "Orçamento Público",
   "texto": "Concursos Contabilidade Pública — SIAFI e Execução Orçamentária: sistema SIAFI, estágios da receita (previsão, lançamento, arrecadação, recolhimento) e da despesa (fixação, empenho, liquidação, pagamento), suprimento de fundos, restos a pagar, déficit e superávit orçamentário, classificação da despesa (elemento de despesa, ação, programa). ESAF, STN."},

  # ─ DIREITO CONSTITUCIONAL PARA CONCURSOS ─────────────────────
  {"id": "conc-dco-01", "area": "Concursos — Matérias Comuns", "disciplina": "Direito Constitucional",
   "texto": "Concursos Direito Constitucional — Princípios Fundamentais e Direitos: art. 1º CF/88 (fundamentos da República: soberania, cidadania, dignidade humana, valores sociais do trabalho, pluralismo político), art. 3º (objetivos: sociedade livre, justa, solidária), art. 5º (direitos e garantias fundamentais: igualdade, legalidade, liberdade, inviolabilidade de domicílio, sigilo, habéas corpus, mandado de segurança). CEBRASPE."},
  {"id": "conc-dco-02", "area": "Concursos — Matérias Comuns", "disciplina": "Direito Constitucional",
   "texto": "Concursos Direito Constitucional — Organização do Estado e Poderes: art. 37 CF/88 (LIMPE — princípios da administração), Poder Legislativo (Câmara e Senado, processo legislativo, tipos de lei), Poder Executivo (Presidente, atribuições, ministérios), Poder Judiciário (STF, STJ, TST, TSE, TRF, Justiça Federal e Estadual), Ministério Público, TCU. CEBRASPE, FCC."},

  # ─ ATUALIDADES E CONHECIMENTOS GERAIS ────────────────────────
  {"id": "conc-atu-01", "area": "Concursos — Matérias Comuns", "disciplina": "Atualidades",
   "texto": "Concursos Atualidades e Conhecimentos Gerais — Temas recorrentes: política brasileira e internacional, economia (PIB, inflação, SELIC, desemprego, Reforma Tributária), meio ambiente (COP, Amazônia, desmatamento), tecnologia e inteligência artificial, saúde pública (SUS, programas federais), educação (IDEB, ENEM, PROUNI, FIES), segurança pública, direitos humanos. Concursos federais e estaduais."},
]


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
        print(f"  \u274c Upsert HTTP {res.status_code}: {res.text[:300]}")
    res.raise_for_status()
    return res.json()


def main():
    account = os.environ.get("CLOUDFLARE_ACCOUNT_ID", ACCOUNT_ID)
    token   = os.environ.get("CLOUDFLARE_API_TOKEN", API_TOKEN)
    if not account or not token:
        print("\u274c Configure as variáveis de ambiente:")
        print('   $env:CLOUDFLARE_ACCOUNT_ID="seu_id"')
        print('   $env:CLOUDFLARE_API_TOKEN="seu_token"')
        return

    print("StudyMaster \u2014 Indexador Concursos Gerais")
    print(f"Total de conteúdos: {len(CONTEUDOS_CONCURSOS)}")
    print("Testando API...")
    try:
        emb = gerar_embedding("teste concurso")
        print(f"  \u2705 API OK \u2014 {len(emb)} dims\n")
    except Exception as e:
        print(f"  \u274c Falha: {e}")
        return

    batch, total, BATCH_SIZE = [], 0, 20
    for i, item in enumerate(CONTEUDOS_CONCURSOS):
        chunk_id = f"{item['id']}-{hashlib.md5(item['texto'].encode()).hexdigest()[:8]}"
        try:
            emb = gerar_embedding(item["texto"])
        except Exception as e:
            print(f"  \u26a0\ufe0f  Embedding {item['id']} falhou: {e}")
            time.sleep(3)
            continue

        batch.append({"id": chunk_id, "values": emb, "metadata": {
            "text": item["texto"][:1000],
            "area": item["area"],
            "disciplina": item["disciplina"],
            "fonte": "Conteúdo Programático Concursos Públicos Federais",
        }})

        if len(batch) >= BATCH_SIZE or i == len(CONTEUDOS_CONCURSOS) - 1:
            try:
                upsert_vetores(batch)
                total += len(batch)
                print(f"  \u2705 {total}/{len(CONTEUDOS_CONCURSOS)} conteúdos indexados")
            except Exception as e:
                print(f"  \u274c Upsert falhou: {e}")
            batch = []
            time.sleep(1)

    print(f"\n\u2705 Concursos Gerais indexado: {total} conteúdos no Vectorize")
    print("Quest\u00f5es de Portugu\u00eas, L\u00f3gica, Inform\u00e1tica e Adm. P\u00fablica agora usam RAG!")


if __name__ == "__main__":
    main()
