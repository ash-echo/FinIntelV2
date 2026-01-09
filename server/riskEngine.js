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
        let metadata = {};

        // 1. Velocity Check (REAL CALCULATION)
        const ONE_MINUTE = 60000;
        const recentTxs = profile.recentTransactions.filter(t => now - t.timestamp < ONE_MINUTE);
        // Update profile with clean list + new one
        profile.recentTransactions = [...recentTxs, { timestamp: now, amount: tx.amount }];

        const txCountLastMinute = profile.recentTransactions.length;
        const avgTxAmount = recentTxs.length > 0 ? recentTxs.reduce((sum, t) => sum + t.amount, 0) / recentTxs.length : 0;

        // Populate Metadata for Frontend
        metadata.velocity_count = txCountLastMinute;
        metadata.velocity_deviation = avgTxAmount > 0 ? Math.round(((tx.amount - avgTxAmount) / avgTxAmount) * 100) : 0;

        if (txCountLastMinute > 5) {
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
        finalResult.metadata = metadata; // Pass to frontend
    }

    // FINAL DECISION LOGIC
    if (finalResult.score >= 80) { // Lowered from 85 to catch scores like 83
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
