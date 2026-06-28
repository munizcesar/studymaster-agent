
// --- Scroll Reveal Animations ---
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});

const WORKER_URL = 'https://studymaster-worker.cesarmuniz0816.workers.dev';

// ─── ACADEMIC DATA (expandido) ───────────────────────────────────────────────
const academicData = {
  'Direito': {
    'Direito Constitucional': ['Teoria da Constituição','Direitos Fundamentais','Organização do Estado','Poder Executivo','Poder Legislativo','Poder Judiciário','Controle de Constitucionalidade','Processo Constitucional'],
    'Direito Civil': ['Pessoa Natural e Jurídica','Negócio Jurídico','Responsabilidade Civil','Contratos','Família','Sucessões','Direitos Reais','Obrigações'],
    'Direito Penal': ['Teoria do Crime','Tipicidade','Culpabilidade','Penas e Medidas de Segurança','Crimes contra a Pessoa','Crimes contra o Patrimônio','Lei de Drogas','Crimes contra a Administração Pública'],
    'Direito Administrativo': ['Atos Administrativos','Licitações e Contratos','Serviços Públicos','Improbidade Administrativa','Controle da Administração','Agentes Públicos','Processo Administrativo'],
    'Direito do Trabalho': ['Contrato de Trabalho','Jornada e Salário','FGTS','Rescisão Contratual','Processo do Trabalho','Negociação Coletiva'],
    'Direito Tributário': ['Sistema Tributário Nacional','Impostos Federais','Impostos Estaduais','Obrigação Tributária','Crédito Tributário','Execução Fiscal'],
    'Direito Processual Civil': ['Jurisdição e Ação','Processo de Conhecimento','Tutelas Provisórias','Recursos','Execução Civil','Cumprimento de Sentença'],
    'Direito Processual Penal': ['Inquérito Policial','Provas','Prisão e Liberdade','Procedimentos','Recursos Penais','Medidas Cautelares'],
    'Direito Empresarial': ['Direito Societário','Títulos de Crédito','Recuperação Judicial','Propriedade Intelectual','Contratos Empresariais'],
    'Direito Internacional': ['Direito Internacional Público','Direito Internacional Privado','Tratados e Convenções','Direitos Humanos Internacionais'],
    'Direito Ambiental': ['Política Nacional do Meio Ambiente','Licenciamento Ambiental','Crimes Ambientais','Código Florestal','Unidades de Conservação'],
  },
  'Saúde': {
    'Anatomia': ['Sistema Nervoso Central','Sistema Nervoso Periférico','Sistema Cardiovascular','Sistema Respiratório','Sistema Digestório','Sistema Musculoesquelético','Sistema Endócrino','Sistema Urinário','Sistema Reprodutor'],
    'Fisiologia': ['Fisiologia Cardiovascular','Fisiologia Respiratória','Fisiologia Renal','Neurofisiologia','Fisiologia Gastrointestinal','Fisiologia Endócrina','Fisiologia do Exercício'],
    'Bioquímica': ['Metabolismo de Carboidratos','Metabolismo Lipídico','Metabolismo de Proteínas','Enzimologia','Bioquímica Hormonal','Bases Moleculares da Doença'],
    'Farmacologia': ['Farmacocinética','Farmacodinâmica','Analgésicos e Anti-inflamatórios','Antibióticos e Antimicrobianos','Fármacos Cardiovasculares','Fármacos do SNC','Fármacos do Sistema Endócrino','Quimioterapia'],
    'Patologia': ['Inflamação','Neoplasias','Patologia Cardiovascular','Patologia Pulmonar','Patologia Renal','Patologia Hepática','Patologia do SNC'],
    'Clínica Médica': ['Cardiologia','Pneumologia','Gastroenterologia','Nefrologia','Endocrinologia','Infectologia','Neurologia','Reumatologia','Hematologia','Oncologia Clínica'],
    'Cirurgia': ['Cirurgia Geral','Trauma e Emergência','Cirurgia Cardiovascular','Cirurgia Digestiva','Neurocirurgia','Ortopedia e Traumatologia','Pré e Pós-operatório'],
    'Pediatria': ['Crescimento e Desenvolvimento','Neonatologia','Imunizações','Emergências Pediátricas','Doenças Infectocontagiosas na Infância','Nutrição Infantil'],
    'Ginecologia e Obstetrícia': ['Pré-natal','Parto e Puerpério','Ginecologia Oncológica','Infecções Ginecológicas','Planejamento Familiar','Climatério e Menopausa'],
    'Saúde Coletiva': ['Epidemiologia','Vigilância Sanitária','Vigilância Epidemiológica','SUS — Legislação e Políticas','Atenção Básica','Saúde da Família'],
    'Enfermagem': ['Sistematização da Assistência de Enfermagem','Semiologia e Semiotécnica','Enfermagem em UTI','Enfermagem Cirúrgica','Enfermagem em Saúde Mental','Legislação e Ética em Enfermagem'],
    'Nutrição': ['Nutrição Clínica','Nutrição Esportiva','Nutrição em Saúde Pública','Dietoterapia','Bromatologia','Bioquímica Nutricional'],
    'Psicologia': ['Psicologia Clínica','Psicologia Organizacional','Psicopatologia','Avaliação Psicológica','Teorias da Personalidade','Neuropsicologia'],
    'Psicanálise': ['Fundamentos e História da Psicanálise (Freud)','Determinismo Psíquico','Primeira Tópica: Inconsciente, Pré-consciente e Consciente','Segunda Tópica: Id, Ego e Superego','Recalque, Repressão e Outros Mecanismos de Defesa','Pulsão — Eros e Tânatos','Angústia e Sintoma','Fases do Desenvolvimento Psicossexual','Complexo de Édipo e Complexo de Castração','Interpretação dos Sonhos e Formações do Inconsciente','Transferência e Contratransferência','Neurose, Psicose e Perversão — Estruturas Clínicas','Psicanálise Kleiniana — Posições e Relações de Objeto','Psicanálise Winnicottiana — Objeto Transicional e Holding','Psicologia Analítica (Jung) — Inconsciente Coletivo e Arquétipos','Processo de Individuação (Jung)','Psicanálise Lacaniana — Linguagem, Sujeito e Desejo','Real, Simbólico e Imaginário — RSI (Lacan)','Comparativo: Freud × Jung × Lacan','Psicoterapia Breve Psicanalítica','Psicanálise e Cultura (Freud — Mal-Estar na Civilização)','Ética em Psicanálise','Psicanálise para Concursos (CFP, Residência, Pós-graduação)'],
    'Fisioterapia': ['Fisioterapia Respiratória','Fisioterapia Ortopédica','Fisioterapia Neurológica','Reabilitação Cardiovascular','Fisioterapia em UTI'],
    'Odontologia': ['Clínica Odontológica','Periodontia','Endodontia','Cirurgia Bucomaxilofacial','Saúde Bucal Coletiva'],
    'Medicina Veterinária': ['Clínica de Pequenos Animais','Clínica de Grandes Animais','Zoonoses','Saúde Animal e Inspeção','Anestesiologia Veterinária'],
  },
  'Tecnologia': {
    'Programação': ['Lógica de Programação','Algoritmos e Complexidade','Estruturas de Dados','Programação Orientada a Objetos','Programação Funcional','Design Patterns','Python','Java','C e C++','JavaScript','PHP','SQL','Go','Rust','Kotlin','Swift'],
    'Linguagens de Programação': ['Python Fundamentos','Python Avançado','Java','C e C++','JavaScript','PHP','SQL e PL/SQL','Go (Golang)','Rust','Kotlin','Swift','Ruby','Scala'],
    'Desenvolvimento Web': ['HTML5 e CSS3','JavaScript Moderno','TypeScript','React e Next.js','Vue.js','Node.js e Express','REST APIs','GraphQL'],
    'Banco de Dados': ['Modelagem Relacional','SQL Avançado','MySQL e PostgreSQL','NoSQL (MongoDB, Redis)','Transações e ACID','Otimização de Queries'],
    'Redes e Infraestrutura': ['Modelo OSI e TCP/IP','Protocolos de Rede','Roteamento e Switching','Segurança de Redes','Firewall e VPN','Protocolos Wireless'],
    'Segurança da Informação': ['Criptografia','Gestão de Riscos','Ethical Hacking','OWASP Top 10','Forense Digital','LGPD e Compliance'],
    'Cloud Computing': ['AWS Fundamentos','Azure Fundamentos','Google Cloud','Containers e Docker','Kubernetes','Serverless e FaaS'],
    'Inteligência Artificial': ['Machine Learning','Deep Learning','Processamento de Linguagem Natural','Visão Computacional','MLOps','Ética em IA'],
    'DevOps': ['CI/CD Pipelines','Git e Versionamento','Docker e Compose','Kubernetes Avançado','Monitoramento e Observabilidade','Infrastructure as Code'],
    'Sistemas Operacionais': ['Linux Administração','Windows Server','Processos e Threads','Gerência de Memória','Sistema de Arquivos'],
    'Engenharia de Software': ['Requisitos e UML','Metodologias Ágeis (Scrum/Kanban)','Arquitetura de Software','Testes de Software','Clean Code e Refactoring'],
    'Certificações de TI': ['CompTIA A+','CompTIA Network+','CompTIA Security+','CCNA — Cisco','AWS Certified Solutions Architect','AWS Certified Developer','Microsoft Azure Fundamentals (AZ-900)','Google Cloud Associate','LPIC-1 e LPIC-2 (Linux)','Scrum Master (PSM/CSM)','ITIL Foundation','PMP — Gestão de Projetos'],
    'TI para Concursos': ['Noções de Informática','Pacote Office e LibreOffice','Segurança da Informação Básica','Redes para Concursos','Sistemas Operacionais Básicos'],
  },
  'Exatas': {
    'Cálculo': ['Limites e Continuidade','Derivadas','Aplicações de Derivadas','Integrais Definidas e Indefinidas','Séries e Sequências','Equações Diferenciais'],
    'Álgebra Linear': ['Matrizes e Determinantes','Sistemas Lineares','Espaços Vetoriais','Transformações Lineares','Autovalores e Autovetores'],
    'Física': ['Cinemática','Dinâmica e Leis de Newton','Trabalho e Energia','Termodinâmica','Eletrostática','Eletromagnetismo','Óptica Geométrica','Física Moderna','Física Quântica','Teoria da Relatividade','Acústica','Óptica Física','Física de Partículas','Astrofísica Básica'],
    'Química': ['Química Geral','Estequiometria','Termoquímica','Equilíbrio Químico','Eletroquímica','Química Orgânica','Química Analítica','Bioquímica Aplicada','Físico-Química','Polímeros e Materiais','Química Ambiental','Espectroscopia'],
    'Astronomia e Astrofísica': ['Sistema Solar','Estrelas e Ciclo Estelar','Galáxias e Cosmologia','Astrofísica de Partículas','Telescópios e Observação','Exoplanetas'],
    'Ciência dos Materiais': ['Estrutura Cristalina','Propriedades Mecânicas','Metais e Ligas','Polímeros','Cerâmicas','Semicondutores','Nanomateriais'],
    'Biofísica': ['Biofísica Celular','Biomecânica','Biofísica Molecular','Radiobiologia','Técnicas Biofísicas (RMN, Criomicroscopia)'],
    'Estatística e Probabilidade': ['Probabilidade','Variáveis Aleatórias','Distribuições de Probabilidade','Inferência Estatística','Testes de Hipóteses','Regressão e Correlação'],
    'Matemática Discreta': ['Teoria dos Conjuntos','Lógica Proposicional','Teoria dos Grafos','Combinatória','Teoria dos Números'],
    'Matemática para Concursos': ['Aritmética e Porcentagem','Razão e Proporção','Equações e Inequações','Geometria Plana','Geometria Espacial','Raciocínio Lógico'],
  },
  'Humanas': {
    'História do Brasil': ['Brasil Colonial','Período Joanino e Independência','Segundo Reinado','República Velha','Era Vargas','Redemocratização e Ditadura Militar','Nova República'],
    'História Geral': ['Pré-História e Antiguidade','Grécia e Roma Antiga','Idade Média','Renascimento e Modernidade','Revoluções Industriais','Guerras Mundiais','Guerra Fria e Mundo Contemporâneo'],
    'Geografia do Brasil': ['Geopolítica Brasileira','Biomas Brasileiros','Urbanização e Regiões Metropolitanas','Agropecuária e Recursos Naturais','Geopolítica Regional'],
    'Geografia Geral': ['Cartografia e Coordenadas','Geopolítica Mundial','Climatologia e Hidrografia','População e Migrações','Globalização e Blocos Econômicos'],
    'Filosofia': ['Filosofia Antiga (Sócrates, Platão, Aristóteles)','Filosofia Medieval','Filosofia Moderna (Descartes, Kant)','Ética e Filosofia Moral','Epistemologia','Filosofia Política'],
    'Sociologia': ['Teorias Sociológicas Clássicas','Sociologia Brasileira','Movimentos Sociais','Trabalho e Sociedade','Cultura e Identidade'],
    'Antropologia': ['Antropologia Cultural','Antropologia Física','Etnologia Brasileira','Antropologia Urbana','Povos Indígenas no Brasil','Cultura e Simbolismo'],
    'Ciência Política': ['Teoria Política Clássica','Sistemas de Governo','Partidos e Eleições','Relações Internacionais','Democracia e Autoritarismo','Política Brasileira Contemporânea'],
    'Psicologia Social': ['Cognição Social','Atitudes e Preconceito','Influência Social','Grupos e Dinâmicas de Grupo','Identidade Social','Psicologia das Massas'],
    'Psicanálise': ['Fundamentos e História da Psicanálise (Freud)','Determinismo Psíquico','Primeira Tópica: Inconsciente, Pré-consciente e Consciente','Segunda Tópica: Id, Ego e Superego','Recalque, Repressão e Outros Mecanismos de Defesa','Pulsão — Eros e Tânatos','Angústia e Sintoma','Fases do Desenvolvimento Psicossexual','Complexo de Édipo e Complexo de Castração','Interpretação dos Sonhos e Formações do Inconsciente','Transferência e Contratransferência','Neurose, Psicose e Perversão — Estruturas Clínicas','Psicanálise Kleiniana — Posições e Relações de Objeto','Psicanálise Winnicottiana — Objeto Transicional e Holding','Psicologia Analítica (Jung) — Inconsciente Coletivo e Arquétipos','Processo de Individuação (Jung)','Psicanálise Lacaniana — Linguagem, Sujeito e Desejo','Real, Simbólico e Imaginário — RSI (Lacan)','Comparativo: Freud × Jung × Lacan','Psicoterapia Breve Psicanalítica','Psicanálise e Cultura (Freud — Mal-Estar na Civilização)','Ética em Psicanálise','Psicanálise para Concursos (CFP, Residência, Pós-graduação)'],
    'Direitos Humanos': ['Histórico e Fundamentos dos Direitos Humanos','Sistemas Internacionais de Proteção','Direitos Humanos no Brasil','Grupos Vulneráveis','Direito Humanitário Internacional','Mecanismos da ONU'],
    'Português': ['Morfologia e Sintaxe','Concordância e Regência','Crase e Pontuação','Interpretação e Tipologia Textual','Redação Oficial','Literatura Brasileira e Portuguesa'],
    'Atualidades': ['Geopolítica e Conflitos Internacionais','Eleições e Democracia no Mundo','Crise Climática e COP','Inteligência Artificial e Sociedade','Economia Global e Inflação','Saúde Global e Pandemias','Direitos Civis e Movimentos Sociais','Brasil: Política e Economia Recente','Tecnologia e Privacidade de Dados','Segurança Pública e Legislação'],
  },
  'Negócios': {
    'Administração': ['Teoria das Organizações','Gestão de Pessoas (RH)','Marketing e Vendas','Planejamento Estratégico','Empreendedorismo e Inovação','Gestão de Projetos'],
    'Contabilidade': ['Balanço Patrimonial','DRE e DVA','Análise de Balanços','Contabilidade de Custos','Contabilidade Pública','IFRS e CPC'],
    'Economia': ['Microeconomia','Macroeconomia','Economia Brasileira','Política Fiscal e Monetária','Comércio Internacional'],
    'Finanças': ['Matemática Financeira','Mercado Financeiro e de Capitais','Análise de Investimentos','Gestão de Risco','Derivativos e Opções'],
    'Direito Empresarial Aplicado': ['Ética nos Negócios','Compliance e Governança','Legislação Trabalhista para Gestores','Direito do Consumidor'],
    'Logística e Supply Chain': ['Gestão de Estoques','Logística de Transporte','Supply Chain Management','Lean Manufacturing','Gestão da Qualidade (ISO)'],
    'Marketing Digital': ['SEO e Busca Orgânica','Google Ads e Meta Ads','Marketing de Conteúdo','E-mail Marketing','Redes Sociais e Influência','Analytics e Métricas','Funil de Vendas Digital','E-commerce e Marketplace','Branding Digital'],
    'Gestão de Startups': ['Lean Startup e MVP','Pitch e Captação de Investimento','Venture Capital e Angel Investors','Product Market Fit','Growth Hacking','Cultura e People em Startups','Modelos de Negócio SaaS','Aceleradoras e Ecossistemas de Inovação'],
    'Agronegócio': ['Cadeias Produtivas do Agronegócio','Commodities e Mercado Futuro','Tecnologia no Campo (AgTech)','Crédito Rural e Financiamento','Exportações do Agronegócio Brasileiro','Sustentabilidade e Agro','Legislação Rural e Ambiental'],
  },
  'ENEM': {
    'Linguagens': ['Interpretação de Texto','Literatura Brasileira e Portuguesa','Gramática e Norma Culta','Artes e Cultura','Língua Estrangeira'],
    'Matemática': ['Álgebra e Funções','Geometria Plana e Espacial','Estatística e Probabilidade','Matemática Financeira','Trigonometria'],
    'Ciências da Natureza': ['Mecânica e Termodinâmica','Eletricidade e Óptica','Química Orgânica e Inorgânica','Biologia Celular e Molecular','Ecologia e Meio Ambiente'],
    'Ciências Humanas': ['História do Brasil','História Geral','Geografia Física e Humana','Filosofia','Sociologia'],
    'Redação ENEM': ['Estrutura da Redação','Repertório Cultural','Proposta de Intervenção','Coesão e Coerência','Temas Recorrentes'],
  },
  'Concursos — Matérias Comuns': {
    'Língua Portuguesa': ['Compreensão e Interpretação de Texto','Tipologia e Gêneros Textuais','Ortografia e Acentuação','Concordância Nominal e Verbal','Regência Nominal e Verbal','Pontuação','Vocabulário e Semântica','Redação Oficial'],
    'Raciocínio Lógico': ['Lógica Proposicional','Tabelas-Verdade','Diagramas Lógicos','Sequências e Padrões','Raciocínio Analítico'],
    'Matemática para Concursos': ['Aritmética e Divisibilidade','Porcentagem e Juros','Razão, Proporção e Regra de Três','Probabilidade e Estatística','Geometria','Álgebra Básica'],
    'Informática para Concursos': ['Noções de Hardware e Software','Windows e Linux','Pacote Office (Word, Excel, PowerPoint)','Internet e E-mail','Segurança da Informação Básica','Redes Básicas'],
    'Legislação Geral': ['Constituição Federal — Principais Artigos','Lei 8.112/90 (Estatuto dos Servidores)','Lei 8.666/93 e Lei 14.133/21 (Licitações)','Lei de Responsabilidade Fiscal','Lei de Acesso à Informação'],
    'Direito Constitucional Básico': ['Princípios Fundamentais','Direitos e Garantias Fundamentais','Administração Pública','Poder Executivo, Legislativo e Judiciário','Controle de Constitucionalidade'],
  },
};

