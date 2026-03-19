FIRST_AID = {
    "Pneumonia": "Seek immediate medical care. Monitor oxygen levels. Take antibiotics (if prescribed).",
    "COVID-like Viral Infection": "Self-isolate, monitor oxygen, stay hydrated, paracetamol for fever.",
    "Migraine": "Rest in dark room, drink water, take prescribed migraine meds.",
    "Gastroenteritis (Food Poisoning)": "Drink ORS, avoid solid foods, rest.",
    "Viral Fever": "Take paracetamol, stay hydrated, rest.",
    "Hyperglycemia (High Blood Sugar)": "Take insulin if advised, drink water, avoid carbs.",
    "Hypoglycemia (Low Blood Sugar)": "Eat glucose tablet/candy, fruit juice.",
    "Asthma Attack": "Use inhaler, stay calm, avoid triggers.",
    "Common Cold": "Warm fluids, steam inhalation, rest.",
    "General Illness": "Rest, hydration, monitor symptoms."
}

def get_first_aid(disease):
    return FIRST_AID.get(disease, "Rest, hydrate, monitor symptoms.")
