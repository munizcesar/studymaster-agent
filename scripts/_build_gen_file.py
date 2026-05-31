#!/usr/bin/env python3
"""Assembles scripts/_gen_index_content.py with all topic lists."""
from pathlib import Path

HEADER = '''#!/usr/bin/env python3
"""Gera blocos de documentos para indexadores StudyMaster."""


def fmt_doc(doc_id, area, disciplina, namespace, subtema, corpo):
    prefix = f"{area} {disciplina} — {subtema}: "
    texto = prefix + corpo.strip()
    if len(texto) < 300:
        texto += " Conteudo consolidado para provas de concurso publico e vestibular, com termos tecnicos frequentes em bancas como CESPE, FCC, FGV e Vunesp."
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

FOOTER = '''

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