// ─── CONCURSO DATA (expandido) ─────────────────────────────────────────────
const concursoData = {
  'Segurança Pública': { concursos: [
    { id: 'pf-agente', label: 'PF — Agente Federal', banca: 'CEBRASPE/CESPE' },
    { id: 'pf-delegado', label: 'PF — Delegado', banca: 'CEBRASPE/CESPE' },
    { id: 'prf', label: 'PRF — Policial Rodoviário Federal', banca: 'CEBRASPE/CESPE' },
    { id: 'pc-sp', label: 'PC-SP — Investigador / Delegado', banca: 'VUNESP' },
    { id: 'pc-rj', label: 'PC-RJ — Agente / Delegado', banca: 'CEBRASPE/CESPE' },
    { id: 'pc-estados', label: 'PC — Outros Estados', banca: 'CEBRASPE/CESPE' },
    { id: 'pm-sp', label: 'PM-SP — Soldado / Oficial', banca: 'VUNESP' },
    { id: 'pm-estados', label: 'PM — Outros Estados', banca: 'CEBRASPE/CESPE' },
    { id: 'depen', label: 'DEPEN / Agente Penitenciário Federal', banca: 'CEBRASPE/CESPE' },
    { id: 'bombeiros', label: 'Corpo de Bombeiros', banca: 'CEBRASPE/CESPE' },
    { id: 'gcm', label: 'Guarda Civil Municipal', banca: 'VUNESP' },
  ]},
  'Fiscal / Tributário': { concursos: [
    { id: 'receita-auditor', label: 'Receita Federal — Auditor Fiscal', banca: 'CEBRASPE/CESPE' },
    { id: 'receita-analista', label: 'Receita Federal — Analista Tributário', banca: 'CEBRASPE/CESPE' },
    { id: 'inss-analista', label: 'INSS — Analista', banca: 'CEBRASPE/CESPE' },
    { id: 'tcu', label: 'TCU — Auditor Federal de Controle Externo', banca: 'CEBRASPE/CESPE' },
    { id: 'tce', label: 'TCE — Tribunais de Contas Estaduais', banca: 'FCC' },
    { id: 'sefaz-sp', label: 'SEFAZ-SP — Agente Fiscal de Rendas', banca: 'FCC' },
    { id: 'sefaz-rj', label: 'SEFAZ-RJ — Fiscal', banca: 'FGV' },
    { id: 'pgfn', label: 'PGFN — Procurador', banca: 'CEBRASPE/CESPE' },
    { id: 'agu', label: 'AGU — Advogado da União', banca: 'CEBRASPE/CESPE' },
  ]},
  'Jurídico': { concursos: [
    { id: 'oab-1fase', label: 'OAB — 1ª Fase', banca: 'FGV' },
    { id: 'oab-2fase', label: 'OAB — 2ª Fase', banca: 'FGV' },
    { id: 'tj-sp', label: 'TJ-SP — Escrevente / Analista', banca: 'VUNESP' },
    { id: 'tj-rj', label: 'TJ-RJ — Analista', banca: 'FGV' },
    { id: 'trf', label: 'TRF — Analista e Técnico Judiciário', banca: 'CEBRASPE/CESPE' },
    { id: 'tst', label: 'TST — Analista Judiciário', banca: 'FCC' },
    { id: 'mp-estadual', label: 'Ministério Público Estadual', banca: 'CEBRASPE/CESPE' },
    { id: 'mpu', label: 'MPU — Analista e Técnico', banca: 'CEBRASPE/CESPE' },
    { id: 'defensoria-sp', label: 'Defensoria Pública SP', banca: 'FGV' },
    { id: 'defensoria-federal', label: 'DPU — Defensor Público Federal', banca: 'CEBRASPE/CESPE' },
  ]},
  'Bancário': { concursos: [
    { id: 'bb-escriturario', label: 'Banco do Brasil — Escriturário', banca: 'CESGRANRIO' },
    { id: 'bb-analista', label: 'Banco do Brasil — Analista', banca: 'CESGRANRIO' },
    { id: 'cef-tecnico', label: 'Caixa Econômica — Técnico Bancário', banca: 'CESGRANRIO' },
    { id: 'cef-analista', label: 'Caixa Econômica — Analista', banca: 'CESGRANRIO' },
    { id: 'bndes', label: 'BNDES — Analista', banca: 'CESGRANRIO' },
    { id: 'bacen', label: 'Banco Central — Analista', banca: 'CEBRASPE/CESPE' },
    { id: 'correios', label: 'Correios — Analista e Técnico', banca: 'CEBRASPE/CESPE' },
    { id: 'cvm', label: 'CVM — Analista', banca: 'FGV' },
  ]},
  'Federal / Geral': { concursos: [
    { id: 'anp', label: 'Petrobras / ANP — Nível Superior', banca: 'CESGRANRIO' },
    { id: 'ibge', label: 'IBGE — Pesquisador / Analista', banca: 'CEBRASPE/CESPE' },
    { id: 'anatel', label: 'ANATEL — Especialista', banca: 'FGV' },
    { id: 'anvisa', label: 'ANVISA — Especialista em Regulação', banca: 'CEBRASPE/CESPE' },
    { id: 'cgu', label: 'CGU — Auditor Federal', banca: 'CEBRASPE/CESPE' },
    { id: 'iphan', label: 'IPHAN — Especialista', banca: 'FCC' },
    { id: 'mec', label: 'MEC / FNDE — Analista', banca: 'CEBRASPE/CESPE' },
    { id: 'outro-edital', label: '<i data-lucide="file-plus" width="14" height="14"></i> Outro — colar edital', banca: 'A definir' },
  ]},
  'Saúde / Residência': { concursos: [
    { id: 'revalida', label: 'Revalida — Revalidação de Diploma Médico', banca: 'INEP/MEC' },
    { id: 'residencia-medica', label: 'Residência Médica — USP / UNICAMP / UNIFESP', banca: 'FAMERP/VUNESP' },
    { id: 'residencia-enf', label: 'Residência em Enfermagem', banca: 'CEBRASPE/CESPE' },
    { id: 'sus-medico', label: 'SUS / SMS — Médico Clínico Geral', banca: 'VUNESP' },
    { id: 'sus-enfermeiro', label: 'SUS / SMS — Enfermeiro', banca: 'VUNESP' },
    { id: 'sus-farmaceutico', label: 'SUS / SMS — Farmacêutico', banca: 'FCC' },
    { id: 'sus-fisioterapeuta', label: 'SUS / SMS — Fisioterapeuta', banca: 'VUNESP' },
    { id: 'coren', label: 'COREN / CFM — Provas de Ética e Legislação', banca: 'Banca própria' },
    { id: 'ebserh', label: 'EBSERH — Analista e Técnico em Saúde', banca: 'CEBRASPE/CESPE' },
    { id: 'hcpa', label: 'HCPA — Hospital de Clínicas de Porto Alegre', banca: 'Banca própria' },
  ]},
  'Educação': { concursos: [
    { id: 'prof-ef', label: 'Professor — Ensino Fundamental (Prefeituras)', banca: 'VUNESP' },
    { id: 'prof-em', label: 'Professor — Ensino Médio (SEE Estadual)', banca: 'VUNESP/FCC' },
    { id: 'prof-mat', label: 'Professor de Matemática', banca: 'CEBRASPE/CESPE' },
    { id: 'prof-port', label: 'Professor de Português / Língua Portuguesa', banca: 'FCC' },
    { id: 'prof-bio', label: 'Professor de Biologia / Ciências', banca: 'CEBRASPE/CESPE' },
    { id: 'prof-hist', label: 'Professor de História', banca: 'CEBRASPE/CESPE' },
    { id: 'prof-ed-fisica', label: 'Professor de Educação Física', banca: 'IBFC' },
    { id: 'pedagogia', label: 'Pedagogo / Coordenador Pedagógico', banca: 'VUNESP' },
    { id: 'if-federal', label: 'Instituto Federal — Professor', banca: 'CEBRASPE/CESPE' },
    { id: 'mec-analista', label: 'MEC / Universidade Federal — Técnico Administrativo', banca: 'CEBRASPE/CESPE' },
  ]},
  'Municipal': { concursos: [
    { id: 'pref-sp', label: 'Prefeitura de São Paulo — Diversas Áreas', banca: 'VUNESP' },
    { id: 'pref-rj', label: 'Prefeitura do Rio de Janeiro', banca: 'FGV' },
    { id: 'pref-bh', label: 'Prefeitura de Belo Horizonte', banca: 'FUNDEP' },
    { id: 'pref-cwb', label: 'Prefeitura de Curitiba', banca: 'CEBRASPE/CESPE' },
    { id: 'pref-poa', label: 'Prefeitura de Porto Alegre', banca: 'FUNDATEC' },
    { id: 'pref-fortaleza', label: 'Prefeitura de Fortaleza', banca: 'CEBRASPE/CESPE' },
    { id: 'camara-municipal', label: 'Câmara Municipal — Diversas Cidades', banca: 'VUNESP' },
    { id: 'mun-fiscal', label: 'Fiscal de Obras / Tributos Municipal', banca: 'VUNESP' },
    { id: 'mun-assistente', label: 'Assistente Social / Psicólogo Municipal', banca: 'IBFC' },
    { id: 'outro-edital', label: '<i data-lucide="file-plus" width="14" height="14"></i> Outro município — colar edital', banca: 'A definir' },
  ]},
};

