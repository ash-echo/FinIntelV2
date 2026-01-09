const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const { generateTransaction } = require('./simulator');
const { analyzeRisk } = require('./riskEngine');
const { updateGlobalStats } = require('./aggregator');
const { db } = require('./firebase'); // Import Firestore

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// State (In-memory fallback)
let localTransactions = [];
const MAX_HISTORY = 100;
let simulationRunning = false; // Start paused
let targetedRisk = null; // { bankId: 'BANK_A', type: 'critical' }

// Simulation Loop
setInterval(async () => {
    if (!simulationRunning) return;

    // 1. Generate Transactions
    const txA = generateTransaction('BANK_A');
    const txB = generateTransaction('BANK_B');

    // 2. Analyze Risk
    let riskA = analyzeRisk(txA);
    let riskB = analyzeRisk(txB);

    // MANUAL OVERRIDE CHECK
    let criticalStop = false;
    if (targetedRisk) {
        if (targetedRisk.bankId === 'BANK_A') {
            riskA = { ...riskA, score: 99, decision: 'block', reasons: ['MANUAL_CRITICAL_OVERRIDE'] };
            criticalStop = true;
        } else if (targetedRisk.bankId === 'BANK_B') {
            riskB = { ...riskB, score: 99, decision: 'block', reasons: ['MANUAL_CRITICAL_OVERRIDE'] };
            criticalStop = true;
        }
        targetedRisk = null; // Reset
    }

    const fullTxA = { ...txA, ...riskA };
    const fullTxB = { ...txB, ...riskB };

    // 3. Store Data (Firestore or Local)
    if (db) {
        try {
            // Write to Firestore - Separate Collections
            await db.collection('transactions_bank_a').add(fullTxA);
            await db.collection('transactions_bank_b').add(fullTxB);
        } catch (err) {
            console.error('Error writing to Firestore:', err.message);
        }
    } else {
        // Fallback to local memory
        localTransactions.push(fullTxA, fullTxB);
        if (localTransactions.length > MAX_HISTORY) {
            localTransactions = localTransactions.slice(-MAX_HISTORY);
        }
    }

    // 4. Aggregation (Privacy-Safe)
    const batchStats = [
        { score: riskA.score, decision: riskA.decision },
        { score: riskB.score, decision: riskB.decision }
    ];
    const globalState = updateGlobalStats(batchStats);

    // 5. Broadcast Real-Time Data (Always push via Socket)
    io.emit('new-transactions', {
        bankA: fullTxA,
        bankB: fullTxB
    });

    io.emit('stats-update', {
        global: globalState,
        timestamp: new Date().toISOString()
    });

    if (criticalStop) {
        simulationRunning = false;
        console.log('!!! CRITICAL STOP TRIGGERED !!!');
        io.emit('critical-stop', {
            message: 'High-Risk Attack Vector Detected - Simulation Halted',
            timestamp: new Date().toISOString()
        });
        io.emit('sim-status', false);
    }

}, 1500);

