# =========================
# predictor.py
# =========================

import joblib
import numpy as np
import os

# Adjust path if needed
MODEL_PATH = os.path.join(os.path.dirname(__file__), "../../ml-model/models")

model = joblib.load(os.path.join(MODEL_PATH, "model.pkl"))
mlb = joblib.load(os.path.join(MODEL_PATH, "mlb.pkl"))
le = joblib.load(os.path.join(MODEL_PATH, "le.pkl"))
weights = joblib.load(os.path.join(MODEL_PATH, "weights.pkl"))
desc_dict = joblib.load(os.path.join(MODEL_PATH, "desc.pkl"))
prec_dict = joblib.load(os.path.join(MODEL_PATH, "prec.pkl"))

severe_diseases = {
    'AIDS', 'Cervical cancer', 'Diabetes',
    'Fungal infection', 'Osteoarthritis', 'Varicose veins'
}


# =========================
# SHARED NORMALIZATION
# =========================
def normalize(text):
    return str(text).strip().lower().replace(" ", "_")


# =========================
# MAIN FUNCTION
# =========================
def predict_disease(symptoms):

    symptoms = [normalize(s) for s in symptoms if str(s).strip() != ""]

    if len(symptoms) == 0:
        return {"error": "No symptoms provided"}

    valid_symptoms = set(mlb.classes_)

    valid = [s for s in symptoms if s in valid_symptoms]
    invalid = [s for s in symptoms if s not in valid_symptoms]

    if len(valid) == 0:
        return {"error": f"No valid symptoms. Invalid: {invalid}"}

    cleaned = list(set(valid))

    if len(cleaned) < 2:
        return {"error": "Provide at least 2 valid symptoms"}

    vec = mlb.transform([cleaned])[0]

    if np.sum(vec) == 0:
        return {"error": "Symptoms not sufficient for prediction"}

    vec_weighted = vec.astype(float) * weights

    probs = model.predict_proba([vec_weighted])[0]
    max_prob = np.max(probs)

    top3_idx = np.argsort(probs)[-3:][::-1]
    top3 = [(le.classes_[i], round(float(probs[i]), 3)) for i in top3_idx]

    top_disease = top3[0][0]

    warning_msg = None
    if invalid:
        warning_msg = f"Ignored invalid symptoms: {invalid}"

    if max_prob < 0.4:
        return {
            "warning": "Low confidence prediction",
            "top3": top3,
            "note": warning_msg
        }

    alert = "Consult a professional for confirmation."

    if top_disease in severe_diseases and max_prob > 0.6:
        alert = "🚨 See a doctor immediately!"

    return {
        "top3": top3,
        "description": desc_dict.get(top_disease, "N/A"),
        "precautions": prec_dict.get(top_disease, []),
        "confidence": round(float(max_prob), 3),
        "alert": alert,
        "note": warning_msg
    }