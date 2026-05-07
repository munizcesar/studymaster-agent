#!/usr/bin/env python3
"""
Script para extrair e indexar provas de concursos públicos
Fontes: PCI Concursos, PCDF, e outras bancas

Uso:
    python3 extract-exams.py --source pci --output data/exams.json
    python3 extract-exams.py --source pcdf --limit 50
"""

import json
import re
import os
import sys
import argparse
import logging
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, asdict
from abc import ABC, abstractmethod

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class Question:
    """Estrutura de uma questão extraída"""
    statement: str  # Enunciado
    options: List[Dict[str, str]]  # [{"key": "A", "text": "..."}, ...]
    correctAnswer: str  # "A", "B", "C", etc
    explanation: str  # Gabarito comentado
    banca: str  # Ex: "FCC", "CESGRANRIO"
    exam: str  # Ex: "Polícia Civil DF - Escrivão 2022"
    year: int  # Ano da prova
    difficulty: str  # "easy", "medium", "hard"
    subject: Optional[str] = None  # Ex: "Direito Penal"
    subjectCode: Optional[str] = None  # Código para indexação
    topic: Optional[str] = None  # Ex: "Crimes contra a vida"


@dataclass
class ExamMetadata:
    """Metadados de uma prova"""
    exam_name: str
    banca: str
    year: int
    level: str  # "fundamental", "medio", "superior"
    url: Optional[str] = None
    questionsCount: int = 0
    extracted_at: str = None
    
    def __post_init__(self):
        if not self.extracted_at:
            self.extracted_at = datetime.now().isoformat()


class ExamExtractor(ABC):
    """Classe base para extractors de diferentes fontes"""
    
    def __init__(self, source_name: str):
        self.source_name = source_name
        self.logger = logging.getLogger(f"ExamExtractor.{source_name}")
    
    @abstractmethod
    def extract_exams(self, limit: Optional[int] = None) -> List[ExamMetadata]:
        """Retorna lista de metadados de provas disponíveis"""
        pass
    
    @abstractmethod
    def extract_questions(self, exam: ExamMetadata) -> List[Question]:
        """Extrai questões de uma prova específica"""
        pass
    
    def save_questions(self, questions: List[Question], output_file: str):
        """Salva questões em formato JSON"""
        output_path = Path(output_file)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(
                [asdict(q) for q in questions],
                f,
                indent=2,
                ensure_ascii=False
            )
        
        self.logger.info(f"Salvos {len(questions)} questões em {output_file}")


class PCIExtractor(ExamExtractor):
    """Extrator de provas do PCI Concursos"""
    
    def __init__(self):
        super().__init__("pci")
        self.base_url = "https://www.pciconcursos.com.br"
        self.provas_url = f"{self.base_url}/provas"
    
    def extract_exams(self, limit: Optional[int] = None) -> List[ExamMetadata]:
        """
        Extrai lista de provas disponíveis do PCI
        
        Nota: PCI não expõe API pública. Este método requer web scraping.
        Alternativa: Usar dados existentes em formato JSON
        """
        self.logger.info(f"Extraindo provas do {self.source_name}...")
        
        # Placeholder - dados reais viriam de web scraping ou API
        exams = [
            ExamMetadata(
                exam_name="Polícia Civil DF - Escrivão",
                banca="PF",
                year=2024,
                level="superior",
                url="https://pciconcursos.com.br/prova/1"
            ),
            ExamMetadata(
                exam_name="Polícia Civil DF - Delegado",
                banca="PF",
                year=2023,
                level="superior",
                url="https://pciconcursos.com.br/prova/2"
            ),
        ]
        
        if limit:
            exams = exams[:limit]
        
        self.logger.info(f"Encontradas {len(exams)} provas")
        return exams
    
    def extract_questions(self, exam: ExamMetadata) -> List[Question]:
        """Extrai questões de uma prova do PCI"""
        self.logger.info(f"Extraindo questões de: {exam.exam_name}")
        
        # Placeholder - questões extraídas via OCR/PDF parsing
        questions = [
            Question(
                statement="A Constituição Federal de 1988 é considerada:",
                options=[
                    {"key": "A", "text": "Rígida"},
                    {"key": "B", "text": "Flexível"},
                    {"key": "C", "text": "Semi-rígida"},
                    {"key": "D", "text": "Móvel"}
                ],
                correctAnswer="A",
                explanation="A CF/88 é rígida pois exige processo legislativo especial para emendas.",
                banca=exam.banca,
                exam=exam.exam_name,
                year=exam.year,
                difficulty="easy",
                subject="Direito Constitucional",
                topic="Características da CF/88"
            )
        ]
        
        return questions


