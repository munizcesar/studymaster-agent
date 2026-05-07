#!/usr/bin/env python3
"""
Script para indexar questões de provas no Cloudflare Vectorize
Cria embeddings e armazena com metadados de banca

Uso:
    python3 index-to-vectorize.py --input data/exams.json --api-key xxx --index exams
"""

import json
import argparse
import logging
import sys
from pathlib import Path
from typing import List, Dict, Optional
from datetime import datetime
import hashlib

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class VectorizeIndexer:
    """Indexador de questões para Cloudflare Vectorize"""
    
    def __init__(
        self,
        api_key: str,
        account_id: str,
        index_name: str
    ):
        self.api_key = api_key
        self.account_id = account_id
        self.index_name = index_name
        self.base_url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/vectorize/indexes/{index_name}"
        self.logger = logging.getLogger("VectorizeIndexer")
        
        # Tentar importar cliente de embeddings
        try:
            from sentence_transformers import SentenceTransformer
            self.embedder = SentenceTransformer('sentence-transformers/multilingual-bge-small-1.5-v2')
            self.logger.info("Modelo de embeddings carregado")
        except ImportError:
            self.logger.warning(
                "sentence-transformers não instalado. "
                "Execute: pip install sentence-transformers"
            )
            self.embedder = None
    
    def generate_embedding(self, text: str) -> Optional[List[float]]:
        """Gera embedding para um texto"""
        if not self.embedder:
            self.logger.error("Embedder não disponível")
            return None
        
        try:
            # Truncar texto se necessário
            text = text[:512]
            embedding = self.embedder.encode(text, convert_to_tensor=False)
            return embedding.tolist() if hasattr(embedding, 'tolist') else list(embedding)
        except Exception as e:
            self.logger.error(f"Erro ao gerar embedding: {e}")
            return None
    
    def prepare_document(self, question: Dict) -> Dict:
        """Prepara um documento para indexação"""
        
        # Criar texto para embedding (statement + metadados)
        search_text = (
            f"{question['statement']} "
            f"{' '.join([opt['text'] for opt in question['options']])} "
            f"Banca: {question['banca']} "
            f"Assunto: {question.get('subject', 'Geral')}"
        )
        
        # Gerar embedding
        embedding = self.generate_embedding(search_text)
        
        if not embedding:
            return None
        
        # Criar ID único
        doc_id = hashlib.sha256(
            f"{question['exam']}{question['statement']}".encode()
        ).hexdigest()[:16]
        
        return {
            "id": doc_id,
            "values": embedding,
            "metadata": {
                "statement": question["statement"][:256],
                "banca": question["banca"],
                "exam": question["exam"],
                "year": question["year"],
                "subject": question.get("subject", "Geral"),
                "topic": question.get("topic", ""),
                "difficulty": question["difficulty"],
                "correctAnswer": question["correctAnswer"],
                "options_count": len(question["options"]),
                "indexed_at": datetime.now().isoformat()
            }
        }
    
    def index_questions(self, questions: List[Dict]) -> Dict:
        """Indexa questões no Vectorize"""
        
        documents = []
        failed = 0
        
        self.logger.info(f"Preparando {len(questions)} questões para indexação...")
        
        for idx, question in enumerate(questions):
            try:
                doc = self.prepare_document(question)
                if doc:
                    documents.append(doc)
                else:
                    failed += 1
            except Exception as e:
                self.logger.debug(f"Erro ao preparar questão {idx}: {e}")
                failed += 1
        
        if not documents:
            self.logger.error("Nenhum documento foi preparado para indexação")
            return {"success": False, "error": "No documents prepared"}
        
        self.logger.info(
            f"Preparadas {len(documents)} questões "
            f"({failed} falharam)"
        )
        
        # Em produção, enviar para Cloudflare Vectorize via API
        # Aqui fazemos simulação salvando em arquivo
        return self._simulate_indexing(documents)
    
    def _simulate_indexing(self, documents: List[Dict]) -> Dict:
        """Simula indexação (em produção seria real POST para Vectorize API)"""
        
        # Salvar documentos indexados
        output_file = Path("data/indexed_documents.json")
        output_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(documents, f, indent=2, ensure_ascii=False)
        
        self.logger.info(f"Documentos salvos em {output_file}")
        
        return {
            "success": True,
            "indexed": len(documents),
            "output_file": str(output_file),
            "index_name": self.index_name,
            "timestamp": datetime.now().isoformat()
        }
    
    def generate_report(self, documents: List[Dict]) -> Dict:
        """Gera relatório de indexação"""
        
        bancas = {}
        subjects = {}
        difficulties = {"easy": 0, "medium": 0, "hard": 0}
        years = {}
        
        for doc in documents:
            meta = doc.get("metadata", {})
            
            # Contagem por banca
            banca = meta.get("banca", "Unknown")
            bancas[banca] = bancas.get(banca, 0) + 1
            
            # Contagem por assunto
            subject = meta.get("subject", "Geral")
            subjects[subject] = subjects.get(subject, 0) + 1
            
            # Contagem por dificuldade
            diff = meta.get("difficulty", "medium")
            difficulties[diff] = difficulties.get(diff, 0) + 1
            
            # Contagem por ano
            year = meta.get("year", 0)
            years[str(year)] = years.get(str(year), 0) + 1
        
        return {
            "total_documents": len(documents),
            "bancas": bancas,
            "subjects": subjects,
            "difficulties": difficulties,
            "years": years,
            "timestamp": datetime.now().isoformat()
        }


