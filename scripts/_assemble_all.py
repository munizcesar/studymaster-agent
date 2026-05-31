#!/usr/bin/env python3
"""Assembles complete scripts/_gen_index_content.py and runs it."""
import ast
import re
from pathlib import Path

from _gen_topics_data import RL_TOPICS, INF_TOPICS, _b

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "_gen_index_content.py"
OUT = ROOT / "_gen_index_content.py"


def extract_list(name: str, text: str):
    m = re.search(rf"{name}\s*=\s*\[", text)
    if not m:
        raise ValueError(name)
    start = m.end() - 1
    depth = 0
    for i in range(start, len(text)):
        if text[i] == "[":
            depth += 1
        elif text[i] == "]":
            depth -= 1
            if depth == 0:
                return ast.literal_eval(text[start : i + 1])
    raise ValueError(name)


def py_str(s: str) -> str:
    return repr(s)


def fmt_topics(name: str, topics: list) -> str:
    lines = [f"{name} = ["]
    for sub, body in topics:
        lines.append(f"    ({py_str(sub)}, {py_str(body)}),")
    lines.append("]")
    return "\n".join(lines)


AP_TOPICS = [
    ("Governo Digital — EGD e Decreto 10.332/2020", _b("Estrategia de Governo Digital 2020-2022 e continuidade em politicas posteriores. Principios: centrado no cidadao, participativo, integrado, inovador. gov.br login unico. Assinatura eletronica gov.br. Carteira de documentos digitais. Desburocratizacao e simplificacao de servicos. Interoperabilidade via Plataforma de Cidadania Digital. Avaliacao de maturidade digital. Transformacao digital exige mudanca cultural, nao apenas tecnologica.")),
    ("Plataforma gov.br — Servicos Publicos Digitais", _b("Portal gov.br centraliza servicos federais. Niveis prata e ouro de conta aumentam confiabilidade. Integracao CPf, INSS, Receita, Justica. Notificacoes push de prazos. API gov.br para integracao interorgaos. Acessibilidade WCAG AA obrigatoria. Metricas de uso e satisfacao NPS. Reducao filas presenciais. Identidade digital como infraestrutura critica. Continuidade exige plano de contingencia e redundancia.")),
    ("Transparencia Ativa e Dados Abertos", _b("Lei 12.527/2011 LAI: acesso a informacao publica e regra. Decreto 8.777/2016 politica de dados abertos. Portal dados.gov.br conjuntos machine-readable. Transparencia ativa: publicar sem solicitacao. Classificacao sigilo: ultrassecreta 25 anos, secreta 15, reservada 5. CGU e Controladoria monitoram compliance. Reutilizacao por sociedade civil e imprensa. Formato CSV, JSON, API REST preferidos.")),
    ("Parcerias Publico-Privadas — Lei 11.079/2004", _b("PPP: contrato administrativo com remuneracao vinculada desempenho. Modelos: patrocinada (tarifa + contraprestacao publica) e administrativa (tarifa insuficiente). Projeto de lei autorizativo previo. Analise de viabilidade e value for money. Reparticao objetiva de riscos. Garantias publicas limitadas. Unidade PPP no orgao. Duracao tipica 20-30 anos. Concessao patrocinada versus PPP — criterios de escolha.")),
    ("Concessoes e Permissoes de Servicos Publicos", _b("Lei 8.987/95 servicos publicos. Concessao: licitacao, contrato, tarifa ao usuario. Permissao: ato unilateral precario. Autorizacao: uso privativo bem publico. Reversao bens ao termino. Fiscalizacao agencia reguladora. Equilibrio economico-financeiro. Extincao: encampação, caducidade, rescisao, anulacao. ANTT rodovias, ANEEL energia. Qualidade regulada por indicadores e penalidades.")),
    ("Terceiro Setor — MROSC Lei 13.019/2014", _b("Marco Regulatorio Organizacoes Sociedade Civil. Termos colaboracao e fomento substituem convenio generico. Chamamento publico obrigatorio. Comissao avaliacao e parecer juridico. Plano de trabalho, metas, cronograma. Prestacao contas rigorosa. Proibicao caixa dois. OSCIP Lei 9.790/99 regime especial. Parceria nao gera vinculo empregaticio. Transparencia portal parcerias.")),
    ("Avaliacao de Politicas Publicas", _b("Ciclo: diagnostico, desenho, implementacao, avaliacao, ajuste. Tipos: ex ante (viabilidade), processo (implementacao fiel), resultado (impacto), ex post (custo-beneficio). Contrafactual e grupos controle quando possivel. Indicadores SMART. Evidencias para decisao baseada em dados. Comissao Nacional Avaliacao. Randomized controlled trials em programas sociais. Limitacoes: atribuicao causal, externalidades.")),
    ("Indicadores e Metas no Setor Publico", _b("IDG, IDHM, IPEA indicadores sociais. ODS Agenda 2030 metas globais. OKRs adaptados: Objective + Key Results trimestrais. KPI operacionais versus estrategicos. Benchmarking entre orgaos. Painel publico resultados. Meta fiscal LRF. Desempenho versus conformidade. Leading versus lagging indicators. Dashboard Power BI governamental. Alertas desvio meta automaticos.")),
    ("Gestao por Resultados — GRP", _b("GRP foca outcomes, nao apenas outputs. Contrato gestao entre entes. Metas quantificadas. Monitoramento continuo. Vinculacao orcamento desempenho ODD. Chile e Nova Zelandia referencias. Brasil experiencia MPOG. Avaliacao desempenho orgao. Consequencias manageriais. Diferenca gestao por processos burocraticos. Transparencia resultados ao cidadao.")),
    ("Metodologias Ageis na Administracao Publica", _b("Scrum: product owner, scrum master, sprints 2-4 semanas. Kanban fluxo continuo WIP limit. SAFe escala agile enterprise. Lean startup MVP testar hipoteses. Aplicacao: TI gov, reformulacao servicos. Barreiras: procurement tradicional, cultura hierarquica. Laboratorios inovacao gov (DIL, Enap). Design sprint Google Ventures 5 dias. Retrospectiva melhoria continua.")),
    ("Design Thinking e Jornada do Cidadao", _b("Empatia, definicao, ideacao, prototipacao, teste. Personas e mapa jornada identificam pain points. Servico publico centrado usuario. Prototipo baixa fidelidade antes desenvolvimento caro. Co-criacao com usuarios reais. NPS e CES medem experiencia. Simplificacao formularios. Unificacao pontos contato omnichannel. Gov.br reduz jornadas multiplas senhas.")),
    ("Atendimento ao Cidadao e Ouvidoria", _b("Ouvidoria canal direito peticao art 5 CF. Lei 13.460/2017 Carta Servicos prazos qualidade. Ouvidoria-Geral Uniao modelo. Manifestacao: reclamacao, sugestao, elogio, denuncia. SLA resposta tipico 30 dias. Ouvidor independente. Pesquisa satisfacao pos-atendimento. Integracao Consumidor.gov.br. Escuta ativa e feedback loop para gestor.")),
    ("Compras Publicas Sustentaveis", _b("Decreto 7.746/2012 sustentabilidade licitacoes. Criterio sustentabilidade fase julgamento. Especificacoes tecnicas ambientais. Logistica reversa. Fornecedores certificacao ISO 14001. Economia circular. PNAE agricultura familiar. Inclusao ME EPP LC 123. PNCP portal unico compras. Rastreabilidade cadeia. Reducao desperdicio alimentar orgaos publicos.")),
    ("Pregao Eletronico — Lei 14.133/2021", _b("Pregao modalidade preferencial bens servicos comuns. Sessao publica lances tempo real. Inversao fases: proposta antes habilitacao permitida. Microempresa desconto 5% empate. Negociacao preco com primeiro colocado. Impugnacao edital 3 dias uteis. Recursos administrativos. Sistema Compras.gov.br. Dispensa valor inferior limiar. Impugnacao e saneamento edital.")),
    ("Fiscalizacao e Gestao de Contratos", _b("Gestor e fiscal contrato Lei 14.133 art 117. Fiscal acompanha execucao, registra ocorrencias, comunica gestor. TAC termo ajustamento conduta. Glosa pagamento inadimplemento. Reequilibrio economico-financeiro art 124. Extincao rescisao unilateral. Garantia contratual 5% comum. Documentacao fotografica obra. Relatorio fiscalizacao periodico obrigatorio.")),
    ("Gestao de Riscos na Administracao Publica", _b("ISO 31000 gestao riscos. Matriz probabilidade x impacto. Riscos estrategicos, operacionais, conformidade, financeiros. Mapa calor visual. Planos mitigacao e contingencia. Comite riscos alta administracao. Continuidade negocios BCP. Risco licitatorio: sobrepreco, direcionamento. Auditoria interna valida controles. Appetite risco define tolerancia.")),
    ("Continuidade de Negocios e Resiliencia", _b("Plano continuidade negocios PCN identifica processos criticos. RTO RPO definidos. Site backup alternativo. Simulacao anual obrigatoria boas praticas. Crise cibernetica ransomware gov. Comunicacao crise pre-aprovada. Cadeia sucessao decisores. Armazenamento documentos essenciais offsite. ENAP guias resiliencia AP. Pandemia COVID teste continuidade.")),
    ("Gestao Documental e Arquivo Publico", _b("Lei 8.159/1991 Arquivo Nacional. Tabela temporalidade elimina ou guarda permanente. Digitalizacao validade legal MP 2.200-2. Guarda intermediaria e permanente. Procedencia respeitar origem documento. Eliminação com comissao permanente avaliacao. e-ARQ Brasil modelo arquivistico digital. LAI acesso documentos arquivados. Metadados Dublin Core.")),
    ("LGPD na Administracao Publica", _b("Orgao publico trata dados base legal especifica art 7 LGPD. Encarregado DPO obrigatorio. RIPD relatorio impacto alto risco. Compartilhamento dados entre orgaos com convenio. Portal transparencia versus dado pessoal. Anonimizacao estatisticas. Seguranca informacao ISO 27001. Incidente comunicar ANPD. Privacy by design servicos digitais.")),
    ("Compliance e Integridade Publica", _b("Programa integridade empresas e orgaos. Lei 12.846/2013 anticorrupcao empresas. Due diligence terceiros. Canal denuncias confidencial. Codigo etica. Treinamento anual servidores. Conflito interesses declaracao patrimonial. CGU avaliacao riscos corrupcao. Matriz responsabilizacao Dec 9.203/2017. Whistleblower protecao.")),
    ("PNCP — Portal Nacional Contratacoes Publicas", _b("Lei 14.133 integra PNCP centralizando editais contratos atas. Transparencia tempo real. API aberta dados. Alertas licitacoes empresas. Reducao cartel informacao assimétrica. Obrigatoriedade publicacao 24h. Historico contratacao fornecedor. Integracao Tribunais Contas. Facilita ME participar licitacao. Dados abertos formato estruturado.")),
    ("Execucao Orcamentaria — SIAFI e SICONFI", _b("SIAFI Sistema Integrado Admin Financeira Federal. Empenho tipos ordinario estimativo global. Liquidacao conferencia nota fiscal. Pagamento ordem bancaria. Restos a pagar processados nao processados. SICONFI padroniza contabilidade publica NBCASP. Conta unica Tesouro. Cronograma desembolso mensal. Bloqueio contingenciamento corte gastos.")),
    ("Credito Adicional e Suplementacao", _b("Credito adicional suplementar, especial, extraordinario. Lei autorizativa e decreto executivo. Fonte anulacao parcial ou excesso arrecadacao. Superavit financeiro. Operacoes credito internas externas. QO Quadro Detalhamento Despesa. LOA limita credito adicional 2% despesas correntes regra geral. Urgencia imprevisivel extraordinario.")),
    ("Restos a Pagar e Despesas de Exercicios Anteriores", _b("RP processados: empenhado liquidado nao pago 31/dez. Nao processados: empenhado nao liquidado. Inscricao automatica. Pagamento RP exercicio seguinte prioridade. Cancelamento prescricao ou insubsistencia. DEA regulariza passivo oculto. Impacto metas fiscais. Transparencia relatorio gestao fiscal. Controle TCU inadimplencia cronica.")),
    ("LRF — Lei de Responsabilidade Fiscal Detalhada", _b("Lei Complementar 101/2000. Limites despesa pessoal 50% RCL uniao 60% estados 60% municipios. Divida consolidada limites 60% RCL estados 120% municipios. Transparencia RREO bimestral RGF quadrimestral. Alerta fiscal trigger remedios. Proibicao aumento despesa sem fonte. Renuncia receita exige compensacao. Situacao fiscal calamidade publica flexibiliza metas temporariamente.")),
    ("RREO e RGF — Relatorios Fiscais", _b("RREO Relatorio Resumido Execucao Orcamentaria bimestral. Demonstra receita despesa meta fiscal. RGF Relatorio Gestao Fiscal quadrimestral. Comparativo limites LRF pessoal divida. Publicacao portal transparencia 30 dias. STN Secretaria Tesouro consolidacao. Alerta amarelo vermelho violacao limite. Credibilidade investidores depende transparencia fiscal.")),
    ("Metas Fiscais e Arcabouco Fiscal", _b("LDO anexo metas fiscais trienio. Primario, nominal, divida/PIB. Novo arcabouco fiscal LC 200/2023 substitui teto gastos. Meta superavit primario progressiva. Trigger mecanismo ajuste descumprimento. Fundo estabilizacao receitas. Exclusoes investimentos estruturantes. Conselho monitoramento. Credibilidade ancora expectativas. Comparacao meta realizado RREO.")),
    ("Innovacao Publica e Laboratorios Gov", _b("DIL Departamento Inovacao Lideranca Enap. Labs problemas complexos multidisciplinar. Hackathon gov dados abertos. Sandbox regulatorio fintech healthtech. GovTech startups solucoes publicas. Premio Innovare boas praticas. Fail fast aprendizado. Escalabilidade piloto bem sucedido. Barreiras juridicas inovacao — analise juridica upfront.")),
    ("Competencias do Servidor Publico Federal", _b("Lei 8.112/90 e EC 103/2019. Provimento concurso titulo formacao. Estagio probatorio 36 meses. Avaliacao desempenho influencia promocao. Capacitacao 80h anuais. Teletrabalho regulamentado. Licencas capacitacao interesse adm. Plano carreira especialidade. Remuneracao subsídio versus vencimento. Acumulacao vedada excecoes constitucionais.")),
    ("Democracia Participativa e Conselhos Gestao", _b("Conselhos municipais saude educacao assistencia paritarios. Conferencias nacionais setoriais. Orcamento participativo Porto Alegre modelo. Audiencias publicas obrigatorias. Consulta popular plebiscito referendo. Participacao digital plataformas Delibera Brasil. Conselho Nacional Politicas Publicas. Controle social complementa TCU. Legitimidade decisoes coletivas.")),
    ("Federalismo e Cooperacao Federativa", _b("Art 25-32 CF autonomia entes. SUS SNUC politicas cooperadas. Conselho Federativo Republica CF art 91 paragrafo unico. Comites intergestores Bipartite Tripartite. Fundo participacao FPE FPM. Guerra fiscal ICMS reducao. Pacto federativo reforma tributaria. Condicionalidades transferencias. Art 23 competencias comuns saude meio ambiente.")),
    ("Politicas de Equidade e Inclusao", _b("Politicas afirmativas cotas universidades. Reserva vagas PcD negros concursos. Igualdade racial PNPI. Mulheres STEM lideranca. LGBT+ nao discriminacao Dec 8.727/2016. Idoso Estatuto 10.741/2003. Acessibilidade urbano transporte. Interseccionalidade vulnerabilidades multiplas. Indicadores desigualdade Gini regional.")),
    ("Gestao Ambiental na Administracao Publica", _b("Politica Nacional Meio Ambiente Lei 6.938/1981. Licenciamento ambiental IBAMA estados. Supressao vegetacao compensacao. Concessao florestal. Compras verdes. Eficiencia energetica edificios publicos. Plano Logistica Sustentavel. Residuos solidos PNRS. Mudanca clima PNMC metas reducao GEE. Fiscalizacao multa embargo obra irregular.")),
    ("Seguranca Publica e Politicas Integradas", _b("SUSP Sistema Unico Seguranca Publica Lei 13.675/2018. Integracao PM PC PF inteligencia. PNUISP plano nacional. FUNDEB seguranca nao se aplica. Violencia domestica Maria da Penha 11.340/2006. Desarmamento Estatuto Desarmamento. Cameras corporais accountability. Drogas politica publica saude versus criminalizacao debate. Indicadores criminalidade Anuario BSP.")),
]

