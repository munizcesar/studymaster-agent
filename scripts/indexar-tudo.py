#!/usr/bin/env python3
"""
StudyMaster - Orquestrador de Indexação Completa
Executa todos os scripts de indexação em sequência
"""
import os, subprocess, sys, time, json
from datetime import datetime

SCRIPTS = [
    ("Tecnologia",     "indexar-tecnologia.py"),
    ("Concursos v2",   "indexar-concursos-v2.py"),
    ("Academic v2",    "indexar-academic-v2.py"),
]

log = {"inicio": datetime.now().isoformat(), "resultados": []}

MAX_RETRIES = 2

for nome, script in SCRIPTS:
    inicio = time.time()
    print(f"\n{'='*50}")
    print(f"Iniciando: {nome}")
    script_path = os.path.join(os.path.dirname(__file__), script)
    result = None
    for tentativa in range(1, MAX_RETRIES + 2):
        result = subprocess.run(
            [sys.executable, script_path],
            capture_output=True, text=True,
        )
        if result.returncode == 0:
            break
        if tentativa <= MAX_RETRIES:
            print(f"  Tentativa {tentativa} falhou — retry em 5s...")
            time.sleep(5)
    duracao = round(time.time() - inicio, 1)
    status = "OK" if result.returncode == 0 else "ERRO"
    print(result.stdout[-2000:] if result.stdout else "")
    if result.returncode != 0:
        print(f"STDERR: {result.stderr[-500:]}")
    log["resultados"].append({"script": script, "status": status, "duracao_s": duracao})
    print(f"[{status}] {nome} — {duracao}s")
    time.sleep(2)

log["fim"] = datetime.now().isoformat()
log_path = os.path.join(os.path.dirname(__file__), "indexacao-log.json")
with open(log_path, "w", encoding="utf-8") as f:
    json.dump(log, f, ensure_ascii=False, indent=2)

print(f"\n{'='*50}")
print("INDEXAÇÃO COMPLETA")
for r in log["resultados"]:
    print(f"  {r['status']} {r['script']} ({r['duracao_s']}s)")
