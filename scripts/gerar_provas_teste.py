#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para gerar PDFs de teste com questões fictícias mas realistas.
Simula estrutura de provas reais de diferentes bancas para validar extraction logic.
"""

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
import json
from datetime import datetime
import os

# Dados de teste realistas
PROVAS_TESTE = {
    "FCC_Concurso_2024": {
        "banca": "FCC",
        "concurso": "TRE-SP - Analista Judiciário",
        "ano": 2024,
        "assunto": "Direito Penal",
        "questoes": [
            {
                "numero": 1,
                "enunciado": "De acordo com o Código Penal Brasileiro, o dolo, para fins penais, é definido como:",
                "alternativas": {
                    "A": "A vontade consciente de executar a ação criminosa.",
                    "B": "A negligência do agente em verificar os riscos de sua conduta.",
                    "C": "A intenção específica de causar dano a outrem.",
                    "D": "O conhecimento e a vontade de executar o fato típico.",
                    "E": "A previsibilidade do resultado delitivo."
                },
                "gabarito": "D",
                "explicacao": "O dolo caracteriza-se pela presença de dois elementos: o conhecimento e a vontade de executar o fato típico."
            },
            {
                "numero": 2,
                "enunciado": "Qual é o prazo prescricional para crimes de furto simples conforme a legislação penal vigente?",
                "alternativas": {
                    "A": "2 anos",
                    "B": "3 anos",
                    "C": "5 anos",
                    "D": "8 anos",
                    "E": "10 anos"
                },
                "gabarito": "B",
                "explicacao": "Segundo o Art. 109 do CP, crimes em geral têm prazo prescricional de 3 anos."
            }
        ]
    },
    "CESGRANRIO_Concurso_2023": {
        "banca": "CESGRANRIO",
        "concurso": "Petrobras - Técnico",
        "ano": 2023,
        "assunto": "Administração",
        "questoes": [
            {
                "numero": 1,
                "enunciado": "A administração moderna enfatiza a importância da liderança no alcance de objetivos organizacionais. Qual das seguintes afirmações sobre liderança está CORRETA?",
                "alternativas": {
                    "A": "Liderança é sinônimo de autoridade formal.",
                    "B": "Liderança é um conjunto de influências sociais que permitiria alcançar objetivos específicos.",
                    "C": "Apenas gestores podem exercer liderança em uma organização.",
                    "D": "A liderança carismática é o modelo mais eficiente em todas as situações.",
                    "E": "Liderança não pode ser desenvolvida; é apenas um traço inato."
                },
                "gabarito": "B",
                "explicacao": "A liderança é definida como influência social que mobiliza pessoas para alcançar objetivos comuns."
            }
        ]
    }
}

def criar_pdf_prova(dados_prova, caminho_saida):
    """Cria um PDF realista com questões de teste."""
    
    doc = SimpleDocTemplate(caminho_saida, pagesize=A4)
    story = []
    styles = getSampleStyleSheet()
    
    # Estilos customizados
    titulo_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=14,
        textColor=colors.HexColor('#000080'),
        spaceAfter=6,
        alignment=TA_CENTER
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=11,
        textColor=colors.HexColor('#000080'),
        spaceAfter=6,
        spaceBefore=12
    )
    
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['BodyText'],
        fontSize=10,
        alignment=TA_JUSTIFY,
        spaceAfter=6
    )
    
    # Cabeçalho
    banca = dados_prova['banca']
    concurso = dados_prova['concurso']
    ano = dados_prova['ano']
    
    story.append(Paragraph(f"{banca}", titulo_style))
    story.append(Paragraph(f"{concurso} - {ano}", heading_style))
    story.append(Paragraph(f"Assunto: {dados_prova['assunto']}", body_style))
    story.append(Spacer(1, 0.3 * inch))
    
    # Questões
    for q in dados_prova['questoes']:
        # Número e enunciado
        story.append(Paragraph(
            f"<b>Questão {q['numero']}</b><br/>{q['enunciado']}",
            body_style
        ))
        story.append(Spacer(1, 0.15 * inch))
        
        # Alternativas
        for letra, texto in q['alternativas'].items():
            story.append(Paragraph(
                f"<b>{letra})</b> {texto}",
                body_style
            ))
        
        story.append(Spacer(1, 0.25 * inch))
    
    # Gabarito (no final)
    story.append(PageBreak())
    story.append(Paragraph("GABARITO", titulo_style))
    story.append(Spacer(1, 0.2 * inch))
    
    gabarito_text = " | ".join([
        f"Q{q['numero']}: {q['gabarito']}" 
        for q in dados_prova['questoes']
    ])
    story.append(Paragraph(gabarito_text, body_style))
    
    doc.build(story)
    print(f"✅ PDF criado: {caminho_saida}")

def criar_pasta_teste():
    """Cria pasta de testes com PDFs."""
    pasta = os.path.join(
        os.path.dirname(__file__),
        '..',
        'provas_teste'
    )
    
    os.makedirs(pasta, exist_ok=True)
    
    print(f"📁 Criando PDFs de teste em: {pasta}\n")
    
    for nome_arquivo, dados in PROVAS_TESTE.items():
        caminho = os.path.join(pasta, f"{nome_arquivo}.pdf")
        try:
            criar_pdf_prova(dados, caminho)
        except Exception as e:
            print(f"❌ Erro ao criar {nome_arquivo}: {e}")
    
    # Cria arquivo JSON com metadados esperados
    metadados = {
        "data_criacao": datetime.now().isoformat(),
        "provas_geradas": list(PROVAS_TESTE.keys()),
        "total_questoes": sum(len(p['questoes']) for p in PROVAS_TESTE.values()),
        "observacao": "PDFs de teste para validar extraction logic"
    }
    
    json_path = os.path.join(pasta, 'metadados.json')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(metadados, f, ensure_ascii=False, indent=2)
    
    print(f"\n📄 Metadados salvos em: {json_path}")
    print(f"\n📊 Resumo:")
    print(f"   - {len(PROVAS_TESTE)} PDFs de teste criados")
    print(f"   - {metadados['total_questoes']} questões no total")
    print(f"\n🚀 Próximo passo:")
    print(f"   python3 scripts/extract-exams.py --input provas_teste --output data/extracted_test.json")

if __name__ == "__main__":
    criar_pasta_teste()
