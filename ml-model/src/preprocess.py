# =========================
# preprocess.py
# =========================

def normalize(text: str) -> str:
    return str(text).strip().lower().replace(" ", "_")


def clean_symptom_list(symptoms):
    """
    Normalize + remove empty + deduplicate
    """
    cleaned = [
        normalize(s) for s in symptoms
        if str(s).strip() != ""
    ]
    return list(set(cleaned))