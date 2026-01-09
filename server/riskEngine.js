// In-Memory User History for Behavioral Analysis
// Key: userId, Value: { lastLocation: string, lastTimestamp: number, txCountLastMinute: number, history: [] }
const userProfiles = new Map();
const axios = require('axios'); // Requires: npm install axios

/**
 * Enhanced Risk Analysis using Hybrid ML Stack (Node.js + Python)
 * calls localhost:8000/predict
 */
async function analyzeRisk(tx) {
    const now = Date.now();

    // Initialize or Fetch User Profile (for fallback heuristics)
    if (!userProfiles.has(tx.userId)) {
        userProfiles.set(tx.userId, {
            lastLocation: tx.location,
            lastTimestamp: now,
            recentTransactions: []
        });
    }
    const profile = userProfiles.get(tx.userId);

    // Default Fallback Structure
    let finalResult = {
        score: 0,
        decision: 'ALLOW',
        reasons: [],
        model_version: 'fallback-v1'
    };

    try {
        // --- CALL PYTHON MICROSERVICE ---
        // Timeout is critical here to avoid hanging the Node event loop
        const response = await axios.post('http://127.0.0.1:3100/predict', {
            amount: tx.amount,
            timestamp: now,
            merchant: tx.merchant || "Unknown",
            location: tx.location || "Unknown"
        }, { timeout: 800 });

        const mlData = response.data;

        finalResult.score = mlData.score;
        finalResult.decision = mlData.decision;
        finalResult.reasons = mlData.factors;
        finalResult.model_version = mlData.model_version;

    } catch (err) {
        // --- FALLBACK HEURISTICS (Circuit Breaker) ---
        // If Python is down or slow, we use local rules
        // console.warn('ML Service Unavailable, using heuristics:', err.message);

        let score = 0;
        let reasons = [];

        // 1. Velocity Check
        profile.recentTransactions = profile.recentTransactions.filter(t => now - t.timestamp < 60000);
        profile.recentTransactions.push({ timestamp: now, amount: tx.amount });

        if (profile.recentTransactions.length > 5) {
            score += 40;
            reasons.push('VELOCITY_SPIKE_FALLBACK');
        }

        // 2. Amount Check
        if (tx.amount > 5000) {
            score += 30;
            reasons.push('HIGH_VALUE_FALLBACK');
        }

        // 3. Random heuristic override
        if (Math.random() < 0.05) {
            score += 50;
            reasons.push('ANOMALY_FALLBACK');
        }

        finalResult.score = Math.min(100, score);
        finalResult.reasons = reasons;
        finalResult.model_version = 'heuristic-fallback';

        if (finalResult.score > 80) finalResult.decision = 'BLOCK';
        else if (finalResult.score > 50) finalResult.decision = 'FLAG';
        else finalResult.decision = 'ALLOW';
    }

    // Update Profile State
    profile.lastLocation = tx.location;
    profile.lastTimestamp = now;
    userProfiles.set(tx.userId, profile);

    return finalResult;
}

module.exports = { analyzeRisk };