// ════════════════════════════════════════════════════════════════════════════
// DADOS RAG PARA CONCURSOS (Modo Concursos: Matérias Clássicas)
// ════════════════════════════════════════════════════════════════════════════
// Mapeamento 1:1 com CONCURSOS_CONFIG.filters no backend (worker.js)
//
// Chaves internas: concursos.<materia>
// Coleções RAG: concursos_<materia>
// ════════════════════════════════════════════════════════════════════════════

const concursosFilters = {
  'concursos.portugues': {
    label: 'Português',
    icon: 'book-open',
    description: 'Gramática, regência, semântica, interpretação de textos',
  },
  'concursos.direito_constitucional': {
    label: 'Direito Constitucional',
    icon: 'balance-scale',
    description: 'CF/88, direitos fundamentais, poderes e federação',
  },
  'concursos.direito_administrativo': {
    label: 'Direito Administrativo',
    icon: 'briefcase',
    description: 'Administração pública, servidores, licitações, atos administrativos',
  },
  'concursos.direito_penal': {
    label: 'Direito Penal',
    icon: 'shield-check',
    description: 'Teoria do crime, crimes contra a pessoa, patrimônio, administração pública e processo penal',
  },
  'concursos.direito_processual_civil': {
    label: 'Direito Processual Civil',
    icon: 'book-open',
    description: 'Jurisdição, ação, tutelas, recursos e execução civil',
  },
  'concursos.direito_processual_penal': {
    label: 'Direito Processual Penal',
    icon: 'gavel',
    description: 'Procedimento penal, ação penal, prova, recursos e execução penal',
  },
  'concursos.direito_tributario': {
    label: 'Direito Tributário',
    icon: 'coins',
    description: 'Sistema tributário, impostos, princípios, lançamento e execução fiscal',
  },
  'concursos.direito_civil': {
    label: 'Direito Civil',
    icon: 'building',
    description: 'Contratos, responsabilidade civil, direitos reais, família e sucessões',
  },
  'concursos.direito_trabalhista': {
    label: 'Direito Trabalhista',
    icon: 'briefcase',
    description: 'Direitos do trabalhador, contrato de trabalho, jornada, rescisão e Justiça do Trabalho',
  },
  'concursos.legislacao_especifica': {
    label: 'Legislação Específica',
    icon: 'file-text',
    description: 'Leis de servidores, acesso à informação, improbidade, licitações e compliance',
  },
  'concursos.atualidades': {
    label: 'Atualidades',
    icon: 'globe-alt',
    description: 'Economia, política, tecnologia, meio ambiente e políticas públicas recentes',
  },
  'concursos.raciocinio_logico': {
    label: 'Raciocínio Lógico',
    icon: 'zap',
    description: 'Lógica formal, combinatória, probabilidade, argumentos',
  },
  'concursos.informatica': {
    label: 'Informática',
    icon: 'cpu',
    description: 'SO, redes, segurança, protocolos, bancos de dados',
  },
  'concursos.administracao_publica': {
    label: 'Administração Pública',
    icon: 'briefcase',
    description: 'Gestão pública, planejamento, Lei 8.112, Lei 14.133 (licitações)',
  },
};

// Tópicos por disciplina de concursos (para select em cascata)
// Chaves = sufixo da disciplina (sem 'concursos.'), pois o worker monta: `concursos.${discipline}`
const concursoTopicMap = {
  'portugues': ['Compreensão e Interpretação de Texto','Ortografia e Acentuação','Concordância Nominal e Verbal','Regência Nominal e Verbal','Pontuação e Crase','Semântica e Vocabulário','Morfologia','Sintaxe da Frase','Tipologia e Gêneros Textuais','Redação Oficial'],
  'direito_constitucional': ['CF/88 — Princípios Fundamentais','Direitos e Garantias Fundamentais','Direitos Sociais','Direitos Políticos e Nacionalidade','Poder Executivo','Poder Legislativo','Poder Judiciário','Controle de Constitucionalidade','Administração Pública'],
  'direito_administrativo': ['Atos Administrativos','Processo Administrativo (Lei 9.784/99)','Servidores Públicos (Lei 8.112/90)','Licitações (Lei 8.666/93)','Nova Lei de Licitações (Lei 14.133/21)','Contratos Administrativos','Responsabilidade Civil do Estado','Improbidade Administrativa'],
  'direito_penal': ['Teoria Geral do Crime','Tipicidade e Ilicitude','Dolo e Culpa','Crime Doloso e Culposo','Crime Omissivo','Consumação e Tentativa','Homicídio e Lesões','Crimes Contra o Patrimônio','Crimes Contra a Honra','Crimes Contra a Administração Pública','Lei de Drogas e Lavagem de Dinheiro'],
  'direito_processual_penal': ['Ação Penal Pública, Privada e Condicionada','Inquérito Policial e Competência','Prisão em Flagrante e Preventiva','Provas e Nulidades','Recursos e Execução Penal'],
  'direito_tributario': ['Sistema Tributário Nacional','Princípios Tributários','Impostos, Taxas e Contribuições','Lançamento e Extinção do Crédito Tributário','Execução Fiscal e Dívida Ativa'],
  'direito_civil': ['Parte Geral do Código Civil','Contratos e Obrigações','Direitos Reais','Responsabilidade Civil','Família e Sucessões'],
  'direito_processual_civil': ['Jurisdição e Ação','Processo de Conhecimento','Tutelas Provisórias','Recursos','Execução Civil','Cumprimento de Sentença'],
  'direito_trabalhista': ['Contrato de Trabalho','Jornada e Remuneração','Direitos Trabalhistas','Estabilidade e FGTS','Processo do Trabalho'],
  'legislacao_especifica': ['Lei de Licitações e Contratos','Lei de Improbidade Administrativa','Lei de Acesso à Informação','Estatuto dos Servidores Públicos','LGPD no Setor Público','Lei de Responsabilidade Fiscal','Lei Anticorrupção e Compliance'],
  'atualidades': ['Economia e Política','Governo Digital e Cibersegurança','Sustentabilidade e Meio Ambiente','Segurança Pública','Políticas Sociais e Reformas','Geopolítica e Conflitos Internacionais','Eleições e Democracia'],
  'raciocinio_logico': ['Lógica Proposicional','Tabelas-Verdade','Diagramas Lógicos (Venn)','Sequências e Padrões','Argumentação e Inferência','Análise Combinatória','Probabilidade','Porcentagem e Proporção'],
  'informatica': ['Hardware e Software Básico','Sistemas Operacionais (Windows/Linux)','Pacote Office (Word, Excel, PowerPoint)','Internet, Redes e Protocolos','Segurança da Informação','Banco de Dados Básico','Redes de Computadores'],
  'administracao_publica': ['Princípios Constitucionais da AP','Organização Administrativa','Controle da Administração','Planejamento e Orçamento Público','Gestão de Pessoas no Setor Público','Liderança e Comportamento Organizacional','Ética no Serviço Público'],
};

const state = {
  currentStep: 1, direction: 'forward', mode: null,
  area: null, subject: null, topic: null,
  concursoCategory: null, concurso: null, bancaInferida: null,
  filter: null,
  concursosFiltersState: {
    discipline: null, topic: null, keyword: '',
    examBoard: null, agency: null, position: null, educationLevel: null,
    yearFrom: null, yearTo: null,
  },
  redacaoState: {
    sessionId: null,
    history: [],
    stage: 'thesis',
    summary: '',
    scores: { c1: 0, c2: 0, c3: 0, c4: 0, c5: 0 },
    banca: 'ENEM'
  },
  aivos360State: {
    concurso: null,
    cargo: null,
    banca: null,
    dataProva: null,
    horasDia: null,
    nivel: null,
    experiencia: null,
    redacoesPorSemana: 1,
    frequenciaSimulados: 'mensal',
    metasSemanais: ''
  },
  editalText: '', freeText: '',
  difficulty: 'medium', quantity: 10, questionType: 'mc', sessionMode: 'normal',
  alternativas: 5, idioma: 'pt-BR', bancaFoco: 'auto',
  generatedQuestions: [], answered: 0, correct: 0, answerResults: [],
  sessionHistory: { answers: [], correct: 0, wrong: 0 },
  concursoSubStep: 'a',
  dailyGoal: 10,
  questionStartTime: null, // Para tracking de tempo de resposta no DigitalTwin
};

// Inicializar AIVOS 360 Coaching (Sistema completo)
document.addEventListener('DOMContentLoaded', async () => {
  if (window.initAIVOS360) {
    try {
      await window.initAIVOS360();
      console.log('[AIVOS 360] Sistema inicializado com sucesso');
      
      // Exibir relatório de status no console
      const aivos360 = window.getAIVOS360();
      if (aivos360) {
        console.log(aivos360.getStatusReport());
      }
    } catch (error) {
      console.error('[AIVOS 360] Erro na inicialização:', error);
    }
  }
});
const MAX_EXTRACTED_CHARS = 120000;
const scriptPromises = {};
const STORAGE_KEYS = {
  streakDate: 'sm_streak_date',
  streakCount: 'sm_streak_count',
  dailyGoal: 'sm_daily_goal',
  todayCount: 'sm_today_count',
  todayDate: 'sm_today_date',
};

function safeStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    return;
  }
}

