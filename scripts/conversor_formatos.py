#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Conversor de Formatos de Questões
Suporta: seu padrão (StudyMaster) e QConcursos
"""

import json
from typing import Dict, List, Union
from pathlib import Path


class ConversorFormatos:
    """Converte entre diferentes formatos de questões"""
    
    @staticmethod
    def detectar_formato(questao: Dict) -> str:
        """Detecta qual formato a questão está usando"""
        
        # Formato StudyMaster: statement, options, correctAnswer
        if 'statement' in questao and 'options' in questao:
            return 'studymaster'
        
        # Formato QConcursos: enunciado, alternativas, gabarito
        if 'enunciado' in questao and 'alternativas' in questao:
            return 'qconcursos'
        
        return 'desconhecido'
    
    @staticmethod
    def qconcursos_para_studymaster(questao: Dict) -> Dict:
        """Converte QConcursos → StudyMaster"""
        
        # Construir opções no formato StudyMaster
        options = []
        if 'alternativas' in questao:
            for alt in questao['alternativas']:
                options.append({
                    'letter': alt.get('letra', '?'),
                    'text': alt.get('texto', '')
                })
        
        return {
            'id': questao.get('id', ''),
            'statement': questao.get('enunciado', ''),
            'options': options,
            'correctAnswer': questao.get('gabarito', ''),
            'explanation': questao.get('explicacao', ''),
            'banca': questao.get('banca', ''),
            'exam': questao.get('concurso', ''),
            'year': questao.get('ano', 0),
            'difficulty': questao.get('dificuldade', 'médio'),
            'subject': questao.get('disciplina', ''),
            'topic': questao.get('assunto', ''),
            'timestamp': questao.get('timestamp', '')
        }
    
    @staticmethod
    def studymaster_para_qconcursos(questao: Dict) -> Dict:
        """Converte StudyMaster → QConcursos"""
        
        # Construir alternativas no formato QConcursos
        alternativas = []
        correct = questao.get('correctAnswer', '')
        
        if 'options' in questao:
            for opt in questao['options']:
                alternativas.append({
                    'letra': opt.get('letter', '?'),
                    'texto': opt.get('text', ''),
                    'correta': opt.get('letter') == correct
                })
        
        return {
            'id': questao.get('id', ''),
            'enunciado': questao.get('statement', ''),
            'alternativas': alternativas,
            'gabarito': questao.get('correctAnswer', ''),
            'explicacao': questao.get('explanation', ''),
            'banca': questao.get('banca', ''),
            'concurso': questao.get('exam', ''),
            'ano': questao.get('year', 0),
            'dificuldade': questao.get('difficulty', 'médio'),
            'disciplina': questao.get('subject', ''),
            'assunto': questao.get('topic', ''),
            'timestamp': questao.get('timestamp', '')
        }
    
    @staticmethod
    def converter(questao: Dict, formato_destino: str) -> Dict:
        """Converte questão para formato desejado"""
        
        formato_origem = ConversorFormatos.detectar_formato(questao)
        
        if formato_origem == formato_destino:
            return questao
        
        if formato_origem == 'studymaster' and formato_destino == 'qconcursos':
            return ConversorFormatos.studymaster_para_qconcursos(questao)
        
        if formato_origem == 'qconcursos' and formato_destino == 'studymaster':
            return ConversorFormatos.qconcursos_para_studymaster(questao)
        
        raise ValueError(f"Conversão de {formato_origem} para {formato_destino} não suportada")
    
    @staticmethod
    def converter_arquivo(
        arquivo_entrada: str,
        arquivo_saida: str,
        formato_destino: str = 'studymaster'
    ) -> int:
        """Converte arquivo completo entre formatos"""
        
        # Ler arquivo original
        with open(arquivo_entrada, 'r', encoding='utf-8') as f:
            dados = json.load(f)
        
        # Detectar se é lista ou dict único
        if isinstance(dados, list):
            questoes = dados
        else:
            questoes = [dados]
        
        # Converter cada questão
        questoes_convertidas = []
        for q in questoes:
            try:
                q_convertida = ConversorFormatos.converter(q, formato_destino)
                questoes_convertidas.append(q_convertida)
            except Exception as e:
                print(f"❌ Erro ao converter questão {q.get('id', 'desconhecida')}: {e}")
                continue
        
        # Salvar arquivo convertido
        with open(arquivo_saida, 'w', encoding='utf-8') as f:
            if len(questoes_convertidas) == 1:
                json.dump(questoes_convertidas[0], f, ensure_ascii=False, indent=2)
            else:
                json.dump(questoes_convertidas, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Arquivo convertido: {arquivo_entrada} → {arquivo_saida}")
        print(f"   Total de questões: {len(questoes_convertidas)}")
        print(f"   Formato de destino: {formato_destino}")
        
        return len(questoes_convertidas)


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Conversor de formatos de questões'
    )
    parser.add_argument('--input', required=True, help='Arquivo JSON de entrada')
    parser.add_argument('--output', required=True, help='Arquivo JSON de saída')
    parser.add_argument(
        '--formato',
        choices=['studymaster', 'qconcursos'],
        default='studymaster',
        help='Formato de destino'
    )
    
    args = parser.parse_args()
    
    try:
        total = ConversorFormatos.converter_arquivo(
            args.input,
            args.output,
            args.formato
        )
    except Exception as e:
        print(f"❌ Erro: {e}")
        exit(1)
