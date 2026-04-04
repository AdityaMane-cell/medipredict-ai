from api.services.nlp_parser import text_to_symptoms


def test_text_to_symptoms_core_map():
    text = 'I have fever and itchy rash'
    symptoms = text_to_symptoms(text)
    assert 'high_fever' in symptoms
    assert 'itching' in symptoms or 'skin_rash' in symptoms


def test_text_to_symptoms_empty_text_returns_empty():
    assert text_to_symptoms('') == []
