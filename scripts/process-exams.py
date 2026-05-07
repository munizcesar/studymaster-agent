#!/usr/bin/env python3
"""
Script orquestrador: coordena extração e indexação de provas
Gerencia todo o pipeline de ponta a ponta

Uso:
    python3 process-exams.sh --source local --full
"""

import os
import sys
import json
import argparse
import subprocess
import logging
from pathlib import Path
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ExamProcessingOrchestrator:
    """Orquestra o pipeline completo de processamento de provas"""
    
    def __init__(self):
        self.script_dir = Path(__file__).parent
        self.data_dir = self.script_dir / "data"
        self.provas_dir = self.script_dir.parent / "provas_pdf"
        self.data_dir.mkdir(exist_ok=True)
        
        self.log_file = self.data_dir / "processing-log.json"
        self.config_file = self.data_dir / "config.json"
    
    def load_config(self):
        """Carrega configurações"""
        if self.config_file.exists():
            with open(self.config_file) as f:
                return json.load(f)
        return {
            "cloudflare_configured": bool(os.getenv('CLOUDFLARE_API_KEY')),
            "last_run": None,
            "total_questions_processed": 0
        }
    
    def save_config(self, config):
        """Salva configurações"""
        config['last_run'] = datetime.now().isoformat()
        with open(self.config_file, 'w') as f:
            json.dump(config, f, indent=2)
    
    def run_extraction(self, source: str, limit: int = None, verbose: bool = False):
        """Executa extração de provas"""
        
        logger.info(f"{'='*60}")
        logger.info(f"FASE 1: EXTRAÇÃO DE PROVAS (fonte: {source})")
        logger.info(f"{'='*60}")
        
        cmd = [
            sys.executable,
            "extract-exams.py",
            "--source", source,
            "--output", str(self.data_dir / "exams.json")
        ]
        
        if source == "local":
            cmd.extend(["--pdf-dir", str(self.provas_dir)])
        
        if limit:
            cmd.extend(["--limit", str(limit)])
        
        if verbose:
            cmd.append("--verbose")
        
        logger.info(f"Executando: {' '.join(cmd)}")
        
        try:
            result = subprocess.run(cmd, check=True, capture_output=True, text=True)
            logger.info(result.stdout)
            
            # Verificar resultado
            exams_file = self.data_dir / "exams.json"
            if exams_file.exists():
                with open(exams_file) as f:
                    questions = json.load(f)
                logger.info(f"✓ Extração concluída: {len(questions)} questões")
                return len(questions)
            else:
                logger.error("Arquivo de saída não gerado")
                return 0
                
        except subprocess.CalledProcessError as e:
            logger.error(f"Erro na extração: {e.stderr}")
            return 0
    
    def run_indexing(self, verbose: bool = False):
        """Executa indexação no Vectorize"""
        
        logger.info(f"{'='*60}")
        logger.info(f"FASE 2: INDEXAÇÃO NO VECTORIZE")
        logger.info(f"{'='*60}")
        
        exams_file = self.data_dir / "exams.json"
        if not exams_file.exists():
            logger.error("Arquivo de questões não encontrado. Execute extração primeiro.")
            return False
        
        cmd = [
            sys.executable,
            "index-to-vectorize.py",
            "--input", str(exams_file),
            "--report", str(self.data_dir / "indexing-report.json")
        ]
        
        if verbose:
            cmd.append("--verbose")
        
        logger.info(f"Executando: {' '.join(cmd)}")
        
        try:
            result = subprocess.run(cmd, check=True, capture_output=True, text=True)
            logger.info(result.stdout)
            
            # Verificar relatório
            report_file = self.data_dir / "indexing-report.json"
            if report_file.exists():
                with open(report_file) as f:
                    report = json.load(f)
                logger.info(f"✓ Indexação concluída: {report.get('total_documents', 0)} documentos")
                return True
            else:
                logger.warning("Relatório não gerado, mas indexação pode ter funcionado")
                return True
                
        except subprocess.CalledProcessError as e:
            logger.error(f"Erro na indexação: {e.stderr}")
            return False
    
    def run_validation(self):
        """Valida resultado do processamento"""
        
        logger.info(f"{'='*60}")
        logger.info(f"FASE 3: VALIDAÇÃO")
        logger.info(f"{'='*60}")
        
        exams_file = self.data_dir / "exams.json"
        indexed_file = self.data_dir / "indexed_documents.json"
        report_file = self.data_dir / "indexing-report.json"
        
        issues = []
        
        # Verificar arquivo de questões
        if exams_file.exists():
            with open(exams_file) as f:
                questions = json.load(f)
            logger.info(f"✓ Questões extraídas: {len(questions)}")
            
            # Validar estrutura
            for i, q in enumerate(questions[:5]):  # Verificar primeiras 5
                if not all(k in q for k in ['statement', 'options', 'correctAnswer', 'banca']):
                    issues.append(f"Questão {i} com estrutura incompleta")
        else:
            issues.append("Arquivo de questões não encontrado")
        
        # Verificar documentos indexados
        if indexed_file.exists():
            with open(indexed_file) as f:
                docs = json.load(f)
            logger.info(f"✓ Documentos indexados: {len(docs)}")
            
            if len(docs) > 0:
                first_doc = docs[0]
                has_embedding = 'values' in first_doc
                has_metadata = 'metadata' in first_doc
                logger.info(f"  - Embedding presente: {has_embedding}")
                logger.info(f"  - Metadados presentes: {has_metadata}")
        else:
            logger.warning("Arquivo de documentos indexados não encontrado (pode estar em Cloudflare)")
        
        # Verificar relatório
        if report_file.exists():
            with open(report_file) as f:
                report = json.load(f)
            logger.info(f"✓ Relatório de indexação:")
            logger.info(f"  - Total de documentos: {report.get('total_documents', 0)}")
            if report.get('bancas'):
                top_bancas = sorted(report['bancas'].items(), key=lambda x: x[1], reverse=True)[:3]
                for banca, count in top_bancas:
                    logger.info(f"    * {banca}: {count} questões")
        else:
            issues.append("Relatório não encontrado")
        
        # Resumo
        if issues:
            logger.warning(f"⚠ Encontrados {len(issues)} problemas:")
            for issue in issues:
                logger.warning(f"  - {issue}")
            return False
        else:
            logger.info("✓ Todas as validações passaram!")
            return True
    
    def print_summary(self):
        """Imprime resumo final"""
        
        print("\n" + "="*60)
        print("RESUMO DO PROCESSAMENTO")
        print("="*60)
        
        files = [
            ("Questões extraídas", self.data_dir / "exams.json"),
            ("Documentos indexados", self.data_dir / "indexed_documents.json"),
            ("Relatório", self.data_dir / "indexing-report.json"),
        ]
        
        for name, path in files:
            exists = "✓" if path.exists() else "✗"
            size = f"({path.stat().st_size / 1024:.1f} KB)" if path.exists() else ""
            print(f"{exists} {name} {size}")
            print(f"  → {path}")
        
        print("\nPróximos passos:")
        print("1. Validar dados em data/exams.json")
        print("2. Se usar Cloudflare: configurar variáveis de ambiente")
        print("3. Integrar documentos no StudyMaster")
        print("4. Testar busca vetorial")
        print("="*60 + "\n")


