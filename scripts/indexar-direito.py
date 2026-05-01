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

ACCOUNT_ID = os.environ.get("CLOUDFLARE_ACCOUNT_ID", "")
API_TOKEN  = os.environ.get("CLOUDFLARE_API_TOKEN", "")
INDEX_NAME = "studymaster-knowledge"

HEADERS_CF = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/json",
}

HEADERS_PLANALTO = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9",
    "Accept-Encoding": "gzip, deflate",
    "Connection": "keep-alive",
}

# ─── Leis para indexar ───────────────────────────────────────────────────────

LEIS = [
    {"url": "https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm", "area": "constitucional", "lei": "CF/1988", "sigla": "cf88"},
    {"url": "https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm", "area": "civil", "lei": "CC/2002", "sigla": "cc2002"},
    {"url": "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm", "area": "civil", "lei": "CPC/2015", "sigla": "cpc2015"},
    {"url": "https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848compilado.htm", "area": "penal", "lei": "CP", "sigla": "cp"},
    {"url": "https://www.planalto.gov.br/ccivil_03/decreto-lei/del3689compilado.htm", "area": "penal", "lei": "CPP", "sigla": "cpp"},
    {"url": "https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452compilado.htm", "area": "trabalhista", "lei": "CLT", "sigla": "clt"},
    {"url": "https://www.planalto.gov.br/ccivil_03/leis/l9784.htm", "area": "administrativo", "lei": "Lei 9.784/99", "sigla": "lei978499"},
    {"url": "https://www.planalto.gov.br/ccivil_03/leis/l8112cons.htm", "area": "administrativo", "lei": "Lei 8.112/90", "sigla": "lei811290"},
    {"url": "https://www.planalto.gov.br/ccivil_03/leis/l5172compilado.htm", "area": "tributario", "lei": "CTN", "sigla": "ctn"},
    {"url": "https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14133.htm", "area": "administrativo", "lei": "Lei 14.133/21", "sigla": "lei1413321"},
    {"url": "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm", "area": "administrativo", "lei": "LGPD — Lei 13.709/18", "sigla": "lgpd"},
    {"url": "https://www.planalto.gov.br/ccivil_03/leis/l8429compilado.htm", "area": "administrativo", "lei": "Lei 8.429/92", "sigla": "lei842992"},
    {"url": "https://www.planalto.gov.br/ccivil_03/leis/l8666compilado.htm", "area": "administrativo", "lei": "Lei 8.666/93", "sigla": "lei866693"},
]

# ─── Funções de extração ─────────────────────────────────────────────────────

def baixar_lei(url: str, tentativas: int = 3) -> str:
    print(f"  Baixando: {url}")
    for i in range(tentativas):
        try:
            res = requests.get(url, timeout=45, headers=HEADERS_PLANALTO)
            res.raise_for_status()
            res.encoding = res.apparent_encoding or "utf-8"
            print(f"  ✅ Download OK ({len(res.text):,} chars)")
            return res.text
        except Exception as e:
            print(f"  ⚠️  Tentativa {i+1}/{tentativas} falhou: {e}")
            if i < tentativas - 1:
                time.sleep(5 * (i + 1))
    raise RuntimeError(f"Falha ao baixar {url} após {tentativas} tentativas")


def extrair_artigos(html: str, lei: str, area: str) -> list:
    soup = BeautifulSoup(html, "lxml")
    for tag in soup(["script", "style", "sup", "a"]):
        tag.decompose()
    texto_completo = soup.get_text(separator="\n", strip=True)
    linhas = texto_completo.splitlines()

    artigos = []
    artigo_atual = None
    linhas_artigo = []

    RE_ARTIGO = re.compile(
        r'^\s*Art\.?\s*(\d+[°º]?(?:-[A-Z])?)(?:[\s\-–—]+|\.)\s*(.{0,300})',
        re.IGNORECASE
    )

    for linha in linhas:
        linha = linha.strip()
        if not linha:
            continue
        match = RE_ARTIGO.match(linha)
        if match:
            if artigo_atual is not None and linhas_artigo:
                texto = " ".join(linhas_artigo).strip()
                if len(texto) > 30:
                    artigos.append({"numero": artigo_atual, "texto": f"Art. {artigo_atual} — {lei}: {texto}", "lei": lei, "area": area})
            artigo_atual = match.group(1)
            linhas_artigo = [linha]
        elif artigo_atual is not None:
            if len(" ".join(linhas_artigo)) < 1500:
                linhas_artigo.append(linha)

    if artigo_atual and linhas_artigo:
        texto = " ".join(linhas_artigo).strip()
        if len(texto) > 30:
            artigos.append({"numero": artigo_atual, "texto": f"Art. {artigo_atual} — {lei}: {texto}", "lei": lei, "area": area})

    print(f"  → {len(artigos)} artigos extraídos de {lei}")
    return artigos


# ─── Funções Cloudflare ──────────────────────────────────────────────────────