class DirectoryExamExtractor(ExamExtractor):
    """Extrator que lê provas em PDF de um diretório local"""
    
    def __init__(self, pdf_directory: str):
        super().__init__("local_pdf")
        self.pdf_dir = Path(pdf_directory)
        self.pdf_dir.mkdir(parents=True, exist_ok=True)
    
    def extract_exams(self, limit: Optional[int] = None) -> List[ExamMetadata]:
        """Lista arquivos PDF no diretório"""
        pdf_files = list(self.pdf_dir.glob("*.pdf"))
        
        exams = []
        for pdf_file in pdf_files[:limit] if limit else pdf_files:
            # Inferir metadados do nome do arquivo
            # Formato esperado: "Banca_Concurso_Ano.pdf"
            parts = pdf_file.stem.split("_")
            
            exam = ExamMetadata(
                exam_name=pdf_file.stem,
                banca=parts[0] if len(parts) > 0 else "Unknown",
                year=int(parts[-1]) if len(parts) > 0 and parts[-1].isdigit() else 2024,
                level="superior"
            )
            exams.append(exam)
        
        self.logger.info(f"Encontrados {len(exams)} PDFs em {self.pdf_dir}")
        return exams
    
    def extract_questions(self, exam: ExamMetadata) -> List[Question]:
        """Extrai questões de um PDF local"""
        pdf_path = self.pdf_dir / f"{exam.exam_name}.pdf"
        
        if not pdf_path.exists():
            self.logger.warning(f"Arquivo não encontrado: {pdf_path}")
            return []
        
        self.logger.info(f"Processando: {pdf_path}")
        
        try:
            import PyPDF2
            questions = []
            
            with open(pdf_path, 'rb') as f:
                pdf_reader = PyPDF2.PdfReader(f)
                full_text = ""
                
                for page_num, page in enumerate(pdf_reader.pages):
                    text = page.extract_text()
                    if text:
                        full_text += f"\n[Página {page_num + 1}]\n{text}"
            
            # Parse questões do texto (implementar lógica de parsing)
            questions = self._parse_questions_from_text(full_text, exam)
            
            self.logger.info(f"Extraídas {len(questions)} questões de {exam.exam_name}")
            return questions
            
        except ImportError:
            self.logger.error(
                "PyPDF2 não instalado. Execute: pip install PyPDF2"
            )
            return []
        except Exception as e:
            self.logger.error(f"Erro ao processar {pdf_path}: {e}")
            return []
    
    def _parse_questions_from_text(self, text: str, exam: ExamMetadata) -> List[Question]:
        """Parse simples de questões no formato padrão"""
        questions = []
        
        # Padrão: "1. Enunciado\nA) opção A\nB) opção B\nC) opção C\nD) opção D\nResposta: A"
        question_pattern = r'(\d+)\.\s+(.+?)(?=\n\d+\.|$)'
        
        matches = re.finditer(question_pattern, text, re.DOTALL)
        
        for match in matches:
            try:
                q_num = match.group(1)
                q_content = match.group(2).strip()
                
                # Extrair enunciado e opções (implementação simplificada)
                lines = q_content.split('\n')
                statement = lines[0] if lines else ""
                
                if not statement:
                    continue
                
                # Tentar extrair opções (A, B, C, D)
                options = []
                for line in lines[1:]:
                    opt_match = re.match(r'([A-E])\)\s+(.+)', line)
                    if opt_match:
                        options.append({
                            "key": opt_match.group(1),
                            "text": opt_match.group(2).strip()
                        })
                
                if len(options) < 2:
                    continue
                
                # Procurar gabarito
                correct_answer = None
                explanation = ""
                
                # Buscar padrão de gabarito
                answer_match = re.search(r'(?:Resposta|Gabarito|Correta):\s*([A-E])', q_content, re.IGNORECASE)
                if answer_match:
                    correct_answer = answer_match.group(1)
                
                # Busca por explicação após o padrão
                explanation_match = re.search(r'(?:Explicação|Comentário|Justificativa):\s*(.+?)(?=\n[A-E]\)|$)', q_content, re.IGNORECASE | re.DOTALL)
                if explanation_match:
                    explanation = explanation_match.group(1).strip()[:500]
                
                if not correct_answer:
                    continue
                
                question = Question(
                    statement=statement[:500],
                    options=options,
                    correctAnswer=correct_answer,
                    explanation=explanation or "Veja o gabarito oficial da prova.",
                    banca=exam.banca,
                    exam=exam.exam_name,
                    year=exam.year,
                    difficulty=self._infer_difficulty(statement),
                    subject=None
                )
                
                questions.append(question)
                
            except Exception as e:
                logger.debug(f"Erro ao processar questão {q_num}: {e}")
                continue
        
        return questions
    
    @staticmethod
    def _infer_difficulty(statement: str) -> str:
        """Inferir dificuldade baseado no comprimento e complexidade"""
        if len(statement) < 100:
            return "easy"
        elif len(statement) < 300:
            return "medium"
        else:
            return "hard"


def main():
    parser = argparse.ArgumentParser(
        description="Extrator de provas de concursos públicos"
    )
    parser.add_argument(
        "--source",
        choices=["pci", "local", "all"],
        default="pci",
        help="Fonte de provas"
    )
    parser.add_argument(
        "--pdf-dir",
        default="./provas_pdf",
        help="Diretório com PDFs (para --source local)"
    )
    parser.add_argument(
        "--output",
        default="data/exams.json",
        help="Arquivo de saída"
    )
    parser.add_argument(
        "--limit",
        type=int,
        help="Limitar número de provas a processar"
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Modo verbose"
    )
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    try:
        # Selecionar extrator
        if args.source == "pci":
            extractor = PCIExtractor()
        elif args.source == "local":
            extractor = DirectoryExamExtractor(args.pdf_dir)
        else:
            logger.error(f"Fonte desconhecida: {args.source}")
            sys.exit(1)
        
        # Extrair metadados de provas
        exams = extractor.extract_exams(limit=args.limit)
        
        if not exams:
            logger.warning("Nenhuma prova encontrada")
            sys.exit(0)
        
        # Extrair questões
        all_questions = []
        for exam in exams:
            questions = extractor.extract_questions(exam)
            all_questions.extend(questions)
        
        # Salvar
        extractor.save_questions(all_questions, args.output)
        
        logger.info(f"✓ Processamento concluído: {len(all_questions)} questões")
        
    except Exception as e:
        logger.error(f"Erro fatal: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
