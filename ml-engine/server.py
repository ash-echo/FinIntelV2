from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
import os
import random

app = FastAPI(title="Sentinel Core ML Engine")

# Load Models
print("🔌 Loading Models...")
try:
    xgb_model = joblib.load('models/xgb_fraud.joblib')
    iso_model = joblib.load('models/iso_forest.joblib')
    print("✅ Models Loaded Successfully")
except Exception as e:
    print(f"⚠️ Warning: Could not load models. Ensure train.py has run. Error: {e}")
    xgb_model = None
    iso_model = None

class Transaction(BaseModel):
    amount: float
    timestamp: int
    merchant: str
    location: str

@app.get("/")
def health_check():
    return {"status": "active", "models_loaded": xgb_model is not None}

@app.post("/predict")
def predict_risk(tx: Transaction):
    """
    Analyzes a transaction using the Hybrid ML Stack.
    Returns a unified Risk Score (0-100) and Decision.
    """
    
    # 1. Feature Engineering (Simulated)
    # We turn raw data into the 4 vectors the model expects
    # In a real app, we'd use proper scalers here.
    
    # Mocking feature normalization for the demo model input
    # (amount, time_diff, geo_score, risk_score_v1)
    features = np.array([[
        tx.amount / 1000,       # Normalize amount
        (tx.timestamp % 86400) / 3600, # Hour of day
        random.random(),        # Simulated Geo-Score
        random.random()         # Simulated History Score
    ]])
    
    risk_score = 0
    factors = []
    
    # 2. XGBoost Prediction (Supervised)
    if xgb_model:
        prob = xgb_model.predict_proba(features)[0][1] # Probability of Class 1 (Fraud)
        xgb_score = int(prob * 100)
        risk_score += xgb_score * 0.7 # Weighted 70%
        if xgb_score > 70:
            factors.append("XGB_PATTERN_MATCH")
    else:
        # Fallback if model not trained yet
        risk_score += 10
        
    # 3. Isolation Forest Prediction (Unsupervised)
    if iso_model:
        # Returns -1 for anomaly, 1 for normal
        iso_pred = iso_model.predict(features)[0]
        if iso_pred == -1:
            risk_score += 30 # Add penalty for anomaly
            factors.append("ANOMALY_DETECTED_ISO_FOREST")
            
    # Cap score
    final_score = min(100, max(0, int(risk_score)))
    
    # Decision Logic
    decision = "ALLOW"
    if final_score > 85:
        decision = "BLOCK"
    elif final_score > 65:
        decision = "FLAG"
        
    return {
        "score": final_score,
        "decision": decision,
        "factors": factors,
        "model_version": "v1.0.2-hybrid"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3100)
