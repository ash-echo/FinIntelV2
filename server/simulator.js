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
function generateTransaction(bankId) {
    const amount = Math.random() < 0.9 ? Math.floor(Math.random() * 200) + 5 : Math.floor(Math.random() * 5000) + 1000;

    return {
        id: uuidv4(),
        bankId,
        timestamp: new Date().toISOString(),
        amount,
        currency: 'USD',
        merchant: MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)],
        location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
        deviceId: DEVICES[Math.floor(Math.random() * DEVICES.length)],
        userId: `USER_${Math.floor(Math.random() * 1000)}`, // Simulate repeated users
    };
}

// NEW: Generate a "Coordinated Attack" Burst
function generateAttackBatch(bankId) {
    const attacks = [];
    // Target a specific user for "Velocity" attack
    const targetUser = 'user_TARGET';
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

module.exports = { generateTransaction, generateAttackBatch };
