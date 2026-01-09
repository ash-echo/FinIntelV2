// In-Memory User History for Behavioral Analysis
// Key: userId, Value: { lastLocation: string, lastTimestamp: number, txCountLastMinute: number, history: [] }
const userProfiles = new Map();

/**
 * Analyzes a transaction using Enterprise-Grade heuristics.
 * Now includes:
 * 1. Velocity Checks (Card Testing / Bot Detection)
 * 2. Impossible Travel (Geo-velocity)
 * 3. High Value & Device Fingerprinting
 * 
 * @param {object} tx - The transaction object
 * @returns {object} { score, decision, reasons }
 */
function analyzeRisk(tx) {
    let score = 0;
    let reasons = [];

    // Initialize or Fetch User Profile
    if (!userProfiles.has(tx.userId)) {
        userProfiles.set(tx.userId, {
            lastLocation: tx.location,
            lastTimestamp: Date.now(),
            recentTransactions: []
        });
    }

    const profile = userProfiles.get(tx.userId);
    const now = Date.now();

    // --- 1. VELOCITY CHECK (Bot/Spam Detection) --
    // Filter transactions from the last 60 seconds
    profile.recentTransactions = profile.recentTransactions.filter(t => now - t.timestamp < 60000);
    profile.recentTransactions.push({ timestamp: now, amount: tx.amount });

    const txCount = profile.recentTransactions.length;

    // "Burst" Rule: > 5 tx in 1 min
    if (txCount > 5) {
        score += 90;
        reasons.push('HIGH_VELOCITY_BURST'); // Major red flag
    } else if (txCount > 3) {
        score += 40;
        reasons.push('VELOCITY_WARNING');
    }

    // --- 2. IMPOSSIBLE TRAVEL (Teleportation) ---
    if (profile.lastLocation && profile.lastLocation !== tx.location) {
        // Simple string check for now. In a real app, we'd use Lat/Lon Haversine usage.
        // If location changed instantly (within 10 seconds), it's impossible.
        const timeDiff = now - profile.lastTimestamp;
        if (timeDiff < 10000) { // Less than 10 seconds to change cities
            score += 100;
            reasons.push('IMPOSSIBLE_TRAVEL');
        }
    }

    // --- 3. STANDARD RULES ---

    // Amount Rules
    if (tx.amount > 5000) {
        score += 85;
        reasons.push('CRITICAL_VALUE_TIER');
    } else if (tx.amount > 2000) {
        score += 60;
        reasons.push('HIGH_VALUE_TIER');
    }

    // Suspicious Device (Random simulation)
    if (Math.random() < 0.05) {
        score += 30;
        reasons.push('UNRECOGNIZED_DEVICE');
    }

    // Currency/Region Mismatch (Random simulation)
    if (Math.random() < 0.03) {
        score += 45;
        reasons.push('CROSS_BORDER_ANOMALY');
    }

    // Update Profile State for Next Time
    profile.lastLocation = tx.location;
    profile.lastTimestamp = now;
    userProfiles.set(tx.userId, profile);

    // --- DECISION LOGIC ---
    // Cap score at 100
    score = Math.min(score, 100);

    let decision = 'ALLOW';
    if (score >= 85) decision = 'BLOCK';
    else if (score >= 50) decision = 'FLAG';

    return {
        score,
        decision,
        reasons
    };
}

module.exports = { analyzeRisk };
