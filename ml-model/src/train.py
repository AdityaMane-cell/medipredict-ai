# =========================
# train.py
# =========================

import kagglehub
import pandas as pd
import os
import numpy as np
import joblib

from sklearn.preprocessing import MultiLabelBinarizer, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import xgboost as xgb

from preprocess import normalize, clean_symptom_list


# =========================
# 1. LOAD DATA
# =========================
path = kagglehub.dataset_download("adityamane10101/disease-symptom-description-dataset")

df = pd.read_csv(os.path.join(path, "disease_symptom_dataset.csv"))
df_desc = pd.read_csv(os.path.join(path, "symptom_Description.csv"))
df_prec = pd.read_csv(os.path.join(path, "symptom_precaution.csv"))
df_sev  = pd.read_csv(os.path.join(path, "Symptom_severity.csv"))


# =========================
# 2. CLEAN DATA
# =========================
df = df.fillna('')

symptom_lists = []
for _, row in df.iterrows():
    symptoms = clean_symptom_list(row[1:].tolist())
    symptom_lists.append(symptoms)


# =========================
# 3. ENCODING
# =========================
mlb = MultiLabelBinarizer()
X = mlb.fit_transform(symptom_lists)

le = LabelEncoder()
y = le.fit_transform(df['Disease'].astype(str).str.strip())


# =========================
# 4. SEVERITY WEIGHTS
# =========================
df_sev['Symptom'] = df_sev['Symptom'].apply(normalize)

sev_dict = dict(zip(df_sev['Symptom'], df_sev['weight']))

symptom_weights = np.array([
    sev_dict.get(sym, 1.0) for sym in mlb.classes_
])

X_weighted = X.astype(float) * symptom_weights


# =========================
# 5. SPLIT
# =========================
X_train, X_test, y_train, y_test = train_test_split(
    X_weighted, y, test_size=0.2, stratify=y, random_state=42
)


# =========================
# 6. TRAIN MODEL
# =========================
model = xgb.XGBClassifier(
    objective='multi:softprob',
    num_class=len(le.classes_),
    eval_metric='mlogloss',
    n_estimators=100,
    learning_rate=0.1,
    random_state=42
)

model.fit(X_train, y_train)


# =========================
# 7. EVALUATE
# =========================
y_pred = model.predict(X_test)

print("Accuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:\n")
print(classification_report(y_test, y_pred, target_names=le.classes_))


# =========================
# 8. LOOKUPS
# =========================
df_desc['Disease'] = df_desc['Disease'].astype(str).str.strip()
desc_dict = dict(zip(df_desc['Disease'], df_desc['Description']))

df_prec['Disease'] = df_prec['Disease'].astype(str).str.strip()

prec_dict = {
    row['Disease']: [
        row[f'Precaution_{i}'] for i in range(1, 5)
        if pd.notna(row[f'Precaution_{i}'])
    ]
    for _, row in df_prec.iterrows()
}


# =========================
# 9. SAVE ARTIFACTS
# =========================
os.makedirs("../models", exist_ok=True)

joblib.dump(model, "../models/model.pkl")
joblib.dump(mlb, "../models/mlb.pkl")
joblib.dump(le, "../models/le.pkl")
joblib.dump(symptom_weights, "../models/weights.pkl")
joblib.dump(desc_dict, "../models/desc.pkl")
joblib.dump(prec_dict, "../models/prec.pkl")

print("\nTraining complete. Models saved.")