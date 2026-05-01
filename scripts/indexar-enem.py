#!/usr/bin/env python3
"""
StudyMaster — Pipeline de Indexação ENEM no Cloudflare Vectorize

Fontes:
  - Matriz de Referência Oficial do ENEM (INEP)
  - Conteúdos por área de conhecimento

Pré-requisitos:
  pip install requests beautifulsoup4 lxml

Uso:
  1. Configure CLOUDFLARE_ACCOUNT_ID e CLOUDFLARE_API_TOKEN
  2. Execute: python scripts/indexar-enem.py
"""

import os
import json
import time
import hashlib
import requests

ACCOUNT_ID = os.environ.get("CLOUDFLARE_ACCOUNT_ID", "")
API_TOKEN  = os.environ.get("CLOUDFLARE_API_TOKEN", "")
INDEX_NAME = "studymaster-knowledge"

# ─── Conteúdo da Matriz de Referência ENEM (INEP oficial) ───

CONTEUDOS_ENEM = [

  # ─ MATEMÁTICA E SUAS TECNOLOGIAS ──────────────────────────────────────
  {"id": "enem-mat-01", "area": "ENEM", "disciplina": "Matemática",
   "texto": "ENEM Matemática — Números e Operações: conjuntos numéricos (naturais, inteiros, racionais, irracionais, reais), operações e propriedades, potências e radicais, números complexos, logaritmos e exponenciais. Matriz de Referência ENEM/INEP."},
  {"id": "enem-mat-02", "area": "ENEM", "disciplina": "Matemática",
   "texto": "ENEM Matemática — Álgebra: expressões algébricas, equações e inequações do 1º e 2º graus, sistemas lineares, funções (afim, quadrática, exponencial, logarítmica, trigonométrica), progressões aritméticas e geométricas. Matriz de Referência ENEM/INEP."},
  {"id": "enem-mat-03", "area": "ENEM", "disciplina": "Matemática",
   "texto": "ENEM Matemática — Geometria: geometria plana (áreas e perímetros de triângulos, quadriláteros, círculo), geometria espacial (prismas, pirâmides, cilindro, cone, esfera), geometria analítica (ponto, reta, circunferência no plano cartesiano), trigonometria (seno, cosseno, tangente, lei dos senos e cossenos). Matriz de Referência ENEM/INEP."},
  {"id": "enem-mat-04", "area": "ENEM", "disciplina": "Matemática",
   "texto": "ENEM Matemática — Estatística e Probabilidade: média, mediana, moda, desvio padrão, gráficos e tabelas, probabilidade simples e condicional, combinações, arranjos e permutações, princípio fundamental da contagem. Matriz de Referência ENEM/INEP."},
  {"id": "enem-mat-05", "area": "ENEM", "disciplina": "Matemática",
   "texto": "ENEM Matemática — Matemática Financeira: porcentagem, juros simples e compostos, descontos, prestações, financiamentos, cálculo de parcelas, taxa efetiva e nominal. Aplicações em situações do cotidiano. Matriz de Referência ENEM/INEP."},

  # ─ CIÊNCIAS DA NATUREZA ────────────────────────────────────────────────
  {"id": "enem-fis-01", "area": "ENEM", "disciplina": "Física",
   "texto": "ENEM Física — Mecânica: cinemática (MRU, MRUV, queda livre, lançamento), dinâmica (Leis de Newton, força, massa, aceleração), trabalho e energia (cinética, potencial, conservação), quantidade de movimento e impulso, grav. Matriz ENEM/INEP."},
  {"id": "enem-fis-02", "area": "ENEM", "disciplina": "Física",
   "texto": "ENEM Física — Termodinâmica: temperatura e calor, escalas termométricas, dilatação térmica, calor específico, máquinas térmicas, Leis da Termodinâmica (1ª e 2ª lei), ciclo de Carnot, rendimento térmico. Matriz ENEM/INEP."},
  {"id": "enem-fis-03", "area": "ENEM", "disciplina": "Física",
   "texto": "ENEM Física — Eletricidade e Magnetismo: carga elétrica, corrente, tensão, resistência, Lei de Ohm, circuitos em série e paralelo, potência elétrica, campo e força elétrica, capacitores, campo magnético, indução eletromagnética. Matriz ENEM/INEP."},
  {"id": "enem-fis-04", "area": "ENEM", "disciplina": "Física",
   "texto": "ENEM Física — Ondas e Óptica: ondas mecânicas e eletromagnéticas, som (intensidade, altura, timbre), luz (reflexão, refração, difração, efeito Doppler), espelhos e lentes, óptica geométrica. Física Moderna: fótons, efeito fotoelétrico, radioatividade. Matriz ENEM/INEP."},
  {"id": "enem-qui-01", "area": "ENEM", "disciplina": "Química",
   "texto": "ENEM Química — Química Geral: estrutura atômica, tabela periódica, ligações químicas (iônica, covalente, metálica), geometria molecular, forças intermoleculares, soluções (concentração, solubilidade, pH, ácidos e bases). Matriz ENEM/INEP."},
  {"id": "enem-qui-02", "area": "ENEM", "disciplina": "Química",
   "texto": "ENEM Química — Química Orgânica: hidrocarbonetos (alcanos, alcenos, alcinos, aromáticos), funções orgânicas (álcool, éter, ácido carboxílico, aldeído, cetona, éster, amina, amida), reações orgânicas, polímeros, biocombustíveis. Matriz ENEM/INEP."},
  {"id": "enem-qui-03", "area": "ENEM", "disciplina": "Química",
   "texto": "ENEM Química — Estequiometria e Termoquímica: balanceamento de equações, cálculos estequiométricos, lei de conservação de massas, reações exotérmicas e endotérmicas, entalpia, Lei de Hess, cinética química, equilíbrio químico, eletroquímica (pilha, eletrólise). Matriz ENEM/INEP."},
  {"id": "enem-bio-01", "area": "ENEM", "disciplina": "Biologia",
   "texto": "ENEM Biologia — Citologia e Histologia: célula procariótica e eucariótica, organelas celulares, membrana plasmática, núcleo, mitose e meiose, tecidos animais (epitelial, conjuntivo, muscular, nervoso) e vegetais. Matriz ENEM/INEP."},
  {"id": "enem-bio-02", "area": "ENEM", "disciplina": "Biologia",
   "texto": "ENEM Biologia — Genética e Evolução: Leis de Mendel (1ª e 2ª), herança ligada ao sexo, mutação, DNA e RNA, síntese proteíca (transcrição e tradução), engenharia genética, biotecnologia, teoria da evolução (Darwin, Lamarck), selecão natural, especiação. Matriz ENEM/INEP."},
  {"id": "enem-bio-03", "area": "ENEM", "disciplina": "Biologia",
   "texto": "ENEM Biologia — Ecologia e Meio Ambiente: cadeias e teias alimentares, níveis tróficos, ciclos biogeoquímicos (carbono, nitrogênio, água), biomas brasileiros (Amazônia, Cerrado, Mata Atlântica, Caatinga, Pantanal, Pampa), impactos ambientais, desenvolvimento sustentável, unidades de conservação. Matriz ENEM/INEP."},
  {"id": "enem-bio-04", "area": "ENEM", "disciplina": "Biologia",
   "texto": "ENEM Biologia — Fisiologia Humana: sistema digestório, respiratório, circulatório, excretor, nervoso, endócrino, reprodutor, imunológico. Nutrição e saúde, doenças infecciosas e parasitárias, vacinação. Matriz ENEM/INEP."},

  # ─ CIÊNCIAS HUMANAS ───────────────────────────────────────────────────
  {"id": "enem-his-01", "area": "ENEM", "disciplina": "História",
   "texto": "ENEM História — Brasil Colônia e Império: chegada dos portugueses (1500), capitanias hereditárias, governo-geral, ciclos econômicos (pau-brasil, cana-de-açúcar, ouro), escravidão africana, Inconfidência Mineira (1789), transferência da Corte (1808), Independência (1822), Período Regencial, Segundo Reinado. Matriz ENEM/INEP."},
  {"id": "enem-his-02", "area": "ENEM", "disciplina": "História",
   "texto": "ENEM História — Brasil República: Proclamação da República (1889), República Velha, Revolução de 1930, Era Vargas (1930-1945), República Populista, Golpe Militar de 1964, Ditadura Militar (1964-1985), abertura política, Constituição de 1988, redemocratização. Matriz ENEM/INEP."},
  {"id": "enem-his-03", "area": "ENEM", "disciplina": "História",
   "texto": "ENEM História — História Geral: Revolução Francesa (1789), Revolução Industrial, Imperialismo e colonialismo africano/asiático, 1ª Guerra Mundial (1914-1918), Revolução Russa (1917), 2ª Guerra Mundial (1939-1945), Holocausto, Guerra Fria, descolonização, globalização. Matriz ENEM/INEP."},
  {"id": "enem-geo-01", "area": "ENEM", "disciplina": "Geografia",
   "texto": "ENEM Geografia — Geografia do Brasil: regiões brasileiras, climas (equatorial, tropical, semiárido, subtropical), relevo, hidrografia (bacias hidrográficas), urbanização brasileira, metropolização, questão agrária, reforma agrária, movimentos sociais, problemas ambientais brasileiros. Matriz ENEM/INEP."},
  {"id": "enem-geo-02", "area": "ENEM", "disciplina": "Geografia",
   "texto": "ENEM Geografia — Geografia Mundial: globalização, blocos econômicos (Mercosul, UE, NAFTA), países desenvolvidos e subdesenvolvidos, IDH, desigualdade social mundial, conflitos geopolíticos, recursos naturais e energia, mudanças climáticas, Acordo de Paris. Matriz ENEM/INEP."},
  {"id": "enem-fil-01", "area": "ENEM", "disciplina": "Filosofia",
   "texto": "ENEM Filosofia — Principais correntes: filósofos pré-socráticos, Platão (mundo das ideias), Aristóteles (lógica, ética, política), Descartes (racionalismo), Locke e Hume (empirismo), Kant (crítica da razão), Iluminismo, Nietzsche, Marx (materialismo histórico), existencialismo (Sartre). Matriz ENEM/INEP."},
  {"id": "enem-soc-01", "area": "ENEM", "disciplina": "Sociologia",
   "texto": "ENEM Sociologia — Conteúdos principais: Durkheim (fatos sociais, solidariedade mecânica e orgânica), Weber (ação social, burocracia), Marx (luta de classes, mais-valia, alienação), cultura e identidade, movimentos sociais, cidadania, democracia, direitos humanos, desigualdade social e racial no Brasil. Matriz ENEM/INEP."},

  # ─ LINGUAGENS E CÓDIGOS ───────────────────────────────────────────────
  {"id": "enem-por-01", "area": "ENEM", "disciplina": "Português",
   "texto": "ENEM Língua Portuguesa — Interpretação de Textos: gêneros textuais (crônica, conto, reportagem, editorial, charge, infográfico), inferência, coerência e coesão, intencionalidade, intertextualidade, ironia, humor, figura de linguagem. Matriz ENEM/INEP."},
  {"id": "enem-por-02", "area": "ENEM", "disciplina": "Português",
   "texto": "ENEM Língua Portuguesa — Gramática e Redação: classes de palavras, sintaxe (sujeito, predicado, complementos), concordância nominal e verbal, regência, crase, pontuação, estrutura da redação dissertativa-argumentativa (proposta de intervenção, tese, argumentos, conclusão), competências avaliadas na redação ENEM. Matriz ENEM/INEP."},
  {"id": "enem-lit-01", "area": "ENEM", "disciplina": "Literatura",
   "texto": "ENEM Literatura — Estilos literários: Quinhentismo, Barroco (Gregório de Matos, Padre Vieira), Arcadismo (Tomás Antônio Gonzaga), Romantismo (José de Alencar, Castro Alves), Realismo/Naturalismo (Machado de Assis, Eça de Queirós), Parnasianismo, Simbolismo, Modernismo (Mário de Andrade, Oswald de Andrade, Drummond, Claríce Lispector). Matriz ENEM/INEP."},
  {"id": "enem-art-01", "area": "ENEM", "disciplina": "Artes",
   "texto": "ENEM Artes e Educação Física — Linguagens artísticas (teatro, música, dança, artes visuais), movimentos artísticos (modernismo, cubismo, surrealismo, arte brasileira), patrimônio cultural, manifestações culturais brasileiras. Educação Física: esportes, saúde, qualidade de vida, inclusão. Matriz ENEM/INEP."},
  {"id": "enem-ing-01", "area": "ENEM", "disciplina": "Inglês",
   "texto": "ENEM Língua Inglesa — Interpretação de textos em inglês: gêneros textuais (artigos, anúncios, letras de música, notícias), vocabulário contextual, estruturas gramaticais básicas e intermediárias, conectivos, tempos verbais. Não exige produção escrita. Matriz ENEM/INEP."},

  # ─ REDAÇÃO ─────────────────────────────────────────────────────────────
  {"id": "enem-red-01", "area": "ENEM", "disciplina": "Redação",
   "texto": "ENEM Redação — Competência 1: Demonstrar domínio da modalidade escrita formal da língua portuguesa. Ortografia, acent. gráfica, pontuação, concordância, regência, plural, gênero. Competência 2: Compreender a proposta de redação. Competência 3: Selecionar argumentos. Competência 4: Conhecimento dos mecanismos linguísticos de coesão. Competência 5: Proposta de intervenção respeitando os direitos humanos. Nota de 0 a 1000. INEP/MEC."},
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

    print("StudyMaster \u2014 Indexador ENEM")
    print(f"Total de conteúdos: {len(CONTEUDOS_ENEM)}")
    print("Testando API...")
    try:
        emb = gerar_embedding("teste ENEM")
        print(f"  \u2705 API OK \u2014 {len(emb)} dims\n")
    except Exception as e:
        print(f"  \u274c Falha: {e}")
        return

    batch, total, BATCH_SIZE = [], 0, 20
    for i, item in enumerate(CONTEUDOS_ENEM):
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
            "fonte": "Matriz de Refer\u00eancia ENEM \u2014 INEP/MEC",
        }})

        if len(batch) >= BATCH_SIZE or i == len(CONTEUDOS_ENEM) - 1:
            try:
                upsert_vetores(batch)
                total += len(batch)
                print(f"  \u2705 {total}/{len(CONTEUDOS_ENEM)} conteúdos indexados")
            except Exception as e:
                print(f"  \u274c Upsert falhou: {e}")
            batch = []
            time.sleep(1)

    print(f"\n\u2705 ENEM indexado: {total} conteúdos no Vectorize")
    print("Agora as quest\u00f5es de ENEM usar\u00e3o a Matriz de Refer\u00eancia oficial como base!")


if __name__ == "__main__":
    main()
