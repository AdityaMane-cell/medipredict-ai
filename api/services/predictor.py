# =========================
# predictor.py
# =========================

import joblib
import numpy as np
import os
import warnings
from sklearn.exceptions import InconsistentVersionWarning

warnings.filterwarnings('ignore', category=InconsistentVersionWarning)

MODEL_DIR = os.getenv('MODEL_DIR', os.path.join(os.path.dirname(__file__), '../../ml/models'))

SYMPTOM_SYNONYMS = {
    'rash': 'skin_rash',
    'fever': 'high_fever',
    'high_fever': 'high_fever',
    'itchy': 'itching',
    'head_pain': 'headache',
    'head_ache': 'headache',
    'sore_throat': 'sore_throat',
    'nodal_eruption': 'nodal_skin_eruption',
    'nodal_eruptions': 'nodal_skin_eruption',
    'back_pain': 'back_pain',
    'stomach_pain': 'stomach_pain',
    'joint_pain': 'joint_pain',
    'runny_nose': 'runny_nose',
    'muscle_pain': 'muscle_pain',
}

severe_diseases = {
    'AIDS', 'Cervical cancer', 'Diabetes',
    'Fungal infection', 'Osteoarthritis', 'Varicose veins'
}

_model = None
_mlb = None
_le = None
_weights = None
_desc_dict = None
_prec_dict = None


def _load_model_artifacts():
    global _model, _mlb, _le, _weights, _desc_dict, _prec_dict

    if _model is not None:
        return

    required = {
        'model.pkl': '_model',
        'mlb.pkl': '_mlb',
        'le.pkl': '_le',
        'weights.pkl': '_weights',
        'desc.pkl': '_desc_dict',
        'prec.pkl': '_prec_dict'
    }

    for fname in required:
        path = os.path.join(MODEL_DIR, fname)
        if not os.path.isfile(path):
            raise FileNotFoundError(f'Model artifact missing: {path}')

    _model = joblib.load(os.path.join(MODEL_DIR, 'model.pkl'))
    _mlb = joblib.load(os.path.join(MODEL_DIR, 'mlb.pkl'))
    _le = joblib.load(os.path.join(MODEL_DIR, 'le.pkl'))
    _weights = joblib.load(os.path.join(MODEL_DIR, 'weights.pkl'))
    _desc_dict = joblib.load(os.path.join(MODEL_DIR, 'desc.pkl'))
    _prec_dict = joblib.load(os.path.join(MODEL_DIR, 'prec.pkl'))


# =========================
# SHARED NORMALIZATION
# =========================

def normalize(text):
    return str(text).strip().lower().replace(' ', '_')


def available_symptoms():
    _load_model_artifacts()
    return sorted(list(_mlb.classes_))


def sanitize_symptoms(symptoms):
    safe = []
    for s in symptoms:
        if not isinstance(s, str):
            continue
        normalized = normalize(s)
        normalized = SYMPTOM_SYNONYMS.get(normalized, normalized)
        if len(normalized) > 0 and len(normalized) < 128:
            safe.append(normalized)
    return safe


def explain_prediction(symptoms):
    try:
        import shap
    except ImportError:
        return {'explanation': 'SHAP not installed for explanation'}

    _load_model_artifacts()
    symptom_vector = _mlb.transform([symptoms])[0].astype(float) * _weights
    explainer = shap.TreeExplainer(_model)
    shap_values = explainer.shap_values([symptom_vector])
    return {
        'feature_importance': sorted(
            [
                (feature.replace('_', ' '), float(val))
                for feature, val in zip(_mlb.classes_, shap_values[0])
                if abs(val) > 0.001
            ],
            key=lambda x: abs(x[1]),
            reverse=True,
        )[:5]
    }


# =========================
# MAIN FUNCTION
# =========================

def predict_disease(symptoms):
    _load_model_artifacts()

    if not isinstance(symptoms, list):
        return {'error': 'Symptoms payload must be a list.'}

    symptoms = sanitize_symptoms(symptoms)

    if len(symptoms) == 0:
        return {'error': 'No symptoms provided'}

    valid_symptoms = set(_mlb.classes_)
    valid = [s for s in symptoms if s in valid_symptoms]
    invalid = [s for s in symptoms if s not in valid_symptoms]
    cleaned = list(dict.fromkeys(valid))

    if len(cleaned) == 0:
        return {'error': f'No valid symptoms. Invalid: {invalid}'}

    if len(cleaned) < 2:
        return {'error': 'Provide at least 2 valid unique symptoms'}

    vec = _mlb.transform([cleaned])[0]

    if np.sum(vec) == 0:
        return {'error': 'Symptoms not sufficient for prediction'}

    vec_weighted = vec.astype(float) * _weights

    probs = _model.predict_proba([vec_weighted])[0]
    max_prob = np.max(probs)

    top3_idx = np.argsort(probs)[-3:][::-1]
    top3 = [( _le.classes_[i], round(float(probs[i]), 3)) for i in top3_idx]

    top_disease = top3[0][0]

    warning_msg = None
    if invalid:
        warning_msg = f'Ignored invalid symptoms: {invalid}'

    if max_prob < 0.4:
        explanation = explain_prediction(cleaned)
        return {
            'warning': 'Low confidence prediction',
            'top3': top3,
            'note': warning_msg,
            'extracted_symptoms': cleaned,
            'explanation': explanation,
            'confidence': round(float(max_prob), 3)
        }

    alert = 'Consult a professional for confirmation.'

    if top_disease in severe_diseases and max_prob > 0.6:
        alert = '🚨 See a doctor immediately!'

    return {
        'top3': top3,
        'description': _desc_dict.get(top_disease, 'N/A'),
        'precautions': _prec_dict.get(top_disease, []),
        'confidence': round(float(max_prob), 3),
        'alert': alert,
        'note': warning_msg,
        'extracted_symptoms': cleaned
    }