def main():
    parser = argparse.ArgumentParser(
        description="Pipeline completo de processamento de provas de concursos"
    )
    parser.add_argument(
        "--source",
        choices=["pci", "local"],
        default="local",
        help="Fonte de provas"
    )
    parser.add_argument(
        "--limit",
        type=int,
        help="Limitar número de provas a processar"
    )
    parser.add_argument(
        "--full",
        action="store_true",
        help="Executar pipeline completo (extração + indexação + validação)"
    )
    parser.add_argument(
        "--extract-only",
        action="store_true",
        help="Apenas extrair questões"
    )
    parser.add_argument(
        "--index-only",
        action="store_true",
        help="Apenas indexar questões já extraídas"
    )
    parser.add_argument(
        "--validate",
        action="store_true",
        help="Apenas validar resultado"
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Modo verbose"
    )
    
    args = parser.parse_args()
    
    orchestrator = ExamProcessingOrchestrator()
    
    try:
        success = True
        
        if args.full or args.extract_only:
            questions_count = orchestrator.run_extraction(
                source=args.source,
                limit=args.limit,
                verbose=args.verbose
            )
            success = success and (questions_count > 0)
        
        if args.full or args.index_only:
            index_success = orchestrator.run_indexing(verbose=args.verbose)
            success = success and index_success
        
        if args.full or args.validate:
            validation_success = orchestrator.run_validation()
            success = success and validation_success
        
        orchestrator.print_summary()
        
        if not success:
            logger.error("Pipeline concluído com erros")
            sys.exit(1)
        
        logger.info("✓ Pipeline concluído com sucesso!")
        
    except Exception as e:
        logger.error(f"Erro fatal: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
