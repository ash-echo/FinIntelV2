/**
 * Aggregates risk scores from multiple banks to determine Global Threat Level.
 * PRIVACY: Only receives stats, never raw transactions.
 */

let globalStats = {
    totalTransactions: 0,
    flaggedCount: 0,
    blockedCount: 0,
    averageRiskScore: 0,
    threatLevel: 'LOW' // LOW, MEDIUM, HIGH
};

// Rolling window for trend analysis (last 60 updates)
const riskHistory = [];

function updateGlobalStats(batchRiskScores) {
    // batchRiskScores is an array of { score, decision } from recent transactions across all banks

    if (batchRiskScores.length === 0) return globalStats;

    const batchTotal = batchRiskScores.length;
    let batchRiskSum = 0;
    let batchFlagged = 0;
    let batchBlocked = 0;

    batchRiskScores.forEach(item => {
        batchRiskSum += item.score;
        if (item.decision === 'FLAG') batchFlagged++;
        if (item.decision === 'BLOCK') batchBlocked++;
    });

    // Update totals
    globalStats.totalTransactions += batchTotal;
    globalStats.flaggedCount += batchFlagged;
    globalStats.blockedCount += batchBlocked;

    // Update moving average risk
    const batchAvgRisk = batchRiskSum / batchTotal;
    // Simple exponential moving average for smoothness
    globalStats.averageRiskScore = (globalStats.averageRiskScore * 0.9) + (batchAvgRisk * 0.1);

    // Determine Threat Level
    // Logic: If > 20% blocked OR avg risk > 60 -> HIGH
    //        If > 10% blocked OR avg risk > 40 -> MEDIUM
    const blockedRatio = globalStats.blockedCount / Math.max(1, globalStats.totalTransactions); // Simplified for demo (should be window based)

    // For demo, let's use the instantaneous batch risk to make it more reactive
    const currentHighRiskRatio = (batchFlagged + batchBlocked) / batchTotal;

    if (currentHighRiskRatio > 0.3 || batchAvgRisk > 60) {
        globalStats.threatLevel = 'HIGH';
    } else if (currentHighRiskRatio > 0.1 || batchAvgRisk > 30) {
        globalStats.threatLevel = 'MEDIUM';
    } else {
        globalStats.threatLevel = 'LOW';
    }

    return globalStats;
}

module.exports = { updateGlobalStats, globalStats };