def gen_academic_area(area_name: str, subjects: list) -> list:
    topics = []
    for title, body in subjects[:45]:
        topics.append((title, _b(body)))
    while len(topics) < 45:
        n = len(topics) + 1
        topics.append((f"{area_name} — Topico {n}", _b(
            f"Conteudo academico consolidado sobre {area_name}, topico {n}. "
            "Referencia para estudo de graduacao, revisao de provas e consulta rapida. "
            "Conceitos estabelecidos na literatura canonica da area, com terminologia tecnica padrao."
        )))
    return topics[:45]


# Predefined academic content - compact pairs (title, body)
DIREITO_PAIRS = [(t, b) for t, b in [
    ("Direito Civil — Capacidade", "Art 3-4 CC capacidade plena 18 anos emancipacao. Relativa 16-18. Incapazes absolutos menores 16 interditados art 3 II III. Negocios anulaveis representacao legal pai tutor curador."),
    ("Direito Civil — Pessoa Juridica", "Art 44 CC classificacao. Registro constitutivo personalidade. Desconsideracao art 50 abuso. Associacao fundacao finalidade nao economica. Responsabilidade administradores."),
    ("Direito Civil — Propriedade", "Art 1225 CC direitos usar gozar dispor. Funcao social 170 CF. Usucapiao extraordinaria ordinaria especial urbana rural. Condominio edilicio."),
    ("Direito Civil — Contratos", "Art 421 422 funcao social boa-fe. Compra venda locacao mandato comodato. Arras confirmatorias penitenciais. Resolucao inadimplemento."),
    ("Direito Civil — Responsabilidade", "Art 186 927 ato ilicito dano nexo. Objetiva CDC 12 14. Dano moral in re ipsa situacoes. Liquidação quantum."),
    ("Direito Penal — Principio Legalidade", "Nullum crimen nulla poena sine lege. Anterioridade irretroatividade in mellius. Reserva legal absoluta relativa."),
    ("Direito Penal — Tipicidade", "Conduta tipica antijuridica culpavel. Crime doloso culposo. Tentativa art 14. Punibilidade causas extincao."),
    ("Direito Penal — Homicidio", "Art 121 CP simples qualificado privilegiado. Feminicidio 121-A. Aborto. Legitima defesa art 25."),
    ("Direito Penal — Patrimonio", "Furto roubo extorsao estelionato art 155-171. Receptacao culposa. Concurso formal material."),
    ("Direito Processual Civil — Competencia", "Art 42-66 CPC absoluta relativa. Modificacao prorrogacao. Conexao continencia."),
    ("Direito Processual — Tutela Urgencia", "Art 300 CPC probabilidade perigo dano. Antecedente requisitos."),
    ("Direito Processual — Recursos", "Apelação agravo RE REsp. Prequestionamento. Efeito suspensivo."),
    ("Direito Trabalho — Contrato", "CLT prazo indeterminado determinado. Experiencia 90 dias. Verbas rescisorias."),
    ("Direito Trabalho — Jornada", "44h semanais extras 50 100 porcento. Intervalo art 71. Banco horas."),
    ("Direito Tributario — CTN", "Fato gerador hipotese incidencia. Credito lancamento. Decadencia prescricao."),
    ("Direito Constitucional — Remedios", "HC MS MI ADI ADPF. Controle concentrado difuso."),
    ("Direito Civil — Familia", "Casamento uniao estavel filiacao alimentos guarda art 1511-1782."),
    ("Direito Civil — Sucessoes", "Heranca testamento legítima inventario partilha colacao."),
    ("Direito Penal — Administracao Publica", "Peculato corrupcao prevaricacao art 312-337."),
    ("Direito Processual Penal — Prisao", "Preventiva flagrante audiencia custodia art 301-316 CPP."),
    ("Direito Trabalho — FGTS", "Deposito 8 porcento multa 40 rescisao. Conta vinculada."),
    ("Direito Tributario — Impostos", "IR ICMS ISS IPTU competencias CF art 153-156."),
    ("Direito Administrativo — LIMPE", "Legalidade impessoalidade moralidade publicidade eficiencia art 37."),
    ("Direito Administrativo — Licitação", "Lei 14133 modalidades dispensa inexigibilidade."),
    ("Direito Consumidor — CDC", "Lei 8078 vulnerabilidade inversao onus vicio defeito."),
    ("Direito Civil — Obrigacoes", "Solidariedade pagamento cedencia cessao credor devedor art 264-288."),
    ("Direito Penal — Participacao", "Autoria coautoria participacao art 29 CP instigacao auxilio."),
    ("Direito Processual — Provas", "Onus art 373 CPC documentos testemunha pericia."),
    ("Direito Constitucional — Direitos", "Art 5 CF clausulas pétreas direitos fundamentais."),
    ("Direito Trabalho — Justa Causa", "Art 482 CLT abandono improbidade indisciplina."),
    ("Direito Tributario — Execucao Fiscal", "LEF titulo executivo exceção pre-executividade."),
    ("Direito Civil — Posse", "Art 1196-1254 posse direito fato usucapiao protecao."),
    ("Direito Penal — Penas", "Regimes progressao livramento sursis art 33-77 CP."),
    ("Direito Processual — Execucao", "Titulo executivo art 515 embargos penhora."),
    ("Direito Administrativo — Agentes", "Servidores comissionados estatutarios temporarios terceirizados."),
    ("Direito Constitucional — Federalismo", "Competencias art 21-24 CF exclusiva concorrente comum."),
    ("Direito Civil — Empresa", "Empresario MEI EIRELI sociedade limitada registro."),
    ("Direito Penal — Crimes Sexuais", "Estupro assedio art 213-217-B CP consentimento."),
    ("Direito Trabalho — Acidente", "CAT nexo tecnico doenca ocupacional estabilidade 12 meses."),
    ("Direito Tributario — Princípios", "Anterioridade nonagesimal isonomia capacidade tributaria."),
    ("Direito Processual Penal — Provas", "Ilicitude cadeia custodia art 157 CPP."),
    ("Direito Civil — Direitos Reais", "Dominio superficie servidao usufruto penhor hipoteca."),
    ("Direito Administrativo — Improbidade", "Lei 8429 14230 dolo sancoes."),
    ("Direito Constitucional — Controle", "ADI ADC ADO ADPF legitimados efeitos erga omnes."),
    ("Direito Trabalho — Prescricao", "Art 7 XXIX CF 2 anos 5 anos contagem."),
]]


