# disease_rules.py

def match_disease(symptoms, vitals):
    fever = any(s["symptom"] == "fever" and s["severity"] >= 2 for s in symptoms)
    cough = any(s["symptom"] == "cough" and s["severity"] >= 2 for s in symptoms)
    headache = any(s["symptom"] == "headache" and s["severity"] >= 2 for s in symptoms)
    fatigue = any(s["symptom"] == "fatigue" and s["severity"] >= 2 for s in symptoms)
    stomach_pain = any(s["symptom"] == "stomach pain" and s["severity"] >= 2 for s in symptoms)
    breath = any(s["symptom"] == "breathing difficulty" and s["severity"] >= 2 for s in symptoms)

    temp = vitals.get("body_temp", 36)
    oxygen = vitals.get("oxygen_level", 98)
    sugar = vitals.get("blood_sugar", 100)

    # ---- REAL DISEASE LOGIC ----

    # Pneumonia
    if fever and cough and oxygen < 94:
        return "Pneumonia", 0.88

    # COVID-like infection
    if fever and cough and fatigue and oxygen < 95:
        return "COVID-like Viral Infection", 0.85

    # Migraine
    if headache and not fever:
        return "Migraine", 0.70

    # Gastroenteritis (food poisoning)
    if stomach_pain and fever and sugar < 90:
        return "Gastroenteritis (Food Poisoning)", 0.78

    # Viral Fever
    if fever and fatigue and temp > 38.5:
        return "Viral Fever", 0.80

    # Diabetes emergency
    if sugar > 200:
        return "Hyperglycemia (High Blood Sugar)", 0.92

    # Hypoglycemia
    if sugar < 70:
        return "Hypoglycemia (Low Blood Sugar)", 0.90

    # Asthma
    if breath and cough:
        return "Asthma Attack", 0.84

    # Common Cold
    if cough and not fever:
        return "Common Cold", 0.65

    # Default
    return "General Illness", 0.50
