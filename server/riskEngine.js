// In-Memory User History for Behavioral Analysis
// Key: userId, Value: { lastLocation: string, lastTimestamp: number, txCountLastMinute: number, history: [] }
const userProfiles = new Map();
const axios = require('axios'); // Requires: npm install axios
const { broadcastBlock, checkReputation } = require('./GlobalRiskCache');

/**
 * Enhanced Risk Analysis using Hybrid ML Stack (Node.js + Python)
 * calls localhost:8000/predict
 */
async function analyzeRisk(tx) {
    const now = Date.now();

    // 1. FEDERATED REPUTATION CHECK (The "Trust" Query)
    // Check if this user was burned by another bank recently
    const reputation = checkReputation(tx.userId, tx.bankId);
    let federatedPenalty = 0;
    const reasons = [];

    if (reputation && reputation.status === 'UNTRUSTED') {
        federatedPenalty = 100; // Immediate Block
        reasons.push('FEDERATED_BLACKLIST_MATCH'); // Bank B sees this because Bank A blocked them
    }

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
        score: federatedPenalty, // Start with penalty
        decision: 'ALLOW',
        reasons: reasons,
        model_version: 'hybrid-v2'
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

        // Combine ML score with Federated Penalty (take the max risk)
        finalResult.score = Math.max(finalResult.score, mlData.score);
        finalResult.decision = mlData.decision;
        if (mlData.factors) finalResult.reasons.push(...mlData.factors);
        finalResult.model_version = mlData.model_version;

    } catch (err) {
        // --- FALLBACK HEURISTICS (Circuit Breaker) ---
        // If Python is down or slow, we use local rules

        let score = federatedPenalty;
        let localReasons = [];

        // 1. Velocity Check
        profile.recentTransactions = profile.recentTransactions.filter(t => now - t.timestamp < 60000);
        profile.recentTransactions.push({ timestamp: now, amount: tx.amount });

        if (profile.recentTransactions.length > 5) {
            score += 40;
            localReasons.push('VELOCITY_SPIKE_FALLBACK');
        }

        // 2. Amount Check
        if (tx.amount > 5000) {
            score += 30;
            localReasons.push('HIGH_VALUE_FALLBACK');
        }

        // 3. Random heuristic override
        if (Math.random() < 0.05) {
            score += 50;
            localReasons.push('ANOMALY_FALLBACK');
        }

        finalResult.score = Math.min(100, score);
        finalResult.reasons = [...finalResult.reasons, ...localReasons];
        finalResult.model_version = 'heuristic-fallback';
    }

    // FINAL DECISION LOGIC
    if (finalResult.score >= 85) {
        finalResult.decision = 'BLOCK';
        // 2. BROADCAST THREAT (The "Warn Others" Signal)
        // If we blocked them, tell the federation to distrust this user
        broadcastBlock(tx.userId, tx.bankId, finalResult.reasons[0]);
    } else if (finalResult.score >= 50) {
        finalResult.decision = 'FLAG';
    } else {
        finalResult.decision = 'ALLOW';
    }

    // Update Profile State
    profile.lastLocation = tx.location;
    profile.lastTimestamp = now;
    userProfiles.set(tx.userId, profile);

    return finalResult;
}

module.exports = { analyzeRisk };