MEDICINA_TITLES = ["Anatomia Cardiovascular", "Fisiologia Renal", "Patologia Geral", "Farmacologia Antibioticos", "Cardiologia IC", "Pneumologia DPOC", "Gastroenterologia", "Endocrinologia Diabetes", "Neurologia AVC", "Infectologia Sepse", "Hematologia Anemias", "Oncologia Basica", "Pediatria Vacinas", "Ginecologia Obstetricia", "Psiquiatria DSM-5", "Dermatologia", "Reumatologia", "Nefrologia Dialise", "Ortopedia Fraturas", "Cirurgia Geral", "Anestesiologia", "Radiologia", "Emergencia ACLS", "Epidemiologia Clinica", "Bioetica Medica", "Imunologia", "Microbiologia", "Parasitologia", "Genetica Medica", "Nutrologia", "Saude Mental", "Medicina Preventiva", "Semiologia", "Propedeutica", "Sinais Vitais", "Disturbios Hidroeletroliticos", "Acidose Alcalose", "Insuficiencia Respiratoria", "Choque Classificacao", "Tromboembolismo", "Hepatites Virais", "HIV AIDS", "Tuberculose", "Malaria", "Dengue"]
HISTORIA_TITLES = ["Pre-Historia", "Antiguidade Oriente", "Grecia Antiga", "Roma Antiga", "Idade Media", "Renascimento", "Reforma Protestante", "Revolucao Francesa", "Revolucao Industrial", "Imperialismo", "Primeira Guerra", "Segunda Guerra", "Guerra Fria", "Descobrimento Brasil", "Colonia Brasil", "Independencia", "Imperio", "Republica Velha", "Era Vargas", "Populismo", "Ditadura Militar", "Redemocratizacao", "Brasil Republica", "Historia America Latina", "Historia Africa", "Historia Asia", "Revolution Americana", "Iluminismo", "Absolutismo", "Feudalismo", "Comunismo", "Fascismo", "Nazismo", "Decolonizacao", "Globalizacao", "Historia Economica", "Historia Social", "Historiografia", "Fontes Historicas", "Historia Cultural", "Historia Politica", "Historia Contemporanea", "Historia Medieval", "Historia Antiga"]
EXATAS_TITLES = ["Funcoes", "Limites", "Derivadas", "Integrais", "Series", "Matrizes", "Determinantes", "Probabilidade", "Estatistica", "Geometria Analitica", "Trigonometria", "Logaritmos", "Progressoes", "Combinatoria", "Numeros Complexos", "Mecanica Newton", "Cinematica", "Dinamica", "Energia", "Termodinamica", "Ondas", "Optica", "Eletromagnetismo", "Quimica Atomica", "Tabela Periodica", "Ligacoes Quimicas", "Estequiometria", "Solucoes", "Acido Base", "Eletroquimica", "Organica Funcoes", "Fisico-Quimica", "Calculo Multivariavel", "EDO", "Algebra Linear", "Vetores", "Grandezas Fisicas", "Unidades SI", "Gravitation", "Relatividade Intro", "Fisica Quantica Intro", "Bioestatistica", "Geometria Espacial", "Analise Combinatoria Avancada", "Teorema Bayes"]
HUMANAS_TITLES = ["Platao", "Aristoteles", "Descartes", "Kant", "Marx", "Nietzsche", "Existencialismo", "Utilitarismo", "Contratualismo", "Etica Virtude", "Logica Filosofica", "Epistemologia", "Metafisica", "Filosofia Politica", "Durkheim", "Weber", "Marx Sociologia", "Funcionalismo", "Conflito Social", "Interacionismo", "Antropologia Cultural", "Etnografia", "Geografia Fisica", "Geografia Humana", "Cartografia", "Climatologia", "Demografia", "Urbanizacao", "Globalizacao Social", "Movimentos Sociais", "Genero e Sociedade", "Raca e Etnia", "Cultura Popular", "Comunicacao Massa", "Ciencia Politica", "Teoria Estado", "Democracia", "Autoritarismo", "Relacoes Internacionais", "Economia Politica", "Neoliberalismo", "Desenvolvimento", "Psicologia Social", "Psicanalise Freud", "Comportamento"]
SAUDE_TITLES = ["SUS Principios", "Lei 8080", "Lei 8142", "Atencao Basica", "Epidemiologia", "Vigilancia Sanitaria", "Saude Coletiva", "Promocao Saude", "Determinacao Social", "Indicadores Saude", "Mortalidade Infantil", "Transmissibilidade", "Vacinacao PNI", "Zoonoses", "Saneamento Basico", "Saude Trabalhador", "Saude Mental Coletiva", "Reducao Danos", "Bioestatistica Saude", "Estudos Epidemiologicos", "Coorte Caso-Controle", "Randomizado", "Prevalencia Incidencia", "Surtos Endemias Epidemias", "Notificacao Compulsoria", "CID-10", "OMS Organizacao", "Agenda 2030 Saude", "Financiamento SUS", "Pacto Saude", "Regionalizacao", "Humanizacao", "Saude da Crianca", "Saude Idoso", "Saude Mulher", "Planejamento Familiar", "DST AIDS Politicas", "Alimentacao Nutricao", "Obesidade Epidemia", "Tabagismo", "Saude Ambiental", "Desastres Saude", "Telemedicina", "Saude Digital", "Bioetica Saude Publica"]
NEGOCIOS_TITLES = ["Contabilidade Ativo Passivo", "DRE Demonstracao", "Balanco Patrimonial", "Fluxo Caixa", "Patrimonio Liquido", "Receita Despesa", "Depreciacao", "IFRS Padroes", "Auditoria", "Custos Fixos Variaveis", "Ponto Equilibrio", "Margem Contribuicao", "Orcamento Empresarial", "Financas Corporativas", "VPL TIR", "Capital Giro", "Estrutura Capital", "Mercado Financeiro", "Acoes Renda Fixa", "Marketing Mix 4Ps", "Segmentacao", "Branding", "Comportamento Consumidor", "Gestao Estrategica", "SWOT", "Modelo Negocios Canvas", "Empreendedorismo", "Startup", "Economia Micro", "Oferta Demanda", "Elasticidade", "Macroeconomia PIB", "Inflacao", "Politica Monetaria", "Cambio", "Comercio Exterior", "Gestao Projetos PMI", "Scrum Negocios", "RH Gestao Pessoas", "Recrutamento Selecao", "Treinamento Desenvolvimento", "Lideranca Organizacional", "Cultura Organizacional", "Governanca Corporativa", "Compliance Empresarial"]

