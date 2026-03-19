from disease_rules import match_disease

def predict_disease(symptoms, vitals):
    disease, confidence = match_disease(symptoms, vitals)
    return disease, confidence
