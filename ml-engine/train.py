import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from xgboost import XGBClassifier
from sklearn.datasets import make_classification
import joblib
import os

# Create directory for models if it doesn't exist
if not os.path.exists('models'):
    os.makedirs('models')

print("🚀 Generating Synthetic Financial Data...")

# 1. Generate Synthetic Data (mimicking credit card transactions)
# 1000 samples, 4 features (Amount, Time, V1, V2), slight class imbalance
X, y = make_classification(
    n_samples=5000, 
    n_features=4, 
    n_informative=4, 
    n_redundant=0, 
    n_classes=2, 
    weights=[0.90, 0.10], # 10% Fraud
    random_state=42
)

# Convert to DataFrame for easier handling
columns = ['amount', 'time_diff', 'geo_score', 'risk_score_v1']
df = pd.DataFrame(X, columns=columns)

print("🧠 Training XGBoost Classifier (Supervised)...")
# XGBoost for known fraud patterns
xgb_model = XGBClassifier(use_label_encoder=False, eval_metric='logloss')
xgb_model.fit(X, y)

print("🕵️ Training Isolation Forest (Unsupervised)...")
# Isolation Forest for anomalies (Zero-Day attacks)
iso_model = IsolationForest(contamination=0.1, random_state=42)
iso_model.fit(X)

print("💾 Saving Models...")
joblib.dump(xgb_model, 'models/xgb_fraud.joblib')
joblib.dump(iso_model, 'models/iso_forest.joblib')

print("✅ Models Trained & Saved successfully in /models!")
