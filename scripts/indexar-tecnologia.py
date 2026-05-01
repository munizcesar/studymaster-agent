#!/usr/bin/env python3
"""
StudyMaster - Pipeline de Indexacao Tecnologia no Cloudflare Vectorize

Cobre:
  - Programacao (Python, JavaScript, algoritmos)
  - Banco de Dados (SQL, NoSQL)
  - Redes e Infraestrutura
  - Seguranca da Informacao
  - Cloud Computing (AWS, Azure, GCP)
  - Desenvolvimento Web (HTML, CSS, JS, frameworks)
  - Inteligencia Artificial e Machine Learning
  - DevOps e Git

Uso:
  1. Configure CLOUDFLARE_ACCOUNT_ID e CLOUDFLARE_API_TOKEN
  2. Execute: python scripts/indexar-tecnologia.py
"""

import os
import json
import time
import hashlib
import requests

ACCOUNT_ID = os.environ.get("CLOUDFLARE_ACCOUNT_ID", "")
API_TOKEN  = os.environ.get("CLOUDFLARE_API_TOKEN", "")
INDEX_NAME = "studymaster-knowledge"

CONTEUDOS_TECNOLOGIA = [

  # PROGRAMACAO
  {"id": "tec-prog-01", "area": "Tecnologia", "disciplina": "Programacao",
   "texto": "Tecnologia Programacao - Algoritmos e Estruturas de Dados: algoritmo (sequencia, selecao, repeticao), complexidade (O(1), O(n), O(n log n), O(n2)), arrays, listas ligadas, pilhas (LIFO), filas (FIFO), arvores (binaria, AVL, B-tree), grafos (BFS, DFS), ordenacao (bubble sort, merge sort, quick sort), busca (linear e binaria), recursao, ponteiros, alocacao dinamica de memoria."},
  {"id": "tec-prog-02", "area": "Tecnologia", "disciplina": "Programacao",
   "texto": "Tecnologia Programacao - Python: tipos de dados (int, float, str, bool, list, tuple, dict, set), controle de fluxo (if/elif/else, for, while, break, continue), funcoes (def, lambda, *args, **kwargs), orientacao a objetos (class, heranca, encapsulamento, polimorfismo, __init__, self), modulos (os, sys, json, requests, datetime, math), list comprehension, generators, decorators, context managers (with), tratamento de excecoes (try/except/finally)."},
  {"id": "tec-prog-03", "area": "Tecnologia", "disciplina": "Programacao",
   "texto": "Tecnologia Programacao - JavaScript: var/let/const, tipos primitivos, funcoes (declaration, expression, arrow function), callbacks, Promises, async/await, Event Loop, closures, prototype e heranca prototipica, ES6+ (destructuring, spread, rest, template literals, modulos import/export), DOM manipulation, eventos, fetch API, JSON.parse/stringify, Node.js (CommonJS, npm, express basico)."},
  {"id": "tec-prog-04", "area": "Tecnologia", "disciplina": "Programacao",
   "texto": "Tecnologia Paradigmas de Programacao: imperativo vs declarativo, POO (encapsulamento, heranca, polimorfismo, abstracao), funcional (funcoes puras, imutabilidade, map/filter/reduce, currying, memoizacao), SOLID (Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion), Design Patterns (Singleton, Factory, Observer, Strategy, MVC, Repository), Clean Code, TDD."},

  # BANCO DE DADOS
  {"id": "tec-bd-01", "area": "Tecnologia", "disciplina": "Banco de Dados",
   "texto": "Tecnologia Banco de Dados SQL: modelo relacional (tabelas, linhas, colunas, chave primaria PK, chave estrangeira FK), SQL DDL (CREATE TABLE, ALTER TABLE, DROP TABLE), DML (SELECT, INSERT, UPDATE, DELETE), JOIN (INNER, LEFT, RIGHT, FULL OUTER), GROUP BY, HAVING, ORDER BY, subqueries, indices (B-tree, hash), views, stored procedures, triggers, transacoes ACID (Atomicidade, Consistencia, Isolamento, Durabilidade), normalizacao (1FN, 2FN, 3FN, BCNF)."},
  {"id": "tec-bd-02", "area": "Tecnologia", "disciplina": "Banco de Dados",
   "texto": "Tecnologia Banco de Dados NoSQL: tipos (documentos: MongoDB, chave-valor: Redis, colunar: Cassandra, grafos: Neo4j), quando usar NoSQL vs SQL, schema flexivel, escalabilidade horizontal, CAP theorem (Consistencia, Disponibilidade, Tolerancia a particao), BASE vs ACID, MongoDB (collections, documents, BSON, queries, aggregation pipeline, indices), Redis (strings, hashes, lists, sets, pub/sub, cache, TTL)."},

  # REDES E INFRAESTRUTURA
  {"id": "tec-red-01", "area": "Tecnologia", "disciplina": "Redes",
   "texto": "Tecnologia Redes - Modelo OSI e TCP/IP: camadas OSI (Fisica, Enlace, Rede, Transporte, Sessao, Apresentacao, Aplicacao), modelo TCP/IP (4 camadas), IP (IPv4 classless, CIDR, subnetting, mascara, gateway, broadcast), TCP vs UDP, portas conhecidas (HTTP:80, HTTPS:443, FTP:21, SSH:22, DNS:53, SMTP:25, POP3:110, IMAP:143), roteamento (RIP, OSPF, BGP), NAT, VLAN, QoS."},
  {"id": "tec-red-02", "area": "Tecnologia", "disciplina": "Redes",
   "texto": "Tecnologia Redes - DNS, HTTP e Protocolos: DNS (resolucao de nomes, registros A, AAAA, CNAME, MX, TXT, NS, SOA, TTL, recursivo vs iterativo), HTTP/HTTPS (metodos GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS; status codes 1xx, 2xx, 3xx, 4xx, 5xx; headers; cookies; sessoes; CORS; REST vs SOAP; JSON vs XML), WebSockets, gRPC, GraphQL basico."},

  # SEGURANCA DA INFORMACAO
  {"id": "tec-seg-01", "area": "Tecnologia", "disciplina": "Seguranca",
   "texto": "Tecnologia Seguranca da Informacao - Conceitos: tríade CIA (Confidencialidade, Integridade, Disponibilidade), autenticacao (senha, MFA, biometria, tokens JWT, OAuth 2.0, OpenID Connect), autorizacao (RBAC, ABAC), criptografia simetrica (AES, DES) vs assimetrica (RSA, ECC), hashing (MD5 - inseguro, SHA-256, bcrypt), certificados digitais (SSL/TLS, PKI, CA), HTTPS, HSTS."},
  {"id": "tec-seg-02", "area": "Tecnologia", "disciplina": "Seguranca",
   "texto": "Tecnologia Seguranca - Vulnerabilidades e LGPD: OWASP Top 10 (SQL Injection, XSS, CSRF, IDOR, SSRF, insecure deserialization, broken auth, security misconfiguration, sensitive data exposure, XXE), pentest (reconhecimento, scan, exploracao, pos-exploracao), firewall (stateful, WAF), IDS/IPS, LGPD (Lei 13.709/2018: dados pessoais, dados sensiveis, DPO, ANPD, base legal, direitos do titular, incidentes de seguranca)."},

  # CLOUD COMPUTING
  {"id": "tec-clo-01", "area": "Tecnologia", "disciplina": "Cloud Computing",
   "texto": "Tecnologia Cloud Computing - Conceitos e Modelos: modelos de servico (IaaS, PaaS, SaaS, FaaS/Serverless), modelos de implantacao (publica, privada, hibrida, multi-cloud), principais provedores (AWS, Azure, GCP), conceitos (elasticidade, escalabilidade vertical e horizontal, alta disponibilidade, SLA, regiao, zona de disponibilidade), custo (pay-as-you-go, Reserved Instances, Spot), migracao para nuvem (lift-and-shift, re-platform, re-architect)."},
  {"id": "tec-clo-02", "area": "Tecnologia", "disciplina": "Cloud Computing",
   "texto": "Tecnologia Cloudflare e Edge Computing: Cloudflare Workers (JavaScript no edge, sem servidor, deploy global), Cloudflare Pages (hospedagem de sites estaticos com CI/CD), Cloudflare Vectorize (banco de dados vetorial para IA/RAG), Cloudflare AI (modelos de ML na borda: LLM, embedding, classificacao, traducao), Workers KV (armazenamento chave-valor), D1 (banco SQLite serverless), R2 (armazenamento de objetos compativel com S3)."},

  # DESENVOLVIMENTO WEB
  {"id": "tec-web-01", "area": "Tecnologia", "disciplina": "Desenvolvimento Web",
   "texto": "Tecnologia Desenvolvimento Web - Frontend: HTML5 (semantica, acessibilidade, SEO), CSS3 (box model, flexbox, grid, responsividade, media queries, variaveis CSS, animacoes), JavaScript no browser (DOM, eventos, fetch, localStorage, sessionStorage), React (componentes, props, state, hooks: useState/useEffect/useContext/useRef, Virtual DOM, JSX, ciclo de vida), frameworks CSS (Tailwind CSS, Bootstrap), build tools (Vite, Webpack)."},
  {"id": "tec-web-02", "area": "Tecnologia", "disciplina": "Desenvolvimento Web",
   "texto": "Tecnologia Desenvolvimento Web - Backend e APIs: Node.js + Express (rotas, middlewares, autenticacao JWT, CORS, rate limiting), arquitetura REST (recursos, verbos HTTP, status codes, versionamento /v1), autenticacao (JWT: header.payload.signature, refresh tokens, OAuth2), APIs (design, documentacao com Swagger/OpenAPI, testes com Postman/Insomnia), microservicos vs monolito, mensageria (RabbitMQ, Kafka basico)."},

  # INTELIGENCIA ARTIFICIAL
  {"id": "tec-ia-01", "area": "Tecnologia", "disciplina": "Inteligencia Artificial",
   "texto": "Tecnologia Inteligencia Artificial - Machine Learning: supervisionado (regressao linear/logistica, arvore de decisao, Random Forest, SVM, KNN) vs nao supervisionado (K-means, PCA, clustering hierarquico) vs reinforcement learning, overfitting e underfitting, validacao cruzada (cross-validation), metricas (acuracia, precisao, recall, F1-score, AUC-ROC, MAE, RMSE), feature engineering, normalizacao (Min-Max, Z-score), bibliotecas Python (scikit-learn, pandas, numpy, matplotlib)."},
  {"id": "tec-ia-02", "area": "Tecnologia", "disciplina": "Inteligencia Artificial",
   "texto": "Tecnologia IA - Deep Learning e LLMs: redes neurais (perceptron, camadas, funcoes de ativacao: ReLU, sigmoid, softmax, backpropagation, gradient descent), CNN (imagens), RNN/LSTM (sequencias), Transformers (atencao, BERT, GPT, encoder-decoder), Large Language Models (LLMs: GPT-4, Llama, Gemini, Claude), RAG (Retrieval Augmented Generation: embeddings, banco vetorial, busca semantica), prompt engineering (zero-shot, few-shot, chain-of-thought)."},

  # DEVOPS E GIT
  {"id": "tec-dev-01", "area": "Tecnologia", "disciplina": "DevOps",
   "texto": "Tecnologia DevOps - Git e CI/CD: Git (init, clone, add, commit, push, pull, branch, merge, rebase, cherry-pick, stash, tag, .gitignore), GitHub/GitLab (pull request, code review, issues, Actions/CI), CI/CD (pipeline: build, test, deploy, rollback), Docker (imagem, container, Dockerfile, docker-compose, volumes, redes, registry), Kubernetes basico (pod, deployment, service, ingress, namespace, kubectl), Terraform (IaC basico)."},
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
        print(f"  ERRO Upsert HTTP {res.status_code}: {res.text[:300]}")
    res.raise_for_status()
    return res.json()


def main():
    account = os.environ.get("CLOUDFLARE_ACCOUNT_ID", ACCOUNT_ID)
    token   = os.environ.get("CLOUDFLARE_API_TOKEN", API_TOKEN)
    if not account or not token:
        print("ERRO: Configure as variaveis de ambiente:")
        print('   $env:CLOUDFLARE_ACCOUNT_ID="seu_id"')
        print('   $env:CLOUDFLARE_API_TOKEN="seu_token"')
        return

    print("StudyMaster - Indexador Tecnologia")
    print(f"Total de conteudos: {len(CONTEUDOS_TECNOLOGIA)}")
    print("Testando API...")
    try:
        emb = gerar_embedding("teste tecnologia")
        print(f"  OK API - {len(emb)} dims\n")
    except Exception as e:
        print(f"  ERRO: {e}")
        return

    batch, total, BATCH_SIZE = [], 0, 20
    for i, item in enumerate(CONTEUDOS_TECNOLOGIA):
        chunk_id = f"{item['id']}-{hashlib.md5(item['texto'].encode()).hexdigest()[:8]}"
        try:
            emb = gerar_embedding(item["texto"])
        except Exception as e:
            print(f"  AVISO Embedding {item['id']} falhou: {e}")
            time.sleep(3)
            continue

        batch.append({"id": chunk_id, "values": emb, "metadata": {
            "text": item["texto"][:1000],
            "area": item["area"],
            "disciplina": item["disciplina"],
            "fonte": "Conteudo Programatico Tecnologia - Programacao, Redes, Cloud, IA, DevOps",
        }})

        if len(batch) >= BATCH_SIZE or i == len(CONTEUDOS_TECNOLOGIA) - 1:
            try:
                upsert_vetores(batch)
                total += len(batch)
                print(f"  OK {total}/{len(CONTEUDOS_TECNOLOGIA)} conteudos indexados")
            except Exception as e:
                print(f"  ERRO Upsert: {e}")
            batch = []
            time.sleep(1)

    print(f"\nOK Tecnologia indexado: {total} conteudos no Vectorize")
    print("Questoes de TI, Programacao, Cloud e IA agora usam RAG!")


if __name__ == "__main__":
    main()
