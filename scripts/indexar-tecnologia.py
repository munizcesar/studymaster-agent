#!/usr/bin/env python3
"""
StudyMaster - Pipeline de Indexacao Tecnologia no Cloudflare Vectorize

Cobre 60 documentos: Programação, BD, Redes, Segurança, Cloud, Web, IA, DevOps, Arquitetura.

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

  {"id":"tec-prog-05","area":"Tecnologia","disciplina":"Programacao","namespace":"tecnologia_geral",
   "texto":"Tecnologia Programacao — TypeScript: TypeScript superset JavaScript tipagem estatica. Interfaces types generics enums. Compila tsc para JS. Strict null checks. Utility types Partial Pick Omit. Decorators experimental. Integracao React Angular. inferencia tipos. Union intersection types. Type narrowing typeof instanceof. tsconfig.json configuracao. Declaracao .d.ts ambient modules."},
  {"id":"tec-prog-06","area":"Tecnologia","disciplina":"Programacao","namespace":"tecnologia_geral",
   "texto":"Tecnologia Programacao — Rust: Rust ownership borrowing lifetimes sem GC. Cargo package manager. Result Option error handling. Match pattern exhaustive. Zero cost abstractions. Memory safety thread safety. async await tokio. FFI C interop. Borrow checker compile time. struct enum impl trait. Cargo.toml dependencies. wasm-bindgen WebAssembly."},
  {"id":"tec-prog-07","area":"Tecnologia","disciplina":"Programacao","namespace":"tecnologia_geral",
   "texto":"Tecnologia Programacao — Go Golang: Go Google concorrencia goroutines channels. Garbage collected compilado rapido. struct interfaces implicitas. error return idiom. go mod dependency. net/http stdlib. context cancellation. defer panic recover. gofmt padronizacao. table driven tests. cloud native Kubernetes Docker escrito Go."},
  {"id":"tec-prog-08","area":"Tecnologia","disciplina":"Programacao","namespace":"tecnologia_geral",
   "texto":"Tecnologia Programacao — Java JVM: Java JVM bytecode WORA. OOP class interface inheritance. Spring Boot dependency injection. Maven Gradle build. JPA Hibernate ORM. Streams lambda Java 8+. Memory heap stack GC tuning. Checked unchecked exceptions. JUnit testing. Microservices Spring Cloud. Records sealed classes Java moderno."},
  {"id":"tec-prog-09","area":"Tecnologia","disciplina":"Programacao","namespace":"tecnologia_geral",
   "texto":"Tecnologia Programacao — C e C++: C procedural ponteiros malloc manual memory. C++ RAII OOP templates STL. Undefined behavior C. Smart pointers unique shared. Move semantics C++11. Header implementation separation. CMake build system. Embedded systems performance critical. Operator overloading. Virtual polymorphism. Modern C++ ranges concepts."},
  {"id":"tec-prog-10","area":"Tecnologia","disciplina":"Programacao","namespace":"tecnologia_geral",
   "texto":"Tecnologia Programacao — PHP Laravel: PHP server side web. Laravel MVC Eloquent ORM. Composer autoload PSR. Blade templates. Artisan CLI. Middleware routing. PHP 8 JIT attributes enums. WordPress CMS popular. Session cookie security. PDO prepared statements SQL injection prevention. Material de referencia para estudo sistematico, revisao de edital e resolucao de questoes objetivas em provas de alto nivel, com foco em conceitos consolidados e terminologia padrao da area."},
  {"id":"tec-bd-03","area":"Tecnologia","disciplina":"Banco de Dados","namespace":"tecnologia_geral",
   "texto":"Tecnologia Banco de Dados — PostgreSQL Avancado: PostgreSQL MVCC isolation levels. EXPLAIN ANALYZE query plan. Partial indexes expression indexes. CTE recursive window functions. JSONB operators GIN index. Replication streaming logical. pg_dump backup restore. Extensions PostGIS pg_trgm. Vacuum autovacuum bloat. Connection pooling PgBouncer."},
  {"id":"tec-bd-04","area":"Tecnologia","disciplina":"Banco de Dados","namespace":"tecnologia_geral",
   "texto":"Tecnologia Banco de Dados — MySQL MariaDB: MySQL InnoDB ACID MyISAM legacy. MariaDB fork compatible. Replication master slave. Binary log. Partitioning sharding. Slow query log optimization. utf8mb4 emoji support. Stored procedures triggers. MySQL Workbench admin. Cloud RDS Aurora managed. Material de referencia para estudo sistematico, revisao de edital e resolucao de questoes objetivas em provas de alto nivel, com foco em conceitos consolidados e terminologia padrao da area."},
  {"id":"tec-bd-05","area":"Tecnologia","disciplina":"Banco de Dados","namespace":"tecnologia_geral",
   "texto":"Tecnologia Banco de Dados — SQL Avancado: Window functions ROW_NUMBER RANK DENSE_RANK LEAD LAG. CTE WITH recursive. PIVOT UNPIVOT. Subquery correlated EXISTS. HAVING GROUP BY ROLLUP CUBE. Transaction isolation phantom read dirty read. Deadlock detection. EXPLAIN plans index seek scan. Normalization denormalization tradeoff."},
  {"id":"tec-bd-06","area":"Tecnologia","disciplina":"Banco de Dados","namespace":"tecnologia_geral",
   "texto":"Tecnologia Banco de Dados — Elasticsearch: Elasticsearch Lucene inverted index full text search. Shards replicas cluster. Query DSL bool must should. Aggregations metrics buckets. Kibana visualization. Logstash ingest pipeline. ELK stack. Near real time indexing. Mapping analyzers tokenizers. Elastic Cloud managed."},
  {"id":"tec-bd-07","area":"Tecnologia","disciplina":"Banco de Dados","namespace":"tecnologia_geral",
   "texto":"Tecnologia Banco de Dados — Graph Database Neo4j: Neo4j property graph nodes relationships. Cypher query language MATCH CREATE. Graph algorithms shortest path centrality. Use cases fraud detection recommendations social network. ACID transactions. Bolt protocol driver. Comparison RDF triple store. Index node property constraint."},
  {"id":"tec-red-03","area":"Tecnologia","disciplina":"Redes","namespace":"tecnologia_geral",
   "texto":"Tecnologia Redes — IPv6 Implementacao: IPv6 dual stack tunneling 6to4 Teredo. SLAAC DHCPv6. ICMPv6 ND NA NS. Extension headers flow label. Multicast MLD. Transition NAT64 DNS64. Address planning /48 site /64 subnet. Privacy extensions temporary addresses. IPv6 only future. Ping6 traceroute6. Conteúdo consolidado para provas de concurso público e vestibular, com termos técnicos frequentes em bancas como CESPE, FCC, FGV e Vunesp."},
  {"id":"tec-red-04","area":"Tecnologia","disciplina":"Redes","namespace":"tecnologia_geral",
   "texto":"Tecnologia Redes — BGP e Roteamento: BGP inter-domain routing AS path. eBGP iBGP full mesh route reflector. Attributes LOCAL_PREF MED AS_PATH. Policy routing prefix lists route maps. Peering transit IX internet exchange. BGP convergence flapping. RPKI ROV route origin validation. Default free zone. Conteúdo consolidado para provas de concurso público e vestibular, com termos técnicos frequentes em bancas como CESPE, FCC, FGV e Vunesp."},
  {"id":"tec-red-05","area":"Tecnologia","disciplina":"Redes","namespace":"tecnologia_geral",
   "texto":"Tecnologia Redes — Firewalls e Seguranca Perimetral: Stateful firewall connection tracking. ACL permit deny order. NGFW application awareness IPS integrated. DMZ architecture. NAT PAT overload. VPN site to site IPsec. WAF OWASP rules. Microsegmentation Zero Trust. Cloud security groups NACLs AWS. Material de referencia para estudo sistematico, revisao de edital e resolucao de questoes objetivas em provas de alto nivel, com foco em conceitos consolidados e terminologia padrao da area."},
  {"id":"tec-red-06","area":"Tecnologia","disciplina":"Redes","namespace":"tecnologia_geral",
   "texto":"Tecnologia Redes — Load Balancer e CDN: Load balancer L4 L7 round robin least connections. Health check passive active. Sticky session cookie. HAProxy NGINX F5. CDN edge cache origin pull push. Cloudflare Fastly Akamai. DDoS mitigation scrubbing center. Anycast routing. SSL termination at edge. Conteúdo consolidado para provas de concurso público e vestibular, com termos técnicos frequentes em bancas como CESPE, FCC, FGV e Vunesp."},
  {"id":"tec-red-07","area":"Tecnologia","disciplina":"Redes","namespace":"tecnologia_geral",
   "texto":"Tecnologia Redes — SDN e NFV: SDN control plane data plane separation OpenFlow. NFV virtualize network functions VNF. SD-WAN enterprise branch. OpenDaylight controller. Programmable network automation. Intent based networking. Comparison traditional appliance. Cloud VPC software defined. Network virtualization overlay VXLAN."},
  {"id":"tec-seg-03","area":"Tecnologia","disciplina":"Seguranca","namespace":"tecnologia_geral",
   "texto":"Tecnologia Seguranca — Zero Trust Architecture: Never trust always verify NIST SP 800-207. Identity centric microsegmentation. Continuous authentication device posture. SDP hide infrastructure. Least privilege JIT access. Compare castle moat VPN trust. BeyondCorp Google model. ZTNA replace VPN. Log analytics UEBA anomaly."},
  {"id":"tec-seg-04","area":"Tecnologia","disciplina":"Seguranca","namespace":"tecnologia_geral",
   "texto":"Tecnologia Seguranca — Pentest e Ethical Hacking: Phases reconnaissance scanning enumeration exploitation post-exploitation reporting. OWASP Testing Guide. Metasploit framework. Burp Suite proxy. Nmap Nessus OpenVAS scan. Social engineering assessment. Scope rules of engagement legal authorization. CVSS scoring vulnerability. Remediation retest verify fix."},
  {"id":"tec-seg-05","area":"Tecnologia","disciplina":"Seguranca","namespace":"tecnologia_geral",
   "texto":"Tecnologia Seguranca — SIEM e SOC: SIEM aggregate correlate logs Splunk QRadar Sentinel. Use cases rules alerts. SOC tiers L1 triage L2 investigate L3 hunt. Playbook automation SOAR. MTTD MTTR metrics. Threat intelligence feeds IOC. Incident response NIST framework. Forensics preserve chain custody."},
  {"id":"tec-seg-06","area":"Tecnologia","disciplina":"Seguranca","namespace":"tecnologia_geral",
   "texto":"Tecnologia Seguranca — Criptografia Aplicada: AES GCM authenticated encryption. RSA 2048 minimum ECC P-256. TLS 1.3 handshake 0-RTT. Certificate pinning mobile. HSM key storage. PKI root intermediate leaf. Hash salt bcrypt Argon2 password. Digital signature non-repudiation. Quantum resistant algorithms NIST PQC."},
  {"id":"tec-clo-03","area":"Tecnologia","disciplina":"Cloud Computing","namespace":"tecnologia_geral",
   "texto":"Tecnologia Cloud Computing — AWS Core Services: EC2 compute S3 object storage RDS managed SQL. VPC networking IAM identity. Lambda serverless. CloudWatch monitoring. Route53 DNS. ELB load balance. EBS block storage. CloudFormation IaC. Well Architected Framework pillars. Regions AZ high availability. Free tier billing."},
  {"id":"tec-clo-04","area":"Tecnologia","disciplina":"Cloud Computing","namespace":"tecnologia_geral",
   "texto":"Tecnologia Cloud Computing — Azure Fundamentals: VM App Service Functions. Blob Storage Cosmos DB. Active Directory Entra ID. ARM templates Bicep. Azure DevOps CI CD. Monitor Log Analytics. Virtual Network NSG. AKS Kubernetes managed. Hybrid Arc. Pricing calculator reserved instances. Material de referencia para estudo sistematico, revisao de edital e resolucao de questoes objetivas em provas de alto nivel, com foco em conceitos consolidados e terminologia padrao da area."},
  {"id":"tec-clo-05","area":"Tecnologia","disciplina":"Cloud Computing","namespace":"tecnologia_geral",
   "texto":"Tecnologia Cloud Computing — Google Cloud GCP: Compute Engine Cloud Run GKE. Cloud Storage BigQuery analytics. Cloud Functions event driven. IAM roles policies. Pub Sub messaging. Cloud CDN Armor security. Anthos multi cloud. Preemptible VMs cost save. Cloud Shell browser CLI. Material de referencia para estudo sistematico, revisao de edital e resolucao de questoes objetivas em provas de alto nivel, com foco em conceitos consolidados e terminologia padrao da area."},
  {"id":"tec-clo-06","area":"Tecnologia","disciplina":"Cloud Computing","namespace":"tecnologia_geral",
   "texto":"Tecnologia Cloud Computing — Serverless e FaaS: FaaS event triggered stateless. AWS Lambda Azure Functions Cloud Functions Workers. Cold start optimization. Event sources API Gateway SQS SNS. Pay per invocation. Limit execution time memory. Serverless framework SAM CDK deploy. Step Functions orchestration. Vendor lock in consideration."},
  {"id":"tec-web-03","area":"Tecnologia","disciplina":"Desenvolvimento Web","namespace":"tecnologia_geral",
   "texto":"Tecnologia Desenvolvimento Web — React Avancado: React 18 concurrent features Suspense. Hooks useState useEffect useContext useReducer useMemo useCallback. Custom hooks. React Query TanStack data fetching. Zustand Redux state. React Router v6. Next.js SSR SSG ISR. Performance memo lazy code splitting. Testing Library Jest."},
  {"id":"tec-web-04","area":"Tecnologia","disciplina":"Desenvolvimento Web","namespace":"tecnologia_geral",
   "texto":"Tecnologia Desenvolvimento Web — Vue e Angular: Vue 3 Composition API reactivity ref computed. Pinia state Vue Router. Angular TypeScript modules components services dependency injection. RxJS observables. NgRx state management. Svelte compile no virtual DOM. Framework choice criteria team ecosystem."},
  {"id":"tec-web-05","area":"Tecnologia","disciplina":"Desenvolvimento Web","namespace":"tecnologia_geral",
   "texto":"Tecnologia Desenvolvimento Web — CSS e Tailwind: Flexbox Grid responsive mobile first. Tailwind utility first JIT purge. CSS variables custom properties. BEM naming convention. Sass SCSS nesting mixins. Accessibility focus visible reduced motion. Dark mode prefers-color-scheme. Container queries. CSS modules scoped."},
  {"id":"tec-web-06","area":"Tecnologia","disciplina":"Desenvolvimento Web","namespace":"tecnologia_geral",
   "texto":"Tecnologia Desenvolvimento Web — Web Performance: Core Web Vitals LCP FID CLS INP. Lighthouse audit. Lazy load images responsive srcset. Code split bundle analyze webpack. CDN cache headers ETag. Critical CSS inline. HTTP2 multiplexing server push deprecated. Service Worker PWA offline. Image format WebP AVIF."},
  {"id":"tec-ia-03","area":"Tecnologia","disciplina":"Inteligencia Artificial","namespace":"tecnologia_geral",
   "texto":"Tecnologia Inteligencia Artificial — LangChain e RAG: LangChain chains agents tools memory. Document loaders text splitters. Vector store Pinecone Weaviate Chroma Vectorize. Retriever similarity MMR. Prompt template ChatPromptTemplate. Output parser structured. LangSmith tracing debug. LCEL composition. Hybrid search keyword semantic."},
  {"id":"tec-ia-04","area":"Tecnologia","disciplina":"Inteligencia Artificial","namespace":"tecnologia_geral",
   "texto":"Tecnologia Inteligencia Artificial — Embeddings e Vector DB: Embedding dense vector semantic similarity. OpenAI text-embedding-3 Cloudflare bge-m3. Cosine distance dot product. Chunk size overlap strategy. Metadata filter hybrid query. HNSW index approximate nearest neighbor. Dimension 384 768 1024. Fine tune domain specific embedding."},
  {"id":"tec-ia-05","area":"Tecnologia","disciplina":"Inteligencia Artificial","namespace":"tecnologia_geral",
   "texto":"Tecnologia Inteligencia Artificial — Fine-tuning e LoRA: Fine-tune adapt pre-trained model domain data. LoRA low rank adaptation efficient. Full fine tune expensive catastrophic forgetting. Dataset format JSONL instruction response. Hyperparameter learning rate epochs. Evaluation benchmark holdout. RLHF human feedback alignment. Quantization INT8 inference speed."},
  {"id":"tec-ia-06","area":"Tecnologia","disciplina":"Inteligencia Artificial","namespace":"tecnologia_geral",
   "texto":"Tecnologia Inteligencia Artificial — MLOps: MLflow experiment tracking model registry. Feature store Feast Tecton. Pipeline Kubeflow Airflow orchestration. Model serving TorchServe TensorFlow Serving. A B test model production. Data drift concept drift monitor. CI CD ML retrain trigger. Reproducibility seed version data code."},
  {"id":"tec-dev-02","area":"Tecnologia","disciplina":"DevOps","namespace":"tecnologia_geral",
   "texto":"Tecnologia DevOps — GitOps e ArgoCD: GitOps Git single source truth declarative. ArgoCD Flux sync cluster from repo. Pull vs push deployment. Helm Kustomize manifest. Rollback git revert. Drift detection reconcile. Progressive delivery Flagger canary. Sealed secrets SOPS encryption. Multi cluster management."},
  {"id":"tec-dev-03","area":"Tecnologia","disciplina":"DevOps","namespace":"tecnologia_geral",
   "texto":"Tecnologia DevOps — Kubernetes Avancado: Deployment ReplicaSet Pod Service ClusterIP NodePort LoadBalancer. Ingress controller NGINX Traefik. ConfigMap Secret. HPA autoscale VPA. Namespace RBAC ServiceAccount. StatefulSet persistent volume. DaemonSet node agent. Helm chart package. kubectl apply describe logs exec."},
  {"id":"tec-dev-04","area":"Tecnologia","disciplina":"DevOps","namespace":"tecnologia_geral",
   "texto":"Tecnologia DevOps — Terraform e IaC: Terraform HCL plan apply destroy. State file remote S3 backend locking. Provider AWS Azure GCP. Module reuse. Import existing resource. Drift terraform refresh. Workspace environment dev prod. Ansible config management complementary. Pulumi code IaC TypeScript. Conteúdo consolidado para provas de concurso público e vestibular, com termos técnicos frequentes em bancas como CESPE, FCC, FGV e Vunesp."},
  {"id":"tec-dev-05","area":"Tecnologia","disciplina":"DevOps","namespace":"tecnologia_geral",
   "texto":"Tecnologia DevOps — CI/CD Pipelines: GitHub Actions workflow yaml jobs steps. GitLab CI Jenkins CircleCI. Build test deploy stages. Artifact registry container scan gate. Blue green deployment zero downtime. Canary release percentage traffic. Feature flag LaunchDarkly. Rollback automated health check fail."},
  {"id":"tec-dev-06","area":"Tecnologia","disciplina":"DevOps","namespace":"tecnologia_geral",
   "texto":"Tecnologia DevOps — Observabilidade: Three pillars metrics logs traces. Prometheus Grafana dashboard alert. OpenTelemetry standard instrumentation. Jaeger Zipkin distributed trace. ELK EFK log aggregation. SLI SLO SLA error budget. On call PagerDuty rotation. Postmortem blameless culture. RED USE method monitoring."},
  {"id":"tec-arch-01","area":"Tecnologia","disciplina":"Arquitetura","namespace":"tecnologia_geral",
   "texto":"Tecnologia Arquitetura — Microservicos: Microservices bounded context DDD. API Gateway BFF pattern. Service mesh Istio Linkerd. Circuit breaker Hystrix resilience4j. Saga distributed transaction choreografia orchestracao. Event driven Kafka async. Database per service. Monolith first evolve. CAP tradeoff availability partition."},
  {"id":"tec-arch-02","area":"Tecnologia","disciplina":"Arquitetura","namespace":"tecnologia_geral",
   "texto":"Tecnologia Arquitetura — Event-Driven Architecture: Event producer consumer broker. Kafka topic partition offset consumer group. Event sourcing store events replay. CQRS separate read write model. Idempotent consumer exactly once semantics challenge. Schema registry Avro Protobuf. Dead letter queue poison message. Outbox pattern reliable publish."},
  {"id":"tec-arch-03","area":"Tecnologia","disciplina":"Arquitetura","namespace":"tecnologia_geral",
   "texto":"Tecnologia Arquitetura — Clean Architecture: Uncle Bob layers entities use cases adapters frameworks. Dependency rule inward. Ports adapters hexagonal. SOLID DIP dependency inversion. Testability isolate business logic. DTO vs entity. Repository pattern abstraction persistence. Framework independent core. Onion architecture similar."},
  {"id":"tec-arch-04","area":"Tecnologia","disciplina":"Arquitetura","namespace":"tecnologia_geral",
   "texto":"Tecnologia Arquitetura — System Design: Scalability horizontal vertical sharding replication. Cache Redis CDN database query. Load balancer rate limit throttle. CAP PACELC theorem. Consistent hashing partition. Message queue async decouple. CDN static content. Design interview URL shortener Twitter feed. Bottleneck identify profile."},
  {"id":"tec-arch-05","area":"Tecnologia","disciplina":"Arquitetura","namespace":"tecnologia_geral",
   "texto":"Tecnologia Arquitetura — API Design Patterns: REST resource noun HTTP verb status code. GraphQL schema query mutation subscription. gRPC protobuf HTTP2 performance. OpenAPI Swagger contract first. Versioning URI header content negotiation. Pagination cursor offset limit. Idempotency key POST retry. HATEOAS hypermedia maturity Richardson."},


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

        batch.append({"id": chunk_id, "values": emb, "namespace": item.get("namespace", "tecnologia_geral"), "metadata": {
            "text": item["texto"][:1000],
            "area": item["area"],
            "disciplina": item["disciplina"],
            "namespace": item.get("namespace", "tecnologia_geral"),
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