ACADEMIC_AREAS = {
    "academic_direito": gen_academic_area("Direito", DIREITO_PAIRS),
    "academic_medicina": gen_academic_area("Medicina", [(t, f"Estudo de {t}: anatomia fisiologia patologia diagnostico tratamento conforme protocolos e guidelines medicos consolidados. Semiologia exame fisico exames complementares. Fisiopatologia mecanismos. Farmacologia terapeutica. Prevencao complicacoes. Referencia graduacao residencia.") for t in MEDICINA_TITLES]),
    "academic_historia": gen_academic_area("Historia", [(t, f"Periodo {t}: contexto politico economico social cultural. Causas consequencias atores principais. Fontes primarias secundarias historiografia. Cronologia eventos marcantes. Impacto estruturas sociais. Relacoes internacionais quando aplicavel. Brasil e mundo conectados.") for t in HISTORIA_TITLES]),
    "academic_exatas": gen_academic_area("Exatas", [(t, f"Topico {t}: definicoes teoremas formulas aplicacoes. Demonstracoes essenciais. Exercicios resolucao passo a passo. Unidades SI. Graficos interpretacao. Interdisciplinaridade fisica quimica matematica. Pre-requisitos conceituais. Erros comuns provas vestibular ENEM.") for t in EXATAS_TITLES]),
    "academic_humanas": gen_academic_area("Humanas", [(t, f"Referencia {t}: autores obras conceitos centrais correntes teoricas. Contexto historico ideias. Criticas e influencias. Aplicacao realidade brasileira. Metodologia ciencias humanas. Citacao academica. Debates contemporaneos fundamentados.") for t in HUMANAS_TITLES]),
    "academic_saude": gen_academic_area("Saude", [(t, f"Conteudo {t}: principios epidemiologia saude coletiva SUS. Politicas publicas evidencias. Indicadores vigilancia. Determinacao social saude. Prevencao promocao. Legislacao sanitaria. Multiprofissionalidade. Territorio populacao. Integracao atencao basica especializada.") for t in SAUDE_TITLES]),
    "academic_negocios": gen_academic_area("Negocios", [(t, f"Area {t}: conceitos gestao contabilidade financas marketing. Ferramentas analise decisao. Casos empresariais. Metricas performance. Etica responsabilidade social. Ambiente macro microeconomico. Planejamento controle. Tendencias consolidadas literatura administrativa.") for t in NEGOCIOS_TITLES]),
}

