import React from 'react';
import { FileText, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

import { io } from 'socket.io-client';

const AUDIT_DATA = [
    { time: '08:00', checks: 45, alerts: 2 },
    { time: '09:00', checks: 120, alerts: 5 },
    { time: '10:00', checks: 156, alerts: 12 },
    { time: '11:00', checks: 198, alerts: 8 },
    { time: '12:00', checks: 140, alerts: 4 },
    { time: '13:00', checks: 160, alerts: 6 },
];

export default function AdminDashboard() {
    const socket = io('http://localhost:3001'); // Temporary direct connection for button

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Compliance & Audit Log</h1>
                    <p className="text-gray-400 text-sm">System-wide operational oversight</p>
                </div>

                <button
                    onClick={() => {
                        socket.emit('trigger-attack');
                        alert('⚠️ CYBER ATTACK INITIATED: 20 Malicious Transactions Injected');
                    }}
                    className="px-6 py-2 bg-red-600/20 border border-red-500 text-red-100 font-bold rounded animate-pulse hover:bg-red-600 hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                >
                    ☠️ TRIGGER LIVE ATTACK
                </button>

                <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
                    <Download size={16} /> Export Report (CSV)
                </button>
            </div>

            {/* KPI Tiles */}
            <div className="grid grid-cols-4 gap-4">
                <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase">System Uptime</p>
                        <p className="text-xl font-bold">99.99%</p>
                    </div>
                </div>
                <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase">Avg Response</p>
                        <p className="text-xl font-bold">12ms</p>
                    </div>
                </div>
                <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-amber-500/10 text-amber-500">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase">Audit Records</p>
                        <p className="text-xl font-bold">14,205</p>
                    </div>
                </div>
                <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-red-500/10 text-red-500">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase">Total Blocks</p>
                        <p className="text-xl font-bold">2,401</p>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-12 gap-6">

                {/* Compliance Volume Chart */}
                <div className="col-span-8 glass-panel p-6 rounded-xl">
                    <h3 className="text-sm font-bold text-gray-300 mb-4">COMPLIANCE CHECK VOLUME</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={AUDIT_DATA}>
                                <XAxis dataKey="time" stroke="#444" fontSize={10} />
                                <YAxis stroke="#444" fontSize={10} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                                />
                                <Bar dataKey="checks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Audit Log */}
                <div className="col-span-4 glass-panel p-0 rounded-xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-white/5 bg-white/5">
                        <h3 className="text-sm font-bold text-gray-300">RECENT AUDIT TRAIL</h3>
                    </div>
                    <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[300px]">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex gap-3 text-sm">
                                <span className="text-gray-500 font-mono text-xs mt-0.5">10:{30 + i}:02</span>
                                <div>
                                    <p className="text-white/90">Rule Update: High Value Threshold</p>
                                    <p className="text-xs text-gray-500">Applied by System Admin</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
