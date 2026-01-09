/**
 * Global Risk Cache (Privacy-Preserving Shared Ledger)
 * 
 * In a real Federated System, this would be a distributed ledger or a encrypted
 * set of signals. For this prototype, we simulate it as a secured in-memory cache
 * that stores ANONYMIZED signals.
 * 
 * Logic:
 * If Bank A blocks User X, it pushes a hash(User X) to this cache.
 * When Bank B sees User X, it checks this cache (Zero-Knowledge Proof simulation).
 * If match found, Bank B distrusts User X immediately.
 */

const sharedBlocklist = new Map(); // Key: userId (hashed in production), Value: { bankId, timestamp, reason }

const TTL = 5 * 60 * 1000; // 5 Minutes immunity/memory

function broadcastBlock(userId, bankId, reason) {
    console.log(`[FEDERATION] ${bankId} reported threat on User ${userId}`);
    sharedBlocklist.set(userId, {
        bankId,
        timestamp: Date.now(),
        reason
    });
}

function checkReputation(userId, queryingBankId) {
    if (sharedBlocklist.has(userId)) {
        const record = sharedBlocklist.get(userId);

        // Expire old records
        if (Date.now() - record.timestamp > TTL) {
            sharedBlocklist.delete(userId);
            return null;
        }

        // Don't flag if it's the bank's own report
        if (record.bankId === queryingBankId) return null;

        return {
            status: 'UNTRUSTED',
            source: 'FEDERATION_NETWORK',
            original_timestamp: record.timestamp
        };
    }
    return { status: 'TRUSTED' };
}

module.exports = { broadcastBlock, checkReputation };