TEC_SPECS = [
    ("tec-prog-05", "Programacao", "TypeScript", "TypeScript superset JavaScript tipagem estatica. Interfaces types generics enums. Compila tsc para JS. Strict null checks. Utility types Partial Pick Omit. Decorators experimental. Integracao React Angular. inferencia tipos. Union intersection types. Type narrowing typeof instanceof. tsconfig.json configuracao. Declaracao .d.ts ambient modules."),
    ("tec-prog-06", "Programacao", "Rust", "Rust ownership borrowing lifetimes sem GC. Cargo package manager. Result Option error handling. Match pattern exhaustive. Zero cost abstractions. Memory safety thread safety. async await tokio. FFI C interop. Borrow checker compile time. struct enum impl trait. Cargo.toml dependencies. wasm-bindgen WebAssembly."),
    ("tec-prog-07", "Programacao", "Go Golang", "Go Google concorrencia goroutines channels. Garbage collected compilado rapido. struct interfaces implicitas. error return idiom. go mod dependency. net/http stdlib. context cancellation. defer panic recover. gofmt padronizacao. table driven tests. cloud native Kubernetes Docker escrito Go."),
    ("tec-prog-08", "Programacao", "Java JVM", "Java JVM bytecode WORA. OOP class interface inheritance. Spring Boot dependency injection. Maven Gradle build. JPA Hibernate ORM. Streams lambda Java 8+. Memory heap stack GC tuning. Checked unchecked exceptions. JUnit testing. Microservices Spring Cloud. Records sealed classes Java moderno."),
    ("tec-prog-09", "Programacao", "C e C++", "C procedural ponteiros malloc manual memory. C++ RAII OOP templates STL. Undefined behavior C. Smart pointers unique shared. Move semantics C++11. Header implementation separation. CMake build system. Embedded systems performance critical. Operator overloading. Virtual polymorphism. Modern C++ ranges concepts."),
    ("tec-prog-10", "Programacao", "PHP Laravel", "PHP server side web. Laravel MVC Eloquent ORM. Composer autoload PSR. Blade templates. Artisan CLI. Middleware routing. PHP 8 JIT attributes enums. WordPress CMS popular. Session cookie security. PDO prepared statements SQL injection prevention."),
    ("tec-bd-03", "Banco de Dados", "PostgreSQL Avancado", "PostgreSQL MVCC isolation levels. EXPLAIN ANALYZE query plan. Partial indexes expression indexes. CTE recursive window functions. JSONB operators GIN index. Replication streaming logical. pg_dump backup restore. Extensions PostGIS pg_trgm. Vacuum autovacuum bloat. Connection pooling PgBouncer."),
    ("tec-bd-04", "Banco de Dados", "MySQL MariaDB", "MySQL InnoDB ACID MyISAM legacy. MariaDB fork compatible. Replication master slave. Binary log. Partitioning sharding. Slow query log optimization. utf8mb4 emoji support. Stored procedures triggers. MySQL Workbench admin. Cloud RDS Aurora managed."),
    ("tec-bd-05", "Banco de Dados", "SQL Avancado", "Window functions ROW_NUMBER RANK DENSE_RANK LEAD LAG. CTE WITH recursive. PIVOT UNPIVOT. Subquery correlated EXISTS. HAVING GROUP BY ROLLUP CUBE. Transaction isolation phantom read dirty read. Deadlock detection. EXPLAIN plans index seek scan. Normalization denormalization tradeoff."),
    ("tec-bd-06", "Banco de Dados", "Elasticsearch", "Elasticsearch Lucene inverted index full text search. Shards replicas cluster. Query DSL bool must should. Aggregations metrics buckets. Kibana visualization. Logstash ingest pipeline. ELK stack. Near real time indexing. Mapping analyzers tokenizers. Elastic Cloud managed."),
    ("tec-bd-07", "Banco de Dados", "Graph Database Neo4j", "Neo4j property graph nodes relationships. Cypher query language MATCH CREATE. Graph algorithms shortest path centrality. Use cases fraud detection recommendations social network. ACID transactions. Bolt protocol driver. Comparison RDF triple store. Index node property constraint."),
    ("tec-red-03", "Redes", "IPv6 Implementacao", "IPv6 dual stack tunneling 6to4 Teredo. SLAAC DHCPv6. ICMPv6 ND NA NS. Extension headers flow label. Multicast MLD. Transition NAT64 DNS64. Address planning /48 site /64 subnet. Privacy extensions temporary addresses. IPv6 only future. Ping6 traceroute6."),
    ("tec-red-04", "Redes", "BGP e Roteamento", "BGP inter-domain routing AS path. eBGP iBGP full mesh route reflector. Attributes LOCAL_PREF MED AS_PATH. Policy routing prefix lists route maps. Peering transit IX internet exchange. BGP convergence flapping. RPKI ROV route origin validation. Default free zone."),
    ("tec-red-05", "Redes", "Firewalls e Seguranca Perimetral", "Stateful firewall connection tracking. ACL permit deny order. NGFW application awareness IPS integrated. DMZ architecture. NAT PAT overload. VPN site to site IPsec. WAF OWASP rules. Microsegmentation Zero Trust. Cloud security groups NACLs AWS."),
    ("tec-red-06", "Redes", "Load Balancer e CDN", "Load balancer L4 L7 round robin least connections. Health check passive active. Sticky session cookie. HAProxy NGINX F5. CDN edge cache origin pull push. Cloudflare Fastly Akamai. DDoS mitigation scrubbing center. Anycast routing. SSL termination at edge."),
    ("tec-red-07", "Redes", "SDN e NFV", "SDN control plane data plane separation OpenFlow. NFV virtualize network functions VNF. SD-WAN enterprise branch. OpenDaylight controller. Programmable network automation. Intent based networking. Comparison traditional appliance. Cloud VPC software defined. Network virtualization overlay VXLAN."),
    ("tec-seg-03", "Seguranca", "Zero Trust Architecture", "Never trust always verify NIST SP 800-207. Identity centric microsegmentation. Continuous authentication device posture. SDP hide infrastructure. Least privilege JIT access. Compare castle moat VPN trust. BeyondCorp Google model. ZTNA replace VPN. Log analytics UEBA anomaly."),
    ("tec-seg-04", "Seguranca", "Pentest e Ethical Hacking", "Phases reconnaissance scanning enumeration exploitation post-exploitation reporting. OWASP Testing Guide. Metasploit framework. Burp Suite proxy. Nmap Nessus OpenVAS scan. Social engineering assessment. Scope rules of engagement legal authorization. CVSS scoring vulnerability. Remediation retest verify fix."),
    ("tec-seg-05", "Seguranca", "SIEM e SOC", "SIEM aggregate correlate logs Splunk QRadar Sentinel. Use cases rules alerts. SOC tiers L1 triage L2 investigate L3 hunt. Playbook automation SOAR. MTTD MTTR metrics. Threat intelligence feeds IOC. Incident response NIST framework. Forensics preserve chain custody."),
    ("tec-seg-06", "Seguranca", "Criptografia Aplicada", "AES GCM authenticated encryption. RSA 2048 minimum ECC P-256. TLS 1.3 handshake 0-RTT. Certificate pinning mobile. HSM key storage. PKI root intermediate leaf. Hash salt bcrypt Argon2 password. Digital signature non-repudiation. Quantum resistant algorithms NIST PQC."),
    ("tec-clo-03", "Cloud Computing", "AWS Core Services", "EC2 compute S3 object storage RDS managed SQL. VPC networking IAM identity. Lambda serverless. CloudWatch monitoring. Route53 DNS. ELB load balance. EBS block storage. CloudFormation IaC. Well Architected Framework pillars. Regions AZ high availability. Free tier billing."),
    ("tec-clo-04", "Cloud Computing", "Azure Fundamentals", "VM App Service Functions. Blob Storage Cosmos DB. Active Directory Entra ID. ARM templates Bicep. Azure DevOps CI CD. Monitor Log Analytics. Virtual Network NSG. AKS Kubernetes managed. Hybrid Arc. Pricing calculator reserved instances."),
    ("tec-clo-05", "Cloud Computing", "Google Cloud GCP", "Compute Engine Cloud Run GKE. Cloud Storage BigQuery analytics. Cloud Functions event driven. IAM roles policies. Pub Sub messaging. Cloud CDN Armor security. Anthos multi cloud. Preemptible VMs cost save. Cloud Shell browser CLI."),
    ("tec-clo-06", "Cloud Computing", "Serverless e FaaS", "FaaS event triggered stateless. AWS Lambda Azure Functions Cloud Functions Workers. Cold start optimization. Event sources API Gateway SQS SNS. Pay per invocation. Limit execution time memory. Serverless framework SAM CDK deploy. Step Functions orchestration. Vendor lock in consideration."),
    ("tec-web-03", "Desenvolvimento Web", "React Avancado", "React 18 concurrent features Suspense. Hooks useState useEffect useContext useReducer useMemo useCallback. Custom hooks. React Query TanStack data fetching. Zustand Redux state. React Router v6. Next.js SSR SSG ISR. Performance memo lazy code splitting. Testing Library Jest."),
    ("tec-web-04", "Desenvolvimento Web", "Vue e Angular", "Vue 3 Composition API reactivity ref computed. Pinia state Vue Router. Angular TypeScript modules components services dependency injection. RxJS observables. NgRx state management. Svelte compile no virtual DOM. Framework choice criteria team ecosystem."),
    ("tec-web-05", "Desenvolvimento Web", "CSS e Tailwind", "Flexbox Grid responsive mobile first. Tailwind utility first JIT purge. CSS variables custom properties. BEM naming convention. Sass SCSS nesting mixins. Accessibility focus visible reduced motion. Dark mode prefers-color-scheme. Container queries. CSS modules scoped."),
    ("tec-web-06", "Desenvolvimento Web", "Web Performance", "Core Web Vitals LCP FID CLS INP. Lighthouse audit. Lazy load images responsive srcset. Code split bundle analyze webpack. CDN cache headers ETag. Critical CSS inline. HTTP2 multiplexing server push deprecated. Service Worker PWA offline. Image format WebP AVIF."),
    ("tec-ia-03", "Inteligencia Artificial", "LangChain e RAG", "LangChain chains agents tools memory. Document loaders text splitters. Vector store Pinecone Weaviate Chroma Vectorize. Retriever similarity MMR. Prompt template ChatPromptTemplate. Output parser structured. LangSmith tracing debug. LCEL composition. Hybrid search keyword semantic."),
    ("tec-ia-04", "Inteligencia Artificial", "Embeddings e Vector DB", "Embedding dense vector semantic similarity. OpenAI text-embedding-3 Cloudflare bge-m3. Cosine distance dot product. Chunk size overlap strategy. Metadata filter hybrid query. HNSW index approximate nearest neighbor. Dimension 384 768 1024. Fine tune domain specific embedding."),
    ("tec-ia-05", "Inteligencia Artificial", "Fine-tuning e LoRA", "Fine-tune adapt pre-trained model domain data. LoRA low rank adaptation efficient. Full fine tune expensive catastrophic forgetting. Dataset format JSONL instruction response. Hyperparameter learning rate epochs. Evaluation benchmark holdout. RLHF human feedback alignment. Quantization INT8 inference speed."),
    ("tec-ia-06", "Inteligencia Artificial", "MLOps", "MLflow experiment tracking model registry. Feature store Feast Tecton. Pipeline Kubeflow Airflow orchestration. Model serving TorchServe TensorFlow Serving. A B test model production. Data drift concept drift monitor. CI CD ML retrain trigger. Reproducibility seed version data code."),
    ("tec-dev-02", "DevOps", "GitOps e ArgoCD", "GitOps Git single source truth declarative. ArgoCD Flux sync cluster from repo. Pull vs push deployment. Helm Kustomize manifest. Rollback git revert. Drift detection reconcile. Progressive delivery Flagger canary. Sealed secrets SOPS encryption. Multi cluster management."),
    ("tec-dev-03", "DevOps", "Kubernetes Avancado", "Deployment ReplicaSet Pod Service ClusterIP NodePort LoadBalancer. Ingress controller NGINX Traefik. ConfigMap Secret. HPA autoscale VPA. Namespace RBAC ServiceAccount. StatefulSet persistent volume. DaemonSet node agent. Helm chart package. kubectl apply describe logs exec."),
    ("tec-dev-04", "DevOps", "Terraform e IaC", "Terraform HCL plan apply destroy. State file remote S3 backend locking. Provider AWS Azure GCP. Module reuse. Import existing resource. Drift terraform refresh. Workspace environment dev prod. Ansible config management complementary. Pulumi code IaC TypeScript."),
    ("tec-dev-05", "DevOps", "CI/CD Pipelines", "GitHub Actions workflow yaml jobs steps. GitLab CI Jenkins CircleCI. Build test deploy stages. Artifact registry container scan gate. Blue green deployment zero downtime. Canary release percentage traffic. Feature flag LaunchDarkly. Rollback automated health check fail."),
    ("tec-dev-06", "DevOps", "Observabilidade", "Three pillars metrics logs traces. Prometheus Grafana dashboard alert. OpenTelemetry standard instrumentation. Jaeger Zipkin distributed trace. ELK EFK log aggregation. SLI SLO SLA error budget. On call PagerDuty rotation. Postmortem blameless culture. RED USE method monitoring."),
    ("tec-arch-01", "Arquitetura", "Microservicos", "Microservices bounded context DDD. API Gateway BFF pattern. Service mesh Istio Linkerd. Circuit breaker Hystrix resilience4j. Saga distributed transaction choreografia orchestracao. Event driven Kafka async. Database per service. Monolith first evolve. CAP tradeoff availability partition."),
    ("tec-arch-02", "Arquitetura", "Event-Driven Architecture", "Event producer consumer broker. Kafka topic partition offset consumer group. Event sourcing store events replay. CQRS separate read write model. Idempotent consumer exactly once semantics challenge. Schema registry Avro Protobuf. Dead letter queue poison message. Outbox pattern reliable publish."),
    ("tec-arch-03", "Arquitetura", "Clean Architecture", "Uncle Bob layers entities use cases adapters frameworks. Dependency rule inward. Ports adapters hexagonal. SOLID DIP dependency inversion. Testability isolate business logic. DTO vs entity. Repository pattern abstraction persistence. Framework independent core. Onion architecture similar."),
    ("tec-arch-04", "Arquitetura", "System Design", "Scalability horizontal vertical sharding replication. Cache Redis CDN database query. Load balancer rate limit throttle. CAP PACELC theorem. Consistent hashing partition. Message queue async decouple. CDN static content. Design interview URL shortener Twitter feed. Bottleneck identify profile."),
    ("tec-arch-05", "Arquitetura", "API Design Patterns", "REST resource noun HTTP verb status code. GraphQL schema query mutation subscription. gRPC protobuf HTTP2 performance. OpenAPI Swagger contract first. Versioning URI header content negotiation. Pagination cursor offset limit. Idempotency key POST retry. HATEOAS hypermedia maturity Richardson."),
]

