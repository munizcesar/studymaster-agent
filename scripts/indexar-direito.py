#!/usr/bin/env python3
"""
StudyMaster — Pipeline de Indexação do Vade Mecum no Cloudflare Vectorize

Pré-requisitos:
  pip install requests beautifulsoup4 lxml

Uso:
  1. Configure CLOUDFLARE_ACCOUNT_ID e CLOUDFLARE_API_TOKEN como variáveis de ambiente
  2. Crie o índice: wrangler vectorize create studymaster-knowledge --dimensions=768 --metric=cosine
  3. Execute: python scripts/indexar-direito.py
"""

import os
import re
import json
import time
import hashlib
import requests
from bs4 import BeautifulSoup

# ─── Configuração ────────────────────────────────────────────────────────────

ACCOUNT_ID  = os.environ.get("CLOUDFLARE_ACCOUNT_ID", "")
API_TOKEN   = os.environ.get("CLOUDFLARE_API_TOKEN", "")
INDEX_NAME  = "studymaster-knowledge"

HEADERS_CF = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/json",
}

# ─── Leis para indexar ───────────────────────────────────────────────────────

LEIS = [
    # Constitucional
    {
        "url": "https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm",
        "area": "constitucional",
        "lei": "CF/1988",
        "sigla": "cf88"
    },
    # Civil
    {
        "url": "https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm",
        "area": "civil",
        "lei": "CC/2002",
        "sigla": "cc2002"
    },
    # Processo Civil
    {
        "url": "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm",
        "area": "civil",
        "lei": "CPC/2015",
        "sigla": "cpc2015"
    },
    # Penal
    {
        "url": "https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848compilado.htm",
        "area": "penal",
        "lei": "CP",
        "sigla": "cp"
    },
    # Processo Penal
    {
        "url": "https://www.planalto.gov.br/ccivil_03/decreto-lei/del3689compilado.htm",
        "area": "penal",
        "lei": "CPP",
        "sigla": "cpp"
    },
    # Trabalhista
    {
        "url": "https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452compilado.htm",
        "area": "trabalhista",
        "lei": "CLT",
        "sigla": "clt"
    },
    # Administrativo — Processo Administrativo Federal
    {
        "url": "https://www.planalto.gov.br/ccivil_03/leis/l9784.htm",
        "area": "administrativo",
        "lei": "Lei 9.784/99",
        "sigla": "lei978499"
    },
    # Administrativo — Estatuto dos Servidores
    {
        "url": "https://www.planalto.gov.br/ccivil_03/leis/l8112cons.htm",
        "area": "administrativo",
        "lei": "Lei 8.112/90",
        "sigla": "lei811290"
    },
    # Tributário
    {
        "url": "https://www.planalto.gov.br/ccivil_03/leis/l5172compilado.htm",
        "area": "tributario",
        "lei": "CTN",
        "sigla": "ctn"
    },
    # Licitações
    {
        "url": "https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14133.htm",
        "area": "administrativo",
        "lei": "Lei 14.133/21",
        "sigla": "lei1413321"
    },
    # LGPD
    {
        "url": "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm",
        "area": "administrativo",
        "lei": "LGPD — Lei 13.709/18",
        "sigla": "lgpd"
    },
    # Improbidade Administrativa
    {
        "url": "https://www.planalto.gov.br/ccivil_03/leis/l8429compilado.htm",
        "area": "administrativo",
        "lei": "Lei 8.429/92",
        "sigla": "lei842992"
    },
    # Licitações antigas (ainda cobradas em concursos)
    {
        "url": "https://www.planalto.gov.br/ccivil_03/leis/l8666compilado.htm",
        "area": "administrativo",
        "lei": "Lei 8.666/93",
        "sigla": "lei866693"
    },
]

# ─── Funções de extração ─────────────────────────────────────────────────────

def baixar_lei(url: str) -> str:
    """Baixa o HTML da lei do Planalto."""
    print(f"  Baixando: {url}")
    res = requests.get(url, timeout=30, headers={"User-Agent": "StudyMaster/1.0 (educational indexer)"})
    res.raise_for_status()
    res.encoding = res.apparent_encoding or "utf-8"
    return res.text


def extrair_artigos(html: str, lei: str, area: str) -> list[dict]:
    """Extrai artigos individuais do HTML do Planalto."""
    soup = BeautifulSoup(html, "lxml")

    # Remove scripts, styles e notas de rodapé
    for tag in soup(["script", "style", "sup", "a"]):
        tag.decompose()

    texto_completo = soup.get_text(separator="\n", strip=True)
    linhas = texto_completo.splitlines()

    artigos = []
    artigo_atual = None
    linhas_artigo = []

    # Regex para detectar início de artigo
    RE_ARTIGO = re.compile(
        r'^\s*Art\.?\s*(\d+[°º]?(?:-[A-Z])?)'
        r'(?:[\s\-–—]+|\.)\s*(.{0,300})',
        re.IGNORECASE
    )

    for linha in linhas:
        linha = linha.strip()
        if not linha:
            continue

        match = RE_ARTIGO.match(linha)
        if match:
            # Salva artigo anterior
            if artigo_atual is not None and linhas_artigo:
                texto = " ".join(linhas_artigo).strip()
                if len(texto) > 30:  # descarta artigos vazios/revogados
                    artigos.append({
                        "numero": artigo_atual,
                        "texto": f"Art. {artigo_atual} — {lei}: {texto}",
                        "lei": lei,
                        "area": area,
                    })

            artigo_atual = match.group(1)
            linhas_artigo = [linha]
        elif artigo_atual is not None:
            # Limita o tamanho do chunk (evita artigos gigantes)
            if len(" ".join(linhas_artigo)) < 1500:
                linhas_artigo.append(linha)

    # Salva o último artigo
    if artigo_atual and linhas_artigo:
        texto = " ".join(linhas_artigo).strip()
        if len(texto) > 30:
            artigos.append({
                "numero": artigo_atual,
                "texto": f"Art. {artigo_atual} — {lei}: {texto}",
                "lei": lei,
                "area": area,
            })

    print(f"  → {len(artigos)} artigos extraídos de {lei}")
    return artigos