function getDateStamp(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function getTodayCount() {
  ensureTodayReset();
  const raw = safeStorageGet(STORAGE_KEYS.todayCount);
  const parsed = Number.parseInt(raw || '0', 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function setTodayCount(count) {
  const normalized = Math.max(0, Number.parseInt(String(count), 10) || 0);
  safeStorageSet(STORAGE_KEYS.todayDate, getDateStamp());
  safeStorageSet(STORAGE_KEYS.todayCount, String(normalized));
  updateStreakBadge();
}

function incrementTodayCount(step = 1) {
  const current = getTodayCount();
  setTodayCount(current + step);
}

function ensureTodayReset() {
  const today = getDateStamp();
  const savedDate = safeStorageGet('sm_last_date');
  
  // Se mudou de dia, reseta TODOS os contadores simultaneamente
  if (savedDate !== today) {
    safeStorageSet('sm_last_date', today);
    safeStorageSet('sm_correct_today', '0');
    safeStorageSet('sm_wrong_today', '0');
    safeStorageSet(STORAGE_KEYS.todayDate, today);
    safeStorageSet(STORAGE_KEYS.todayCount, '0');
  }
}

function getCorrectToday() {
  ensureTodayReset();
  const raw = safeStorageGet('sm_correct_today');
  const parsed = Number.parseInt(raw || '0', 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function getWrongToday() {
  ensureTodayReset();
  const raw = safeStorageGet('sm_wrong_today');
  const parsed = Number.parseInt(raw || '0', 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function incrementCorrectToday() {
  ensureTodayReset();
  const current = Number.parseInt(safeStorageGet('sm_correct_today') || '0', 10) || 0;
  safeStorageSet('sm_correct_today', String(current + 1));
  updateDailyPerf();
}

function incrementWrongToday() {
  ensureTodayReset();
  const current = Number.parseInt(safeStorageGet('sm_wrong_today') || '0', 10) || 0;
  safeStorageSet('sm_wrong_today', String(current + 1));
  updateDailyPerf();
}

function updateDailyPerf() {
  const correctEl = document.getElementById('dp-correct');
  const wrongEl = document.getElementById('dp-wrong');
  if (!correctEl || !wrongEl) return;
  ensureTodayReset();
  correctEl.textContent = String(Number.parseInt(safeStorageGet('sm_correct_today') || '0', 10) || 0);
  wrongEl.textContent = String(Number.parseInt(safeStorageGet('sm_wrong_today') || '0', 10) || 0);
}

function getDailyGoal() {
  const raw = safeStorageGet(STORAGE_KEYS.dailyGoal);
  if (raw === 'none') return null;
  const parsed = Number.parseInt(raw || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
}

function setDailyGoal(goal) {
  if (goal === null) {
    safeStorageSet(STORAGE_KEYS.dailyGoal, 'none');
    state.dailyGoal = null;
  } else {
    safeStorageSet(STORAGE_KEYS.dailyGoal, String(goal));
    state.dailyGoal = goal;
  }
  updateDailyGoalUI();
  updateStreakBadge();
}

function dateDiffInDays(fromDateStr, toDateStr) {
  const from = new Date(`${fromDateStr}T00:00:00`);
  const to = new Date(`${toDateStr}T00:00:00`);
  const diff = Math.round((to - from) / (1000 * 60 * 60 * 24));
  return Number.isFinite(diff) ? diff : 0;
}

function getStreakCount() {
  const raw = safeStorageGet(STORAGE_KEYS.streakCount);
  const parsed = Number.parseInt(raw || '0', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function handleQuizCompleted() {
  const today = getDateStamp();
  const lastDate = safeStorageGet(STORAGE_KEYS.streakDate);
  let streak = getStreakCount();
  if (!lastDate) {
    streak = 1;
  } else {
    const dayDiff = dateDiffInDays(lastDate, today);
    if (dayDiff === 0) {
      streak = streak > 0 ? streak : 1;
    } else if (dayDiff === 1) {
      streak = streak + 1;
    } else {
      streak = 1;
    }
  }
  safeStorageSet(STORAGE_KEYS.streakDate, today);
  safeStorageSet(STORAGE_KEYS.streakCount, String(streak));
  updateStreakBadge();
}

function updateStreakBadge() {
  const text = document.getElementById('streak-text');
  if (!text) return;
  const streak = getStreakCount();
  const todayCount = getTodayCount();
  const goal = state.dailyGoal;
  text.textContent = goal ? `${streak} | ${todayCount}/${goal} hoje` : `${streak} | ${todayCount} hoje`;
}

function updateDailyGoalUI() {
  const chips = document.querySelectorAll('#daily-goal-group .chip[data-goal]');
  if (!chips.length) return;
  chips.forEach(chip => chip.classList.remove('active'));
  const selector = state.dailyGoal === null ? '[data-goal="none"]' : `[data-goal="${state.dailyGoal}"]`;
  const selected = document.querySelector(`#daily-goal-group .chip${selector}`);
  if (selected) selected.classList.add('active');
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function isMobileViewport() {
  return window.matchMedia('(max-width: 768px)').matches;
}

function scrollToWizard(delay = 0) {
  setTimeout(() => {
    const wizardCard = document.getElementById('wizard-card');
    if (!wizardCard) return;
    const rect = wizardCard.getBoundingClientRect();
    const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
    const targetY = window.scrollY + rect.top - headerHeight - 16;
    const isVisible = rect.top >= headerHeight && rect.bottom <= window.innerHeight;
    if (isMobileViewport() || !isVisible) window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
  }, delay);
}

function scrollChoiceIntoView(target, delay = 90) {
  if (!isMobileViewport()) return;
  setTimeout(() => {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
    const bottomNav = document.querySelector('.wizard-nav')?.offsetHeight || 0;
    const rect = el.getBoundingClientRect();
    const targetY = window.scrollY + rect.top - headerHeight - 14;
    const lowerLimit = window.innerHeight - bottomNav - 24;
    const needsScroll = rect.top < headerHeight + 12 || rect.bottom > lowerLimit;
    if (needsScroll) window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
  }, delay);
}

function scrollToNextConfigGroup(fromEl) {
  if (!isMobileViewport() || !fromEl) return;
  const group = fromEl.closest('.config-group');
  const next = group?.nextElementSibling;
  if (next?.classList?.contains('config-group')) scrollChoiceIntoView(next, 120);
}

function goHome() {
  if (state.currentStep === 1 && !state.mode) { scrollToTop(); return; }
  const currEl = document.getElementById(`step-${state.currentStep}`);
  const step1El = document.getElementById('step-1');
  currEl.classList.remove('active');
  step1El.classList.add('active');
  state.currentStep = 1;
  if (state.mode !== 'redacao') resetState();
  updateStepBar(1);
  updateNavButtons();
  scrollToTop();
}

function syncThemeIcon() {
  const icon = document.getElementById('theme-icon');
  if (!icon) return;
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
}

function init() {
  const savedTheme = safeStorageGet('aivos-theme');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }
  syncThemeIcon();
  lucide.createIcons();
  state.dailyGoal = getDailyGoal();
  ensureTodayReset();
  getTodayCount();
  updateStreakBadge();
  updateDailyPerf();

  document.getElementById('logo-home').addEventListener('click', e => {
    e.preventDefault();
    goHome();
  });

  document.querySelector('[data-theme-toggle]').addEventListener('click', () => {
    const root = document.documentElement;
    const isDark = root.getAttribute('data-theme') === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';
    root.setAttribute('data-theme', nextTheme);
    safeStorageSet('aivos-theme', nextTheme);
    syncThemeIcon();
    lucide.createIcons();
  });

  document.querySelectorAll('.mode-card').forEach(btn => {
    btn.addEventListener('click', e => selectMode(e.currentTarget.dataset.mode));
  });

  const setupChips = (group, key) => {
    document.querySelectorAll(`.chip[data-${group}]`).forEach(btn => {
      btn.addEventListener('click', e => {
        document.querySelectorAll(`.chip[data-${group}]`).forEach(b => b.classList.remove('active'));
        const selected = e.currentTarget;
        selected.classList.add('active');
        state[key] = selected.dataset[group];
        scrollToNextConfigGroup(selected);
      });
    });
  };

  setupChips('difficulty', 'difficulty');
  setupChips('qtype', 'questionType');
  setupChips('session', 'sessionMode');
  setupChips('alternativas', 'alternativas');
  setupChips('idioma', 'idioma');

  const slider = document.getElementById('qty-slider');
  slider.addEventListener('input', e => {
    state.quantity = parseInt(e.target.value);
    document.getElementById('qty-display').textContent = state.quantity;
  });
  document.querySelectorAll('#daily-goal-group .chip[data-goal]').forEach(btn => {
    btn.addEventListener('click', e => {
      const val = e.currentTarget.dataset.goal;
      setDailyGoal(val === 'none' ? null : Number.parseInt(val, 10));
      scrollToNextConfigGroup(e.currentTarget);
    });
  });
  updateDailyGoalUI();

  document.getElementById('next-btn').addEventListener('click', () => {
    let target = state.currentStep + 1;
    if (state.mode === 'redacao' && target === 3) target = 4;
    goToStep(target);
  });
  document.getElementById('back-btn').addEventListener('click', () => {
    let target = state.currentStep - 1;
    if (state.mode === 'redacao' && target === 3) target = 2;
    goToStep(target);
  });
  document.getElementById('restart-btn').addEventListener('click', () => {
    const sessionCompleted = state.generatedQuestions.length > 0 && state.answered === state.generatedQuestions.length;
    if (sessionCompleted) window.dispatchEvent(new CustomEvent('quizCompleted'));
    goToStep(1);
  });
  document.getElementById('retry-btn').addEventListener('click', () => callWorkerAndRender());
  document.getElementById('session-new-btn').addEventListener('click', () => {
    const sessionCompleted = state.generatedQuestions.length > 0 && state.answered === state.generatedQuestions.length;
    const bancaAtual = state.redacaoState.banca; resetRedacaoSession(); state.redacaoState.banca = bancaAtual;
    goToStep(1);
  });
  window.addEventListener('quizCompleted', handleQuizCompleted);
  updateNavButtons();
}

function selectMode(mode) {
  if (state.mode && state.mode !== mode && state.mode !== 'redacao') resetState();
  state.mode = mode;
  document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
  document.querySelector(`.mode-card[data-mode="${mode}"]`).classList.add('selected');

  // Hide institutional elements when mode is selected
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.classList.add('compact');
  }

  renderStep2();
  setTimeout(() => goToStep(2), 150);
}

async function goToStep(target) {
  if (target < 1 || target > 4) return;
  state.direction = target > state.currentStep ? 'forward' : 'backward';
  
  // Bulletproof bypass for step 3 in redacao mode
  if (state.mode === 'redacao' && target === 3) {
    target = state.direction === 'forward' ? 4 : 2;
  }
  
  const currEl = document.getElementById(`step-${state.currentStep}`);
  const nextEl = document.getElementById(`step-${target}`);
  if (!currEl || !nextEl || target === state.currentStep) return;
  currEl.style.animation = 'none'; nextEl.style.animation = 'none';
  currEl.classList.remove('active', 'step-enter-forward', 'step-enter-backward');
  currEl.classList.add(`step-exit-${state.direction}`);
  setTimeout(async () => {
    currEl.classList.remove('active', `step-exit-${state.direction}`);
    nextEl.classList.add('active', `step-enter-${state.direction}`);
    state.currentStep = target;
    
    // Render step 3 for aivos360 mode
    if (target === 3 && state.mode === 'aivos360') {
      renderStep3Aivos360();
    }
    
    updateStepBar(target);
    updateNavButtons();
    scrollToWizard(50);
    if (target === 4) {
      if (state.mode === 'redacao') {
    // Hide screens and use Coach RedBot dashboard
    document.getElementById('generating-screen').classList.add('hidden');
    document.getElementById('error-screen').classList.remove('visible');
    document.getElementById('questions-container').classList.remove('visible');
    const oldChat = document.getElementById('redacao-chat-wrapper');
    if (oldChat) oldChat.classList.add('hidden');
    renderRedacaoCoachDashboard();
    return;
  }
  const genScreen = document.getElementById('generating-screen');
  const errScreen = document.getElementById('error-screen');
  const qContainer = document.getElementById('questions-container');
  genScreen.classList.remove('hidden');
  errScreen.classList.remove('visible');
  qContainer.classList.remove('visible');

  // Resolve banca efetiva: se foco manual definido, usa ele; senão usa banca inferida do concurso
  const bancaEfetiva = (state.bancaFoco && state.bancaFoco !== 'auto')
    ? state.bancaFoco
    : state.bancaInferida;

  const payload = {
    mode: state.mode === 'concurso' ? 'concurso' : state.mode,
    filter: state.mode === 'concurso' ? buildConcursosWorkerFilter() : state.filter,
    area: state.area,
    subject: state.subject,
    topic: state.topic,
    concurso: state.concurso?.label,
    banca: bancaEfetiva,
    bancaFoco: state.bancaFoco !== 'auto' ? state.bancaFoco : null,
    freeText: state.freeText,
    editalText: state.editalText,
    
    difficulty: state.difficulty,
    quantity: state.quantity,
    questionType: state.questionType,
    alternativas: parseInt(state.alternativas),
    idioma: state.idioma,
    sessionMode: state.sessionMode,
  };

  try {
    const res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.userMessage || `Erro HTTP ${res.status}`);
    if (!data.questions || !data.questions.length) throw new Error(data.userMessage || 'Nenhuma questão retornada. Tente ajustar o tópico.');
    state.generatedQuestions = data.questions;
    state.answered = 0; state.correct = 0;
    state.sessionHistory = { answers: [], correct: 0, wrong: 0 };
    genScreen.classList.add('hidden');
    renderQuestions(data.questions);
    // No mobile, entra automaticamente no Modo Foco
    if (window.innerWidth < 768) {
      setTimeout(openFullscreen, 200);
    }
  } catch (err) {
    showError(err.message || 'Erro desconhecido. Tente novamente em instantes.');
  }
}

function normalizeErrorMessage(raw) {
  if (!raw) return 'Algo inesperado aconteceu. Tente novamente em instantes.';
  const msg = raw.toString();
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
    return 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.';
  }
  if (msg.includes('HTTP 422') || msg.toLowerCase().includes('contexto insuficiente')) {
    return 'Não há material suficiente para gerar questões. Ajuste o tópico ou informe outro conteúdo.';
  }
  if (msg.includes('HTTP 404')) {
    return 'Serviço indisponível. Tente novamente mais tarde.';
  }
  if (msg.includes('Nenhuma questão retornada')) {
    return 'Nenhuma questão foi gerada. Tente outro tema ou aumente a quantidade de conteúdo.';
  }
  if (msg.toLowerCase().includes('timeout')) {
    return 'A requisição demorou muito. Tente novamente em alguns segundos.';
  }
  return 'Algo inesperado aconteceu. Tente novamente em instantes.';
}

function showError(msg) {
  const normalized = normalizeErrorMessage(msg);
  console.error('AIVOS error:', msg);
  document.getElementById('generating-screen').classList.add('hidden');
  document.getElementById('questions-container').classList.remove('visible');
  document.getElementById('session-result').classList.add('hidden');
  document.getElementById('error-msg').textContent = normalized;
  document.getElementById('error-screen').classList.add('visible');
  const retryBtn = document.getElementById('retry-btn');
  if (retryBtn) retryBtn.focus();
}

function recordSessionAnswer(idx, selectedKey, isCorrect) {
  state.sessionHistory.answers[idx] = {
    question: idx + 1,
    selected: selectedKey,
    correct: isCorrect,
  };
  if (isCorrect) state.sessionHistory.correct += 1;
  else state.sessionHistory.wrong += 1;

  // Integrar com AIVOS 360 (Sistema completo)
  if (window.getAIVOS360 && state.generatedQuestions && state.generatedQuestions[idx]) {
    const aivos360 = window.getAIVOS360();
    if (aivos360 && aivos360.isReady()) {
      const q = state.generatedQuestions[idx];
      const startTime = state.questionStartTime || Date.now();
      const timeToAnswer = Date.now() - startTime;
      
      aivos360.processQuestionAnswer({
        questionId: q.id || `q_${idx}`,
        discipline: state.mode === 'concurso' ? (state.concurso?.label || 'Geral') : (state.topic || state.subject || 'Geral'),
        topic: state.topic || state.subject || 'Geral',
        difficulty: state.difficulty || 'medium',
        selected: selectedKey,
        correct: q.correctAnswer,
        isCorrect: isCorrect,
        timeToAnswer: timeToAnswer,
        statement: q.statement || ''
      }).catch(err => console.error('[AIVOS 360] Erro ao processar resposta:', err));
    }
  }
}

// Estado da navegação de questão única
let qNavState = { currentIdx: 0, selected: [], results: [] };

function renderQuestions(questions) {
  const container = document.getElementById('questions-container');
  const chips     = document.getElementById('summary-chips');
  const sessionResult = document.getElementById('session-result');
  const retryWrongBtn = document.getElementById('retry-wrong-btn');

  qNavState = {
    currentIdx: 0,
    selected: new Array(questions.length).fill(null),
    results:  new Array(questions.length).fill(null),
  };
  state.answerResults = qNavState.results;
  state.answered = 0; state.correct = 0;
  sessionResult.classList.add('hidden');
  retryWrongBtn.classList.add('hidden');
  updateScore();

  const bancaEfetiva = (state.bancaFoco && state.bancaFoco !== 'auto') ? state.bancaFoco : state.bancaInferida;
  const idiomaLabel = { 'pt-BR': 'Português (BR)', 'en': 'English (EN)', 'es': 'Español (ES)' };
  chips.innerHTML = `
    <div class="chip">${{easy:'<span class="dot" style="background:#437a22"></span> Fácil',medium:'<span class="dot" style="background:#D4A827"></span> Médio',hard:'<span class="dot" style="background:#c0392b"></span> Difícil',extreme:'<span class="dot" style="background:#8b0000"></span> Extremo'}[state.difficulty]}</div>
    <div class="chip">${questions.length} Questões</div>
    <div class="chip">${state.alternativas} alternativas</div>
    <div class="chip">${idiomaLabel[state.idioma] || state.idioma}</div>
    <div class="chip">${state.mode === 'academic' ? state.subject : state.concurso?.label || 'Livre'}</div>
    ${bancaEfetiva && bancaEfetiva !== 'A definir' ? `<div class="chip"><i data-lucide="landmark" width="13" height="13"></i> ${bancaEfetiva}</div>` : ''}`;

  retryWrongBtn.onclick = () => {
    const wrongQuestions = state.generatedQuestions.filter((_, idx) => qNavState.results[idx] === false);
    if (!wrongQuestions.length) return;
    state.generatedQuestions = wrongQuestions;
    state.answered = 0; state.correct = 0;
    state.sessionHistory = { answers: [], correct: 0, wrong: 0 };
    renderQuestions(wrongQuestions);
  };

  container.classList.add('visible');
  
  // Detectar viewport: desktop (>= 1024px) ou mobile (< 1024px)
  const isDesktop = window.innerWidth >= 1024;
  if (isDesktop) {
    renderAllQuestionsDesktop(questions);
  } else {
    renderSingleQuestion(questions, 0);
  }
  
  lucide.createIcons();
  scrollToWizard(100);
}

  // -- FASE 3: Renderiza badge de confianca sempre visivel --
  function renderTrustBadge(q) {
    var badge = q._qualityBadge || {
      confidence: 'Media',
      emoji: '🟡',
      score: '—',
      message: 'Sem validacao de fontes. Verifique o conteudo.'
    };
    var confMap = { 'Muito Alta': 'muito-alta', 'Alta': 'alta', 'Media': 'media', 'Média': 'media', 'Baixa': 'baixa' };
    var confClass = confMap[badge.confidence] || 'media';
    var sourcesCount = q._sources || badge.sources || 0;
    var antiH = q._antiHallucination || badge.antiHallucination || 'pending';
    var sourcesHtml = sourcesCount > 0
      ? '<span class="badge-sources"><i data-lucide="file-text" width="12" height="12"></i> ' + sourcesCount + ' fonte(s)</span>'
      : '';
    var antiHtml = '';
    if (antiH === 'verified') {
      antiHtml = '<span class="badge-verified"><i data-lucide="check-circle" width="12" height="12"></i> Verificado</span>';
    } else if (antiH === 'warning') {
      antiHtml = '<span class="badge-warnings"><i data-lucide="alert-triangle" width="12" height="12"></i> Revisao recomendada</span>';
    }
    var extraHtml = (sourcesHtml || antiHtml)
      ? '<div class="badge-extra">' + sourcesHtml + antiHtml + '</div>'
      : '';
    return '<div class="quality-badge confidence-' + confClass + '">' +
      '<span class="badge-emoji">' + badge.emoji + '</span>' +
      '<div class="badge-info">' +
        '<strong>Confianca ' + badge.confidence + '</strong>' +
        '<span class="badge-tooltip">' + (badge.message || '') + '</span>' +
        extraHtml +
      '</div>' +
      '<span class="badge-score">' + (badge.score || '—') + '</span>' +
    '</div>';
  }



function renderQuestionProof(q) {
  const proof = [];
  if (q.fonte) {
    proof.push(`<span class="proof-chip"><i data-lucide="book-open-check" width="12" height="12"></i> Fonte: <strong>${q.fonte}</strong></span>`);
  }
  const badge = q._qualityBadge;
  if (badge?.confidence) {
    proof.push(`<span class="proof-chip"><i data-lucide="shield-check" width="12" height="12"></i> Confiança: <strong>${badge.confidence}</strong>${badge.score ? ` · ${badge.score}` : ''}</span>`);
  }
  return proof.length ? `<div class="question-proof">${proof.join('')}</div>` : '';
}

function renderAllQuestionsDesktop(questions) {
  const list = document.getElementById('questions-list');
  const scoreTotal = document.getElementById('score-total');
  scoreTotal.textContent = questions.length;
  
  const letters = ['A','B','C','D','E'];
  
  // Renderizar todas as questões em HTML
  list.innerHTML = questions.map((q, idx) => {
    const hasAnswered = qNavState.results[idx] !== null;
    const selectedKey = qNavState.selected[idx];
    const total = questions.length;
    
    return `
      <div class="question-card" data-question-idx="${idx}">
        <div class="question-number">Questão ${idx + 1} de ${total}</div>
        <div class="question-statement">${q.statement}</div>
        <div class="options-list" id="qn-opts-${idx}">
          ${(q.options || []).map((opt, oIdx) => {
            const letter = opt.key;
            let cls = '';
            if (hasAnswered) {
              if (opt.key === q.correctAnswer) cls = ' correct';
              else if (opt.key === selectedKey && opt.key !== q.correctAnswer) cls = ' wrong';
            } else if (selectedKey === opt.key) {
              cls = ' selected';
            }
            return `<button class="option-btn${cls}" data-key="${opt.key}" data-question-idx="${idx}" ${hasAnswered ? 'disabled' : ''}>
              <span class="option-key">${letter}</span><span>${opt.text}</span>
            </button>`;
          }).join('')}
        </div>
        <button class="q-resolver-btn ${hasAnswered ? 'hidden' : ''}" id="q-resolver-${idx}" data-question-idx="${idx}" ${selectedKey ? '' : 'disabled'}>Resolver</button>
        ${renderTrustBadge(q)}
        <div class="explanation-box ${hasAnswered ? 'visible' : ''}" id="qn-exp-${idx}">
          <strong><i data-lucide="lightbulb" width="15" height="15"></i> Gabarito: ${q.correctAnswer}</strong><br>${q.explanation}
          ${renderQuestionProof(q)}
        </div>
      </div>`;
  }).join('');
  
  // Event listeners para todas as questões em desktop
  questions.forEach((q, idx) => {
    const opts = list.querySelectorAll(`[data-question-idx="${idx}"].option-btn`);
    const resBtn = document.getElementById(`q-resolver-${idx}`);
    
    // Seleção de alternativa
     if (!qNavState.results[idx]) {
       opts.forEach(btn => {
         btn.addEventListener('click', () => {
           if (state.answered >= state.generatedQuestions.length) return;
           const allOptsForQuestion = list.querySelectorAll(`[data-question-idx="${idx}"].option-btn`);
          allOptsForQuestion.forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          qNavState.selected[idx] = btn.dataset.key;
          if (resBtn) resBtn.disabled = false;
        });
      });
      
      if (resBtn) {
        resBtn.addEventListener('click', () => {
          const sKey = qNavState.selected[idx];
          if (!sKey) return;
          handleDesktopAnswer(questions, idx, sKey);
        });
      }
    }
  });
}

function handleDesktopAnswer(questions, idx, selectedKey) {
  const q = questions[idx];
  const isCorrect = selectedKey === q.correctAnswer;
  qNavState.results[idx] = isCorrect;
  state.answerResults[idx] = isCorrect;
  recordSessionAnswer(idx, selectedKey, isCorrect);
  if (isCorrect) state.correct++;
  state.answered++;
  incrementTodayCount(1);
  if (isCorrect) incrementCorrectToday(); else incrementWrongToday();
  updateScore();

  // Atualizar apenas a questão respondida
  const list = document.getElementById('questions-list');
  const opts = list.querySelectorAll(`[data-question-idx="${idx}"].option-btn`);
  opts.forEach(b => {
    b.disabled = true;
    b.classList.remove('selected');
    if (b.dataset.key === q.correctAnswer) b.classList.add('correct');
    else if (b.dataset.key === selectedKey && !isCorrect) b.classList.add('wrong');
  });
  
  const resBtn = document.getElementById(`q-resolver-${idx}`);
  if (resBtn) resBtn.classList.add('hidden');
  
  const expBox = document.getElementById(`qn-exp-${idx}`);
  if (expBox) expBox.classList.add('visible');

  if (isCorrect) confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 }, colors: ['#0D47FF','#00B8FF','#7C4DFF','#FF2D20','#FF6A00'] });
  
  if (state.answered === questions.length) {
    setTimeout(showSessionResult, 600);
  }
}


function renderSingleQuestion(questions, idx) {
  const q   = questions[idx];
  const list = document.getElementById('questions-list');
  const total = questions.length;
  const scoreTotal = document.getElementById('score-total');
  scoreTotal.textContent = total;

  const hasAnswered = qNavState.results[idx] !== null;
  const selectedKey = qNavState.selected[idx];
  const letters = ['A','B','C','D','E'];

  list.innerHTML = `
    <div class="question-card">
      <div class="question-number">Questão ${idx + 1} de ${total}</div>
      <div class="question-statement">${q.statement}</div>
      <div class="options-list" id="qn-opts">
        ${(q.options || []).map((opt, oIdx) => {
          const letter = opt.key;
          let cls = '';
          if (hasAnswered) {
            if (opt.key === q.correctAnswer) cls = ' correct';
            else if (opt.key === selectedKey && opt.key !== q.correctAnswer) cls = ' wrong';
          } else if (selectedKey === opt.key) {
            cls = ' selected';
          }
          return `<button class="option-btn${cls}" data-key="${opt.key}" ${hasAnswered ? 'disabled' : ''}>
            <span class="option-key">${letter}</span><span>${opt.text}</span>
          </button>`;
        }).join('')}
      </div>
      <button class="q-resolver-btn${hasAnswered || !selectedKey ? '' : ''} ${hasAnswered ? 'hidden' : ''}" id="q-resolver" ${selectedKey ? '' : 'disabled'}>Resolver</button>
      <div class="explanation-box ${hasAnswered ? 'visible' : ''}" id="qn-exp">
        <strong><i data-lucide="lightbulb" width="15" height="15"></i> Gabarito: ${q.correctAnswer}</strong><br>${q.explanation}
        ${renderQuestionProof(q)}
      </div>
      <div class="q-nav-bar">
        <button class="q-nav-btn" id="q-prev" ${idx === 0 ? 'disabled' : ''}>
          <i data-lucide="chevron-left" width="16" height="16"></i> Anterior
        </button>
        <span class="q-nav-status">${idx + 1} / ${total}</span>
        <button class="q-nav-btn" id="q-next">
          ${idx + 1 === total
            ? '<i data-lucide="flag" width="16" height="16"></i> Finalizar'
            : 'Próximo <i data-lucide="chevron-right" width="16" height="16"></i>'}
        </button>
      </div>
    </div>`;

  lucide.createIcons();

  // Seleção de alternativa
  if (!hasAnswered) {
    const opts   = list.querySelectorAll('.option-btn');
    const resBtn = document.getElementById('q-resolver');
     opts.forEach(btn => {
       btn.addEventListener('click', () => {
         if (state.answered >= state.generatedQuestions.length) return;
         opts.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        qNavState.selected[idx] = btn.dataset.key;
        resBtn.disabled = false;
      });
    });

    resBtn.addEventListener('click', () => {
      const sKey = qNavState.selected[idx];
      if (!sKey) return;
      handleSingleAnswer(questions, idx, sKey);
    });
  }

  // Navegação
  document.getElementById('q-prev').addEventListener('click', () => {
    if (idx > 0) { qNavState.currentIdx = idx - 1; renderSingleQuestion(questions, idx - 1); scrollToWizard(0); }
  });
  document.getElementById('q-next').addEventListener('click', () => {
    if (idx + 1 < total) { qNavState.currentIdx = idx + 1; renderSingleQuestion(questions, idx + 1); scrollToWizard(0); }
    else showSessionResult();
  });
}

function handleSingleAnswer(questions, idx, selectedKey) {
  const q = questions[idx];
  const isCorrect = selectedKey === q.correctAnswer;
  qNavState.results[idx] = isCorrect;
  state.answerResults[idx] = isCorrect;
  recordSessionAnswer(idx, selectedKey, isCorrect);
  if (isCorrect) state.correct++;
  state.answered++;
  incrementTodayCount(1);
  if (isCorrect) incrementCorrectToday(); else incrementWrongToday();
  updateScore();

  // Atualiza UI sem re-renderizar o card inteiro
  const list = document.getElementById('questions-list');
  const opts = list.querySelectorAll('.option-btn');
  opts.forEach(b => {
    b.disabled = true;
    b.classList.remove('selected');
    if (b.dataset.key === q.correctAnswer) b.classList.add('correct');
    else if (b.dataset.key === selectedKey && !isCorrect) b.classList.add('wrong');
  });
  const resBtn = document.getElementById('q-resolver');
  if (resBtn) resBtn.classList.add('hidden');
  const expBox = document.getElementById('qn-exp');
  if (expBox) expBox.classList.add('visible');

  if (isCorrect) confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 }, colors: ['#0D47FF','#00B8FF','#7C4DFF','#FF2D20','#FF6A00'] });
  if (state.answered === questions.length) {
    setTimeout(showSessionResult, 600);
  }
}

function showSessionResult() {
  const resultBox = document.getElementById('session-result');
  const stats = document.getElementById('session-stats');
  const summary = document.getElementById('session-summary');
  const history = document.getElementById('session-history');
  const retryWrongBtn = document.getElementById('retry-wrong-btn');
  const total = state.generatedQuestions.length;
  const correct = state.correct;
  const wrong = total - correct;
  const percent = total ? Math.round((correct / total) * 100) : 0;
  stats.textContent = `Você respondeu ${total} questões.`;
  summary.innerHTML = `Acertos: <strong>${correct}</strong> · Erros: <strong>${wrong}</strong> · Rendimento: <strong>${percent}%</strong>`;
  const answerHistory = state.sessionHistory.answers.filter(Boolean);
  history.innerHTML = answerHistory.map(answer => {
    const icon = answer.correct ? '✔️' : '❌';
    const label = answer.correct ? 'Acerto' : 'Erro';
    return `<span role="listitem" class="session-history-item ${answer.correct ? 'correct' : 'wrong'}">${icon} Q${answer.question}: ${label}</span>`;
  }).join('');
  if (!answerHistory.length) {
    history.innerHTML = '<span style="color: var(--color-text-muted);">Nenhuma questão registrada no histórico.</span>';
  }
  if (wrong > 0) retryWrongBtn.classList.remove('hidden');
  else retryWrongBtn.classList.add('hidden');
  resultBox.classList.remove('hidden');
  const sessionNewBtn = document.getElementById('session-new-btn');
  if (sessionNewBtn) sessionNewBtn.focus();
}

function updateScore() {
  const fill = document.getElementById('score-fill');
  const value = document.getElementById('score-value');
  const total = state.generatedQuestions.length;
  const progress = total > 0 ? (state.answered / total) * 100 : 0;
  fill.style.width = `${progress}%`;
  value.innerHTML = `${state.answered}/<span id="score-total">${total}</span>`;
}

// ── Quiz Fullscreen ──────────────────────────────────────────────────────────
const qfOverlay   = document.getElementById('quiz-fullscreen');
const qfBody      = document.getElementById('qf-body');
const qfSubLabel  = document.getElementById('qf-subject-label');
const qfProgFill  = document.getElementById('qf-progress-fill');
const qfCorrectEl = document.getElementById('qf-correct');
const qfWrongEl   = document.getElementById('qf-wrong');
let qfState = { questions: [], answered: 0, correct: 0, wrong: 0, results: [], selected: [] };
function openFullscreen() {
  const qs = state.generatedQuestions;
  if (!qs || !qs.length) return;
  qfState = { questions: [...qs], answered: 0, correct: 0, wrong: 0, results: new Array(qs.length).fill(null), selected: new Array(qs.length).fill(null) };
  qfSubLabel.textContent = state.mode === 'academic' ? (state.topic || state.subject || '') : (state.concurso?.label || 'Livre');
  qfBody.innerHTML = '';
  
  // Verificar breakpoint para definir modo
  const isDesktop = window.innerWidth >= 1024;
  
  if (isDesktop) {
    // Modo Desktop: renderizar todas as questões em scroll
    renderAllQFQuestions();
    // Não mostrar bottom bar em desktop
    document.getElementById('qf-bottom-bar').style.display = 'none';
  } else {
    // Modo Mobile: renderizar questão única
    document.getElementById('qf-bottom-bar').style.display = 'flex';
    renderQFQuestion(0);
  }
  
  qfOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  lucide.createIcons();
}
function closeFullscreen() {
  qfOverlay.classList.remove('active');
  document.body.style.overflow = '';
}
function renderAllQFQuestions() {
  // Modo Desktop: renderizar todas as questões em scroll
  qfBody.innerHTML = '';
  
  qfState.questions.forEach((q, idx) => {
    const wrap = createQFQuestionElement(q, idx);
    qfBody.appendChild(wrap);
    attachQFQuestionEventListeners(wrap, idx);
  });
  
  // Scroll para o topo
  qfBody.scrollTop = 0;
  lucide.createIcons();
}

function createQFQuestionElement(q, idx) {
  const bancaEfetiva = (state.bancaFoco && state.bancaFoco !== 'auto') ? state.bancaFoco : state.bancaInferida;
  const difLabel = {easy:'Fácil', medium:'Médio', hard:'Difícil', extreme:'Extremo'}[state.difficulty];
  const topicLabel = state.topic || state.subject || 'Geral';
  
  const letters = ['A', 'B', 'C', 'D', 'E'];
  const hasAnswered = qfState.results[idx] !== null;
  const selectedKey = qfState.selected[idx];

  const wrap = document.createElement('div');
  wrap.className = 'qf-question-wrap';
  wrap.id = `qf-wrap-${idx}`;
  
  wrap.innerHTML = `
    <div class="qf-metadata">
      <span><strong>Banca:</strong> ${bancaEfetiva || 'Não especificada'}</span>
      <span>•</span>
      <span><strong>Dificuldade:</strong> ${difLabel || 'Variada'}</span>
      <span>•</span>
      <span><strong>Assunto:</strong> ${topicLabel}</span>
    </div>
    <div class="qf-question-text">${q.statement}</div>
    <div class="qf-options" id="qf-opts-${idx}">
      ${(q.options || []).map((opt, oIdx) => {
        const letter = opt.key;
        let extClass = '';
        if (hasAnswered) {
          if (opt.key === q.correctAnswer) extClass = ' correct';
          else if (opt.key === selectedKey && opt.key !== q.correctAnswer) extClass = ' wrong';
        } else if (selectedKey === opt.key) {
          extClass = ' selected';
        }
        return `
        <button class="qf-option${extClass}" data-key="${opt.key}" data-question-idx="${idx}" ${hasAnswered ? 'disabled' : ''}>
          <span class="qf-option-letter">${letter}</span>
          <span>${opt.text}</span>
        </button>`;
      }).join('')}
    </div>
    <button class="qf-resolver-btn ${hasAnswered ? 'hidden' : ''}" id="qf-res-${idx}" data-question-idx="${idx}" ${selectedKey ? '' : 'disabled'}>Resolver</button>
    ${renderTrustBadge(q)}
    <div class="qf-explanation ${hasAnswered ? 'visible' : ''}" id="qf-exp-${idx}">
      <strong><i data-lucide="check-circle" width="16" height="16"></i> Gabarito: ${q.correctAnswer}</strong><br>${q.explanation}
      ${renderQuestionProof(q)}
    </div>`;
  
  return wrap;
}

function attachQFQuestionEventListeners(wrap, idx) {
  const q = qfState.questions[idx];
  const hasAnswered = qfState.results[idx] !== null;
  
  if (!hasAnswered) {
    const opts = wrap.querySelectorAll('.qf-option');
    const resBtn = wrap.querySelector('.qf-resolver-btn');
    
    opts.forEach(btn => {
      btn.addEventListener('click', () => {
        if (qfState.results[idx] !== null) return;
        opts.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        qfState.selected[idx] = btn.dataset.key;
        if (resBtn) resBtn.disabled = false;
      });
    });

    if (resBtn) {
      resBtn.addEventListener('click', () => {
        const sKey = qfState.selected[idx];
        if (!sKey) return;
        const correct = sKey === q.correctAnswer;
        qfState.results[idx] = correct;
        qfState.answered++;
        if (correct) { qfState.correct++; incrementCorrectToday(); } else { qfState.wrong++; incrementWrongToday(); }
        incrementTodayCount(1);
        
        opts.forEach(b => {
          b.disabled = true;
          b.classList.remove('selected');
          if (b.dataset.key === q.correctAnswer) b.classList.add('correct');
          else if (b.dataset.key === sKey && !correct) b.classList.add('wrong');
        });
        resBtn.classList.add('hidden');
        document.getElementById(`qf-exp-${idx}`).classList.add('visible');
        if (correct) confetti({ particleCount: 45, spread: 65, origin: { y: 0.7 }, colors: ['#0D47FF','#00B8FF','#7C4DFF','#FF2D20','#FF6A00'] });
        
        // Verificar se todas as questões foram respondidas
        if (qfState.answered === qfState.questions.length) {
          setTimeout(() => renderQFResultInline(), 800);
        }
        
        setTimeout(() => {
          const exp = document.getElementById(`qf-exp-${idx}`);
          if(exp) exp.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
      });
    }
  }
}

function renderQFResultInline() {
  // Renderizar resultado no final da página em modo desktop
  const total  = qfState.questions.length;
  const correct = qfState.correct;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  
  let iconHtml = '';
  if (pct >= 80) iconHtml = '<i data-lucide="award" width="64" height="64" style="color: var(--color-success)"></i>';
  else if (pct >= 60) iconHtml = '<i data-lucide="thumbs-up" width="64" height="64" style="color: var(--color-primary)"></i>';
  else if (pct >= 40) iconHtml = '<i data-lucide="book-open" width="64" height="64" style="color: var(--color-accent)"></i>';
  else iconHtml = '<i data-lucide="target" width="64" height="64" style="color: var(--color-error)"></i>';
  
  const msg   = pct >= 80 ? 'Excelente desempenho!' : pct >= 60 ? 'Bom trabalho!' : pct >= 40 ? 'Continue estudando!' : 'Não desista, pratique mais!';
  
  const resultCard = document.createElement('div');
  resultCard.className = 'qf-result-card';
  resultCard.id = 'qf-inline-result';
  resultCard.innerHTML = `
    <div class="qf-result-emoji">${iconHtml}</div>
    <h2 class="qf-result-title">${msg}</h2>
    <p class="qf-result-sub">Você completou ${total} questões nesta sessão.</p>
    <div class="qf-result-stats">
      <div class="qf-stat-box">
        <span class="qf-stat-value" style="color:var(--color-success)">${correct}</span>
        <span class="qf-stat-label">Acertos</span>
      </div>
      <div class="qf-stat-box">
        <span class="qf-stat-value" style="color:var(--color-error)">${total - correct}</span>
        <span class="qf-stat-label">Erros</span>
      </div>
      <div class="qf-stat-box">
        <span class="qf-stat-value" style="color:var(--color-primary)">${pct}%</span>
        <span class="qf-stat-label">Aproveitamento</span>
      </div>
    </div>
    <div class="qf-result-actions">
      <button class="qf-btn-primary btn-ripple" id="qf-retry-inline-btn">
        <i data-lucide="rotate-ccw" width="16" height="16"></i> Novo Quiz
      </button>
      <button class="qf-btn-ghost" id="qf-close-inline-btn">
        <i data-lucide="x" width="16" height="16"></i> Fechar Fullscreen
      </button>
    </div>`;
  
  qfBody.appendChild(resultCard);
  lucide.createIcons();
  confetti({ particleCount: 120, spread: 100, origin: { y: 0.6 }, colors: ['#0D47FF','#00B8FF','#7C4DFF','#FF2D20','#FF6A00','#16A34A'] });
  
  document.getElementById('qf-retry-inline-btn').addEventListener('click', () => { closeFullscreen(); document.getElementById('restart-btn').click(); });
  document.getElementById('qf-close-inline-btn').addEventListener('click', closeFullscreen);
  
  // Scroll para o resultado
  resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderQFQuestion(idx) {
  const q = qfState.questions[idx];
  if (!q) return renderQFResult();
  
  // Setup bottom bar
  const bb = document.getElementById('qf-bottom-bar');
  bb.style.display = 'flex';
  document.getElementById('qf-bb-status').textContent = `Questão ${idx + 1} de ${qfState.questions.length}`;
  
  const prevBtn = document.getElementById('qf-prev-btn');
  const nextBtn = document.getElementById('qf-next-btn');
  
  prevBtn.disabled = idx === 0;
  prevBtn.onclick = () => renderQFQuestion(idx - 1);
  
  nextBtn.disabled = false;
  if (idx + 1 >= qfState.questions.length) {
    nextBtn.innerHTML = 'Finalizar <i data-lucide="flag" width="16" height="16"></i>';
    nextBtn.onclick = () => renderQFResult();
  } else {
    nextBtn.innerHTML = 'Próximo <i data-lucide="chevron-right" width="16" height="16"></i>';
    nextBtn.onclick = () => renderQFQuestion(idx + 1);
  }

  const wrap = document.createElement('div');
  wrap.className = 'qf-question-wrap';
  
  // Metadata
  const bancaEfetiva = (state.bancaFoco && state.bancaFoco !== 'auto') ? state.bancaFoco : state.bancaInferida;
  const difLabel = {easy:'Fácil', medium:'Médio', hard:'Difícil', extreme:'Extremo'}[state.difficulty];
  const topicLabel = state.topic || state.subject || 'Geral';
  
  const letters = ['A', 'B', 'C', 'D', 'E'];
  const hasAnswered = qfState.results[idx] !== null;
  const selectedKey = qfState.selected[idx];

  wrap.innerHTML = `
    <div class="qf-metadata">
      <span><strong>Banca:</strong> ${bancaEfetiva || 'Não especificada'}</span>
      <span>•</span>
      <span><strong>Dificuldade:</strong> ${difLabel || 'Variada'}</span>
      <span>•</span>
      <span><strong>Assunto:</strong> ${topicLabel}</span>
    </div>
    <div class="qf-question-text">${q.statement}</div>
    <div class="qf-options" id="qf-opts-${idx}">
      ${(q.options || []).map((opt, oIdx) => {
        const letter = opt.key;
        let extClass = '';
        if (hasAnswered) {
          if (opt.key === q.correctAnswer) extClass = ' correct';
          else if (opt.key === selectedKey && opt.key !== q.correctAnswer) extClass = ' wrong';
        } else if (selectedKey === opt.key) {
          extClass = ' selected';
        }
        return `
        <button class="qf-option${extClass}" data-key="${opt.key}" ${hasAnswered ? 'disabled' : ''}>
          <span class="qf-option-letter">${letter}</span>
          <span>${opt.text}</span>
        </button>`;
      }).join('')}
    </div>
    <button class="qf-resolver-btn ${hasAnswered ? 'hidden' : ''}" id="qf-res-${idx}" ${selectedKey ? '' : 'disabled'}>Resolver</button>
    <div class="qf-explanation ${hasAnswered ? 'visible' : ''}" id="qf-exp-${idx}">
      <strong><i data-lucide="check-circle" width="16" height="16"></i> Gabarito: ${q.correctAnswer}</strong><br>${q.explanation}
      ${renderQuestionProof(q)}
    </div>`;
  qfBody.innerHTML = '';
  qfBody.appendChild(wrap);
  lucide.createIcons();

  if (!hasAnswered) {
    const opts = wrap.querySelectorAll('.qf-option');
    const resBtn = wrap.querySelector('.qf-resolver-btn');
    opts.forEach(btn => {
      btn.addEventListener('click', () => {
        if (qfState.results[idx] !== null) return;
        opts.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        qfState.selected[idx] = btn.dataset.key;
        if (resBtn) resBtn.disabled = false;
      });
    });

    if (resBtn) {
      resBtn.addEventListener('click', () => {
      const sKey = qfState.selected[idx];
      if (!sKey) return;
      const correct = sKey === q.correctAnswer;
      qfState.results[idx] = correct;
      qfState.answered++;
      if (correct) { qfState.correct++; incrementCorrectToday(); } else { qfState.wrong++; incrementWrongToday(); }
      incrementTodayCount(1);
      
      opts.forEach(b => {
        b.disabled = true;
        b.classList.remove('selected');
        if (b.dataset.key === q.correctAnswer) b.classList.add('correct');
        else if (b.dataset.key === sKey && !correct) b.classList.add('wrong');
      });
      resBtn.classList.add('hidden');
      document.getElementById(`qf-exp-${idx}`).classList.add('visible');
      if (correct) confetti({ particleCount: 45, spread: 65, origin: { y: 0.7 }, colors: ['#0D47FF','#00B8FF','#7C4DFF','#FF2D20','#FF6A00'] });
      
      setTimeout(() => {
        const exp = document.getElementById(`qf-exp-${idx}`);
        if(exp) exp.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    });
    }
  }
}
function renderQFResult() {
  document.getElementById('qf-bottom-bar').style.display = 'none';
  const total  = qfState.questions.length;
  const correct = qfState.correct;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  
  let iconHtml = '';
  if (pct >= 80) iconHtml = '<i data-lucide="award" width="64" height="64" style="color: var(--color-success)"></i>';
  else if (pct >= 60) iconHtml = '<i data-lucide="thumbs-up" width="64" height="64" style="color: var(--color-primary)"></i>';
  else if (pct >= 40) iconHtml = '<i data-lucide="book-open" width="64" height="64" style="color: var(--color-accent)"></i>';
  else iconHtml = '<i data-lucide="target" width="64" height="64" style="color: var(--color-error)"></i>';
  
  const msg   = pct >= 80 ? 'Excelente desempenho!' : pct >= 60 ? 'Bom trabalho!' : pct >= 40 ? 'Continue estudando!' : 'Não desista, pratique mais!';
  qfBody.innerHTML = `
    <div class="qf-result-card">
      <div class="qf-result-emoji">${iconHtml}</div>
      <h2 class="qf-result-title">${msg}</h2>
      <p class="qf-result-sub">Você completou ${total} questões nesta sessão.</p>
      <div class="qf-result-stats">
        <div class="qf-stat-box">
          <span class="qf-stat-value" style="color:var(--color-success)">${correct}</span>
          <span class="qf-stat-label">Acertos</span>
        </div>
        <div class="qf-stat-box">
          <span class="qf-stat-value" style="color:var(--color-error)">${total - correct}</span>
          <span class="qf-stat-label">Erros</span>
        </div>
        <div class="qf-stat-box">
          <span class="qf-stat-value" style="color:var(--color-primary)">${pct}%</span>
          <span class="qf-stat-label">Aproveitamento</span>
        </div>
      </div>
      <div class="qf-result-actions">
        <button class="qf-btn-primary btn-ripple" id="qf-retry-btn">
          <i data-lucide="rotate-ccw" width="16" height="16"></i> Novo Quiz
        </button>
        <button class="qf-btn-ghost" id="qf-close-btn">
          <i data-lucide="x" width="16" height="16"></i> Fechar Fullscreen
        </button>
      </div>
    </div>`;
  lucide.createIcons();
  confetti({ particleCount: 120, spread: 100, origin: { y: 0.6 }, colors: ['#0D47FF','#00B8FF','#7C4DFF','#FF2D20','#FF6A00','#16A34A'] });
  document.getElementById('qf-retry-btn').addEventListener('click', () => { closeFullscreen(); document.getElementById('restart-btn').click(); });
  document.getElementById('qf-close-btn').addEventListener('click', closeFullscreen);
}
// Modal de confirmação de saída
const qfExitModal = document.getElementById('qf-exit-modal-overlay');
function showExitModal() {
  qfExitModal.classList.add('active');
  lucide.createIcons();
}
function hideExitModal() {
  qfExitModal.classList.remove('active');
}
document.getElementById('qf-modal-continue').addEventListener('click', hideExitModal);
document.getElementById('qf-modal-leave').addEventListener('click', () => {
  hideExitModal();
  closeFullscreen();
  document.getElementById('restart-btn').click();
});
document.getElementById('qf-exit-btn').addEventListener('click', () => {
  // No mobile mostra modal; no desktop fecha direto
  if (window.innerWidth < 768) {
    showExitModal();
  } else {
    closeFullscreen();
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && qfOverlay.classList.contains('active')) {
  if (qfExitModal.classList.contains('active')) hideExitModal();
  else closeFullscreen();
}});

// Wire up fullscreen button após renderQuestions
const _origRenderQuestions = renderQuestions;
window.renderQuestions = function(questions) {
  _origRenderQuestions(questions);
  const fsBtn = document.getElementById('fullscreen-btn');
  if (fsBtn) {
    // Remove previous listeners se houver (por segurança)
    const newFsBtn = fsBtn.cloneNode(true);
    fsBtn.replaceWith(newFsBtn);
    newFsBtn.addEventListener('click', openFullscreen);
  }
};

function saveRedacaoStateLocally() {
  localStorage.setItem('sm_redacao_state', JSON.stringify(state.redacaoState));
}

function loadRedacaoStateLocally() {
  const saved = safeStorageGet('sm_redacao_state');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.sessionId) {
        state.redacaoState = parsed;
        console.log('RESTORE SESSION', state.redacaoState);
        console.log('RESTORE HISTORY LEN', state.redacaoState.history?.length);
        const container = document.getElementById('redacao-chat-messages');
        if (container) {
          container.innerHTML = '';

          (state.redacaoState.history || []).forEach(msg => {
            console.log('RENDERING MSG', msg.role, msg.content?.slice(0,50));
            renderRedacaoMessage(msg.role, msg.content);
          });
        }

        updateRedacaoSidebar();
      }
    } catch {}
  }
}

function renderRedacaoMessage(role, content) {
  console.log('[REDAÇÃO DEBUG] renderRedacaoMessage called', { role, contentLength: content?.length, contentPreview: content?.slice?.(0,50) });
  const container = document.getElementById('redacao-chat-messages');
  if (!container) {
    console.error('[REDAÇÃO DEBUG] Container redacao-chat-messages not found!');
    return;
  }
  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;
  div.innerHTML = formatMarkdownToHTML(content);
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  console.log('[REDAÇÃO DEBUG] Message rendered and scrolled');
}

function formatMarkdownToHTML(text) {
  if (!text) return '';
  let html = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*((?!\*)[^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/g, '<code style="background:var(--color-surface-offset);padding:1px 4px;border-radius:3px;font-family:monospace;">$1</code>');
  html = html.replace(/\n/g, '<br/>');
  return html;
}

function updateRedacaoSidebar() {
  const s = state.redacaoState;
  
  // Atualizar estágios
  const stages = ['thesis', 'argument1', 'argument2', 'conclusion', 'review'];
  let currentFound = false;
  let completedCount = 0;
  stages.forEach((stageId, idx) => {
    const el = document.getElementById(`rs-stage-${stageId}`);
    if (!el) return;
    el.className = 'rs-stage-item';
    el.innerHTML = '';
    
    const iconBase = `<i data-lucide="circle" width="14" height="14"></i>`;
    const iconActive = `<i data-lucide="circle-dot" width="14" height="14"></i>`;
    const iconDone = `<i data-lucide="check-circle-2" width="14" height="14"></i>`;
    
    let label = el.id.replace('rs-stage-', '');
    if (label === 'thesis') label = '1. Tese';
    if (label === 'argument1') label = '2. Argumento 1';
    if (label === 'argument2') label = '3. Argumento 2';
    if (label === 'conclusion') label = '4. Conclusão';
    if (label === 'review') label = '5. Revisão Final';

    if (s.stage === stageId) {
      el.classList.add('active');
      el.innerHTML = `${iconActive} ${label}`;
      currentFound = true;
    } else if (!currentFound) {
      el.classList.add('done');
      el.innerHTML = `${iconDone} ${label}`;
      completedCount++;
    } else {
      el.innerHTML = `${iconBase} ${label}`;
    }
  });
  
  // Se for "final", marcar todos como done
  if (s.stage === 'final') {
    const stageLabels = { thesis: '1. Tese', argument1: '2. Argumento 1', argument2: '3. Argumento 2', conclusion: '4. Conclus\u00e3o', review: '5. Revis\u00e3o Final' };
    stages.forEach(stageId => {
      const el = document.getElementById(`rs-stage-${stageId}`);
      if (el) {
        el.className = 'rs-stage-item done';
        el.innerHTML = `<i data-lucide="check-circle-2" width="14" height="14"></i> ${stageLabels[stageId]}`;
      }
    });
    completedCount = 5;
  }
  
  // Atualizar barra de progresso
  const progressPercent = Math.round((completedCount / 5) * 100);
  document.getElementById('rs-progress-fill').style.width = `${progressPercent}%`;
  document.getElementById('rs-progress-text').textContent = `${completedCount}/5 etapas`;
  document.getElementById('rs-progress-percent').textContent = `${progressPercent}%`;
  
  lucide.createIcons();
  
  // Atualizar notas
  document.getElementById('rs-score-c1').textContent = s.scores.c1 || 0;
  document.getElementById('rs-score-c2').textContent = s.scores.c2 || 0;
  document.getElementById('rs-score-c3').textContent = s.scores.c3 || 0;
  document.getElementById('rs-score-c4').textContent = s.scores.c4 || 0;
  document.getElementById('rs-score-c5').textContent = s.scores.c5 || 0;
  
  const total = (s.scores.c1||0) + (s.scores.c2||0) + (s.scores.c3||0) + (s.scores.c4||0) + (s.scores.c5||0);
  document.getElementById('rs-score-total').textContent = total;
}

async function loadRedacaoHistory() {
  const historyList = document.getElementById('rs-history-list');
  const emptyMsg = document.getElementById('rs-history-empty');
  
  if (!window.digitalTwin || !window.digitalTwin.isInitialized) {
    console.log('[REDAÇÃO DEBUG] DigitalTwin not initialized, skipping history load');
    return;
  }
  
  try {
    const profile = window.digitalTwin.getProfile();
    const essays = profile?.performance?.essays?.history || [];
    
    if (essays.length === 0) {
      emptyMsg.style.display = 'block';
      return;
    }
    
    emptyMsg.style.display = 'none';
    historyList.innerHTML = '';
    
    // Ordenar por data (mais recente primeiro)
    const sortedEssays = [...essays].sort((a, b) => b.timestamp - a.timestamp);
    
    sortedEssays.forEach(essay => {
      const totalScore = (essay.scores?.c1 || 0) + (essay.scores?.c2 || 0) + (essay.scores?.c3 || 0) + (essay.scores?.c4 || 0) + (essay.scores?.c5 || 0);
      const date = new Date(essay.timestamp).toLocaleDateString('pt-BR');
      
      const item = document.createElement('div');
      item.className = 'rs-history-item';
      item.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="rs-history-date">${date}</span>
          <span class="rs-history-score">${totalScore}/1000</span>
        </div>
        <div class="rs-history-banca">${essay.banca || 'ENEM'}</div>
      `;
      
      item.addEventListener('click', () => {
        // TODO: Implementar visualização detalhada da redação
        console.log('[REDAÇÃO DEBUG] Clicked on essay:', essay.id);
      });
      
      historyList.appendChild(item);
    });
    
    console.log('[REDAÇÃO DEBUG] History loaded:', essays.length, 'essays');
  } catch (error) {
    console.error('[REDAÇÃO DEBUG] Error loading history:', error);
  }
}

async function loadCompetencyEvolution() {
  const chartContainer = document.getElementById('rs-competency-chart');
  const emptyMsg = document.getElementById('rs-competency-empty');
  
  if (!window.digitalTwin || !window.digitalTwin.isInitialized) {
    console.log('[REDAÇÃO DEBUG] DigitalTwin not initialized, skipping competency evolution load');
    return;
  }
  
  try {
    const profile = window.digitalTwin.getProfile();
    const essays = profile?.performance?.essays?.history || [];
    
    if (essays.length === 0) {
      emptyMsg.style.display = 'block';
      return;
    }
    
    emptyMsg.style.display = 'none';
    chartContainer.innerHTML = '';
    
    // Calcular média por competência
    const competencies = ['c1', 'c2', 'c3', 'c4', 'c5'];
    const competencyLabels = { c1: 'C1', c2: 'C2', c3: 'C3', c4: 'C4', c5: 'C5' };
    const averages = {};
    
    competencies.forEach(comp => {
      const sum = essays.reduce((acc, essay) => acc + (essay.scores?.[comp] || 0), 0);
      averages[comp] = Math.round(sum / essays.length);
    });
    
    // Criar barras para cada competência
    competencies.forEach(comp => {
      const value = averages[comp];
      const percent = (value / 200) * 100;
      
      const row = document.createElement('div');
      row.className = 'rs-competency-row';
      row.innerHTML = `
        <span class="rs-competency-label">${competencyLabels[comp]}</span>
        <div class="rs-competency-bar">
          <div class="rs-competency-fill ${comp}" style="width: ${percent}%"></div>
        </div>
        <span class="rs-competency-value">${value}</span>
      `;
      
      chartContainer.appendChild(row);
    });
    
    console.log('[REDAÇÃO DEBUG] Competency evolution loaded:', averages);
  } catch (error) {
    console.error('[REDAÇÃO DEBUG] Error loading competency evolution:', error);
  }
}

async function loadImprovementPlan() {
  const planContainer = document.getElementById('rs-improvement-plan');
  const emptyMsg = document.getElementById('rs-improvement-empty');
  
  if (!window.digitalTwin || !window.digitalTwin.isInitialized) {
    console.log('[REDAÇÃO DEBUG] DigitalTwin not initialized, skipping improvement plan load');
    return;
  }
  
  try {
    const profile = window.digitalTwin.getProfile();
    const essays = profile?.performance?.essays?.history || [];
    
    if (essays.length === 0) {
      emptyMsg.style.display = 'block';
      return;
    }
    
    emptyMsg.style.display = 'none';
    planContainer.innerHTML = '';
    
    // Calcular média por competência
    const competencies = ['c1', 'c2', 'c3', 'c4', 'c5'];
    const competencyNames = { c1: 'Linguagem Culta', c2: 'Tema', c3: 'Argumentação', c4: 'Coesão', c5: 'Intervenção Social' };
    const averages = {};
    
    competencies.forEach(comp => {
      const sum = essays.reduce((acc, essay) => acc + (essay.scores?.[comp] || 0), 0);
      averages[comp] = Math.round(sum / essays.length);
    });
    
    // Identificar competências mais fracas
    const sortedCompetencies = Object.entries(averages).sort((a, b) => a[1] - b[1]);
    const recommendations = [];
    
    // Gerar recomendações baseadas nas competências mais fracas
    if (sortedCompetencies[0][1] < 120) {
      recommendations.push({
        priority: 'high',
        text: `Foque em ${competencyNames[sortedCompetencies[0][0]]} - sua média é ${sortedCompetencies[0][1]}/200`
      });
    }
    
    if (sortedCompetencies[1] && sortedCompetencies[1][1] < 140) {
      recommendations.push({
        priority: 'medium',
        text: `Melhore ${competencyNames[sortedCompetencies[1][0]]} - sua média é ${sortedCompetencies[1][1]}/200`
      });
    }
    
    // Adicionar recomendação geral
    const totalAverage = Object.values(averages).reduce((a, b) => a + b, 0) / 5;
    if (totalAverage < 150) {
      recommendations.push({
        priority: 'high',
        text: `Sua nota média é ${Math.round(totalAverage)}/200 - pratique mais redações completas`
      });
    } else if (totalAverage < 170) {
      recommendations.push({
        priority: 'medium',
        text: `Sua nota média é ${Math.round(totalAverage)}/200 - continue praticando`
      });
    } else {
      recommendations.push({
        priority: 'low',
        text: `Sua nota média é ${Math.round(totalAverage)}/200 - ótimo desempenho!`
      });
    }
    
    // Renderizar recomendações
    recommendations.forEach(rec => {
      const item = document.createElement('div');
      item.className = 'rs-improvement-item';
      item.innerHTML = `
        <div class="rs-improvement-priority ${rec.priority}">${rec.priority === 'high' ? 'Alta Prioridade' : rec.priority === 'medium' ? 'Média Prioridade' : 'Dica'}</div>
        <div class="rs-improvement-text">${rec.text}</div>
      `;
      planContainer.appendChild(item);
    });
    
    console.log('[REDAÇÃO DEBUG] Improvement plan loaded:', recommendations);
  } catch (error) {
    console.error('[REDAÇÃO DEBUG] Error loading improvement plan:', error);
  }
}

async function loadEssayGoals() {
  const goalsContainer = document.getElementById('rs-goals-container');
  const emptyMsg = document.getElementById('rs-goals-empty');
  
  // Carregar metas do localStorage
  const goals = JSON.parse(localStorage.getItem('sm_redacao_goals') || '[]');
  
  if (goals.length === 0) {
    emptyMsg.style.display = 'block';
    return;
  }
  
  emptyMsg.style.display = 'none';
  goalsContainer.innerHTML = '';
  
  // Calcular nota média atual
  let currentAverage = 0;
  if (window.digitalTwin && window.digitalTwin.isInitialized) {
    const profile = window.digitalTwin.getProfile();
    const essays = profile?.performance?.essays?.history || [];
    if (essays.length > 0) {
      const totalScore = essays.reduce((acc, essay) => {
        return acc + (essay.scores?.c1 || 0) + (essay.scores?.c2 || 0) + (essay.scores?.c3 || 0) + (essay.scores?.c4 || 0) + (essay.scores?.c5 || 0);
      }, 0);
      currentAverage = Math.round(totalScore / essays.length);
    }
  }
  
  // Renderizar metas
  goals.forEach(goal => {
    const progress = Math.min(100, Math.round((currentAverage / goal.target) * 100));
    const daysRemaining = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
    
    const item = document.createElement('div');
    item.className = 'rs-goal-item';
    item.innerHTML = `
      <div class="rs-goal-header">
        <span class="rs-goal-title">${goal.title}</span>
        <span class="rs-goal-target">${goal.target}/1000</span>
      </div>
      <div class="rs-goal-progress">
        <div class="rs-goal-progress-fill" style="width: ${progress}%"></div>
      </div>
      <div class="rs-goal-deadline">${daysRemaining > 0 ? `${daysRemaining} dias restantes` : 'Prazo encerrado'}</div>
    `;
    
    goalsContainer.appendChild(item);
  });
  
  console.log('[REDAÇÃO DEBUG] Essay goals loaded:', goals.length, 'goals');
}

function addEssayGoal() {
  const targetScore = prompt('Qual nota você quer atingir? (0-1000)');
  if (!targetScore) return;
  
  const score = parseInt(targetScore);
  if (isNaN(score) || score < 0 || score > 1000) {
    alert('Nota inválida. Digite um valor entre 0 e 1000.');
    return;
  }
  
  const deadlineDays = prompt('Em quantos dias você quer atingir essa meta?');
  if (!deadlineDays) return;
  
  const days = parseInt(deadlineDays);
  if (isNaN(days) || days < 1) {
    alert('Prazo inválido. Digite um número positivo de dias.');
    return;
  }
  
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + days);
  
  const goals = JSON.parse(localStorage.getItem('sm_redacao_goals') || '[]');
  goals.push({
    id: Date.now(),
    title: `Atingir nota ${score}`,
    target: score,
    deadline: deadline.toISOString(),
    createdAt: new Date().toISOString()
  });
  
  localStorage.setItem('sm_redacao_goals', JSON.stringify(goals));
  loadEssayGoals();
  lucide.createIcons();
}

async function handleRedacaoSend(forceMessage = null) {
  console.log('[REDAÇÃO DEBUG] handleRedacaoSend called', { forceMessage, mode: state.mode });
  const inputEl = document.getElementById('redacao-chat-input');
  const btn = document.getElementById('redacao-chat-send');
  let msg = forceMessage || inputEl.value.trim();
  
  if (!msg) return;
  
  inputEl.value = '';
  inputEl.disabled = true;
  btn.disabled = true;
  
  // Append user message to local history BEFORE building payload
  state.redacaoState.history.push({ role: 'user', content: msg }); console.log('[REDAÇÃO DEBUG] HISTORY USER', state.redacaoState.history.length);
  renderRedacaoMessage('user', msg);
  
  const payload = {
    mode: 'redacao',
    sessionState: JSON.parse(JSON.stringify(state.redacaoState)) // deep clone, no live ref
  };
  
  const container = document.getElementById('redacao-chat-messages');
  const loadDiv = document.createElement('div');
  loadDiv.className = 'chat-msg coach';
  loadDiv.id = 'redacao-loading';
  loadDiv.innerHTML = '<span class="spinner" style="width:16px;height:16px;display:inline-block;border-width:2px;border-top-color:var(--color-primary);"></span> <span style="font-size:12px;opacity:0.7">Analisando...</span>';
  container.appendChild(loadDiv);
  container.scrollTop = container.scrollHeight;

  try {
    console.log('[REDAÇÃO DEBUG] Sending request to worker', payload);
    const res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    console.log('[REDAÇÃO DEBUG] Response received from AI', data);
    
    const loadEl = document.getElementById('redacao-loading');
    if (loadEl) loadEl.remove();
    
    if (!res.ok) throw new Error(data.userMessage || `Erro HTTP ${res.status}`);
    if (!data.reply || !data.state) throw new Error('Resposta malformada do servidor.');
    
    // Update state from response
    if (data.state.stage) state.redacaoState.stage = data.state.stage;
    if (data.state.scores) state.redacaoState.scores = data.state.scores;
    if (data.state.summary) state.redacaoState.summary = data.state.summary;
    state.redacaoState.history.push({ role: 'assistant', content: data.reply }); console.log('[REDAÇÃO DEBUG] HISTORY ASSISTANT', state.redacaoState.history.length);
    console.log('[REDAÇÃO DEBUG] Updated redacaoState', state.redacaoState);
    
    saveRedacaoStateLocally();
    renderRedacaoMessage('coach', data.reply);
    updateRedacaoSidebar();
    
  } catch (err) {
    const loadEl = document.getElementById('redacao-loading');
    if (loadEl) loadEl.remove();
    // Rollback the user message on error
    state.redacaoState.history.pop();
    renderRedacaoMessage('coach', '\u26a0\ufe0f Erro: ' + err.message);
  } finally {
    inputEl.disabled = false;
    btn.disabled = false;
    inputEl.focus();
  }
}

function startRedacaoSession() {
  console.log('[REDAÇÃO DEBUG] startRedacaoSession called', JSON.parse(JSON.stringify(state.redacaoState)));
  document.getElementById('generating-screen').classList.add('hidden');
  document.getElementById('error-screen').classList.remove('visible');
  document.getElementById('questions-container').classList.remove('visible');

  const chatWrapper = document.getElementById('redacao-chat-wrapper');
  if (!chatWrapper) {
    console.error('[REDAÇÃO DEBUG] Chat wrapper not found!');
    return;
  }
  chatWrapper.classList.remove('hidden');
  console.log('[REDAÇÃO DEBUG] Chat wrapper shown');

  // Load persisted session; state.redacaoState.banca was set in renderStep2Redacao — already in state
  loadRedacaoStateLocally();

  if (!state.redacaoState.sessionId) {
    state.redacaoState.sessionId = crypto.randomUUID();
    console.log('[REDAÇÃO DEBUG] Created new session', state.redacaoState.sessionId);
    // banca comes from state set by renderStep2Redacao select listener; default ENEM if missing
    if (!state.redacaoState.banca) state.redacaoState.banca = 'ENEM';
    saveRedacaoStateLocally();
  }

  console.log('[REDAÇÃO DEBUG] HISTORY LEN BEFORE RENDER', state.redacaoState.history.length);
  if (state.redacaoState.history.length === 0) {
    const banca = state.redacaoState.banca || 'ENEM';
    const initialMsg = `Ol\u00e1! Sou seu **Coach de Reda\u00e7\u00e3o** para o **${banca}**.\n\nComo quer come\u00e7ar?\n\u2022 Me diga o **tema** e te guio etapa por etapa (tese \u2192 argumentos \u2192 conclus\u00e3o).\n\u2022 Ou cole uma **reda\u00e7\u00e3o completa** para corre\u00e7\u00e3o imediata com notas C1\u2013C5.`;
    renderRedacaoMessage('coach', initialMsg);
    state.redacaoState.history.push({ role: 'assistant', content: initialMsg });
    saveRedacaoStateLocally();
    console.log('[REDAÇÃO DEBUG] Initial message sent and saved');
  } else {
    console.log('[REDAÇÃO DEBUG] Restoring history from localStorage', state.redacaoState.history.length, 'messages');
    state.redacaoState.history.forEach(m => {
      renderRedacaoMessage(m.role === 'user' ? 'user' : 'coach', m.content);
    });
    console.log('[REDAÇÃO DEBUG] History restored');
  }

  updateRedacaoSidebar();
  loadRedacaoHistory();
  loadCompetencyEvolution();
  loadImprovementPlan();
  loadEssayGoals();
  lucide.createIcons();
  console.log('[REDAÇÃO DEBUG] startRedacaoSession completed');

  // Attach listeners — replace element clones to avoid duplicate handlers
  const sendBtn = document.getElementById('redacao-chat-send');
  const newSendBtn = sendBtn.cloneNode(true);
  sendBtn.replaceWith(newSendBtn);
  newSendBtn.addEventListener('click', () => handleRedacaoSend());

  const inputEl = document.getElementById('redacao-chat-input');
  const newInput = inputEl.cloneNode(true);
  inputEl.replaceWith(newInput);
  newInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleRedacaoSend(); }
  });

  const finishBtn = document.getElementById('rs-finish-btn');
  const newFinishBtn = finishBtn.cloneNode(true);
  finishBtn.replaceWith(newFinishBtn);
  newFinishBtn.addEventListener('click', async () => {
    if (confirm('Gerar avalia\u00e7\u00e3o completa e reda\u00e7\u00e3o nota 1000?')) {
      await handleRedacaoSend('FINALIZAR REDA\u00c7\u00c3O E GERAR AVALIA\u00c7\u00c3O COMPLETA COM REESCRITA NOTA 1000');
      
      // Após finalizar, registrar no DigitalTwin
      if (window.digitalTwin && state.redacaoState.stage === 'final') {
        const essayText = state.redacaoState.history
          .filter(m => m.role === 'user')
          .map(m => m.content)
          .join('\n\n');
        
        await window.digitalTwin.recordEssay({
          text: essayText,
          scores: state.redacaoState.scores,
          banca: state.redacaoState.banca,
          feedback: state.redacaoState.summary || '',
          stage: state.redacaoState.stage,
          summary: state.redacaoState.summary || ''
        });
        
        console.log('[REDAÇÃO DEBUG] Essay recorded in DigitalTwin');
      }
    }
  });

  const addGoalBtn = document.getElementById('rs-add-goal-btn');
  const newAddGoalBtn = addGoalBtn.cloneNode(true);
  addGoalBtn.replaceWith(newAddGoalBtn);
  newAddGoalBtn.addEventListener('click', addEssayGoal);
}

document.addEventListener('DOMContentLoaded', init);

// Handle responsiveness: reinitialize normal questions view on resize
let questionsResizeTimer;
let lastViewportMode = window.innerWidth >= 1024 ? 'desktop' : 'mobile';

window.addEventListener('resize', () => {
  // Verificar se estamos na tela de questões
  const qContainer = document.getElementById('questions-container');
  if (!qContainer || !qContainer.classList.contains('visible')) {
    // Se não está visível, apenas fazer o resize check do fullscreen
    if (!qfOverlay.classList.contains('active')) return;
  }
  
  clearTimeout(questionsResizeTimer);
  questionsResizeTimer = setTimeout(() => {
    const isDesktop = window.innerWidth >= 1024;
    const currentMode = isDesktop ? 'desktop' : 'mobile';
    
    // Só re-renderizar se o modo mudou E as questões estão visíveis
    if (qContainer && qContainer.classList.contains('visible') && currentMode !== lastViewportMode) {
      lastViewportMode = currentMode;
      
       if (isDesktop) {
         // Mobile -> Desktop: renderizar todas as questões
         renderAllQuestionsDesktop(state.generatedQuestions);
       } else {
         // Desktop -> Mobile: renderizar questão única
         qNavState.current = 0;
         qNavState.visited.clear();
         renderSingleQuestion(state.generatedQuestions, 0);
       }
      lucide.createIcons();
    }
    
    // Also handle fullscreen resize
    if (!qfOverlay.classList.contains('active')) return;
    
    const hasResult = document.getElementById('qf-inline-result');
    
    // Se não há resultado (ainda respondendo) e mudou o modo
    if (!hasResult) {
      if (isDesktop && !document.querySelector('.qf-question-wrap:nth-child(2)')) {
        // Mobile -> Desktop: renderizar todas as questões
        renderAllQFQuestions();
        document.getElementById('qf-bottom-bar').style.display = 'none';
      } else if (!isDesktop && document.querySelectorAll('.qf-question-wrap').length > 1) {
        // Desktop -> Mobile: renderizar questão única
        renderQFQuestion(qfState.answered);
        document.getElementById('qf-bottom-bar').style.display = 'flex';
      }
    }
  }, 250);
});