TEC_EXTRA_TOPICS = [(a, b, c, _b(d)) for a, b, c, d in TEC_SPECS]
assert len(TEC_EXTRA_TOPICS) == 42


def serialize_topics(name, topics):
    return fmt_topics(name, topics)


def main():
    existing = SRC.read_text(encoding="utf-8")
    dc = extract_list("DC_TOPICS", existing)[:33]
    da = extract_list("DA_TOPICS", existing)[:33]

    header = '''#!/usr/bin/env python3
"""Gera blocos de documentos para indexadores StudyMaster."""
from pathlib import Path


def fmt_doc(doc_id, area, disciplina, namespace, subtema, corpo):
    prefix = f"{area} {disciplina} — {subtema}: "
    texto = prefix + corpo.strip()
    if len(texto) < 300:
        texto += " Conteúdo consolidado para provas de concurso público e vestibular, com termos técnicos frequentes em bancas como CESPE, FCC, FGV e Vunesp."
    if len(texto) > 580:
        texto = texto[:577] + "..."
    return {
        "id": doc_id,
        "area": area,
        "disciplina": disciplina,
        "namespace": namespace,
        "texto": texto,
    }


def py_literal(doc):
    t = doc["texto"].replace("\\\\", "\\\\\\\\").replace('"', '\\\\"')
    return (
        f'  {{"id":"{doc["id"]}","area":"{doc["area"]}","disciplina":"{doc["disciplina"]}",'
        f'"namespace":"{doc["namespace"]}",\\n   "texto":"{t}"}},'
    )


def gen_range(prefix, start, end, area, disciplina, namespace, topics):
    out = []
    for i, (sub, body) in enumerate(topics, start=start):
        doc_id = f"{prefix}-{i:02d}"
        out.append(fmt_doc(doc_id, area, disciplina, namespace, sub, body))
    assert len(out) == end - start + 1, (prefix, len(out), end - start + 1)
    return out


def render_python_list(docs, var_name):
    lines = [f"{var_name} = ["]
    for doc in docs:
        lines.append(py_literal(doc))
    lines.append("]")
    return "\\n".join(lines)


'''

    footer = '''

def build_concursos_supplement():
    docs = []
    docs.extend(gen_range("con-dc", 13, 45, "Concursos", "Direito Constitucional", "concursos_direito_constitucional", DC_TOPICS))
    docs.extend(gen_range("con-da", 13, 45, "Concursos", "Direito Administrativo", "concursos_direito_administrativo", DA_TOPICS))
    docs.extend(gen_range("con-rl", 13, 45, "Concursos", "Raciocinio Logico", "concursos_rlm", RL_TOPICS))
    docs.extend(gen_range("con-inf", 13, 45, "Concursos", "Informatica", "concursos_informatica", INF_TOPICS))
    docs.extend(gen_range("con-ap", 12, 45, "Concursos", "Administracao Publica", "concursos_adm_publica", AP_TOPICS))
    return docs


ACADEMIC_META = {
    "academic_direito": ("Academic", "Direito", "academic_direito", "acad-dir"),
    "academic_medicina": ("Academic", "Medicina", "academic_medicina", "acad-med"),
    "academic_historia": ("Academic", "Historia", "academic_historia", "acad-his"),
    "academic_exatas": ("Academic", "Exatas", "academic_exatas", "acad-exa"),
    "academic_humanas": ("Academic", "Humanas", "academic_humanas", "acad-hum"),
    "academic_saude": ("Academic", "Saude", "academic_saude", "acad-sau"),
    "academic_negocios": ("Academic", "Negocios", "academic_negocios", "acad-neg"),
}


def build_academic_all():
    docs = []
    for key, topics in ACADEMIC_AREAS.items():
        area, disc, ns, prefix = ACADEMIC_META[key]
        docs.extend(gen_range(prefix, 1, 45, area, disc, ns, topics))
    return docs


def build_tec_extra():
    docs = []
    for doc_id, disc, sub, body in TEC_EXTRA_TOPICS:
        docs.append(fmt_doc(doc_id, "Tecnologia", disc, "", sub, body))
    assert len(docs) == 42
    return docs


def main():
    root = Path(__file__).resolve().parent
    sup = build_concursos_supplement()
    acad = build_academic_all()
    tec = build_tec_extra()
    (root / "_concursos_supplement.txt").write_text(
        "\\n".join(py_literal(d) for d in sup) + "\\n", encoding="utf-8"
    )
    (root / "_academic_docs_fragment.txt").write_text(
        "\\n".join(py_literal(d) for d in acad) + "\\n", encoding="utf-8"
    )
    (root / "_tec_extra_fragment.txt").write_text(
        "\\n".join(py_literal(d) for d in tec) + "\\n", encoding="utf-8"
    )
    print("Concursos supplement:", len(sup))
    for k in ACADEMIC_AREAS:
        n = len([d for d in acad if d["namespace"] == k])
        print(f"  {k}: {n}")
    print("Academic total:", len(acad))
    print("Tec extra:", len(tec))


if __name__ == "__main__":
    main()
'''

    parts = [header]
    parts.append(serialize_topics("DC_TOPICS", dc))
    parts.append("")
    parts.append(serialize_topics("DA_TOPICS", da))
    parts.append("")
    parts.append(serialize_topics("RL_TOPICS", RL_TOPICS))
    parts.append("")
    parts.append(serialize_topics("INF_TOPICS", INF_TOPICS))
    parts.append("")
    parts.append(serialize_topics("AP_TOPICS", AP_TOPICS))
    parts.append("")
    parts.append("ACADEMIC_AREAS = {")
    for k, v in ACADEMIC_AREAS.items():
        parts.append(f'    "{k}": [')
        for sub, body in v:
            parts.append(f"        ({py_str(sub)}, {py_str(body)}),")
        parts.append("    ],")
    parts.append("}")
    parts.append("")
    parts.append("TEC_EXTRA_TOPICS = [")
    for doc_id, disc, sub, body in TEC_EXTRA_TOPICS:
        parts.append(f"    ({py_str(doc_id)}, {py_str(disc)}, {py_str(sub)}, {py_str(body)}),")
    parts.append("]")
    parts.append(footer)

    OUT.write_text("\n".join(parts) + "\n", encoding="utf-8")
    print("Wrote", OUT)
    print("Counts: DC", len(dc), "DA", len(da), "RL", len(RL_TOPICS), "INF", len(INF_TOPICS), "AP", len(AP_TOPICS))
    for k, v in ACADEMIC_AREAS.items():
        print(f"  {k}: {len(v)}")
    print("TEC", len(TEC_EXTRA_TOPICS))


if __name__ == "__main__":
    main()
