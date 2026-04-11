import os
import sys
from api.services import predictor
print('MODEL_DIR=', predictor.MODEL_DIR)
print('MODEL_DIR exists=', os.path.isdir(predictor.MODEL_DIR))
files = ['model.pkl','mlb.pkl','le.pkl','weights.pkl','desc.pkl','prec.pkl']
for f in files:
    path = os.path.join(predictor.MODEL_DIR, f)
    print(f, os.path.exists(path), os.path.getsize(path) if os.path.exists(path) else 'MISSING')
try:
    predictor._load_model_artifacts()
    assert predictor._mlb is not None
    print('model loaded OK')
    print('mlb classes count=', len(predictor._mlb.classes_))
except Exception:
    import traceback
    traceback.print_exc()
    sys.exit(1)