# ─── Funções Cloudflare ──────────────────────────────────────────────────────

def gerar_embedding(texto: str) -> list[float]:
    """Gera embedding via Cloudflare AI (BGE-M3 — 768 dimensões, suporta português)."""
    url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/@cf/baai/bge-m3"
    res = requests.post(
        url,
        headers=HEADERS_CF,
        json={"text": [texto[:512]]},  # BGE-M3 aceita até 512 tokens
        timeout=15
    )
    res.raise_for_status()
    data = res.json()
    return data["result"]["data"][0]


def upsert_vetores(vetores: list[dict]) -> dict:
    """Faz upsert de um batch de vetores no Vectorize."""
    url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/vectorize/v2/indexes/{INDEX_NAME}/upsert"

    # Monta NDJSON (formato exigido pelo Vectorize v2)
    ndjson = "\n".join(json.dumps(v) for v in vetores)

    res = requests.post(
        url,
        headers={
            "Authorization": f"Bearer {API_TOKEN}",
            "Content-Type": "application/x-ndjson",
        },
        data=ndjson.encode("utf-8"),
        timeout=30
    )
    res.raise_for_status()
    return res.json()


# ─── Pipeline principal ──────────────────────────────────────────────────────

def indexar_lei(config: dict):
    """Baixa, extrai e indexa uma lei completa no Vectorize."""
    print(f"\n{'='*60}")
    print(f"Indexando: {config['lei']} ({config['area']})")
    print(f"{'='*60}")

    html = baixar_lei(config["url"])
    artigos = extrair_artigos(html, config["lei"], config["area"])

    if not artigos:
        print(f"  ⚠️  Nenhum artigo extraído de {config['lei']}. Verifique o HTML.")
        return

    batch = []
    total_indexados = 0
    BATCH_SIZE = 50  # Vectorize aceita até 1000 por batch, usamos 50 para segurança

    for i, artigo in enumerate(artigos):
        # ID único e reproduzível para cada artigo
        chunk_id = f"{config['sigla']}-art{artigo['numero']}-{hashlib.md5(artigo['texto'].encode()).hexdigest()[:8]}"

        try:
            embedding = gerar_embedding(artigo["texto"])
        except Exception as e:
            print(f"  ⚠️  Erro no embedding do Art. {artigo['numero']}: {e}")
            time.sleep(2)
            continue

        batch.append({
            "id": chunk_id,
            "values": embedding,
            "metadata": {
                "text": artigo["texto"],
                "area": artigo["area"],
                "lei": artigo["lei"],
                "artigo": artigo["numero"],
            }
        })

        # Envia batch quando atinge o tamanho ou é o último
        if len(batch) >= BATCH_SIZE or i == len(artigos) - 1:
            try:
                result = upsert_vetores(batch)
                total_indexados += len(batch)
                print(f"  ✅ Batch enviado: {total_indexados}/{len(artigos)} artigos")
            except Exception as e:
                print(f"  ❌ Erro no upsert: {e}")
            batch = []
            time.sleep(0.5)  # Rate limiting gentil

    print(f"\n  ✅ {config['lei']} indexada: {total_indexados} artigos no Vectorize")


def main():
    if not ACCOUNT_ID or not API_TOKEN:
        print("❌ Configure as variáveis de ambiente:")
        print("   export CLOUDFLARE_ACCOUNT_ID=seu_account_id")
        print("   export CLOUDFLARE_API_TOKEN=seu_api_token")
        return

    print("StudyMaster — Indexador do Vade Mecum")
    print(f"Indexando {len(LEIS)} leis no Cloudflare Vectorize...\n")

    log = []
    for config in LEIS:
        try:
            indexar_lei(config)
            log.append({"lei": config["lei"], "status": "ok"})
        except Exception as e:
            print(f"  ❌ Erro ao indexar {config['lei']}: {e}")
            log.append({"lei": config["lei"], "status": "erro", "erro": str(e)})
        time.sleep(1)

    # Salva log de indexação
    with open("scripts/indexacao-log.json", "w", encoding="utf-8") as f:
        json.dump(log, f, ensure_ascii=False, indent=2)

    print("\n" + "="*60)
    print("Indexação concluída! Log salvo em scripts/indexacao-log.json")
    print("="*60)
    sucessos = sum(1 for l in log if l["status"] == "ok")
    print(f"✅ {sucessos}/{len(LEIS)} leis indexadas com sucesso")


if __name__ == "__main__":
    main()
