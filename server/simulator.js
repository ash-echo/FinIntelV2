const { v4: uuidv4 } = require('uuid');

// Mock data
const LOCATIONS = ['New York', 'London', 'Singapore', 'Tokyo', 'San Francisco', 'Berlin'];
const MERCHANTS = ['Amazon', 'Uber', 'Starbucks', 'Walmart', 'Target', 'Apple Store', 'Netflix', 'Airbnb'];
const DEVICES = ['iPhone 14', 'Pixel 7', 'Windows PC', 'MacBook Pro', 'Samsung S22'];

/**
 * Generates a single mock transaction
 * @param {string} bankId - 'BANK_A' or 'BANK_B'
 * @returns {object} transaction
 */
// STATE: Track where users are to prevent "teleportation"
const userLocationMap = new Map();

/**
 * Generates a single mock transaction with REALISTIC user movement.
 * @param {string} bankId - 'BANK_A' or 'BANK_B'
 * @returns {object} transaction
 */
function generateTransaction(bankId) {
    const amount = Math.random() < 0.9 ? Math.floor(Math.random() * 200) + 5 : Math.floor(Math.random() * 5000) + 1000;
    const userId = `USER_${Math.floor(Math.random() * 50)}`; // Reduced pool size to force collisions/history

    // LOGIC: Realistic Movement
    // 90% chance to be in the same city as last time. 10% chance to travel.
    let location;
    if (userLocationMap.has(userId)) {
        if (Math.random() < 0.90) {
            location = userLocationMap.get(userId);
        } else {
            // Travel to new city
            location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
            userLocationMap.set(userId, location);
        }
    } else {
        // First time seeing this user
        location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
        userLocationMap.set(userId, location);
    }

    return {
        id: uuidv4(),
        bankId,
        timestamp: new Date().toISOString(),
        amount,
        currency: 'USD',
        merchant: MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)],
        location,
        deviceId: DEVICES[Math.floor(Math.random() * DEVICES.length)],
        userId,
    };
}

// NEW: Generate a "Coordinated Attack" Burst
function generateAttackBatch(bankId, overrideUser = null) {
    const attacks = [];
    // Target a specific user for "Velocity" attack
    const targetUser = overrideUser || 'user_TARGET';
    const targetLoc = 'Unknown_Proxy_IP';

    for (let i = 0; i < 10; i++) {
        attacks.push({
            id: uuidv4(),
            bankId,
            timestamp: Date.now() + i * 100, // Slight offset
            amount: 9000 + (Math.random() * 500), // High Value
            currency: 'USD',
            merchant: 'Crypto_Exchange_X',
            location: targetLoc,
            deviceId: `spoofed_dev_${i}`,
            userId: targetUser
        });
    }
    return attacks;
}

// NEW: Simulate Cross-Bank Scenario
function generateCrossBankAttack() {
    const sharedUser = `MALICIOUS_SYNDICATE_${Math.floor(Math.random() * 999)}`;

    // 1. Attack on Bank A (High Risk)
    const txA = {
        id: uuidv4(),
        bankId: 'BANK_A',
        timestamp: new Date().toISOString(),
        amount: 8500, // Suspicious
        currency: 'USD',
        merchant: 'DarkWeb_Relay',
        location: 'Kyiv_Proxy_Node',
        deviceId: 'Rooted_Android',
        userId: sharedUser
    };

    // 2. Probe on Bank B (Low Risk - would pass if not for Federation)
    const txB = {
        id: uuidv4(),
        bankId: 'BANK_B', // Different Bank
        timestamp: new Date(Date.now() + 2000).toISOString(), // 2 seconds later
        amount: 45, // Tiny amount (Tester)
        currency: 'USD',
        merchant: 'Starbucks',
        location: 'New York', // Normal location
        deviceId: 'iPhone 14',
        userId: sharedUser // SAME USER ID
    };

    return { txA, txB, sharedUser };
}

module.exports = { generateTransaction, generateAttackBatch, generateCrossBankAttack };