io.on('connection', async (socket) => {
    console.log('Client connected:', socket.id);

    // Fetch History
    if (db) {
        try {
            const snapshot = await db.collection('transactions')
                .orderBy('timestamp', 'desc')
                .limit(50)
                .get();

            const history = [];
            snapshot.forEach(doc => history.push(doc.data()));
            socket.emit('init-history', history); // Send historical data
        } catch (err) {
            console.error('Error fetching history:', err.message);
        }
    } else {
        socket.emit('init-history', localTransactions);
    }

    // NEW: Listen for Attack Trigger from Admin Board
    socket.on('trigger-attack', () => {
        console.log('⚠️ ATTACK SIMULATION TRIGGERED');
        const { generateAttackBatch } = require('./simulator');

        // Flood both banks
        const attackA = generateAttackBatch('BANK_A');
        const attackB = generateAttackBatch('BANK_B');

        const allAttacks = [...attackA, ...attackB];

        allAttacks.forEach(tx => {
            // Process risks
            const risk = analyzeRisk(tx);
            const fullTx = { ...tx, ...risk };

            // Broadcast immediately
            io.emit('new-transactions', {
                bankA: tx.bankId === 'BANK_A' ? fullTx : null,
                bankB: tx.bankId === 'BANK_B' ? fullTx : null
            });

            // Add to history (Firestore or Local)
            if (db) {
                // STRICT DATA ISOLATION: Write to separate collections
                const collectionName = fullTx.bankId === 'BANK_A' ? 'transactions_bank_a' : 'transactions_bank_b';
                db.collection(collectionName).add(fullTx);
            } else {
                localTransactions.push(fullTx);
            }
        });
    });

    // NEW: Targeted History Fetching
    socket.on('get-history', async (bankId) => {
        if (!bankId) return;

        console.log(`fetching history for ${bankId}`);
        const collectionName = bankId === 'BANK_A' ? 'transactions_bank_a' : 'transactions_bank_b';

        if (db) {
            try {
                const snapshot = await db.collection(collectionName)
                    .orderBy('timestamp', 'desc')
                    .limit(50)
                    .get();

                const history = [];
                snapshot.forEach(doc => history.push(doc.data()));
                socket.emit('init-history', history);
            } catch (err) {
                console.error(`Error fetching history for ${bankId}:`, err.message);
            }
        } else {
            // Filter local memory for just this bank
            const specificHistory = localTransactions.filter(t => t.bankId === bankId);
            socket.emit('init-history', specificHistory);
        }
    });

    // --- CONTROLS ---
    socket.emit('sim-status', simulationRunning);

    socket.on('start-sim', () => {
        simulationRunning = true;
        console.log('Command: START SIMULATION');
        io.emit('sim-status', true);
    });

    socket.on('stop-sim', () => {
        simulationRunning = false;
        console.log('Command: STOP SIMULATION');
        io.emit('sim-status', false);
    });

    socket.on('trigger-risk', (bankId) => {
        console.log(`Command: TRIGGER RISK for ${bankId}`);
        targetedRisk = { bankId, type: 'critical' };
    });

    socket.on('trigger-attack-batch', async (bankId) => {
        console.log(`Command: BATCH ATTACK on ${bankId}`);
        simulationRunning = true; // Force start if not running
        io.emit('sim-status', true);

        const TOTAL_ATTACKS = 20;
        let count = 0;

        const interval = setInterval(() => {
            count++;

            // Generate a HIGH RISK transaction
            const rawTx = generateTransaction(bankId);
            // Manually override to be a threat
            const attackTx = {
                ...rawTx,
                ...analyzeRisk(rawTx), // Get base risk structure
                score: 85 + Math.floor(Math.random() * 14), // 85-99 score
                decision: 'BLOCK',
                reasons: ['COORDINATED_BATCH_ATTACK', 'VELOCITY_CHECK_FAIL']
            };

            // Broadcast it
            const fullTxA = bankId === 'BANK_A' ? attackTx : null;
            const fullTxB = bankId === 'BANK_B' ? attackTx : null;

            io.emit('new-transactions', {
                bankA: fullTxA,
                bankB: fullTxB
            });

            // Store (basic locally)
            localTransactions.push(attackTx);

            if (count >= TOTAL_ATTACKS) {
                clearInterval(interval);
                simulationRunning = false;
                console.log('!!! BATCH ATTACK COMPLETE - STOPPING !!!');

                io.emit('critical-stop', {
                    message: `20-Threat Botnet Cluster Detected on ${bankId} Node`,
                    timestamp: new Date().toISOString(),
                    entity: bankId
                });
                io.emit('sim-status', false);
            }

        }, 200); // 200ms delay between shots for "one by one" visual
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Risk Intelligence Server running on port ${PORT}`);
});
