import pytest

from api.services.predictor import predict_disease


def test_predict_disease_rejects_non_list():
    response = predict_disease('fever')
    assert 'error' in response


def test_predict_disease_rejects_no_symptoms():
    response = predict_disease([])
    assert response['error'] == 'No symptoms provided'


def test_predict_disease_requires_minimum_symptoms():
    response = predict_disease(['fever'])
    assert response['error'] == 'Provide at least 2 valid unique symptoms'
