import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, TrendingUp, Activity, Lock, Search } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const socket = io('http://localhost:3001');

export default function EntityDashboard({ entityName, entityId, color }) {
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState({ total: 0, highRisk: 0, avgRisk: 0 });
    const [chartData, setChartData] = useState([]);
    const [latestAlert, setLatestAlert] = useState(null);
    const scrollRef = useRef(null);

    const themeColor = color === 'cyan' ? '#00f3ff' : '#ffb000'; // Neon Cyan or Amber

    useEffect(() => {
        // Request specific history for this bank (Data Isolation)
        socket.emit('get-history', entityId);

        const handleNewTransaction = (data) => {
            // STRICT FILTER: Only accept data meant for THIS bank
            const myTx = entityId === 'BANK_A' ? data.bankA : data.bankB;

            // If myTx is null (meaning the event was for the other bank), do nothing.
            if (myTx) {
                setTransactions(prev => [myTx, ...prev].slice(0, 50));

                // Update Chart Data
                setChartData(prev => {
                    const point = { time: new Date(myTx.timestamp).toLocaleTimeString(), score: myTx.score };
                    return [...prev, point].slice(-20);
                });

                // Update Stats
                setStats(prev => {
                    const isHighRisk = myTx.decision === 'BLOCK' || myTx.decision === 'FLAG';
                    const newTotal = prev.total + 1;
                    const newHighRisk = isHighRisk ? prev.highRisk + 1 : prev.highRisk;
                    const newAvg = ((prev.avgRisk * prev.total) + myTx.score) / newTotal;

                    return {
                        total: newTotal,
                        highRisk: newHighRisk,
                        avgRisk: newAvg
                    };
                });

                // Trigger Alert if Blocked
                if (myTx.decision === 'BLOCK') {
                    setLatestAlert({
                        id: myTx.id,
                        message: `Blocked high-value transaction from ${myTx.location}`,
                        score: myTx.score
                    });
                    // Clear alert after 3 seconds
                    setTimeout(() => setLatestAlert(null), 3000);
                }
            }
        };

        socket.on('new-transactions', handleNewTransaction);

        socket.on('init-history', (history) => {
            if (Array.isArray(history)) {
                setTransactions(history);

                // Init stats from history
                const total = history.length;
                const highRisk = history.filter(t => t.decision === 'BLOCK' || t.decision === 'FLAG').length;
                const avgRisk = total > 0 ? history.reduce((acc, t) => acc + t.score, 0) / total : 0;
                setStats({ total, highRisk, avgRisk });
            }
        });

        return () => {
            socket.off('new-transactions', handleNewTransaction);
            socket.off('init-history');
        };
    }, [entityId]);


    return (
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-100px)]">

            {/* LEFT COLUMN: LIVE FEED */}
            <div className="col-span-3 glass-panel rounded-xl flex flex-col overflow-hidden">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h2 className="font-mono text-sm text-gray-400">LIVE SEGMENT STREAM</h2>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs text-green-500">CONNECTED</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    <AnimatePresence>
                        {transactions.map((tx) => (
                            <motion.div
                                key={tx.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                className={`p-3 rounded-lg border border-white/5 ${tx.decision === 'BLOCK' ? 'bg-red-500/10 border-red-500/30' :
                                        tx.decision === 'FLAG' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-mono text-xs text-gray-400">{new Date(tx.timestamp).toLocaleTimeString()}</span>
                                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${tx.decision === 'BLOCK' ? 'bg-red-500 text-white' :
                                            tx.decision === 'FLAG' ? 'bg-amber-500 text-black' : 'bg-green-500/20 text-green-400'
                                        }`}>
                                        {tx.decision}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm mb-1">
                                    <span className="font-bold text-white">{tx.merchant}</span>
                                    <span className="font-mono">${tx.amount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-gray-400">
                                    <span>{tx.location}</span>
                                    <span className={tx.score > 80 ? 'text-red-400' : 'text-gray-500'}>Risk: {tx.score}</span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* MIDDLE COLUMN: ANALYTICS & VISUALS */}
            <div className="col-span-6 flex flex-col gap-6">

                {/* Header Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="glass-panel p-4 rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-500`}>
                                <Activity size={20} style={{ color: themeColor }} />
                            </div>
                            <span className="text-xs text-gray-500 uppercase">Total Volume</span>
                        </div>
                        <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <div className="glass-panel p-4 rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                                <Shield size={20} />
                            </div>
                            <span className="text-xs text-gray-500 uppercase">Threats Blocked</span>
                        </div>
                        <p className="text-2xl font-bold">{stats.highRisk}</p>
                    </div>
                    <div className="glass-panel p-4 rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                <TrendingUp size={20} />
                            </div>
                            <span className="text-xs text-gray-500 uppercase">Arg Risk Score</span>
                        </div>
                        <p className="text-2xl font-bold">{stats.avgRisk.toFixed(1)}</p>
                    </div>
                </div>

                {/* Main Graph */}
                <div className="glass-panel p-6 rounded-xl flex-1 relative overflow-hidden">
                    <h3 className="text-sm font-bold text-gray-300 mb-6 flex items-center gap-2">
                        <Activity size={16} style={{ color: themeColor }} />
                        REAL-TIME RISK VELOCITY
                    </h3>
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
                    <div className="h-full w-full">
                        <ResponsiveContainer width="100%" height="80%">
                            <LineChart data={chartData}>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <XAxis dataKey="time" hide />
                                <YAxis domain={[0, 100]} hide />
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke={themeColor}
                                    strokeWidth={3}
                                    dot={{ fill: themeColor, r: 4 }}
                                    activeDot={{ r: 8, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Alert Overlay */}
                <AnimatePresence>
                    {latestAlert && (
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-red-600/90 text-white px-6 py-4 rounded-xl border border-red-500 shadow-2xl z-50 flex items-center gap-4 backdrop-blur-md"
                        >
                            <AlertTriangle size={32} className="text-white animate-pulse" />
                            <div>
                                <h4 className="font-bold text-lg">THREAT BLOCKED</h4>
                                <p className="text-sm opacity-90">{latestAlert.message}</p>
                            </div>
                            <div className="text-2xl font-mono font-bold border-l border-white/20 pl-4 ml-2">
                                {latestAlert.score}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>

            {/* RIGHT COLUMN: ENTITY INFO */}
            <div className="col-span-3 space-y-6">
                <div className="glass-panel p-6 rounded-xl border-t-4" style={{ borderColor: themeColor }}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white">{entityName}</h2>
                        <Lock size={18} className="text-gray-500" />
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Status</span>
                            <span className="text-green-500 font-mono">OPERATIONAL</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Encryption</span>
                            <span className="text-white font-mono">AES-256</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Privacy Mode</span>
                            <span className="text-neon-cyan font-mono animate-pulse">ZK-PROOF ACTIVE</span>
                        </div>
                    </div>
                </div>

                <div className="glass-panel p-0 rounded-xl overflow-hidden">
                    <div className="p-4 bg-white/5 border-b border-white/5">
                        <h3 className="text-xs font-bold text-gray-400 uppercase">Recent System Logs</h3>
                    </div>
                    <div className="p-4 space-y-3 text-xs font-mono text-gray-500">
                        <p>[{new Date().toLocaleTimeString()}] Secure Handshake Est.</p>
                        <p>[{new Date().toLocaleTimeString()}] Policy Synced v4.2</p>
                        <p>[{new Date().toLocaleTimeString()}] Node Discovery: Peers=12</p>
                    </div>
                </div>
            </div>

        </div>
    );
}