def gerar_embedding(texto: str) -> list:
    """Gera embedding via Cloudflare AI. Tenta BGE-M3 (768 dims), fallback para bge-base-en-v1.5 (768 dims)."""
    # Recria headers com token atualizado (caso mude durante a sessão)
    headers = {
        "Authorization": f"Bearer {os.environ.get('CLOUDFLARE_API_TOKEN', API_TOKEN)}",
        "Content-Type": "application/json",
    }
    account = os.environ.get('CLOUDFLARE_ACCOUNT_ID', ACCOUNT_ID)

    # Tenta @cf/baai/bge-m3 primeiro
    url = f"https://api.cloudflare.com/client/v4/accounts/{account}/ai/run/@cf/baai/bge-m3"
    try:
        res = requests.post(url, headers=headers, json={"text": [texto[:512]]}, timeout=20)
        res.raise_for_status()
        data = res.json()
        if data.get("success") and data["result"].get("data"):
            emb = data["result"]["data"][0]
            if len(emb) == 768:
                return emb
            print(f"  ⚠️ BGE-M3 retornou {len(emb)} dims (esperado 768), tentando modelo alternativo")
    except Exception as e:
        print(f"  ⚠️ BGE-M3 falhou: {e}")

    # Fallback: @cf/baai/bge-base-en-v1.5 (768 dims, multilingual)
    url2 = f"https://api.cloudflare.com/client/v4/accounts/{account}/ai/run/@cf/baai/bge-base-en-v1.5"
    res2 = requests.post(url2, headers=headers, json={"text": [texto[:512]]}, timeout=20)
    res2.raise_for_status()
    data2 = res2.json()
    if data2.get("success") and data2["result"].get("data"):
        emb2 = data2["result"]["data"][0]
        return emb2

    raise RuntimeError(f"Falha ao gerar embedding: {res2.text}")


def upsert_vetores(vetores: list) -> dict:
    """Faz upsert de um batch de vetores no Vectorize v2."""
    # Recria headers com token atualizado
    account = os.environ.get('CLOUDFLARE_ACCOUNT_ID', ACCOUNT_ID)
    token = os.environ.get('CLOUDFLARE_API_TOKEN', API_TOKEN)

    url = f"https://api.cloudflare.com/client/v4/accounts/{account}/vectorize/v2/indexes/{INDEX_NAME}/upsert"
    ndjson = "\n".join(json.dumps(v, ensure_ascii=False) for v in vetores)

    res = requests.post(
        url,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/x-ndjson",
        },
        data=ndjson.encode("utf-8"),
        timeout=60,
    )

    if not res.ok:
        print(f"  ❌ Upsert HTTP {res.status_code}: {res.text[:300]}")
    res.raise_for_status()
    return res.json()


# ─── Pipeline principal ──────────────────────────────────────────────────────

def indexar_lei(config: dict):
    print(f"\n{'='*60}")
    print(f"Indexando: {config['lei']} ({config['area']})")
    print(f"{'='*60}")

    html = baixar_lei(config["url"])
    artigos = extrair_artigos(html, config["lei"], config["area"])

    if not artigos:
        print(f"  ⚠️  Nenhum artigo extraído de {config['lei']}.")
        return

    batch = []
    total_indexados = 0
    BATCH_SIZE = 25  # reduzido para evitar payload grande no upsert

    for i, artigo in enumerate(artigos):
        chunk_id = f"{config['sigla']}-art{artigo['numero']}-{hashlib.md5(artigo['texto'].encode()).hexdigest()[:8]}"

        try:
            embedding = gerar_embedding(artigo["texto"])
        except Exception as e:
            print(f"  ⚠️  Embedding Art. {artigo['numero']} falhou: {e}")
            time.sleep(3)
            continue

        batch.append({
            "id": chunk_id,
            "values": embedding,
            "metadata": {
                "text": artigo["texto"][:1000],  # limita metadata a 1000 chars
                "area": artigo["area"],
                "lei": artigo["lei"],
                "artigo": artigo["numero"],
            }
        })

        if len(batch) >= BATCH_SIZE or i == len(artigos) - 1:
            try:
                result = upsert_vetores(batch)
                total_indexados += len(batch)
                print(f"  ✅ Batch enviado: {total_indexados}/{len(artigos)} artigos")
            except Exception as e:
                print(f"  ❌ Erro no upsert: {e}")
            batch = []
            time.sleep(1)

    print(f"\n  ✅ {config['lei']} indexada: {total_indexados} artigos")


def main():
    if not ACCOUNT_ID or not API_TOKEN:
        print("❌ Configure as variáveis de ambiente:")
        print('   $env:CLOUDFLARE_ACCOUNT_ID="seu_account_id"')
        print('   $env:CLOUDFLARE_API_TOKEN="seu_token"')
        return

    print("StudyMaster — Indexador do Vade Mecum")
    print(f"Account ID: {ACCOUNT_ID[:8]}...")
    print(f"Indexando {len(LEIS)} leis no Cloudflare Vectorize...\n")

    # Teste rápido de conectividade com a API antes de começar
    print("Testando conexão com Cloudflare AI...")
    try:
        emb_teste = gerar_embedding("teste de conexão")
        print(f"  ✅ API OK! Embedding gerado com {len(emb_teste)} dimensões\n")
    except Exception as e:
        print(f"  ❌ Falha na API Cloudflare AI: {e}")
        print("  Verifique se o token tem permissão 'Workers AI' (Edit)")
        return

    log = []
    for config in LEIS:
        try:
            indexar_lei(config)
            log.append({"lei": config["lei"], "status": "ok"})
        except Exception as e:
            print(f"  ❌ Erro ao indexar {config['lei']}: {e}")
            log.append({"lei": config["lei"], "status": "erro", "erro": str(e)})
        time.sleep(3)

    with open("scripts/indexacao-log.json", "w", encoding="utf-8") as f:
        json.dump(log, f, ensure_ascii=False, indent=2)

    print("\n" + "="*60)
    print("Indexação concluída!")
    print("="*60)
    sucessos = sum(1 for l in log if l["status"] == "ok")
    print(f"✅ {sucessos}/{len(LEIS)} leis indexadas com sucesso")


if __name__ == "__main__":
    main()
