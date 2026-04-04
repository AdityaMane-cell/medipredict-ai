from rapidfuzz import process
from api.services.predictor import available_symptoms

VALID_SYMPTOMS = None

SYMPTOM_MAP = {
    'rash': 'skin_rash',
    'fever': 'high_fever',
    'high fever': 'high_fever',
    'itchy': 'itching',
    'head pain': 'headache',
    'head ache': 'headache',
    'sore throat': 'sore_throat',
    'nodal eruption': 'nodal_skin_eruption',
    'nodal eruptions': 'nodal_skin_eruption',
    'back pain': 'back_pain',
    'stomach pain': 'stomach_pain',
    'joint pain': 'joint_pain',
    'runny nose': 'runny_nose',
    'muscle pain': 'muscle_pain'
}


def text_to_symptoms(text: str):
    global VALID_SYMPTOMS
    if VALID_SYMPTOMS is None:
        VALID_SYMPTOMS = set(available_symptoms())

    text = str(text or '').lower().strip()
    if not text:
        return []

    text = text.replace(',', ' ').replace('.', ' ')
    tokens = [w for w in text.split() if w]

    extracted = set()

    for phrase, mapped in SYMPTOM_MAP.items():
        if phrase in text:
            extracted.add(mapped)

    for token in tokens:
        if token in SYMPTOM_MAP:
            extracted.add(SYMPTOM_MAP[token])

    for token in tokens:
        normalized = token.replace(' ', '_')
        if normalized in VALID_SYMPTOMS:
            extracted.add(normalized)

    candidate_chunks = []
    candidate_chunks.extend(tokens)
    for n in range(2, min(4, len(tokens) + 1)):
        candidate_chunks.extend(' '.join(tokens[i:i + n]) for i in range(len(tokens) - n + 1))

    for chunk in candidate_chunks:
        if not chunk:
            continue
        match, score, _ = process.extractOne(chunk, VALID_SYMPTOMS)
        if score >= 85:
            extracted.add(match)

    return sorted(extracted)