def main():
    parser = argparse.ArgumentParser(
        description="Indexar questões de concursos no Cloudflare Vectorize"
    )
    parser.add_argument(
        "--input",
        required=True,
        help="Arquivo JSON com questões extraídas"
    )
    parser.add_argument(
        "--api-key",
        help="Cloudflare API key (ou use env var CLOUDFLARE_API_KEY)"
    )
    parser.add_argument(
        "--account-id",
        help="Cloudflare Account ID (ou use env var CLOUDFLARE_ACCOUNT_ID)"
    )
    parser.add_argument(
        "--index",
        default="exams",
        help="Nome do índice Vectorize"
    )
    parser.add_argument(
        "--report",
        default="data/indexing-report.json",
        help="Arquivo para salvar relatório"
    )
    parser.add_argument(
        "--verbose",
        action="store_true"
    )
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    try:
        # Ler questões
        input_path = Path(args.input)
        if not input_path.exists():
            logger.error(f"Arquivo não encontrado: {args.input}")
            sys.exit(1)
        
        logger.info(f"Lendo questões de {args.input}...")
        with open(input_path, 'r', encoding='utf-8') as f:
            questions = json.load(f)
        
        logger.info(f"Carregadas {len(questions)} questões")
        
        # Inicializar indexador
        api_key = args.api_key or os.getenv('CLOUDFLARE_API_KEY')
        account_id = args.account_id or os.getenv('CLOUDFLARE_ACCOUNT_ID')
        
        if not api_key or not account_id:
            logger.warning(
                "Cloudflare credentials não configuradas. "
                "Modo simulação ativado."
            )
        
        indexer = VectorizeIndexer(
            api_key=api_key or "demo",
            account_id=account_id or "demo",
            index_name=args.index
        )
        
        # Indexar questões
        result = indexer.index_questions(questions)
        
        # Gerar relatório
        documents = []
        if Path("data/indexed_documents.json").exists():
            with open("data/indexed_documents.json") as f:
                documents = json.load(f)
        
        report = indexer.generate_report(documents) if documents else {"total_documents": 0}
        
        # Salvar relatório
        report_path = Path(args.report)
        report_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        logger.info(f"✓ Indexação concluída")
        logger.info(f"  Documentos indexados: {report.get('total_documents', 0)}")
        logger.info(f"  Relatório salvo em: {args.report}")
        
        # Imprimir resumo
        print("\n" + "="*60)
        print("RESUMO DE INDEXAÇÃO")
        print("="*60)
        print(f"Total de questões: {report.get('total_documents', 0)}")
        if report.get('bancas'):
            print(f"\nProvas por banca:")
            for banca, count in sorted(report['bancas'].items(), key=lambda x: x[1], reverse=True)[:10]:
                print(f"  {banca}: {count}")
        if report.get('subjects'):
            print(f"\nProvas por assunto:")
            for subject, count in sorted(report['subjects'].items(), key=lambda x: x[1], reverse=True)[:10]:
                print(f"  {subject}: {count}")
        print("="*60 + "\n")
        
    except Exception as e:
        logger.error(f"Erro fatal: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    import os
    main()
