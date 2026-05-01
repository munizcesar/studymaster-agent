#!/usr/bin/env python3
"""
StudyMaster - Pipeline de Indexacao Saude no Cloudflare Vectorize

Cobre:
  - Anatomia e Fisiologia Humana
  - Farmacologia
  - Microbiologia e Parasitologia
  - Enfermagem
  - SUS (Lei 8.080/90 e Lei 8.142/90)
  - Bioquimica Clinica
  - Saude Publica e Epidemiologia

Uso:
  1. Configure CLOUDFLARE_ACCOUNT_ID e CLOUDFLARE_API_TOKEN
  2. Execute: python scripts/indexar-saude.py
"""

import os
import json
import time
import hashlib
import requests

ACCOUNT_ID = os.environ.get("CLOUDFLARE_ACCOUNT_ID", "")
API_TOKEN  = os.environ.get("CLOUDFLARE_API_TOKEN", "")
INDEX_NAME = "studymaster-knowledge"

CONTEUDOS_SAUDE = [

  # ANATOMIA E FISIOLOGIA
  {"id": "sau-ana-01", "area": "Saude", "disciplina": "Anatomia",
   "texto": "Saude Anatomia - Sistema Cardiovascular: coracao (4 camaras: atrio direito, atrio esquerdo, ventriculo direito, ventriculo esquerdo), valvas (mitral, tricuspide, aortica, pulmonar), ciclo cardiaco, debito cardiaco, pressao arterial (sistolica e diastolica), circulacao pulmonar e sistemica, arteria aorta, veia cava superior e inferior. ECG basico."},
  {"id": "sau-ana-02", "area": "Saude", "disciplina": "Anatomia",
   "texto": "Saude Anatomia - Sistema Respiratorio: vias aereas superiores (nariz, faringe, laringe, traqueia) e inferiores (bronquios, bronquiolos, alveolos), pulmoes (lobo superior, medio, inferior), pleura, diafragma, mecanica respiratoria (inspiracao e expiracao), trocas gasosas (hematose), volumes pulmonares (VT, VR, CPT, CVF), saturacao de oxigenio."},
  {"id": "sau-ana-03", "area": "Saude", "disciplina": "Anatomia",
   "texto": "Saude Anatomia - Sistema Nervoso: SNC (encefalo: cerebro, cerebelo, tronco encefalico; medula espinhal) e SNP (nervos craniais e espinhais, sistema autonomo simpatico e parassimpatico), neuronio (corpo celular, dendrito, axonio, sinapse), neurotransmissores (acetilcolina, dopamina, serotonina, noradrenalina, GABA, glutamato), reflexos, arco reflexo."},
  {"id": "sau-ana-04", "area": "Saude", "disciplina": "Anatomia",
   "texto": "Saude Anatomia - Sistemas Digestorio e Urinario: trato GI (boca, esofago, estomago, intestino delgado: duodeno/jejuno/ileo, intestino grosso, reto, anus), figado (bile, metabolismo), pancreas (insulina, glucagon, enzimas digestivas), rins (nefron, filtracao glomerular, reabsorcao, TFG), ureter, bexiga, uretra, homeostase hidroeletrolitica."},

  # FARMACOLOGIA
  {"id": "sau-far-01", "area": "Saude", "disciplina": "Farmacologia",
   "texto": "Saude Farmacologia - Farmacocinetica e Farmacodinamica: absorcao, distribuicao, metabolismo (citocromo P450), excrecao (ADME), meia-vida, biodisponibilidade, volume de distribuicao, clearance, agonista e antagonista, receptor, dose-resposta, efeito terapeutico, efeito colateral, toxicidade, indice terapeutico, interacoes medicamentosas."},
  {"id": "sau-far-02", "area": "Saude", "disciplina": "Farmacologia",
   "texto": "Saude Farmacologia - Principais Classes: antibioticos (penicilinas, cefalosporinas, aminoglicosideos, macrolideos, quinolonas, metronidazol), anti-hipertensivos (IECA, BRA, betabloqueadores, diureticos tiazidicos, bloqueadores de canal de calcio), analgesicos (paracetamol, AINEs: ibuprofeno/diclofenaco, opioides: morfina/codeina), insulinas, corticosteroides."},
  {"id": "sau-far-03", "area": "Saude", "disciplina": "Farmacologia",
   "texto": "Saude Farmacologia - Vias de Administracao e Calculo: via oral (VO), intravenosa (IV), intramuscular (IM), subcutanea (SC), inalatoria, topica, sublingual; calculo de gotejamento (gotas/min = volume x 20 / tempo em minutos), calculo de dose (dose = peso x concentracao), diluicao de medicamentos, regra de tres em farmacia hospitalar."},

  # MICROBIOLOGIA E PARASITOLOGIA
  {"id": "sau-mic-01", "area": "Saude", "disciplina": "Microbiologia",
   "texto": "Saude Microbiologia - Bacterias e Virus: bacterias gram-positivas (Staphylococcus aureus, Streptococcus, Enterococcus) e gram-negativas (E. coli, Pseudomonas, Klebsiella, Salmonella), resistencia bacteriana (MRSA, ESKAPE), esterilizacao e desinfeccao, autoclave, assepsia. Virus: influenza, SARS-CoV-2, HIV, hepatites A/B/C/D/E, dengue, zika, chikungunya."},
  {"id": "sau-mic-02", "area": "Saude", "disciplina": "Microbiologia",
   "texto": "Saude Parasitologia - Principais Parasitas: Plasmodium (malaria - ciclo, tratamento com cloroquina/artemisina), Trypanosoma cruzi (doenca de Chagas - transmissao pelo barbeiro), Leishmania (leishmaniose - calazar), Schistosoma mansoni (esquistossomose), Ascaris lumbricoides (ascaridiase), Taenia (teníase/cisticercose), Toxoplasma gondii (toxoplasmose - risco na gestacao)."},

  # ENFERMAGEM
  {"id": "sau-enf-01", "area": "Saude", "disciplina": "Enfermagem",
   "texto": "Saude Enfermagem - Sinais Vitais e Avaliacao: pressao arterial (normal <120/80 mmHg, hipertensao >=140/90 mmHg), frequencia cardiaca (normal 60-100 bpm), frequencia respiratoria (normal 12-20 irpm), temperatura (normal 36-37,5 graus), saturacao de O2 (normal >=95%), escala de Glasgow (ocular, verbal, motora - minimo 3, maximo 15), escala de dor (EVA 0-10)."},
  {"id": "sau-enf-02", "area": "Saude", "disciplina": "Enfermagem",
   "texto": "Saude Enfermagem - Tecnicas e Procedimentos: curativo (limpo, contaminado, infectado), sondagem nasogastrica (SNG) e vesical (SVD/SVA), acesso venoso periferico, coleta de sangue (tubos: vermelho sem anticoagulante, roxo EDTA, azul citrato, verde heparina), precaucoes padroes (EPI: luvas, mascara, avental, oculos), lavagem das maos (OMS 6 passos), SAE (Sistematizacao da Assistencia de Enfermagem)."},
  {"id": "sau-enf-03", "area": "Saude", "disciplina": "Enfermagem",
   "texto": "Saude Enfermagem - Urgencia e Emergencia: RCP (30 compressoes : 2 ventilacoes, profundidade 5-6 cm, frequencia 100-120/min), DEA (desfibrilador externo automatico), ACLS, triage de Manchester (vermelho imediato, laranja muito urgente, amarelo urgente, verde pouco urgente, azul nao urgente), choque (hipovolemico, cardiogenico, septico, anafilatico), FAST em trauma."},

  # SUS
  {"id": "sau-sus-01", "area": "Saude", "disciplina": "SUS",
   "texto": "Saude SUS - Lei 8.080/90 (Lei Organica da Saude): criacao e regulamentacao do SUS, principios doutrinarios (universalidade, integralidade, equidade) e organizativos (descentralizacao, hierarquizacao, participacao comunitaria), competencias da Uniao, estados e municipios, financiamento (Fundo Nacional de Saude), gestao e controle social, vigilancia em saude, assistencia terapeutica."},
  {"id": "sau-sus-02", "area": "Saude", "disciplina": "SUS",
   "texto": "Saude SUS - Lei 8.142/90 e Controle Social: participacao da comunidade na gestao do SUS, Conferencias de Saude (a cada 4 anos) e Conselhos de Saude (municipais, estaduais, nacional - CNS), transferencias intergovernamentais (FNS), Normas Operacionais Basicas (NOB), NOAS, Pacto pela Saude, redes de atencao a saude (RAS), atencao basica (Estrategia Saude da Familia - ESF)."},
  {"id": "sau-sus-03", "area": "Saude", "disciplina": "SUS",
   "texto": "Saude Publica - Epidemiologia e Vigilancia: indicadores de saude (mortalidade infantil, esperanca de vida, coeficiente de mortalidade), epidemiologia descritiva (pessoa, lugar, tempo), doencas de notificacao compulsoria (dengue, tuberculose, HIV/AIDS, sifilis, leishmaniose, sarampo, COVID-19), cadeia epidemiologica (agente, hospedeiro, ambiente), medidas de prevencao primaria, secundaria e terciaria."},

  # BIOQUIMICA CLINICA
  {"id": "sau-bio-01", "area": "Saude", "disciplina": "Bioquimica",
   "texto": "Saude Bioquimica Clinica - Exames Laboratoriais: hemograma completo (eritrocitos, leucocitos, plaquetas, hemoglobina, hematocrito, VCM, HCM, CHCM), glicemia (jejum normal 70-99 mg/dL, diabetes >=126 mg/dL), HbA1c, lipidograma (colesterol total, LDL, HDL, triglicerides), funcao renal (creatinina, ureia, TFG), funcao hepatica (TGO, TGP, bilirrubinas, albumina), PCR, VHS, coagulograma (TP, TTPA, INR)."},
  {"id": "sau-bio-02", "area": "Saude", "disciplina": "Bioquimica",
   "texto": "Saude Bioquimica - Metabolismo e Nutricao: metabolismo de carboidratos (glicose, glicogenese, glicogenolise, gliconeogenese, via das pentoses), lipideos (beta-oxidacao, corpos cetonicos, colesterol), proteinas (aminoacidos essenciais, ciclo da ureia), vitaminas hidrossoluveis (complexo B, vitamina C) e lipossoluvieis (A, D, E, K), minerais (calcio, ferro, sodio, potassio, magnesio). Nutricao clinica."},
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

    print("StudyMaster - Indexador Saude")
    print(f"Total de conteudos: {len(CONTEUDOS_SAUDE)}")
    print("Testando API...")
    try:
        emb = gerar_embedding("teste saude")
        print(f"  OK API - {len(emb)} dims\n")
    except Exception as e:
        print(f"  ERRO: {e}")
        return

    batch, total, BATCH_SIZE = [], 0, 20
    for i, item in enumerate(CONTEUDOS_SAUDE):
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
            "fonte": "Conteudo Programatico Saude - Anatomia, Farmacologia, SUS, Enfermagem",
        }})

        if len(batch) >= BATCH_SIZE or i == len(CONTEUDOS_SAUDE) - 1:
            try:
                upsert_vetores(batch)
                total += len(batch)
                print(f"  OK {total}/{len(CONTEUDOS_SAUDE)} conteudos indexados")
            except Exception as e:
                print(f"  ERRO Upsert: {e}")
            batch = []
            time.sleep(1)

    print(f"\nOK Saude indexado: {total} conteudos no Vectorize")
    print("Questoes de Saude agora usam RAG com conteudo clinico e SUS!")


if __name__ == "__main__":
    main()
